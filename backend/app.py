from flask import Flask, request, jsonify
from flask_cors import CORS
from rubric import RUBRIC
from sentence_transformers import SentenceTransformer, util
import spacy
import re

app = Flask(__name__)
CORS(app)

# Load models
model = SentenceTransformer("all-MiniLM-L6-v2")
nlp = spacy.load("en_core_web_sm")


# Precompute semantic embeddings (career goals)
semantic_params = {
    p["name"]: model.encode(p["description"])
    for p in RUBRIC["parameters"]
    if p["type"] == "semantic"
}


@app.route("/")
def home():
    return "AI Introduction Grader Backend Running"


# ---------------- NAME DETECTION ----------------

# Intro phrases that should precede a name in natural speech.
# Stored as tuples of lowercase tokens for easy matching.
_INTRO_PHRASES = [
    # Standard English
    ("my", "name", "is"),
    ("my", "name", "i"),        # typo/speech artefact: "my name i akash"
    ("i", "am"),
    ("i'm",),
    ("this", "is"),
    ("call", "me"),
    ("you", "can", "call", "me"),
    ("people", "call", "me"),
    ("name", "'s"),             # "name's Akash"
    ("name", "is"),             # "name is Akash" (dropped "my")

    # Indian English — extremely common in speech
    ("myself",),                # "myself Akash" / "hi myself Akash"
    ("hi", "myself"),
    ("hello", "myself"),
    ("so", "myself"),           # "so myself Akash" (filler + myself)
    ("i", "introduce", "myself"),  # "I introduce myself Akash"

    # Greeting + "I am / I'm" combos (hi/hello stripped by spaCy as interjection)
    ("hi", "i", "am"),
    ("hello", "i", "am"),
    ("hi", "i'm"),
    ("hello", "i'm"),
    ("hi", "my", "name", "is"),
    ("hello", "my", "name", "is"),
]

# POS tags that are definitely NOT names
# NOTE: VERB is intentionally excluded — spaCy often mistaggs unknown/informal
# names (e.g. "akash", "priya") as VERB in short sentences without context.
_NON_NAME_POS = {"PRON", "DET", "CONJ", "CCONJ", "SCONJ", "AUX", "PUNCT", "NUM"}

# Common English verb lemmas — used to block VERB-tagged tokens that really are verbs
_COMMON_VERBS = {
    "be", "is", "am", "are", "was", "were",
    "want", "like", "love", "go", "study",
    "work", "do", "make", "have", "get",
    "say", "know", "think", "come", "see",
    "introduce", "pursue", "plan", "hope",
}

# Extra words that look noun-like but aren't names
_NON_NAME_LEMMAS = {
    "student", "scientist", "engineer", "doctor", "teacher", "developer",
    "person", "human", "professional", "graduate", "researcher",
    "here", "there", "good", "great", "happy", "excited",
}


def detect_name(speech):
    """
    Returns True only if the speaker actually said a name (not just an
    intro phrase with no name following it).

    Strategy:
      1. Tokenise with spaCy (gives us POS tags on every token).
      2. Scan through tokens looking for an intro phrase (e.g. "my name is").
      3. Look at the NEXT token after the phrase.
      4. If that token's POS is PROPN or NOUN and it's not a known non-name
         word → accept it as a name.
      5. If it's a pronoun / verb / determiner etc. → reject.
    """
    doc = nlp(speech)
    tokens = list(doc)
    n = len(tokens)

    for phrase in _INTRO_PHRASES:
        phrase_len = len(phrase)
        for i in range(n - phrase_len):
            # Check if consecutive tokens match the intro phrase
            window = tuple(t.lower_ for t in tokens[i:i + phrase_len])
            if window == phrase:
                # The token right after the phrase
                next_idx = i + phrase_len
                if next_idx >= n:
                    continue  # nothing follows the phrase

                next_tok = tokens[next_idx]

                # Reject if it's a pronoun, det, conjunction, etc.
                if next_tok.pos_ in _NON_NAME_POS:
                    continue

                # Reject known non-name nouns (e.g. "scientist", "student")
                if next_tok.lemma_.lower() in _NON_NAME_LEMMAS:
                    continue

                # Reject known common verbs (even if spaCy tags them as VERB)
                if next_tok.lemma_.lower() in _COMMON_VERBS:
                    continue

                # Reject single-char tokens
                if len(next_tok.text.strip()) < 2:
                    continue

                # Accept PROPN or NOUN directly → clear name
                if next_tok.pos_ in {"PROPN", "NOUN"}:
                    return True

                # spaCy mistaggs unknown names as VERB/X in short/informal sentences.
                # Accept if it's alphabetic and not a stop word — covers names like
                # "akash", "priya", "rahul" that the small model hasn't seen.
                if next_tok.is_alpha and not next_tok.is_stop:
                    return True

    return False


# ---------------- EDUCATION DETECTION ----------------
education_keywords = [
    "study","studying","college","university",
    "btech","degree","school","student","pursuing"
]

def detect_education(sentence):
    sentence = sentence.lower()
    for word in education_keywords:
        if re.search(r'\b' + re.escape(word) + r'\b', sentence):
            return True
    return False

# ---------------- SKILLS DETECTION ----------------
skills_keywords = [
    "like","love","enjoy","interested",
    "skills","programming","coding",
    "machine learning","artificial intelligence",
    "data science","ai"
]

def detect_skills(sentence):
    sentence = sentence.lower()
    for word in skills_keywords:
        if re.search(r'\b' + re.escape(word) + r'\b', sentence):
            return True
    return False


@app.route("/grade", methods=["POST"])
def grade():

    data = request.json
    speech = data.get("speech", "")

    # Robust tokenization using spaCy, even handles missing punctuation
    doc = nlp(speech)
    sentences = [sent.text.strip() for sent in doc.sents if len(sent.text.strip()) > 2]
    # Fallback to single text if spaCy over-segments or returns nothing
    if not sentences and len(speech.strip()) > 2:
        sentences = [speech.strip()]

    score = 0

    detected = []

    # -------- RULE BASED CHECKS --------
    for sentence in sentences:

        if detect_name(sentence):
            if "introduce your name" not in detected:
                score += 2
                detected.append("introduce your name")

        if detect_education(sentence):
            if "talk about your education" not in detected:
                score += 2
                detected.append("talk about your education")

        if detect_skills(sentence):
            if "mention your skills or interests" not in detected:
                score += 2
                detected.append("mention your skills or interests")

    # -------- SEMANTIC GOAL DETECTION --------
    for param, param_embedding in semantic_params.items():

        best_similarity = 0

        for sentence in sentences:

            sentence_embedding = model.encode(sentence)

            similarity = util.cos_sim(sentence_embedding, param_embedding).item()

            if similarity > best_similarity:
                best_similarity = similarity

        print(param, "->", best_similarity)

        # Adjusted threshold from 0.40 to 0.20 for realistic descriptions
        if best_similarity >= 0.20:
            if param not in detected:
                score += 2
                detected.append(param)

    return jsonify({
        "score": score,
        "detected": detected
    })


if __name__ == "__main__":
    app.run(port=5000)
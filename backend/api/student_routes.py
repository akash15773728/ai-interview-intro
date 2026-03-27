# -------------------- IMPORTS --------------------
from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
import shutil
import os
import re

from backend.services.speech_pipeline import SpeechPipeline


# -------------------- INIT --------------------
router = APIRouter()
pipeline = SpeechPipeline()


# -------------------- ENDPOINT --------------------
@router.post("/evaluate")
async def evaluate(audio: UploadFile = File(...)):

    print("\n========== REQUEST RECEIVED ==========")
    print("🔥 API HIT")

    file_path = f"temp_{audio.filename}"

    #---- Save uploaded audio
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)

    print(f"[FILE SAVED]: {file_path}")

    #---- Run pipeline
    result = pipeline.process(file_path)

    #---- Cleanup temp file
    #if os.path.exists(file_path):
    #    os.remove(file_path)

    print("========== REQUEST COMPLETED ==========")

    return {
        "status": "success",
        "data": result
    }


# ============================================================
#  /analyze  –  Lightweight transcript-based scoring
#  Does NOT touch the ML pipeline (SpeechPipeline).
#  Called by the frontend after Web Speech API transcription.
# ============================================================

class TranscriptBody(BaseModel):
    transcript: str


FILLER_WORDS = {"um", "uh", "like", "you know", "basically", "literally",
                "actually", "so", "right", "okay", "well", "hmm"}

KEY_INTERVIEW_TERMS = [
    "experience", "skill", "project", "team", "lead", "develop", "build",
    "design", "manage", "communicate", "problem", "solution", "result",
    "achieve", "improve", "contribute", "responsibility", "goal",
    "collaborate", "analyse", "analyze", "deliver", "strategy", "impact",
]


@router.post("/analyze")
async def analyze_transcript(body: TranscriptBody):
    """
    Score a transcript text without any audio/ML processing.
    Returns:
        score      (int 0-100)
        confidence (int 0-100)
        feedback   (str with ✔ / ✦ prefixed lines)
    """
    text = body.transcript.strip()
    words = text.lower().split() if text else []
    word_count = len(words)

    # ── SCORE ──────────────────────────────────────────────
    # 1. Length component (max 35 pts): optimal ~80-150 words
    if word_count == 0:
        length_pts = 0
    elif word_count < 20:
        length_pts = int(word_count / 20 * 15)
    elif word_count <= 150:
        length_pts = 15 + int((word_count / 150) * 20)
    else:
        # Slight penalty for very long intros
        length_pts = max(25, 35 - int((word_count - 150) / 30))

    # 2. Keyword hits component (max 35 pts)
    hit_count = sum(1 for kw in KEY_INTERVIEW_TERMS if kw in " ".join(words))
    keyword_pts = min(35, int(hit_count / max(len(KEY_INTERVIEW_TERMS), 1) * 35 * 2.5))

    # 3. Clarity component (max 30 pts): avg sentence length 10-20 words is ideal
    sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
    if sentences:
        avg_sent_len = word_count / len(sentences)
        clarity_pts  = int(max(0, 30 - abs(avg_sent_len - 15) * 1.5))
    else:
        clarity_pts = 0

    score = min(100, length_pts + keyword_pts + clarity_pts)

    # ── CONFIDENCE ─────────────────────────────────────────
    if word_count == 0:
        confidence = 0
    else:
        # Count filler words
        filler_count = sum(words.count(fw) for fw in FILLER_WORDS)
        filler_ratio = filler_count / max(word_count, 1)
        # Sentence completeness: ratio of long-enough sentences
        complete_sents = sum(1 for s in sentences if len(s.split()) >= 5)
        completeness   = complete_sents / max(len(sentences), 1)
        raw_conf       = (completeness * 0.6) - (filler_ratio * 1.5)
        confidence     = max(5, min(100, int(raw_conf * 100)))

    # ── FEEDBACK ───────────────────────────────────────────
    positives    = []
    improvements = []

    if word_count >= 60:
        positives.append("Good length — your intro was detailed and informative.")
    elif word_count >= 30:
        positives.append("Reasonable length — covers the basics.")
    else:
        improvements.append("Your response was very short. Aim for 60-150 words.")

    if hit_count >= 5:
        positives.append(f"Strong vocabulary — used {hit_count} relevant interview keywords.")
    elif hit_count >= 2:
        positives.append(f"Used {hit_count} relevant keywords. Good start.")
    else:
        improvements.append("Add more industry-relevant keywords like 'experience', 'skills', 'project', 'team'.")

    if clarity_pts >= 20:
        positives.append("Clear sentence structure — easy to follow.")
    else:
        improvements.append("Work on sentence clarity. Keep sentences between 10-20 words.")

    if filler_count > 0:
        filler_ratio_pct = int(filler_count / max(word_count, 1) * 100)
        if filler_ratio_pct > 15:
            improvements.append(f"High filler-word usage (~{filler_ratio_pct}%). Practice reducing 'um', 'uh', 'like'.")
        elif filler_ratio_pct > 5:
            positives.append("Moderate filler word usage — room to improve fluency.")
        else:
            positives.append("Excellent fluency — very few filler words detected.")
    else:
        positives.append("Excellent fluency — no filler words detected.")

    if len(sentences) >= 3:
        positives.append("Well-structured introduction with multiple complete sentences.")
    else:
        improvements.append("Structure your response into at least 3-4 complete sentences.")

    # Format feedback string (\u2714 = ✔, \u2746 = ✦)
    lines = (
        [f"\u2714 {p}" for p in positives] +
        [f"\u2746 {i}" for i in improvements]
    )
    feedback = "\n".join(lines)

    return {"score": score, "confidence": confidence, "feedback": feedback}
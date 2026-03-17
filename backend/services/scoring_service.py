# -------------------- CLASS --------------------
class ScoringService:

    # -------------------- EVALUATE --------------------
    def evaluate(self, raw_text, semantic, audio):

        score = {}

        # ---------- CLARITY ----------
        word_count = len(raw_text.split())
        score["clarity"] = min(word_count / 15, 10)

        # ---------- CONTENT ----------
        score["content"] = sum(semantic.values()) * 2

        # ---------- CONFIDENCE ----------
        score["confidence"] = max(10 - audio.get("pause_ratio", 2), 0)

        # ---------- GRAMMAR ----------
        grammar_errors = self._estimate_grammar_errors(raw_text)
        score["grammar"] = max(10 - grammar_errors, 0)

        # ---------- OVERALL ----------
        score["overall"] = round(
            (score["clarity"] + score["content"] + score["confidence"] + score["grammar"]) / 4,
            2
        )

        return score


    # -------------------- GRAMMAR HEURISTIC --------------------
    def _estimate_grammar_errors(self, text):

        errors = 0

        # all lowercase → bad grammar
        if text.islower():
            errors += 2

        # improper "i"
        if " i " in text:
            errors += 1

        # very short answer
        if len(text.split()) < 5:
            errors += 2

        return errors
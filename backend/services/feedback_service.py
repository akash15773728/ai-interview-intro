# backend/services/feedback_service.py

import logging

logger = logging.getLogger(__name__)

class FeedbackService:

    def __init__(self):
        pass

    def generate(self, text, semantic, scores, fillers):

        positives = []
        improvements = []

        detected = semantic.get("detected", {})

        # -------- POSITIVES --------
        if detected.get("introduction"):
            positives.append("You introduced yourself clearly.")

        if detected.get("education"):
            positives.append("You mentioned your education.")

        if detected.get("skills"):
            positives.append("You included your skills.")

        # -------- IMPROVEMENTS --------
        if not detected.get("skills"):
            improvements.append("Add your skills.")

        if not detected.get("experience"):
            improvements.append("Mention your experience.")

        if not detected.get("career_goals"):
            improvements.append("Explain your career goals.")

        return {
            "positives": positives,
            "improvements": improvements
        }
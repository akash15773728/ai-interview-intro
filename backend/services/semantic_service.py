# -------------------- IMPORTS --------------------
from backend.ml_models.embedding_model import EmbeddingModel


# -------------------- CLASS --------------------
class SemanticService:

    def __init__(self):
        self.model = EmbeddingModel()

        self.categories = {
            "introduction": "my name is",
            "education": "i study university college degree",
            "skills": "i know python ai ml",
            "experience": "i worked internship project",
            "career": "my goal future ambition"
        }

    # -------------------- ANALYZE --------------------
    def analyze(self, text: str):

        results = {}

        for key, example in self.categories.items():
            score = self.model.similarity(text, example)
            results[key] = score > 0.4

        return results
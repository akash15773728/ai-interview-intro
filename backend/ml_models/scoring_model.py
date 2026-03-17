from backend.ml_models.embedding_model import EmbeddingModel


class ParameterClassifier:

    def __init__(self):
        self.embedder = EmbeddingModel()

    def detect(self, transcript: str, parameters: list):

        results = {}

        transcript_vec = self.embedder.encode(transcript)

        for param in parameters:

            param_vec = self.embedder.encode(param)

            score = self.embedder.similarity(transcript_vec, param_vec)

            results[param] = score > 0.35

        return results
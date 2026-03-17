# -------------------- IMPORTS --------------------
from sentence_transformers import SentenceTransformer, util


# -------------------- CLASS --------------------
class EmbeddingModel:

    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

    # -------------------- SIMILARITY --------------------
    def similarity(self, text1, text2):
        emb1 = self.model.encode(text1, convert_to_tensor=True)
        emb2 = self.model.encode(text2, convert_to_tensor=True)

        return util.cos_sim(emb1, emb2).item()
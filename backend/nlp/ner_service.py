import spacy


class NERService:

    def __init__(self):
        self.nlp = spacy.load("en_core_web_trf")

    def extract_names(self, text):

        doc = self.nlp(text)

        names = []

        for ent in doc.ents:
            if ent.label_ in ["PERSON", "ORG"]:
                names.append(ent.text)

        return names
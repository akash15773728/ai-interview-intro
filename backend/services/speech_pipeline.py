# -------------------- IMPORTS --------------------
from backend.services.transcription_service import TranscriptionService
from backend.services.correction_service import CorrectionService
from backend.services.semantic_service import SemanticService
from backend.services.audio_analysis_service import AudioAnalysisService
from backend.services.scoring_service import ScoringService
from backend.services.audio_preprocessing_service import AudioPreprocessingService


# -------------------- PIPELINE CLASS --------------------
class SpeechPipeline:

    def __init__(self):
        self.transcriber = TranscriptionService()
        self.corrector = CorrectionService()
        self.semantic = SemanticService()
        self.audio_analyzer = AudioAnalysisService()
        self.scorer = ScoringService()
        self.preprocessor = AudioPreprocessingService()


    # -------------------- MAIN EXECUTION --------------------
    def process(self, audio_path: str):

        print("\n---------- PIPELINE START ----------")

        # ---------- STEP 0: PREPROCESS ----------
        clean_audio = self.preprocessor.process(audio_path, "clean.wav")
        print(f"[CLEAN AUDIO]: {clean_audio}")

        # ---------- STEP 1: TRANSCRIPTION ----------
        raw_text = self.transcriber.transcribe(clean_audio)
        print(f"[RAW TRANSCRIPT]: {raw_text}")

        # ---------- STEP 2: REFINE (NO GRAMMAR CHANGE) ----------
        refined_text = self.corrector.refine(raw_text)
        print(f"[REFINED TEXT]: {refined_text}")

        # ---------- STEP 3: SEMANTIC (USE REFINED) ----------
        semantic_result = self.semantic.analyze(refined_text)
        print(f"[SEMANTIC]: {semantic_result}")

        # ---------- STEP 4: AUDIO ----------
        audio_features = self.audio_analyzer.extract(clean_audio)
        print(f"[AUDIO FEATURES]: {audio_features}")

        # ---------- STEP 5: SCORING (USE RAW TEXT) ----------
        scores = self.scorer.evaluate(raw_text, semantic_result, audio_features)
        print(f"[SCORES]: {scores}")

        print("---------- PIPELINE END ----------")

        return {
            "raw_transcript": raw_text,
            "refined_transcript": refined_text,
            "semantic": semantic_result,
            "audio_features": audio_features,
            "scores": scores
        }
# -------------------- IMPORTS --------------------
from faster_whisper import WhisperModel


# -------------------- CLASS --------------------
class TranscriptionService:

    def __init__(self):
        self.model = WhisperModel(
            "large-v3",        # ✅ BEST MODEL
            device="cpu",      # stable
            compute_type="int8"  # optimized for CPU
        )

    # -------------------- TRANSCRIBE --------------------
    def transcribe(self, audio_path: str):

        segments, _ = self.model.transcribe(
            audio_path,
            beam_size=7,   # 🔥 higher = better accuracy
            best_of=7,
            temperature=0.0,
            condition_on_previous_text=True,
            initial_prompt="""
            This is a professional interview.
            Speaker may have Indian accent.
            Names like Somanshu, Indian universities, and technical terms may appear.
            """
        )

        text = " ".join([seg.text for seg in segments])

        return text.strip()
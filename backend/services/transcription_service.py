# -------------------- IMPORTS --------------------
from faster_whisper import WhisperModel


# -------------------- CLASS --------------------
class TranscriptionService:

    def __init__(self):
        """
        #---- Initialize Whisper model
        # Auto fallback:
        # - Try GPU
        # - If not available → use CPU optimized mode
        """

        try:
            self.model = WhisperModel(
                "large-v3",
                device="cpu",
                compute_type="int8"
            )
            print("✅ Transcription using CPU")
        except:
            self.model = WhisperModel(
                "large-v3",
                device="cpu",
                compute_type="int8",
                #cpu_threads=8
            )
            print("⚠️ Transcription using CPU")

    # -------------------- TRANSCRIBE --------------------
    def transcribe(self, audio_path: str) -> str:
        """
        #---- Convert audio → text
        # Uses beam search for better accuracy
        # Uses context prompt for Indian accent handling
        """

        segments, _ = self.model.transcribe(
            audio_path,
            beam_size=5,
            best_of=5,
            temperature=0.0,
            condition_on_previous_text=True,
            initial_prompt="""
            This is a professional interview.
            Speaker may have Indian accent.
            Names like  Somanshu,Indian universities, and technical terms may appear.
            """
        )

        #---- Combine all segments into final text
        text = " ".join([seg.text for seg in segments])

        return text.strip()
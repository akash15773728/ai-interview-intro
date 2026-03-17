from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

DATA_DIR = BASE_DIR / "data"
MODEL_DIR = BASE_DIR / "models"

DEFAULT_PARAMETER_FILE = DATA_DIR / "default_parameters.json"

AUDIO_SAMPLE_RATE = 16000
MAX_RECORD_SECONDS = 60

WHISPER_MODEL_SIZE = "large-v3"
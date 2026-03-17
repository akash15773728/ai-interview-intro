# -------------------- IMPORTS --------------------
from fastapi import APIRouter, UploadFile, File
import shutil
import os

from backend.services.speech_pipeline import SpeechPipeline


# -------------------- ROUTER INIT --------------------
router = APIRouter()
pipeline = SpeechPipeline()


# -------------------- ENDPOINT --------------------
@router.post("/evaluate")
async def evaluate(file: UploadFile = File(...)):

    print("\n---------- REQUEST RECEIVED ----------")

    file_path = f"temp_{file.filename}"

    # ---------- SAVE FILE ----------
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    print(f"[FILE SAVED]: {file_path}")

    # ---------- PROCESS ----------
    result = pipeline.process(file_path)

    # ---------- CLEANUP ----------
    if os.path.exists(file_path):
        os.remove(file_path)

    print("---------- REQUEST COMPLETED ----------")

    return {
        "status": "success",
        "data": result
    }
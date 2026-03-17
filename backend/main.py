# -------------------- IMPORTS --------------------
from fastapi import FastAPI
from backend.api.student_routes import router as student_router


# -------------------- APP INIT --------------------
app = FastAPI(
    title="Introlytics AI Interview Evaluation System"
)


# -------------------- ROUTES --------------------
app.include_router(student_router, prefix="/student", tags=["Student"])


# -------------------- ROOT --------------------
@app.get("/")
def home():
    return {"message": "Introlytics backend running"}

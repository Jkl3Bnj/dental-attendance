from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, doctors, attendance

app = FastAPI(
    title="Dental Attendance API",
    description="Sistema de registro de asistencia para consultoría dental",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://dental-attendance.vercel.app",
        "https://dental-attendance-ir3k7l08h-jkl3bnjs-projects.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(doctors.router)
app.include_router(attendance.router)

@app.get("/")
def root():
    return {"mensaje": "API de asistencia dental funcionando"}
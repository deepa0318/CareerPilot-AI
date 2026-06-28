import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database.database import engine, Base
from models import models
from routers import auth, resume, interview, skills, profile
from routers import chatbot as chat

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CareerPilot AI",
    description="AI Powered Career Preparation Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://career-pilot-ai-ten-omega.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
os.makedirs("uploads/photos", exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(interview.router)
app.include_router(skills.router)
app.include_router(chat.router)
app.include_router(profile.router)


@app.get("/")
def root():
    return {
        "message": "CareerPilot AI Backend Running",
        "version": "1.0.0"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }
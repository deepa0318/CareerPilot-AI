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

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CareerPilot AI",
    description="AI Powered Career Preparation Platform",
    version="1.0.0",
)

# -----------------------------
# CORS Configuration
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",

        # Production Vercel URL
        "https://career-pilot-ai-ten-omega.vercel.app",

        # Current Preview URL
        "https://career-pilot-dupvw7a3l-deepa0318s-projects.vercel.app",
    ],

    # Allow every Vercel preview deployment
    allow_origin_regex=r"https://career-pilot.*\.vercel\.app",

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Upload folders
# -----------------------------
os.makedirs("uploads", exist_ok=True)
os.makedirs("uploads/photos", exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

# -----------------------------
# Routers
# -----------------------------
app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(interview.router)
app.include_router(skills.router)
app.include_router(chat.router)
app.include_router(profile.router)

# -----------------------------
# Root
# -----------------------------
@app.get("/")
def root():
    return {
        "message": "CareerPilot AI Backend Running",
        "version": "1.0.0"
    }

# -----------------------------
# Health Check
# -----------------------------
@app.get("/health")
def health():
    return {
        "status": "healthy"
    }

# -----------------------------
# Test Route
# -----------------------------
@app.get("/cors-test")
def cors_test():
    return {
        "message": "CORS is working"
    }
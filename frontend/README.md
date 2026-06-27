# CareerPilot AI 🚀

AI-Powered Career Preparation Platform built with React + FastAPI + Google Gemini

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
# Add GEMINI_API_KEY to .env
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Features
- 📄 Resume Analyzer with ATS Scoring
- 🎤 AI Interview Coach with Voice Input
- 📊 Skill Gap Analyzer + Learning Roadmap
- 💬 Career Chatbot (Gemini-powered)
- 🔐 JWT Authentication
- 🎨 Dark UI with Glassmorphism

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion
- **Backend**: FastAPI, SQLAlchemy, SQLite
- **AI**: Google Gemini 1.5 Flash
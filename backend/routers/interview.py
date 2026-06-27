from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json, re

from database.database import get_db
from models.models import InterviewHistory, User
from routers.auth import get_current_user
from aimodule.gemini_client import generate_content
from aimodule.prompts import interview_question_prompt, interview_evaluation_prompt

router = APIRouter(prefix="/interview", tags=["Interview"])


class GenerateQuestionsRequest(BaseModel):
    role: str
    difficulty: str = "medium"
    count: int = 5


class EvaluateAnswerRequest(BaseModel):
    role: str
    question: str
    answer: str
    question_id: int = None


@router.post("/generate-questions")
async def generate_questions(
    request: GenerateQuestionsRequest,
    current_user: User = Depends(get_current_user)
):
    prompt = interview_question_prompt(request.role, request.difficulty, request.count)
    ai_response = await generate_content(prompt)

    try:
        result = json.loads(ai_response)
    except json.JSONDecodeError:
        json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
        else:
            raise HTTPException(status_code=500, detail="Failed to generate questions")

    return result


@router.post("/evaluate")
async def evaluate_answer(
    request: EvaluateAnswerRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prompt = interview_evaluation_prompt(request.role, request.question, request.answer)
    ai_response = await generate_content(prompt)

    try:
        evaluation = json.loads(ai_response)
    except json.JSONDecodeError:
        json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
        if json_match:
            evaluation = json.loads(json_match.group())
        else:
            raise HTTPException(status_code=500, detail="Evaluation failed")

    history = InterviewHistory(
        user_id=current_user.id,
        role=request.role,
        question=request.question,
        user_answer=request.answer,
        ai_feedback=evaluation.get("feedback", ""),
        ideal_answer=evaluation.get("ideal_answer", ""),
        score=evaluation.get("score", 0)
    )
    db.add(history)
    db.commit()

    return evaluation


@router.get("/history")
def get_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    history = db.query(InterviewHistory).filter(
        InterviewHistory.user_id == current_user.id
    ).order_by(InterviewHistory.created_at.desc()).limit(20).all()

    return [
        {
            "id": h.id,
            "role": h.role,
            "question": h.question,
            "score": h.score,
            "feedback": h.ai_feedback,
            "created_at": h.created_at
        }
        for h in history
    ]


@router.get("/stats")
def get_interview_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    history = db.query(InterviewHistory).filter(
        InterviewHistory.user_id == current_user.id
    ).all()

    if not history:
        return {"total": 0, "average_score": 0, "best_score": 0, "roles": []}

    scores = [h.score for h in history if h.score is not None]
    roles = list(set(h.role for h in history))

    return {
        "total": len(history),
        "average_score": round(sum(scores) / len(scores), 1) if scores else 0,
        "best_score": max(scores) if scores else 0,
        "roles": roles
    }

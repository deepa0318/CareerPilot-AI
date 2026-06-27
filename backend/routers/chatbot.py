from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid

from database.database import get_db
from models.models import ChatHistory, User
from routers.auth import get_current_user
from aimodule.gemini_client import generate_content
from aimodule.prompts import career_chat_prompt
router = APIRouter(prefix="/chat", tags=["Chatbot"])

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None
@router.post("/send")
async def send_message(
    request: ChatMessage,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session_id = request.session_id or str(uuid.uuid4())

    recent = db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.id,
        ChatHistory.session_id == session_id
    ).order_by(ChatHistory.created_at.desc()).limit(10).all()

    context = "\n".join([f"{m.role}: {m.message}" for m in reversed(recent)])

    user_profile = {
        "target_role": current_user.target_role,
        "experience_years": current_user.experience_years,
        "location": current_user.location
    }

    prompt = career_chat_prompt(request.message, context, user_profile)
    ai_response = await generate_content(prompt)

    user_msg = ChatHistory(user_id=current_user.id, session_id=session_id, role="user", message=request.message)
    ai_msg = ChatHistory(user_id=current_user.id, session_id=session_id, role="assistant", message=ai_response)
    db.add(user_msg)
    db.add(ai_msg)
    db.commit()

    return {"response": ai_response, "session_id": session_id}


@router.get("/history/{session_id}")
def get_session_history(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    messages = db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.id,
        ChatHistory.session_id == session_id
    ).order_by(ChatHistory.created_at.asc()).all()

    return [{"role": m.role, "message": m.message, "created_at": m.created_at} for m in messages]


@router.get("/sessions")
def get_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from sqlalchemy import distinct, func
    sessions = db.query(
        ChatHistory.session_id,
        func.min(ChatHistory.created_at).label("started_at"),
        func.count(ChatHistory.id).label("message_count")
    ).filter(
        ChatHistory.user_id == current_user.id
    ).group_by(ChatHistory.session_id).order_by(func.min(ChatHistory.created_at).desc()).limit(20).all()

    return [{"session_id": s.session_id, "started_at": s.started_at, "message_count": s.message_count} for s in sessions]


@router.delete("/session/{session_id}")
def delete_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.id,
        ChatHistory.session_id == session_id
    ).delete()
    db.commit()
    return {"message": "Session deleted"}

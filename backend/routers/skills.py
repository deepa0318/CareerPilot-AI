from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
import json, re

from database.database import get_db
from models.models import Skill, Roadmap, User
from routers.auth import get_current_user
from aimodule.gemini_client import generate_content
from aimodule.prompts import skill_gap_prompt, roadmap_prompt
router = APIRouter(prefix="/skills", tags=["Skills"])


class SkillCreate(BaseModel):
    name: str
    level: str = "beginner"
    category: str = ""


class SkillGapRequest(BaseModel):
    target_role: str
    current_skills: List[str] = []


class RoadmapRequest(BaseModel):
    target_role: str
    missing_skills: List[str]
    timeline_weeks: int = 12


@router.get("/")
def get_skills(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    skills = db.query(Skill).filter(Skill.user_id == current_user.id).all()
    return [{"id": s.id, "name": s.name, "level": s.level, "category": s.category} for s in skills]


@router.post("/")
def add_skill(skill_data: SkillCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    skill = Skill(user_id=current_user.id, name=skill_data.name, level=skill_data.level, category=skill_data.category)
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return {"id": skill.id, "name": skill.name, "level": skill.level}


@router.delete("/{skill_id}")
def delete_skill(skill_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    skill = db.query(Skill).filter(Skill.id == skill_id, Skill.user_id == current_user.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    db.delete(skill)
    db.commit()
    return {"message": "Skill deleted"}


@router.post("/gap-analysis")
async def analyze_skill_gap(
    request: SkillGapRequest,
    current_user: User = Depends(get_current_user)
):
    prompt = skill_gap_prompt(request.target_role, request.current_skills)
    ai_response = await generate_content(prompt)

    try:
        result = json.loads(ai_response)
    except json.JSONDecodeError:
        json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
        else:
            raise HTTPException(status_code=500, detail="Analysis failed")

    return result


@router.post("/roadmap")
async def generate_roadmap(
    request: RoadmapRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prompt = roadmap_prompt(request.target_role, request.missing_skills, request.timeline_weeks)
    ai_response = await generate_content(prompt)

    try:
        result = json.loads(ai_response)
    except json.JSONDecodeError:
        json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
        else:
            raise HTTPException(status_code=500, detail="Roadmap generation failed")

    roadmap = Roadmap(
        user_id=current_user.id,
        target_role=request.target_role,
        missing_skills=request.missing_skills,
        weekly_plan=result.get("weekly_plan", []),
        monthly_plan=result.get("monthly_milestones", []),
        resources=result.get("final_projects", []),
        timeline_weeks=request.timeline_weeks
    )
    db.add(roadmap)
    db.commit()

    return result


@router.get("/roadmaps")
def get_roadmaps(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    roadmaps = db.query(Roadmap).filter(Roadmap.user_id == current_user.id).order_by(Roadmap.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "target_role": r.target_role,
            "timeline_weeks": r.timeline_weeks,
            "progress_percent": r.progress_percent,
            "created_at": r.created_at
        }
        for r in roadmaps
    ]

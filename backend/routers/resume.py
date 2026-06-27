from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import shutil, os, json, uuid

from database.database import get_db
from models.models import Resume, User
from routers.auth import get_current_user
from aimodule.resume_parser import extract_text_from_pdf, parse_resume_sections
from aimodule.gemini_client import generate_content
from aimodule.prompts import resume_analysis_prompt, ats_analysis_prompt

router = APIRouter(prefix="/resume", tags=["Resume"])
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    file_id = str(uuid.uuid4())
    filename = f"{file_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    raw_text = extract_text_from_pdf(file_path)
    parsed_data = parse_resume_sections(raw_text)

    resume = Resume(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        raw_text=raw_text,
        parsed_data=parsed_data
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return {
        "id": resume.id,
        "filename": resume.filename,
        "raw_text": raw_text[:500] + "..." if len(raw_text) > 500 else raw_text,
        "parsed_data": parsed_data,
        "message": "Resume uploaded successfully"
    }


@router.post("/analyze/{resume_id}")
async def analyze_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    prompt = resume_analysis_prompt(resume.raw_text)
    ai_response = await generate_content(prompt)

    try:
        analysis = json.loads(ai_response)
    except json.JSONDecodeError:
        import re
        json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
        if json_match:
            analysis = json.loads(json_match.group())
        else:
            raise HTTPException(status_code=500, detail="AI response parsing failed")

    resume.analysis_result = analysis
    resume.ats_score = analysis.get("overall_score", 0)
    db.commit()

    return {"resume_id": resume_id, "analysis": analysis}


@router.post("/ats/{resume_id}")
async def ats_analysis(
    resume_id: int,
    job_description: str = Form(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    prompt = ats_analysis_prompt(resume.raw_text, job_description)
    ai_response = await generate_content(prompt)

    try:
        ats_result = json.loads(ai_response)
    except json.JSONDecodeError:
        import re
        json_match = re.search(r'\{.*\}', ai_response, re.DOTALL)
        if json_match:
            ats_result = json.loads(json_match.group())
        else:
            raise HTTPException(status_code=500, detail="AI response parsing failed")

    resume.ats_score = ats_result.get("ats_score", 0)
    db.commit()

    return {"resume_id": resume_id, "ats_result": ats_result}


@router.get("/list")
def list_resumes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    return [
        {
            "id": r.id,
            "filename": r.filename,
            "ats_score": r.ats_score,
            "is_primary": r.is_primary,
            "created_at": r.created_at,
            "has_analysis": r.analysis_result is not None
        }
        for r in resumes
    ]


@router.delete("/{resume_id}")
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    if os.path.exists(resume.file_path):
        os.remove(resume.file_path)

    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted"}

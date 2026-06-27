from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import shutil, os, uuid

from database.database import get_db
from models.models import User, Settings
from routers.auth import get_current_user

router = APIRouter(prefix="/profile", tags=["Profile"])
UPLOAD_DIR = "uploads/photos"
os.makedirs(UPLOAD_DIR, exist_ok=True)


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    target_role: Optional[str] = None
    experience_years: Optional[int] = None


class SettingsUpdate(BaseModel):
    theme: Optional[str] = None
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    gemini_api_key: Optional[str] = None
    language: Optional[str] = None


@router.get("/")
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    settings = db.query(Settings).filter(Settings.user_id == current_user.id).first()
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "bio": current_user.bio,
        "location": current_user.location,
        "target_role": current_user.target_role,
        "experience_years": current_user.experience_years,
        "profile_photo": current_user.profile_photo,
        "created_at": current_user.created_at,
        "settings": {
            "theme": settings.theme if settings else "dark",
            "email_notifications": settings.email_notifications if settings else True,
            "language": settings.language if settings else "en"
        }
    }


@router.put("/")
def update_profile(
    profile_data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    for field, value in profile_data.dict(exclude_none=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return {"message": "Profile updated", "name": current_user.name}


@router.post("/photo")
async def upload_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ext = file.filename.split(".")[-1]
    if ext.lower() not in ["jpg", "jpeg", "png", "webp"]:
        raise HTTPException(status_code=400, detail="Invalid image format")

    filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    current_user.profile_photo = f"/uploads/photos/{filename}"
    db.commit()
    return {"photo_url": current_user.profile_photo}


@router.get("/settings")
def get_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    settings = db.query(Settings).filter(Settings.user_id == current_user.id).first()
    if not settings:
        settings = Settings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.put("/settings")
def update_settings(
    settings_data: SettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    settings = db.query(Settings).filter(Settings.user_id == current_user.id).first()
    if not settings:
        settings = Settings(user_id=current_user.id)
        db.add(settings)

    for field, value in settings_data.dict(exclude_none=True).items():
        setattr(settings, field, value)
    db.commit()
    return {"message": "Settings updated"}

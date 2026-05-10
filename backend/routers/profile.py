from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from auth_utils import get_current_user, hash_password

router = APIRouter()

@router.get("/", response_model=schemas.UserResponse)
def get_profile(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.put("/", response_model=schemas.UserResponse)
def update_profile(data: schemas.ProfileUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if data.name:
        user.name = data.name
    if data.avatar is not None:
        user.avatar = data.avatar
    if data.language:
        user.language = data.language
    if data.password:
        user.hashed_password = hash_password(data.password)
    db.commit()
    db.refresh(user)
    return user

@router.delete("/")
def delete_account(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    user.is_active = False
    db.commit()
    return {"message": "Account deactivated"}

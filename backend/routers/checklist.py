from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from auth_utils import get_current_user
from typing import List

router = APIRouter()

@router.get("/{trip_id}", response_model=List[schemas.ChecklistItemResponse])
def get_checklist(trip_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return db.query(models.ChecklistItem).filter(models.ChecklistItem.trip_id == trip_id).all()

@router.post("/{trip_id}", response_model=schemas.ChecklistItemResponse)
def add_checklist_item(trip_id: int, data: schemas.ChecklistItemCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    item = models.ChecklistItem(trip_id=trip_id, **data.dict())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.patch("/{trip_id}/{item_id}/toggle", response_model=schemas.ChecklistItemResponse)
def toggle_item(trip_id: int, item_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(models.ChecklistItem).filter(models.ChecklistItem.id == item_id, models.ChecklistItem.trip_id == trip_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.is_packed = not item.is_packed
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{trip_id}/{item_id}")
def delete_item(trip_id: int, item_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(models.ChecklistItem).filter(models.ChecklistItem.id == item_id, models.ChecklistItem.trip_id == trip_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}

@router.delete("/{trip_id}/reset/all")
def reset_checklist(trip_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(models.ChecklistItem).filter(models.ChecklistItem.trip_id == trip_id).update({"is_packed": False})
    db.commit()
    return {"message": "Checklist reset"}

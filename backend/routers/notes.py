from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from auth_utils import get_current_user
from typing import List
from datetime import datetime

router = APIRouter()

@router.get("/{trip_id}", response_model=List[schemas.NoteResponse])
def get_notes(trip_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return db.query(models.TripNote).filter(models.TripNote.trip_id == trip_id).order_by(models.TripNote.created_at.desc()).all()

@router.post("/{trip_id}", response_model=schemas.NoteResponse)
def create_note(trip_id: int, data: schemas.NoteCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    note = models.TripNote(trip_id=trip_id, owner_id=current_user.id, **data.dict())
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

@router.put("/{trip_id}/{note_id}", response_model=schemas.NoteResponse)
def update_note(trip_id: int, note_id: int, data: schemas.NoteUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    note = db.query(models.TripNote).filter(models.TripNote.id == note_id, models.TripNote.trip_id == trip_id, models.TripNote.owner_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    for key, value in data.dict(exclude_none=True).items():
        setattr(note, key, value)
    note.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(note)
    return note

@router.delete("/{trip_id}/{note_id}")
def delete_note(trip_id: int, note_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    note = db.query(models.TripNote).filter(models.TripNote.id == note_id, models.TripNote.trip_id == trip_id, models.TripNote.owner_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
    return {"message": "Deleted"}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from database import get_db
import models, schemas
from auth_utils import get_current_user
from typing import List
import uuid

router = APIRouter()

@router.get("/", response_model=List[schemas.TripResponse])
def list_trips(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Trip).filter(models.Trip.owner_id == current_user.id)\
        .options(joinedload(models.Trip.stops).joinedload(models.TripStop.city),
                 joinedload(models.Trip.stops).joinedload(models.TripStop.stop_activities).joinedload(models.StopActivity.activity))\
        .order_by(models.Trip.created_at.desc()).all()

@router.post("/", response_model=schemas.TripResponse)
def create_trip(data: schemas.TripCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = models.Trip(
        **data.dict(),
        owner_id=current_user.id,
        public_token=str(uuid.uuid4()) if data.is_public else None
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip

@router.get("/{trip_id}", response_model=schemas.TripResponse)
def get_trip(trip_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id)\
        .options(joinedload(models.Trip.stops).joinedload(models.TripStop.city),
                 joinedload(models.Trip.stops).joinedload(models.TripStop.stop_activities).joinedload(models.StopActivity.activity))\
        .first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

@router.put("/{trip_id}", response_model=schemas.TripResponse)
def update_trip(trip_id: int, data: schemas.TripUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    for key, value in data.dict(exclude_none=True).items():
        setattr(trip, key, value)
    if data.is_public and not trip.public_token:
        trip.public_token = str(uuid.uuid4())
    db.commit()
    db.refresh(trip)
    return trip

@router.delete("/{trip_id}")
def delete_trip(trip_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    db.delete(trip)
    db.commit()
    return {"message": "Trip deleted"}

# Public trip view
@router.get("/public/{token}", response_model=schemas.TripResponse)
def get_public_trip(token: str, db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.public_token == token, models.Trip.is_public == True)\
        .options(joinedload(models.Trip.stops).joinedload(models.TripStop.city),
                 joinedload(models.Trip.stops).joinedload(models.TripStop.stop_activities).joinedload(models.StopActivity.activity))\
        .first()
    if not trip:
        raise HTTPException(status_code=404, detail="Public trip not found")
    return trip

# Stops
@router.post("/{trip_id}/stops", response_model=schemas.TripStopResponse)
def add_stop(trip_id: int, data: schemas.TripStopCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    city = db.query(models.City).filter(models.City.id == data.city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    count = db.query(models.TripStop).filter(models.TripStop.trip_id == trip_id).count()
    stop = models.TripStop(**data.dict(), trip_id=trip_id, order=data.order if data.order else count)
    db.add(stop)
    db.commit()
    db.refresh(stop)
    return stop

@router.put("/{trip_id}/stops/{stop_id}", response_model=schemas.TripStopResponse)
def update_stop(trip_id: int, stop_id: int, data: schemas.TripStopUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    stop = db.query(models.TripStop).filter(models.TripStop.id == stop_id, models.TripStop.trip_id == trip_id).first()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")
    for key, value in data.dict(exclude_none=True).items():
        setattr(stop, key, value)
    db.commit()
    db.refresh(stop)
    return stop

@router.delete("/{trip_id}/stops/{stop_id}")
def delete_stop(trip_id: int, stop_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    stop = db.query(models.TripStop).filter(models.TripStop.id == stop_id, models.TripStop.trip_id == trip_id).first()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")
    db.delete(stop)
    db.commit()
    return {"message": "Stop deleted"}

# Stop activities
@router.post("/{trip_id}/stops/{stop_id}/activities", response_model=schemas.StopActivityResponse)
def add_stop_activity(trip_id: int, stop_id: int, data: schemas.StopActivityCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    stop = db.query(models.TripStop).filter(models.TripStop.id == stop_id, models.TripStop.trip_id == trip_id).first()
    if not stop:
        raise HTTPException(status_code=404, detail="Stop not found")
    sa = models.StopActivity(stop_id=stop_id, **data.dict())
    db.add(sa)
    db.commit()
    db.refresh(sa)
    return sa

@router.delete("/{trip_id}/stops/{stop_id}/activities/{sa_id}")
def remove_stop_activity(trip_id: int, stop_id: int, sa_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    sa = db.query(models.StopActivity).filter(models.StopActivity.id == sa_id, models.StopActivity.stop_id == stop_id).first()
    if not sa:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(sa)
    db.commit()
    return {"message": "Activity removed"}

@router.patch("/{trip_id}/stops/{stop_id}/activities/{sa_id}/complete")
def toggle_activity_complete(trip_id: int, stop_id: int, sa_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    sa = db.query(models.StopActivity).filter(models.StopActivity.id == sa_id).first()
    if not sa:
        raise HTTPException(status_code=404, detail="Not found")
    sa.completed = not sa.completed
    db.commit()
    return {"completed": sa.completed}

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
from auth_utils import get_admin_user
from typing import List

router = APIRouter()

@router.get("/stats")
def get_stats(current_user: models.User = Depends(get_admin_user), db: Session = Depends(get_db)):
    total_users = db.query(models.User).count()
    total_trips = db.query(models.Trip).count()
    total_stops = db.query(models.TripStop).count()
    total_activities = db.query(models.StopActivity).count()
    public_trips = db.query(models.Trip).filter(models.Trip.is_public == True).count()

    # Top cities
    from sqlalchemy import func
    top_cities = db.query(
        models.City.name,
        models.City.country,
        func.count(models.TripStop.id).label("trip_count")
    ).join(models.TripStop, models.TripStop.city_id == models.City.id, isouter=True)\
     .group_by(models.City.id).order_by(func.count(models.TripStop.id).desc()).limit(10).all()

    # Recent users
    recent_users = db.query(models.User).order_by(models.User.created_at.desc()).limit(10).all()

    # Trips by status
    planning = db.query(models.Trip).filter(models.Trip.status == "planning").count()
    ongoing = db.query(models.Trip).filter(models.Trip.status == "ongoing").count()
    completed = db.query(models.Trip).filter(models.Trip.status == "completed").count()

    return {
        "totals": {
            "users": total_users,
            "trips": total_trips,
            "stops": total_stops,
            "activities_booked": total_activities,
            "public_trips": public_trips
        },
        "top_cities": [{"name": c.name, "country": c.country, "trip_count": c.trip_count} for c in top_cities],
        "recent_users": [{"id": u.id, "name": u.name, "email": u.email, "created_at": u.created_at.isoformat(), "role": u.role} for u in recent_users],
        "trip_status": {"planning": planning, "ongoing": ongoing, "completed": completed}
    }

@router.get("/users")
def list_users(current_user: models.User = Depends(get_admin_user), db: Session = Depends(get_db)):
    users = db.query(models.User).order_by(models.User.created_at.desc()).all()
    return [{"id": u.id, "name": u.name, "email": u.email, "role": u.role, "is_active": u.is_active, "created_at": u.created_at.isoformat()} for u in users]

@router.patch("/users/{user_id}/toggle")
def toggle_user(user_id: int, current_user: models.User = Depends(get_admin_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"is_active": user.is_active}

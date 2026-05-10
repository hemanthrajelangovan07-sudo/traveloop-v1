from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from database import get_db
import models
from auth_utils import get_current_user

router = APIRouter()

@router.get("/{trip_id}")
def get_budget(trip_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id, models.Trip.owner_id == current_user.id)\
        .options(joinedload(models.Trip.stops).joinedload(models.TripStop.city),
                 joinedload(models.Trip.stops).joinedload(models.TripStop.stop_activities).joinedload(models.StopActivity.activity))\
        .first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    total_accommodation = 0
    total_transport = 0
    total_meals = 0
    total_activities = 0
    per_stop = []

    for stop in trip.stops:
        stop_activity_cost = sum(
            (sa.custom_cost if sa.custom_cost is not None else sa.activity.cost)
            for sa in stop.stop_activities
        )
        stop_total = stop.accommodation_cost + stop.transport_cost + stop.meal_cost + stop_activity_cost
        total_accommodation += stop.accommodation_cost
        total_transport += stop.transport_cost
        total_meals += stop.meal_cost
        total_activities += stop_activity_cost

        # Days in stop
        from datetime import datetime
        try:
            arr = datetime.strptime(stop.arrival_date, "%Y-%m-%d")
            dep = datetime.strptime(stop.departure_date, "%Y-%m-%d")
            days = max((dep - arr).days, 1)
        except:
            days = 1

        per_stop.append({
            "stop_id": stop.id,
            "city": stop.city.name,
            "country": stop.city.country,
            "days": days,
            "accommodation": stop.accommodation_cost,
            "transport": stop.transport_cost,
            "meals": stop.meal_cost,
            "activities": stop_activity_cost,
            "total": stop_total,
            "per_day": round(stop_total / days, 2),
            "over_budget": stop_total > (trip.total_budget / max(len(trip.stops), 1)) if trip.total_budget > 0 else False
        })

    grand_total = total_accommodation + total_transport + total_meals + total_activities

    return {
        "trip_id": trip.id,
        "trip_title": trip.title,
        "total_budget": trip.total_budget,
        "spent": round(grand_total, 2),
        "remaining": round(trip.total_budget - grand_total, 2),
        "breakdown": {
            "accommodation": round(total_accommodation, 2),
            "transport": round(total_transport, 2),
            "meals": round(total_meals, 2),
            "activities": round(total_activities, 2),
        },
        "per_stop": per_stop,
        "over_budget": grand_total > trip.total_budget if trip.total_budget > 0 else False
    }

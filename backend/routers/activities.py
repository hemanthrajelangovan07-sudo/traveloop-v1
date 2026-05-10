from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from typing import List, Optional

router = APIRouter()

@router.get("/", response_model=List[schemas.ActivityResponse])
def search_activities(
    city_id: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    max_cost: Optional[float] = Query(None),
    q: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Activity)
    if city_id:
        query = query.filter(models.Activity.city_id == city_id)
    if category:
        query = query.filter(models.Activity.category == category)
    if max_cost is not None:
        query = query.filter(models.Activity.cost <= max_cost)
    if q:
        query = query.filter(models.Activity.name.ilike(f"%{q}%"))
    return query.all()

@router.get("/{activity_id}", response_model=schemas.ActivityResponse)
def get_activity(activity_id: int, db: Session = Depends(get_db)):
    from fastapi import HTTPException
    act = db.query(models.Activity).filter(models.Activity.id == activity_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Activity not found")
    return act

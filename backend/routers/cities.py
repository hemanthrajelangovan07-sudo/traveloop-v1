from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from typing import List, Optional

router = APIRouter()

@router.get("/", response_model=List[schemas.CityResponse])
def search_cities(
    q: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.City)
    if q:
        query = query.filter(
            models.City.name.ilike(f"%{q}%") | models.City.country.ilike(f"%{q}%")
        )
    if region:
        query = query.filter(models.City.region.ilike(f"%{region}%"))
    return query.order_by(models.City.popularity.desc()).all()

@router.get("/{city_id}", response_model=schemas.CityResponse)
def get_city(city_id: int, db: Session = Depends(get_db)):
    city = db.query(models.City).filter(models.City.id == city_id).first()
    if not city:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="City not found")
    return city

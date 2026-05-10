from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# Auth schemas
class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    avatar: str
    language: str
    role: str
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# City schemas
class CityResponse(BaseModel):
    id: int
    name: str
    country: str
    region: str
    description: str
    image_url: str
    cost_index: float
    popularity: int
    avg_daily_cost: float
    timezone: str
    class Config:
        from_attributes = True

# Activity schemas
class ActivityResponse(BaseModel):
    id: int
    name: str
    description: str
    category: str
    cost: float
    duration_hours: float
    image_url: str
    city_id: int
    class Config:
        from_attributes = True

# Stop schemas
class StopActivityCreate(BaseModel):
    activity_id: int
    scheduled_time: Optional[str] = ""
    custom_cost: Optional[float] = None

class StopActivityResponse(BaseModel):
    id: int
    scheduled_time: str
    custom_cost: Optional[float]
    completed: bool
    activity: ActivityResponse
    class Config:
        from_attributes = True

class TripStopCreate(BaseModel):
    city_id: int
    arrival_date: str
    departure_date: str
    order: Optional[int] = 0
    accommodation_cost: Optional[float] = 0
    transport_cost: Optional[float] = 0
    meal_cost: Optional[float] = 0
    notes: Optional[str] = ""

class TripStopUpdate(BaseModel):
    arrival_date: Optional[str] = None
    departure_date: Optional[str] = None
    order: Optional[int] = None
    accommodation_cost: Optional[float] = None
    transport_cost: Optional[float] = None
    meal_cost: Optional[float] = None
    notes: Optional[str] = None

class TripStopResponse(BaseModel):
    id: int
    order: int
    arrival_date: str
    departure_date: str
    accommodation_cost: float
    transport_cost: float
    meal_cost: float
    notes: str
    city: CityResponse
    stop_activities: List[StopActivityResponse] = []
    class Config:
        from_attributes = True

# Trip schemas
class TripCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    cover_photo: Optional[str] = ""
    start_date: str
    end_date: str
    total_budget: Optional[float] = 0
    is_public: Optional[bool] = False

class TripUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    cover_photo: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    total_budget: Optional[float] = None
    is_public: Optional[bool] = None
    status: Optional[str] = None

class TripResponse(BaseModel):
    id: int
    title: str
    description: str
    cover_photo: str
    start_date: str
    end_date: str
    is_public: bool
    public_token: Optional[str]
    total_budget: float
    status: str
    owner_id: int
    created_at: datetime
    stops: List[TripStopResponse] = []
    class Config:
        from_attributes = True

# Checklist schemas
class ChecklistItemCreate(BaseModel):
    name: str
    category: Optional[str] = "general"

class ChecklistItemResponse(BaseModel):
    id: int
    name: str
    category: str
    is_packed: bool
    trip_id: int
    class Config:
        from_attributes = True

# Note schemas
class NoteCreate(BaseModel):
    title: Optional[str] = "Note"
    content: str
    stop_id: Optional[int] = None

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class NoteResponse(BaseModel):
    id: int
    title: str
    content: str
    stop_id: Optional[int]
    trip_id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# Profile update
class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    language: Optional[str] = None
    password: Optional[str] = None

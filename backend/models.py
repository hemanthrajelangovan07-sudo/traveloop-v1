from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base, SessionLocal
import enum
import hashlib

class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    avatar = Column(String, default="")
    language = Column(String, default="en")
    role = Column(String, default="user")
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    trips = relationship("Trip", back_populates="owner", cascade="all, delete-orphan")
    notes = relationship("TripNote", back_populates="owner")

class Trip(Base):
    __tablename__ = "trips"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    cover_photo = Column(String, default="")
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=False)
    is_public = Column(Boolean, default=False)
    public_token = Column(String, unique=True, index=True, nullable=True)
    total_budget = Column(Float, default=0.0)
    status = Column(String, default="planning")  # planning, ongoing, completed
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    owner = relationship("User", back_populates="trips")
    stops = relationship("TripStop", back_populates="trip", cascade="all, delete-orphan", order_by="TripStop.order")
    checklist_items = relationship("ChecklistItem", back_populates="trip", cascade="all, delete-orphan")
    notes = relationship("TripNote", back_populates="trip", cascade="all, delete-orphan")

class City(Base):
    __tablename__ = "cities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    country = Column(String, nullable=False)
    region = Column(String, default="")
    description = Column(Text, default="")
    image_url = Column(String, default="")
    cost_index = Column(Float, default=50.0)  # 1-100
    popularity = Column(Integer, default=50)  # 1-100
    avg_daily_cost = Column(Float, default=100.0)
    timezone = Column(String, default="UTC")
    activities = relationship("Activity", back_populates="city")
    stops = relationship("TripStop", back_populates="city")

class Activity(Base):
    __tablename__ = "activities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, default="")
    category = Column(String, default="sightseeing")  # sightseeing, food, adventure, culture, shopping
    cost = Column(Float, default=0.0)
    duration_hours = Column(Float, default=2.0)
    image_url = Column(String, default="")
    city_id = Column(Integer, ForeignKey("cities.id"))
    city = relationship("City", back_populates="activities")
    stop_activities = relationship("StopActivity", back_populates="activity")

class TripStop(Base):
    __tablename__ = "trip_stops"
    id = Column(Integer, primary_key=True, index=True)
    order = Column(Integer, default=0)
    arrival_date = Column(String, nullable=False)
    departure_date = Column(String, nullable=False)
    accommodation_cost = Column(Float, default=0.0)
    transport_cost = Column(Float, default=0.0)
    meal_cost = Column(Float, default=0.0)
    notes = Column(Text, default="")
    trip_id = Column(Integer, ForeignKey("trips.id"))
    city_id = Column(Integer, ForeignKey("cities.id"))
    trip = relationship("Trip", back_populates="stops")
    city = relationship("City", back_populates="stops")
    stop_activities = relationship("StopActivity", back_populates="stop", cascade="all, delete-orphan")

class StopActivity(Base):
    __tablename__ = "stop_activities"
    id = Column(Integer, primary_key=True, index=True)
    scheduled_time = Column(String, default="")
    custom_cost = Column(Float, nullable=True)
    completed = Column(Boolean, default=False)
    stop_id = Column(Integer, ForeignKey("trip_stops.id"))
    activity_id = Column(Integer, ForeignKey("activities.id"))
    stop = relationship("TripStop", back_populates="stop_activities")
    activity = relationship("Activity", back_populates="stop_activities")

class ChecklistItem(Base):
    __tablename__ = "checklist_items"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, default="general")  # clothing, documents, electronics, general
    is_packed = Column(Boolean, default=False)
    trip_id = Column(Integer, ForeignKey("trips.id"))
    trip = relationship("Trip", back_populates="checklist_items")

class TripNote(Base):
    __tablename__ = "trip_notes"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, default="Note")
    content = Column(Text, default="")
    stop_id = Column(Integer, ForeignKey("trip_stops.id"), nullable=True)
    trip_id = Column(Integer, ForeignKey("trips.id"))
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    trip = relationship("Trip", back_populates="notes")
    owner = relationship("User", back_populates="notes")


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def seed_data():
    db = SessionLocal()
    try:
        if db.query(City).count() > 0:
            return

        cities_data = [
            {"name": "Paris", "country": "France", "region": "Europe", "description": "The City of Light, known for the Eiffel Tower, world-class cuisine, and art.", "cost_index": 78, "popularity": 95, "avg_daily_cost": 180, "image_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400"},
            {"name": "Tokyo", "country": "Japan", "region": "Asia", "description": "A futuristic metropolis blending ancient tradition with cutting-edge technology.", "cost_index": 72, "popularity": 92, "avg_daily_cost": 160, "image_url": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400"},
            {"name": "New York", "country": "USA", "region": "North America", "description": "The city that never sleeps — iconic skyline, Broadway, and Central Park.", "cost_index": 88, "popularity": 94, "avg_daily_cost": 220, "image_url": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400"},
            {"name": "Barcelona", "country": "Spain", "region": "Europe", "description": "Vibrant coastal city with Gaudí architecture, beaches, and tapas culture.", "cost_index": 65, "popularity": 89, "avg_daily_cost": 140, "image_url": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400"},
            {"name": "Dubai", "country": "UAE", "region": "Middle East", "description": "Ultramodern city with luxury shopping, iconic skyscrapers, and desert adventures.", "cost_index": 80, "popularity": 88, "avg_daily_cost": 190, "image_url": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400"},
            {"name": "Bali", "country": "Indonesia", "region": "Asia", "description": "Tropical paradise with lush rice terraces, spiritual temples, and surf beaches.", "cost_index": 35, "popularity": 90, "avg_daily_cost": 75, "image_url": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400"},
            {"name": "Rome", "country": "Italy", "region": "Europe", "description": "The Eternal City — home to the Colosseum, Vatican, and extraordinary cuisine.", "cost_index": 70, "popularity": 91, "avg_daily_cost": 155, "image_url": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400"},
            {"name": "Bangkok", "country": "Thailand", "region": "Asia", "description": "A dynamic city of ornate shrines, vibrant street food, and bustling markets.", "cost_index": 30, "popularity": 87, "avg_daily_cost": 65, "image_url": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400"},
            {"name": "Sydney", "country": "Australia", "region": "Oceania", "description": "Harbor city famous for the Opera House, Bondi Beach, and laid-back lifestyle.", "cost_index": 82, "popularity": 86, "avg_daily_cost": 175, "image_url": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400"},
            {"name": "Istanbul", "country": "Turkey", "region": "Europe/Asia", "description": "Transcontinental city where East meets West — bazaars, mosques, and Bosphorus views.", "cost_index": 42, "popularity": 85, "avg_daily_cost": 90, "image_url": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400"},
            {"name": "Amsterdam", "country": "Netherlands", "region": "Europe", "description": "Canal-lined city of world-class museums, cycling culture, and tulip gardens.", "cost_index": 75, "popularity": 84, "avg_daily_cost": 165, "image_url": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400"},
            {"name": "Machu Picchu", "country": "Peru", "region": "South America", "description": "Ancient Incan citadel set high in the Andes — one of the world's great wonders.", "cost_index": 45, "popularity": 88, "avg_daily_cost": 95, "image_url": "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400"},
        ]

        city_objs = []
        for c in cities_data:
            city = City(**c)
            db.add(city)
            city_objs.append(city)
        db.flush()

        activities_data = [
            # Paris (city_id=1)
            {"name": "Eiffel Tower Visit", "description": "Iconic iron tower with stunning views of Paris.", "category": "sightseeing", "cost": 25, "duration_hours": 2, "city_id": city_objs[0].id},
            {"name": "Louvre Museum Tour", "description": "World's largest art museum housing the Mona Lisa.", "category": "culture", "cost": 17, "duration_hours": 4, "city_id": city_objs[0].id},
            {"name": "Seine River Cruise", "description": "Scenic boat tour along Paris's iconic river.", "category": "sightseeing", "cost": 15, "duration_hours": 1.5, "city_id": city_objs[0].id},
            {"name": "French Cooking Class", "description": "Learn to prepare classic French dishes with a chef.", "category": "food", "cost": 85, "duration_hours": 3, "city_id": city_objs[0].id},
            # Tokyo (city_id=2)
            {"name": "Shibuya Crossing", "description": "World's busiest pedestrian crossing — free to experience.", "category": "sightseeing", "cost": 0, "duration_hours": 1, "city_id": city_objs[1].id},
            {"name": "Tsukiji Fish Market Tour", "description": "Explore the famous seafood market and taste fresh sushi.", "category": "food", "cost": 30, "duration_hours": 2, "city_id": city_objs[1].id},
            {"name": "Mount Fuji Day Trip", "description": "Scenic day trip to Japan's iconic sacred mountain.", "category": "adventure", "cost": 80, "duration_hours": 10, "city_id": city_objs[1].id},
            {"name": "TeamLab Planets", "description": "Immersive digital art museum with stunning light installations.", "category": "culture", "cost": 32, "duration_hours": 2, "city_id": city_objs[1].id},
            # New York (city_id=3)
            {"name": "Statue of Liberty & Ellis Island", "description": "Ferry trip to the iconic symbol of freedom.", "category": "sightseeing", "cost": 24, "duration_hours": 4, "city_id": city_objs[2].id},
            {"name": "Broadway Show", "description": "World-class theatrical performance in the Theater District.", "category": "culture", "cost": 120, "duration_hours": 3, "city_id": city_objs[2].id},
            {"name": "Central Park Bike Tour", "description": "Guided cycling tour through NYC's famous green oasis.", "category": "adventure", "cost": 45, "duration_hours": 2.5, "city_id": city_objs[2].id},
            # Barcelona
            {"name": "Sagrada Família", "description": "Gaudí's unfinished masterpiece — a stunning basilica.", "category": "culture", "cost": 26, "duration_hours": 2, "city_id": city_objs[3].id},
            {"name": "Park Güell", "description": "Colorful mosaic park with panoramic city views.", "category": "sightseeing", "cost": 10, "duration_hours": 2, "city_id": city_objs[3].id},
            {"name": "Tapas & Wine Tour", "description": "Evening food tour exploring Barcelona's best tapas bars.", "category": "food", "cost": 70, "duration_hours": 3, "city_id": city_objs[3].id},
            # Dubai
            {"name": "Burj Khalifa Observation Deck", "description": "Views from the world's tallest building.", "category": "sightseeing", "cost": 35, "duration_hours": 1.5, "city_id": city_objs[4].id},
            {"name": "Desert Safari", "description": "Dune bashing, camel riding, and BBQ dinner under the stars.", "category": "adventure", "cost": 85, "duration_hours": 7, "city_id": city_objs[4].id},
            {"name": "Dubai Mall Shopping", "description": "Explore one of the world's largest shopping malls.", "category": "shopping", "cost": 0, "duration_hours": 3, "city_id": city_objs[4].id},
            # Bali
            {"name": "Ubud Monkey Forest", "description": "Nature sanctuary home to hundreds of Balinese long-tailed monkeys.", "category": "sightseeing", "cost": 5, "duration_hours": 2, "city_id": city_objs[5].id},
            {"name": "Tegalalang Rice Terraces", "description": "Iconic terraced rice fields with stunning valley views.", "category": "sightseeing", "cost": 3, "duration_hours": 2, "city_id": city_objs[5].id},
            {"name": "Surfing Lesson in Kuta", "description": "Beginner surfing lesson on Bali's famous beach.", "category": "adventure", "cost": 25, "duration_hours": 2, "city_id": city_objs[5].id},
            # Rome
            {"name": "Colosseum & Roman Forum", "description": "Guided tour of ancient Rome's most iconic ruins.", "category": "culture", "cost": 18, "duration_hours": 3, "city_id": city_objs[6].id},
            {"name": "Vatican Museums & Sistine Chapel", "description": "Tour the Pope's museums and Michelangelo's ceiling.", "category": "culture", "cost": 21, "duration_hours": 3, "city_id": city_objs[6].id},
            {"name": "Food Tour in Trastevere", "description": "Evening food stroll through Rome's charming neighborhood.", "category": "food", "cost": 55, "duration_hours": 3, "city_id": city_objs[6].id},
            # Bangkok
            {"name": "Grand Palace & Wat Phra Kaew", "description": "Thailand's most sacred temple and former royal residence.", "category": "culture", "cost": 15, "duration_hours": 3, "city_id": city_objs[7].id},
            {"name": "Floating Market Day Trip", "description": "Boat ride through colorful floating markets.", "category": "food", "cost": 40, "duration_hours": 5, "city_id": city_objs[7].id},
            {"name": "Muay Thai Live Show", "description": "Experience Thailand's national martial art live.", "category": "culture", "cost": 45, "duration_hours": 2, "city_id": city_objs[7].id},
        ]

        for a in activities_data:
            db.add(Activity(**a))

        # Seed admin user
        if db.query(User).filter(User.email == "admin@traveloop.com").first() is None:
            admin_user = User(
                name="Admin",
                email="admin@traveloop.com",
                hashed_password=hash_password("admin123"),
                role="admin"
            )
            db.add(admin_user)

        # Seed demo user
        if db.query(User).filter(User.email == "demo@traveloop.com").first() is None:
            demo_user = User(
                name="Alex Traveler",
                email="demo@traveloop.com",
                hashed_password=hash_password("demo123"),
                role="user"
            )
            db.add(demo_user)

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Seed error: {e}")
    finally:
        db.close()

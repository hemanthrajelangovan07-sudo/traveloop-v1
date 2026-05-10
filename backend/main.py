from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import os

from database import engine, Base
import models
from routers import auth, trips, cities, activities, budget, checklist, notes, profile, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    models.seed_data()
    yield

app = FastAPI(title="Traveloop API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(trips.router, prefix="/api/trips", tags=["trips"])
app.include_router(cities.router, prefix="/api/cities", tags=["cities"])
app.include_router(activities.router, prefix="/api/activities", tags=["activities"])
app.include_router(budget.router, prefix="/api/budget", tags=["budget"])
app.include_router(checklist.router, prefix="/api/checklist", tags=["checklist"])
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.exists(frontend_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_path, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        index_path = os.path.join(frontend_path, "index.html")
        return FileResponse(index_path)

@app.get("/api/health")
async def health():
    return {"status": "ok", "app": "Traveloop"}

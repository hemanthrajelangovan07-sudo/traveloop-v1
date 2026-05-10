# Traveloop – Personalized Travel Planning Made Easy

Traveloop is an intelligent, collaborative platform that transforms the way individuals plan and experience travel. Empowering users to dream, design, and organize trips with ease, Traveloop offers an end-to-end travel planning tool that combines flexibility, interactivity, and budget management.

## 🌟 Key Features

1.  **Dashboard / Home Screen**: Central hub for upcoming trips, popular destinations, and quick actions.
2.  **Create Trip**: Easily initiate new journeys with names, dates, and descriptions.
3.  **My Trips**: Manage and view all your planned and past itineraries.
4.  **Itinerary Builder**: Interactive interface to add cities, dates, and day-wise activities.
5.  **Itinerary View**: Structured timeline and day-by-day breakdown of your trip.
6.  **City & Activity Search**: Discover global destinations and curated things to do.
7.  **Trip Budget & Cost Breakdown**: Automated financial tracking with visual charts and over-budget alerts.
8.  **Packing Checklist**: Organized per-trip checklists to ensure nothing is forgotten.
9.  **Trip Notes / Journal**: Quick reminders and notes for check-in info or local contacts.
10. **Shared Itineraries**: Generate public URLs to share your travel plans with friends or the community.
11. **Admin Dashboard**: Analytics on user trends, popular cities, and platform usage.

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), React Router, Axios, Lucide React (Icons), Recharts (Analytics), React Hot Toast (Notifications).
*   **Backend**: FastAPI (Python), SQLAlchemy (ORM), Pydantic (Validation), JWT (Authentication).
*   **Database**: SQLite (Relational database for storing itineraries, activities, and user data).
*   **Styling**: Modern Vanilla CSS with a focus on Glassmorphism and high-fidelity aesthetics.

## 📂 Project Structure

```text
traveloop/
├── backend/            # FastAPI Backend
│   ├── main.py         # Entry point
│   ├── models.py       # SQL Alchemy Models
│   ├── schemas.py      # Pydantic Models
│   ├── database.py     # DB Configuration
│   └── routers/        # API Endpoints
├── frontend/           # React Frontend
│   ├── src/
│   │   ├── pages/      # All App Screens
│   │   ├── components/ # Shared Layouts
│   │   └── api.js      # Axios Setup
│   └── index.css       # Global Design System
└── traveloop.db        # SQLite Database (generated on run)
```

## 🚀 Getting Started

### Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Start the FastAPI server:
    ```bash
    uvicorn main:app --reload
    ```
    The API will be available at `http://localhost:8000`.

### Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## 🔐 Credentials

*   **Demo User**: `demo@traveloop.com` / `demo123`
*   **Admin User**: `admin@traveloop.com` / `admin123`

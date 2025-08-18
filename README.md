ary th# ResQMate

A full-stack emergency response platform with real-time SOS alerts, volunteer coordination, donation management, and chat. Backend built with Django + DRF + Channels (ASGI). Frontend built with React (CRA) + Tailwind.

## Project Structure

```
resqmate_backend/     # Django + DRF + Channels backend
resqmate_frontend/    # React frontend (CRA)
```

## Backend (Django + Channels)

### Requirements
- Python 3.12+
- Virtualenv (recommended)

### Setup
```
cd resqmate_backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
```

Optionally seed demo data (users + sample SOS/donations):
```
python manage.py seed_demo
```

### Run (ASGI server)
Use Daphne to serve HTTP + WebSockets:
```
venv\Scripts\python -m daphne -b 0.0.0.0 -p 8000 resqmate_backend.asgi:application
```

Media uploads (avatars, images) are served during development via Django when DEBUG=True.

## Frontend (React)

### Requirements
- Node 18+

### Setup & Run
```
cd resqmate_frontend
npm install
npm start
```
The app runs at http://localhost:3000 and expects backend at http://localhost:8000.

## Auth test accounts (after seeding)
- Victim: username `devpriya`, password `devpriya71`
- Volunteer: username `priya`, password `priya11`

## Features
- Realtime WebSockets:
  - Alerts feed (new SOS/donation, volunteer assigned)
  - Chat room with online users
- SOS Alerts:
  - Create alerts (title, description, type, severity, optional image, coordinates)
  - Multi-volunteer assignment, resolved flag, update severity
- Donations:
  - Create donation items and assign pickup volunteer
- Dashboard:
  - Live stats, recent alerts/donations with recency filters
- Volunteer Hub:
  - Assign volunteers, chat, and live map (Leaflet)
- Profile:
  - View/update email, role, avatar (multipart)

## Environment
- CORS enabled for development
- Token authentication (DRF Authtoken)
- Channels with InMemoryChannelLayer by default

## GitHub
Initialize repo and push:
```
# from project root
git init
git add .
git commit -m "Initial commit: ResQMate full-stack app"
# create a repo on GitHub then add remote
git remote add origin https://github.com/<your-username>/resqmate.git
git branch -M main
git push -u origin main
```

## Notes
- Always run backend with an ASGI server (Daphne/Uvicorn) so WebSockets work.
- If avatars don’t refresh, ensure PATCH is used and the frontend appends a cache-busting param (implemented).
- Update SOS type choices on backend if you expand types beyond medical/fire/other.

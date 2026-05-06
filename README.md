# GeoPhoto

Upload photos, extract GPS coordinates from EXIF data, and display them on an interactive map.

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI + SQLAlchemy + PostgreSQL |
| Frontend | React 18 + Vite + Tailwind CSS + React-Leaflet |
| Auth | JWT via HttpOnly cookies |
| Storage | Docker volume (images resized + thumbnails generated on upload) |
| Proxy | Nginx |

## Project Structure

```
geophoto/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   ├── models/        # SQLAlchemy models
│   │   ├── routers/       # auth, photos
│   │   ├── schemas/       # Pydantic schemas
│   │   └── services/      # EXIF extraction, auth helpers
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # Map, Upload, UI
│   │   ├── context/       # AuthContext
│   │   ├── pages/         # Login, Register, Dashboard
│   │   └── services/      # axios wrapper
│   ├── Dockerfile
│   └── package.json
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
└── .env.example
```

## Quick Start

### With Docker Compose (recommended)

```bash
# 1. Copy and edit environment variables
cp .env.example .env

# 2. Build and start all services
docker compose up --build

# 3. Open http://localhost
```

### Local Development

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Set DATABASE_URL to a local Postgres instance
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/geophoto
export SECRET_KEY=local-dev-secret

uvicorn app.main:app --reload
# API available at http://localhost:8000
# Docs at http://localhost:8000/docs
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Available at http://localhost:3000
# Proxies /api → http://localhost:8000
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login, sets HttpOnly cookie |
| POST | `/api/auth/logout` | — | Clear cookie |
| GET | `/api/auth/me` | ✓ | Current user |
| POST | `/api/photos/upload` | ✓ | Upload one or more photos |
| GET | `/api/photos/` | ✓ | List photos (paginated) |
| GET | `/api/photos/{id}` | ✓ | Photo metadata |
| PATCH | `/api/photos/{id}/coordinates` | ✓ | Set/update GPS |
| DELETE | `/api/photos/{id}` | ✓ | Delete photo + files |
| GET | `/api/photos/{id}/file` | ✓ | Serve full image |
| GET | `/api/photos/{id}/thumbnail` | ✓ | Serve thumbnail |

## Features

- **Batch upload** — drag & drop multiple photos at once
- **EXIF extraction** — GPS coordinates and capture date read automatically
- **Location picker** — click on an embedded map to set coordinates when EXIF is missing
- **Interactive map** — photo thumbnails as map markers; click to expand details
- **Image processing** — resized to max 1920 px, thumbnails at 300 px, EXIF orientation corrected
- **Pagination** — load-more grid in the sidebar
- **JWT auth** — HttpOnly cookie, 7-day expiry

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | `geophoto` | DB username |
| `POSTGRES_PASSWORD` | `geophoto` | DB password |
| `POSTGRES_DB` | `geophoto` | DB name |
| `SECRET_KEY` | (insecure default) | JWT signing key — **change in production** |

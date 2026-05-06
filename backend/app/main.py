import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

# Import models so SQLAlchemy registers them before create_all
from .models import user, photo  # noqa: F401
from .database import engine, Base
from .routers import auth, photos


def create_tables(retries: int = 10, delay: float = 2.0):
    for attempt in range(retries):
        try:
            Base.metadata.create_all(bind=engine)
            return
        except OperationalError:
            if attempt == retries - 1:
                raise
            time.sleep(delay)


create_tables()

app = FastAPI(title="GeoPhoto API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(photos.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}

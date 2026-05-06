from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PhotoOut(BaseModel):
    id: int
    user_id: int
    filename: str
    original_filename: str
    latitude: Optional[float]
    longitude: Optional[float]
    taken_at: Optional[datetime]
    uploaded_at: datetime
    file_size: int

    model_config = {"from_attributes": True}


class PhotoCoordinatesUpdate(BaseModel):
    latitude: float
    longitude: float


class PhotosPage(BaseModel):
    items: list[PhotoOut]
    total: int
    page: int
    per_page: int

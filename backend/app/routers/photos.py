from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import uuid
import os
from ..database import get_db
from ..models.photo import Photo
from ..schemas.photo import PhotoOut, PhotoCoordinatesUpdate, PhotosPage
from ..services.exif_service import extract_metadata, process_image
from ..dependencies import get_current_user
from ..models.user import User
from ..config import settings

router = APIRouter(prefix="/photos", tags=["photos"])

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/tiff",
    "image/heic",
    "image/heif",
}


@router.post("/upload", response_model=List[PhotoOut])
async def upload_photos(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "thumbs"), exist_ok=True)

    results = []
    for file in files:
        if file.content_type not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {file.content_type}",
            )

        image_bytes = await file.read()
        metadata = extract_metadata(image_bytes)
        main_bytes, thumb_bytes = process_image(
            image_bytes, settings.MAX_IMAGE_SIZE, settings.THUMBNAIL_SIZE
        )

        file_id = str(uuid.uuid4())
        filename = f"{file_id}.jpg"

        with open(os.path.join(settings.UPLOAD_DIR, filename), "wb") as f:
            f.write(main_bytes)
        with open(os.path.join(settings.UPLOAD_DIR, "thumbs", filename), "wb") as f:
            f.write(thumb_bytes)

        photo = Photo(
            user_id=current_user.id,
            filename=filename,
            original_filename=file.filename or filename,
            latitude=metadata["latitude"],
            longitude=metadata["longitude"],
            taken_at=metadata["taken_at"],
            file_size=len(main_bytes),
        )
        db.add(photo)
        db.flush()
        results.append(photo)

    db.commit()
    for photo in results:
        db.refresh(photo)
    return results


@router.get("/", response_model=PhotosPage)
def list_photos(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Photo).filter(Photo.user_id == current_user.id)
    total = query.count()
    photos = (
        query.order_by(Photo.uploaded_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    return PhotosPage(items=photos, total=total, page=page, per_page=per_page)


@router.get("/{photo_id}", response_model=PhotoOut)
def get_photo(
    photo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    photo = (
        db.query(Photo)
        .filter(Photo.id == photo_id, Photo.user_id == current_user.id)
        .first()
    )
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    return photo


@router.patch("/{photo_id}/coordinates", response_model=PhotoOut)
def update_coordinates(
    photo_id: int,
    coords: PhotoCoordinatesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    photo = (
        db.query(Photo)
        .filter(Photo.id == photo_id, Photo.user_id == current_user.id)
        .first()
    )
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    photo.latitude = coords.latitude
    photo.longitude = coords.longitude
    db.commit()
    db.refresh(photo)
    return photo


@router.delete("/{photo_id}", status_code=204)
def delete_photo(
    photo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    photo = (
        db.query(Photo)
        .filter(Photo.id == photo_id, Photo.user_id == current_user.id)
        .first()
    )
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    for path in [
        os.path.join(settings.UPLOAD_DIR, photo.filename),
        os.path.join(settings.UPLOAD_DIR, "thumbs", photo.filename),
    ]:
        if os.path.exists(path):
            os.remove(path)

    db.delete(photo)
    db.commit()


@router.get("/{photo_id}/file")
def serve_photo(
    photo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    photo = (
        db.query(Photo)
        .filter(Photo.id == photo_id, Photo.user_id == current_user.id)
        .first()
    )
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    path = os.path.join(settings.UPLOAD_DIR, photo.filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    return FileResponse(path, media_type="image/jpeg")


@router.get("/{photo_id}/thumbnail")
def serve_thumbnail(
    photo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    photo = (
        db.query(Photo)
        .filter(Photo.id == photo_id, Photo.user_id == current_user.id)
        .first()
    )
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    thumb_path = os.path.join(settings.UPLOAD_DIR, "thumbs", photo.filename)
    path = thumb_path if os.path.exists(thumb_path) else os.path.join(settings.UPLOAD_DIR, photo.filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    return FileResponse(path, media_type="image/jpeg")

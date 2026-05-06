from PIL import Image, ImageOps
from PIL.ExifTags import TAGS, GPSTAGS
from datetime import datetime
from typing import Tuple
import io


def _convert_to_degrees(value) -> float:
    d, m, s = float(value[0]), float(value[1]), float(value[2])
    return d + (m / 60.0) + (s / 3600.0)


def extract_metadata(image_bytes: bytes) -> dict:
    result = {"latitude": None, "longitude": None, "taken_at": None}
    try:
        img = Image.open(io.BytesIO(image_bytes))
        exif_data = img._getexif() if hasattr(img, "_getexif") else None
        if not exif_data:
            return result

        gps_info: dict = {}
        for tag_id, value in exif_data.items():
            tag = TAGS.get(tag_id, tag_id)
            if tag == "GPSInfo" and isinstance(value, dict):
                for gps_tag_id, gps_value in value.items():
                    gps_info[GPSTAGS.get(gps_tag_id, gps_tag_id)] = gps_value
            elif tag == "DateTimeOriginal":
                try:
                    result["taken_at"] = datetime.strptime(str(value), "%Y:%m:%d %H:%M:%S")
                except ValueError:
                    pass

        if "GPSLatitude" in gps_info and "GPSLongitude" in gps_info:
            lat = _convert_to_degrees(gps_info["GPSLatitude"])
            lon = _convert_to_degrees(gps_info["GPSLongitude"])
            if gps_info.get("GPSLatitudeRef") == "S":
                lat = -lat
            if gps_info.get("GPSLongitudeRef") == "W":
                lon = -lon
            result["latitude"] = round(lat, 8)
            result["longitude"] = round(lon, 8)
    except Exception:
        pass
    return result


def process_image(image_bytes: bytes, max_size: int, thumb_size: int) -> Tuple[bytes, bytes]:
    """Resize image and generate thumbnail. Strips EXIF on output."""
    img = Image.open(io.BytesIO(image_bytes))
    # Auto-rotate based on EXIF orientation
    img = ImageOps.exif_transpose(img)

    if img.mode in ("RGBA", "P", "LA"):
        img = img.convert("RGB")

    img.thumbnail((max_size, max_size), Image.LANCZOS)

    main_buf = io.BytesIO()
    img.save(main_buf, "JPEG", quality=85, optimize=True)

    thumb = img.copy()
    thumb.thumbnail((thumb_size, thumb_size), Image.LANCZOS)
    thumb_buf = io.BytesIO()
    thumb.save(thumb_buf, "JPEG", quality=75, optimize=True)

    return main_buf.getvalue(), thumb_buf.getvalue()

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://geophoto:geophoto@postgres:5432/geophoto"
    SECRET_KEY: str = "changeme-secret-key-replace-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    UPLOAD_DIR: str = "/app/uploads"
    MAX_IMAGE_SIZE: int = 1920  # max width/height in pixels
    THUMBNAIL_SIZE: int = 300

    class Config:
        env_file = ".env"


settings = Settings()

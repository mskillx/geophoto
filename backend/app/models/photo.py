from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)           # stored UUID filename
    original_filename = Column(String(255), nullable=False)  # original upload name
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    taken_at = Column(DateTime(timezone=True), nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    file_size = Column(BigInteger, nullable=False, default=0)

    owner = relationship("User", back_populates="photos")

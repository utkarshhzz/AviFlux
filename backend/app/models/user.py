from sqlalchemy import Boolean, Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    pilot_license = Column(String, nullable=True)
    company = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class FlightHistory(Base):
    __tablename__ = "flight_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    departure_airport = Column(String, nullable=False)
    arrival_airport = Column(String, nullable=False)
    route_airports = Column(Text, nullable=True)  # JSON string for multi-airport routes
    briefing_data = Column(Text, nullable=True)  # JSON string
    flight_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
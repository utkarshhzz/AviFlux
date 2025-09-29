from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class WeatherRequest(BaseModel):
    airport_code: str

class WeatherResponse(BaseModel):
    airport_code: str
    timestamp: str
    weather_data: Dict[str, Any]
    success: bool

class BriefingRequest(BaseModel):
    airports: List[str]
    detail_level: str = "summary"

class BriefingResponse(BaseModel):
    airports: List[str]
    detail_level: str
    briefing: Dict[str, Any]
    generated_at: str
    success: bool

class FlightPlanRequest(BaseModel):
    airports: List[str]
    aircraft_type: Optional[str] = None

class FlightPlanResponse(BaseModel):
    departure: str
    arrival: str
    route_forecast: Dict[str, Any]
    alternative_routes: List[Dict[str, Any]]
    analysis_timestamp: str
    success: bool

class MonitoringRequest(BaseModel):
    departure: str
    arrival: str
    aircraft_type: Optional[str] = None

class MonitoringResponse(BaseModel):
    flight_id: str
    monitoring_status: Dict[str, Any]
    started_at: str
    success: bool

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None
    pilot_license: Optional[str] = None
    company: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    pilot_license: Optional[str]
    company: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True
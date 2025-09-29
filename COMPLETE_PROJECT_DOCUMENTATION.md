# AviFlux Aviation Weather Platform - Complete Technical Documentation

## Project Overview

AviFlux is an advanced aviation weather intelligence platform that combines real-time weather data, machine learning predictions, and live flight tracking to provide comprehensive flight planning and safety analysis. The system is designed for pilots, flight dispatchers, and aviation professionals who need accurate weather forecasting and flight decision support.

## Architecture Overview

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │  External APIs  │
│   React + TS    │◄──►│   FastAPI       │◄──►│  OpenSky        │
│   Port: 5175    │    │   Port: 8003    │    │  Weather APIs   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Static Assets  │    │  ML Models      │    │  Airport Data   │
│  Maps, Icons    │    │  7 Predictors   │    │  83,648 Records │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend Stack
- **Framework**: React 19.1.1 with TypeScript
- **Build Tool**: Vite 6.0.0 (Fast, modern build tool)
- **Styling**: Tailwind CSS 4.1.13 (Utility-first CSS framework)
- **Routing**: React Router DOM 7.9.2
- **Maps**: Leaflet 1.9.4 + React-Leaflet 5.0.0
- **Charts**: Recharts 3.2.1 (For weather data visualization)
- **UI Components**: Radix UI (Accessible component library)
- **State Management**: React Hooks + Context API

#### Backend Stack
- **Framework**: FastAPI (High-performance async web framework)
- **Server**: Uvicorn (ASGI server)
- **Language**: Python 3.8+
- **Data Processing**: Pandas, NumPy
- **Machine Learning**: Scikit-learn, Joblib
- **Geospatial**: PyProj (Coordinate transformations)
- **Authentication**: PyJWT, Passlib
- **HTTP Client**: aiohttp (For external API calls)

## Data Sources and APIs

### 1. Weather Data Sources

#### Primary Weather API
- **Source**: Multiple meteorological services
- **Endpoints**: 
  - Current conditions: `/weather/current/{icao_code}`
  - Forecasts: `/weather/forecast/{icao_code}`
  - Historical: `/weather/historical/{icao_code}`
- **Data Points**:
  - Temperature (°C, °F)
  - Wind Speed & Direction (knots, degrees)
  - Atmospheric Pressure (hPa, inHg)
  - Visibility (km, miles)
  - Cloud Coverage (oktas)
  - Precipitation (mm/hr)
  - Turbulence Index
  - Icing Conditions

#### Weather Data Processing Pipeline
```python
# Backend: aviflux_ultimate_backend.py
async def get_weather_data(icao_code: str):
    """
    Fetches and processes weather data for given airport
    
    Flow:
    1. Validate ICAO code format
    2. Query multiple weather APIs
    3. Normalize data units
    4. Apply ML predictions
    5. Generate risk assessments
    6. Return structured response
    """
```

### 2. Live Flight Data

#### OpenSky Network API
- **Base URL**: `https://opensky-network.org/api`
- **Endpoints Used**:
  - `/states/all` - All current flights
  - `/states/own` - User's tracked flights
- **Update Frequency**: Every 10 seconds
- **Coverage**: Global flight tracking
- **Data Points**:
  - Aircraft position (lat/lon/altitude)
  - Velocity (ground speed, vertical rate)
  - Aircraft identification (callsign, ICAO24)
  - Flight path and heading
  - Transponder data

#### Flight Data Implementation
```typescript
// Frontend: src/components/LiveTrackingSystem.tsx
const fetchLiveFlights = async (): Promise<FlightData[]> => {
  try {
    // Fetch from OpenSky Network API
    const response = await fetch('https://opensky-network.org/api/states/all');
    const data = await response.json();
    
    // Process raw flight data
    return data.states?.map((state: any[]) => ({
      icao24: state[0],        // Aircraft identifier
      callsign: state[1],      // Flight callsign
      latitude: state[6],      // Current latitude
      longitude: state[5],     // Current longitude
      altitude: state[7],      // Barometric altitude (meters)
      velocity: state[9],      // Velocity over ground (m/s)
      heading: state[10],      // True track (degrees)
      verticalRate: state[11], // Vertical rate (m/s)
      onGround: state[8],      // On ground status
      lastUpdate: state[4]     // Last position update
    })) || [];
  } catch (error) {
    // Fallback to demo data if API unavailable
    console.error('OpenSky API error:', error);
    return getDemoFlights();
  }
};
```

### 3. Airport Database

#### Airport Data Structure
- **Source**: `src/data/airports.ts`
- **Records**: 83,648 global airports
- **Key Fields**:
  - ICAO Code (4-letter international identifier)
  - IATA Code (3-letter commercial identifier)
  - Airport Name
  - City, Country
  - Coordinates (lat/lon)
  - Elevation (feet/meters)
  - Timezone
  - Runway information

#### Airport Search Implementation
```typescript
// Frontend: src/data/airports.ts
export const findAirport = (code: string): Airport | null => {
  const upperCode = code.toUpperCase();
  
  // Search by ICAO code (primary)
  const byIcao = AIRPORTS[upperCode];
  if (byIcao) return { ...byIcao, code: upperCode };
  
  // Search by IATA code (fallback)
  const byIata = Object.entries(AIRPORTS).find(([_, airport]) => 
    airport.iata === upperCode
  );
  
  return byIata ? { ...byIata[1], code: byIata[0] } : null;
};
```

## Machine Learning Integration

### ML Model Architecture

#### 7 Specialized Prediction Models
1. **Temperature Predictor** (`temperature_predictor.joblib`)
   - Predicts temperature variations along flight route
   - Input: Position, time, historical data
   - Output: Temperature forecast (°C)

2. **Wind Speed Predictor** (`wind_speed_predictor.joblib`)
   - Forecasts wind conditions
   - Critical for fuel planning and flight time estimation
   - Output: Wind speed (knots)

3. **Wind Direction Predictor** (`wind_direction_predictor.joblib`)
   - Predicts wind direction changes
   - Important for runway selection and approach planning
   - Output: Wind direction (degrees)

4. **Pressure Predictor** (`pressure_predictor.joblib`)
   - Atmospheric pressure forecasting
   - Critical for altimeter settings and aircraft performance
   - Output: Pressure (hPa)

5. **Turbulence Predictor** (`turbulence_predictor.joblib`)
   - Turbulence intensity forecasting
   - Key safety parameter for flight planning
   - Output: Turbulence index (0-10 scale)

6. **Icing Predictor** (`icing_predictor.joblib`)
   - Aircraft icing condition predictions
   - Critical safety parameter for flight levels
   - Output: Icing probability (0-1 scale)

7. **Weather Classifier** (`weather_classifier.joblib`)
   - Overall weather pattern classification
   - Combines multiple parameters for general conditions
   - Output: Weather category (Clear/Cloudy/Storm/Severe)

### ML Data Pipeline

#### Historical Weather Dataset
- **File**: `historical_weather_data_2024.csv`
- **Records**: 961,881 historical weather observations
- **Time Range**: Full year 2024
- **Geographic Coverage**: Global
- **Update Frequency**: Daily batch processing

#### Feature Engineering
```python
# Backend: ML model training pipeline
class WeatherFeatureEngineering:
    def __init__(self):
        self.feature_scaler = joblib.load('feature_scaler.joblib')
        self.target_scalers = {
            'temperature': joblib.load('target_scaler_temperature.joblib'),
            'wind_speed': joblib.load('target_scaler_wind_speed.joblib'),
            'pressure': joblib.load('target_scaler_pressure.joblib'),
            # ... other scalers
        }
    
    def prepare_features(self, weather_data):
        """
        Converts raw weather data into ML-ready features
        - Temporal features (hour, day, season)
        - Geospatial features (lat, lon, elevation)  
        - Meteorological features (pressure trends, wind patterns)
        """
        features = []
        # Feature extraction logic
        return self.feature_scaler.transform(features)
```

### Risk Assessment System

#### Flight Risk Calculation
```python
# Backend: Flight safety risk assessment
def calculate_flight_risk(predictions: dict) -> dict:
    """
    Combines all ML predictions into unified risk assessment
    
    Risk Factors:
    - Weather severity (40% weight)
    - Turbulence level (25% weight) 
    - Icing conditions (20% weight)
    - Visibility (15% weight)
    
    Output: Risk score 0-100 (GREEN/YELLOW/RED)
    """
    weather_risk = predictions['weather_severity'] * 0.4
    turbulence_risk = predictions['turbulence'] * 0.25
    icing_risk = predictions['icing'] * 0.2
    visibility_risk = (1 - predictions['visibility']) * 0.15
    
    total_risk = (weather_risk + turbulence_risk + 
                  icing_risk + visibility_risk) * 100
    
    return {
        'risk_score': min(100, max(0, total_risk)),
        'risk_level': 'GREEN' if total_risk < 30 else 
                     'YELLOW' if total_risk < 70 else 'RED',
        'contributing_factors': {
            'weather': weather_risk,
            'turbulence': turbulence_risk, 
            'icing': icing_risk,
            'visibility': visibility_risk
        }
    }
```

## API Endpoints Documentation

### Backend API Structure

#### Authentication Endpoints
- `POST /auth/login` - User authentication
- `POST /auth/register` - New user registration  
- `GET /auth/validate` - Token validation

#### Weather Endpoints
- `GET /weather/{icao_code}` - Current weather for airport
- `GET /weather/forecast/{icao_code}` - Weather forecast
- `GET /weather/route` - Weather along flight route

#### Flight Planning Endpoints
- `POST /flight/plan` - Generate flight plan
- `GET /flight/briefing` - Get flight briefing with ML analysis
- `POST /flight/route/analyze` - Analyze route weather

#### Airport Information
- `GET /airports/search/{query}` - Search airports
- `GET /airports/{icao_code}` - Airport details

### API Implementation Examples

#### Flight Briefing Endpoint
```python
# Backend: aviflux_ultimate_backend.py
@app.post("/api/flight/briefing")
async def generate_flight_briefing(request: FlightBriefingRequest):
    """
    Generates comprehensive flight briefing with ML predictions
    
    Input: Origin, destination, departure time, aircraft type
    Output: Weather analysis, risk assessment, recommendations
    """
    try:
        # 1. Validate airports
        origin = await get_airport_info(request.origin)
        destination = await get_airport_info(request.destination) 
        
        # 2. Get weather data for both airports
        origin_weather = await get_weather_data(request.origin)
        dest_weather = await get_weather_data(request.destination)
        
        # 3. Calculate route weather
        route_weather = await get_route_weather(
            origin.coordinates, 
            destination.coordinates,
            request.departure_time
        )
        
        # 4. Apply ML predictions
        ml_predictions = await apply_ml_models(route_weather)
        
        # 5. Calculate risk assessment
        risk_assessment = calculate_flight_risk(ml_predictions)
        
        # 6. Generate recommendations
        recommendations = generate_flight_recommendations(
            risk_assessment, 
            ml_predictions,
            request.aircraft_type
        )
        
        return {
            "flight_id": generate_flight_id(),
            "origin": origin,
            "destination": destination,
            "weather_analysis": {
                "origin": origin_weather,
                "destination": dest_weather,
                "route": route_weather
            },
            "ml_predictions": ml_predictions,
            "risk_assessment": risk_assessment,
            "recommendations": recommendations,
            "generated_at": datetime.utcnow()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## Frontend Component Architecture

### Component Hierarchy
```
App.tsx
├── Router Setup
├── AuthProvider (Context)
├── ThemeProvider (Context)
└── Pages
    ├── HomePage
    │   ├── Hero.tsx (Route selection)
    │   ├── LiveTrackingSystem.tsx
    │   └── Features.tsx
    ├── PlanPage
    │   ├── RouteInput.tsx
    │   ├── WeatherMap.tsx
    │   ├── FlightDecisionSummary.tsx
    │   └── RouteAnalysis.tsx
    └── AuthPages
        ├── LoginPage.tsx
        └── RegisterPage.tsx
```

### Key Component Details

#### LiveTrackingSystem.tsx
```typescript
// Real-time flight tracking with OpenSky API integration
interface FlightData {
  icao24: string;          // Aircraft unique identifier
  callsign: string;        // Flight callsign (e.g., "UAL123")
  latitude: number;        // Current latitude
  longitude: number;       // Current longitude  
  altitude: number;        // Altitude in meters
  velocity: number;        // Ground speed in m/s
  heading: number;         // True heading in degrees
  verticalRate: number;    // Climb/descent rate in m/s
  onGround: boolean;       // Ground status
  lastUpdate: number;      // Last position update timestamp
}

const LiveTrackingSystem: React.FC = () => {
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Update flights every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchLiveFlights, 10000);
    return () => clearInterval(interval);
  }, []);
  
  // Filter flights based on selected route
  const filteredFlights = useMemo(() => {
    if (!selectedRoute) return flights;
    
    const [origin, destination] = parseRoute(selectedRoute);
    return flights.filter(flight => 
      isFlightOnRoute(flight, origin, destination)
    );
  }, [flights, selectedRoute]);
  
  return (
    <div className="live-tracking-system">
      <RouteSelector onRouteChange={setSelectedRoute} />
      <FlightMap flights={filteredFlights} />
      <FlightList flights={filteredFlights} />
    </div>
  );
};
```

#### FlightDecisionSummary.tsx
```typescript
// ML model output parser and flight decision support
interface MLPredictions {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  turbulence: number;
  icing: number;
  weatherCategory: string;
}

interface RiskAssessment {
  riskScore: number;        // 0-100 scale
  riskLevel: 'GREEN' | 'YELLOW' | 'RED';
  contributingFactors: {
    weather: number;
    turbulence: number;
    icing: number;
    visibility: number;
  };
}

const FlightDecisionSummary: React.FC<Props> = ({ briefingData }) => {
  const parseMLOutput = (rawOutput: string): MLPredictions => {
    // Extract ML predictions from backend response
    const riskMatch = rawOutput.match(/Risk Level: (\d+)\/100 \((\w+)\)/);
    const weatherMatch = rawOutput.match(/Weather: ([\w\s]+)/);
    
    return {
      riskScore: riskMatch ? parseInt(riskMatch[1]) : 0,
      riskLevel: riskMatch ? riskMatch[2] as RiskLevel : 'GREEN',
      weatherCategory: weatherMatch ? weatherMatch[1] : 'Unknown'
    };
  };
  
  const generateRecommendations = (risk: RiskAssessment): string[] => {
    const recommendations: string[] = [];
    
    if (risk.riskLevel === 'RED') {
      recommendations.push('Consider delaying flight until conditions improve');
      recommendations.push('File alternate airports in flight plan');
    } else if (risk.riskLevel === 'YELLOW') {
      recommendations.push('Monitor weather closely before departure');
      recommendations.push('Brief crew on expected turbulence');
    }
    
    if (risk.contributingFactors.icing > 0.3) {
      recommendations.push('Ensure anti-ice systems are operational');
    }
    
    return recommendations;
  };
  
  return (
    <div className="flight-decision-summary">
      <RiskIndicator level={riskAssessment.riskLevel} />
      <WeatherSummary predictions={mlPredictions} />
      <RecommendationsList recommendations={recommendations} />
    </div>
  );
};
```

## Database and Storage

### Data Storage Strategy

#### Local Storage (Development)
- Configuration files (`.env`)
- ML model files (`.joblib`, `.pkl`)
- Historical weather data (CSV)
- Airport database (TypeScript constants)

#### Production Storage (Deployment)
- **Database**: PostgreSQL (via Render)
- **File Storage**: Static assets via CDN
- **Model Storage**: Cloud storage for ML models
- **Caching**: Redis for API response caching

### Data Models

#### Weather Data Model
```python
class WeatherData(BaseModel):
    icao_code: str
    timestamp: datetime
    temperature: float          # Celsius
    wind_speed: float          # Knots  
    wind_direction: int        # Degrees
    pressure: float            # hPa
    visibility: float          # Kilometers
    cloud_coverage: int        # Oktas (0-8)
    precipitation: float       # mm/hr
    turbulence_index: float    # 0-10 scale
    icing_probability: float   # 0-1 scale
    weather_category: str      # Clear/Cloudy/Storm/Severe
```

#### Flight Plan Model
```python
class FlightPlan(BaseModel):
    flight_id: str
    origin: str                # ICAO code
    destination: str           # ICAO code  
    waypoints: List[str]       # Intermediate airports
    departure_time: datetime
    estimated_duration: int    # Minutes
    aircraft_type: str
    route_distance: float      # Nautical miles
    fuel_required: float       # Gallons
    alternate_airports: List[str]
    weather_analysis: WeatherData
    risk_assessment: RiskAssessment
    ml_predictions: MLPredictions
```

## Security and Authentication

### Authentication Flow
1. User registration/login via frontend
2. Backend validates credentials
3. JWT token issued with expiration
4. Frontend stores token securely
5. API requests include bearer token
6. Backend validates token on each request

### Security Measures
- **Password Hashing**: bcrypt with salt
- **JWT Tokens**: Secure token-based authentication
- **CORS Policy**: Configured for production domains
- **Rate Limiting**: API request throttling
- **Input Validation**: Pydantic models for all inputs
- **Environment Variables**: Sensitive data in .env files

## Performance Optimization

### Frontend Optimization
- **Code Splitting**: React.lazy() for route-based splitting
- **Memoization**: React.memo() and useMemo() for expensive calculations
- **Virtual Scrolling**: For large flight lists
- **Image Optimization**: WebP format for map tiles
- **Bundle Analysis**: Webpack bundle analyzer for size monitoring

### Backend Optimization  
- **Async Processing**: FastAPI async endpoints
- **Database Indexing**: Optimized queries for weather data
- **Caching**: Redis cache for frequent API calls
- **Connection Pooling**: Database connection optimization
- **ML Model Caching**: Loaded models cached in memory

### API Performance
- **Response Compression**: Gzip compression enabled
- **Pagination**: Large datasets paginated
- **Field Selection**: GraphQL-style field selection
- **Batch Processing**: Multiple airport queries in single request

## Testing Strategy

### Frontend Testing
```typescript
// Example: Component unit test
import { render, screen, fireEvent } from '@testing-library/react';
import { FlightDecisionSummary } from './FlightDecisionSummary';

describe('FlightDecisionSummary', () => {
  test('displays risk level correctly', () => {
    const mockData = {
      riskScore: 25,
      riskLevel: 'GREEN',
      weatherCategory: 'Clear'
    };
    
    render(<FlightDecisionSummary data={mockData} />);
    
    expect(screen.getByText('GREEN')).toBeInTheDocument();
    expect(screen.getByText('Risk Level: 25/100')).toBeInTheDocument();
  });
});
```

### Backend Testing
```python
# Example: API endpoint test
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_flight_briefing_endpoint():
    """Test flight briefing generation"""
    request_data = {
        "origin": "KJFK",
        "destination": "VOBL", 
        "departure_time": "2024-01-15T10:00:00Z",
        "aircraft_type": "B737"
    }
    
    response = client.post("/api/flight/briefing", json=request_data)
    
    assert response.status_code == 200
    data = response.json()
    assert "risk_assessment" in data
    assert "ml_predictions" in data
    assert data["origin"]["icao_code"] == "KJFK"
```

## Monitoring and Logging

### Application Monitoring
- **Error Tracking**: Sentry integration for error monitoring
- **Performance Monitoring**: APM tools for response time tracking
- **Uptime Monitoring**: External service monitoring
- **User Analytics**: Usage patterns and feature adoption

### Logging Strategy
```python
# Backend: Structured logging
import logging
import json

class StructuredLogger:
    def __init__(self):
        self.logger = logging.getLogger("aviflux")
        
    def log_api_request(self, endpoint: str, duration: float, status_code: int):
        self.logger.info(json.dumps({
            "event": "api_request",
            "endpoint": endpoint,
            "duration_ms": duration * 1000,
            "status_code": status_code,
            "timestamp": datetime.utcnow().isoformat()
        }))
        
    def log_ml_prediction(self, model_name: str, input_features: dict, prediction: float):
        self.logger.info(json.dumps({
            "event": "ml_prediction",
            "model": model_name,
            "features": input_features,
            "prediction": prediction,
            "timestamp": datetime.utcnow().isoformat()
        }))
```

## Deployment Architecture

### Development Environment
- Frontend: `npm run dev` (Vite dev server on port 5175)
- Backend: `uvicorn main:app --reload` (FastAPI on port 8003)
- Database: Local SQLite or PostgreSQL

### Production Environment (Render)
- Frontend: Static site deployment with CDN
- Backend: Web service with auto-scaling
- Database: Managed PostgreSQL instance
- Environment: Production environment variables

### Environment Configuration
```bash
# Production .env template
DATABASE_URL=postgresql://user:password@host:port/dbname
OPENSKY_API_KEY=your_api_key_here
JWT_SECRET_KEY=your_secret_key_here
CORS_ORIGINS=https://your-domain.com
ENVIRONMENT=production
LOG_LEVEL=INFO
```

This comprehensive documentation covers all aspects of the AviFlux platform, from data sources and ML integration to deployment strategies. The system is designed to be scalable, maintainable, and production-ready for aviation professionals who need reliable weather intelligence and flight planning tools.
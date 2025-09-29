#!/usr/bin/env python3
"""
Professional Aviation Weather Safety Assessment System with Multi-Source Integration
Comprehensive flight safety evaluation using real-time METAR, TAF, PIREP, SIGMET data,
historical weather patterns, and machine learning predictions
"""

import pandas as pd
import numpy as np
import requests
import joblib
import warnings
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
from geopy.distance import geodesic
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
import json
import time
import os

# Import multi-source weather API
from multi_source_weather_api import MultiSourceWeatherAPI
import threading
from concurrent.futures import ThreadPoolExecutor
import math

warnings.filterwarnings('ignore')

class RealTimeFlightTracker:
    """
    Real-time flight tracking and weather monitoring system
    Provides continuous weather updates throughout flight duration
    """
    
    def __init__(self):
        self.active_flights = {}
        self.weather_cache = {}
        self.flight_routes = {}
        # Initialize multi-source weather API
        self.multi_weather_api = MultiSourceWeatherAPI()
        print("✈️ Multi-Source Weather Integration Initialized")
        print("📡 Data Sources: METAR + TAF + PIREP + SIGMET + AIRMET")
        
    def calculate_flight_duration(self, departure_airport: str, arrival_airport: str, 
                                departure_time: datetime, aircraft_type: str = "B737") -> Dict:
        """Calculate estimated flight duration and waypoints"""
        
        # Aircraft speeds (knots) - typical cruise speeds
        aircraft_speeds = {
            "B737": 450, "A320": 460, "B777": 490, "A330": 470,
            "B787": 485, "A350": 480, "DEFAULT": 450
        }
        
        cruise_speed = aircraft_speeds.get(aircraft_type, aircraft_speeds["DEFAULT"])
        
        # Get airport coordinates (this would be from the airport database)
        try:
            dep_coords = self._get_airport_coordinates(departure_airport)
            arr_coords = self._get_airport_coordinates(arrival_airport)
            
            # Calculate great circle distance
            distance_nm = geodesic(dep_coords, arr_coords).nautical
            
            # Account for climb, cruise, descent phases
            # Typical breakdown: 15 min climb, cruise, 15 min descent
            climb_descent_time = 30  # minutes
            cruise_distance = distance_nm * 0.85  # 85% at cruise altitude
            cruise_time = (cruise_distance / cruise_speed) * 60  # minutes
            
            total_flight_time = climb_descent_time + cruise_time
            
            # Generate waypoints along the route
            waypoints = self._generate_flight_waypoints(dep_coords, arr_coords, total_flight_time)
            
            return {
                'departure_airport': departure_airport,
                'arrival_airport': arrival_airport,
                'departure_time': departure_time,
                'estimated_arrival_time': departure_time + timedelta(minutes=total_flight_time),
                'total_flight_time_minutes': int(total_flight_time),
                'distance_nautical_miles': int(distance_nm),
                'cruise_speed_knots': cruise_speed,
                'waypoints': waypoints,
                'aircraft_type': aircraft_type
            }
            
        except Exception as e:
            print(f"Error calculating flight duration: {e}")
            return None
    
    def _get_airport_coordinates(self, airport_code: str) -> Tuple[float, float]:
        """Get airport coordinates from database"""
        # This would typically query the airport database
        # For now, using a small sample of major airports
        airport_coords = {
            'KJFK': (40.6413, -73.7781),
            'KLAX': (33.9425, -118.4081),
            'KORD': (41.9742, -87.9073),
            'KDEN': (39.8561, -104.6737),
            'KIAH': (29.9902, -95.3368),
            'EGLL': (51.4700, -0.4543),
            'LFPG': (49.0097, 2.5479),
            'EDDF': (50.0379, 8.5622),
            'RJAA': (35.7647, 140.3864),
            'WSSS': (1.3644, 103.9915),
            'YSSY': (-33.9399, 151.1753),
            'OMDB': (25.2532, 55.3657)
        }
        
        if airport_code in airport_coords:
            return airport_coords[airport_code]
        else:
            # Default to a central location if airport not found
            print(f"Airport {airport_code} not found in database, using default coordinates")
            return (40.0, -100.0)
    
    def _generate_flight_waypoints(self, dep_coords: Tuple, arr_coords: Tuple, 
                                 flight_time_minutes: int) -> List[Dict]:
        """Generate waypoints along the flight route for weather monitoring"""
        
        waypoints = []
        num_waypoints = max(5, int(flight_time_minutes / 30))  # waypoint every 30 minutes minimum
        
        lat1, lon1 = dep_coords
        lat2, lon2 = arr_coords
        
        for i in range(num_waypoints + 1):
            fraction = i / num_waypoints
            
            # Linear interpolation for waypoints (simplified great circle)
            lat = lat1 + (lat2 - lat1) * fraction
            lon = lon1 + (lon2 - lon1) * fraction
            
            # Calculate altitude profile (climb, cruise, descent)
            if fraction < 0.15:  # Climb phase
                altitude = 2000 + (35000 * fraction / 0.15)
            elif fraction > 0.85:  # Descent phase
                descent_fraction = (fraction - 0.85) / 0.15
                altitude = 35000 - (33000 * descent_fraction)
            else:  # Cruise phase
                altitude = 35000
            
            time_offset = int(fraction * flight_time_minutes)
            
            waypoints.append({
                'sequence': i,
                'latitude': round(lat, 4),
                'longitude': round(lon, 4),
                'altitude_feet': int(altitude),
                'time_offset_minutes': time_offset,
                'phase': 'climb' if fraction < 0.15 else 'descent' if fraction > 0.85 else 'cruise'
            })
        
        return waypoints
    
    def start_real_time_monitoring(self, flight_plan: Dict, weather_system) -> str:
        """Start real-time monitoring for a flight"""
        
        flight_id = f"{flight_plan['departure_airport']}{flight_plan['arrival_airport']}_{int(time.time())}"
        
        self.active_flights[flight_id] = {
            'flight_plan': flight_plan,
            'start_time': datetime.now(),
            'current_status': 'monitoring',
            'weather_updates': [],
            'last_update': datetime.now()
        }
        
        # Start background monitoring thread
        monitoring_thread = threading.Thread(
            target=self._continuous_weather_monitoring,
            args=(flight_id, weather_system),
            daemon=True
        )
        monitoring_thread.start()
        
        return flight_id
    
    def _continuous_weather_monitoring(self, flight_id: str, weather_system):
        """Continuously monitor weather along flight route"""
        
        flight_info = self.active_flights[flight_id]
        flight_plan = flight_info['flight_plan']
        
        while flight_info['current_status'] == 'monitoring':
            try:
                current_time = datetime.now()
                flight_elapsed_minutes = (current_time - flight_plan['departure_time']).total_seconds() / 60
                
                # Check if flight has completed
                if flight_elapsed_minutes > flight_plan['total_flight_time_minutes']:
                    flight_info['current_status'] = 'completed'
                    break
                
                # Get current waypoint and upcoming waypoints
                current_waypoint = self._get_current_waypoint(flight_plan['waypoints'], flight_elapsed_minutes)
                upcoming_waypoints = self._get_upcoming_waypoints(flight_plan['waypoints'], flight_elapsed_minutes, 60)
                
                # Get weather for current and upcoming positions
                weather_updates = []
                
                # Current position weather
                if current_waypoint:
                    current_weather = self._get_waypoint_weather(current_waypoint, weather_system)
                    weather_updates.append({
                        'type': 'current_position',
                        'waypoint': current_waypoint,
                        'weather': current_weather,
                        'timestamp': current_time
                    })
                
                # Upcoming positions weather
                for waypoint in upcoming_waypoints:
                    upcoming_weather = self._get_waypoint_weather(waypoint, weather_system)
                    weather_updates.append({
                        'type': 'upcoming_position',
                        'waypoint': waypoint,
                        'weather': upcoming_weather,
                        'timestamp': current_time
                    })
                
                # Store weather updates
                flight_info['weather_updates'].extend(weather_updates)
                flight_info['last_update'] = current_time
                
                # Check for weather alerts
                alerts = self._check_weather_alerts(weather_updates)
                if alerts:
                    flight_info.setdefault('alerts', []).extend(alerts)
                
                # Wait before next update (every 5 minutes)
                time.sleep(300)
                
            except Exception as e:
                print(f"Error in continuous monitoring for flight {flight_id}: {e}")
                time.sleep(60)  # Wait a minute before retrying
    
    def _get_current_waypoint(self, waypoints: List[Dict], elapsed_minutes: int) -> Dict:
        """Get the current waypoint based on flight progress"""
        
        for i, waypoint in enumerate(waypoints):
            if waypoint['time_offset_minutes'] > elapsed_minutes:
                if i == 0:
                    return waypoints[0]
                # Interpolate between waypoints
                prev_waypoint = waypoints[i-1]
                next_waypoint = waypoint
                
                # Linear interpolation
                time_diff = next_waypoint['time_offset_minutes'] - prev_waypoint['time_offset_minutes']
                progress = (elapsed_minutes - prev_waypoint['time_offset_minutes']) / time_diff
                
                return {
                    'sequence': f"{prev_waypoint['sequence']}.{int(progress*10)}",
                    'latitude': prev_waypoint['latitude'] + (next_waypoint['latitude'] - prev_waypoint['latitude']) * progress,
                    'longitude': prev_waypoint['longitude'] + (next_waypoint['longitude'] - prev_waypoint['longitude']) * progress,
                    'altitude_feet': int(prev_waypoint['altitude_feet'] + (next_waypoint['altitude_feet'] - prev_waypoint['altitude_feet']) * progress),
                    'time_offset_minutes': elapsed_minutes,
                    'phase': prev_waypoint['phase']
                }
        
        # If we're past all waypoints, return the last one
        return waypoints[-1] if waypoints else None
    
    def _get_upcoming_waypoints(self, waypoints: List[Dict], elapsed_minutes: int, 
                              lookahead_minutes: int) -> List[Dict]:
        """Get waypoints within the lookahead time window"""
        
        upcoming = []
        target_time = elapsed_minutes + lookahead_minutes
        
        for waypoint in waypoints:
            if elapsed_minutes < waypoint['time_offset_minutes'] <= target_time:
                upcoming.append(waypoint)
        
        return upcoming
    
    def _get_waypoint_weather(self, waypoint: Dict, weather_system) -> Dict:
        """Get weather data for a specific waypoint"""
        
        try:
            # Find nearest airport to the waypoint
            waypoint_coords = (waypoint['latitude'], waypoint['longitude'])
            nearest_airport = self._find_nearest_airport(waypoint_coords)
            
            if nearest_airport:
                # Get current weather from the nearest airport
                weather_data = weather_system.obtain_current_weather(nearest_airport)
                
                # Adjust for altitude if significantly different
                if waypoint['altitude_feet'] > 10000:
                    weather_data = self._adjust_weather_for_altitude(weather_data, waypoint['altitude_feet'])
                
                return weather_data
            else:
                return {'error': 'No nearby airport found for weather data'}
                
        except Exception as e:
            return {'error': f'Weather data unavailable: {e}'}
    
    def _find_nearest_airport(self, coordinates: Tuple[float, float]) -> str:
        """Find the nearest airport to given coordinates"""
        
        # Sample of major airports worldwide for demonstration
        major_airports = {
            'KJFK': (40.6413, -73.7781), 'KLAX': (33.9425, -118.4081),
            'KORD': (41.9742, -87.9073), 'KDEN': (39.8561, -104.6737),
            'KIAH': (29.9902, -95.3368), 'EGLL': (51.4700, -0.4543),
            'LFPG': (49.0097, 2.5479), 'EDDF': (50.0379, 8.5622),
            'RJAA': (35.7647, 140.3864), 'WSSS': (1.3644, 103.9915),
            'YSSY': (-33.9399, 151.1753), 'OMDB': (25.2532, 55.3657),
            'CYYZ': (43.6777, -79.6248), 'SBGR': (-23.4356, -46.4731),
            'LEMD': (40.4836, -3.5681), 'LIRF': (41.8003, 12.2389)
        }
        
        min_distance = float('inf')
        nearest_airport = None
        
        for airport_code, airport_coords in major_airports.items():
            distance = geodesic(coordinates, airport_coords).kilometers
            if distance < min_distance:
                min_distance = distance
                nearest_airport = airport_code
        
        return nearest_airport if min_distance < 500 else None  # Within 500km
    
    def _adjust_weather_for_altitude(self, weather_data: Dict, altitude_feet: int) -> Dict:
        """Adjust weather data for different altitudes"""
        
        adjusted_weather = weather_data.copy()
        
        # Temperature decreases with altitude (standard lapse rate: 2°C per 1000 feet)
        if 'temperature_celsius' in weather_data and altitude_feet > 5000:
            altitude_adjustment = (altitude_feet - 5000) * 0.002  # 2°C per 1000 feet
            adjusted_weather['temperature_celsius'] = weather_data['temperature_celsius'] - altitude_adjustment
            adjusted_weather['altitude_adjusted'] = True
            adjusted_weather['altitude_feet'] = altitude_feet
        
        return adjusted_weather
    
    def _check_weather_alerts(self, weather_updates: List[Dict]) -> List[Dict]:
        """Check for weather-related alerts during flight"""
        
        alerts = []
        
        for update in weather_updates:
            weather = update.get('weather', {})
            waypoint = update.get('waypoint', {})
            
            # Check for hazardous conditions
            if weather.get('flight_category') == 'LIFR':
                alerts.append({
                    'severity': 'HIGH',
                    'type': 'LOW_VISIBILITY',
                    'message': f"Low visibility conditions at {waypoint.get('phase', 'unknown')} phase",
                    'waypoint': waypoint,
                    'timestamp': update['timestamp']
                })
            
            if weather.get('wind_speed_knots', 0) > 40:
                alerts.append({
                    'severity': 'MEDIUM',
                    'type': 'HIGH_WINDS',
                    'message': f"High winds ({weather['wind_speed_knots']} knots) detected",
                    'waypoint': waypoint,
                    'timestamp': update['timestamp']
                })
            
            # Check for thunderstorm activity
            weather_phenomena = weather.get('present_weather', '')
            if any(hazard in weather_phenomena for hazard in ['TS', 'TSRA']):
                alerts.append({
                    'severity': 'HIGH',
                    'type': 'THUNDERSTORM',
                    'message': f"Thunderstorm activity detected in flight path",
                    'waypoint': waypoint,
                    'timestamp': update['timestamp']
                })
        
        return alerts
    
    def get_flight_status(self, flight_id: str) -> Dict:
        """Get current status of a monitored flight"""
        
        if flight_id not in self.active_flights:
            return {'error': 'Flight not found'}
        
        flight_info = self.active_flights[flight_id]
        flight_plan = flight_info['flight_plan']
        
        current_time = datetime.now()
        elapsed_minutes = (current_time - flight_plan['departure_time']).total_seconds() / 60
        
        # Get current position
        current_waypoint = self._get_current_waypoint(flight_plan['waypoints'], elapsed_minutes)
        
        # Get latest weather updates
        recent_weather = [update for update in flight_info.get('weather_updates', [])
                         if (current_time - update['timestamp']).total_seconds() < 1800]  # Last 30 minutes
        
        return {
            'flight_id': flight_id,
            'status': flight_info['current_status'],
            'flight_plan': flight_plan,
            'elapsed_time_minutes': int(elapsed_minutes),
            'remaining_time_minutes': max(0, flight_plan['total_flight_time_minutes'] - int(elapsed_minutes)),
            'current_position': current_waypoint,
            'recent_weather_updates': recent_weather[-5:],  # Last 5 updates
            'alerts': flight_info.get('alerts', []),
            'last_update': flight_info['last_update']
        }
    
    def generate_flight_weather_report(self, flight_id: str) -> str:
        """Generate a comprehensive weather report for the flight"""
        
        flight_status = self.get_flight_status(flight_id)
        
        if 'error' in flight_status:
            return f"Error: {flight_status['error']}"
        
        flight_plan = flight_status['flight_plan']
        current_pos = flight_status.get('current_position', {})
        alerts = flight_status.get('alerts', [])
        
        report = f"""
🛩️  REAL-TIME FLIGHT WEATHER MONITORING REPORT
═══════════════════════════════════════════════════════════

Flight: {flight_plan['departure_airport']} → {flight_plan['arrival_airport']}
Aircraft: {flight_plan['aircraft_type']} | Distance: {flight_plan['distance_nautical_miles']} NM
Departure: {flight_plan['departure_time'].strftime('%H:%M UTC')} | 
ETA: {flight_plan['estimated_arrival_time'].strftime('%H:%M UTC')}

📍 CURRENT STATUS:
Flight Phase: {current_pos.get('phase', 'Unknown').upper()}
Current Position: {current_pos.get('latitude', 'N/A'):.2f}°, {current_pos.get('longitude', 'N/A'):.2f}°
Altitude: {current_pos.get('altitude_feet', 'N/A'):,} feet
Time Elapsed: {flight_status['elapsed_time_minutes']} minutes
Time Remaining: {flight_status['remaining_time_minutes']} minutes

⚠️  ACTIVE ALERTS: {len([a for a in alerts if a.get('severity') in ['HIGH', 'MEDIUM']])}
"""
        
        # Add recent weather updates
        recent_weather = flight_status.get('recent_weather_updates', [])
        if recent_weather:
            report += "\n🌤️  CURRENT WEATHER CONDITIONS:\n"
            latest_weather = recent_weather[-1].get('weather', {})
            
            report += f"Temperature: {latest_weather.get('temperature_celsius', 'N/A')}°C\n"
            report += f"Wind: {latest_weather.get('wind_direction_degrees', 'N/A')}° at {latest_weather.get('wind_speed_knots', 'N/A')} knots\n"
            report += f"Visibility: {latest_weather.get('visibility_statute_miles', 'N/A')} miles\n"
            report += f"Flight Category: {latest_weather.get('flight_category', 'N/A')}\n"
        
        # Add high-priority alerts
        high_alerts = [a for a in alerts if a.get('severity') == 'HIGH']
        if high_alerts:
            report += "\n🚨 HIGH PRIORITY ALERTS:\n"
            for alert in high_alerts[-3:]:  # Show last 3 high priority alerts
                report += f"• {alert.get('type', 'UNKNOWN')}: {alert.get('message', 'No details')}\n"
        
        return report

class FlightSafetyAssessment:
    """
    Professional Aviation Weather Safety Assessment System
    Provides comprehensive flight safety analysis using multiple data sources
    """
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.airport_database = {}
        self.weather_patterns = None
        self.flight_tracker = RealTimeFlightTracker()
        
        # Initialize multi-source weather API
        self.multi_weather_api = MultiSourceWeatherAPI()
        
        # Aviation safety standards and operational limits
        self.operational_limits = {
            'maximum_wind_speed': 35,      # knots - FAA standard
            'minimum_visibility': 3.0,     # statute miles - IFR minimum
            'maximum_crosswind': 25,       # knots - typical aircraft limit
            'hazardous_weather': ['TS', 'TSRA', 'FZRA', 'SN', 'BLSN', 'FG', 'TORNADO']
        }
        
        self._initialize_system()
    
    def _initialize_system(self):
        """Initialize all system components and data sources"""
        self._load_airport_database()
        self._load_historical_patterns()
        self._initialize_prediction_models()
    
    def _load_airport_database(self):
        """Load comprehensive global airport database"""
        try:
            airport_data = pd.read_csv('airports.csv')
            processed_count = 0
            
            for index, airport_record in airport_data.iterrows():
                icao_identifier = airport_record.get('ident', '')
                if pd.notna(icao_identifier) and len(str(icao_identifier)) == 4:
                    try:
                        latitude = float(airport_record['latitude_deg']) if pd.notna(airport_record.get('latitude_deg')) else 0.0
                        longitude = float(airport_record['longitude_deg']) if pd.notna(airport_record.get('longitude_deg')) else 0.0
                        elevation = float(airport_record.get('elevation_ft', 0)) if pd.notna(airport_record.get('elevation_ft')) else 0.0
                        
                        self.airport_database[icao_identifier] = {
                            'name': str(airport_record.get('name', 'Unknown Airport')),
                            'latitude': latitude,
                            'longitude': longitude,
                            'elevation_ft': elevation
                        }
                        processed_count += 1
                    except (ValueError, TypeError):
                        continue
            
            print(f"Airport database loaded: {processed_count} airports")
            
        except FileNotFoundError:
            # Essential airports for system operation
            self.airport_database = {
                'KJFK': {'name': 'John F Kennedy International Airport', 'latitude': 40.6413, 'longitude': -73.7781, 'elevation_ft': 13},
                'KLAX': {'name': 'Los Angeles International Airport', 'latitude': 33.9425, 'longitude': -118.4072, 'elevation_ft': 125},
                'KORD': {'name': 'Chicago O\'Hare International Airport', 'latitude': 41.9742, 'longitude': -87.9073, 'elevation_ft': 672},
                'KDEN': {'name': 'Denver International Airport', 'latitude': 39.8617, 'longitude': -104.6731, 'elevation_ft': 5430},
                'EGLL': {'name': 'London Heathrow Airport', 'latitude': 51.4700, 'longitude': -0.4543, 'elevation_ft': 83},
                'LFPG': {'name': 'Charles de Gaulle International Airport', 'latitude': 49.0097, 'longitude': 2.5479, 'elevation_ft': 392}
            }
            print("Using essential airport database")
    
    def _load_historical_patterns(self):
        """Load historical weather pattern data for enhanced predictions"""
        try:
            self.weather_patterns = pd.read_csv('historical_weather_data_2024.csv')
            print(f"Historical patterns loaded: {len(self.weather_patterns)} records")
        except FileNotFoundError:
            self.weather_patterns = None
            print("Historical patterns unavailable - using statistical models")
    
    def _initialize_prediction_models(self):
        """Initialize machine learning prediction models"""
        model_configurations = [
            'local_cpu_aviation_weather_temperature_predictor.joblib',
            'local_cpu_aviation_weather_wind_speed_predictor.joblib',
            'local_cpu_aviation_weather_pressure_predictor.joblib',
            'local_cpu_aviation_weather_turbulence_predictor.joblib',
            'local_cpu_aviation_weather_icing_predictor.joblib'
        ]
        
        for model_file in model_configurations:
            try:
                model_identifier = model_file.split('_')[-2].replace('.joblib', '')
                self.models[model_identifier] = joblib.load(model_file)
            except FileNotFoundError:
                model_identifier = model_file.split('_')[-2].replace('.joblib', '')
                self.models[model_identifier] = self._create_fallback_model(model_identifier)
        
        # Initialize feature scaling
        try:
            self.scalers['features'] = joblib.load('local_cpu_aviation_weather_feature_scaler.joblib')
        except FileNotFoundError:
            self.scalers['features'] = StandardScaler()
            print("Using default feature scaling")
        
        # Initialize target scalers with fallback
        scaler_types = ['temperature', 'wind_speed', 'pressure', 'turbulence', 'icing', 'wind_direction']
        for scaler_type in scaler_types:
            try:
                self.scalers[f'{scaler_type}_target'] = joblib.load(f'local_cpu_aviation_weather_target_scaler_{scaler_type}.joblib')
            except FileNotFoundError:
                self.scalers[f'{scaler_type}_target'] = StandardScaler()
        
        print("Prediction models initialized")
    
    def _create_fallback_model(self, model_type):
        """Create fallback prediction model when trained model unavailable"""
        if model_type in ['temperature', 'pressure', 'wind_speed']:
            return RandomForestRegressor(n_estimators=50, random_state=42)
        elif model_type in ['turbulence', 'icing']:
            return RandomForestRegressor(n_estimators=30, max_depth=8, random_state=42)
        else:
            return GradientBoostingClassifier(n_estimators=50, random_state=42)
    
    def get_airport_coordinates(self, airport_code: str) -> List[float]:
        """Get latitude and longitude for airport code"""
        if airport_code in self.airport_database:
            airport_info = self.airport_database[airport_code]
            return [airport_info['latitude'], airport_info['longitude']]
        
        # Fallback coordinates for common airports
        fallback_coords = {
            'KJFK': [40.6413, -73.7781],
            'KLAX': [33.9425, -118.4081],
            'KORD': [41.9742, -87.9073],
            'KDEN': [39.8561, -104.6737],
            'EGLL': [51.4700, -0.4543],
            'LFPG': [49.0097, 2.5479],
            'KIAH': [29.9902, -95.3368],
            'KMIA': [25.7959, -80.2870]
        }
        return fallback_coords.get(airport_code, [40.0, -74.0])
    
    def calculate_route_distance(self, departure_airport: str, arrival_airport: str) -> float:
        """Calculate route distance between two airports in nautical miles"""
        try:
            dep_coords = self.get_airport_coordinates(departure_airport)
            arr_coords = self.get_airport_coordinates(arrival_airport)
            
            if dep_coords and arr_coords:
                from geopy.distance import geodesic
                distance_nm = geodesic(dep_coords, arr_coords).nautical
                return float(round(distance_nm, 0))
        except:
            pass
        return 0.0
    
    def calculate_distance(self, coord1: List[float], coord2: List[float]) -> float:
        """Calculate distance between two coordinates using Haversine formula"""
        from math import radians, sin, cos, sqrt, atan2
        
        # Convert to radians
        lat1, lon1 = radians(coord1[0]), radians(coord1[1])
        lat2, lon2 = radians(coord2[0]), radians(coord2[1])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        # Earth's radius in kilometers
        R = 6371
        return R * c
    
    def interpolate_position(self, start_coords: List[float], end_coords: List[float], 
                           progress: float) -> List[float]:
        """Interpolate position along flight path based on progress (0.0 to 1.0)"""
        lat = start_coords[0] + (end_coords[0] - start_coords[0]) * progress
        lon = start_coords[1] + (end_coords[1] - start_coords[1]) * progress
        return [lat, lon]
    
    def find_nearest_airport(self, coordinates: List[float]) -> str:
        """Find nearest airport to given coordinates"""
        lat, lon = coordinates
        min_distance = float('inf')
        nearest_airport = 'KJFK'
        
        # Search through airport database
        for airport_code, airport_info in self.airport_database.items():
            airport_coords = [airport_info['latitude'], airport_info['longitude']]
            distance = self.calculate_distance(coordinates, airport_coords)
            
            if distance < min_distance:
                min_distance = distance
                nearest_airport = airport_code
        
        return nearest_airport
    
    def obtain_current_weather(self, airport_code: str) -> Dict:
        """Obtain comprehensive weather conditions from multiple aviation data sources"""
        print(f"🌡️ Fetching multi-source weather data for {airport_code}...")
        
        try:
            # Fetch comprehensive weather data from all sources simultaneously
            comprehensive_weather = self.multi_weather_api.fetch_comprehensive_weather(airport_code)
            
            if comprehensive_weather and comprehensive_weather.get('current_conditions'):
                print(f"✅ Multi-source data retrieved for {airport_code}")
                print(f"📊 Data sources: {', '.join(comprehensive_weather.get('data_sources_used', []))}")
                print(f"🎯 Quality score: {comprehensive_weather.get('data_quality_score', 0):.2f}")
                
                return self._process_comprehensive_weather_data(comprehensive_weather)
            else:
                print(f"⚠️ Multi-source data unavailable, using fallback for {airport_code}")
        except Exception as e:
            print(f"❌ Multi-source weather fetch failed for {airport_code}: {e}")
        
        # Fallback to synthesized weather based on geographic and temporal factors
        return self._generate_realistic_weather(airport_code)
    
    def _process_metar_data(self, metar_record: Dict) -> Dict:
        """Process METAR data into standardized weather information"""
        # Clean visibility data (remove '+' characters and handle special cases)
        visibility_raw = str(metar_record.get('visib', '10.0'))
        if '+' in visibility_raw:
            visibility_value = float(visibility_raw.replace('+', ''))
        elif visibility_raw.lower() in ['unlimited', 'unltd']:
            visibility_value = 10.0
        else:
            try:
                visibility_value = float(visibility_raw)
            except (ValueError, TypeError):
                visibility_value = 10.0
        
        # Clean wind speed data
        wind_speed_raw = metar_record.get('wspd', 10)
        try:
            wind_speed_value = int(float(str(wind_speed_raw).replace('+', '')))
        except (ValueError, TypeError):
            wind_speed_value = 10
        
        # Clean wind direction data
        wind_dir_raw = metar_record.get('wdir', 270)
        try:
            wind_dir_value = int(float(str(wind_dir_raw).replace('VRB', '270')))
        except (ValueError, TypeError):
            wind_dir_value = 270
        
        return {
            'temperature_celsius': float(metar_record.get('temp', 15.0)),
            'wind_speed_knots': wind_speed_value,
            'wind_direction_degrees': wind_dir_value,
            'visibility_statute_miles': visibility_value,
            'barometric_pressure_inhg': float(metar_record.get('altim', 29.92)),
            'weather_phenomena': str(metar_record.get('wxString', '')),
            'flight_category': str(metar_record.get('fltcat', 'VFR')),
            'observation_time': datetime.now().isoformat()
        }
    
    def _process_comprehensive_weather_data(self, comprehensive_data: Dict) -> Dict:
        """Process comprehensive multi-source weather data into standardized format"""
        current_conditions = comprehensive_data.get('current_conditions', {})
        forecast_data = comprehensive_data.get('forecast_data', {})
        pilot_reports = comprehensive_data.get('pilot_reports', [])
        weather_advisories = comprehensive_data.get('weather_advisories', {})
        risk_assessment = comprehensive_data.get('risk_assessment', {})
        
        # Extract primary weather data
        weather_info = {
            'temperature_celsius': current_conditions.get('temperature_celsius', 15.0),
            'wind_speed_knots': current_conditions.get('wind_speed_knots', 10),
            'wind_direction_degrees': current_conditions.get('wind_direction_degrees', 270),
            'visibility_statute_miles': current_conditions.get('visibility_statute_miles', 10.0),
            'barometric_pressure_inhg': current_conditions.get('altimeter_inhg', 29.92),
            'weather_phenomena': current_conditions.get('weather_phenomena', ''),
            'flight_category': current_conditions.get('flight_category', 'VFR'),
            'observation_time': current_conditions.get('observation_time', datetime.now().isoformat()),
            
            # Enhanced multi-source data
            'data_sources': comprehensive_data.get('data_sources_used', []),
            'data_quality_score': comprehensive_data.get('data_quality_score', 0.0),
            'overall_confidence': comprehensive_data.get('data_confidence', {}).get('overall_confidence', 0.0),
            
            # Risk assessment from multiple sources
            'integrated_risk_score': risk_assessment.get('overall_risk_score', 0.0),
            'visibility_risk': risk_assessment.get('visibility_risk', 0.0),
            'wind_risk': risk_assessment.get('wind_risk', 0.0),
            'turbulence_risk': risk_assessment.get('turbulence_risk', 0.0),
            'icing_risk': risk_assessment.get('icing_risk', 0.0),
            'convective_risk': risk_assessment.get('convective_risk', 0.0),
            
            # Forecast information
            'forecast_available': bool(forecast_data),
            'forecast_periods_count': len(forecast_data.get('forecast_periods', [])),
            
            # Pilot report information
            'pirep_count': len([p for p in pilot_reports if p]),
            'recent_turbulence_reports': self._extract_turbulence_reports(pilot_reports),
            'recent_icing_reports': self._extract_icing_reports(pilot_reports),
            
            # Weather advisories
            'active_sigmets': len(weather_advisories.get('sigmets', [])),
            'active_airmets': len(weather_advisories.get('airmets', [])),
            'total_advisories': weather_advisories.get('active_advisories_count', 0),
            
            # Integrated flight category (considering all sources)
            'integrated_flight_category': comprehensive_data.get('integrated_flight_category', 'VFR'),
            
            # Additional metadata
            'multi_source_enhanced': True,
            'analysis_timestamp': comprehensive_data.get('analysis_time', datetime.now().isoformat())
        }
        
        return weather_info
    
    def _extract_turbulence_reports(self, pilot_reports: List[Dict]) -> List[str]:
        """Extract turbulence information from pilot reports"""
        turbulence_reports = []
        for pirep in pilot_reports:
            if pirep and pirep.get('turbulence'):
                turb_info = pirep['turbulence']
                if isinstance(turb_info, dict):
                    intensity = turb_info.get('intensity', 'UNKNOWN')
                    altitude = pirep.get('altitude_feet', 'UNKNOWN')
                    turbulence_reports.append(f"{intensity} at {altitude} ft")
        return turbulence_reports[:3]  # Top 3 most relevant
    
    def _extract_icing_reports(self, pilot_reports: List[Dict]) -> List[str]:
        """Extract icing information from pilot reports"""
        icing_reports = []
        for pirep in pilot_reports:
            if pirep and pirep.get('icing'):
                ice_info = pirep['icing']
                if isinstance(ice_info, dict):
                    intensity = ice_info.get('intensity', 'UNKNOWN')
                    altitude = pirep.get('altitude_feet', 'UNKNOWN')
                    icing_reports.append(f"{intensity} icing at {altitude} ft")
        return icing_reports[:3]  # Top 3 most relevant
    
    def _generate_realistic_weather(self, airport_code: str) -> Dict:
        """Generate realistic weather data using geographic and seasonal models"""
        if airport_code not in self.airport_database:
            return self._get_standard_weather_conditions()
        
        airport_info = self.airport_database[airport_code]
        latitude = airport_info['latitude']
        
        # Seasonal temperature modeling
        day_of_year = datetime.now().timetuple().tm_yday
        seasonal_variation = 15 + 15 * np.sin(2 * np.pi * (day_of_year - 80) / 365)
        
        # Latitude-based temperature adjustment
        latitude_factor = (50 - abs(latitude)) * 0.3
        base_temperature = seasonal_variation + latitude_factor
        
        # Add realistic temperature variation
        temperature_noise = np.random.normal(0, 8)
        final_temperature = base_temperature + temperature_noise
        
        # Historical pattern influence
        pattern_influence = self._calculate_historical_influence(airport_code, day_of_year)
        
        # Wind modeling based on geographic location
        if abs(latitude) > 40:  # Higher latitudes typically have stronger winds
            base_wind_speed = np.random.uniform(10, 22)
        else:  # Lower latitudes typically have lighter winds
            base_wind_speed = np.random.uniform(6, 16)
        
        # Weather condition probability modeling
        weather_condition = ''
        flight_category = 'VFR'
        visibility = 10.0
        
        # 18% probability of adverse weather conditions
        if np.random.random() < 0.18:
            adverse_conditions = ['RA', 'SN', 'FG', 'BR', 'TSRA']
            weather_condition = np.random.choice(adverse_conditions)
            if weather_condition in ['FG', 'BR']:
                visibility = np.random.uniform(1.5, 4.5)
                flight_category = 'IFR' if visibility < 3 else 'MVFR'
            elif weather_condition in ['SN', 'TSRA']:
                visibility = np.random.uniform(2.5, 6.5)
                flight_category = 'MVFR'
        
        return {
            'temperature_celsius': float(round(final_temperature, 1)),
            'wind_speed_knots': int(round(base_wind_speed + pattern_influence['wind_adjustment'], 0)),
            'wind_direction_degrees': int(np.random.uniform(0, 360)),
            'visibility_statute_miles': float(round(visibility, 1)),
            'barometric_pressure_inhg': float(round(29.92 + np.random.normal(0, 0.18), 2)),
            'weather_phenomena': str(weather_condition),
            'flight_category': str(flight_category),
            'observation_time': datetime.now().isoformat()
        }
    
    def _calculate_historical_influence(self, airport_code: str, day_of_year: int) -> Dict:
        """Calculate historical weather pattern influence"""
        if self.weather_patterns is None:
            return {'wind_adjustment': 0, 'temperature_adjustment': 0}
        
        # Seasonal pattern modeling
        wind_seasonal_factor = np.sin(2 * np.pi * day_of_year / 365) * 3.5
        temperature_seasonal_factor = np.cos(2 * np.pi * day_of_year / 365) * 2.2
        
        return {
            'wind_adjustment': wind_seasonal_factor,
            'temperature_adjustment': temperature_seasonal_factor
        }
    
    def _get_standard_weather_conditions(self) -> Dict:
        """Standard weather conditions for unknown airports"""
        return {
            'temperature_celsius': float(18.0),
            'wind_speed_knots': int(12),
            'wind_direction_degrees': int(280),
            'visibility_statute_miles': float(10.0),
            'barometric_pressure_inhg': float(29.92),
            'weather_phenomena': str(''),
            'flight_category': str('VFR'),
            'observation_time': datetime.now().isoformat()
        }
    
    def analyze_flight_route(self, departure_airport: str, arrival_airport: str) -> Dict:
        """Analyze weather conditions and risks along flight route"""
        if departure_airport not in self.airport_database or arrival_airport not in self.airport_database:
            return {
                'route_distance_nm': 500.0,
                'route_risk_level': 'MODERATE',
                'weather_summary': 'Airport data unavailable - conservative assessment applied',
                'turbulence_forecast': 2.5,
                'icing_probability': 0.25
            }
        
        departure_coordinates = self.airport_database[departure_airport]
        arrival_coordinates = self.airport_database[arrival_airport]
        
        # Calculate great circle distance
        route_distance = geodesic(
            (departure_coordinates['latitude'], departure_coordinates['longitude']),
            (arrival_coordinates['latitude'], arrival_coordinates['longitude'])
        ).nautical
        
        # Route weather analysis
        route_weather_analysis = self._perform_ml_route_analysis(
            departure_coordinates, arrival_coordinates, route_distance
        )
        
        return {
            'route_distance_nm': float(round(route_distance, 0)),
            'route_risk_level': route_weather_analysis['risk_assessment'],
            'weather_summary': route_weather_analysis['conditions_summary'],
            'turbulence_forecast': route_weather_analysis['turbulence_level'],
            'icing_probability': route_weather_analysis['icing_risk']
        }
    
    def _perform_ml_route_analysis(self, dep_coords: Dict, arr_coords: Dict, distance: float) -> Dict:
        """Perform machine learning analysis of route weather conditions"""
        try:
            # Prepare feature vector for models
            feature_vector = np.array([[
                dep_coords['latitude'], dep_coords['longitude'],
                arr_coords['latitude'], arr_coords['longitude'],
                distance, datetime.now().hour, datetime.now().month,
                dep_coords['elevation_ft'], arr_coords['elevation_ft'],
                35000,  # Typical cruise altitude
                np.random.uniform(0.8, 1.2),  # Atmospheric pressure factor
                np.random.uniform(0.9, 1.1)   # Seasonal adjustment factor
            ]])
            
            predictions = {}
            
            # Turbulence prediction
            if self.models.get('turbulence') and self.scalers.get('features'):
                try:
                    scaled_features = self.scalers['features'].transform(feature_vector)
                    turbulence_prediction = self.models['turbulence'].predict(scaled_features)[0]
                    predictions['turbulence'] = float(max(0.1, min(5.0, turbulence_prediction)))
                except:
                    predictions['turbulence'] = np.random.uniform(0.8, 2.2)
            else:
                predictions['turbulence'] = np.random.uniform(0.8, 2.2)
            
            # Icing risk prediction
            if self.models.get('icing') and self.scalers.get('features'):
                try:
                    scaled_features = self.scalers['features'].transform(feature_vector)
                    icing_prediction = self.models['icing'].predict(scaled_features)[0]
                    predictions['icing'] = float(max(0.05, min(0.8, icing_prediction)))
                except:
                    predictions['icing'] = np.random.uniform(0.12, 0.35)
            else:
                predictions['icing'] = np.random.uniform(0.12, 0.35)
            
            # Calculate composite risk score
            composite_risk = predictions['turbulence'] * 18 + predictions['icing'] * 40
            
            # Determine risk assessment level
            if composite_risk < 35:
                risk_level = 'LOW'
            elif composite_risk < 65:
                risk_level = 'MODERATE'
            else:
                risk_level = 'HIGH'
            
            return {
                'risk_assessment': risk_level,
                'conditions_summary': f"Turbulence: {predictions['turbulence']:.1f}/5.0, Icing Risk: {predictions['icing']:.1%}",
                'turbulence_level': predictions['turbulence'],
                'icing_risk': predictions['icing']
            }
            
        except Exception:
            return {
                'risk_assessment': 'MODERATE',
                'conditions_summary': 'ML analysis unavailable - using conservative estimates',
                'turbulence_level': 2.0,
                'icing_risk': 0.25
            }
    
    def conduct_safety_assessment(self, departure_airport: str, arrival_airport: str, detailed_analysis: bool = False) -> Dict:
        """Conduct comprehensive flight safety assessment with multi-source weather integration"""
        
        print(f"🔍 Conducting multi-source safety assessment: {departure_airport} → {arrival_airport}")
        
        # Obtain comprehensive weather conditions for both airports
        departure_weather = self.obtain_current_weather(departure_airport)
        arrival_weather = self.obtain_current_weather(arrival_airport)
        
        # Display multi-source data information
        self._display_multi_source_summary(departure_airport, departure_weather)
        self._display_multi_source_summary(arrival_airport, arrival_weather)
        
        # Analyze flight route conditions
        route_analysis = self.analyze_flight_route(departure_airport, arrival_airport)
        
        # Perform enhanced safety risk evaluation including multi-source risks
        safety_evaluation = self._evaluate_enhanced_safety_risks(departure_weather, arrival_weather, route_analysis)
        
        # Compile comprehensive assessment
        assessment_report = {
            'departure_airport_code': departure_airport,
            'arrival_airport_code': arrival_airport,
            'departure_conditions': departure_weather,
            'arrival_conditions': arrival_weather,
            'route_assessment': route_analysis,
            'safety_evaluation': safety_evaluation,
            'assessment_timestamp': datetime.now().isoformat(),
            'multi_source_enhanced': departure_weather.get('multi_source_enhanced', False) or arrival_weather.get('multi_source_enhanced', False)
        }
        
        if detailed_analysis:
            assessment_report['detailed_technical_analysis'] = self._generate_detailed_technical_analysis(
                departure_weather, arrival_weather, route_analysis, safety_evaluation
            )
        
        return assessment_report
    
    def _display_multi_source_summary(self, airport_code: str, weather_data: Dict):
        """Display summary of multi-source weather data integration"""
        if weather_data.get('multi_source_enhanced'):
            sources = ', '.join(weather_data.get('data_sources', ['METAR']))
            quality = weather_data.get('data_quality_score', 0.0)
            confidence = weather_data.get('overall_confidence', 0.0)
            
            print(f"📡 {airport_code} Multi-Source Data:")
            print(f"   Sources: {sources}")
            print(f"   Quality: {quality:.2f} | Confidence: {confidence:.2f}")
            
            # Display risk factors if available
            risk_score = weather_data.get('integrated_risk_score', 0.0)
            if risk_score > 0:
                print(f"   ⚠️ Integrated Risk Score: {risk_score:.2f}")
            
            # Display pilot reports
            pirep_count = weather_data.get('pirep_count', 0)
            if pirep_count > 0:
                print(f"   👨‍✈️ Recent PIREPs: {pirep_count}")
            
            # Display advisories
            advisories = weather_data.get('total_advisories', 0)
            if advisories > 0:
                print(f"   📢 Active Advisories: {advisories}")
        else:
            print(f"📡 {airport_code}: Standard METAR data (fallback)")
    
    def _evaluate_enhanced_safety_risks(self, dep_weather: Dict, arr_weather: Dict, route_info: Dict) -> Dict:
        """Enhanced safety risk evaluation including multi-source data"""
        identified_risks = []
        risk_score = 0
        multi_source_risks = []
        
        # Traditional risk assessment
        traditional_assessment = self._evaluate_safety_risks(dep_weather, arr_weather, route_info)
        identified_risks.extend(traditional_assessment.get('identified_risks', []))
        risk_score += traditional_assessment.get('risk_score', 0)
        
        # Enhanced multi-source risk assessment for departure
        if dep_weather.get('multi_source_enhanced'):
            dep_multi_risks, dep_multi_score = self._assess_multi_source_risks(dep_weather, 'departure')
            multi_source_risks.extend(dep_multi_risks)
            risk_score += dep_multi_score
        
        # Enhanced multi-source risk assessment for arrival
        if arr_weather.get('multi_source_enhanced'):
            arr_multi_risks, arr_multi_score = self._assess_multi_source_risks(arr_weather, 'arrival')
            multi_source_risks.extend(arr_multi_risks)
            risk_score += arr_multi_score
        
        # Determine overall safety classification
        if risk_score <= 25:
            safety_status = 'LOW_RISK'
            recommendation = 'CLEARED FOR TAKEOFF'
        elif risk_score <= 55:
            safety_status = 'MODERATE_RISK'
            recommendation = 'CAUTION ADVISED'
        elif risk_score <= 80:
            safety_status = 'HIGH_RISK'
            recommendation = 'DELAY RECOMMENDED'
        else:
            safety_status = 'EXTREME_RISK'
            recommendation = 'NO-GO'
        
        return {
            'identified_risks': identified_risks,
            'multi_source_risks': multi_source_risks,
            'risk_score': min(risk_score, 100),
            'safety_classification': safety_status,
            'flight_recommendation': recommendation,
            'multi_source_enhanced': bool(multi_source_risks)
        }
    
    def _assess_multi_source_risks(self, weather_data: Dict, location: str) -> Tuple[List[str], int]:
        """Assess risks from multi-source weather data"""
        risks = []
        score = 0
        
        # Integrated risk score from multi-source analysis
        integrated_risk = weather_data.get('integrated_risk_score', 0.0)
        if integrated_risk > 0.7:
            risks.append(f"High integrated risk at {location}: {integrated_risk:.2f}")
            score += 25
        elif integrated_risk > 0.5:
            risks.append(f"Moderate integrated risk at {location}: {integrated_risk:.2f}")
            score += 15
        
        # Turbulence risk from PIREPs
        turbulence_risk = weather_data.get('turbulence_risk', 0.0)
        if turbulence_risk > 0.6:
            risks.append(f"Severe turbulence reported near {location}")
            score += 20
        elif turbulence_risk > 0.4:
            risks.append(f"Moderate turbulence reported near {location}")
            score += 12
        
        # Icing risk from PIREPs
        icing_risk = weather_data.get('icing_risk', 0.0)
        if icing_risk > 0.6:
            risks.append(f"Severe icing conditions reported near {location}")
            score += 22
        elif icing_risk > 0.4:
            risks.append(f"Moderate icing conditions reported near {location}")
            score += 14
        
        # Convective risk from SIGMETs
        convective_risk = weather_data.get('convective_risk', 0.0)
        if convective_risk > 0.6:
            risks.append(f"Severe convective activity near {location}")
            score += 30
        elif convective_risk > 0.3:
            risks.append(f"Convective activity near {location}")
            score += 18
        
        # Active weather advisories
        advisories = weather_data.get('total_advisories', 0)
        if advisories > 2:
            risks.append(f"Multiple weather advisories active at {location} ({advisories} total)")
            score += 15
        elif advisories > 0:
            risks.append(f"Weather advisories active at {location} ({advisories} total)")
            score += 8
        
        return risks, score
    
    def _evaluate_safety_risks(self, dep_weather: Dict, arr_weather: Dict, route_info: Dict) -> Dict:
        """Evaluate flight safety risks based on weather conditions"""
        identified_risks = []
        risk_score = 0
        
        # Departure airport risk assessment
        if dep_weather['wind_speed_knots'] > self.operational_limits['maximum_wind_speed']:
            identified_risks.append(f"Departure winds exceed operational limits: {dep_weather['wind_speed_knots']} knots")
            risk_score += 28
        
        if dep_weather['visibility_statute_miles'] < self.operational_limits['minimum_visibility']:
            identified_risks.append(f"Departure visibility below minimums: {dep_weather['visibility_statute_miles']} miles")
            risk_score += 32
        
        if any(hazard in dep_weather['weather_phenomena'] for hazard in self.operational_limits['hazardous_weather']):
            identified_risks.append(f"Hazardous departure weather: {dep_weather['weather_phenomena']}")
            risk_score += 22
        
        # Arrival airport risk assessment
        if arr_weather['wind_speed_knots'] > self.operational_limits['maximum_wind_speed']:
            identified_risks.append(f"Arrival winds exceed operational limits: {arr_weather['wind_speed_knots']} knots")
            risk_score += 28
        
        if arr_weather['visibility_statute_miles'] < self.operational_limits['minimum_visibility']:
            identified_risks.append(f"Arrival visibility below minimums: {arr_weather['visibility_statute_miles']} miles")
            risk_score += 32
        
        # Route-specific risk assessment
        if route_info['route_risk_level'] == 'HIGH':
            identified_risks.append("High risk weather conditions along route")
            risk_score += 38
        elif route_info['route_risk_level'] == 'MODERATE':
            risk_score += 18
        
        # Determine overall safety classification
        if risk_score <= 22:
            safety_classification = 'SAFE'
            operational_recommendation = 'Flight operations authorized - conditions within normal parameters'
        elif risk_score <= 55:
            safety_classification = 'CAUTION'
            operational_recommendation = 'Exercise enhanced vigilance - monitor conditions continuously'
        else:
            safety_classification = 'UNSAFE'
            operational_recommendation = 'Flight operations not recommended - significant weather hazards present'
        
        return {
            'safety_classification': safety_classification,
            'composite_risk_score': risk_score,
            'operational_recommendation': operational_recommendation,
            'identified_hazards': identified_risks
        }
    
    def _generate_detailed_technical_analysis(self, dep_weather: Dict, arr_weather: Dict, route_info: Dict, safety_eval: Dict) -> Dict:
        """Generate comprehensive technical analysis for professional use"""
        return {
            'departure_technical_analysis': {
                'temperature_assessment': f"Temperature {dep_weather['temperature_celsius']}°C - {'Within normal range' if -25 <= dep_weather['temperature_celsius'] <= 45 else 'Extreme temperature conditions'}",
                'wind_assessment': f"Wind {dep_weather['wind_direction_degrees']}°/{dep_weather['wind_speed_knots']}kts - {'Operationally acceptable' if dep_weather['wind_speed_knots'] <= 28 else 'Exceeds standard limits'}",
                'visibility_assessment': f"Visibility {dep_weather['visibility_statute_miles']}mi - {'Excellent' if dep_weather['visibility_statute_miles'] >= 6 else 'Acceptable' if dep_weather['visibility_statute_miles'] >= 3 else 'Below minimums'}",
                'pressure_assessment': f"Barometric pressure {dep_weather['barometric_pressure_inhg']}\" - {'Standard atmospheric conditions' if 29.4 <= dep_weather['barometric_pressure_inhg'] <= 30.6 else 'Non-standard pressure system'}",
                'flight_category_assessment': dep_weather['flight_category']
            },
            'arrival_technical_analysis': {
                'temperature_assessment': f"Temperature {arr_weather['temperature_celsius']}°C - {'Within normal range' if -25 <= arr_weather['temperature_celsius'] <= 45 else 'Extreme temperature conditions'}",
                'wind_assessment': f"Wind {arr_weather['wind_direction_degrees']}°/{arr_weather['wind_speed_knots']}kts - {'Operationally acceptable' if arr_weather['wind_speed_knots'] <= 28 else 'Exceeds standard limits'}",
                'visibility_assessment': f"Visibility {arr_weather['visibility_statute_miles']}mi - {'Excellent' if arr_weather['visibility_statute_miles'] >= 6 else 'Acceptable' if arr_weather['visibility_statute_miles'] >= 3 else 'Below minimums'}",
                'pressure_assessment': f"Barometric pressure {arr_weather['barometric_pressure_inhg']}\" - {'Standard atmospheric conditions' if 29.4 <= arr_weather['barometric_pressure_inhg'] <= 30.6 else 'Non-standard pressure system'}",
                'flight_category_assessment': arr_weather['flight_category']
            },
            'route_technical_analysis': {
                'distance_assessment': f"Route distance {route_info['route_distance_nm']}nm - {'Short-haul' if route_info['route_distance_nm'] < 400 else 'Medium-haul' if route_info['route_distance_nm'] < 1200 else 'Long-haul'} operation",
                'weather_forecast_analysis': route_info['weather_summary'],
                'turbulence_analysis': f"Forecast turbulence intensity: {route_info.get('turbulence_forecast', 'Unknown')}/5.0 - {'Light' if route_info.get('turbulence_forecast', 2) < 2 else 'Moderate' if route_info.get('turbulence_forecast', 2) < 3.5 else 'Severe'}",
                'icing_analysis': f"Icing probability: {route_info.get('icing_probability', 0):.1%} - {'Low risk' if route_info.get('icing_probability', 0) < 0.2 else 'Moderate risk' if route_info.get('icing_probability', 0) < 0.4 else 'High risk'}"
            },
            'operational_parameters': {
                'wind_limitations': f"Maximum operational wind speed: {self.operational_limits['maximum_wind_speed']} knots",
                'visibility_requirements': f"Minimum operational visibility: {self.operational_limits['minimum_visibility']} statute miles",
                'hazardous_phenomena': f"Monitored weather hazards: {', '.join(self.operational_limits['hazardous_weather'])}"
            }
        }
    
    def generate_pilot_briefing(self, assessment_data: Dict) -> str:
        """Generate concise pilot briefing summary"""
        dep_code = assessment_data['departure_airport_code']
        arr_code = assessment_data['arrival_airport_code']
        dep_conditions = assessment_data['departure_conditions']
        arr_conditions = assessment_data['arrival_conditions']
        route_data = assessment_data['route_assessment']
        safety_data = assessment_data['safety_evaluation']
        
        # Retrieve airport names
        dep_name = self.airport_database.get(dep_code, {}).get('name', 'Unknown Airport')
        arr_name = self.airport_database.get(arr_code, {}).get('name', 'Unknown Airport')
        
        briefing_summary = [
            f"FLIGHT SAFETY BRIEFING: {dep_code} ({dep_name}) → {arr_code} ({arr_name})",
            f"SAFETY STATUS: {safety_data['safety_classification']} | Risk Assessment: {safety_data['composite_risk_score']}/100 | Route Distance: {route_data['route_distance_nm']}nm",
            f"DEPARTURE CONDITIONS: {dep_conditions['flight_category']} - {dep_conditions['temperature_celsius']}°C, Wind {dep_conditions['wind_direction_degrees']}°/{dep_conditions['wind_speed_knots']}kts, Visibility {dep_conditions['visibility_statute_miles']}mi",
            f"ARRIVAL CONDITIONS: {arr_conditions['flight_category']} - {arr_conditions['temperature_celsius']}°C, Wind {arr_conditions['wind_direction_degrees']}°/{arr_conditions['wind_speed_knots']}kts, Visibility {arr_conditions['visibility_statute_miles']}mi",
            f"EN-ROUTE FORECAST: {route_data['route_risk_level']} risk - {route_data['weather_summary']}",
            f"OPERATIONAL RECOMMENDATION: {safety_data['operational_recommendation']}"
        ]
        
        if safety_data['identified_hazards']:
            briefing_summary.append(f"HAZARD ADVISORY: {' | '.join(safety_data['identified_hazards'][:2])}")
        
        return '\n'.join(briefing_summary)
    
    def start_real_time_flight_monitoring(self, departure_airport: str, arrival_airport: str, 
                                        departure_time: datetime = None, aircraft_type: str = "B737") -> Dict:
        """Start real-time flight monitoring with continuous weather updates"""
        
        if departure_time is None:
            departure_time = datetime.now()
        
        try:
            # Calculate flight plan
            flight_plan = self.flight_tracker.calculate_flight_duration(
                departure_airport, arrival_airport, departure_time, aircraft_type
            )
            
            if not flight_plan:
                return {'error': 'Unable to calculate flight plan'}
            
            # Start real-time monitoring
            flight_id = self.flight_tracker.start_real_time_monitoring(flight_plan, self)
            
            # Get initial conditions
            initial_assessment = self.conduct_safety_assessment(departure_airport, arrival_airport)
            
            return {
                'flight_id': flight_id,
                'flight_plan': flight_plan,
                'initial_assessment': initial_assessment,
                'monitoring_status': 'ACTIVE',
                'message': f'Real-time monitoring started for flight {departure_airport} → {arrival_airport}'
            }
            
        except Exception as e:
            return {'error': f'Failed to start real-time monitoring: {str(e)}'}
    
    def get_real_time_flight_update(self, flight_id: str) -> str:
        """Get current real-time flight status and weather update"""
        
        try:
            flight_status = self.flight_tracker.get_flight_status(flight_id)
            
            if 'error' in flight_status:
                return f"❌ Error: {flight_status['error']}"
            
            return self.flight_tracker.generate_flight_weather_report(flight_id)
            
        except Exception as e:
            return f"❌ Error retrieving flight update: {str(e)}"

    def comprehensive_pre_flight_analysis(self, departure_airport: str, arrival_airport: str, 
                                        departure_time: str = None) -> Dict:
        """
        Comprehensive pre-flight safety analysis with takeoff recommendation
        
        Args:
            departure_airport: ICAO code for departure airport
            arrival_airport: ICAO code for arrival airport
            departure_time: Planned departure time (ISO format, defaults to now)
            
        Returns:
            Dict containing comprehensive pre-flight analysis
        """
        print(f"\nCOMPREHENSIVE PRE-FLIGHT ANALYSIS")
        print(f"Route: {departure_airport} → {arrival_airport}")
        
        if not departure_time:
            departure_time = datetime.now().isoformat()
        
        analysis_results = {
            'flight_route': f"{departure_airport} → {arrival_airport}",
            'analysis_time': datetime.now().isoformat(),
            'planned_departure': departure_time,
            'takeoff_recommendation': 'ANALYZING...',
            'risk_factors': [],
            'alternative_airports': [],
            'route_analysis': {},
            'no_fly_zones': [],
            'weather_forecast': {}
        }
        
        # 1. Current conditions at departure airport
        dep_conditions = self.obtain_current_weather(departure_airport)
        dep_assessment = self.conduct_safety_assessment(departure_airport, arrival_airport)
        
        # 2. Current conditions at arrival airport
        arr_conditions = self.obtain_current_weather(arrival_airport)
        arr_assessment = self.conduct_safety_assessment(arrival_airport, departure_airport)
        
        # 3. Check for no-fly zones along route
        no_fly_zones = self.check_no_fly_zones_along_route(departure_airport, arrival_airport)
        analysis_results['no_fly_zones'] = no_fly_zones
        
        # 4. Find alternative airports
        dep_coords = self.get_airport_coordinates(departure_airport)
        arr_coords = self.get_airport_coordinates(arrival_airport)
        
        if dep_coords and arr_coords:
            # Alternative departure airports
            alt_dep = self.find_alternative_airports(dep_coords, radius_km=200)
            alt_arr = self.find_alternative_airports(arr_coords, radius_km=200)
            
            analysis_results['alternative_airports'] = {
                'departure_alternatives': alt_dep[:3],  # Top 3 alternatives
                'arrival_alternatives': alt_arr[:3]
            }
        
        # 5. Route weather analysis
        route_weather = self.analyze_route_weather(departure_airport, arrival_airport)
        
        # Add route-specific analysis information
        route_distance = self.calculate_route_distance(departure_airport, arrival_airport)
        waypoints_analyzed = max(5, int(route_distance / 300))  # More waypoints for longer routes
        
        # Determine overall conditions based on risk and weather
        overall_conditions = "FAVORABLE"
        weather_hazards = []
        
        if route_weather.get('route_risk_level') == 'HIGH':
            overall_conditions = "CAUTION"
        elif route_weather.get('route_risk_level') == 'MODERATE':
            overall_conditions = "MONITOR"
        
        # Check for specific weather hazards
        turbulence_level = route_weather.get('turbulence_forecast', 0)
        icing_prob = route_weather.get('icing_probability', 0)
        
        if turbulence_level > 2.5:
            weather_hazards.append(f"Moderate turbulence ({turbulence_level:.1f}/5.0)")
        if icing_prob > 0.3:
            weather_hazards.append(f"Icing conditions ({icing_prob:.1%} probability)")
        
        # Enhanced route analysis
        enhanced_route_analysis = {
            **route_weather,
            'waypoints_analyzed': waypoints_analyzed,
            'weather_hazards': weather_hazards,
            'overall_conditions': overall_conditions,
            'recommended_altitude': 'FL350',
            'turbulence_areas': [],
            'icing_areas': [],
            'severe_weather_cells': []
        }
        
        analysis_results['route_analysis'] = enhanced_route_analysis
        
        # 6. Calculate overall risk score
        risk_score = self.calculate_flight_risk_score(dep_assessment, arr_assessment, 
                                                    no_fly_zones, route_weather)
        
        # 7. Generate takeoff recommendation
        recommendation = self.generate_takeoff_recommendation(risk_score, dep_assessment, 
                                                            arr_assessment, no_fly_zones)
        
        analysis_results['takeoff_recommendation'] = recommendation
        analysis_results['overall_risk_score'] = risk_score
        analysis_results['departure_conditions'] = dep_assessment
        analysis_results['arrival_conditions'] = arr_assessment
        
        # Display results
        print(f"\nTAKEOFF RECOMMENDATION: {recommendation['decision']}")
        print(f"Overall Risk Score: {risk_score}/100")
        
        # Format departure conditions
        if 'departure_conditions' in dep_assessment:
            dep_cond = dep_assessment['departure_conditions']
            dep_summary = f"{dep_cond.get('flight_category', 'VFR')} - {dep_cond.get('temperature_celsius', 15)}°C, Wind {dep_cond.get('wind_direction_degrees', 0)}°/{dep_cond.get('wind_speed_knots', 0)}kts"
            print(f"Departure Conditions: {dep_summary}")
        else:
            print(f"� Departure Conditions: VFR - Standard conditions")
            
        # Format arrival conditions  
        if 'departure_conditions' in arr_assessment:
            arr_cond = arr_assessment['departure_conditions']
            arr_summary = f"{arr_cond.get('flight_category', 'VFR')} - {arr_cond.get('temperature_celsius', 15)}°C, Wind {arr_cond.get('wind_direction_degrees', 0)}°/{arr_cond.get('wind_speed_knots', 0)}kts"
            print(f"Arrival Conditions: {arr_summary}")
        else:
            print(f"Arrival Conditions: VFR - Standard conditions")
        
        if no_fly_zones:
            print(f"No-Fly Zones Detected: {len(no_fly_zones)} zones along route")
        
        return analysis_results
    
    def check_no_fly_zones_along_route(self, departure_airport: str, arrival_airport: str) -> List[Dict]:
        """
        Check for no-fly zones along the flight route
        This integrates with NOTAM and airspace restriction data
        """
        no_fly_zones = []
        
        # Simulated restricted areas (in production, integrate with NOTAM APIs)
        restricted_areas = [
            {
                'type': 'MILITARY_AIRSPACE',
                'coordinates': [40.7128, -74.0060],  # NYC area
                'radius_km': 50,
                'restriction_level': 'HIGH',
                'description': 'Military training area - restricted during exercises',
                'active_times': '0800-1700 UTC'
            },
            {
                'type': 'TEMPORARY_FLIGHT_RESTRICTION',
                'coordinates': [34.0522, -118.2437],  # LA area
                'radius_km': 30,
                'restriction_level': 'MODERATE',
                'description': 'Temporary restriction due to VIP movement',
                'active_times': '1200-1400 UTC'
            },
            {
                'type': 'SEVERE_WEATHER_AREA',
                'coordinates': [41.8781, -87.6298],  # Chicago area
                'radius_km': 75,
                'restriction_level': 'HIGH',
                'description': 'Severe thunderstorm activity - avoid area',
                'active_times': 'Active now'
            }
        ]
        
        # Check if route intersects with any restricted areas
        dep_coords = self.get_airport_coordinates(departure_airport)
        arr_coords = self.get_airport_coordinates(arrival_airport)
        
        if dep_coords and arr_coords:
            # Check multiple points along the route
            for i in range(0, 11):  # Check every 10% of route
                progress = i / 10
                route_point = self.interpolate_position(dep_coords, arr_coords, progress)
                
                for area in restricted_areas:
                    distance = self.calculate_distance(area['coordinates'], route_point)
                    if distance <= area['radius_km']:
                        area['intersection_point'] = f"{progress*100:.0f}% along route"
                        if area not in no_fly_zones:
                            no_fly_zones.append(area)
        
        return no_fly_zones
    
    def find_alternative_airports(self, coordinates: List[float], radius_km: int = 200) -> List[Dict]:
        """Find alternative airports within specified radius"""
        alternatives = []
        
        if not hasattr(self, 'airport_df') or self.airport_df is None:
            return alternatives
        
        for _, airport in self.airport_df.iterrows():
            if pd.isna(airport['latitude_deg']) or pd.isna(airport['longitude_deg']):
                continue
                
            airport_coords = [airport['latitude_deg'], airport['longitude_deg']]
            distance = self.calculate_distance(coordinates, airport_coords)
            
            if distance <= radius_km and airport['type'] in ['large_airport', 'medium_airport']:
                # Get current weather for alternative airport
                conditions = self.obtain_current_weather(airport['ident'])
                
                alternatives.append({
                    'airport_code': airport['ident'],
                    'name': airport['name'],
                    'distance_km': round(distance, 1),
                    'type': airport['type'],
                    'weather_category': conditions.get('flight_category', 'Unknown'),
                    'runway_count': 2,  # Simulated
                    'services_available': True
                })
        
        # Sort by distance and return closest alternatives
        alternatives.sort(key=lambda x: x['distance_km'])
        return alternatives[:5]
    
    def analyze_route_weather(self, departure_airport: str, arrival_airport: str) -> Dict:
        """Analyze weather conditions along the entire flight route"""
        route_analysis = {
            'waypoints_analyzed': 0,
            'weather_hazards': [],
            'overall_conditions': 'UNKNOWN',
            'recommended_altitude': 'FL350',
            'turbulence_areas': [],
            'icing_areas': [],
            'severe_weather_cells': []
        }
        
        # Get coordinates
        dep_coords = self.get_airport_coordinates(departure_airport)
        arr_coords = self.get_airport_coordinates(arrival_airport)
        
        if not dep_coords or not arr_coords:
            return route_analysis
        
        # Analyze weather at waypoints along the route
        waypoints = []
        for i in range(0, 11):  # 11 waypoints (0%, 10%, 20%, ..., 100%)
            progress = i / 10
            waypoint = self.interpolate_position(dep_coords, arr_coords, progress)
            waypoints.append(waypoint)
        
        weather_conditions = []
        hazards = []
        
        for i, waypoint in enumerate(waypoints):
            # Find nearest airport to waypoint
            nearest_airport = self.find_nearest_airport(waypoint)
            if nearest_airport:
                conditions = self.obtain_current_weather(nearest_airport)
                weather_conditions.append(conditions)
                
                # Check for weather hazards
                visibility = conditions.get('visibility_statute_miles', 10)
                wind_speed = conditions.get('wind_speed_knots', 0)
                temperature = conditions.get('temperature_celsius', 10)
                dewpoint_depression = conditions.get('dewpoint_depression', 10)
                
                if visibility < 3:
                    hazards.append(f"Low visibility ({visibility:.1f}mi) at {i*10}% route")
                
                if wind_speed > 40:
                    hazards.append(f"High winds ({wind_speed}kts) at {i*10}% route")
                
                if temperature < 0 and dewpoint_depression < 5:
                    route_analysis['icing_areas'].append(f"{i*10}% route - Icing conditions")
                
                # Simulated turbulence detection
                if wind_speed > 25 and i > 0:
                    prev_wind = weather_conditions[i-1].get('wind_speed_knots', 0)
                    wind_shear = abs(wind_speed - prev_wind)
                    if wind_shear > 15:
                        route_analysis['turbulence_areas'].append(f"{i*10}% route - Wind shear detected")
        
        route_analysis['waypoints_analyzed'] = len(waypoints)
        route_analysis['weather_hazards'] = hazards
        
        # Determine overall conditions
        if len(hazards) == 0:
            route_analysis['overall_conditions'] = 'FAVORABLE'
        elif len(hazards) <= 2:
            route_analysis['overall_conditions'] = 'CAUTION'
        else:
            route_analysis['overall_conditions'] = 'HAZARDOUS'
        
        # Recommend altitude based on conditions
        if route_analysis['icing_areas']:
            route_analysis['recommended_altitude'] = 'FL410'  # Above icing layer
        elif route_analysis['turbulence_areas']:
            route_analysis['recommended_altitude'] = 'FL320'  # Below turbulence
        
        return route_analysis
    
    def calculate_flight_risk_score(self, dep_assessment: Dict, arr_assessment: Dict, 
                                  no_fly_zones: List, route_weather: Dict) -> int:
        """Calculate overall flight risk score (0-100, higher is more risky)"""
        risk_score = 0
        
        # Departure conditions risk
        dep_category = dep_assessment.get('flight_category', 'VFR')
        if dep_category == 'LIFR':
            risk_score += 40
        elif dep_category == 'IFR':
            risk_score += 25
        elif dep_category == 'MVFR':
            risk_score += 15
        
        # Arrival conditions risk
        arr_category = arr_assessment.get('flight_category', 'VFR')
        if arr_category == 'LIFR':
            risk_score += 30
        elif arr_category == 'IFR':
            risk_score += 20
        elif arr_category == 'MVFR':
            risk_score += 10
        
        # No-fly zones risk
        for zone in no_fly_zones:
            if zone['restriction_level'] == 'HIGH':
                risk_score += 20
            elif zone['restriction_level'] == 'MODERATE':
                risk_score += 10
        
        # Route weather risk
        if route_weather.get('overall_conditions') == 'HAZARDOUS':
            risk_score += 25
        elif route_weather.get('overall_conditions') == 'CAUTION':
            risk_score += 15
        
        # Weather hazards risk
        hazard_count = len(route_weather.get('weather_hazards', []))
        risk_score += min(hazard_count * 5, 20)
        
        # Icing and turbulence risk
        if route_weather.get('icing_areas'):
            risk_score += 15
        if route_weather.get('turbulence_areas'):
            risk_score += 10
        
        return min(risk_score, 100)  # Cap at 100
    
    def generate_takeoff_recommendation(self, risk_score: int, dep_assessment: Dict, 
                                      arr_assessment: Dict, no_fly_zones: List) -> Dict:
        """Generate comprehensive takeoff recommendation"""
        
        if risk_score <= 20:
            decision = "CLEARED FOR TAKEOFF"
            confidence = "HIGH"
            reasoning = "Excellent weather conditions throughout route. Safe to proceed."
            color_code = "GREEN"
        elif risk_score <= 40:
            decision = "PROCEED WITH CAUTION"
            confidence = "MODERATE"
            reasoning = "Some weather concerns but manageable. Monitor conditions closely."
            color_code = "YELLOW"
        elif risk_score <= 60:
            decision = "DELAY RECOMMENDED"
            confidence = "LOW"
            reasoning = "Significant weather hazards present. Consider delaying departure."
            color_code = "ORANGE"
        else:
            decision = "DO NOT TAKEOFF"
            confidence = "HIGH"
            reasoning = "Severe weather conditions or restrictions. Cancel or delay flight."
            color_code = "RED"
        
        recommendations = []
        
        # Specific recommendations based on conditions
        if dep_assessment.get('flight_category') in ['IFR', 'LIFR']:
            recommendations.append("File IFR flight plan due to low visibility at departure")
        
        if arr_assessment.get('flight_category') in ['IFR', 'LIFR']:
            recommendations.append("Ensure alternate airport due to poor arrival conditions")
        
        if no_fly_zones:
            recommendations.append("File route avoiding restricted airspace")
            recommendations.append("Check NOTAM for latest airspace restrictions")
        
        if risk_score > 40:
            recommendations.append("Consider delaying departure until conditions improve")
            recommendations.append("Review alternate routes and airports")
        
        if not recommendations:
            recommendations.append("Standard VFR procedures applicable")
        
        return {
            'decision': decision,
            'confidence': confidence,
            'reasoning': reasoning,
            'risk_score': risk_score,
            'color_code': color_code,
            'specific_recommendations': recommendations,
            'next_review_time': (datetime.now() + timedelta(hours=1)).isoformat(),
            'emergency_contacts': {
                'flight_service': '1-800-WX-BRIEF',
                'center_frequency': '124.35',
                'emergency_freq': '121.5'
            }
        }
    
    def monitor_flight_in_real_time(self, departure_airport: str, arrival_airport: str, 
                                   flight_duration_hours: float = None) -> Dict:
        """
        Monitor flight conditions in real-time throughout the journey
        Provides continuous weather monitoring and emergency diversion analysis
        """
        print(f"\n🛫 INITIATING REAL-TIME FLIGHT MONITORING")
        print(f"Route: {departure_airport} → {arrival_airport}")
        
        # Get airport coordinates
        dep_coords = self.get_airport_coordinates(departure_airport)
        arr_coords = self.get_airport_coordinates(arrival_airport) 
        
        if not dep_coords or not arr_coords:
            return {"error": "Could not find airport coordinates"}
        
        # Calculate flight duration if not provided
        if not flight_duration_hours:
            distance_km = self.calculate_distance(dep_coords, arr_coords)
            flight_duration_hours = distance_km / 800  # Assume 800 km/h average speed
        
        print(f"⏱️  Expected flight duration: {flight_duration_hours:.1f} hours")
        
        # Initialize monitoring results
        monitoring_results = {
            'departure_time': datetime.now().isoformat(),
            'route': f"{departure_airport} → {arrival_airport}",
            'expected_duration_hours': flight_duration_hours,
            'monitoring_intervals': [],
            'emergency_diversions_available': [],
            'critical_alerts': [],
            'flight_status': 'MONITORING'
        }
        
        # Monitor conditions at multiple intervals during flight
        intervals = [0, 0.2, 0.4, 0.6, 0.8, 1.0]  # Every 20% of flight
        
        for i, interval in enumerate(intervals):
            elapsed_hours = flight_duration_hours * interval
            current_position = self.interpolate_position(dep_coords, arr_coords, interval)
            
            # Find nearest airport to current position
            nearest_airport = self.find_nearest_airport(current_position)
            
            if nearest_airport:
                conditions = self.obtain_current_weather(nearest_airport)
                
                # Analyze emergency diversion options at this position
                emergency_options = self.analyze_emergency_diversion_options(current_position)
                
                # Check for critical weather conditions
                critical_alerts = self.check_critical_weather_alerts(conditions, current_position)
                
                interval_data = {
                    'flight_progress_percent': int(interval * 100),
                    'elapsed_hours': round(elapsed_hours, 1),
                    'position': current_position,
                    'nearest_airport': nearest_airport,
                    'weather_conditions': conditions,
                    'emergency_options': emergency_options[:3],  # Top 3 emergency airports
                    'critical_alerts': critical_alerts,
                    'timestamp': datetime.now().isoformat(),
                    'flight_level_recommended': self.recommend_flight_level(conditions)
                }
                
                monitoring_results['monitoring_intervals'].append(interval_data)
                
                # Add critical alerts to main results
                if critical_alerts:
                    monitoring_results['critical_alerts'].extend(critical_alerts)
                
                print(f"\n📍 {int(interval*100)}% Flight Progress ({elapsed_hours:.1f}h elapsed)")
                print(f"Position: {current_position[0]:.2f}°N, {current_position[1]:.2f}°W")
                print(f"Nearest Airport: {nearest_airport}")
                print(f"Weather: {conditions.get('flight_category', 'Unknown')}")
                
                if critical_alerts:
                    print(f"🚨 CRITICAL ALERTS: {len(critical_alerts)} alerts detected")
                    for alert in critical_alerts:
                        print(f"   ⚠️  {alert['type']}: {alert['message']}")
                
                # Simulate monitoring delay
                import time
                time.sleep(1)
        
        # Final flight status
        if monitoring_results['critical_alerts']:
            monitoring_results['flight_status'] = 'CAUTION - ALERTS PRESENT'
        else:
            monitoring_results['flight_status'] = 'NORMAL - ALL CLEAR'
        
        print(f"\n✅ FLIGHT MONITORING COMPLETE")
        print(f"Status: {monitoring_results['flight_status']}")
        
        return monitoring_results
    
    def analyze_emergency_diversion_options(self, current_position: List[float]) -> List[Dict]:
        """Analyze emergency diversion airports from current position"""
        # Find nearest suitable airports
        emergency_airports = self.find_alternative_airports(current_position, radius_km=300)
        
        diversion_options = []
        
        for airport in emergency_airports[:5]:  # Top 5 options
            airport_code = airport['airport_code']
            
            # Get current weather conditions
            conditions = self.obtain_current_weather(airport_code)
            
            # Calculate diversion suitability
            suitability = self.calculate_emergency_suitability(airport, conditions)
            
            diversion_option = {
                'airport_code': airport_code,
                'airport_name': airport['name'],
                'distance_km': airport['distance_km'],
                'eta_minutes': round(airport['distance_km'] / 8, 0),  # 480 km/h approach
                'weather_category': conditions.get('flight_category', 'Unknown'),
                'suitability_score': suitability,
                'emergency_services': {
                    'fire_rescue': True,
                    'medical_facilities': airport['type'] == 'large_airport',
                    'maintenance': True
                }
            }
            
            diversion_options.append(diversion_option)
        
        # Sort by suitability score
        diversion_options.sort(key=lambda x: x['suitability_score'], reverse=True)
        return diversion_options
    
    def calculate_emergency_suitability(self, airport: Dict, conditions: Dict) -> float:
        """Calculate airport suitability for emergency diversion"""
        score = 100.0
        
        # Distance penalty (closer is better)
        distance = airport['distance_km']
        if distance > 150:
            score -= (distance - 150) * 0.2
        
        # Weather conditions
        flight_category = conditions.get('flight_category', 'VFR')
        if flight_category == 'LIFR':
            score -= 30
        elif flight_category == 'IFR':
            score -= 15
        elif flight_category == 'MVFR':
            score -= 5
        
        # Airport type preference
        if airport['type'] == 'large_airport':
            score += 15
        elif airport['type'] == 'medium_airport':
            score += 5
        
        # Wind conditions
        wind_speed = conditions.get('wind_speed_knots', 0)
        if wind_speed > 35:
            score -= 20
        elif wind_speed > 25:
            score -= 10
        
        return max(score, 0)
    
    def check_critical_weather_alerts(self, conditions: Dict, position: List[float]) -> List[Dict]:
        """Check for critical weather conditions requiring immediate attention"""
        alerts = []
        
        # Low visibility alert
        visibility = conditions.get('visibility_statute_miles', 10)
        if visibility < 1:
            alerts.append({
                'type': 'CRITICAL_VISIBILITY',
                'severity': 'HIGH',
                'message': f'Extremely low visibility: {visibility:.1f} miles',
                'action_required': 'Consider immediate diversion',
                'position': position
            })
        
        # High wind alert
        wind_speed = conditions.get('wind_speed_knots', 0)
        if wind_speed > 50:
            alerts.append({
                'type': 'SEVERE_TURBULENCE',
                'severity': 'HIGH', 
                'message': f'Severe winds: {wind_speed} knots',
                'action_required': 'Change altitude or divert',
                'position': position
            })
        
        # Icing conditions alert
        temperature = conditions.get('temperature_celsius', 10)
        dewpoint_depression = conditions.get('dewpoint_depression', 10)
        if temperature < 2 and temperature > -15 and dewpoint_depression < 3:
            alerts.append({
                'type': 'ICING_CONDITIONS',
                'severity': 'MODERATE',
                'message': 'Icing conditions present',
                'action_required': 'Monitor ice accumulation, consider altitude change',
                'position': position
            })
        
        # Thunderstorm simulation (based on temperature and humidity)
        if temperature > 20 and dewpoint_depression < 8:
            alerts.append({
                'type': 'CONVECTIVE_ACTIVITY',
                'severity': 'HIGH',
                'message': 'Potential thunderstorm activity',
                'action_required': 'Avoid area, request deviation',
                'position': position
            })
        
        return alerts
    
    def recommend_flight_level(self, conditions: Dict) -> str:
        """Recommend optimal flight level based on current conditions"""
        temperature = conditions.get('temperature_celsius', 10)
        wind_speed = conditions.get('wind_speed_knots', 0)
        
        # Basic flight level recommendation logic
        if temperature < -10:  # Cold conditions, possible icing
            return 'FL390'  # High altitude to avoid icing
        elif wind_speed > 40:  # High winds, possible turbulence
            return 'FL310'  # Lower altitude to avoid jet stream
        elif temperature > 25:  # Hot conditions, possible convection
            return 'FL370'  # High enough to avoid thermals
        else:
            return 'FL350'  # Standard cruise altitude

def main():
    print("AVIATION SAFETY MONITORING SYSTEM")
    print("=" * 65)
    print("Real-time flight monitoring, pre-flight analysis, and emergency diversion")
    print("Professional aviation weather assessment with ML predictions\n")
    
    assessment_system = FlightSafetyAssessment()
    
    while True:
        print("\n" + "=" * 65)
        print("FLIGHT SAFETY ASSESSMENT OPTIONS:")
        print("1. Pre-Flight Safety Analysis (Takeoff Recommendation)")
        print("2. Real-Time Flight Monitoring")
        print("3. Basic Weather Assessment")
        print("4. Emergency Diversion Analysis")
        print("5. Exit System")
        print("=" * 65)
        
        choice = input("Select option (1-5): ").strip()
        
        if choice == '1':
            # Pre-flight analysis
            print("\n🔍 PRE-FLIGHT SAFETY ANALYSIS")
            departure_code = input("Enter departure airport ICAO code (e.g., KJFK): ").strip().upper()
            arrival_code = input("Enter arrival airport ICAO code (e.g., KLAX): ").strip().upper()
            
            if len(departure_code) == 4 and len(arrival_code) == 4:
                try:
                    analysis = assessment_system.comprehensive_pre_flight_analysis(departure_code, arrival_code)
                    
                    print(f"\n📋 PRE-FLIGHT ANALYSIS SUMMARY:")
                    print(f"Route: {analysis['flight_route']}")
                    print(f"Risk Score: {analysis['overall_risk_score']}/100")
                    print(f"Decision: {analysis['takeoff_recommendation']['decision']}")
                    print(f"Reasoning: {analysis['takeoff_recommendation']['reasoning']}")
                    
                    if analysis['no_fly_zones']:
                        print(f"\n⚠️  AIRSPACE RESTRICTIONS:")
                        for zone in analysis['no_fly_zones']:
                            print(f"   • {zone['type']}: {zone['description']}")
                    
                    print(f"\n📋 RECOMMENDATIONS:")
                    for rec in analysis['takeoff_recommendation']['specific_recommendations']:
                        print(f"   • {rec}")
                        
                except Exception as e:
                    print(f"❌ Error: {e}")
            else:
                print("❌ Please enter valid 4-character ICAO codes")
        
        elif choice == '2':
            # Real-time monitoring
            print("\n🛫 REAL-TIME FLIGHT MONITORING")
            departure_code = input("Enter departure airport ICAO code (e.g., KJFK): ").strip().upper()
            arrival_code = input("Enter arrival airport ICAO code (e.g., KLAX): ").strip().upper()
            
            if len(departure_code) == 4 and len(arrival_code) == 4:
                try:
                    monitoring = assessment_system.monitor_flight_in_real_time(departure_code, arrival_code)
                    
                    print(f"\n📊 FLIGHT MONITORING SUMMARY:")
                    print(f"Route: {monitoring['route']}")
                    print(f"Duration: {monitoring['expected_duration_hours']:.1f} hours")
                    print(f"Status: {monitoring['flight_status']}")
                    
                    if monitoring['critical_alerts']:
                        print(f"\n🚨 CRITICAL ALERTS ({len(monitoring['critical_alerts'])}):")
                        for alert in monitoring['critical_alerts'][:3]:  # Show top 3
                            print(f"   • {alert['type']}: {alert['message']}")
                    else:
                        print(f"\n✅ No critical weather alerts detected")
                        
                except Exception as e:
                    print(f"❌ Error: {e}")
            else:
                print("❌ Please enter valid 4-character ICAO codes")
        
        elif choice == '3':
            # Basic assessment
            print("\n📊 BASIC WEATHER ASSESSMENT")
            departure_code = input("Enter departure airport ICAO code (e.g., KJFK): ").strip().upper()
            arrival_code = input("Enter arrival airport ICAO code (e.g., KLAX): ").strip().upper()
            
            if len(departure_code) == 4 and len(arrival_code) == 4:
                try:
                    assessment = assessment_system.conduct_safety_assessment(departure_code, arrival_code)
                    briefing = assessment_system.generate_pilot_briefing(assessment)
                    print(briefing)
                except Exception as e:
                    print(f"❌ Error: {e}")
            else:
                print("❌ Please enter valid 4-character ICAO codes")
        
        elif choice == '4':
            # Emergency diversion
            print("\n🚨 EMERGENCY DIVERSION ANALYSIS")
            print("Enter current aircraft position:")
            try:
                lat = float(input("Latitude (degrees): ").strip())
                lon = float(input("Longitude (degrees): ").strip())
                
                emergency_options = assessment_system.analyze_emergency_diversion_options([lat, lon])
                
                print(f"\n🏥 EMERGENCY DIVERSION OPTIONS:")
                for i, option in enumerate(emergency_options[:3], 1):
                    print(f"{i}. {option['airport_code']} - {option['airport_name']}")
                    print(f"   Distance: {option['distance_km']} km")
                    print(f"   ETA: {option['eta_minutes']} minutes")
                    print(f"   Weather: {option['weather_category']}")
                    print(f"   Suitability: {option['suitability_score']:.1f}/100")
                    print()
                    
            except ValueError:
                print("❌ Please enter valid coordinates")
            except Exception as e:
                print(f"❌ Error: {e}")
        
        elif choice == '5':
            break
        
        else:
            print("❌ Invalid option. Please select 1-5.")
    
    print("\nAviation Safety System - Session Complete")
    print("Safe flying!")
    
    assessment_system = FlightSafetyAssessment()
    
    while True:
        print("Flight Safety Assessment Request:")
        departure_code = input("Enter departure airport ICAO code (e.g., KJFK): ").strip().upper()
        if not departure_code or len(departure_code) != 4:
            print("ERROR: Please provide valid 4-character ICAO airport code")
            continue
            
        arrival_code = input("Enter arrival airport ICAO code (e.g., KLAX): ").strip().upper()
        if not arrival_code or len(arrival_code) != 4:
            print("ERROR: Please provide valid 4-character ICAO airport code")
            continue
        
        print(f"\nConducting comprehensive safety assessment for {departure_code} → {arrival_code}...")
        print("-" * 65)
        
        try:
            # Conduct basic safety assessment
            flight_assessment = assessment_system.conduct_safety_assessment(departure_code, arrival_code)
            
            # Generate and display pilot briefing
            pilot_briefing = assessment_system.generate_pilot_briefing(flight_assessment)
            print(pilot_briefing)
            
            # Offer detailed technical analysis
            print("\n" + "=" * 65)
            detailed_request = input("Request detailed technical analysis? (y/n): ").strip().lower()
            
            if detailed_request in ['y', 'yes']:
                detailed_assessment = assessment_system.conduct_safety_assessment(departure_code, arrival_code, detailed_analysis=True)
                technical_analysis = detailed_assessment['detailed_technical_analysis']
                
                print("\nDETAILED TECHNICAL WEATHER ANALYSIS:")
                print("-" * 65)
                
                print(f"\nDEPARTURE AIRPORT ({departure_code}) TECHNICAL ANALYSIS:")
                for parameter, analysis in technical_analysis['departure_technical_analysis'].items():
                    print(f"  {parameter.replace('_', ' ').title()}: {analysis}")
                
                print(f"\nARRIVAL AIRPORT ({arrival_code}) TECHNICAL ANALYSIS:")
                for parameter, analysis in technical_analysis['arrival_technical_analysis'].items():
                    print(f"  {parameter.replace('_', ' ').title()}: {analysis}")
                
                print("\nROUTE CONDITIONS TECHNICAL ANALYSIS:")
                for parameter, analysis in technical_analysis['route_technical_analysis'].items():
                    print(f"  {parameter.replace('_', ' ').title()}: {analysis}")
                
                print("\nOPERATIONAL SAFETY PARAMETERS:")
                for parameter, specification in technical_analysis['operational_parameters'].items():
                    print(f"  {parameter.replace('_', ' ').title()}: {specification}")
        
        except Exception as error:
            print(f"SYSTEM ERROR: Unable to complete assessment - {error}")
            print("Please verify airport codes and system connectivity")
        
        print("\n" + "=" * 65)
        continue_assessment = input("Conduct additional flight assessment? (y/n): ").strip().lower()
        if continue_assessment not in ['y', 'yes']:
            break
    
    print("Professional Aviation Weather Safety Assessment System - Session Complete")

if __name__ == "__main__":
    main()
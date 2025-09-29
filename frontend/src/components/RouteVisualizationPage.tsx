import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './RouteVisualizationPage.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Navigation, Plane, MapPin, Ruler, Clock, 
  Fuel, Wind, Thermometer, Eye, Activity,
  Maximize, Minimize, RotateCcw, Download
} from 'lucide-react';

// Fix for default markers in Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface RouteVisualizationProps {
  departure: string;
  arrival: string;
  waypoints?: string[];
  weatherData?: any;
  flightData?: any;
}

interface AirportData {
  code: string;
  name: string;
  lat: number;
  lng: number;
}

const RouteVisualizationPage: React.FC<RouteVisualizationProps> = ({
  departure = 'KJFK',
  arrival = 'KLAX',
  waypoints = [],
  weatherData,
  flightData
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [routeStats, setRouteStats] = useState({
    totalDistance: 0,
    flightTime: '0h 0m',
    fuelRequired: 0,
    waypoints: 0
  });

  // Expanded airport database with more airports
  const getAirportData = (icao: string): AirportData => {
    const airportDB: Record<string, AirportData> = {
      'KJFK': { code: 'KJFK', name: 'John F. Kennedy International Airport', lat: 40.6413, lng: -73.7781 },
      'KLAX': { code: 'KLAX', name: 'Los Angeles International Airport', lat: 33.9425, lng: -118.4081 },
      'KORD': { code: 'KORD', name: 'Chicago O\'Hare International Airport', lat: 41.9742, lng: -87.9073 },
      'KDEN': { code: 'KDEN', name: 'Denver International Airport', lat: 39.8561, lng: -104.6737 },
      'KSFO': { code: 'KSFO', name: 'San Francisco International Airport', lat: 37.6213, lng: -122.3790 },
      'KBOS': { code: 'KBOS', name: 'Boston Logan International Airport', lat: 42.3656, lng: -71.0096 },
      'KIAH': { code: 'KIAH', name: 'Houston George Bush Intercontinental Airport', lat: 29.9902, lng: -95.3368 },
      'KMIA': { code: 'KMIA', name: 'Miami International Airport', lat: 25.7959, lng: -80.2870 },
      'KATL': { code: 'KATL', name: 'Hartsfield-Jackson Atlanta International Airport', lat: 33.6407, lng: -84.4277 },
      'KSEA': { code: 'KSEA', name: 'Seattle-Tacoma International Airport', lat: 47.4502, lng: -122.3088 },
      'EGLL': { code: 'EGLL', name: 'London Heathrow Airport', lat: 51.4700, lng: -0.4543 },
      'LFPG': { code: 'LFPG', name: 'Paris Charles de Gaulle Airport', lat: 49.0097, lng: 2.5479 },
      'EDDF': { code: 'EDDF', name: 'Frankfurt Airport', lat: 50.0379, lng: 8.5622 },
      'LIRF': { code: 'LIRF', name: 'Rome Fiumicino Airport', lat: 41.8003, lng: 12.2389 },
      'VOBL': { code: 'VOBL', name: 'Bengaluru Kempegowda International Airport', lat: 13.1986, lng: 77.7066 },
      'VIDP': { code: 'VIDP', name: 'Indira Gandhi International Airport (Delhi)', lat: 28.5562, lng: 77.1000 },
      'VOMM': { code: 'VOMM', name: 'Chennai International Airport', lat: 12.9941, lng: 80.1709 },
      'VHHH': { code: 'VHHH', name: 'Hong Kong International Airport', lat: 22.3080, lng: 113.9185 },
    };
    
    return airportDB[icao] || { 
      code: icao, 
      name: `${icao} Airport`, 
      lat: 40.7128, 
      lng: -74.0060 
    };
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3440.065; // Earth's radius in nautical miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calculate total route statistics
  const calculateRouteStats = () => {
    const departureData = getAirportData(departure);
    const arrivalData = getAirportData(arrival);
    const waypointData = waypoints.map(getAirportData);
    
    let totalDistance = 0;
    let currentPoint = departureData;
    
    // Calculate distance through waypoints
    for (const waypoint of waypointData) {
      totalDistance += calculateDistance(currentPoint.lat, currentPoint.lng, waypoint.lat, waypoint.lng);
      currentPoint = waypoint;
    }
    
    // Final leg to arrival
    totalDistance += calculateDistance(currentPoint.lat, currentPoint.lng, arrivalData.lat, arrivalData.lng);
    
    // Calculate flight time (assuming 480 knots average speed)
    const flightTimeHours = totalDistance / 480;
    const hours = Math.floor(flightTimeHours);
    const minutes = Math.round((flightTimeHours - hours) * 60);
    
    setRouteStats({
      totalDistance: Math.round(totalDistance),
      flightTime: `${hours}h ${minutes}m`,
      fuelRequired: Math.round(totalDistance * 6.5), // Rough fuel calculation
      waypoints: waypoints.length
    });
  };

  useEffect(() => {
    calculateRouteStats();
  }, [departure, arrival, waypoints]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [40.7128, -74.0060],
      zoom: 4,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      dragging: true,
      touchZoom: true,
      attributionControl: true
    });

    // Add tile layer with satellite/hybrid view
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Optional: Add satellite layer
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles © Esri',
      maxZoom: 18,
    });

    // Layer control
    const baseMaps = {
      "Street Map": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
      "Satellite": satelliteLayer
    };
    
    L.control.layers(baseMaps).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    
    // Clear existing layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Get airport data
    const departureData = getAirportData(departure);
    const arrivalData = getAirportData(arrival);
    const waypointData = waypoints.map(getAirportData);

    // Create custom icons
    const createCustomIcon = (color: string, type: string) => {
      return L.divIcon({
        html: `
          <div style="
            background-color: ${color};
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
            color: white;
          ">
            ${type === 'departure' ? '🛫' : type === 'arrival' ? '🛬' : '✈️'}
          </div>
        `,
        className: 'custom-airport-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
      });
    };

    // Add departure marker
    const departureMarker = L.marker([departureData.lat, departureData.lng], {
      icon: createCustomIcon('#22c55e', 'departure')
    }).addTo(map);
    
    departureMarker.bindPopup(`
      <div style="min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; color: #22c55e; font-weight: bold;">🛫 DEPARTURE</h3>
        <p style="margin: 0; font-weight: bold;">${departureData.code}</p>
        <p style="margin: 0; font-size: 12px; color: #666;">${departureData.name}</p>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #888;">
          ${departureData.lat.toFixed(4)}°, ${departureData.lng.toFixed(4)}°
        </p>
        ${weatherData?.weather_summary?.departure ? `
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
            <p style="margin: 2px 0; font-size: 11px;">🌡️ ${weatherData.weather_summary.departure.temperature}°C</p>
            <p style="margin: 2px 0; font-size: 11px;">💨 ${weatherData.weather_summary.departure.wind_speed} kts</p>
            <p style="margin: 2px 0; font-size: 11px;">👁️ ${weatherData.weather_summary.departure.visibility} mi</p>
          </div>
        ` : ''}
      </div>
    `);

    // Add waypoint markers
    waypointData.forEach((waypoint, index) => {
      const waypointMarker = L.marker([waypoint.lat, waypoint.lng], {
        icon: createCustomIcon('#6b7280', 'waypoint')
      }).addTo(map);
      
      waypointMarker.bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #6b7280; font-weight: bold;">✈️ WAYPOINT ${index + 1}</h3>
          <p style="margin: 0; font-weight: bold;">${waypoint.code}</p>
          <p style="margin: 0; font-size: 12px; color: #666;">${waypoint.name}</p>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #888;">
            ${waypoint.lat.toFixed(4)}°, ${waypoint.lng.toFixed(4)}°
          </p>
        </div>
      `);
    });

    // Add arrival marker
    const arrivalMarker = L.marker([arrivalData.lat, arrivalData.lng], {
      icon: createCustomIcon('#ef4444', 'arrival')
    }).addTo(map);
    
    arrivalMarker.bindPopup(`
      <div style="min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; color: #ef4444; font-weight: bold;">🛬 ARRIVAL</h3>
        <p style="margin: 0; font-weight: bold;">${arrivalData.code}</p>
        <p style="margin: 0; font-size: 12px; color: #666;">${arrivalData.name}</p>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #888;">
          ${arrivalData.lat.toFixed(4)}°, ${arrivalData.lng.toFixed(4)}°
        </p>
        ${weatherData?.weather_summary?.arrival ? `
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
            <p style="margin: 2px 0; font-size: 11px;">🌡️ ${weatherData.weather_summary.arrival.temperature}°C</p>
            <p style="margin: 2px 0; font-size: 11px;">💨 ${weatherData.weather_summary.arrival.wind_speed} kts</p>
            <p style="margin: 2px 0; font-size: 11px;">👁️ ${weatherData.weather_summary.arrival.visibility} mi</p>
          </div>
        ` : ''}
      </div>
    `);

    // Create flight path
    const pathCoordinates: [number, number][] = [];
    pathCoordinates.push([departureData.lat, departureData.lng]);
    
    waypointData.forEach(waypoint => {
      pathCoordinates.push([waypoint.lat, waypoint.lng]);
    });
    
    pathCoordinates.push([arrivalData.lat, arrivalData.lng]);

    // Add animated flight path
    const flightPath = L.polyline(pathCoordinates, {
      color: '#3b82f6',
      weight: 4,
      opacity: 0.8,
      dashArray: '10, 10',
      className: 'animated-flight-path'
    }).addTo(map);

    // Add distance markers along the route
    for (let i = 0; i < pathCoordinates.length - 1; i++) {
      const start = pathCoordinates[i];
      const end = pathCoordinates[i + 1];
      const midLat = (start[0] + end[0]) / 2;
      const midLng = (start[1] + end[1]) / 2;
      
      const segmentDistance = calculateDistance(start[0], start[1], end[0], end[1]);
      
      L.marker([midLat, midLng], {
        icon: L.divIcon({
          html: `
            <div class="distance-marker-label">
              ${Math.round(segmentDistance)} nm
            </div>
          `,
          className: 'distance-marker',
          iconSize: [60, 20],
          iconAnchor: [30, 10]
        })
      }).addTo(map);
    }

    // Fit map to show all markers
    const group = new L.FeatureGroup([
      departureMarker,
      arrivalMarker,
      ...waypointData.map(waypoint => 
        L.marker([waypoint.lat, waypoint.lng])
      ),
      flightPath
    ]);
    
    map.fitBounds(group.getBounds(), { padding: [20, 20] });

  }, [departure, arrival, waypoints, weatherData]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const resetView = () => {
    if (mapInstanceRef.current) {
      // Recalculate bounds and fit
      calculateRouteStats();
      // The useEffect will handle the map update
    }
  };

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
      {/* Header */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Navigation className="w-6 h-6" />
              Flight Route Visualization
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={resetView}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset View
              </Button>
              <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              {departure} → {arrival}
            </Badge>
            {waypoints.length > 0 && (
              <Badge variant="secondary">
                {waypoints.length} Waypoints
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Route Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <Ruler className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-700">
              {routeStats.totalDistance.toLocaleString()}
            </div>
            <div className="text-sm text-green-600">Nautical Miles</div>
          </CardContent>
        </Card>

        <Card className="text-center bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-700">
              {routeStats.flightTime}
            </div>
            <div className="text-sm text-blue-600">Flight Time</div>
          </CardContent>
        </Card>

        <Card className="text-center bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
          <CardContent className="p-4">
            <Fuel className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold text-orange-700">
              {routeStats.fuelRequired.toLocaleString()}
            </div>
            <div className="text-sm text-orange-600">Fuel (lbs)</div>
          </CardContent>
        </Card>

        <Card className="text-center bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <CardContent className="p-4">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-700">
              {routeStats.waypoints + 2}
            </div>
            <div className="text-sm text-purple-600">Total Points</div>
          </CardContent>
        </Card>
      </div>

      {/* Map Container */}
      <Card className="border-2 border-gray-200">
        <CardContent className="p-0">
          <div 
            ref={mapRef} 
            className={`${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-[600px]'} w-full rounded-lg`}
            style={{ minHeight: '400px' }}
          />
        </CardContent>
      </Card>

      {/* Weather Information */}
      {weatherData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center gap-2">
                <Plane className="w-5 h-5" />
                Departure Weather ({departure})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <span>{weatherData.weather_summary?.departure?.temperature || 'N/A'}°C</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-blue-500" />
                  <span>{weatherData.weather_summary?.departure?.wind_speed || 'N/A'} kts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span>{weatherData.weather_summary?.departure?.visibility || 'N/A'} mi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-500" />
                  <span>{weatherData.weather_summary?.departure?.conditions || 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <Plane className="w-5 h-5 transform rotate-90" />
                Arrival Weather ({arrival})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <span>{weatherData.weather_summary?.arrival?.temperature || 'N/A'}°C</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-blue-500" />
                  <span>{weatherData.weather_summary?.arrival?.wind_speed || 'N/A'} kts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span>{weatherData.weather_summary?.arrival?.visibility || 'N/A'} mi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-500" />
                  <span>{weatherData.weather_summary?.arrival?.conditions || 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Map Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Map Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">🛫</div>
              <span>Departure Airport</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs">✈️</div>
              <span>Waypoint</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">🛬</div>
              <span>Arrival Airport</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-blue-500 rounded flight-path-pattern"></div>
              <span>Flight Path</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 bg-blue-500 text-white text-xs rounded">123 nm</div>
              <span>Distance Markers</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RouteVisualizationPage;
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

import { Map, Navigation, Ruler, Zap, AlertTriangle } from "lucide-react";

// Fix for default markers in Leaflet with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface RouteMapProps {
  departure: string;
  arrival: string;
  className?: string;
}

interface AirportCoordinate {
  icao: string;
  lat: number;
  lng: number;
  name: string;
}

// Sample airport coordinates - replace with actual airport database
const AIRPORT_COORDS: { [key: string]: AirportCoordinate } = {
  'KJFK': { icao: 'KJFK', lat: 40.6413, lng: -73.7781, name: 'John F. Kennedy International Airport' },
  'KLAX': { icao: 'KLAX', lat: 33.9425, lng: -118.4081, name: 'Los Angeles International Airport' },
  'KORD': { icao: 'KORD', lat: 41.9742, lng: -87.9073, name: 'Chicago O\'Hare International Airport' },
  'KDEN': { icao: 'KDEN', lat: 39.8561, lng: -104.6737, name: 'Denver International Airport' },
  'KIAH': { icao: 'KIAH', lat: 29.9902, lng: -95.3368, name: 'George Bush Intercontinental Airport' },
  'KSFO': { icao: 'KSFO', lat: 37.6213, lng: -122.3790, name: 'San Francisco International Airport' },
  'KMIA': { icao: 'KMIA', lat: 25.7959, lng: -80.2870, name: 'Miami International Airport' },
  'KBOS': { icao: 'KBOS', lat: 42.3656, lng: -71.0096, name: 'Boston Logan International Airport' },
  'KLAS': { icao: 'KLAS', lat: 36.0840, lng: -115.1537, name: 'McCarran International Airport' },
  'KSEA': { icao: 'KSEA', lat: 47.4502, lng: -122.3088, name: 'Seattle-Tacoma International Airport' },
  'KATL': { icao: 'KATL', lat: 33.6407, lng: -84.4277, name: 'Hartsfield-Jackson Atlanta International Airport' },
  'KDFW': { icao: 'KDFW', lat: 32.8998, lng: -97.0403, name: 'Dallas/Fort Worth International Airport' },
  'KPHX': { icao: 'KPHX', lat: 33.4484, lng: -112.0740, name: 'Phoenix Sky Harbor International Airport' },
  'KMSP': { icao: 'KMSP', lat: 44.8848, lng: -93.2223, name: 'Minneapolis-Saint Paul International Airport' },
  'KDTW': { icao: 'KDTW', lat: 42.2162, lng: -83.3554, name: 'Detroit Metropolitan Wayne County Airport' },
};

const RouteMap: React.FC<RouteMapProps> = ({ departure, arrival, className = "" }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const departureCoord = AIRPORT_COORDS[departure];
  const arrivalCoord = AIRPORT_COORDS[arrival];

  // Calculate distance
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3440; // Radius of Earth in nautical miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calculate bearing
  const calculateBearing = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const y = Math.sin(dLng) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLng);
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  };

  const distance = departureCoord && arrivalCoord ? 
    calculateDistance(departureCoord.lat, departureCoord.lng, arrivalCoord.lat, arrivalCoord.lng) : 0;
  
  const bearing = departureCoord && arrivalCoord ? 
    calculateBearing(departureCoord.lat, departureCoord.lng, arrivalCoord.lat, arrivalCoord.lng) : 0;

  const estimatedFlightTime = Math.round(distance / 450 * 60); // Assuming 450kts cruise speed

  useEffect(() => {
    if (!mapRef.current || !departureCoord || !arrivalCoord) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Create new map
    const map = L.map(mapRef.current).setView([
      (departureCoord.lat + arrivalCoord.lat) / 2,
      (departureCoord.lng + arrivalCoord.lng) / 2
    ], 4);

    // Add tile layer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri',
      maxZoom: 18,
    }).addTo(map);

    // Custom icons
    const departureIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #22c55e; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">D</div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const arrivalIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #ef4444; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">A</div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    // Add markers
    L.marker([departureCoord.lat, departureCoord.lng], { icon: departureIcon })
      .addTo(map)
      .bindPopup(`<strong>${departureCoord.icao}</strong><br/>${departureCoord.name}`);

    L.marker([arrivalCoord.lat, arrivalCoord.lng], { icon: arrivalIcon })
      .addTo(map)
      .bindPopup(`<strong>${arrivalCoord.icao}</strong><br/>${arrivalCoord.name}`);

    // Add flight path
    L.polyline([
      [departureCoord.lat, departureCoord.lng],
      [arrivalCoord.lat, arrivalCoord.lng]
    ], {
      color: '#3b82f6',
      weight: 3,
      opacity: 0.8,
      dashArray: '10, 5'
    }).addTo(map);

    // Add waypoint markers along the route (simulate great circle route)
    const waypoints = 5;
    for (let i = 1; i < waypoints; i++) {
      const fraction = i / waypoints;
      const lat = departureCoord.lat + (arrivalCoord.lat - departureCoord.lat) * fraction;
      const lng = departureCoord.lng + (arrivalCoord.lng - departureCoord.lng) * fraction;
      
      const waypointIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #6366f1; color: white; border-radius: 3px; width: 12px; height: 12px; border: 1px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.3);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      L.marker([lat, lng], { icon: waypointIcon })
        .addTo(map)
        .bindPopup(`Waypoint ${i}<br/>Progress: ${Math.round(fraction * 100)}%`);
    }

    // Fit map to show both airports with padding
    const group = new L.FeatureGroup([
      L.marker([departureCoord.lat, departureCoord.lng]),
      L.marker([arrivalCoord.lat, arrivalCoord.lng])
    ]);
    map.fitBounds(group.getBounds().pad(0.1));

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [departure, arrival, departureCoord, arrivalCoord]);

  if (!departureCoord || !arrivalCoord) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Route Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Airport coordinates not available</p>
              <p className="text-sm text-muted-foreground">for {departure} → {arrival}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Route Map • {departure} → {arrival}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Ruler className="h-3 w-3" />
              {Math.round(distance)} NM
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Navigation className="h-3 w-3" />
              {Math.round(bearing)}°
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {Math.floor(estimatedFlightTime / 60)}h {estimatedFlightTime % 60}m
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Route Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Math.round(distance)}</div>
              <div className="text-xs text-muted-foreground">Nautical Miles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{Math.round(bearing)}°</div>
              <div className="text-xs text-muted-foreground">True Bearing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.floor(estimatedFlightTime / 60)}:{String(estimatedFlightTime % 60).padStart(2, '0')}</div>
              <div className="text-xs text-muted-foreground">Est. Flight Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">FL350</div>
              <div className="text-xs text-muted-foreground">Cruise Altitude</div>
            </div>
          </div>

          {/* Map Container */}
          <div className="relative">
            <div 
              ref={mapRef} 
              className="h-96 w-full rounded-lg border border-border shadow-sm"
              style={{ minHeight: '384px' }}
            />
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-md p-2 text-xs space-y-1 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Departure ({departure})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Arrival ({arrival})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-sm"></div>
                <span>Waypoints</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-blue-500" style={{ borderStyle: 'dashed' }}></div>
                <span>Flight Path</span>
              </div>
            </div>
          </div>

          {/* Airport Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-1">Departure</h4>
              <p className="text-sm font-medium">{departureCoord.icao}</p>
              <p className="text-xs text-green-700">{departureCoord.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {departureCoord.lat.toFixed(4)}°N, {Math.abs(departureCoord.lng).toFixed(4)}°W
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-800 mb-1">Arrival</h4>
              <p className="text-sm font-medium">{arrivalCoord.icao}</p>
              <p className="text-xs text-red-700">{arrivalCoord.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {arrivalCoord.lat.toFixed(4)}°N, {Math.abs(arrivalCoord.lng).toFixed(4)}°W
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteMap;
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './FlightPathMap.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Plane, Route, Globe } from 'lucide-react';

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

interface Airport {
  code: string;
  name?: string;
  lat: number;
  lng: number;
  type: 'departure' | 'waypoint' | 'arrival';
}

interface FlightPathMapProps {
  airports: Airport[];
  totalDistance: number;
  flightTime: string;
  routeType: 'single' | 'multi';
}

// Sample airport coordinates (you can replace with real API data)
const getAirportCoordinates = (icao: string): { lat: number; lng: number; name: string } => {
  const airportDB: Record<string, { lat: number; lng: number; name: string }> = {
    'KJFK': { lat: 40.6413, lng: -73.7781, name: 'John F. Kennedy International Airport' },
    'KORD': { lat: 41.9742, lng: -87.9073, name: 'Chicago O\'Hare International Airport' },
    'KLAX': { lat: 33.9425, lng: -118.4081, name: 'Los Angeles International Airport' },
    'KDEN': { lat: 39.8561, lng: -104.6737, name: 'Denver International Airport' },
    'KSFO': { lat: 37.6213, lng: -122.3790, name: 'San Francisco International Airport' },
    'KBOS': { lat: 42.3656, lng: -71.0096, name: 'Boston Logan International Airport' },
    'KIAH': { lat: 29.9902, lng: -95.3368, name: 'Houston George Bush Intercontinental Airport' },
    'VOBL': { lat: 13.1986, lng: 77.7066, name: 'Bengaluru Kempegowda International Airport' },
    'EGLL': { lat: 51.4700, lng: -0.4543, name: 'London Heathrow Airport' },
    'LFPG': { lat: 49.0097, lng: 2.5479, name: 'Paris Charles de Gaulle Airport' },
    'EDDF': { lat: 50.0379, lng: 8.5622, name: 'Frankfurt Airport' },
    'VHHH': { lat: 22.3080, lng: 113.9185, name: 'Hong Kong International Airport' },
    'RJTT': { lat: 35.7720, lng: 140.3928, name: 'Tokyo Haneda Airport' },
    'WSSS': { lat: 1.3644, lng: 103.9915, name: 'Singapore Changi Airport' },
    'OMDB': { lat: 25.2532, lng: 55.3657, name: 'Dubai International Airport' },
  };
  
  return airportDB[icao] || { lat: 0, lng: 0, name: icao };
};

export const FlightPathMap: React.FC<FlightPathMapProps> = ({
  airports,
  totalDistance,
  flightTime,
  routeType
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || airports.length < 2) return;

    // Initialize map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      dragging: true,
      touchZoom: true,
    });

    mapInstanceRef.current = map;

    // Add beautiful tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Custom icons for different airport types
    const createCustomIcon = (type: 'departure' | 'waypoint' | 'arrival', color: string) => {
      const iconHtml = type === 'departure' ? '🛫' : type === 'arrival' ? '🛬' : '✈️';
      return L.divIcon({
        html: `<div style="
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          position: relative;
        ">${iconHtml}</div>`,
        className: 'custom-airport-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
      });
    };

    const bounds = L.latLngBounds([]);
    const waypoints: L.LatLng[] = [];

    // Add airport markers
    airports.forEach((airport, index) => {
      const coords = getAirportCoordinates(airport.code);
      const latLng = L.latLng(coords.lat, coords.lng);
      bounds.extend(latLng);
      waypoints.push(latLng);

      let iconColor = '#3b82f6'; // blue
      let airportType: 'departure' | 'waypoint' | 'arrival' = 'waypoint';
      
      if (index === 0) {
        iconColor = '#10b981'; // green
        airportType = 'departure';
      } else if (index === airports.length - 1) {
        iconColor = '#ef4444'; // red
        airportType = 'arrival';
      }

      const marker = L.marker(latLng, {
        icon: createCustomIcon(airportType, iconColor)
      }).addTo(map);

      // Create popup with airport information
      const popupContent = `
        <div style="font-family: system-ui; min-width: 200px;">
          <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: ${iconColor};">
            ${airport.code}
          </div>
          <div style="margin-bottom: 4px; font-size: 14px;">
            ${coords.name}
          </div>
          <div style="font-size: 12px; color: #666;">
            ${airportType.charAt(0).toUpperCase() + airportType.slice(1)} Airport
          </div>
          <div style="font-size: 12px; color: #666; margin-top: 4px;">
            ${coords.lat.toFixed(4)}°, ${coords.lng.toFixed(4)}°
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent);
    });

    // Draw flight path with animated line
    if (waypoints.length >= 2) {
      // Main flight path
      L.polyline(waypoints, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.8,
        smoothFactor: 1,
        dashArray: '10, 5'
      }).addTo(map);

      // Add animated plane along the route
      const planeIcon = L.divIcon({
        html: `<div style="
          font-size: 20px;
          transform: rotate(45deg);
          filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.5));
        ">✈️</div>`,
        className: 'animated-plane',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      // Place plane at the midpoint of the route
      const midIndex = Math.floor(waypoints.length / 2);
      const planePosition = waypoints[midIndex];
      L.marker(planePosition, { icon: planeIcon }).addTo(map);

      // Add distance markers every few waypoints for multi-airport routes
      if (routeType === 'multi' && waypoints.length > 2) {
        for (let i = 1; i < waypoints.length; i++) {
          const segmentDistance = waypoints[i - 1].distanceTo(waypoints[i]) / 1000; // Convert to km
          const midPoint = L.latLng(
            (waypoints[i - 1].lat + waypoints[i].lat) / 2,
            (waypoints[i - 1].lng + waypoints[i].lng) / 2
          );

          const distanceMarker = L.divIcon({
            html: `<div style="
              background: rgba(59, 130, 246, 0.9);
              color: white;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: bold;
              white-space: nowrap;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">${Math.round(segmentDistance)} km</div>`,
            className: 'distance-marker',
            iconSize: [60, 24],
            iconAnchor: [30, 12]
          });

          L.marker(midPoint, { icon: distanceMarker }).addTo(map);
        }
      }
    }

    // Fit map to show all airports with padding
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    // Add custom CSS for animations
    const style = document.createElement('style');
    style.textContent = `
      .animated-plane {
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      
      .custom-airport-marker {
        transition: transform 0.2s ease;
      }
      
      .custom-airport-marker:hover {
        transform: scale(1.1);
      }
      
      .leaflet-popup-content-wrapper {
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      }
      
      .leaflet-popup-tip {
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      document.head.removeChild(style);
    };
  }, [airports, routeType]);

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/50 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl text-blue-800">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Globe className="h-6 w-6 text-blue-600" />
          </div>
          Interactive Flight Path Map
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            {routeType === 'multi' ? `${airports.length} Airports` : '2 Airports'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Route Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
            <Route className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <div className="text-lg font-bold text-green-800">{totalDistance.toFixed(0)} nm</div>
            <div className="text-sm text-green-600">Total Distance</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
            <Plane className="h-6 w-6 mx-auto mb-2 text-purple-600" />
            <div className="text-lg font-bold text-purple-800">{flightTime}</div>
            <div className="text-sm text-purple-600">Flight Time</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
            <Navigation className="h-6 w-6 mx-auto mb-2 text-orange-600" />
            <div className="text-lg font-bold text-orange-800">{airports.length}</div>
            <div className="text-sm text-orange-600">Airports</div>
          </div>
        </div>

        {/* Airport List */}
        <div className="mb-6">
          <h4 className="font-bold text-lg mb-3 flex items-center gap-2 text-gray-800">
            <MapPin className="h-5 w-5" />
            Route Details
          </h4>
          <div className="flex flex-wrap gap-2">
            {airports.map((airport, index) => (
              <React.Fragment key={airport.code}>
                <Badge 
                  variant={index === 0 ? 'default' : index === airports.length - 1 ? 'destructive' : 'secondary'}
                  className="px-3 py-1 text-sm font-mono"
                >
                  {index === 0 && '🛫 '}
                  {index === airports.length - 1 && '🛬 '}
                  {index > 0 && index < airports.length - 1 && '✈️ '}
                  {airport.code}
                </Badge>
                {index < airports.length - 1 && (
                  <span className="text-gray-400 self-center">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Map Container */}
        <div className="relative">
          <div 
            ref={mapRef} 
            className="w-full h-96 rounded-2xl border-2 border-blue-200 shadow-lg overflow-hidden"
            style={{ minHeight: '400px' }}
          />
          
          {/* Map Legend */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200">
            <div className="text-sm font-bold mb-2 text-gray-800">Legend</div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-green-600">🛫</span>
                <span>Departure</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600">✈️</span>
                <span>Waypoint</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-600">🛬</span>
                <span>Arrival</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map Tips */}
        <div className="mt-4 text-center text-sm text-gray-600">
          💡 <strong>Interactive Map:</strong> Click markers for airport details • Zoom and pan to explore • Animated flight path shows your route
        </div>
      </CardContent>
    </Card>
  );
};

export default FlightPathMap;
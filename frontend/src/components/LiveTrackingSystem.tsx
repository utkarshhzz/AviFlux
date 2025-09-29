import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Radio, Satellite, MapPin, Plane, 
  Volume2, VolumeX, Navigation, Clock, Wifi
} from 'lucide-react';
import { findAirport } from '@/data/airports';
import './LiveTrackingSystem.css';

interface LiveTrackingProps {
  isActive?: boolean;
  onToggle?: (active: boolean) => void;
  selectedRoute?: {
    departure: string;
    arrival: string;
    waypoints?: string[];
  };
}

// interface FlightData {
//   icao24: string;
//   callsign: string;
//   origin_country: string;
//   longitude: number;
//   latitude: number;
//   baro_altitude: number;
//   velocity: number;
//   true_track: number;
//   time_position: number;
// }

interface LiveFlightInfo {
  flightNumber: string;
  aircraft: string;
  altitude: number;
  speed: number;
  heading: number;
  coordinates: { lat: number; lng: number };
  status: string;
  progress: number;
  eta: Date | null;
  actualData: boolean;
}

const LiveTrackingSystem: React.FC<LiveTrackingProps> = ({ 
  isActive = false, 
  onToggle,
  selectedRoute 
}) => {
  const [tracking, setTracking] = useState(isActive);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [manualRoute, setManualRoute] = useState('');
  const [liveFlights, setLiveFlights] = useState<LiveFlightInfo[]>([]);
  const [currentFlightIndex, setCurrentFlightIndex] = useState(0);
  const [isLoadingFlights, setIsLoadingFlights] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const beepIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const createBeepSound = () => {
    if (!soundEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.2);
      
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + 0.2);
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  };

  const fetchLiveFlights = async (departure: string, arrival: string) => {
    setIsLoadingFlights(true);
    try {
      const depAirport = findAirport(departure);
      const arrAirport = findAirport(arrival);
      
      if (!depAirport || !arrAirport) {
        throw new Error('Invalid airport codes');
      }

      console.log(`🛩️ Fetching live flights from ${departure} to ${arrival}...`);
      
      // Try to fetch real flight data from OpenSky Network
      try {
        const minLat = Math.min(depAirport.lat, arrAirport.lat) - 2;
        const maxLat = Math.max(depAirport.lat, arrAirport.lat) + 2;
        const minLng = Math.min(depAirport.lng, arrAirport.lng) - 2;
        const maxLng = Math.max(depAirport.lng, arrAirport.lng) + 2;
        
        const response = await fetch(
          `https://opensky-network.org/api/states/all?lamin=${minLat}&lomin=${minLng}&lamax=${maxLat}&lomax=${maxLng}`,
          {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log(`📡 Received ${data.states?.length || 0} flights from OpenSky API`);
          
          if (data.states && data.states.length > 0) {
            const liveFlights = data.states
              .filter((state: any[]) => state[6] !== null && state[5] !== null && !state[8])
              .slice(0, 6)
              .map((state: any[], index: number) => {
                const lat = state[6];
                const lng = state[5];
                const callsign = state[1]?.trim() || `FL${(index + 1).toString().padStart(3, '0')}`;
                const altitude = state[7] ? Math.round(state[7] * 3.28084) : 30000;
                const velocity = state[9] ? Math.round(state[9] * 1.94384) : 450;
                const heading = state[10] || 0;
                const progress = Math.random() * 80 + 10;
                
                return {
                  flightNumber: callsign,
                  aircraft: getAircraftType(),
                  altitude: altitude,
                  speed: velocity,
                  heading: heading,
                  coordinates: { lat, lng },
                  status: getFlightStatus(progress),
                  progress: Math.round(progress),
                  eta: new Date(Date.now() + Math.random() * 4 * 60 * 60 * 1000),
                  actualData: true
                };
              });
            
            if (liveFlights.length > 0) {
              console.log(`✅ Successfully loaded ${liveFlights.length} real flights`);
              setLiveFlights(liveFlights);
              setIsLoadingFlights(false);
              return;
            }
          }
        }
      } catch (apiError) {
        console.warn('OpenSky API unavailable, using demo data:', apiError);
      }
      
      // Fallback to realistic demo flights
      console.log('🎮 Generating realistic demo flights...');
      const simulatedFlights: LiveFlightInfo[] = Array.from({ length: 3 }, () => {
        const progress = Math.random() * 70 + 10;
        const etaMinutes = Math.random() * 180 + 30;
        
        return {
          flightNumber: `${departure.slice(1, 3)}${Math.floor(Math.random() * 9000) + 1000}`,
          aircraft: getAircraftType(),
          altitude: Math.floor(Math.random() * 20000) + 25000,
          speed: Math.floor(Math.random() * 200) + 400,
          heading: Math.floor(Math.random() * 360),
          coordinates: {
            lat: depAirport.lat + Math.random() * (arrAirport.lat - depAirport.lat) * (progress / 100),
            lng: depAirport.lng + Math.random() * (arrAirport.lng - depAirport.lng) * (progress / 100)
          },
          status: getFlightStatus(progress),
          progress: Math.round(progress),
          eta: new Date(Date.now() + etaMinutes * 60 * 1000),
          actualData: false
        };
      });

      setLiveFlights(simulatedFlights);
      console.log(`🎯 Generated ${simulatedFlights.length} demo flights`);
      
    } catch (error) {
      console.error('Error fetching flights:', error);
      setLiveFlights([]);
    } finally {
      setIsLoadingFlights(false);
    }
  };

  const getAircraftType = (): string => {
    const aircraftTypes = ['B737-800', 'A320-200', 'B777-300ER', 'A350-900', 'B787-8', 'A321-200', 'B767-300', 'A330-300'];
    return aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)];
  };

  const getFlightStatus = (progress: number): string => {
    if (progress < 20) return 'Departed';
    if (progress < 40) return 'Climbing';
    if (progress < 60) return 'Cruising';
    if (progress < 80) return 'En Route';
    return 'Descending';
  };

  const parseRouteInput = (input: string) => {
    const codes = input.toUpperCase().split(/[-,\s]+/).filter(code => code.length >= 3);
    return codes.length >= 2 ? { departure: codes[0], arrival: codes[codes.length - 1], waypoints: codes.slice(1, -1) } : null;
  };

  const getCurrentRoute = () => {
    if (selectedRoute && selectedRoute.departure && selectedRoute.arrival) {
      return selectedRoute;
    }
    if (manualRoute.trim()) {
      const parsed = parseRouteInput(manualRoute);
      if (parsed) return parsed;
    }
    return null;
  };

  useEffect(() => {
    if (tracking) {
      const route = getCurrentRoute();
      if (route) {
        fetchLiveFlights(route.departure, route.arrival);
        
        const interval = setInterval(() => {
          fetchLiveFlights(route.departure, route.arrival);
        }, 30000); // Update every 30 seconds
        
        updateIntervalRef.current = interval;
        
        if (soundEnabled) {
          createBeepSound();
          const beepInterval = setInterval(createBeepSound, 2000);
          beepIntervalRef.current = beepInterval;
        }
      }
    } else {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
      if (beepIntervalRef.current) {
        clearInterval(beepIntervalRef.current);
        beepIntervalRef.current = null;
      }
    }

    return () => {
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
      if (beepIntervalRef.current) clearInterval(beepIntervalRef.current);
    };
  }, [tracking, soundEnabled, selectedRoute, manualRoute]);

  useEffect(() => {
    if (liveFlights.length > 1) {
      const cycleInterval = setInterval(() => {
        setCurrentFlightIndex(prev => (prev + 1) % liveFlights.length);
      }, 5000);
      
      return () => clearInterval(cycleInterval);
    }
  }, [liveFlights.length]);

  const handleToggleTracking = () => {
    const newTracking = !tracking;
    setTracking(newTracking);
    onToggle?.(newTracking);
  };

  const currentFlight = liveFlights[currentFlightIndex];
  const route = getCurrentRoute();

  return (
    <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-green-700">
          <div className="flex items-center gap-2">
            <Radio className={`w-5 h-5 ${tracking ? 'animate-pulse' : ''}`} />
            Live Flight Tracking
            {tracking && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-normal">LIVE</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="border-green-300 hover:bg-green-100"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Button
              onClick={handleToggleTracking}
              className={tracking ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
            >
              {tracking ? 'Stop Tracking' : 'Start Live Tracking'}
            </Button>
          </div>
        </CardTitle>
        
        <div className="mt-4">
          <Input
            placeholder="Enter route (e.g., KJFK-VOBL or KJFK,EGLL,VOBL)"
            value={manualRoute}
            onChange={(e) => setManualRoute(e.target.value)}
            className="border-green-300 focus:border-green-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use ICAO codes separated by hyphens or commas. Supports multi-stop routes.
            {route && <span className="text-green-600 font-medium"> Current: {route.departure} → {route.arrival}</span>}
          </p>
        </div>
      </CardHeader>
      
      <CardContent>
        {!tracking ? (
          <div className="text-center py-8">
            <Satellite className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Click "Start Live Tracking" to monitor flights</p>
            {route && (
              <p className="text-sm text-green-600 mt-2">
                Ready to track: {route.departure} → {route.arrival}
                {route.waypoints && route.waypoints.length > 0 && ` via ${route.waypoints.join(', ')}`}
              </p>
            )}
          </div>
        ) : isLoadingFlights ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading live flight data...</p>
          </div>
        ) : !currentFlight ? (
          <div className="text-center py-8">
            <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No flights found for this route</p>
            <p className="text-xs text-gray-400 mt-2">Try a different route or check back later</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Flight Header */}
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-green-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Plane className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-bold text-lg text-green-700">
                    Flight {currentFlight.flightNumber}
                  </div>
                  <div className="text-sm text-gray-600">
                    {route?.departure} → {route?.arrival} • {currentFlight.aircraft}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge className={currentFlight.actualData ? "bg-blue-600" : "bg-orange-600"}>
                  {currentFlight.actualData ? <Wifi className="w-3 h-3 mr-1" /> : null}
                  {currentFlight.actualData ? 'LIVE DATA' : 'SIMULATED'}
                </Badge>
                <div className="text-xs text-gray-500 mt-1">
                  Flight {currentFlightIndex + 1} of {liveFlights.length}
                </div>
              </div>
            </div>

            {/* Flight Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {currentFlight.altitude.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Altitude (ft)</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {currentFlight.speed}
                </div>
                <div className="text-xs text-gray-600">Ground Speed (kts)</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600 mb-1 flex items-center justify-center gap-1">
                  <Navigation 
                    className="w-5 h-5 transform" 
                    data-heading={currentFlight.heading}
                  />
                  {currentFlight.heading}°
                </div>
                <div className="text-xs text-gray-600">Heading</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-600 mb-1 flex items-center justify-center gap-1">
                  <Clock className="w-5 h-5" />
                  {currentFlight.eta ? new Date(currentFlight.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </div>
                <div className="text-xs text-gray-600">ETA</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Flight Progress</span>
                <span className="text-sm font-bold text-green-600">{currentFlight.progress}%</span>
              </div>
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-1000 relative"
                    data-progress={currentFlight.progress}
                  >
                    <div className="absolute right-0 top-0 transform translate-x-1 -translate-y-1">
                      <Plane className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{route?.departure}</span>
                  <span className="font-medium text-gray-700">{currentFlight.status}</span>
                  <span>{route?.arrival}</span>
                </div>
              </div>
            </div>

            {/* Coordinates Display */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-700">Current Position</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Latitude: </span>
                  <span className="font-mono font-medium">{currentFlight.coordinates.lat.toFixed(6)}°</span>
                </div>
                <div>
                  <span className="text-gray-600">Longitude: </span>
                  <span className="font-mono font-medium">{currentFlight.coordinates.lng.toFixed(6)}°</span>
                </div>
              </div>
            </div>

            {/* Multi-flight indicator */}
            {liveFlights.length > 1 && (
              <div className="flex justify-center">
                <div className="flex gap-2">
                  {liveFlights.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFlightIndex(index)}
                      title={`View flight ${index + 1}`}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentFlightIndex 
                          ? 'bg-green-600 scale-125' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveTrackingSystem;
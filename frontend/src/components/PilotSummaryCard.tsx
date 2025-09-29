import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  Plane, 
  CloudRain, 
  Wind, 
  Thermometer, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  TowerControl
} from "lucide-react";

interface PilotSummaryProps {
  departure?: string;
  arrival?: string;
  onRefresh?: () => void;
  loading?: boolean;
}

interface WeatherConditions {
  departure: {
    airport: string;
    temperature: number;
    windSpeed: number;
    visibility: number;
    conditions: string;
    flightCategory: 'VFR' | 'MVFR' | 'IFR' | 'LIFR';
  };
  arrival: {
    airport: string;
    temperature: number;
    windSpeed: number;
    visibility: number;
    conditions: string;
    flightCategory: 'VFR' | 'MVFR' | 'IFR' | 'LIFR';
  };
  enroute: {
    turbulence: 'Light' | 'Moderate' | 'Severe';
    icing: 'None' | 'Light' | 'Moderate' | 'Severe';
    storms: boolean;
  };
  recommendation: 'GO' | 'CAUTION' | 'NO-GO';
  confidence: number;
}

const PilotSummaryCard: React.FC<PilotSummaryProps> = ({ 
  departure = "KJFK", 
  arrival = "KLAX", 
  onRefresh, 
  loading = false 
}) => {
  const [conditions, setConditions] = useState<WeatherConditions | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Mock real-time weather data - replace with actual API call
  useEffect(() => {
    const fetchCurrentConditions = async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with real weather API
      const mockConditions: WeatherConditions = {
        departure: {
          airport: departure,
          temperature: 22 + Math.floor(Math.random() * 10),
          windSpeed: 5 + Math.floor(Math.random() * 15),
          visibility: 8 + Math.floor(Math.random() * 2),
          conditions: ['Clear', 'Few Clouds', 'Scattered', 'Overcast'][Math.floor(Math.random() * 4)],
          flightCategory: ['VFR', 'MVFR', 'IFR'][Math.floor(Math.random() * 3)] as any
        },
        arrival: {
          airport: arrival,
          temperature: 18 + Math.floor(Math.random() * 12),
          windSpeed: 3 + Math.floor(Math.random() * 18),
          visibility: 7 + Math.floor(Math.random() * 3),
          conditions: ['Clear', 'Few Clouds', 'Broken', 'Overcast'][Math.floor(Math.random() * 4)],
          flightCategory: ['VFR', 'MVFR', 'IFR'][Math.floor(Math.random() * 3)] as any
        },
        enroute: {
          turbulence: ['Light', 'Moderate'][Math.floor(Math.random() * 2)] as any,
          icing: ['None', 'Light'][Math.floor(Math.random() * 2)] as any,
          storms: Math.random() > 0.8
        },
        recommendation: (['GO', 'CAUTION', 'NO-GO'][Math.floor(Math.random() * 3)]) as any,
        confidence: 85 + Math.floor(Math.random() * 15)
      };

      setConditions(mockConditions);
      setLastUpdate(new Date());
    };

    fetchCurrentConditions();
    
    // Update every 5 minutes
    const interval = setInterval(fetchCurrentConditions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [departure, arrival]);

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'GO': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'CAUTION': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'NO-GO': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case 'GO': return 'default';
      case 'CAUTION': return 'secondary';
      case 'NO-GO': return 'destructive';
      default: return 'outline';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'VFR': return 'text-green-600';
      case 'MVFR': return 'text-blue-600';
      case 'IFR': return 'text-yellow-600';
      case 'LIFR': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!conditions) {
    return (
      <Card className="border-2 border-blue-500/20 bg-gradient-to-r from-blue-50/50 to-sky-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <TowerControl className="h-6 w-6" />
            Flight Conditions Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-muted-foreground">Loading current conditions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-500/20 bg-gradient-to-r from-blue-50/50 to-sky-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <TowerControl className="h-6 w-6" />
            Flight Conditions Summary • {departure} → {arrival}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={getRecommendationBadge(conditions.recommendation)} className="flex items-center gap-1">
              {getRecommendationIcon(conditions.recommendation)}
              {conditions.recommendation}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onRefresh}
              disabled={loading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 10-Line Pilot Summary */}
        <div className="bg-white/80 rounded-lg p-4 border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-10 gap-2 text-sm">
            <div className="md:col-span-10 flex items-center gap-2 font-semibold text-blue-800 mb-2">
              <Plane className="h-4 w-4" />
              PILOT BRIEFING SUMMARY
            </div>
            
            <div className="md:col-span-2 font-medium">DEPARTURE:</div>
            <div className="md:col-span-8">
              {conditions.departure.airport} - {conditions.departure.conditions}, 
              {conditions.departure.temperature}°C, Wind {conditions.departure.windSpeed}kt, 
              Vis {conditions.departure.visibility}SM - <span className={getCategoryColor(conditions.departure.flightCategory)}>{conditions.departure.flightCategory}</span>
            </div>
            
            <div className="md:col-span-2 font-medium">ARRIVAL:</div>
            <div className="md:col-span-8">
              {conditions.arrival.airport} - {conditions.arrival.conditions}, 
              {conditions.arrival.temperature}°C, Wind {conditions.arrival.windSpeed}kt, 
              Vis {conditions.arrival.visibility}SM - <span className={getCategoryColor(conditions.arrival.flightCategory)}>{conditions.arrival.flightCategory}</span>
            </div>
            
            <div className="md:col-span-2 font-medium">ENROUTE:</div>
            <div className="md:col-span-8">
              Turbulence: {conditions.enroute.turbulence} | Icing: {conditions.enroute.icing} | 
              Storms: {conditions.enroute.storms ? 'POSSIBLE' : 'NONE'}
            </div>
            
            <div className="md:col-span-2 font-medium">TAKEOFF:</div>
            <div className="md:col-span-8">
              <span className={`font-bold ${
                conditions.recommendation === 'GO' ? 'text-green-600' : 
                conditions.recommendation === 'CAUTION' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {conditions.recommendation === 'GO' ? '✅ CLEARED FOR TAKEOFF' : 
                 conditions.recommendation === 'CAUTION' ? '⚠️ CAUTION ADVISED' : '❌ DELAY/CANCEL RECOMMENDED'}
              </span>
            </div>
            
            <div className="md:col-span-2 font-medium">CONFIDENCE:</div>
            <div className="md:col-span-8">{conditions.confidence}% | Last Update: {lastUpdate.toLocaleTimeString()}</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
            <Thermometer className="h-4 w-4 text-orange-500" />
            <div className="text-xs">
              <div className="font-medium">{conditions.departure.temperature}°C</div>
              <div className="text-muted-foreground">DEP TEMP</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
            <Wind className="h-4 w-4 text-blue-500" />
            <div className="text-xs">
              <div className="font-medium">{conditions.departure.windSpeed}kt</div>
              <div className="text-muted-foreground">DEP WIND</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
            <Eye className="h-4 w-4 text-green-500" />
            <div className="text-xs">
              <div className="font-medium">{conditions.departure.visibility}SM</div>
              <div className="text-muted-foreground">DEP VIS</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
            <CloudRain className="h-4 w-4 text-purple-500" />
            <div className="text-xs">
              <div className="font-medium">{conditions.enroute.turbulence}</div>
              <div className="text-muted-foreground">TURB</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PilotSummaryCard;
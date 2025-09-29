import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Thermometer, Wind, Cloud, 
  CheckCircle, MapPin, Plane, BarChart3, ToggleLeft, ToggleRight, List,
  TrendingUp, Activity, Gauge, Navigation, Clock, Shield, Zap, CloudRain,
  Target
} from 'lucide-react';
import FlightPathMap from './FlightPathMap';

interface WeatherBriefingData {
  executive_summary?: string;
  flight_decision?: {
    decision: string;
    status_icon: string;
    color: string;
    risk_score: number;
    confidence: string;
  };
  route_info?: {
    departure: string;
    arrival: string;
    distance_nm: number;
    duration: string;
    briefing_time: string;
    waypoints?: string[];
    full_route?: string[];
    route_type?: 'single' | 'multi';
  };
  weather_summary?: {
    departure: {
      airport: string;
      temperature: number;
      wind_speed: number;
      wind_direction: number;
      conditions: string;
      flight_category: string;
      visibility: number;
    };
    arrival: {
      airport: string;
      temperature: number;
      wind_speed: number;
      wind_direction: number;
      conditions: string;
      flight_category: string;
      visibility: number;
    };
  };
  risk_assessment?: {
    overall_risk: number;
    departure_risk: number;
    arrival_risk: number;
    risk_factors: string[];
    recommendations: string[];
  };
  ml_insights?: {
    predictions: string[];
    model_confidence: string;
    turbulence_forecast?: any;
    icing_forecast?: any;
    weather_classification?: any;
  };
  comprehensive_data?: any;
  detail_level?: string;
  pilot_briefing?: string;
  technical_analysis?: string;
  raw_ml_report?: string;
  ml_model_output?: string;
}

interface WeatherBriefingProps {
  data: WeatherBriefingData | null;
}

const getRiskBadgeVariant = (risk: number) => {
  if (risk <= 30) return 'default';
  if (risk <= 50) return 'secondary';
  return 'destructive';
};

export const WeatherBriefingDisplay: React.FC<WeatherBriefingProps> = ({ data }) => {
  const [currentView, setCurrentView] = useState<'summary' | 'detailed'>(data?.detail_level as 'summary' | 'detailed' || 'summary');
  const [isRegeneratingBriefing, setIsRegeneratingBriefing] = useState(false);

  // Function to regenerate briefing with different detail level
  const regenerateBriefing = async (detailLevel: 'summary' | 'detailed') => {
    if (!data?.route_info) return;
    
    setIsRegeneratingBriefing(true);
    try {
      // Calculate approximate distance and flight time
      const calculateDistance = (dep: string, arr: string): number => {
        // Simplified distance calculation - in real app would use proper coordinates
        const routes: { [key: string]: number } = {
          'KJFK-KORD': 740,
          'KJFK-VOBL': 8875,
          'KORD-KJFK': 740,
          'VOBL-KJFK': 8875
        };
        return routes[`${dep}-${arr}`] || 1000; // Default 1000 nm
      };

      const departure = data.route_info.departure;
      const arrival = data.route_info.arrival;
      const distance = calculateDistance(departure, arrival);
      const flightTime = distance / 450; // 450 knots average speed

      const requestPayload = {
        departure: departure,
        arrival: arrival,
        waypoints: [],
        distance: Math.round(distance * 10) / 10,
        flightTime: Math.round(flightTime * 10) / 10
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8003'}/api/flight-briefing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.briefing_data) {
          // Update the stored briefing data
          const planId = window.location.pathname.split('/').pop();
          sessionStorage.setItem(`briefing_${planId}`, JSON.stringify(result.briefing_data));
          // Force page refresh to show new data
          window.location.reload();
        }
      }
    } catch (error) {
      console.error("Failed to regenerate briefing:", error);
    } finally {
      setIsRegeneratingBriefing(false);
    }
  };

  if (!data || !data.flight_decision || !data.route_info || !data.weather_summary || !data.risk_assessment || !data.ml_insights) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Cloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No weather briefing data available</p>
        </div>
      </div>
    );
  }

  const { flight_decision, route_info, weather_summary, risk_assessment, ml_insights } = data;

  // Prepare chart data
  const temperatureData = [
    {
      name: weather_summary.departure.airport || 'DEP',
      temperature: weather_summary.departure.temperature || 0
    },
    {
      name: weather_summary.arrival.airport || 'ARR',
      temperature: weather_summary.arrival.temperature || 0
    }
  ];

  const windData = [
    {
      name: weather_summary.departure.airport || 'DEP',
      windSpeed: weather_summary.departure.wind_speed || 0
    },
    {
      name: weather_summary.arrival.airport || 'ARR',
      windSpeed: weather_summary.arrival.wind_speed || 0
    }
  ];

  const riskData = [
    {
      name: 'Departure Risk',
      riskScore: risk_assessment.departure_risk || 0
    },
    {
      name: 'Arrival Risk', 
      riskScore: risk_assessment.arrival_risk || 0
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Top Summary Card - Always Visible */}
      <Card className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white shadow-2xl border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-3xl font-bold">
              <div className="p-2 bg-white/20 rounded-lg">
                <Plane className="h-8 w-8" />
              </div>
              Flight Decision Summary
            </CardTitle>
            <div className="text-6xl opacity-80">{flight_decision.status_icon}</div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Decision */}
          <div className="text-center py-6 bg-white/10 rounded-2xl backdrop-blur-sm">
            <h2 className="text-4xl font-bold mb-2 text-white">
              {flight_decision.decision}
            </h2>
            <div className="flex items-center justify-center gap-4 mb-4">
              <Badge className="text-lg px-6 py-2 bg-white/20 text-white border-white/30">
                Risk Score: {flight_decision.risk_score}/100
              </Badge>
              <Badge className="text-lg px-6 py-2 bg-white/20 text-white border-white/30">
                Confidence: {flight_decision.confidence}
              </Badge>
            </div>
          </div>

          {/* Quick Route Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <MapPin className="h-6 w-6 mx-auto mb-2 text-blue-200" />
              <div className="text-2xl font-bold text-white">{route_info.departure}</div>
              <div className="text-sm text-blue-200">Departure</div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <Navigation className="h-6 w-6 mx-auto mb-2 text-blue-200" />
              <div className="text-xl font-bold text-white">{route_info.distance_nm} nm</div>
              <div className="text-sm text-blue-200">Distance</div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <Clock className="h-6 w-6 mx-auto mb-2 text-blue-200" />
              <div className="text-xl font-bold text-white">{route_info.duration}</div>
              <div className="text-sm text-blue-200">Duration</div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <MapPin className="h-6 w-6 mx-auto mb-2 text-blue-200" />
              <div className="text-2xl font-bold text-white">{route_info.arrival}</div>
              <div className="text-sm text-blue-200">Arrival</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Mode Toggle */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-white">
        <CardContent className="py-6">
          <div className="flex items-center justify-center gap-6">
            <Button
              variant={currentView === 'summary' ? 'default' : 'outline'}
              onClick={() => {
                if (currentView !== 'summary') {
                  regenerateBriefing('summary');
                }
              }}
              disabled={isRegeneratingBriefing}
              className="flex items-center gap-2 px-8 py-3 text-lg"
            >
              <List className="h-5 w-5" />
              {isRegeneratingBriefing && currentView !== 'summary' ? 'Loading...' : 'Summary Analysis'}
            </Button>
            <div className="flex items-center">
              {currentView === 'summary' ? (
                <ToggleLeft className="h-10 w-10 text-blue-600" />
              ) : (
                <ToggleRight className="h-10 w-10 text-blue-600" />
              )}
            </div>
            <Button
              variant={currentView === 'detailed' ? 'default' : 'outline'}
              onClick={() => {
                if (currentView !== 'detailed') {
                  regenerateBriefing('detailed');
                }
              }}
              disabled={isRegeneratingBriefing}
              className="flex items-center gap-2 px-8 py-3 text-lg"
            >
              <BarChart3 className="h-5 w-5" />
              {isRegeneratingBriefing && currentView !== 'detailed' ? 'Loading...' : 'Detailed Analysis'}
            </Button>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            {currentView === 'summary' 
              ? '🤖 AI-powered pilot briefing with key decisions and weather insights'
              : '📊 Comprehensive technical analysis with charts, maps, and hourly forecasts'
            }
          </p>
        </CardContent>
      </Card>

      {/* Summary View - Modern ML Report Display */}
      {currentView === 'summary' && (
        <>
          {/* Step 1: ML System Analysis */}
          <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-blue-800">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                Step 1: AI System Analysis
                <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                  7 ML Models Active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(data.raw_ml_report || data.ml_model_output) ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-green-400 p-6 rounded-2xl border-2 border-slate-700 shadow-2xl">
                    <div className="flex items-center gap-2 mb-4 text-green-300">
                      <Zap className="h-5 w-5" />
                      <span className="font-bold">ULTIMATE AVIATION ML SYSTEM OUTPUT</span>
                      <div className="ml-auto flex gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-100"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-200"></div>
                      </div>
                    </div>
                    <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed overflow-auto max-h-[500px] scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-slate-800">
                      {data.raw_ml_report || data.ml_model_output}
                    </pre>
                  </div>
                  <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span>961,881+ Historical Records</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-green-600" />
                      <span>Real-time Data Integration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-purple-600" />
                      <span>High Confidence Analysis</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                    <Shield className="h-8 w-8 mx-auto mb-3 text-green-600" />
                    <h4 className="font-bold mb-2 text-green-800">Flight Status</h4>
                    <Badge variant={getRiskBadgeVariant(flight_decision.risk_score)} className="text-lg px-4 py-1">
                      {flight_decision.decision}
                    </Badge>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <CloudRain className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                    <h4 className="font-bold mb-2 text-blue-800">Weather Conditions</h4>
                    <p className="text-sm text-blue-700">{weather_summary.departure.conditions} → {weather_summary.arrival.conditions}</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <Target className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                    <h4 className="font-bold mb-2 text-purple-800">Key Recommendation</h4>
                    <p className="text-sm text-purple-700">{risk_assessment.recommendations?.[0] || 'Follow standard procedures'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Weather Charts & Analysis */}
          <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-green-800">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                Step 2: Weather Data Visualization
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  Live Data
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Temperature Chart */}
                <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
                  <h4 className="font-bold mb-4 flex items-center gap-2 text-orange-800">
                    <Thermometer className="h-5 w-5" />
                    Temperature Analysis
                  </h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={temperatureData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f97316" opacity={0.3} />
                        <XAxis dataKey="name" tick={{ fill: '#ea580c' }} />
                        <YAxis tick={{ fill: '#ea580c' }} />
                        <Tooltip 
                          formatter={(value) => [`${value}°C`, 'Temperature']}
                          contentStyle={{ 
                            backgroundColor: '#fed7aa', 
                            border: '1px solid #fb923c',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="temperature" fill="#f97316" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Wind Analysis */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <h4 className="font-bold mb-4 flex items-center gap-2 text-blue-800">
                    <Wind className="h-5 w-5" />
                    Wind Analysis
                  </h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={windData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#0ea5e9" opacity={0.3} />
                        <XAxis dataKey="name" tick={{ fill: '#0284c7' }} />
                        <YAxis tick={{ fill: '#0284c7' }} />
                        <Tooltip 
                          formatter={(value) => [`${value} knots`, 'Wind Speed']}
                          contentStyle={{ 
                            backgroundColor: '#bfdbfe', 
                            border: '1px solid #3b82f6',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="windSpeed" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Action Items */}
          <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-purple-800">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                Step 3: Action Items & Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => setCurrentView('detailed')}
                  className="flex items-center gap-2 px-8 py-4 text-lg border-2 border-purple-300 hover:bg-purple-50"
                >
                  <BarChart3 className="h-5 w-5" />
                  View Detailed Technical Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Detailed View - Enhanced with Charts and Maps */}
      {currentView === 'detailed' && (
        <>
          {/* Detailed ML Model Report */}
          {(data.raw_ml_report || data.ml_model_output) && (
            <Card className="border-2 border-orange-500/30 bg-gradient-to-br from-orange-50/50 via-white to-orange-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <div className="flex items-center gap-2">
                    <Activity className="h-6 w-6" />
                    <span>Comprehensive ML System Analysis</span>
                  </div>
                  <Badge variant="outline" className="ml-auto text-xs bg-orange-100 text-orange-800">
                    Detailed Analysis
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-green-400 p-6 rounded-2xl border-2 border-slate-700 shadow-2xl">
                  <div className="flex items-center gap-2 mb-4 text-green-300">
                    <Activity className="h-5 w-5" />
                    <span className="font-bold">COMPREHENSIVE TECHNICAL ANALYSIS</span>
                    <div className="ml-auto flex gap-1">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-100"></div>
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-200"></div>
                    </div>
                  </div>
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed overflow-auto max-h-[600px] scrollbar-thin scrollbar-thumb-orange-600 scrollbar-track-slate-800">
                    {data.raw_ml_report || data.ml_model_output}
                  </pre>
                </div>
                <div className="mt-4 text-center text-xs text-muted-foreground">
                  📊 Comprehensive Analysis • 7 ML Models • In-Flight Hourly Forecasts • Technical Details
                </div>
              </CardContent>
            </Card>
          )}

          {/* Flight Path Map */}
          <FlightPathMap 
            airports={(() => {
              const airports = [];
              // Add departure
              airports.push({
                code: route_info.departure,
                lat: 0,
                lng: 0,
                type: 'departure' as const
              });
              
              // Add waypoints if multi-airport route
              if (route_info.waypoints && route_info.waypoints.length > 0) {
                route_info.waypoints.forEach(waypoint => {
                  airports.push({
                    code: waypoint,
                    lat: 0,
                    lng: 0,
                    type: 'waypoint' as const
                  });
                });
              }
              
              // Add arrival
              airports.push({
                code: route_info.arrival,
                lat: 0,
                lng: 0,
                type: 'arrival' as const
              });
              
              return airports;
            })()}
            totalDistance={route_info.distance_nm}
            flightTime={route_info.duration}
            routeType={route_info.route_type || 'single'}
          />

          {/* Advanced Analytics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risk Assessment Chart */}
            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <Target className="h-5 w-5" />
                  Risk Assessment Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}%`, 'Risk Level']} />
                      <Bar dataKey="riskScore" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Weather Conditions Summary */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <CloudRain className="h-5 w-5" />
                  Current Weather Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-bold text-blue-800 mb-2">Departure: {weather_summary.departure.airport}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>🌡️ {weather_summary.departure.temperature}°C</div>
                      <div>💨 {weather_summary.departure.wind_speed}kt</div>
                      <div>👁️ {weather_summary.departure.visibility}mi</div>
                      <div>🛫 {weather_summary.departure.flight_category}</div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">{weather_summary.departure.conditions}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-bold text-green-800 mb-2">Arrival: {weather_summary.arrival.airport}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>🌡️ {weather_summary.arrival.temperature}°C</div>
                      <div>💨 {weather_summary.arrival.wind_speed}kt</div>
                      <div>👁️ {weather_summary.arrival.visibility}mi</div>
                      <div>🛬 {weather_summary.arrival.flight_category}</div>
                    </div>
                    <p className="text-xs text-green-600 mt-2">{weather_summary.arrival.conditions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ML Model Insights */}
          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Activity className="h-5 w-5" />
                7 ML Model Predictions & Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ml_insights.predictions && ml_insights.predictions.length > 0 ? (
                  ml_insights.predictions.map((prediction, index) => (
                    <div key={index} className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-purple-600" />
                        <span className="font-bold text-purple-800">Model {index + 1}</span>
                      </div>
                      <p className="text-sm text-purple-700">{prediction}</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center p-8 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>ML model insights will appear here when available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations Panel */}
          <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                Operational Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {risk_assessment.recommendations && risk_assessment.recommendations.length > 0 ? (
                  risk_assessment.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-green-800">{rec}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-sm text-green-800">Follow standard flight procedures</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default WeatherBriefingDisplay;
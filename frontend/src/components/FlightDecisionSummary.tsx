import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plane, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Wind,
  Eye,
  CloudRain
} from 'lucide-react';

interface FlightDecisionSummaryProps {
  pilotBriefing?: {
    riskLevel: number;
    weatherForecast: string;
    recommendations: string[];
    conditions: string;
    keyInsights: string[];
    flightStatus: 'CLEARED' | 'CAUTION' | 'NOT_RECOMMENDED';
  };
  route?: {
    departure: string;
    arrival: string;
    distance?: number;
    flightTime?: number;
  };
}

export const FlightDecisionSummary: React.FC<FlightDecisionSummaryProps> = ({ 
  pilotBriefing, 
  route 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getRiskLevelColor = (level: number) => {
    if (level <= 30) return 'text-green-600 bg-green-50 border-green-200';
    if (level <= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CLEARED': return 'bg-green-600';
      case 'CAUTION': return 'bg-yellow-600';
      case 'NOT_RECOMMENDED': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  if (!pilotBriefing) {
    return (
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Plane className="w-5 h-5" />
            Flight Decision Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Plane className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Generate a flight analysis to view decision summary</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-blue-700">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5" />
            Flight Decision Summary
          </div>
          <Badge className={getStatusColor(pilotBriefing.flightStatus)}>
            {pilotBriefing.flightStatus.replace('_', ' ')}
          </Badge>
        </CardTitle>
        {route && (
          <div className="text-sm text-gray-600">
            {route.departure} → {route.arrival} • {currentTime.toLocaleString()}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Risk Assessment */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border-2 ${getRiskLevelColor(pilotBriefing.riskLevel)}`}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold">Risk Level</span>
            </div>
            <div className="text-2xl font-bold">
              {pilotBriefing.riskLevel}/100
            </div>
            <div className="text-xs opacity-75">
              {pilotBriefing.riskLevel <= 30 ? 'LOW RISK' : 
               pilotBriefing.riskLevel <= 60 ? 'MODERATE RISK' : 'HIGH RISK'}
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-blue-600">Weather Status</span>
            </div>
            <div className="text-lg font-bold text-blue-700">
              {pilotBriefing.conditions}
            </div>
            <div className="text-xs text-gray-600">
              Current Conditions
            </div>
          </div>

          {route?.flightTime && (
            <div className="p-4 bg-white rounded-lg border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="font-semibold text-purple-600">Flight Time</span>
              </div>
              <div className="text-lg font-bold text-purple-700">
                {Math.floor(route.flightTime)}h {Math.round((route.flightTime % 1) * 60)}m
              </div>
              <div className="text-xs text-gray-600">
                Estimated Duration
              </div>
            </div>
          )}
        </div>

        {/* Weather Forecast */}
        <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
          <div className="flex items-center gap-2 mb-3">
            <CloudRain className="w-5 h-5 text-cyan-600" />
            <h3 className="font-semibold text-cyan-700">Weather Forecast</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">
            {pilotBriefing.weatherForecast}
          </p>
        </div>

        {/* Key Insights */}
        {pilotBriefing.keyInsights && pilotBriefing.keyInsights.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-indigo-700">Key Insights</h3>
            </div>
            <ul className="space-y-2">
              {pilotBriefing.keyInsights.map((insight, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Operational Recommendations */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-700">Operational Recommendations</h3>
          </div>
          <ul className="space-y-2">
            {pilotBriefing.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Flight Status Indicator */}
        <div className="text-center p-4">
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold ${getStatusColor(pilotBriefing.flightStatus)}`}>
            {pilotBriefing.flightStatus === 'CLEARED' && <CheckCircle className="w-5 h-5" />}
            {pilotBriefing.flightStatus === 'CAUTION' && <AlertTriangle className="w-5 h-5" />}
            {pilotBriefing.flightStatus === 'NOT_RECOMMENDED' && <AlertTriangle className="w-5 h-5" />}
            
            Flight {pilotBriefing.flightStatus.replace('_', ' ')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
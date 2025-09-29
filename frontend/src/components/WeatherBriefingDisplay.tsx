import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Cloud, Plane, Wind, Thermometer, Eye, Gauge, 
  MapPin, Clock, AlertTriangle, CheckCircle, 
  Activity, TrendingUp 
} from 'lucide-react';

interface WeatherBriefingData {
  success?: boolean;
  origin?: string;
  destination?: string;
  briefing?: {
    route?: string;
    distance?: string;
    estimated_time?: string;
    weather_summary?: string;
    winds_aloft?: string;
    visibility?: string;
    ceiling?: string;
    temperature?: string;
    altimeter?: string;
    conditions?: string;
  };
  waypoints?: Array<{
    code: string;
    name: string;
    weather: string;
    metar?: string;
    conditions?: string;
  }>;
  notams?: string[];
  briefing_data?: string;
  flight_safety?: {
    recommendation?: string;
    risk_level?: string;
    confidence?: string;
  };
  [key: string]: any;
}

interface WeatherBriefingProps {
  data: WeatherBriefingData | string | null;
}

export const WeatherBriefingDisplay: React.FC<WeatherBriefingProps> = ({ data }) => {
  const [currentView, setCurrentView] = useState<'summary' | 'detailed'>('summary');

  // Handle different data formats
  const processedData = React.useMemo(() => {
    if (!data) return null;
    
    // If data is a string (briefing_data), create a structured object
    if (typeof data === 'string') {
      return {
        success: true,
        briefing_data: data,
        origin: 'DEP',
        destination: 'ARR'
      };
    }
    
    // If data is already an object, return as is
    return data;
  }, [data]);

  if (!processedData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Cloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No weather briefing data available</p>
          <p className="text-sm text-muted-foreground mt-2">
            Enter flight codes and generate a briefing to see detailed weather information
          </p>
        </div>
      </div>
    );
  }

  const formatBriefingText = (text: string) => {
    if (!text) return [];
    
    return text.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h3 key={index} className="font-bold text-lg mt-4 mb-2 text-primary">{line.replace(/\*\*/g, '')}</h3>;
      } else if (line.startsWith('- ')) {
        return <li key={index} className="ml-4 mb-1">{line.substring(2)}</li>;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return <p key={index} className="mb-2">{line}</p>;
      }
    });
  };

  const getRiskBadgeVariant = (risk: string) => {
    if (!risk) return 'default';
    switch (risk.toLowerCase()) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Flight Summary Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Flight Weather Briefing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {processedData.origin && processedData.destination && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{processedData.origin}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-medium">{processedData.destination}</span>
              </div>
            )}
            
            {processedData.briefing?.distance && (
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span>Distance: {processedData.briefing.distance}</span>
              </div>
            )}
            
            {processedData.briefing?.estimated_time && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Est. Time: {processedData.briefing.estimated_time}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weather Summary Cards */}
      {processedData.briefing && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {processedData.briefing.weather_summary && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Cloud className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Conditions</span>
                </div>
                <p className="text-sm text-muted-foreground">{processedData.briefing.weather_summary}</p>
              </CardContent>
            </Card>
          )}
          
          {processedData.briefing.winds_aloft && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wind className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Winds Aloft</span>
                </div>
                <p className="text-sm text-muted-foreground">{processedData.briefing.winds_aloft}</p>
              </CardContent>
            </Card>
          )}
          
          {processedData.briefing.visibility && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">Visibility</span>
                </div>
                <p className="text-sm text-muted-foreground">{processedData.briefing.visibility}</p>
              </CardContent>
            </Card>
          )}
          
          {processedData.briefing.temperature && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer className="h-4 w-4 text-red-500" />
                  <span className="font-medium">Temperature</span>
                </div>
                <p className="text-sm text-muted-foreground">{processedData.briefing.temperature}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Safety Assessment */}
      {processedData.flight_safety && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Flight Safety Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {processedData.flight_safety.recommendation && (
                <Badge variant={processedData.flight_safety.recommendation === 'GO' ? 'default' : 'destructive'}>
                  {processedData.flight_safety.recommendation}
                </Badge>
              )}
              {processedData.flight_safety.risk_level && (
                <Badge variant={getRiskBadgeVariant(processedData.flight_safety.risk_level)}>
                  Risk: {processedData.flight_safety.risk_level}
                </Badge>
              )}
              {processedData.flight_safety.confidence && (
                <Badge variant="outline">
                  Confidence: {processedData.flight_safety.confidence}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Briefing */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Weather Briefing</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={currentView === 'summary' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView('summary')}
            >
              Summary
            </Button>
            <Button
              variant={currentView === 'detailed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView('detailed')}
            >
              Detailed
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {processedData.briefing_data ? (
            <div className="prose prose-sm max-w-none">
              {formatBriefingText(processedData.briefing_data)}
            </div>
          ) : (
            <div className="text-center p-8">
              <AlertTriangle className="mx-auto h-8 w-8 text-yellow-500 mb-4" />
              <p className="text-muted-foreground">
                Detailed briefing data not available. 
                Try generating a new briefing with updated parameters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Airport Information */}
      {processedData.waypoints && processedData.waypoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Airport Weather Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {processedData.waypoints.map((waypoint, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{waypoint.code} - {waypoint.name}</h4>
                    <Badge variant={waypoint.weather === 'VFR' ? 'default' : 'secondary'}>
                      {waypoint.weather}
                    </Badge>
                  </div>
                  {waypoint.metar && (
                    <p className="text-sm font-mono text-muted-foreground bg-muted p-2 rounded">
                      {waypoint.metar}
                    </p>
                  )}
                  {waypoint.conditions && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Conditions: {waypoint.conditions}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* NOTAMs */}
      {processedData.notams && processedData.notams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              NOTAMs & Notices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {processedData.notams.map((notam, index) => (
                <li key={index} className="text-sm p-2 bg-muted rounded">
                  {notam}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WeatherBriefingDisplay;
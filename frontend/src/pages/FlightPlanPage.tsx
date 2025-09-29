import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, Plane, Clock, TrendingUp, BarChart3, 
  MessageSquare, Navigation, Download, Share 
} from 'lucide-react';
import FlightPathMap from '../components/FlightPathMap';
import { WeatherBriefingDisplay } from '../components/WeatherBriefingDisplay';
import WeatherGraphicsDisplay from '../components/WeatherGraphicsDisplay';
import UserFeedbackSystem from '../components/UserFeedbackSystem';
import NextStepsDisplay from '../components/NextStepsDisplay';

const FlightPlanPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [briefingData, setBriefingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadBriefingData = () => {
      try {
        // Try to get data from sessionStorage first
        const storedData = sessionStorage.getItem(`briefing_${id}`);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setBriefingData(parsedData);
          setLoading(false);
          return;
        }

        // If no stored data, try to fetch from API
        fetchBriefingData();
      } catch (error) {
        console.error('Error loading briefing data:', error);
        setLoading(false);
      }
    };

    const fetchBriefingData = async () => {
      try {
        // In a real app, you'd fetch based on the plan ID
        // For now, we'll use mock data or stored data
        setLoading(false);
      } catch (error) {
        console.error('Error fetching briefing data:', error);
        setLoading(false);
      }
    };

    loadBriefingData();
  }, [id]);

  const handleFeedbackSubmit = (feedback: any) => {
    console.log('Feedback submitted:', feedback);
    // In production, send to API
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flight plan...</p>
        </div>
      </div>
    );
  }

  if (!briefingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Flight Plan Not Found</h2>
          <p className="text-gray-600 mb-4">The requested flight plan could not be loaded.</p>
          <Button onClick={() => window.location.href = '/'}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const routeString = briefingData.route_info ? 
    `${briefingData.route_info.departure} → ${briefingData.route_info.arrival}` :
    'Unknown Route';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Flight Plan Analysis
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">{routeString}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Generated {new Date().toLocaleString()}</span>
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  Plan ID: {id}
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {briefingData.route_info?.distance_nm || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Distance (nm)</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {briefingData.route_info?.duration || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Est. Duration</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {briefingData.risk_assessment?.overall_risk || 'N/A'}%
                </div>
                <div className="text-sm text-gray-600">Risk Score</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {briefingData.flight_decision?.decision || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Recommendation</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Plane className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              Flight Map
            </TabsTrigger>
            <TabsTrigger value="graphics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Weather Graphics
            </TabsTrigger>
            <TabsTrigger value="next-steps" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Next Steps
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <WeatherBriefingDisplay data={briefingData} />
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Navigation className="w-6 h-6" />
                  Interactive Flight Path Map
                </CardTitle>
                <p className="text-sm text-green-600">
                  Explore your flight route with detailed airport information and weather conditions
                </p>
              </CardHeader>
              <CardContent>
                {briefingData.route_info && (
                  <FlightPathMap
                    airports={(() => {
                      const airports = [];
                      // Add departure
                      airports.push({
                        code: briefingData.route_info.departure,
                        lat: 0,
                        lng: 0,
                        type: 'departure' as const
                      });
                      
                      // Add waypoints if multi-airport route
                      if (briefingData.route_info.waypoints && briefingData.route_info.waypoints.length > 0) {
                        briefingData.route_info.waypoints.forEach((waypoint: string) => {
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
                        code: briefingData.route_info.arrival,
                        lat: 0,
                        lng: 0,
                        type: 'arrival' as const
                      });
                      
                      return airports;
                    })()}
                    totalDistance={briefingData.route_info.distance_nm || 0}
                    flightTime={briefingData.route_info.duration || '0h 0m'}
                    routeType={briefingData.route_info.route_type || 'single'}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="graphics" className="space-y-6">
            <WeatherGraphicsDisplay 
              weatherData={briefingData} 
              routeInfo={briefingData.route_info}
            />
          </TabsContent>

          <TabsContent value="next-steps" className="space-y-6">
            <NextStepsDisplay 
              mlModelOutput={briefingData.ml_insights}
              weatherData={briefingData}
              routeInfo={briefingData.route_info}
            />
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <UserFeedbackSystem 
              flightRoute={routeString}
              onFeedbackSubmit={handleFeedbackSubmit}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FlightPlanPage;
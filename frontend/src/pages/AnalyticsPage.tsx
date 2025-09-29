import React, { useState, useEffect } from 'react';
import Header from "@/components/Header";
import EnhancedChartsDisplay from "@/components/EnhancedChartsDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, Search, Zap, TrendingUp, 
  RefreshCw, Download, Share, 
  CloudRain, AlertTriangle
} from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);

  // Simulate data loading
  useEffect(() => {
    const loadAnalyticsData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setWeatherData({
          route_info: {
            departure: 'KJFK',
            arrival: 'KLAX'
          },
          weather_summary: {
            departure: {
              temperature: 22,
              wind_speed: 12,
              visibility: 10
            },
            arrival: {
              temperature: 28,
              wind_speed: 8,
              visibility: 15
            }
          },
          risk_assessment: {
            overall_risk: 25
          }
        });
        setIsLoading(false);
      }, 1500);
    };

    loadAnalyticsData();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    // Simulate search
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleRefreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setWeatherData({
        ...weatherData,
        weather_summary: {
          ...weatherData?.weather_summary,
          departure: {
            temperature: Math.round(Math.random() * 20 + 10),
            wind_speed: Math.round(Math.random() * 15 + 5),
            visibility: Math.round(Math.random() * 10 + 5)
          }
        }
      });
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AviFlux Analytics Hub
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Advanced weather analytics and data visualization for aviation professionals. 
            Get comprehensive insights with interactive charts and real-time weather intelligence.
          </p>
        </div>

        {/* Search and Controls */}
        <Card className="mb-8 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Search className="w-5 h-5" />
              Route Analytics Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <Input
                  placeholder="Enter route (e.g., KJFK,KORD,KLAX) or airport codes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-lg"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Analyze
              </Button>
              <Button 
                variant="outline" 
                onClick={handleRefreshData}
                disabled={isLoading}
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-700">
                {isLoading ? '---' : '127'}
              </div>
              <div className="text-sm text-green-600">
                Active Routes Analyzed
              </div>
              <Badge variant="secondary" className="mt-1 bg-green-100 text-green-700">
                +12 Today
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <CloudRain className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {isLoading ? '---' : '98.5%'}
              </div>
              <div className="text-sm text-blue-600">
                Weather Data Accuracy
              </div>
              <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-700">
                Real-time
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-orange-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-700">
                {isLoading ? '---' : '3'}
              </div>
              <div className="text-sm text-orange-600">
                Weather Alerts
              </div>
              <Badge variant="secondary" className="mt-1 bg-orange-100 text-orange-700">
                Moderate Risk
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-700">
                {isLoading ? '---' : '42.8M'}
              </div>
              <div className="text-sm text-purple-600">
                Data Points Processed
              </div>
              <Badge variant="secondary" className="mt-1 bg-purple-100 text-purple-700">
                This Month
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Display */}
        {isLoading ? (
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex items-center justify-center space-x-2">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-lg text-gray-600">Loading comprehensive analytics...</span>
              </div>
              <div className="mt-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <EnhancedChartsDisplay weatherData={weatherData} />
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Full Report
          </Button>
          <Button 
            variant="outline" 
            className="border-purple-300 text-purple-600 hover:bg-purple-50 px-8 py-3"
          >
            <Share className="w-4 h-4 mr-2" />
            Share Analytics
          </Button>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-12 text-gray-500">
          <p className="text-sm">
            Data updated every 5 minutes • Powered by AviFlux Weather Intelligence Platform
          </p>
          <p className="text-xs mt-2">
            Advanced analytics for aviation professionals • Real-time weather insights and risk assessment
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
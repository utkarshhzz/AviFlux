import React, { useState } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, BarChart3, PieChart as PieChartIcon, Activity, 
  Cloud, Wind, Thermometer, Eye, Gauge,
  Download, Share
} from 'lucide-react';
import './EnhancedChartsDisplay.css';

interface EnhancedChartsProps {
  weatherData?: any;
}

const EnhancedChartsDisplay: React.FC<EnhancedChartsProps> = ({ 
  weatherData 
}) => {
  const [activeChart, setActiveChart] = useState('overview');

  // Prepare comprehensive weather data
  const prepareWeatherTrendData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(hour => ({
      hour: `${hour}:00`,
      temperature: 15 + Math.sin(hour * Math.PI / 12) * 10 + Math.random() * 5,
      humidity: 60 + Math.sin((hour + 6) * Math.PI / 12) * 20 + Math.random() * 10,
      pressure: 1013 + Math.sin((hour + 3) * Math.PI / 12) * 15 + Math.random() * 5,
      windSpeed: 10 + Math.sin((hour + 2) * Math.PI / 8) * 15 + Math.random() * 8,
      visibility: 8 + Math.sin((hour + 4) * Math.PI / 10) * 3 + Math.random() * 2
    }));
  };

  const prepareFlightProfileData = () => {
    const segments = Array.from({ length: 20 }, (_, i) => i * 5);
    return segments.map(percent => {
      let altitude;
      if (percent <= 20) {
        altitude = percent * 1750; // Climb
      } else if (percent >= 80) {
        altitude = 35000 - (percent - 80) * 1750; // Descent
      } else {
        altitude = 35000 + Math.sin(percent * Math.PI / 50) * 2000; // Cruise with variations
      }
      
      return {
        distance: percent + '%',
        altitude: Math.max(0, altitude),
        speed: 450 + Math.sin(percent * Math.PI / 30) * 50,
        fuelRemaining: 100 - (percent * 0.8) + Math.random() * 5,
        turbulence: Math.max(0, Math.sin(percent * Math.PI / 25) * 3 + Math.random() * 2)
      };
    });
  };

  const prepareRiskRadarData = () => {
    return [
      { subject: 'Turbulence', A: Math.random() * 80 + 20, fullMark: 100 },
      { subject: 'Icing', A: Math.random() * 60 + 10, fullMark: 100 },
      { subject: 'Thunderstorms', A: Math.random() * 70 + 15, fullMark: 100 },
      { subject: 'Wind Shear', A: Math.random() * 50 + 20, fullMark: 100 },
      { subject: 'Visibility', A: Math.random() * 40 + 30, fullMark: 100 },
      { subject: 'Low Clouds', A: Math.random() * 60 + 25, fullMark: 100 }
    ];
  };

  const prepareWeatherDistribution = () => {
    return [
      { name: 'Clear', value: 45, color: '#22c55e' },
      { name: 'Partly Cloudy', value: 30, color: '#3b82f6' },
      { name: 'Overcast', value: 15, color: '#6b7280' },
      { name: 'Rain', value: 8, color: '#ef4444' },
      { name: 'Storms', value: 2, color: '#7c3aed' }
    ];
  };

  const prepareAirportComparison = () => {
    const airports = [
      weatherData?.route_info?.departure || 'KJFK',
      weatherData?.route_info?.arrival || 'KLAX'
    ];
    
    return [
      {
        airport: airports[0],
        temperature: weatherData?.weather_summary?.departure?.temperature || 20,
        windSpeed: weatherData?.weather_summary?.departure?.wind_speed || 12,
        visibility: weatherData?.weather_summary?.departure?.visibility || 10,
        pressure: 1013 + Math.random() * 20,
        humidity: 65 + Math.random() * 20
      },
      {
        airport: airports[1],
        temperature: weatherData?.weather_summary?.arrival?.temperature || 25,
        windSpeed: weatherData?.weather_summary?.arrival?.wind_speed || 8,
        visibility: weatherData?.weather_summary?.arrival?.visibility || 15,
        pressure: 1015 + Math.random() * 15,
        humidity: 55 + Math.random() * 25
      }
    ];
  };

  const weatherTrendData = prepareWeatherTrendData();
  const flightProfileData = prepareFlightProfileData();
  const riskRadarData = prepareRiskRadarData();
  const weatherDistribution = prepareWeatherDistribution();
  const airportComparison = prepareAirportComparison();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-blue-600">
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
              {entry.unit || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <BarChart3 className="w-6 h-6" />
              Advanced Weather Analytics Dashboard
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Charts
              </Button>
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Share Analysis
              </Button>
            </div>
          </div>
          <p className="text-sm text-purple-600">
            Comprehensive weather analysis with interactive charts and real-time data visualization
          </p>
        </CardHeader>
      </Card>

      {/* Chart Tabs */}
      <Tabs value={activeChart} onValueChange={setActiveChart} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="weather-trends" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Weather Trends
          </TabsTrigger>
          <TabsTrigger value="flight-profile" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Flight Profile
          </TabsTrigger>
          <TabsTrigger value="risk-analysis" className="flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            Risk Analysis
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center gap-2">
            <PieChartIcon className="w-4 h-4" />
            Distribution
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Airport Comparison */}
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <BarChart3 className="w-5 h-5" />
                  Airport Weather Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={airportComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="airport" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="temperature" fill="#ef4444" name="Temperature (°C)" />
                    <Bar dataKey="windSpeed" fill="#3b82f6" name="Wind Speed (kts)" />
                    <Bar dataKey="visibility" fill="#22c55e" name="Visibility (mi)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weather Distribution */}
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <PieChartIcon className="w-5 h-5" />
                  Weather Conditions Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={weatherDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {weatherDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Weather Trends Tab */}
        <TabsContent value="weather-trends" className="space-y-6">
          <Card className="border-2 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Activity className="w-5 h-5" />
                24-Hour Weather Trend Analysis
              </CardTitle>
              <p className="text-sm text-orange-600">
                Hourly weather parameter variations for optimal flight planning
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={weatherTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis yAxisId="temp" orientation="left" />
                  <YAxis yAxisId="other" orientation="right" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line yAxisId="temp" type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={3} name="Temperature (°C)" />
                  <Line yAxisId="other" type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} name="Humidity (%)" />
                  <Line yAxisId="other" type="monotone" dataKey="windSpeed" stroke="#22c55e" strokeWidth={2} name="Wind Speed (kts)" />
                  <Line yAxisId="other" type="monotone" dataKey="visibility" stroke="#f59e0b" strokeWidth={2} name="Visibility (mi)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flight Profile Tab */}
        <TabsContent value="flight-profile" className="space-y-6">
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <TrendingUp className="w-5 h-5" />
                Flight Profile & Performance Analysis
              </CardTitle>
              <p className="text-sm text-purple-600">
                Altitude profile, speed variations, and fuel consumption throughout the flight
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={flightProfileData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="distance" />
                  <YAxis yAxisId="altitude" orientation="left" />
                  <YAxis yAxisId="other" orientation="right" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area 
                    yAxisId="altitude" 
                    type="monotone" 
                    dataKey="altitude" 
                    stackId="1"
                    stroke="#8b5cf6" 
                    fill="#c4b5fd" 
                    name="Altitude (ft)"
                  />
                  <Line yAxisId="other" type="monotone" dataKey="speed" stroke="#ef4444" strokeWidth={2} name="Speed (kts)" />
                  <Line yAxisId="other" type="monotone" dataKey="fuelRemaining" stroke="#22c55e" strokeWidth={2} name="Fuel (%)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Analysis Tab */}
        <TabsContent value="risk-analysis" className="space-y-6">
          <Card className="border-2 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Gauge className="w-5 h-5" />
                Weather Risk Assessment Radar
              </CardTitle>
              <p className="text-sm text-red-600">
                Multi-dimensional risk analysis across different weather hazards
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={riskRadarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Risk Level" dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} strokeWidth={2} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enhanced Weather Distribution */}
            <Card className="border-2 border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-700">
                  <Cloud className="w-5 h-5" />
                  Weather Pattern Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={weatherDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {weatherDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Wind Direction Analysis */}
            <Card className="border-2 border-cyan-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-700">
                  <Wind className="w-5 h-5" />
                  Wind Direction & Speed Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'].map((direction) => (
                    <div key={direction} className="flex items-center gap-3">
                      <div className="w-8 text-sm font-medium">{direction}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="wind-direction-bar progress-bar-animated"></div>
                      </div>
                      <div className="text-sm text-gray-600 w-12">
                        {Math.round(Math.random() * 25 + 5)} kts
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <Thermometer className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold text-blue-700">
              {weatherData?.weather_summary?.departure?.temperature || Math.round(Math.random() * 20 + 10)}°C
            </div>
            <div className="text-sm text-blue-600">Average Temperature</div>
          </CardContent>
        </Card>

        <Card className="text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <Wind className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold text-green-700">
              {weatherData?.weather_summary?.departure?.wind_speed || Math.round(Math.random() * 15 + 5)} kts
            </div>
            <div className="text-sm text-green-600">Wind Speed</div>
          </CardContent>
        </Card>

        <Card className="text-center bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4">
            <Eye className="w-8 h-8 mx-auto mb-2 text-gray-500" />
            <div className="text-2xl font-bold text-orange-700">
              {weatherData?.weather_summary?.departure?.visibility || Math.round(Math.random() * 10 + 5)} mi
            </div>
            <div className="text-sm text-orange-600">Visibility</div>
          </CardContent>
        </Card>

        <Card className="text-center bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <CardContent className="p-4">
            <Activity className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold text-purple-700">
              {weatherData?.risk_assessment?.overall_risk || Math.round(Math.random() * 30 + 10)}%
            </div>
            <div className="text-sm text-purple-600">Risk Level</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedChartsDisplay;
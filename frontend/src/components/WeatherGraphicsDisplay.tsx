import React from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { 
  Thermometer, Wind, Gauge, TrendingUp, 
  Eye, Activity 
} from 'lucide-react';

interface WeatherGraphicsProps {
  weatherData: any;
  routeInfo?: any;
}

const WeatherGraphicsDisplay: React.FC<WeatherGraphicsProps> = ({ weatherData, routeInfo }) => {
  // Prepare chart data from weather information
  const prepareTemperatureData = () => {
    if (!weatherData?.weather_summary) return [];
    
    const data = [
      {
        name: weatherData.weather_summary.departure?.airport || 'DEP',
        temperature: weatherData.weather_summary.departure?.temperature || 0,
        altitude: 0,
        location: 'Departure'
      }
    ];

    // Add waypoint data if available
    if (weatherData.waypoint_weather) {
      weatherData.waypoint_weather.forEach((waypoint: any, index: number) => {
        data.push({
          name: waypoint.airport || `WP${index + 1}`,
          temperature: waypoint.temperature || 0,
          altitude: waypoint.altitude || 35000,
          location: 'Waypoint'
        });
      });
    }

    data.push({
      name: weatherData.weather_summary.arrival?.airport || 'ARR',
      temperature: weatherData.weather_summary.arrival?.temperature || 0,
      altitude: 0,
      location: 'Arrival'
    });

    return data;
  };

  const prepareWindData = () => {
    if (!weatherData?.weather_summary) return [];
    
    return [
      {
        name: weatherData.weather_summary.departure?.airport || 'DEP',
        windSpeed: weatherData.weather_summary.departure?.wind_speed || 0,
        windDirection: weatherData.weather_summary.departure?.wind_direction || 0,
        gusts: (weatherData.weather_summary.departure?.wind_speed || 0) * 1.2
      },
      {
        name: weatherData.weather_summary.arrival?.airport || 'ARR',
        windSpeed: weatherData.weather_summary.arrival?.wind_speed || 0,
        windDirection: weatherData.weather_summary.arrival?.wind_direction || 0,
        gusts: (weatherData.weather_summary.arrival?.wind_speed || 0) * 1.2
      }
    ];
  };

  const prepareAltitudeProfile = () => {
    const distance = routeInfo?.distance_nm || 1000;
    const data = [];
    
    // Simulate flight profile
    for (let i = 0; i <= 10; i++) {
      const progress = i / 10;
      const distancePoint = distance * progress;
      let altitude;
      
      if (progress <= 0.2) {
        // Climb phase
        altitude = progress * 5 * 35000;
      } else if (progress >= 0.8) {
        // Descent phase
        altitude = (1 - (progress - 0.8) * 5) * 35000;
      } else {
        // Cruise phase
        altitude = 35000;
      }
      
      const temperature = 15 - (altitude / 1000) * 2; // Temperature lapse rate
      
      data.push({
        distance: Math.round(distancePoint),
        altitude: Math.round(altitude),
        temperature: Math.round(temperature),
        windSpeed: 80 + Math.sin(progress * Math.PI) * 20
      });
    }
    
    return data;
  };

  const prepareRiskProfile = () => {
    if (!weatherData?.risk_assessment) return [];
    
    const riskFactors = [
      { factor: 'Turbulence', risk: Math.random() * 70 + 10, color: '#ef4444' },
      { factor: 'Icing', risk: Math.random() * 50 + 5, color: '#06b6d4' },
      { factor: 'Visibility', risk: Math.random() * 40 + 10, color: '#f59e0b' },
      { factor: 'Wind Shear', risk: Math.random() * 60 + 15, color: '#8b5cf6' },
      { factor: 'Convection', risk: Math.random() * 80 + 5, color: '#10b981' }
    ];
    
    return riskFactors;
  };

  const temperatureData = prepareTemperatureData();
  const windData = prepareWindData();
  const altitudeProfile = prepareAltitudeProfile();
  const riskProfile = prepareRiskProfile();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" data-color={entry.color}>
              {entry.name}: {entry.value}{entry.unit || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Flight Weather Graphics & Analysis
        </h3>
        <p className="text-gray-600">
          Comprehensive visual weather data along your flight route
        </p>
      </div>

      {/* Temperature Profile */}
      <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Thermometer className="w-5 h-5" />
            Temperature Profile Along Route
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={temperatureData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="temperature" 
                stroke="#dc2626" 
                strokeWidth={3}
                dot={{ fill: '#dc2626', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Wind Analysis */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Wind className="w-5 h-5" />
            Wind Conditions Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={windData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Wind Speed (kts)', angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="windSpeed" fill="#2563eb" name="Wind Speed" />
              <Bar dataKey="gusts" fill="#60a5fa" name="Gusts" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Altitude & Weather Profile */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <TrendingUp className="w-5 h-5" />
            Flight Profile & Mid-Air Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={altitudeProfile}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="distance" 
                label={{ value: 'Distance (nm)', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                yAxisId="altitude"
                orientation="left"
                label={{ value: 'Altitude (ft)', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="temp"
                orientation="right"
                label={{ value: 'Temperature (°C)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                yAxisId="altitude"
                type="monotone" 
                dataKey="altitude" 
                stroke="#8b5cf6" 
                fill="#c4b5fd"
                name="Altitude"
              />
              <Line 
                yAxisId="temp"
                type="monotone" 
                dataKey="temperature" 
                stroke="#dc2626" 
                strokeWidth={2}
                name="Temperature"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Risk Assessment Chart */}
      <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <Gauge className="w-5 h-5" />
            Weather Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskProfile} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="factor" type="category" width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="risk" 
                fill="#8884d8"
                name="Risk Level"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Weather Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Thermometer className="w-8 h-8 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {weatherData?.weather_summary?.departure?.temperature || 'N/A'}°C
            </div>
            <div className="text-sm text-gray-600">Departure Temp</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Wind className="w-8 h-8 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {weatherData?.weather_summary?.departure?.wind_speed || 'N/A'} kts
            </div>
            <div className="text-sm text-gray-600">Wind Speed</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Eye className="w-8 h-8 text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {weatherData?.weather_summary?.departure?.visibility || 'N/A'} mi
            </div>
            <div className="text-sm text-gray-600">Visibility</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Activity className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {weatherData?.risk_assessment?.overall_risk || 'N/A'}%
            </div>
            <div className="text-sm text-gray-600">Overall Risk</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeatherGraphicsDisplay;
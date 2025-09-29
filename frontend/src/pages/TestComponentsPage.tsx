import React from 'react';
import { WeatherBriefingDisplay } from '../components/WeatherBriefingDisplay';
import WeatherGraphicsDisplay from '../components/WeatherGraphicsDisplay';

// Mock data for testing
const mockWeatherData = {
  success: true,
  origin: "KJFK",
  destination: "KLAX",
  briefing: {
    route: "KJFK → KLAX",
    distance: "245 NM",
    estimated_time: "1h 15m",
    weather_summary: "VFR conditions along entire route - excellent for flight",
    winds_aloft: "250°@15KT at FL100",
    visibility: "> 10 SM",
    ceiling: "BKN250 (25,000 feet broken)",
    temperature: "15°C (59°F)",
    altimeter: "30.12 inHg",
    conditions: "CAVOK - Clear and Visibility OK"
  },
  briefing_data: `**Flight Briefing: KJFK to KLAX**

**Route Information:**
- Distance: 245 NM
- Estimated Flight Time: 1h 15m

**Weather Summary:**
- Current Conditions: VFR along entire route
- Visibility: Greater than 10 SM
- Ceiling: Broken at 25,000 feet
- Winds Aloft: 250° at 15 knots at FL100
- Temperature: 15°C (59°F)
- Altimeter: 30.12 inHg

**Airport Weather:**
**KJFK:** VFR conditions
  METAR: KJFK 291500Z AUTO 25015KT 10SM BKN250 15/08 A3012 RMK AO2
**KLAX:** VFR conditions
  METAR: KLAX 291500Z AUTO 23012KT 10SM BKN220 16/09 A3015 RMK AO2

**NOTAMs:**
- No active NOTAMs affecting this route
- Weather briefing valid for 2 hours from issuance

**Flight Recommendation:**
VFR flight conditions - excellent weather for departure. No significant weather hazards along route.`,
  waypoints: [
    {
      code: "KJFK",
      name: "John F Kennedy International Airport",
      weather: "VFR",
      metar: "KJFK 291500Z AUTO 25015KT 10SM BKN250 15/08 A3012 RMK AO2",
      conditions: "Clear and dry"
    },
    {
      code: "KLAX",
      name: "Los Angeles International Airport",
      weather: "VFR",
      metar: "KLAX 291500Z AUTO 23012KT 10SM BKN220 16/09 A3015 RMK AO2",
      conditions: "Clear and dry"
    }
  ],
  notams: [
    "Route KJFK-KLAX: No active NOTAMs affecting flight operations",
    "Weather briefing valid for 2 hours from issuance",
    "VFR flight recommended - excellent conditions"
  ],
  flight_safety: {
    recommendation: "GO - Excellent conditions for VFR flight",
    risk_level: "LOW",
    confidence: "HIGH"
  }
};

const TestPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">🧪 AviFlux Components Test</h1>
        <p className="text-muted-foreground">Testing Weather Briefing and Graphics Components</p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">📋 Weather Briefing Display</h2>
          <WeatherBriefingDisplay data={mockWeatherData} />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">📊 Weather Graphics Display</h2>
          <WeatherGraphicsDisplay 
            weatherData={mockWeatherData} 
            routeInfo={{ distance_nm: 245, origin: "KJFK", destination: "KLAX" }} 
          />
        </section>
      </div>
    </div>
  );
};

export default TestPage;
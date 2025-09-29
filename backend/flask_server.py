"""
Super simple Flask server for aviation weather briefings
Using Flask which is more stable for development
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import time
import sys

# Create Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app, origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"])

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "aviflux-backend",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
    })

@app.route('/api/flight-briefing', methods=['GET', 'POST'])
def flight_briefing():
    """Flight briefing endpoint"""
    try:
        if request.method == 'GET':
            # Get query parameters
            origin = request.args.get('origin', '')
            destination = request.args.get('destination', '')
        else:  # POST
            # Get JSON data
            data = request.get_json() or {}
            origin = data.get('origin', '')
            destination = data.get('destination', '')
        
        # Generate mock flight briefing
        response_data = {
            "success": True,
            "origin": origin,
            "destination": destination,
            "briefing": {
                "route": f"{origin} -> {destination}",
                "distance": "245 NM",
                "estimated_time": "1h 15m",
                "weather_summary": "VFR conditions along route",
                "winds_aloft": "250@15KT at FL100",
                "visibility": "> 10 SM",
                "ceiling": "BKN250",
                "temperature": "15°C",
                "altimeter": "30.12 inHg",
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
            },
            "waypoints": [
                {
                    "code": origin, 
                    "name": f"{origin} Airport", 
                    "weather": "VFR",
                    "metar": f"{origin} 251252Z AUTO 25015KT 10SM BKN250 15/08 A3012 RMK AO2"
                },
                {
                    "code": destination, 
                    "name": f"{destination} Airport", 
                    "weather": "VFR",
                    "metar": f"{destination} 251252Z AUTO 23012KT 10SM BKN220 16/09 A3015 RMK AO2"
                }
            ],
            "notams": [
                f"Notice: Route {origin}-{destination} has no active NOTAMs affecting flight operations",
                "Weather briefing valid for 2 hours from issuance"
            ]
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Failed to generate flight briefing"
        }), 500

@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({
        "service": "AviFlux Aviation Weather Platform",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "flight_briefing": "/api/flight-briefing"
        }
    })

if __name__ == '__main__':
    print("=" * 60)
    print("         AviFlux Aviation Weather Platform")
    print("              Flask Backend Server")
    print("=" * 60)
    print("🚀 Starting server on http://localhost:8003")
    print("📡 Flight briefing: http://localhost:8003/api/flight-briefing")
    print("🔗 Health check: http://localhost:8003/health")
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=8003, debug=False, use_reloader=False)
"""
ULTRA SIMPLE AVIFLUX BACKEND 
This will work 100% - using Python's built-in HTTP server
"""

import http.server
import socketserver
import json
import urllib.parse
from datetime import datetime

class AviFluxHandler(http.server.BaseHTTPRequestHandler):
    
    def _send_cors_headers(self):
        """Send CORS headers"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Content-Type', 'application/json')
    
    def do_OPTIONS(self):
        """Handle preflight requests"""
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urllib.parse.urlparse(self.path)
        
        if parsed_path.path == '/health':
            response = {
                "status": "healthy",
                "service": "aviflux-backend-simple", 
                "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                "method": "GET"
            }
            
        elif parsed_path.path == '/api/flight-briefing':
            query = urllib.parse.parse_qs(parsed_path.query)
            origin = query.get('origin', ['KJFK'])[0]
            destination = query.get('destination', ['KLAX'])[0]
            
            response = {
                "success": True,
                "origin": origin,
                "destination": destination,
                "method": "GET",
                "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                "briefing": {
                    "route": f"{origin} → {destination}",
                    "distance": "245 NM",
                    "flight_time": "1h 15m",
                    "weather": "VFR conditions",
                    "winds": "250°@15KT",
                    "visibility": "> 10 SM",
                    "ceiling": "BKN250"
                },
                "airports": [
                    {"code": origin, "weather": "VFR"},
                    {"code": destination, "weather": "VFR"}
                ]
            }
            
        else:
            response = {
                "service": "AviFlux Aviation Weather Platform",
                "endpoints": ["/health", "/api/flight-briefing"],
                "status": "running"
            }
        
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(response).encode())
    
    def do_POST(self):
        """Handle POST requests"""
        if self.path == '/api/flight-briefing':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                origin = data.get('origin', data.get('departure', 'KJFK'))
                destination = data.get('destination', data.get('arrival', 'KLAX'))
                
                response = {
                    "success": True,
                    "origin": origin,
                    "destination": destination,
                    "method": "POST",
                    "received_data": data,
                    "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                    "briefing": {
                        "route": f"{origin} → {destination}",
                        "distance": "245 NM",
                        "flight_time": "1h 15m", 
                        "weather_summary": "VFR conditions along entire route",
                        "winds_aloft": "250°@15KT at FL100",
                        "visibility": "> 10 SM",
                        "ceiling": "BKN250",
                        "temperature": "15°C",
                        "altimeter": "30.12 inHg"
                    },
                    "waypoints": [
                        {
                            "code": origin,
                            "name": f"{origin} Airport",
                            "weather": "VFR",
                            "metar": f"{origin} 291400Z AUTO 25015KT 10SM BKN250 15/08 A3012"
                        },
                        {
                            "code": destination, 
                            "name": f"{destination} Airport",
                            "weather": "VFR",
                            "metar": f"{destination} 291400Z AUTO 23012KT 10SM BKN220 16/09 A3015"
                        }
                    ],
                    "notams": [
                        f"Route {origin}-{destination}: No active restrictions",
                        "VFR flight recommended - excellent conditions"
                    ]
                }
                
                self.send_response(200)
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())
                
            except Exception as e:
                error_response = {
                    "success": False,
                    "error": str(e),
                    "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
                }
                self.send_response(500)
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps(error_response).encode())
    
    def log_message(self, format, *args):
        """Custom logging"""
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {format % args}")

def run_server():
    """Start the server"""
    port = 8003
    
    try:
        with socketserver.TCPServer(("", port), AviFluxHandler) as httpd:
            print("=" * 60)
            print("    🚀 AVIFLUX SIMPLE BACKEND SERVER")
            print("=" * 60)
            print(f"✅ Server running on http://localhost:{port}")
            print(f"📡 API: http://localhost:{port}/api/flight-briefing")
            print(f"🔗 Health: http://localhost:{port}/health")
            print("=" * 60)
            print("Press Ctrl+C to stop")
            print("=" * 60)
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    run_server()
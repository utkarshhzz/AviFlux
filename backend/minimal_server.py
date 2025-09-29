"""
Minimal working server for frontend-backend connection
This is a simplified version focused on the flight briefing endpoint
"""

import json
import socket
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import time
import sys


class FlightBriefingHandler(BaseHTTPRequestHandler):
    def _set_headers(self):
        """Set CORS headers for all responses"""
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Max-Age', '86400')

    def do_OPTIONS(self):
        """Handle preflight CORS requests"""
        self.send_response(200)
        self._set_headers()
        self.end_headers()

    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/flight-briefing':
            # Get query parameters
            query_params = parse_qs(parsed_path.query)
            origin = query_params.get('origin', [''])[0]
            destination = query_params.get('destination', [''])[0]
            
            # Generate mock flight briefing data
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
                    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
                },
                "waypoints": [
                    {"code": origin, "name": f"{origin} Airport", "weather": "VFR"},
                    {"code": destination, "name": f"{destination} Airport", "weather": "VFR"}
                ]
            }
            
            self.send_response(200)
            self._set_headers()
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode())
            
        elif parsed_path.path == '/health':
            # Health check endpoint
            self.send_response(200)
            self._set_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"status": "healthy", "service": "aviflux-backend"}).encode())
            
        else:
            # Not found
            self.send_response(404)
            self._set_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode())

    def do_POST(self):
        """Handle POST requests"""
        if self.path == '/api/flight-briefing':
            try:
                # Read request body
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                request_data = json.loads(post_data.decode('utf-8'))
                
                origin = request_data.get('origin', '')
                destination = request_data.get('destination', '')
                
                # Generate mock flight briefing data
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
                        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
                    },
                    "waypoints": [
                        {"code": origin, "name": f"{origin} Airport", "weather": "VFR"},
                        {"code": destination, "name": f"{destination} Airport", "weather": "VFR"}
                    ]
                }
                
                self.send_response(200)
                self._set_headers()
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode())
                
            except Exception as e:
                error_response = {"error": str(e), "success": False}
                self.send_response(500)
                self._set_headers()
                self.end_headers()
                self.wfile.write(json.dumps(error_response).encode())
        else:
            self.send_response(404)
            self._set_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode())

    def log_message(self, format, *args):
        """Custom log message to show what's happening"""
        message = f"{self.address_string()} - {format % args}"
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {message}")


def find_free_port(start_port=8003):
    """Find a free port starting from the given port"""
    for port in range(start_port, start_port + 10):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('localhost', port))
                return port
        except OSError:
            continue
    return None


def run_server():
    """Run the HTTP server"""
    port = find_free_port(8003)
    
    if port is None:
        print("❌ No free ports found in range 8003-8012")
        return
    
    try:
        server = HTTPServer(('localhost', port), FlightBriefingHandler)
        print(f"🚀 AviFlux Backend Server starting on http://localhost:{port}")
        print(f"📡 Flight briefing endpoint: http://localhost:{port}/api/flight-briefing")
        print(f"🔗 Health check: http://localhost:{port}/health")
        print("Press Ctrl+C to stop the server")
        
        # Keep the server running
        server.serve_forever()
        
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        server.shutdown()
    except Exception as e:
        print(f"❌ Server error: {e}")


if __name__ == "__main__":
    print("=" * 60)
    print("         AviFlux Aviation Weather Platform")
    print("              Minimal Backend Server")
    print("=" * 60)
    run_server()
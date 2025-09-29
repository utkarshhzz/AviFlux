"""
Test script to verify backend server functionality
"""

import requests
import json
import time

def test_backend_connection():
    """Test the backend server connection"""
    base_url = "http://localhost:8003"
    
    print("🧪 Testing AviFlux Backend Server Connection...")
    print("=" * 50)
    
    # Test 1: Health check
    try:
        print("1️⃣ Testing health endpoint...")
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check passed!")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
    
    print()
    
    # Test 2: Flight briefing GET request
    try:
        print("2️⃣ Testing flight briefing (GET)...")
        params = {"origin": "KJFK", "destination": "KLAX"}
        response = requests.get(f"{base_url}/api/flight-briefing", params=params, timeout=5)
        if response.status_code == 200:
            print("✅ Flight briefing GET passed!")
            data = response.json()
            print(f"   Route: {data.get('briefing', {}).get('route', 'N/A')}")
            print(f"   Distance: {data.get('briefing', {}).get('distance', 'N/A')}")
        else:
            print(f"❌ Flight briefing GET failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Flight briefing GET failed: {e}")
    
    print()
    
    # Test 3: Flight briefing POST request
    try:
        print("3️⃣ Testing flight briefing (POST)...")
        data = {"origin": "KORD", "destination": "KSEA"}
        response = requests.post(f"{base_url}/api/flight-briefing", json=data, timeout=5)
        if response.status_code == 200:
            print("✅ Flight briefing POST passed!")
            resp_data = response.json()
            print(f"   Route: {resp_data.get('briefing', {}).get('route', 'N/A')}")
            print(f"   Weather: {resp_data.get('briefing', {}).get('weather_summary', 'N/A')}")
        else:
            print(f"❌ Flight briefing POST failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Flight briefing POST failed: {e}")
    
    print()
    print("🏁 Backend testing complete!")

if __name__ == "__main__":
    test_backend_connection()
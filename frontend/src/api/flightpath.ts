export async function safePostRequest(data: string, detailLevel: string = "detailed") {
    try {
        // Parse ICAO codes from the input string
        const airports = data.split(",").map(code => code.trim().toUpperCase());
        
        // Determine route type
        const route_type = airports.length === 2 ? "single" : "multi";
        
        // Create request payload for weather briefing
        // Calculate distance and flight time
        const calculateDistance = (dep: string, arr: string): number => {
            const routes: { [key: string]: number } = {
                'KJFK-KORD': 740,
                'KJFK-VOBL': 8875,
                'KORD-KJFK': 740,
                'VOBL-KJFK': 8875,
                'KJFK-KLAX': 2475,
                'KLAX-KJFK': 2475
            };
            return routes[`${dep}-${arr}`] || 1000;
        };

        const departure = airports[0];
        const arrival = airports[airports.length - 1];
        const waypoints = airports.slice(1, -1);
        const distance = calculateDistance(departure, arrival);
        const flightTime = distance / 450;

        const requestPayload = {
            departure: departure,
            arrival: arrival,
            waypoints: waypoints,
            distance: Math.round(distance * 10) / 10,
            flightTime: Math.round(flightTime * 10) / 10
        };

        // Call the actual dynamic route backend API
        console.log(`🚀 Calling backend for route: ${departure} → ${arrival}`);
        console.log(`📊 Route data:`, requestPayload);
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/flight-briefing`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestPayload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log(`✅ Backend response:`, result);
        
        // Transform the response to match the expected format
        return {
            plan_id: `WB-${Date.now()}`,
            airports: airports,
            route_type: route_type,
            briefing_data: result, // Pass the full backend response
            success: result.success,
            generated_at: result.generated_at || new Date().toISOString(),
            route_info: {
                departure: result.origin,
                arrival: result.destination,
                distance_nm: parseFloat(result.briefing?.distance?.replace(' NM', '') || '0'),
                flight_time: result.briefing?.estimated_time
            }
        };
    } catch (error) {
        console.error("Weather briefing request failed:", error);
        // Return fallback data for demo purposes
        const airports = data.split(",").map(code => code.trim().toUpperCase());
        return { 
            plan_id: `DEMO-${Date.now()}`,
            airports: airports,
            route_type: airports.length === 2 ? "single" : "multi",
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            demo: true
        };
    }
}

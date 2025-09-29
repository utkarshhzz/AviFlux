// Comprehensive International Airport Database
export interface Airport {
  code: string;
  name: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
  timezone: string;
}

export const AIRPORTS: { [key: string]: Airport } = {
  // United States
  'KJFK': { code: 'KJFK', name: 'John F. Kennedy International Airport', lat: 40.6413, lng: -73.7781, city: 'New York', country: 'USA', timezone: 'America/New_York' },
  'KLAX': { code: 'KLAX', name: 'Los Angeles International Airport', lat: 33.9425, lng: -118.4081, city: 'Los Angeles', country: 'USA', timezone: 'America/Los_Angeles' },
  'KORD': { code: 'KORD', name: 'Chicago O\'Hare International Airport', lat: 41.9742, lng: -87.9073, city: 'Chicago', country: 'USA', timezone: 'America/Chicago' },
  'KDEN': { code: 'KDEN', name: 'Denver International Airport', lat: 39.8561, lng: -104.6737, city: 'Denver', country: 'USA', timezone: 'America/Denver' },
  'KATL': { code: 'KATL', name: 'Hartsfield-Jackson Atlanta International Airport', lat: 33.6407, lng: -84.4277, city: 'Atlanta', country: 'USA', timezone: 'America/New_York' },
  'KDFW': { code: 'KDFW', name: 'Dallas/Fort Worth International Airport', lat: 32.8998, lng: -97.0403, city: 'Dallas', country: 'USA', timezone: 'America/Chicago' },
  'KSEA': { code: 'KSEA', name: 'Seattle-Tacoma International Airport', lat: 47.4502, lng: -122.3088, city: 'Seattle', country: 'USA', timezone: 'America/Los_Angeles' },
  'KMIA': { code: 'KMIA', name: 'Miami International Airport', lat: 25.7959, lng: -80.2870, city: 'Miami', country: 'USA', timezone: 'America/New_York' },
  'KBOS': { code: 'KBOS', name: 'Logan International Airport', lat: 42.3656, lng: -71.0096, city: 'Boston', country: 'USA', timezone: 'America/New_York' },
  'KLAS': { code: 'KLAS', name: 'McCarran International Airport', lat: 36.0840, lng: -115.1537, city: 'Las Vegas', country: 'USA', timezone: 'America/Los_Angeles' },

  // India
  'VOBL': { code: 'VOBL', name: 'Kempegowda International Airport', lat: 13.1979, lng: 77.7063, city: 'Bangalore', country: 'India', timezone: 'Asia/Kolkata' },
  'VIDP': { code: 'VIDP', name: 'Indira Gandhi International Airport', lat: 28.5562, lng: 77.1000, city: 'New Delhi', country: 'India', timezone: 'Asia/Kolkata' },
  'VABB': { code: 'VABB', name: 'Chhatrapati Shivaji Maharaj International Airport', lat: 19.0896, lng: 72.8656, city: 'Mumbai', country: 'India', timezone: 'Asia/Kolkata' },
  'VOMM': { code: 'VOMM', name: 'Chennai International Airport', lat: 12.9941, lng: 80.1709, city: 'Chennai', country: 'India', timezone: 'Asia/Kolkata' },
  'VECC': { code: 'VECC', name: 'Netaji Subhash Chandra Bose International Airport', lat: 22.6546, lng: 88.4467, city: 'Kolkata', country: 'India', timezone: 'Asia/Kolkata' },
  'VOHS': { code: 'VOHS', name: 'Rajiv Gandhi International Airport', lat: 17.2313, lng: 78.4298, city: 'Hyderabad', country: 'India', timezone: 'Asia/Kolkata' },
  'VOCI': { code: 'VOCI', name: 'Cochin International Airport', lat: 10.1520, lng: 76.4019, city: 'Kochi', country: 'India', timezone: 'Asia/Kolkata' },

  // Europe
  'EGLL': { code: 'EGLL', name: 'Heathrow Airport', lat: 51.4700, lng: -0.4543, city: 'London', country: 'United Kingdom', timezone: 'Europe/London' },
  'LFPG': { code: 'LFPG', name: 'Charles de Gaulle Airport', lat: 49.0097, lng: 2.5479, city: 'Paris', country: 'France', timezone: 'Europe/Paris' },
  'EDDF': { code: 'EDDF', name: 'Frankfurt Airport', lat: 49.4264, lng: 8.5706, city: 'Frankfurt', country: 'Germany', timezone: 'Europe/Berlin' },
  'EHAM': { code: 'EHAM', name: 'Amsterdam Airport Schiphol', lat: 52.3086, lng: 4.7639, city: 'Amsterdam', country: 'Netherlands', timezone: 'Europe/Amsterdam' },
  'LEMD': { code: 'LEMD', name: 'Madrid-Barajas Airport', lat: 40.4719, lng: -3.5626, city: 'Madrid', country: 'Spain', timezone: 'Europe/Madrid' },
  'LIRF': { code: 'LIRF', name: 'Leonardo da Vinci International Airport', lat: 41.8003, lng: 12.2389, city: 'Rome', country: 'Italy', timezone: 'Europe/Rome' },
  'EDDM': { code: 'EDDM', name: 'Munich Airport', lat: 48.3538, lng: 11.7861, city: 'Munich', country: 'Germany', timezone: 'Europe/Berlin' },

  // Asia-Pacific
  'RJTT': { code: 'RJTT', name: 'Haneda Airport', lat: 35.5494, lng: 139.7798, city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo' },
  'RJAA': { code: 'RJAA', name: 'Narita International Airport', lat: 35.7647, lng: 140.3864, city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo' },
  'VHHH': { code: 'VHHH', name: 'Hong Kong International Airport', lat: 22.3080, lng: 113.9185, city: 'Hong Kong', country: 'Hong Kong', timezone: 'Asia/Hong_Kong' },
  'WSSS': { code: 'WSSS', name: 'Singapore Changi Airport', lat: 1.3644, lng: 103.9915, city: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore' },
  'ZBAA': { code: 'ZBAA', name: 'Beijing Capital International Airport', lat: 40.0799, lng: 116.6031, city: 'Beijing', country: 'China', timezone: 'Asia/Shanghai' },
  'ZSPD': { code: 'ZSPD', name: 'Shanghai Pudong International Airport', lat: 31.1434, lng: 121.8052, city: 'Shanghai', country: 'China', timezone: 'Asia/Shanghai' },
  'RKSI': { code: 'RKSI', name: 'Incheon International Airport', lat: 37.4691, lng: 126.4505, city: 'Seoul', country: 'South Korea', timezone: 'Asia/Seoul' },
  'YSSY': { code: 'YSSY', name: 'Sydney Kingsford Smith Airport', lat: -33.9399, lng: 151.1753, city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney' },

  // Middle East & Africa
  'OMDB': { code: 'OMDB', name: 'Dubai International Airport', lat: 25.2532, lng: 55.3657, city: 'Dubai', country: 'UAE', timezone: 'Asia/Dubai' },
  'OTHH': { code: 'OTHH', name: 'Hamad International Airport', lat: 25.2731, lng: 51.6080, city: 'Doha', country: 'Qatar', timezone: 'Asia/Qatar' },
  'OERK': { code: 'OERK', name: 'King Khalid International Airport', lat: 24.9576, lng: 46.6988, city: 'Riyadh', country: 'Saudi Arabia', timezone: 'Asia/Riyadh' },
  'LTFM': { code: 'LTFM', name: 'Istanbul Airport', lat: 41.2619, lng: 28.7279, city: 'Istanbul', country: 'Turkey', timezone: 'Europe/Istanbul' },
  'FACT': { code: 'FACT', name: 'Cape Town International Airport', lat: -33.9648, lng: 18.6017, city: 'Cape Town', country: 'South Africa', timezone: 'Africa/Johannesburg' },

  // Canada
  'CYYZ': { code: 'CYYZ', name: 'Toronto Pearson International Airport', lat: 43.6777, lng: -79.6248, city: 'Toronto', country: 'Canada', timezone: 'America/Toronto' },
  'CYVR': { code: 'CYVR', name: 'Vancouver International Airport', lat: 49.1939, lng: -123.1844, city: 'Vancouver', country: 'Canada', timezone: 'America/Vancouver' },
  'CYUL': { code: 'CYUL', name: 'Montréal-Pierre Elliott Trudeau International Airport', lat: 45.4576, lng: -73.7497, city: 'Montreal', country: 'Canada', timezone: 'America/Toronto' },

  // South America
  'SBGR': { code: 'SBGR', name: 'São Paulo-Guarulhos International Airport', lat: -23.4356, lng: -46.4731, city: 'São Paulo', country: 'Brazil', timezone: 'America/Sao_Paulo' },
  'SAEZ': { code: 'SAEZ', name: 'Ezeiza International Airport', lat: -34.8222, lng: -58.5358, city: 'Buenos Aires', country: 'Argentina', timezone: 'America/Argentina/Buenos_Aires' },
  'SPJC': { code: 'SPJC', name: 'Jorge Chávez International Airport', lat: -12.0219, lng: -77.1143, city: 'Lima', country: 'Peru', timezone: 'America/Lima' }
};

export const findAirport = (code: string): Airport | null => {
  const upperCode = code.toUpperCase().trim();
  return AIRPORTS[upperCode] || null;
};

export const searchAirports = (query: string): Airport[] => {
  const lowerQuery = query.toLowerCase();
  return Object.values(AIRPORTS).filter(airport => 
    airport.code.toLowerCase().includes(lowerQuery) ||
    airport.name.toLowerCase().includes(lowerQuery) ||
    airport.city.toLowerCase().includes(lowerQuery) ||
    airport.country.toLowerCase().includes(lowerQuery)
  );
};

export const getAllAirports = (): Airport[] => {
  return Object.values(AIRPORTS);
};
// Google Places API integration
// Cost-conscious implementation with caching

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_DISTANCE_MATRIX_API_KEY = process.env.GOOGLE_DISTANCE_MATRIX_API_KEY;

if (!GOOGLE_PLACES_API_KEY || !GOOGLE_DISTANCE_MATRIX_API_KEY) {
  console.warn('⚠️  Google API keys not configured. POI fetching will not work.');
}

interface PlaceResult {
  place_id: string;
  name: string;
  vicinity?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  types: string[];
}

interface NearbySearchResponse {
  results: PlaceResult[];
  status: string;
  error_message?: string;
}

interface DistanceMatrixResponse {
  rows: Array<{
    elements: Array<{
      distance: { value: number; text: string };
      duration: { value: number; text: string };
      status: string;
    }>;
  }>;
  status: string;
  error_message?: string;
}

/**
 * Search for nearby places using Google Places API
 * @param latitude - Property latitude
 * @param longitude - Property longitude
 * @param types - Google Places types to search for
 * @param radius - Search radius in meters
 * @returns Array of places
 */
export async function searchNearbyPlaces(
  latitude: number,
  longitude: number,
  types: string[],
  radius: number = 1000
): Promise<PlaceResult[]> {
  if (!GOOGLE_PLACES_API_KEY) {
    throw new Error('Google Places API key not configured');
  }

  const typeQuery = types.join('|');
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${typeQuery}&key=${GOOGLE_PLACES_API_KEY}&language=bg`;

  try {
    const response = await fetch(url);
    const data: NearbySearchResponse = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data.status, data.error_message);
      throw new Error(`Google Places API error: ${data.status}`);
    }

    return data.results || [];
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    throw error;
  }
}

/**
 * Calculate straight-line distance between two points (Haversine formula)
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Get travel times using Google Distance Matrix API
 * Batches requests to minimize API calls
 * @param origin - Origin coordinates
 * @param destinations - Array of destination coordinates
 * @returns Array of travel times
 */
export async function getDistanceMatrix(
  origin: { lat: number; lng: number },
  destinations: Array<{ lat: number; lng: number }>
): Promise<
  Array<{
    distanceMeters: number;
    walkingMinutes: number | null;
    drivingMinutes: number | null;
  }>
> {
  if (!GOOGLE_DISTANCE_MATRIX_API_KEY) {
    throw new Error('Google Distance Matrix API key not configured');
  }

  // Batch up to 25 destinations per request (API limit)
  const batchSize = 25;
  const results: Array<{
    distanceMeters: number;
    walkingMinutes: number | null;
    drivingMinutes: number | null;
  }> = [];

  for (let i = 0; i < destinations.length; i += batchSize) {
    const batch = destinations.slice(i, i + batchSize);
    const destinationsParam = batch.map((d) => `${d.lat},${d.lng}`).join('|');
    const originParam = `${origin.lat},${origin.lng}`;

    // Get walking times
    const walkingUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originParam}&destinations=${destinationsParam}&mode=walking&key=${GOOGLE_DISTANCE_MATRIX_API_KEY}&language=bg`;

    // Get driving times
    const drivingUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originParam}&destinations=${destinationsParam}&mode=driving&key=${GOOGLE_DISTANCE_MATRIX_API_KEY}&language=bg`;

    try {
      const [walkingResponse, drivingResponse] = await Promise.all([
        fetch(walkingUrl),
        fetch(drivingUrl),
      ]);

      const walkingData: DistanceMatrixResponse = await walkingResponse.json();
      const drivingData: DistanceMatrixResponse = await drivingResponse.json();

      if (walkingData.status !== 'OK' || drivingData.status !== 'OK') {
        console.error('Distance Matrix API error:', {
          walking: walkingData.status,
          driving: drivingData.status,
        });
        // Fall back to straight-line distance
        batch.forEach((dest) => {
          const distance = calculateDistance(origin.lat, origin.lng, dest.lat, dest.lng);
          results.push({
            distanceMeters: distance,
            walkingMinutes: null,
            drivingMinutes: null,
          });
        });
        continue;
      }

      // Process results
      const walkingElements = walkingData.rows[0]?.elements || [];
      const drivingElements = drivingData.rows[0]?.elements || [];

      batch.forEach((_, index) => {
        const walkingElement = walkingElements[index];
        const drivingElement = drivingElements[index];

        results.push({
          distanceMeters:
            walkingElement?.distance?.value ||
            calculateDistance(origin.lat, origin.lng, batch[index].lat, batch[index].lng),
          walkingMinutes:
            walkingElement?.duration?.value ? Math.round(walkingElement.duration.value / 60) : null,
          drivingMinutes:
            drivingElement?.duration?.value ? Math.round(drivingElement.duration.value / 60) : null,
        });
      });
    } catch (error) {
      console.error('Error fetching distance matrix:', error);
      // Fall back to straight-line distance
      batch.forEach((dest) => {
        const distance = calculateDistance(origin.lat, origin.lng, dest.lat, dest.lng);
        results.push({
          distanceMeters: distance,
          walkingMinutes: null,
          drivingMinutes: null,
        });
      });
    }
  }

  return results;
}

/**
 * Check if API keys are configured
 */
export function hasApiKeys(): boolean {
  return !!(GOOGLE_PLACES_API_KEY && GOOGLE_DISTANCE_MATRIX_API_KEY);
}

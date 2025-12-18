// POI Service - Fetches and caches POI data for properties
import { prisma } from '@/lib/prisma';
import { searchNearbyPlaces, getDistanceMatrix, calculateDistance } from '@/lib/google-api';
import { POI_CATEGORIES, type POICategoryKey } from '@/lib/poi-categories';

interface FetchPOIsResult {
  success: boolean;
  poisFetched: number;
  error?: string;
}

/**
 * Fetch POIs for a property from Google Places API and cache in database
 * @param propertyId - Property ID
 * @returns Result with number of POIs fetched
 */
export async function fetchPOIsForProperty(propertyId: string): Promise<FetchPOIsResult> {
  try {
    // Get property
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return { success: false, poisFetched: 0, error: 'Property not found' };
    }

    // Get all POI categories
    const categories = await prisma.pOICategory.findMany();

    let totalPOIsFetched = 0;

    // Fetch POIs for each category
    for (const category of categories) {
      try {
        // Search for nearby places
        const places = await searchNearbyPlaces(
          Number(property.latitude),
          Number(property.longitude),
          category.googleTypes,
          category.searchRadius
        );

        // Take only top 3 closest POIs per category (cost management)
        const topPlaces = places.slice(0, 3);

        if (topPlaces.length === 0) {
          continue;
        }

        // Calculate distances and get travel times
        const origins = { lat: Number(property.latitude), lng: Number(property.longitude) };
        const destinations = topPlaces.map((p) => ({
          lat: p.geometry.location.lat,
          lng: p.geometry.location.lng,
        }));

        const distanceData = await getDistanceMatrix(origins, destinations);

        // Save POIs to database
        for (let i = 0; i < topPlaces.length; i++) {
          const place = topPlaces[i];
          const distances = distanceData[i];

          // Check if POI already exists (by googlePlaceId)
          const existing = await prisma.propertyPOI.findFirst({
            where: {
              propertyId: property.id,
              googlePlaceId: place.place_id,
            },
          });

          if (existing) {
            // Update existing POI
            await prisma.propertyPOI.update({
              where: { id: existing.id },
              data: {
                name: place.name,
                address: place.vicinity,
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
                distanceMeters: distances.distanceMeters,
                walkingMinutes: distances.walkingMinutes,
                drivingMinutes: distances.drivingMinutes,
                rating: place.rating,
                fetchedAt: new Date(),
              },
            });
          } else {
            // Create new POI
            await prisma.propertyPOI.create({
              data: {
                propertyId: property.id,
                categoryId: category.id,
                name: place.name,
                address: place.vicinity,
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
                distanceMeters: distances.distanceMeters,
                walkingMinutes: distances.walkingMinutes,
                drivingMinutes: distances.drivingMinutes,
                googlePlaceId: place.place_id,
                rating: place.rating,
              },
            });
          }

          totalPOIsFetched++;
        }
      } catch (error) {
        console.error(`Error fetching POIs for category ${category.name}:`, error);
        // Continue with next category
      }
    }

    return { success: true, poisFetched: totalPOIsFetched };
  } catch (error) {
    console.error('Error in fetchPOIsForProperty:', error);
    return {
      success: false,
      poisFetched: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if POI data for a property is stale (older than 30 days)
 * @param propertyId - Property ID
 * @returns True if data is stale or missing
 */
export async function isPOIDataStale(propertyId: string): Promise<boolean> {
  const pois = await prisma.propertyPOI.findMany({
    where: { propertyId },
    orderBy: { fetchedAt: 'desc' },
    take: 1,
  });

  if (pois.length === 0) {
    return true; // No POIs fetched yet
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return pois[0].fetchedAt < thirtyDaysAgo;
}

/**
 * Batch fetch POIs for multiple properties
 * @param propertyIds - Array of property IDs
 * @returns Summary of results
 */
export async function batchFetchPOIs(
  propertyIds: string[]
): Promise<{
  total: number;
  successful: number;
  failed: number;
  poisFetched: number;
}> {
  let successful = 0;
  let failed = 0;
  let poisFetched = 0;

  for (const propertyId of propertyIds) {
    // Add delay between requests to respect rate limits (2 seconds)
    if (successful + failed > 0) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    const result = await fetchPOIsForProperty(propertyId);

    if (result.success) {
      successful++;
      poisFetched += result.poisFetched;
      console.log(`✓ Fetched ${result.poisFetched} POIs for property ${propertyId}`);
    } else {
      failed++;
      console.error(`✗ Failed to fetch POIs for property ${propertyId}:`, result.error);
    }
  }

  return {
    total: propertyIds.length,
    successful,
    failed,
    poisFetched,
  };
}

/**
 * Refresh stale POI data for all properties
 */
export async function refreshStalePOIs(): Promise<{
  checked: number;
  refreshed: number;
  poisFetched: number;
}> {
  const properties = await prisma.property.findMany({
    where: { isActive: true },
    select: { id: true },
  });

  const staleProperties: string[] = [];

  // Check which properties have stale data
  for (const property of properties) {
    const isStale = await isPOIDataStale(property.id);
    if (isStale) {
      staleProperties.push(property.id);
    }
  }

  if (staleProperties.length === 0) {
    return { checked: properties.length, refreshed: 0, poisFetched: 0 };
  }

  console.log(`Found ${staleProperties.length} properties with stale POI data`);

  const result = await batchFetchPOIs(staleProperties);

  return {
    checked: properties.length,
    refreshed: result.successful,
    poisFetched: result.poisFetched,
  };
}

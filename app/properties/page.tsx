import Link from 'next/link';
import { PropertyType } from '@prisma/client';
import type { PropertyWithRelations, UserPreference, CategoryWeights } from '@/types';
import { calculatePropertyScore } from '@/services/scoring';
import PropertyFilters from '@/components/PropertyFilters';

async function getProperties() {
  const res = await fetch(`http://localhost:3000/api/properties`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch properties');
  }

  return res.json();
}

async function getUserPreferences(preferenceId: string): Promise<UserPreference | null> {
  try {
    const res = await fetch(`http://localhost:3000/api/preferences?id=${preferenceId}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Failed to fetch user preferences:', error);
    return null;
  }
}

interface PropertyWithScore extends PropertyWithRelations {
  score?: number;
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ preferenceId?: string; pois?: string }>;
}) {
  const params = await searchParams;
  const preferenceId = params.preferenceId;
  const poiFilters = params.pois?.split(',').filter(Boolean) || [];

  const data = await getProperties();
  let properties: PropertyWithScore[] = data.properties;

  // Apply POI filters if any
  if (poiFilters.length > 0) {
    properties = properties.filter((property) => {
      // Check if property has POIs for all selected categories
      const propertyCategories = new Set(
        property.pois.map((poi) => poi.category.name)
      );
      return poiFilters.every((filter) => propertyCategories.has(filter));
    });
  }

  // Fetch user preferences if preferenceId is provided
  let userPreferences: UserPreference | null = null;
  if (preferenceId) {
    userPreferences = await getUserPreferences(preferenceId);
  }

  // Calculate scores and sort if preferences are available
  if (userPreferences) {
    const categoryWeights = userPreferences.categoryWeights as CategoryWeights;

    // Calculate score for each property
    properties = properties.map((property) => ({
      ...property,
      score: calculatePropertyScore(
        property.pois.map((poi) => ({
          categoryId: poi.category.name,
          distanceMeters: poi.distanceMeters,
          walkingMinutes: poi.walkingMinutes,
        })),
        categoryWeights
      ),
    }));

    // Sort by score descending
    properties.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Имоти</h1>
            <p className="mt-2 text-gray-600">
              Намерени {properties.length} {poiFilters.length > 0 ? `от ${data.total}` : ''} имота
              {userPreferences && ' • Сортирани по вашите предпочитания'}
            </p>
          </div>
          <div className="flex gap-2">
            {!userPreferences && (
              <Link
                href="/preferences"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                ⚙️ Персонализирай
              </Link>
            )}
            <Link
              href="/properties/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + Добави имот
            </Link>
          </div>
        </div>

        {/* Personalization Banner */}
        {userPreferences && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="text-blue-900 font-medium">
                Резултатите са персонализирани според вашите предпочитания
              </p>
              <p className="text-blue-700 text-sm mt-1">
                Имотите са сортирани по съответствие с вашите приоритети
              </p>
            </div>
            <Link
              href="/preferences"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap"
            >
              Промени предпочитания →
            </Link>
          </div>
        )}

        {/* POI Filters */}
        <PropertyFilters />

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Link
              key={property.id}
              href={`/properties/${property.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              {/* Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white relative">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {property.propertyType === PropertyType.APARTMENT && '🏢'}
                    {property.propertyType === PropertyType.HOUSE && '🏠'}
                    {property.propertyType === PropertyType.STUDIO && '🏙️'}
                    {property.propertyType === PropertyType.MAISONETTE && '🏘️'}
                    {property.propertyType === PropertyType.PENTHOUSE && '🌆'}
                  </p>
                </div>
                {/* Score Badge */}
                {property.score !== undefined && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1.5 rounded-full font-bold shadow-lg">
                    {property.score}% съвпадение
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                  {property.title}
                </h3>

                <div className="space-y-2 text-sm text-gray-600 mb-3">
                  <p className="flex items-center">
                    <span className="mr-2">📍</span>
                    {property.neighborhood}, {property.city}
                  </p>
                  <p className="flex items-center">
                    <span className="mr-2">📐</span>
                    {Number(property.area)} m²
                    {property.rooms && ` • ${property.rooms} стаи`}
                  </p>
                  {property.pois.length > 0 && (
                    <p className="flex items-center text-green-600">
                      <span className="mr-2">✓</span>
                      {property.pois.length} наблизо
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {Number(property.price).toLocaleString('bg-BG')} {property.currency}
                    </p>
                    {property.pricePerSqm && (
                      <p className="text-sm text-gray-500">
                        {Number(property.pricePerSqm).toLocaleString('bg-BG')} {property.currency}/m²
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {properties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Няма намерени имоти</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { PropertyWithRelations } from '@/types';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

async function getProperty(id: string) {
  const res = await fetch(`http://localhost:3000/api/properties/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    throw new Error('Failed to fetch property');
  }

  return res.json();
}

export default async function PropertyDetailPage(props: Params) {
  const params = await props.params;
  const property: PropertyWithRelations = await getProperty(params.id);

  // Group POIs by category
  const poisByCategory = property.pois.reduce((acc, poi) => {
    const categoryName = poi.category.name;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(poi);
    return acc;
  }, {} as Record<string, typeof property.pois>);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          href="/properties"
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Назад към списъка
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Image placeholder */}
          <div className="h-96 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
            <div className="text-center">
              <p className="text-6xl mb-4">🏠</p>
              <p className="text-xl">Изображение на имота</p>
            </div>
          </div>

          <div className="p-8">
            {/* Title and price */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {property.title}
                </h1>
                <p className="text-gray-600 flex items-center">
                  <span className="mr-2">📍</span>
                  {property.address}, {property.neighborhood}, {property.city}
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-blue-600">
                  {Number(property.price).toLocaleString('bg-BG')} {property.currency}
                </p>
                {property.pricePerSqm && (
                  <p className="text-gray-500 mt-1">
                    {Number(property.pricePerSqm).toLocaleString('bg-BG')} {property.currency}/m²
                  </p>
                )}
              </div>
            </div>

            {/* Property details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Площ</p>
                <p className="text-lg font-semibold">{Number(property.area)} m²</p>
              </div>
              {property.rooms && (
                <div>
                  <p className="text-sm text-gray-500">Стаи</p>
                  <p className="text-lg font-semibold">{property.rooms}</p>
                </div>
              )}
              {property.floor && (
                <div>
                  <p className="text-sm text-gray-500">Етаж</p>
                  <p className="text-lg font-semibold">
                    {property.floor}
                    {property.totalFloors && ` / ${property.totalFloors}`}
                  </p>
                </div>
              )}
              {property.yearBuilt && (
                <div>
                  <p className="text-sm text-gray-500">Година</p>
                  <p className="text-lg font-semibold">{property.yearBuilt}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {property.description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Описание</h2>
                <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
              </div>
            )}

            {/* POIs */}
            {property.pois.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Наблизо ({property.pois.length})
                </h2>
                <div className="space-y-4">
                  {Object.entries(poisByCategory).map(([categoryName, pois]) => (
                    <div key={categoryName} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {pois[0].category.nameBg}
                      </h3>
                      <div className="space-y-2">
                        {pois.slice(0, 3).map((poi) => (
                          <div
                            key={poi.id}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-gray-700">{poi.name}</span>
                            <div className="flex items-center gap-3 text-gray-500">
                              <span>{poi.distanceMeters}m</span>
                              {poi.walkingMinutes && (
                                <span>🚶 {poi.walkingMinutes} мин</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { PropertyType } from '@prisma/client';
import type { PropertyWithRelations } from '@/types';

async function getProperties() {
  const res = await fetch(`http://localhost:3000/api/properties`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch properties');
  }

  return res.json();
}

export default async function PropertiesPage() {
  const data = await getProperties();
  const properties: PropertyWithRelations[] = data.properties;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Имоти</h1>
            <p className="mt-2 text-gray-600">
              Намерени {data.total} имота
            </p>
          </div>
          <Link
            href="/properties/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Добави имот
          </Link>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Link
              key={property.id}
              href={`/properties/${property.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              {/* Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {property.propertyType === PropertyType.APARTMENT && '🏢'}
                    {property.propertyType === PropertyType.HOUSE && '🏠'}
                    {property.propertyType === PropertyType.STUDIO && '🏙️'}
                    {property.propertyType === PropertyType.MAISONETTE && '🏘️'}
                    {property.propertyType === PropertyType.PENTHOUSE && '🌆'}
                  </p>
                </div>
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

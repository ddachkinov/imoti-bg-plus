'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { POI_CATEGORIES, type POICategoryKey } from '@/lib/poi-categories';

export default function PropertyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Get current filter from URL
  const currentFilters = searchParams.get('pois')?.split(',') || [];

  const toggleFilter = (categoryKey: string) => {
    const params = new URLSearchParams(searchParams);
    let filters = currentFilters.filter(Boolean);

    if (filters.includes(categoryKey)) {
      // Remove filter
      filters = filters.filter((f) => f !== categoryKey);
    } else {
      // Add filter
      filters.push(categoryKey);
    }

    if (filters.length > 0) {
      params.set('pois', filters.join(','));
    } else {
      params.delete('pois');
    }

    router.push(`/properties?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('pois');
    router.push(`/properties?${params.toString()}`);
  };

  const categoryGroups = {
    'Основни': ['grocery', 'pharmacy', 'hospital'] as POICategoryKey[],
    'Транспорт': ['busStop', 'metro'] as POICategoryKey[],
    'Семейство': ['kindergarten', 'school'] as POICategoryKey[],
    'Начин на живот': ['park', 'gym', 'restaurant'] as POICategoryKey[],
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
      >
        <span>🔍 Филтри по наблизо</span>
        {currentFilters.length > 0 && (
          <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
            {currentFilters.length}
          </span>
        )}
        <span className="ml-2">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="mt-3 bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Филтрирай по удобства</h3>
            {currentFilters.length > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Изчисти всички
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(categoryGroups).map(([groupName, categories]) => (
              <div key={groupName}>
                <h4 className="text-sm font-medium text-gray-700 mb-2">{groupName}</h4>
                <div className="space-y-2">
                  {categories.map((categoryKey) => {
                    const category = POI_CATEGORIES[categoryKey];
                    const isChecked = currentFilters.includes(categoryKey);

                    return (
                      <label
                        key={categoryKey}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFilter(categoryKey)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{category.nameBg}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-gray-500">
            * Показват се само имоти с избраните удобства наблизо
          </p>
        </div>
      )}
    </div>
  );
}

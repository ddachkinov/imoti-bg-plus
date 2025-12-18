'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FetchPOIsButtonProps {
  propertyId: string;
  hasExistingPOIs: boolean;
}

export default function FetchPOIsButton({ propertyId, hasExistingPOIs }: FetchPOIsButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFetch = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/properties/${propertyId}/fetch-pois`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch POIs');
      }

      // Refresh the page to show new POIs
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch POIs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleFetch}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-300 transition flex items-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin">⟳</span>
            {hasExistingPOIs ? 'Обновяване...' : 'Търсене...'}
          </>
        ) : (
          <>
            <span>📍</span>
            {hasExistingPOIs ? 'Обнови POI данни' : 'Намери наблизо'}
          </>
        )}
      </button>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </p>
      )}

      {!hasExistingPOIs && (
        <p className="text-xs text-gray-500">
          Натиснете за да намерите магазини, училища, транспорт и други наблизо
        </p>
      )}
    </div>
  );
}

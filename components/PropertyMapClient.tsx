'use client';

import dynamic from 'next/dynamic';

const PropertyMap = dynamic(() => import('./PropertyMap'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />,
});

interface POI {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  category: {
    name: string;
    nameBg: string;
    icon?: string;
  };
}

interface PropertyMapClientProps {
  latitude: number;
  longitude: number;
  pois?: POI[];
  height?: string;
}

export default function PropertyMapClient(props: PropertyMapClientProps) {
  return <PropertyMap {...props} />;
}

'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

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

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  pois?: POI[];
  height?: string;
}

export default function PropertyMap({
  latitude,
  longitude,
  pois = [],
  height = '400px',
}: PropertyMapProps) {
  const [mounted, setMounted] = useState(false);

  // Only render on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{ height }}
        className="bg-gray-100 rounded-lg flex items-center justify-center"
      >
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  const position: [number, number] = [latitude, longitude];

  // Group POIs by category
  const poiColors: Record<string, string> = {
    grocery: '#10b981', // green
    pharmacy: '#ef4444', // red
    hospital: '#dc2626', // dark red
    kindergarten: '#fbbf24', // yellow
    school: '#f59e0b', // orange
    busStop: '#3b82f6', // blue
    metro: '#6366f1', // indigo
    park: '#22c55e', // green
    gym: '#8b5cf6', // purple
    restaurant: '#ec4899', // pink
  };

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border border-gray-300">
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Property marker */}
        <Marker position={position}>
          <Popup>
            <strong>Имотът</strong>
          </Popup>
        </Marker>

        {/* 1km radius circle */}
        <Circle
          center={position}
          radius={1000}
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.1,
          }}
        />

        {/* POI markers */}
        {pois.map((poi) => {
          const poiPosition: [number, number] = [
            Number(poi.latitude),
            Number(poi.longitude),
          ];

          const color = poiColors[poi.category.name] || '#6b7280';

          const poiIcon = L.divIcon({
            className: 'custom-poi-icon',
            html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          return (
            <Marker key={poi.id} position={poiPosition} icon={poiIcon}>
              <Popup>
                <div>
                  <strong>{poi.name}</strong>
                  <p className="text-sm text-gray-600 mt-1">
                    {poi.category.nameBg}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {poi.distanceMeters}m разстояние
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

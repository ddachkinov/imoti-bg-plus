// POI Categories for ImotiBG+
// Defines all Points of Interest categories with their Bulgarian names and Google API types

export const POI_CATEGORIES = {
  // Essential (high default priority)
  grocery: {
    name: 'Grocery Store',
    nameBg: 'Хранителен магазин',
    googleTypes: ['supermarket', 'grocery_or_supermarket'],
    icon: 'shopping-cart',
    defaultWeight: 8,
    searchRadius: 1000, // meters
  },
  pharmacy: {
    name: 'Pharmacy',
    nameBg: 'Аптека',
    googleTypes: ['pharmacy'],
    icon: 'pill',
    defaultWeight: 7,
    searchRadius: 1500,
  },
  hospital: {
    name: 'Hospital/Clinic',
    nameBg: 'Болница/Клиника',
    googleTypes: ['hospital', 'doctor'],
    icon: 'hospital',
    defaultWeight: 6,
    searchRadius: 3000,
  },

  // Family (variable priority)
  kindergarten: {
    name: 'Kindergarten',
    nameBg: 'Детска градина',
    googleTypes: ['school'], // Filter by name
    icon: 'baby',
    defaultWeight: 5,
    searchRadius: 2000,
  },
  school: {
    name: 'School',
    nameBg: 'Училище',
    googleTypes: ['school', 'primary_school', 'secondary_school'],
    icon: 'graduation-cap',
    defaultWeight: 5,
    searchRadius: 2000,
  },

  // Transport
  busStop: {
    name: 'Bus Stop',
    nameBg: 'Автобусна спирка',
    googleTypes: ['bus_station', 'transit_station'],
    icon: 'bus',
    defaultWeight: 6,
    searchRadius: 500,
  },
  metro: {
    name: 'Metro Station',
    nameBg: 'Метростанция',
    googleTypes: ['subway_station'],
    icon: 'train',
    defaultWeight: 7,
    searchRadius: 1500,
  },

  // Lifestyle
  park: {
    name: 'Park',
    nameBg: 'Парк',
    googleTypes: ['park'],
    icon: 'tree',
    defaultWeight: 4,
    searchRadius: 1000,
  },
  gym: {
    name: 'Gym',
    nameBg: 'Фитнес',
    googleTypes: ['gym'],
    icon: 'dumbbell',
    defaultWeight: 3,
    searchRadius: 1500,
  },
  restaurant: {
    name: 'Restaurant',
    nameBg: 'Ресторант',
    googleTypes: ['restaurant'],
    icon: 'utensils',
    defaultWeight: 2,
    searchRadius: 1000,
  },
} as const;

export type POICategoryKey = keyof typeof POI_CATEGORIES;

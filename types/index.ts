// Type definitions for ImotiBG+

import { Property, PropertyType, PropertyImage, PropertyPOI, POICategory, UserPreference } from '@prisma/client';

// Re-export Prisma types
export type {
  Property,
  PropertyType,
  PropertyImage,
  PropertyPOI,
  POICategory,
  UserPreference,
};

// Extended types with relations
export type PropertyWithRelations = Property & {
  images: PropertyImage[];
  pois: (PropertyPOI & {
    category: POICategory;
  })[];
};

export type POICategoryWithPOIs = POICategory & {
  pois: PropertyPOI[];
};

// Category weights type (stored as JSON in UserPreference.categoryWeights)
export type CategoryWeights = Record<string, number>;

// API request/response types
export interface PropertySearchParams {
  city?: string;
  propertyType?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  rooms?: number;
  page?: number;
  limit?: number;
}

export interface PropertySearchResult {
  properties: PropertyWithRelations[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PropertyScore {
  propertyId: string;
  score: number;
  matchingCategories: string[];
}

// POI Category configuration (matches lib/poi-categories.ts)
export interface POICategoryConfig {
  name: string;
  nameBg: string;
  googleTypes: string[];
  icon: string;
  defaultWeight: number;
  searchRadius: number;
}

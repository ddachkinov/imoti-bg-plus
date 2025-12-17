// Property Scoring Algorithm for ImotiBG+
// Calculates personalized property scores based on user priorities and POI proximity

import { POI_CATEGORIES, type POICategoryKey } from '@/lib/poi-categories';
import type { CategoryWeights } from '@/types';

interface PropertyPOIData {
  categoryId: string;
  distanceMeters: number;
  walkingMinutes?: number | null;
}

/**
 * Get default weights from POI_CATEGORIES config
 */
export function getDefaultWeights(): CategoryWeights {
  const weights: CategoryWeights = {};
  for (const [key, config] of Object.entries(POI_CATEGORIES)) {
    weights[key] = config.defaultWeight;
  }
  return weights;
}

/**
 * Get max distances (search radius) from POI_CATEGORIES config
 */
export function getMaxDistances(): Record<string, number> {
  const distances: Record<string, number> = {};
  for (const [key, config] of Object.entries(POI_CATEGORIES)) {
    distances[key] = config.searchRadius;
  }
  return distances;
}

/**
 * Calculate a property score based on user priorities
 *
 * Score formula:
 * For each POI category:
 *   categoryScore = weight × (1 - distance/maxDistance)
 *
 * totalScore = sum(categoryScores) / sum(weights) × 100
 *
 * @param pois - Array of POI data for the property
 * @param weights - User's category weights (from UserPreference.categoryWeights)
 * @param maxDistances - Maximum relevant distances per category (defaults to POI_CATEGORIES.searchRadius)
 * @returns Score from 0-100, where 100 = perfect match
 */
export function calculatePropertyScore(
  pois: PropertyPOIData[],
  weights?: CategoryWeights,
  maxDistances?: Record<string, number>
): number {
  const effectiveWeights = weights ?? getDefaultWeights();
  const effectiveMaxDistances = maxDistances ?? getMaxDistances();

  let weightedSum = 0;
  let totalWeight = 0;

  // Group POIs by category, take the closest one
  const closestByCategory = new Map<string, PropertyPOIData>();

  for (const poi of pois) {
    const existing = closestByCategory.get(poi.categoryId);
    if (!existing || poi.distanceMeters < existing.distanceMeters) {
      closestByCategory.set(poi.categoryId, poi);
    }
  }

  for (const [categoryId, poi] of closestByCategory) {
    const weight = effectiveWeights[categoryId] ?? 5;
    if (weight === 0) continue;

    const maxDistance = effectiveMaxDistances[categoryId] ?? 2000;
    const normalizedDistance = Math.min(poi.distanceMeters / maxDistance, 1);
    const categoryScore = 1 - normalizedDistance;

    weightedSum += weight * categoryScore;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 50; // Neutral score

  return Math.round((weightedSum / totalWeight) * 100);
}

/**
 * Calculate scores for multiple properties
 */
export function calculatePropertyScores(
  propertiesWithPOIs: Array<{ id: string; pois: PropertyPOIData[] }>,
  weights?: CategoryWeights
): Array<{ propertyId: string; score: number }> {
  return propertiesWithPOIs.map((property) => ({
    propertyId: property.id,
    score: calculatePropertyScore(property.pois, weights),
  }));
}

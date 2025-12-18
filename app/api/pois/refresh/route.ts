// API endpoint to refresh stale POI data
import { NextRequest, NextResponse } from 'next/server';
import { refreshStalePOIs } from '@/services/poi-service';
import { hasApiKeys } from '@/lib/google-api';

// POST /api/pois/refresh - Refresh stale POI data
export async function POST() {
  try {
    // Check if API keys are configured
    if (!hasApiKeys()) {
      return NextResponse.json(
        {
          error: 'Google API keys not configured. Please add GOOGLE_PLACES_API_KEY and GOOGLE_DISTANCE_MATRIX_API_KEY to .env file.'
        },
        { status: 503 }
      );
    }

    console.log('Starting POI refresh process...');
    const result = await refreshStalePOIs();

    return NextResponse.json({
      success: true,
      ...result,
      message: `Checked ${result.checked} properties, refreshed ${result.refreshed} with stale data, fetched ${result.poisFetched} POIs`,
    });
  } catch (error) {
    console.error('POST /api/pois/refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh POIs' },
      { status: 500 }
    );
  }
}

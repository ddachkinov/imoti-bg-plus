// API endpoint to fetch POIs for a specific property
import { NextRequest, NextResponse } from 'next/server';
import { fetchPOIsForProperty } from '@/services/poi-service';
import { hasApiKeys } from '@/lib/google-api';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// POST /api/properties/[id]/fetch-pois - Fetch POIs for property
export async function POST(request: NextRequest, props: Params) {
  const params = await props.params;
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

    const result = await fetchPOIsForProperty(params.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch POIs' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      poisFetched: result.poisFetched,
      message: `Successfully fetched ${result.poisFetched} POIs`,
    });
  } catch (error) {
    console.error(`POST /api/properties/${params.id}/fetch-pois error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch POIs' },
      { status: 500 }
    );
  }
}

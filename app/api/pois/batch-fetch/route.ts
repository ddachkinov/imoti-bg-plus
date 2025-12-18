// API endpoint for batch POI fetching
import { NextRequest, NextResponse } from 'next/server';
import { batchFetchPOIs } from '@/services/poi-service';
import { hasApiKeys } from '@/lib/google-api';
import { prisma } from '@/lib/prisma';

// POST /api/pois/batch-fetch - Batch fetch POIs for properties
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { propertyIds, fetchAll } = body;

    let ids: string[] = [];

    if (fetchAll) {
      // Fetch all active properties without POIs or with stale POIs
      const properties = await prisma.property.findMany({
        where: { isActive: true },
        select: { id: true },
      });
      ids = properties.map((p) => p.id);
    } else if (Array.isArray(propertyIds)) {
      ids = propertyIds;
    } else {
      return NextResponse.json(
        { error: 'Either propertyIds array or fetchAll flag must be provided' },
        { status: 400 }
      );
    }

    if (ids.length === 0) {
      return NextResponse.json({
        success: true,
        total: 0,
        successful: 0,
        failed: 0,
        poisFetched: 0,
        message: 'No properties to process',
      });
    }

    console.log(`Starting batch POI fetch for ${ids.length} properties...`);
    const result = await batchFetchPOIs(ids);

    return NextResponse.json({
      success: true,
      ...result,
      message: `Processed ${result.total} properties: ${result.successful} successful, ${result.failed} failed, ${result.poisFetched} POIs fetched`,
    });
  } catch (error) {
    console.error('POST /api/pois/batch-fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to batch fetch POIs' },
      { status: 500 }
    );
  }
}

// API endpoint for user preferences
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

// POST /api/preferences - Save user preference weights
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { categoryWeights, userId, sessionId } = body;

    // Validate categoryWeights
    if (!categoryWeights || typeof categoryWeights !== 'object') {
      return NextResponse.json(
        { error: 'categoryWeights is required and must be an object' },
        { status: 400 }
      );
    }

    // Generate session ID for anonymous users if not provided
    const effectiveSessionId = sessionId || userId || randomUUID();

    // Create preference record
    const preference = await prisma.userPreference.create({
      data: {
        userId: userId || null,
        sessionId: effectiveSessionId,
        categoryWeights,
      },
    });

    return NextResponse.json({
      id: preference.id,
      sessionId: effectiveSessionId,
      message: 'Preferences saved successfully',
    });
  } catch (error) {
    console.error('POST /api/preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}

// GET /api/preferences?sessionId=xxx - Get user preferences by session
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const preferenceId = searchParams.get('id');

    if (!sessionId && !preferenceId) {
      return NextResponse.json(
        { error: 'sessionId or id parameter is required' },
        { status: 400 }
      );
    }

    // Find preference by ID or sessionId
    const preference = preferenceId
      ? await prisma.userPreference.findUnique({
          where: { id: preferenceId },
        })
      : await prisma.userPreference.findFirst({
          where: { sessionId },
          orderBy: { createdAt: 'desc' },
        });

    if (!preference) {
      return NextResponse.json(
        { error: 'Preference not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(preference);
  } catch (error) {
    console.error('GET /api/preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

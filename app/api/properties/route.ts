// API routes for properties (GET list, POST create)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PropertyType } from '@prisma/client';

// GET /api/properties - List properties with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // Parse query parameters
    const city = searchParams.get('city');
    const propertyType = searchParams.get('propertyType') as PropertyType | null;
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minArea = searchParams.get('minArea');
    const maxArea = searchParams.get('maxArea');
    const rooms = searchParams.get('rooms');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const where: {
      isActive: boolean;
      city?: string;
      propertyType?: PropertyType;
      price?: { gte?: number; lte?: number };
      area?: { gte?: number; lte?: number };
      rooms?: number;
    } = {
      isActive: true,
    };

    if (city) where.city = city;
    if (propertyType) where.propertyType = propertyType;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    if (minArea || maxArea) {
      where.area = {};
      if (minArea) where.area.gte = parseFloat(minArea);
      if (maxArea) where.area.lte = parseFloat(maxArea);
    }
    if (rooms) where.rooms = parseInt(rooms);

    // Get total count and properties
    const [total, properties] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
        include: {
          images: {
            orderBy: { isPrimary: 'desc' },
          },
          pois: {
            include: {
              category: true,
            },
            orderBy: {
              distanceMeters: 'asc',
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return NextResponse.json({
      properties,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('GET /api/properties error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

// POST /api/properties - Create new property
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'price', 'propertyType', 'area', 'address', 'city', 'latitude', 'longitude'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create property
    const property = await prisma.property.create({
      data: {
        title: body.title,
        description: body.description,
        price: body.price,
        currency: body.currency || 'BGN',
        pricePerSqm: body.pricePerSqm,
        propertyType: body.propertyType,
        area: body.area,
        rooms: body.rooms,
        floor: body.floor,
        totalFloors: body.totalFloors,
        yearBuilt: body.yearBuilt,
        address: body.address,
        city: body.city,
        neighborhood: body.neighborhood,
        latitude: body.latitude,
        longitude: body.longitude,
        sourceUrl: body.sourceUrl,
        sourceSite: body.sourceSite,
        isActive: body.isActive ?? true,
      },
      include: {
        images: true,
        pois: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error('POST /api/properties error:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}

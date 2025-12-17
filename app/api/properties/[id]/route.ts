// API routes for individual property (GET, PUT, DELETE)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// GET /api/properties/[id] - Get single property
export async function GET(request: NextRequest, props: Params) {
  const params = await props.params;
  try {
    const property = await prisma.property.findUnique({
      where: { id: params.id },
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
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error(`GET /api/properties/${params.id} error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    );
  }
}

// PUT /api/properties/[id] - Update property
export async function PUT(request: NextRequest, props: Params) {
  const params = await props.params;
  try {
    const body = await request.json();

    // Check if property exists
    const existing = await prisma.property.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Update property
    const property = await prisma.property.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        price: body.price,
        currency: body.currency,
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
        isActive: body.isActive,
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

    return NextResponse.json(property);
  } catch (error) {
    console.error(`PUT /api/properties/${params.id} error:`, error);
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[id] - Delete property
export async function DELETE(request: NextRequest, props: Params) {
  const params = await props.params;
  try {
    // Check if property exists
    const existing = await prisma.property.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Soft delete by setting isActive to false
    await prisma.property.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/properties/${params.id} error:`, error);
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}

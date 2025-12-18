#!/usr/bin/env tsx
// Script to fetch POIs for properties
// Usage: npx tsx scripts/fetch-pois.ts [property-id]
// Or: npx tsx scripts/fetch-pois.ts --all

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { batchFetchPOIs, fetchPOIsForProperty } from '../services/poi-service';
import { hasApiKeys } from '../lib/google-api';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 POI Fetching Script\n');

  // Check API keys
  if (!hasApiKeys()) {
    console.error('❌ Google API keys not configured!');
    console.error('Please add GOOGLE_PLACES_API_KEY and GOOGLE_DISTANCE_MATRIX_API_KEY to .env file');
    process.exit(1);
  }

  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage:');
    console.log('  npx tsx scripts/fetch-pois.ts [property-id]  # Fetch POIs for specific property');
    console.log('  npx tsx scripts/fetch-pois.ts --all          # Fetch POIs for all properties');
    console.log('');
    process.exit(0);
  }

  if (args[0] === '--all') {
    // Fetch for all properties
    console.log('Fetching POIs for all properties...\n');

    const properties = await prisma.property.findMany({
      where: { isActive: true },
      select: { id: true, title: true },
    });

    if (properties.length === 0) {
      console.log('No properties found.');
      process.exit(0);
    }

    console.log(`Found ${properties.length} properties\n`);

    const propertyIds = properties.map((p) => p.id);
    const result = await batchFetchPOIs(propertyIds);

    console.log('\n✅ Batch fetch complete!');
    console.log(`Total: ${result.total}`);
    console.log(`Successful: ${result.successful}`);
    console.log(`Failed: ${result.failed}`);
    console.log(`POIs fetched: ${result.poisFetched}`);
  } else {
    // Fetch for specific property
    const propertyId = args[0];
    console.log(`Fetching POIs for property ${propertyId}...\n`);

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { title: true },
    });

    if (!property) {
      console.error(`❌ Property ${propertyId} not found`);
      process.exit(1);
    }

    console.log(`Property: ${property.title}\n`);

    const result = await fetchPOIsForProperty(propertyId);

    if (result.success) {
      console.log(`\n✅ Success! Fetched ${result.poisFetched} POIs`);
    } else {
      console.error(`\n❌ Failed: ${result.error}`);
      process.exit(1);
    }
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

// Prisma seed script for ImotiBG+
// Run with: npx prisma db seed

import 'dotenv/config';
import { PrismaClient, PropertyType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { POI_CATEGORIES } from '../lib/poi-categories';

// Prisma 7 requires an adapter for PostgreSQL
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed POI Categories
  console.log('📍 Seeding POI categories...');
  for (const [key, config] of Object.entries(POI_CATEGORIES)) {
    await prisma.pOICategory.upsert({
      where: { name: key },
      update: {
        nameBg: config.nameBg,
        icon: config.icon,
        googleTypes: [...config.googleTypes], // Convert readonly to mutable array
        searchRadius: config.searchRadius,
        importance: config.defaultWeight,
      },
      create: {
        name: key,
        nameBg: config.nameBg,
        icon: config.icon,
        googleTypes: [...config.googleTypes], // Convert readonly to mutable array
        searchRadius: config.searchRadius,
        importance: config.defaultWeight,
      },
    });
  }
  console.log(`✓ Created ${Object.keys(POI_CATEGORIES).length} POI categories`);

  // 2. Seed Test Properties
  console.log('🏠 Seeding test properties...');

  const testProperties = [
    {
      title: 'Двустаен апартамент в Лозенец',
      description: 'Просторен двустаен апартамент в квартал Лозенец, близо до парка. Напълно обзаведен и готов за нанасяне.',
      price: 180000,
      pricePerSqm: 2500,
      propertyType: PropertyType.APARTMENT,
      area: 72,
      rooms: 2,
      floor: 5,
      totalFloors: 8,
      yearBuilt: 2015,
      address: 'бул. Черни връх 47',
      city: 'София',
      neighborhood: 'Лозенец',
      latitude: 42.6766,
      longitude: 23.3238,
      sourceUrl: 'https://example.com/property/1',
      sourceSite: 'test-data',
    },
    {
      title: 'Тристаен апартамент в Студентски град',
      description: 'Светъл тристаен апартамент в Студентски град. Панел с ремонт, близо до метростанция.',
      price: 145000,
      pricePerSqm: 1750,
      propertyType: PropertyType.APARTMENT,
      area: 83,
      rooms: 3,
      floor: 3,
      totalFloors: 9,
      yearBuilt: 1985,
      address: 'ул. 8-ми Декември 15',
      city: 'София',
      neighborhood: 'Студентски град',
      latitude: 42.6520,
      longitude: 23.3578,
      sourceUrl: 'https://example.com/property/2',
      sourceSite: 'test-data',
    },
    {
      title: 'Едностаен апартамент в Център',
      description: 'Компактен едностаен в сърцето на София. Идеален за студенти или млади професионалисти.',
      price: 95000,
      pricePerSqm: 2375,
      propertyType: PropertyType.STUDIO,
      area: 40,
      rooms: 1,
      floor: 2,
      totalFloors: 5,
      yearBuilt: 2010,
      address: 'ул. Граф Игнатиев 28',
      city: 'София',
      neighborhood: 'Център',
      latitude: 42.6954,
      longitude: 23.3239,
      sourceUrl: 'https://example.com/property/3',
      sourceSite: 'test-data',
    },
    {
      title: 'Къща в Драгалевци',
      description: 'Самостоятелна къща в полите на Витоша. Двор 500 кв.м, гараж за 2 коли.',
      price: 320000,
      pricePerSqm: 2000,
      propertyType: PropertyType.HOUSE,
      area: 160,
      rooms: 4,
      floor: null,
      totalFloors: 2,
      yearBuilt: 2018,
      address: 'ул. Цар Симеон 12',
      city: 'София',
      neighborhood: 'Драгалевци',
      latitude: 42.6221,
      longitude: 23.2858,
      sourceUrl: 'https://example.com/property/4',
      sourceSite: 'test-data',
    },
    {
      title: 'Мезонет в Бояна',
      description: 'Луксозен мезонет в престижен комплекс. СПА център, денонощна охрана.',
      price: 450000,
      pricePerSqm: 3600,
      propertyType: PropertyType.MAISONETTE,
      area: 125,
      rooms: 3,
      floor: 6,
      totalFloors: 8,
      yearBuilt: 2020,
      address: 'ул. Бояна 1',
      city: 'София',
      neighborhood: 'Бояна',
      latitude: 42.6383,
      longitude: 23.2654,
      sourceUrl: 'https://example.com/property/5',
      sourceSite: 'test-data',
    },
  ];

  for (const propertyData of testProperties) {
    await prisma.property.create({
      data: propertyData,
    });
  }

  console.log(`✓ Created ${testProperties.length} test properties`);
  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

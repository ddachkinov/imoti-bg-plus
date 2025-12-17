# Claude Code Initial Prompt for ImotiBG+ Real Estate Portal

## Project Bootstrap Prompt

Copy and paste this prompt when starting a new Claude Code session:

---

```
I'm building a Bulgarian real estate portal called "ImotiBG+" (or suggest a better name). The core differentiator is POI (Points of Interest) proximity data - showing users what's near each property (grocery stores, kindergartens, hospitals, public transport, etc.) with distances in meters/km and walking/driving times.

## Project Philosophy
- SIMPLICITY FIRST: Like imot.bg, simplicity is key to adoption
- MAINTAINABLE: Solo developer, must be easy to maintain long-term
- INCREMENTAL: Build MVP first, add features progressively
- COST-CONSCIOUS: Optimize API calls, cache aggressively

## Core Features (MVP)
1. Property listings with basic search/filter
2. POI proximity data for each property (the key differentiator)
3. User preference questionnaire ("What matters to you?")
4. Personalized property scoring based on user priorities

## Tech Stack (confirmed)
- Frontend: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- Backend: Next.js API routes (start simple, can extract later)
- Database: PostgreSQL with Prisma ORM
- Maps/POI: Google Places API (with aggressive caching)
- Hosting: Vercel (frontend) + Supabase (database) OR Railway
- Scraping: Node.js with Puppeteer in Docker containers

## Project Structure
Please set up the project with this structure:
```
imoti-bg-plus/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   ├── lib/                 # Utilities, API clients
│   ├── services/            # Business logic
│   └── types/               # TypeScript types
├── prisma/                  # Database schema
├── scripts/                 # Scraping and utility scripts
├── docs/                    # Documentation
└── tests/                   # Test files
```

## Current Task
Let's start with [SPECIFY: documentation/database schema/basic UI/scraping setup]

## Key Constraints
- Bulgarian market focus (BG language support needed)
- SI units (meters, kilometers, minutes)
- GDPR compliance for user data
- Rate limiting awareness for external APIs

Please acknowledge this context and let's begin with the specified task.
```

---

## Extended Documentation

### 1. Problem Statement

Bulgarian real estate portals like imot.bg are popular due to their simplicity, but they lack crucial information that buyers need:

**The Gap**: When looking at a property, users cannot easily see:
- Distance to nearest grocery store, pharmacy, hospital
- Proximity to kindergartens, schools (critical for families)
- Public transport accessibility
- Distance to parks, green spaces
- Commute time to specific locations (work, city center)

**The Pain**: Real estate's golden rule is "location, location, location" - but current portals don't help users understand what that location actually means for their daily life.

### 2. Solution Overview

**ImotiBG+** enriches every property listing with:

1. **Automatic POI Discovery**: For each property address, we query nearby POIs and cache the results
2. **Distance Matrix**: Show distances in meters/km AND walking/driving minutes
3. **Priority System**: Let users define what matters most to them
4. **Smart Scoring**: Rank properties based on user's personal priorities

### 3. Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  Next.js + React + Tailwind                                 │
│  - Property listings                                         │
│  - Map integration                                           │
│  - Preference questionnaire                                  │
│  - Personalized scoring UI                                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    API Layer                                 │
│  Next.js API Routes                                          │
│  - Property CRUD                                             │
│  - Search & Filter                                           │
│  - User preferences                                          │
│  - POI fetching (with cache)                                │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   Database                                   │
│  PostgreSQL + Prisma                                         │
│  - Properties table                                          │
│  - POI cache table                                           │
│  - User preferences                                          │
│  - Scraped data staging                                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              External Services                               │
│  - Google Places API (POI data)                             │
│  - Google Distance Matrix API (travel times)                │
│  - Geocoding API (address → coordinates)                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Scraping Infrastructure                         │
│  Docker containers with Puppeteer                           │
│  - Rotating proxies                                          │
│  - Rate limiting                                             │
│  - Data normalization                                        │
└─────────────────────────────────────────────────────────────┘
```

### 4. Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Property {
  id          String   @id @default(cuid())
  
  // Basic info
  title       String
  description String?
  price       Decimal
  currency    String   @default("BGN")
  pricePerSqm Decimal?
  
  // Property details
  propertyType PropertyType
  area         Decimal  // in square meters
  rooms        Int?
  floor        Int?
  totalFloors  Int?
  yearBuilt    Int?
  
  // Location
  address     String
  city        String
  neighborhood String?
  latitude    Decimal
  longitude   Decimal
  
  // Source tracking
  sourceUrl   String?  @unique
  sourceSite  String?
  
  // Metadata
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  images      PropertyImage[]
  pois        PropertyPOI[]
  
  @@index([city, propertyType])
  @@index([latitude, longitude])
}

enum PropertyType {
  APARTMENT
  HOUSE
  STUDIO
  MAISONETTE
  PENTHOUSE
  COMMERCIAL
  LAND
  GARAGE
}

model PropertyImage {
  id         String   @id @default(cuid())
  url        String
  isPrimary  Boolean  @default(false)
  propertyId String
  property   Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
}

model POICategory {
  id          String  @id @default(cuid())
  name        String  @unique  // e.g., "grocery", "kindergarten", "hospital"
  nameBg      String           // Bulgarian name
  icon        String?          // Icon identifier
  googleType  String           // Google Places API type
  importance  Int     @default(5)  // 1-10 default importance
  
  pois        PropertyPOI[]
}

model PropertyPOI {
  id           String   @id @default(cuid())
  
  // The property this POI is associated with
  propertyId   String
  property     Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  
  // POI category
  categoryId   String
  category     POICategory @relation(fields: [categoryId], references: [id])
  
  // POI details
  name         String
  address      String?
  latitude     Decimal
  longitude    Decimal
  
  // Distances (cached)
  distanceMeters    Int
  walkingMinutes    Int?
  drivingMinutes    Int?
  transitMinutes    Int?
  
  // Google Places data
  googlePlaceId String?
  rating        Decimal?
  
  // Cache metadata
  fetchedAt    DateTime @default(now())
  
  @@unique([propertyId, googlePlaceId])
  @@index([propertyId, categoryId])
}

model UserPreference {
  id        String   @id @default(cuid())
  userId    String?  // Anonymous users get session-based ID
  sessionId String?
  
  // Priority weights (1-10)
  groceryWeight      Int @default(5)
  kindergartenWeight Int @default(5)
  schoolWeight       Int @default(5)
  hospitalWeight     Int @default(5)
  pharmacyWeight     Int @default(5)
  transportWeight    Int @default(5)
  parkWeight         Int @default(3)
  gymWeight          Int @default(3)
  
  // Custom priorities (JSON for flexibility)
  customPriorities Json?
  
  // Location preferences
  maxCommuteMinutes Int?
  commuteToAddress  String?
  commuteToLat      Decimal?
  commuteToLng      Decimal?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([userId])
  @@index([sessionId])
}
```

### 5. POI Categories (Initial Set)

```typescript
// src/lib/poi-categories.ts

export const POI_CATEGORIES = {
  // Essential (high default priority)
  grocery: {
    name: 'Grocery Store',
    nameBg: 'Хранителен магазин',
    googleTypes: ['supermarket', 'grocery_or_supermarket'],
    icon: 'shopping-cart',
    defaultWeight: 8,
    searchRadius: 1000, // meters
  },
  pharmacy: {
    name: 'Pharmacy',
    nameBg: 'Аптека',
    googleTypes: ['pharmacy'],
    icon: 'pill',
    defaultWeight: 7,
    searchRadius: 1500,
  },
  hospital: {
    name: 'Hospital/Clinic',
    nameBg: 'Болница/Клиника',
    googleTypes: ['hospital', 'doctor'],
    icon: 'hospital',
    defaultWeight: 6,
    searchRadius: 3000,
  },
  
  // Family (variable priority)
  kindergarten: {
    name: 'Kindergarten',
    nameBg: 'Детска градина',
    googleTypes: ['school'], // Filter by name
    icon: 'baby',
    defaultWeight: 5,
    searchRadius: 2000,
  },
  school: {
    name: 'School',
    nameBg: 'Училище',
    googleTypes: ['school', 'primary_school', 'secondary_school'],
    icon: 'graduation-cap',
    defaultWeight: 5,
    searchRadius: 2000,
  },
  
  // Transport
  busStop: {
    name: 'Bus Stop',
    nameBg: 'Автобусна спирка',
    googleTypes: ['bus_station', 'transit_station'],
    icon: 'bus',
    defaultWeight: 6,
    searchRadius: 500,
  },
  metro: {
    name: 'Metro Station',
    nameBg: 'Метростанция',
    googleTypes: ['subway_station'],
    icon: 'train',
    defaultWeight: 7,
    searchRadius: 1500,
  },
  
  // Lifestyle
  park: {
    name: 'Park',
    nameBg: 'Парк',
    googleTypes: ['park'],
    icon: 'tree',
    defaultWeight: 4,
    searchRadius: 1000,
  },
  gym: {
    name: 'Gym',
    nameBg: 'Фитнес',
    googleTypes: ['gym'],
    icon: 'dumbbell',
    defaultWeight: 3,
    searchRadius: 1500,
  },
  restaurant: {
    name: 'Restaurant',
    nameBg: 'Ресторант',
    googleTypes: ['restaurant'],
    icon: 'utensils',
    defaultWeight: 2,
    searchRadius: 1000,
  },
} as const;
```

### 6. Google API Cost Management

```typescript
// src/lib/google-api-strategy.ts

/**
 * Google API Pricing (as of 2024):
 * 
 * Places API - Nearby Search: $32 per 1000 requests
 * Distance Matrix API: $5 per 1000 elements (origins × destinations)
 * Geocoding API: $5 per 1000 requests
 * 
 * STRATEGY: Aggressive caching + smart batching
 */

export const API_STRATEGY = {
  // Cache POI data for 30 days (locations don't change often)
  POI_CACHE_DAYS: 30,
  
  // Cache distance calculations for 7 days
  DISTANCE_CACHE_DAYS: 7,
  
  // Only fetch top 3 nearest POIs per category
  MAX_POIS_PER_CATEGORY: 3,
  
  // Batch distance matrix requests
  DISTANCE_BATCH_SIZE: 25, // Max 25 origins OR 25 destinations per request
  
  // Daily budget limits (in requests)
  DAILY_LIMITS: {
    placesSearch: 500,    // ~$16/day max
    distanceMatrix: 1000, // ~$5/day max
    geocoding: 200,       // ~$1/day max
  },
  
  // Pre-calculate for all properties in a neighborhood at once
  NEIGHBORHOOD_BATCH_MODE: true,
};
```

### 7. User Preference Questionnaire Flow

```typescript
// src/lib/questionnaire.ts

export const QUESTIONNAIRE_STEPS = [
  {
    id: 'household',
    question: 'Какъв е вашият домакински състав?',
    questionEn: 'What is your household composition?',
    options: [
      { id: 'single', label: 'Живея сам/сама', affects: { kindergarten: 0, school: 0 } },
      { id: 'couple', label: 'Двойка без деца', affects: { kindergarten: 0, school: 0 } },
      { id: 'young-family', label: 'Семейство с малки деца', affects: { kindergarten: 10, school: 5, park: 8 } },
      { id: 'family-school', label: 'Семейство с ученици', affects: { kindergarten: 0, school: 10, park: 6 } },
      { id: 'retired', label: 'Пенсионери', affects: { hospital: 9, pharmacy: 9, park: 7 } },
    ],
  },
  {
    id: 'transport',
    question: 'Как се придвижвате основно?',
    questionEn: 'How do you mainly commute?',
    options: [
      { id: 'car', label: 'С кола', affects: { busStop: 2, metro: 2 } },
      { id: 'public', label: 'С градски транспорт', affects: { busStop: 10, metro: 10 } },
      { id: 'mixed', label: 'Комбинирано', affects: { busStop: 6, metro: 6 } },
      { id: 'walk-bike', label: 'Пеша или с колело', affects: { busStop: 4, metro: 4, grocery: 10 } },
    ],
  },
  {
    id: 'lifestyle',
    question: 'Кое е най-важно за вас в ежедневието?',
    questionEn: 'What is most important in your daily life?',
    multiSelect: true,
    options: [
      { id: 'health', label: 'Здравословен начин на живот', affects: { gym: 8, park: 8 } },
      { id: 'convenience', label: 'Удобство и бързина', affects: { grocery: 10, pharmacy: 8 } },
      { id: 'social', label: 'Социален живот', affects: { restaurant: 7, cafe: 7 } },
      { id: 'nature', label: 'Близост до природа', affects: { park: 10 } },
    ],
  },
  {
    id: 'commute',
    question: 'Имате ли конкретен адрес за ежедневно пътуване?',
    questionEn: 'Do you have a specific commute destination?',
    type: 'address-input',
    optional: true,
  },
];
```

### 8. Scraping Strategy

```typescript
// scripts/scrapers/README.md content

/**
 * SCRAPING INFRASTRUCTURE
 * 
 * Legal Considerations:
 * - Check robots.txt for each site
 * - Respect rate limits (1 request per 2-3 seconds minimum)
 * - Don't scrape personal data (agent phone numbers, etc.)
 * - Only scrape publicly available property data
 * 
 * Architecture:
 * - Docker containers with Puppeteer
 * - Rotating residential proxies (consider Bright Data or similar)
 * - Each container simulates a real user
 * - Data goes to staging table, then reviewed before publishing
 */

export const SCRAPING_CONFIG = {
  targets: [
    {
      site: 'imot.bg',
      baseUrl: 'https://www.imot.bg',
      robotsTxtAllows: true, // Verify this
      rateLimit: 3000, // ms between requests
      priority: 1,
    },
    {
      site: 'homes.bg',
      baseUrl: 'https://www.homes.bg',
      robotsTxtAllows: true, // Verify this
      rateLimit: 3000,
      priority: 2,
    },
    // Add more as needed
  ],
  
  // Container rotation strategy
  containers: {
    count: 3, // Start with 3 containers
    requestsPerContainer: 100, // Rotate after 100 requests
    cooldownMinutes: 30, // Container cooldown between rotations
  },
  
  // Data extraction
  extraction: {
    required: ['title', 'price', 'address', 'area'],
    optional: ['description', 'images', 'rooms', 'floor', 'yearBuilt'],
    skipIfMissing: ['address'], // Can't use property without address
  },
};
```

### 9. Property Scoring Algorithm

```typescript
// src/services/scoring.ts

interface UserWeights {
  [categoryId: string]: number; // 0-10 weight
}

interface PropertyPOIData {
  categoryId: string;
  distanceMeters: number;
  walkingMinutes?: number;
}

/**
 * Calculate a property score based on user priorities
 * 
 * Score formula:
 * For each POI category:
 *   categoryScore = weight × (1 - distance/maxDistance)
 * 
 * totalScore = sum(categoryScores) / sum(weights) × 100
 */
export function calculatePropertyScore(
  pois: PropertyPOIData[],
  weights: UserWeights,
  maxDistances: Record<string, number>
): number {
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
    const weight = weights[categoryId] ?? 5;
    if (weight === 0) continue;
    
    const maxDistance = maxDistances[categoryId] ?? 2000;
    const normalizedDistance = Math.min(poi.distanceMeters / maxDistance, 1);
    const categoryScore = 1 - normalizedDistance;
    
    weightedSum += weight * categoryScore;
    totalWeight += weight;
  }
  
  if (totalWeight === 0) return 50; // Neutral score
  
  return Math.round((weightedSum / totalWeight) * 100);
}
```

### 10. Development Phases

#### Phase 1: Foundation (Week 1-2)
- [ ] Project setup (Next.js, Prisma, Tailwind)
- [ ] Database schema implementation
- [ ] Basic property CRUD API
- [ ] Simple property listing UI
- [ ] Manual property entry form (for testing)

#### Phase 2: POI Integration (Week 3-4)
- [ ] Google Places API integration
- [ ] POI caching system
- [ ] Property detail page with POI list
- [ ] Distance calculations
- [ ] Map visualization

#### Phase 3: User Preferences (Week 5-6)
- [ ] Questionnaire implementation
- [ ] User preference storage
- [ ] Scoring algorithm
- [ ] Personalized property ranking
- [ ] Priority adjustment UI

#### Phase 4: Scraping (Week 7-8)
- [ ] Docker scraping infrastructure
- [ ] First scraper (imot.bg)
- [ ] Data normalization pipeline
- [ ] Deduplication logic
- [ ] Scheduled scraping jobs

#### Phase 5: Analytics Foundation (Week 9-10)
- [ ] Cookie consent banner (GDPR)
- [ ] Privacy policy page
- [ ] Event tracking infrastructure
- [ ] Search event logging (anonymized)
- [ ] Property view tracking
- [ ] POI priority snapshots
- [ ] Daily aggregation job (cron)

#### Phase 6: Polish & Launch (Week 11-12)
- [ ] Bulgarian language support
- [ ] SEO optimization
- [ ] Performance optimization
- [ ] Error handling & monitoring
- [ ] Beta launch

**See ANALYTICS_STRATEGY.md for detailed data collection plan (B2B monetization at year 1+)**

---

## Development Environment Recommendations

### Option 1: Claude Code CLI on MacBook (RECOMMENDED for this project)

**Why**: 
- Direct terminal access for database commands, Docker, etc.
- Better for full-stack development with scraping components
- Persistent environment between sessions

**Setup**:
```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Start in your project directory
cd ~/projects/imoti-bg-plus
claude
```

### Option 2: Cursor IDE

**Why**:
- Excellent for frontend-heavy work
- Good AI autocomplete
- Visual file management

**When to use**: When focusing on React components and UI work

### Option 3: VS Code with Continue Extension

**Why**:
- Familiar environment
- Good for those already invested in VS Code ecosystem

### Recommended MCP Tools

```json
// claude_desktop_config.json or similar
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-filesystem", "/path/to/project"]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://..."
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-github"],
      "env": {
        "GITHUB_TOKEN": "..."
      }
    }
  }
}
```

---

## Resumption Prompts

When you hit token limits, use these prompts to continue:

### General Continuation
```
Continuing ImotiBG+ development. Last session we completed [X]. 
Current phase: [Phase N]
Next task: [specific task]
Please review the codebase state and continue.
```

### After Break
```
Resuming ImotiBG+ project. Please:
1. Read package.json to understand current dependencies
2. Check prisma/schema.prisma for current database state
3. Review src/app structure for completed pages
4. Continue with [next task]
```

---

## Cost Estimation

### Google APIs (Monthly, moderate usage)
- Places API: ~$50-100
- Distance Matrix: ~$20-50
- Geocoding: ~$10-20
- **Total**: ~$80-170/month

### Infrastructure
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Proxy service: ~$50/month (for scraping)
- **Total**: ~$95/month

### Initial Monthly Budget: ~$175-265

---

## Risk Mitigation

1. **API Costs Spiral**: Implement strict daily limits, monitor closely
2. **Scraping Blocked**: Have multiple proxy providers, respect rate limits
3. **Legal Issues**: Don't scrape personal data, add proper attribution
4. **Scope Creep**: Stick to MVP features, resist adding complexity
5. **Data Quality**: Manual review process for scraped data initially

---

## Success Metrics (MVP)

- [ ] 1,000+ properties listed
- [ ] POI data for 80%+ of properties
- [ ] Page load < 2 seconds
- [ ] Questionnaire completion rate > 60%
- [ ] 100 daily active users (first month post-launch)

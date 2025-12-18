# ImotiBG+ 🏠

Bulgarian Real Estate Portal with POI Proximity Data

## Project Status

**Current Phase**: Phase 2 - POI Integration ✅
**Last Updated**: December 17, 2024

## What's Completed

### Phase 1: Foundation ✅
- Next.js 15 with TypeScript and Tailwind CSS
- PostgreSQL database (`imoti_bg_plus`)
- Prisma ORM with complete schema
- RESTful API (CRUD for properties)
- Property listing and detail pages
- Manual property entry form

### Phase 2: POI Integration ✅
- Google Places API integration
- Automatic POI fetching with caching
- Distance Matrix API (walking/driving times)
- Interactive Leaflet maps
- Batch POI fetching CLI
- API endpoints for POI management

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
open http://localhost:3000
```

## Database Commands

```bash
# Run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Seed database
npx prisma db seed

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (careful!)
npx prisma migrate reset
```

## POI Commands (Phase 2)

```bash
# Fetch POIs for specific property
npm run fetch-pois [property-id]

# Fetch POIs for all properties
npm run fetch-pois -- --all

# Refresh stale POI data (>30 days)
curl -X POST http://localhost:3000/api/pois/refresh
```

### Configure Google API Keys

1. Get API keys from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Enable "Places API" and "Distance Matrix API"
3. Add keys to `.env`:

```env
GOOGLE_PLACES_API_KEY="your-key-here"
GOOGLE_DISTANCE_MATRIX_API_KEY="your-key-here"
```

## MCP PostgreSQL Server

Now that the database is set up, you can use the MCP PostgreSQL server:

```bash
npx -y @modelcontextprotocol/server-postgres postgresql://ddachkinov@localhost:5432/imoti_bg_plus
```

## Project Structure

```
imoti-bg-plus/
├── app/                    # Next.js App Router pages
├── components/             # React components
├── lib/                    # Utilities, API clients
│   ├── prisma.ts          # Prisma client singleton
│   └── poi-categories.ts  # POI definitions
├── services/              # Business logic
│   └── scoring.ts         # Property scoring algorithm
├── types/                 # TypeScript types
├── prisma/                # Database schema & migrations
├── scripts/               # Scraping and utility scripts
├── docs/                  # Documentation
└── tests/                 # Test files
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Maps/POI**: Google Places API (to be configured)

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL="postgresql://ddachkinov@localhost:5432/imoti_bg_plus"
# GOOGLE_PLACES_API_KEY="your-key-here"  # Phase 2
```

## Documentation

- `CLAUDE_CODE_PROMPT.md` - Complete project documentation and architecture
- `docs/PHASE_2_POI_INTEGRATION.md` - Phase 2 POI integration guide
- `CLAUDE.md` - Project context and progress tracking

## Next Steps (Phase 3)

- [ ] User preference questionnaire
- [ ] Personalized property scoring
- [ ] Property ranking by user priorities
- [ ] Commute time calculator
- [ ] POI filters on listing page

## License

Private - All Rights Reserved

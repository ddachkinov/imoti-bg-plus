# ImotiBG+ Project Context

## Quick Summary
Bulgarian real estate portal with POI proximity features

## Tech Stack
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Prisma 7 + PostgreSQL 16
- Google Places/Distance Matrix APIs

## Current Phase
Phase 1: Foundation

## Last Completed (Dec 17, 2024)
- Project bootstrap: Next.js 15, TypeScript, Tailwind CSS
- PostgreSQL 16 installed and configured locally
- Prisma schema with 5 models (Property, PropertyImage, POICategory, PropertyPOI, UserPreference)
- Architectural review and fixes:
  - Fixed .gitignore to version control migrations
  - Changed POICategory.googleType from String to String[] array
  - Added missing indexes (PropertyImage.propertyId, PropertyPOI.googlePlaceId)
  - Added cascade delete on POICategory -> PropertyPOI
  - Refactored UserPreference to use flexible JSON categoryWeights instead of hardcoded columns

## Next Up
- Basic property CRUD API routes (app/api/properties/)
- Simple property listing UI
- Manual property entry form for testing
- Seed database with test properties

## Key Files
- prisma/schema.prisma - Database schema
- lib/poi-categories.ts - POI definitions
- services/scoring.ts - Property scoring logic
- lib/prisma.ts - Prisma client singleton
- types/index.ts - TypeScript type definitions

## Important Decisions Made
- Using Google Places API (not OpenStreetMap) for reliability
- Bulgarian Lev (BGN) as primary currency
- SI units only (meters/km, minutes)
- UserPreference uses JSON categoryWeights for flexibility (no schema changes needed for new POI types)
- Prisma 7 configuration via prisma.config.ts (not schema.prisma url)

## Database Connection
```
postgresql://ddachkinov@localhost:5432/imoti_bg_plus
```

## Known Issues
None currently

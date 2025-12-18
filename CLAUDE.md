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
Phase 2: POI Integration (Complete ✅)

## Last Completed (Dec 17, 2024 - Phase 1 Complete ✅)
### Infrastructure
- Project bootstrap: Next.js 15, TypeScript, Tailwind CSS
- PostgreSQL 16 installed and configured locally
- Prisma 7 with pg adapter
- Database schema with 5 models (Property, PropertyImage, POICategory, PropertyPOI, UserPreference)

### Architectural Improvements
- Fixed .gitignore to version control migrations
- Changed POICategory.googleType from String to String[] array
- Added missing indexes (PropertyImage.propertyId, PropertyPOI.googlePlaceId)
- Added cascade delete on POICategory -> PropertyPOI
- Refactored UserPreference to use flexible JSON categoryWeights instead of hardcoded columns

### Features Implemented
- ✅ RESTful API (GET, POST, PUT, DELETE for properties)
- ✅ Property listing page with Bulgarian UI
- ✅ Property detail page with POI display
- ✅ Manual property entry form
- ✅ Database seed with 10 POI categories and 5 test properties
- ✅ Property scoring algorithm
- ✅ Type-safe API with proper error handling

### Git Repository
- Pushed to GitHub: https://github.com/ddachkinov/imoti-bg-plus

## Last Completed (Dec 17, 2024 - Phase 2 Complete ✅)
### POI Integration
- ✅ Google Places API integration (searchNearbyPlaces, getDistanceMatrix)
- ✅ POI fetching service with caching (30-day cache)
- ✅ Distance calculations (straight-line + walking/driving times)
- ✅ Interactive Leaflet map visualization
- ✅ Batch POI fetching CLI script
- ✅ API endpoints (fetch-pois, batch-fetch, refresh)
- ✅ Client components (FetchPOIsButton, PropertyMap)
- ✅ Cost management (top 3 per category, rate limiting)

## Next Up (Phase 3: User Preferences)
- User preference questionnaire UI
- Store user priorities (categoryWeights)
- Property scoring based on user preferences
- Personalized property ranking
- Preference adjustment UI
- Commute time calculator

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

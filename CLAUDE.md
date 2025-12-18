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
Phase 3: User Preferences (Complete ✅)

## Last Completed (Dec 18, 2024 - Phase 3 Complete ✅)
### User Preferences & Personalization
- ✅ Multi-step preference questionnaire (3 questions)
- ✅ Question types: single-select, multi-select, with skip option
- ✅ Dynamic weight calculation from user answers
- ✅ Property scoring algorithm (0-100 match percentage)
- ✅ Personalized property ranking with score badges
- ✅ POI category filters (collapsible UI with 4 groups)
- ✅ Preferences API (POST/GET with session support)
- ✅ Session-based anonymous user tracking
- ✅ URL parameter-based state management

## Previous Phases

### Phase 1 (Dec 17, 2024 - Complete ✅)
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

### Phase 2 (Dec 17, 2024 - Complete ✅)
### POI Integration
- ✅ Google Places API integration (searchNearbyPlaces, getDistanceMatrix)
- ✅ POI fetching service with caching (30-day cache)
- ✅ Distance calculations (straight-line + walking/driving times)
- ✅ Interactive Leaflet map visualization
- ✅ Batch POI fetching CLI script
- ✅ API endpoints (fetch-pois, batch-fetch, refresh)
- ✅ Client components (FetchPOIsButton, PropertyMap)
- ✅ Cost management (top 3 per category, rate limiting)

## Next Up (Phase 4+: Future Enhancements)
- Commute time calculator with workplace location
- User authentication and saved preferences
- Advanced filters (price range, rooms, property type)
- Map view with score-based markers
- Email alerts for high-scoring new properties
- Property comparison tool
- Edit preferences without full questionnaire retake

## Key Files
- prisma/schema.prisma - Database schema
- lib/poi-categories.ts - POI definitions and default weights
- lib/questionnaire.ts - User preference questions and weight mapping
- services/scoring.ts - Property scoring algorithm
- services/poi-service.ts - POI fetching and caching
- lib/prisma.ts - Prisma client singleton
- types/index.ts - TypeScript type definitions
- app/preferences/page.tsx - Preference questionnaire UI
- app/properties/page.tsx - Property listing with scoring
- components/PropertyFilters.tsx - POI filter component

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
- Dev server using port 3003 (port 3000 in use)
- No user authentication yet (session-based only)
- Cannot edit individual preferences without retaking full questionnaire

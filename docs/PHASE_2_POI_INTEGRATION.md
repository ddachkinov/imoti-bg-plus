# Phase 2: POI Integration - Complete Documentation

## Overview

Phase 2 adds Google Places API integration to automatically fetch and display Points of Interest (POIs) near properties.

## Features Implemented

### 1. Google Places API Integration (`lib/google-api.ts`)
- **searchNearbyPlaces()** - Search for places within radius using Google Places API
- **calculateDistance()** - Haversine formula for straight-line distance
- **getDistanceMatrix()** - Get walking/driving times via Distance Matrix API
- **hasApiKeys()** - Check if API keys are configured

### 2. POI Service (`services/poi-service.ts`)
- **fetchPOIsForProperty()** - Fetch and cache POIs for a single property
- **isPOIDataStale()** - Check if POI data is older than 30 days
- **batchFetchPOIs()** - Batch fetch POIs for multiple properties
- **refreshStalePOIs()** - Refresh stale POI data for all properties

### 3. API Endpoints

#### POST /api/properties/[id]/fetch-pois
Fetch POIs for a specific property.

**Response:**
```json
{
  "success": true,
  "poisFetched": 25,
  "message": "Successfully fetched 25 POIs"
}
```

#### POST /api/pois/batch-fetch
Batch fetch POIs for multiple properties.

**Request:**
```json
{
  "propertyIds": ["id1", "id2", "id3"],
  // OR
  "fetchAll": true
}
```

**Response:**
```json
{
  "success": true,
  "total": 5,
  "successful": 5,
  "failed": 0,
  "poisFetched": 125
}
```

#### POST /api/pois/refresh
Refresh stale POI data (>30 days old).

**Response:**
```json
{
  "success": true,
  "checked": 5,
  "refreshed": 2,
  "poisFetched": 50
}
```

### 4. Map Visualization
- Interactive Leaflet map on property detail page
- Property marker (blue)
- POI markers (color-coded by category)
- 1km radius circle
- Click markers for POI details

### 5. UI Components

#### FetchPOIsButton (`components/FetchPOIsButton.tsx`)
- Client component to trigger POI fetching
- Shows loading state
- Displays errors
- Refreshes page on success

#### PropertyMap (`components/PropertyMap.tsx`)
- Client-side Leaflet map
- Markers for property and POIs
- Popups with POI details
- Color-coded by category

#### PropertyMapClient (`components/PropertyMapClient.tsx`)
- Wrapper for dynamic import (SSR bypass)

### 6. CLI Script

```bash
# Fetch POIs for specific property
npm run fetch-pois [property-id]

# Fetch POIs for all properties
npm run fetch-pois -- --all
```

## Configuration

### Environment Variables (.env)

```env
GOOGLE_PLACES_API_KEY="your-key-here"
GOOGLE_DISTANCE_MATRIX_API_KEY="your-key-here"
```

Get keys from: https://console.cloud.google.com/apis/credentials

### Required APIs
1. **Google Places API** (Nearby Search)
2. **Google Distance Matrix API**

### Enable APIs in Google Cloud Console
```
1. Create project or select existing
2. Enable "Places API"
3. Enable "Distance Matrix API"
4. Create API Key (with restrictions)
```

## Cost Management

### API Pricing (2024)
- Places API Nearby Search: $32/1000 requests
- Distance Matrix API: $5/1000 elements

### Optimization Strategy
1. **Cache for 30 days** - POI data doesn't change often
2. **Top 3 per category** - Fetch only nearest POIs
3. **Batch requests** - Up to 25 destinations per Distance Matrix call
4. **Rate limiting** - 2 second delay between batch fetches
5. **Fallback** - Straight-line distance if API fails

### Estimated Costs (500 properties)
- Initial fetch: ~$50-70 (one-time)
- Monthly refresh: ~$5-10 (stale data only)

## Usage

### 1. Configure API Keys
```bash
cp .env.example .env
# Edit .env and add your Google API keys
```

### 2. Fetch POIs for Seeded Properties
```bash
npm run fetch-pois -- --all
```

### 3. View Property with Map
Navigate to `/properties/[id]` and click "Намери наблизо"

### 4. Refresh Stale Data (Cron Job)
```bash
# Set up weekly cron job
0 0 * * 0 curl -X POST http://localhost:3000/api/pois/refresh
```

## POI Categories

| Category | Bulgarian | Google Types | Default Weight | Radius |
|----------|-----------|--------------|----------------|--------|
| grocery | Хранителен магазин | supermarket, grocery_or_supermarket | 8 | 1000m |
| pharmacy | Аптека | pharmacy | 7 | 1500m |
| hospital | Болница/Клиника | hospital, doctor | 6 | 3000m |
| kindergarten | Детска градина | school | 5 | 2000m |
| school | Училище | school, primary_school, secondary_school | 5 | 2000m |
| busStop | Автобусна спирка | bus_station, transit_station | 6 | 500m |
| metro | Метростанция | subway_station | 7 | 1500m |
| park | Парк | park | 4 | 1000m |
| gym | Фитнес | gym | 3 | 1500m |
| restaurant | Ресторант | restaurant | 2 | 1000m |

## Database Schema Changes

No schema changes required - Phase 2 uses existing schema from Phase 1.

## Error Handling

### API Key Not Configured
```json
{
  "error": "Google API keys not configured. Please add GOOGLE_PLACES_API_KEY and GOOGLE_DISTANCE_MATRIX_API_KEY to .env file."
}
```

### Rate Limit Exceeded
Falls back to straight-line distance calculation.

### Network Errors
Logs error and continues with next property.

## Testing

### Test Single Property
1. Navigate to property detail page
2. Click "Намери наблизо" button
3. Wait for POIs to load (~10-30 seconds)
4. Map should update with markers

### Test Batch Fetch
```bash
npm run fetch-pois -- --all
```

Expected output:
```
🚀 POI Fetching Script

Fetching POIs for all properties...

Found 5 properties

✓ Fetched 23 POIs for property cm...
✓ Fetched 27 POIs for property cm...
...

✅ Batch fetch complete!
Total: 5
Successful: 5
Failed: 0
POIs fetched: 125
```

## Troubleshooting

### Map Not Loading
- Check browser console for errors
- Ensure Leaflet CSS is loaded
- Verify latitude/longitude are valid numbers

### No POIs Found
- Check API keys are correct
- Verify APIs are enabled in Google Cloud Console
- Check search radius in poi-categories.ts
- View API response in Network tab

### API Quota Exceeded
- Reduce batch size
- Increase delay between requests
- Contact Google for quota increase

## Future Enhancements (Phase 3)
- [ ] User preference questionnaire
- [ ] Personalized property scoring
- [ ] POI filters on listing page
- [ ] Search by POI proximity
- [ ] Commute time calculator
- [ ] Save favorite POI categories
- [ ] POI analytics dashboard

## File Structure

```
lib/
  google-api.ts         # Google API client
  poi-categories.ts     # POI definitions (unchanged)

services/
  poi-service.ts        # POI fetching logic

app/api/
  properties/[id]/
    fetch-pois/
      route.ts          # Fetch POIs for property
  pois/
    batch-fetch/
      route.ts          # Batch fetch endpoint
    refresh/
      route.ts          # Refresh stale data

components/
  PropertyMap.tsx       # Leaflet map component
  PropertyMapClient.tsx # Client wrapper
  FetchPOIsButton.tsx   # Fetch button

scripts/
  fetch-pois.ts         # CLI script

docs/
  PHASE_2_POI_INTEGRATION.md  # This file
```

## Performance

### Metrics (5 properties, 10 categories each)
- **Initial fetch**: ~120 seconds
- **POIs per property**: ~25-30
- **API calls**: ~60 (Places) + ~15 (Distance Matrix)
- **Database inserts**: ~125-150

### Optimization
- Batch Distance Matrix requests (25 destinations)
- Parallel category fetching
- Cache results for 30 days
- Graceful degradation on API failures

## Security

### API Key Protection
- Keys stored in .env (gitignored)
- Server-side API calls only
- No keys exposed to client

### Rate Limiting
- 2 second delay between properties
- Respects Google's rate limits
- Implements exponential backoff (future)

## Compliance

### Google Places API Terms
- Display attribution: ✅ (OpenStreetMap tiles)
- No caching beyond 30 days: ✅
- Proper error handling: ✅
- Rate limiting: ✅

## Monitoring

### Recommended Metrics
- API call count per day
- Success rate
- Average fetch time per property
- POI count per category
- Stale data percentage

### Logging
- API errors logged to console
- Batch progress logged
- Failed properties tracked

## Support

For issues or questions about Phase 2:
1. Check this documentation
2. Review API error messages
3. Verify API keys and quotas
4. Check Google Cloud Console logs

# Phase 3: User Preferences - Complete Documentation

## Overview

Phase 3 adds personalized property recommendations based on user lifestyle preferences. Users complete a questionnaire about their household, transportation, and daily priorities, and properties are scored and ranked accordingly.

## Features Implemented

### 1. User Preference Questionnaire (`app/preferences/page.tsx`)
- Multi-step questionnaire with progress tracking
- Three main question categories:
  - **Household composition** - Single, couple, young family, school-age family, or retired
  - **Transportation method** - Car, public transport, mixed, or walking/biking
  - **Lifestyle priorities** - Health, convenience, social life, nature (multi-select)
- Responsive UI with navigation (back/next buttons)
- Answer validation before proceeding
- Skip option to browse without personalization

### 2. Questionnaire Configuration (`lib/questionnaire.ts`)
- Centralized question and option definitions
- Weight mapping for each answer choice
- `calculateWeightsFromAnswers()` - Converts user answers to category weights
- Support for both single and multi-select questions
- Bilingual support (Bulgarian and English labels)

### 3. Preferences API (`app/api/preferences/route.ts`)
- **POST /api/preferences** - Save user preference weights
- **GET /api/preferences?id=xxx** - Retrieve preferences by ID
- **GET /api/preferences?sessionId=xxx** - Retrieve by session ID
- Anonymous user support via session IDs
- JSON storage for flexible weight schemas

### 4. Property Scoring Service (`services/scoring.ts`)
- `calculatePropertyScore()` - Score properties from 0-100 based on weights
- Algorithm: `score = sum(weight × (1 - distance/maxDistance)) / sum(weights) × 100`
- Uses closest POI per category
- Handles missing POI categories gracefully
- `calculatePropertyScores()` - Batch scoring for multiple properties

### 5. Personalized Property Ranking (`app/properties/page.tsx`)
- Accepts `?preferenceId=xxx` query parameter
- Fetches user preferences and calculates scores
- Sorts properties by score (highest first)
- Displays score badges on property cards
- Personalization banner showing active preferences
- "Персонализирай" button when no preferences set
- Link to edit preferences

### 6. POI Filters (`components/PropertyFilters.tsx`)
- Collapsible filter panel with category checkboxes
- Four category groups:
  - **Основни** (Essential) - Grocery, pharmacy, hospital
  - **Транспорт** (Transport) - Bus stop, metro
  - **Семейство** (Family) - Kindergarten, school
  - **Начин на живот** (Lifestyle) - Park, gym, restaurant
- URL parameter-based filtering (`?pois=grocery,metro`)
- Filter count badge
- Clear all filters option
- Filters properties showing only those with selected POIs

## User Flow

### First-Time User Experience
1. User lands on home page
2. Clicks "Разгледай имоти" (Browse Properties)
3. Sees properties list with "⚙️ Персонализирай" button
4. Clicks button → Redirected to `/preferences`
5. Completes 3-question questionnaire
6. On submit → POST to `/api/preferences` → Saves weights
7. Redirected to `/properties?preferenceId=xxx`
8. Properties displayed sorted by match score
9. Each card shows score badge (e.g., "87% съвпадение")

### Returning User
- Can bookmark URL with `?preferenceId=xxx` to maintain preferences
- Can click "Промени предпочитания" to retake questionnaire
- Can use POI filters independently of personalization

### Using POI Filters
1. On properties page, click "🔍 Филтри по наблизо"
2. Select desired amenities (e.g., Metro, Grocery)
3. Properties automatically filtered to show only matches
4. Works with or without personalization active

## Questionnaire Logic

### Question 1: Household Composition
| Answer | Affects |
|--------|---------|
| Живея сам/сама | park +5 |
| Двойка без деца | restaurant +6 |
| Семейство с малки деца | kindergarten +10, school +5, park +8, pharmacy +8 |
| Семейство с ученици | school +10, park +6, busStop +7 |
| Пенсионери | hospital +9, pharmacy +9, park +7, busStop +8 |

### Question 2: Transportation
| Answer | Affects |
|--------|---------|
| С кола | busStop +2, metro +2 |
| С градски транспорт | busStop +10, metro +10, grocery +8 |
| Комбинирано | busStop +6, metro +6 |
| Пеша или с колело | busStop +4, metro +4, grocery +10, park +8 |

### Question 3: Lifestyle (Multi-select)
| Answer | Affects |
|--------|---------|
| Здравословен начин на живот | gym +8, park +8, hospital +7 |
| Удобство и бързина | grocery +10, pharmacy +8, metro +8 |
| Социален живот | restaurant +7, park +6 |
| Близост до природа | park +10 |

### Default Weights
If no preferences are set, properties use these defaults:
- grocery: 5, pharmacy: 5, hospital: 5
- kindergarten: 5, school: 5
- busStop: 5, metro: 5
- park: 5, gym: 3, restaurant: 3

## Scoring Algorithm

```typescript
// For each property:
score = (sum of category scores) / (sum of weights) × 100

// Where each category score is:
categoryScore = weight × (1 - distance/maxDistance)

// Example:
// User weights: { grocery: 10, metro: 8, park: 5 }
// Property POIs:
//   - Grocery 200m away (maxDistance: 1000m)
//   - Metro 300m away (maxDistance: 1500m)
//   - Park 800m away (maxDistance: 1000m)
//
// Calculations:
//   grocery: 10 × (1 - 200/1000) = 10 × 0.8 = 8.0
//   metro:    8 × (1 - 300/1500) = 8 × 0.8 = 6.4
//   park:     5 × (1 - 800/1000) = 5 × 0.2 = 1.0
//
// Total: (8.0 + 6.4 + 1.0) / (10 + 8 + 5) × 100 = 67%
```

## API Reference

### POST /api/preferences
Save user preference weights.

**Request:**
```json
{
  "categoryWeights": {
    "grocery": 10,
    "metro": 8,
    "kindergarten": 10,
    "hospital": 5
  },
  "userId": "optional-user-id",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "id": "cm4abc123xyz",
  "sessionId": "generated-uuid",
  "message": "Preferences saved successfully"
}
```

### GET /api/preferences?id=xxx
Retrieve preferences by ID.

**Response:**
```json
{
  "id": "cm4abc123xyz",
  "userId": null,
  "sessionId": "generated-uuid",
  "categoryWeights": {
    "grocery": 10,
    "metro": 8
  },
  "maxCommuteMinutes": null,
  "commuteToAddress": null,
  "commuteToLat": null,
  "commuteToLng": null,
  "createdAt": "2024-12-17T22:00:00.000Z",
  "updatedAt": "2024-12-17T22:00:00.000Z"
}
```

## Database Schema

No changes to schema required - uses existing `UserPreference` model:

```prisma
model UserPreference {
  id        String   @id @default(cuid())
  userId    String?
  sessionId String?

  categoryWeights Json @default("{}")

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

## File Structure

```
app/
  preferences/
    page.tsx              # Multi-step questionnaire UI
  properties/
    page.tsx              # Updated with scoring and filters
  api/
    preferences/
      route.ts            # POST/GET endpoints

lib/
  questionnaire.ts        # Question config and weight calculation

services/
  scoring.ts              # Property scoring algorithm (from Phase 1)

components/
  PropertyFilters.tsx     # POI filter UI

docs/
  PHASE_3_USER_PREFERENCES.md  # This file
```

## Usage

### 1. Complete Questionnaire
```bash
# Visit in browser
open http://localhost:3000/preferences

# Answer 3 questions
# Click "Намери имоти →"
# Redirects to /properties?preferenceId=xxx
```

### 2. View Personalized Results
```bash
# Properties are automatically scored and sorted
# Score badges show match percentage
# Banner indicates personalization is active
```

### 3. Filter by POI
```bash
# Click "🔍 Филтри по наблизо"
# Check desired amenities
# Properties filter in real-time
# URL updates: /properties?pois=grocery,metro
```

### 4. API Usage
```bash
# Save preferences programmatically
curl -X POST http://localhost:3000/api/preferences \
  -H "Content-Type: application/json" \
  -d '{"categoryWeights": {"grocery": 10, "metro": 8}}'

# Response: {"id": "cm4abc...", "sessionId": "uuid..."}

# Retrieve preferences
curl http://localhost:3000/api/preferences?id=cm4abc...
```

## Testing

### Test Questionnaire Flow
1. Navigate to `/preferences`
2. Verify progress bar updates (0% → 33% → 66% → 100%)
3. Test back button navigation
4. Try submitting without answering (should be disabled)
5. Select "Семейство с малки деца" → Should boost kindergarten/school weights
6. Select "С градски транспорт" → Should boost busStop/metro weights
7. Multi-select lifestyle options
8. Click "Намери имоти →"
9. Verify redirect to `/properties?preferenceId=xxx`

### Test Personalized Ranking
1. After completing questionnaire, check properties page
2. Verify banner shows "Резултатите са персонализирани"
3. Verify properties have score badges (e.g., "87% съвпадение")
4. Verify properties are sorted by score (highest first)
5. Check that properties with better POI matches rank higher
6. Click "Промени предпочитания" → Should go back to questionnaire

### Test POI Filters
1. Go to `/properties`
2. Click "🔍 Филтри по наблизо"
3. Select "Хранителен магазин" and "Метростанция"
4. Verify only properties with both POIs are shown
5. Check URL updates to include `?pois=grocery,metro`
6. Verify count badge shows "2"
7. Click "Изчисти всички" → All properties return
8. Test filter combinations
9. Test with personalization active → Should show scores AND filters

### Test API Endpoints
```bash
# Test save preferences
curl -X POST http://localhost:3000/api/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "categoryWeights": {
      "grocery": 10,
      "metro": 8,
      "park": 7
    }
  }'

# Should return: {"id": "...", "sessionId": "...", "message": "..."}

# Test retrieve by ID
PREF_ID="cm4abc123"
curl http://localhost:3000/api/preferences?id=$PREF_ID

# Test retrieve by session ID
SESSION_ID="uuid-here"
curl http://localhost:3000/api/preferences?sessionId=$SESSION_ID

# Test invalid ID (should return 404)
curl http://localhost:3000/api/preferences?id=invalid
```

## UI/UX Highlights

### Questionnaire Page
- Clean, modern gradient background
- Progress bar with percentage
- Large, clickable option cards
- Radio button indicators for single-select
- Multi-select notice for applicable questions
- Disabled next button until answer selected
- Skip option for users who prefer defaults

### Properties Page with Personalization
- Prominent score badges on property cards
- Color-coded badges (green background, white text)
- Informative banner explaining personalization
- Quick access to edit preferences
- Seamless integration with existing UI

### Filter Panel
- Collapsible to save space
- Organized into logical groups
- Clear visual feedback (checkboxes)
- Filter count badge
- Helpful footer note

## Performance Considerations

### Client-Side Scoring
- Scoring happens on server for initial page load
- No client-side recalculation needed
- Preferences fetched once per page load

### Filter Performance
- Filters applied to already-fetched property list
- No additional API calls needed
- URL-based state for browser back/forward support

### Caching
- Preferences stored in database (persistent)
- No expiration on preference records
- Future: Add TTL for anonymous user preferences

## Future Enhancements

### Phase 4+ Ideas
- [ ] Commute time calculator (use maxCommuteMinutes field)
- [ ] Edit preferences without retaking full questionnaire
- [ ] Save multiple preference profiles
- [ ] User authentication and saved preferences
- [ ] Advanced filters (price range, property type, rooms)
- [ ] Map view with score-based markers
- [ ] Email alerts for high-scoring new properties
- [ ] A/B testing different scoring algorithms
- [ ] Machine learning to refine weights based on user behavior
- [ ] "Properties like this" recommendations

### Questionnaire Improvements
- [ ] Add more questions (budget priorities, work location)
- [ ] Conditional questions based on previous answers
- [ ] Visual distance examples ("5 min walk = 400m")
- [ ] Preview of scoring impact before submitting
- [ ] Edit individual answers without restarting

### Scoring Improvements
- [ ] Time-of-day considerations (rush hour transit times)
- [ ] Seasonal adjustments (winter walking distances)
- [ ] Quality scores for POIs (ratings, reviews)
- [ ] Negative weights (avoid certain POI types)
- [ ] Composite scores (safety, noise, air quality)

## Known Limitations

1. **No authentication** - Preferences tied to session ID only
2. **No preference editing** - Must retake full questionnaire
3. **No preference history** - Can't compare different profiles
4. **Fixed questions** - Admin can't add questions via UI
5. **Single profile** - Can't save multiple profiles per user
6. **No validation** - Accepts any weight values via API
7. **No rate limiting** - API can be spammed

## Troubleshooting

### Questionnaire not redirecting
- Check browser console for API errors
- Verify `/api/preferences` endpoint is reachable
- Check that `categoryWeights` is being calculated correctly

### Scores not showing
- Verify `preferenceId` is in URL query parameters
- Check that properties have POI data (run `npm run fetch-pois`)
- Confirm category names match between questionnaire and POI_CATEGORIES

### Filters not working
- Check that POI category names match exactly
- Verify properties have the required POI categories
- Clear browser cache if stale data is showing

### API errors
- Check database connection
- Verify Prisma Client is generated (`npx prisma generate`)
- Check server logs for detailed error messages

## Compliance & Privacy

### Data Collection
- No personally identifiable information collected
- Session IDs are random UUIDs
- No cookies or tracking beyond session ID
- Preferences stored server-side only

### GDPR Considerations
- Anonymous users → No consent needed
- Authenticated users → Need consent for profile storage
- Right to deletion → Implement preference deletion endpoint
- Data portability → Provide preference export

## Support

For questions or issues about Phase 3:
1. Check this documentation
2. Review questionnaire configuration in `lib/questionnaire.ts`
3. Test scoring logic in `services/scoring.ts`
4. Check API logs for errors

## Summary

Phase 3 successfully implements:
✅ User preference questionnaire with 3 questions
✅ Dynamic weight calculation based on answers
✅ Property scoring algorithm (0-100)
✅ Personalized property ranking
✅ Score badges on property cards
✅ POI filters for manual refinement
✅ API endpoints for preferences
✅ Session-based anonymous user support

The system is ready for user testing and can be extended with additional features in future phases.

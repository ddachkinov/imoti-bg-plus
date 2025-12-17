# ImotiBG+ 🏠

Bulgarian Real Estate Portal with POI Proximity Data

## Project Status

**Current Phase**: Phase 1 - Foundation ✅
**Last Updated**: December 17, 2024

## What's Completed

- ✅ Next.js 15 with TypeScript and Tailwind CSS
- ✅ PostgreSQL database (`imoti_bg_plus`)
- ✅ Prisma ORM with complete schema
- ✅ Project structure (components, services, lib, types)
- ✅ Core files: Prisma client, POI categories, scoring algorithm

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

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (careful!)
npx prisma migrate reset
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

## Next Steps (Phase 1)

- [ ] Basic property CRUD API routes
- [ ] Simple property listing UI
- [ ] Manual property entry form
- [ ] Seed database with test data

## Documentation

See `CLAUDE_CODE_PROMPT.md` for complete project documentation.

## License

Private - All Rights Reserved

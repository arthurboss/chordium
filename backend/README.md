# Chordium Backend

This is the backend service for the Chordium application, providing API endpoints for searching and retrieving chord sheets.

## 🚀 Features

- Search for artists and songs
- Fetch artist songs
- Retrieve chord sheets
- Fallback mechanism from database to web scraping

## 🛠️ Tech Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Supabase** - Database
- **Puppeteer** - Web scraping
- **Jest** - Testing framework

## 🏗️ Project Structure

```
backend/
├── config/           # Configuration files
├── controllers/      # Request handlers
├── middleware/       # Express middleware
├── models/           # Database models
├── routes/           # API routes
├── services/         # Business logic
├── tests/            # Test files
└── utils/            # Utility functions
```

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (copy `.env.example` to `.env` and fill in your values)

3. Start the development server:
   ```bash
   npm run dev
   ```

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage
npm run test:coverage
```

## 🌐 API Endpoints

- `GET /api/artists?artist=<name>` - Search for artists
- `GET /api/cifraclub-search?artist=<name>&song=<title>` - Search CifraClub
- `GET /api/artist-songs?artistPath=<path>` - Get artist songs
- `GET /api/chord-sheet?url=<encoded-url>` - Get chord sheet

## 🔒 Environment Variables

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE` - Supabase service role key
- `NODE_ENV` - Environment (development/production)

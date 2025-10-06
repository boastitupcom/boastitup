# Review Scraper & AI Analysis System

Automated e-commerce review scraping and AI-powered sentiment analysis for BOAST IT UP.

## Quick Start

### 1. Install Dependencies

```bash
cd review-scraper
npm install
npx playwright install chromium
```

### 2. Run Complete Pipeline

```bash
npm run pipeline
```

This will:
1. ✅ Scrape reviews from Zalora
2. ✅ Analyze sentiment with Gemini AI
3. ✅ Generate insights report

### 3. Run Individual Steps

**Scrape only:**
```bash
npm run scrape [product-url]
```

**Analyze only:**
```bash
npm run analyze
```

**Generate insights:**
```bash
npm run insights
```

## Features

- 🕷️ Web scraping with Playwright
- 🤖 AI sentiment analysis (Gemini)
- 📊 Automated insights generation
- 💾 Supabase database storage
- 📈 Views for analytics

## Database Tables

- `reviews` - Individual customer reviews
- `scraped_products` - Product metadata
- `scraping_jobs` - Job tracking

## Environment Variables

Already configured in `.env`:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`

## Next Steps

1. Test the scraper
2. Schedule automated runs
3. Build dashboard for insights

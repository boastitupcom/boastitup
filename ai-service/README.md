# OKR AI Suggestion Service

AI-powered OKR suggestion service using Google Gemini for intelligent OKR recommendations.

## Setup

1. Install dependencies:
```bash
cd ai-service
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Add your Gemini API key and database connection string:
```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=your_supabase_database_url_here
PORT=3001
```

3. Start the service:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### POST /api/okr-suggestions
Generate AI-powered OKR suggestions based on brand context.

**Request:**
```json
{
  "industry": "technology",
  "brandName": "TechCorp",
  "tenantId": "uuid",
  "keyProduct": "SaaS Platform",
  "productCategory": "B2B SaaS",
  "keyCompetition": ["Competitor A", "Competitor B"],
  "majorKeywords": ["automation", "productivity"],
  "objective": "Increase user engagement",
  "historicalOKRs": ["Previous OKR 1", "Previous OKR 2"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": [...],
    "metadata": {
      "industry": "technology",
      "brandContext": "TechCorp - technology",
      "generatedAt": "2024-01-01T00:00:00Z",
      "confidence": 0.85
    }
  }
}
```

### GET /api/okr-suggestions/health
Check AI service health status.

### GET /health
General service health check.

## Architecture

- **Express.js** server with TypeScript
- **Google Gemini AI** for suggestion generation
- **PostgreSQL** database integration via Supabase
- **Zod** validation for request/response schemas
- **Rate limiting** and error handling
- **Health monitoring** and logging

## Development

The service integrates with your existing Next.js application and Supabase database to provide intelligent OKR suggestions based on:

- Industry context
- Brand information
- Historical performance data
- Competitive analysis
- Current business objectives

All suggestions follow the OKR best practices and are tailored to your specific business context.
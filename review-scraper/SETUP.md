# Complete Setup Guide

## ✅ What's Already Done

1. ✅ Database tables created in Supabase
2. ✅ Dependencies installed
3. ✅ Playwright browser installed
4. ✅ Environment variables configured
5. ✅ All source code ready

## 🔧 Final Setup Step

**Create analytics views in Supabase:**

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the SQL from `database/create-views.sql`
3. Click "Run"

## 🚀 Usage

### Quick Test
```bash
node test.js
```

### Full Pipeline (Recommended)
```bash
npm run pipeline
```
This runs:
1. Scrapes reviews from Zalora
2. Analyzes sentiment with Gemini AI
3. Generates insights report

### Individual Commands

**Scrape reviews:**
```bash
npm run scrape
# Or with custom URL:
npm run scrape "https://www.zalora.com.my/p/your-product-url.html"
```

**Analyze reviews:**
```bash
npm run analyze
```

**Generate insights:**
```bash
npm run insights
```

## 📊 What Gets Scraped

From each review:
- ⭐ Rating (1-5 stars)
- 📝 Review text
- 👤 Customer name
- 📅 Review date
- ✅ Verified purchase status
- 📏 Size purchased (if available)

## 🤖 AI Analysis

Gemini AI analyzes each review for:
- 😊 Sentiment (positive/negative/neutral)
- 🎯 Confidence score
- 🔑 Key themes (comfort, quality, value, etc.)
- 🏷️ Tags
- 📂 Categories

## 📈 Insights Generated

- Product summary with ratings
- Sentiment distribution
- Top themes mentioned
- Trends over time
- Key insights

## 🗂️ Database Structure

**Tables:**
- `reviews` - Individual reviews
- `scraped_products` - Product metadata
- `scraping_jobs` - Job tracking

**Views:**
- `v_product_review_summary` - Aggregated product stats
- `v_sentiment_trends` - Sentiment over time
- `v_top_themes` - Most mentioned themes

## 🔄 Automation

For scheduled scraping, add to cron (Linux/Mac):
```bash
# Run daily at 2 AM
0 2 * * * cd /path/to/review-scraper && npm run pipeline
```

Windows Task Scheduler:
- Action: Start Program
- Program: `node`
- Arguments: `src/pipeline.js`
- Start in: `E:\boastitup\review-scraper`

## 🐛 Troubleshooting

**"No reviews found"**
- Website structure may have changed
- Check CSS selectors in `src/scraper.js`

**AI analysis fails**
- Check GEMINI_API_KEY in `.env`
- Verify API quota limits

**Database errors**
- Verify Supabase credentials in `.env`
- Check RLS policies are enabled

## 📝 Example Output

```
🚀 Starting Review Analysis Pipeline
============================================================

📥 STEP 1: Scraping Reviews
------------------------------------------------------------
[scraper] INFO: Initializing browser...
[scraper] INFO: Browser ready
[scraper] INFO: Scraping: https://www.zalora.com.my/...
[scraper] INFO: Product: Women's Blue Sports Bra
[scraper] INFO: Found 15 reviews
✓ Scraped 15 reviews

🤖 STEP 2: AI Sentiment Analysis
------------------------------------------------------------
[ai-analyzer] INFO: Processing 15 reviews...
✓ Analyzed 15 reviews

📊 STEP 3: Generating Insights Report
------------------------------------------------------------
============================================================
REVIEW INSIGHTS REPORT
============================================================

📊 PRODUCT SUMMARY
Total Reviews: 15
Average Rating: 4.3/5
Positive: 12 | Negative: 2 | Neutral: 1

🔑 TOP THEMES
1. comfort: 10 mentions
2. quality: 8 mentions
3. fit: 7 mentions

✅ Pipeline completed successfully!
```

## 🎯 Next Steps

1. Run the pipeline on multiple products
2. Build dashboard to visualize insights
3. Set up automated daily scraping
4. Integrate with BOAST IT UP analytics

## 📞 Support

Check logs for detailed error messages.
All operations are logged with timestamps and status.

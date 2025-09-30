# Review Analysis Automation System

A comprehensive guide to building an automated system that scrapes customer reviews from e-commerce platforms, stores them in Supabase, and uses AI to analyze and classify reviews for actionable business insights.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Phase 1: Database Setup](#phase-1-database-setup)
4. [Phase 2: Web Scraping Implementation](#phase-2-web-scraping-implementation)
5. [Phase 3: AI Analysis Pipeline](#phase-3-ai-analysis-pipeline)
6. [Installation & Configuration](#installation--configuration)
7. [Production Considerations](#production-considerations)

---

## Architecture Overview

### System Components

```
E-commerce Platform (Zalora)
           ↓
    Web Scraping Engine (Playwright/Selenium)
           ↓
    Data Validation & Cleaning
           ↓
    Supabase Database Storage
           ↓
    AI Analysis Queue
           ↓
    Gemini/GPT Analysis Engine
           ↓
    Enriched Data Storage
           ↓
    Business Intelligence Dashboard
           ↓
    Actionable Insights & Reports
```

### Technology Stack

- **Web Scraping**: Node.js + Playwright OR Python + Selenium
- **Database**: Supabase (PostgreSQL with real-time features)
- **AI Processing**: OpenAI GPT-4 or Gemini API
- **Orchestration**: n8n or similar workflow tools (optional for production)

---

## Prerequisites

### 1. System Requirements

- Node.js 18+ OR Python 3.8+
- Chrome/Chromium browser installed
- Active internet connection
- 4GB+ RAM recommended

### 2. Required Accounts

- **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
- **OpenAI Account**: Get API key from [platform.openai.com](https://platform.openai.com)
- **Cloudinary** (optional): For image processing

### 3. Install Package Managers

**For Node.js approach:**
```bash
# Verify Node.js installation
node --version

# Install pnpm (if using this project's stack)
npm install -g pnpm
```

**For Python approach:**
```bash
# Verify Python installation
python --version

# Install pip (usually comes with Python)
pip --version
```

---

## Phase 1: Database Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: review-analysis (or your choice)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
4. Click **"Create new project"** and wait ~2 minutes for provisioning

### Step 2: Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy and paste the following schema:

```sql
-- Create reviews table
CREATE TABLE reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_url TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    customer_name TEXT,
    review_date TEXT,
    size_purchased TEXT,
    verified_purchase BOOLEAN DEFAULT false,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- AI Analysis fields
    ai_sentiment TEXT CHECK (ai_sentiment IN ('positive', 'negative', 'neutral')),
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    key_themes TEXT[],
    ai_tags TEXT[],
    ai_categories TEXT[],
    processed_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_sentiment ON reviews(ai_sentiment);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_processed ON reviews(processed_at);

-- Create products table (optional, for tracking products)
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id TEXT UNIQUE NOT NULL,
    product_name TEXT NOT NULL,
    product_url TEXT NOT NULL,
    overall_rating DECIMAL(3,2),
    total_reviews INTEGER DEFAULT 0,
    last_scraped_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create brand_mentions table (for tracking brand mentions in reviews)
CREATE TABLE brand_mentions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    brand_name TEXT NOT NULL,
    mention_context TEXT,
    sentiment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) - Important for production
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_mentions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust for production)
CREATE POLICY "Enable all operations for service role" ON reviews
    FOR ALL USING (true);

CREATE POLICY "Enable all operations for service role" ON products
    FOR ALL USING (true);

CREATE POLICY "Enable all operations for service role" ON brand_mentions
    FOR ALL USING (true);
```

4. Click **"Run"** to execute the schema

### Step 3: Get Supabase Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: Long string starting with `eyJ...`
   - **service_role key**: (Use with caution - for backend only)

---

## Phase 2: Web Scraping Implementation

You have two options: Node.js with Playwright OR Python with Selenium. Choose based on your preference.

### Option A: Node.js with Playwright (Recommended)

#### Step 1: Setup Project Structure

```bash
# Create project directory
mkdir review-scraper
cd review-scraper

# Initialize npm project
npm init -y

# Install dependencies
npm install playwright @supabase/supabase-js dotenv
```

#### Step 2: Install Playwright Browser

```bash
npx playwright install chromium
```

#### Step 3: Create Environment File

Create `.env` file in project root:

```env
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-api-key
```

#### Step 4: Create Scraper Script

Create `scraper.js`:

```javascript
// scraper.js
const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

class ZaloraScraper {
    constructor(supabaseUrl, supabaseKey) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.browser = null;
        this.page = null;
    }

    async initialize() {
        this.browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();

        // Set realistic user agent and viewport
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        await this.page.setViewportSize({ width: 1366, height: 768 });
    }

    async scrapeProductReviews(productUrl) {
        try {
            await this.page.goto(productUrl, { waitUntil: 'networkidle' });

            // Wait for reviews section to load
            await this.page.waitForSelector('[data-testid="reviews-section"]', { timeout: 10000 });

            // Extract overall rating
            const overallRating = await this.page.$eval('.rating-average', el =>
                parseFloat(el.textContent.trim())
            );

            // Extract individual reviews
            const reviews = await this.page.$$eval('.review-item', (elements) => {
                return elements.map(el => {
                    const rating = el.querySelector('.review-rating')?.textContent?.match(/\d+/)?.[0];
                    const reviewText = el.querySelector('.review-text')?.textContent?.trim();
                    const customerName = el.querySelector('.customer-name')?.textContent?.trim();
                    const reviewDate = el.querySelector('.review-date')?.textContent?.trim();
                    const size = el.querySelector('.size-info')?.textContent?.trim();

                    return {
                        rating: rating ? parseInt(rating) : null,
                        review_text: reviewText,
                        customer_name: customerName,
                        review_date: reviewDate,
                        size_purchased: size,
                        verified_purchase: el.querySelector('.verified-badge') ? true : false
                    };
                });
            });

            // Extract product information
            const productName = await this.page.$eval('.product-title', el => el.textContent.trim());
            const productId = productUrl.split('/').pop().split('-').pop();

            // Store reviews in database
            for (const review of reviews) {
                if (review.review_text) {
                    await this.storeReview({
                        product_id: productId,
                        product_name: productName,
                        product_url: productUrl,
                        ...review
                    });
                }
            }

            return reviews;
        } catch (error) {
            console.error('Scraping error:', error);
            throw error;
        }
    }

    async storeReview(reviewData) {
        try {
            const { data, error } = await this.supabase
                .from('reviews')
                .insert([reviewData])
                .select();

            if (error) throw error;

            console.log('Review stored:', data[0].id);
            return data;
        } catch (error) {
            console.error('Database error:', error);
            throw error;
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Usage example
async function main() {
    const scraper = new ZaloraScraper(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    );

    try {
        await scraper.initialize();
        const productUrl = 'https://www.zalora.com.my/p/fitleasure-women-s-blue-tie-n-dye-printed-running-training-sports-bra-blue-3078170';
        const reviews = await scraper.scrapeProductReviews(productUrl);
        console.log(`Scraped ${reviews.length} reviews`);
    } finally {
        await scraper.close();
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { ZaloraScraper };
```

#### Step 5: Run the Scraper

```bash
node scraper.js
```

### Option B: Python with Selenium

#### Step 1: Setup Project

```bash
# Create project directory
mkdir review-scraper-python
cd review-scraper-python

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install selenium supabase openai python-dotenv
```

#### Step 2: Download ChromeDriver

1. Check your Chrome version: `chrome://version/`
2. Download matching ChromeDriver from [chromedriver.chromium.org](https://chromedriver.chromium.org/)
3. Extract and place in project directory or add to PATH

#### Step 3: Create Environment File

Create `.env` file:

```env
SUPABASE_URL=your-supabase-project-url
SUPABASE_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-api-key
```

#### Step 4: Create Scraper Script

Create `scraper.py`:

```python
# scraper.py
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time
from datetime import datetime
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

class ZaloraScraper:
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase: Client = create_client(supabase_url, supabase_key)
        self.driver = None

    def initialize_driver(self):
        """Initialize Chrome driver with appropriate options"""
        options = Options()
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)

        self.driver = webdriver.Chrome(options=options)
        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

    def scrape_reviews(self, product_url: str) -> list:
        """Scrape reviews from a Zalora product page"""
        try:
            self.driver.get(product_url)

            # Wait for page to load
            wait = WebDriverWait(self.driver, 10)
            wait.until(EC.presence_of_element_located((By.CLASS_NAME, "product-title")))

            # Extract product information
            product_name = self.driver.find_element(By.CLASS_NAME, "product-title").text.strip()
            product_id = product_url.split('/')[-1].split('-')[-1]

            # Scroll to reviews section
            reviews_section = self.driver.find_element(By.CSS_SELECTOR, "[data-testid='reviews-section']")
            self.driver.execute_script("arguments[0].scrollIntoView();", reviews_section)
            time.sleep(2)

            # Extract reviews
            review_elements = self.driver.find_elements(By.CLASS_NAME, "review-item")
            reviews = []

            for element in review_elements:
                try:
                    rating_element = element.find_element(By.CLASS_NAME, "review-rating")
                    rating = int(rating_element.get_attribute("data-rating"))

                    review_text = element.find_element(By.CLASS_NAME, "review-text").text.strip()
                    customer_name = element.find_element(By.CLASS_NAME, "customer-name").text.strip()
                    review_date = element.find_element(By.CLASS_NAME, "review-date").text.strip()

                    # Optional fields
                    try:
                        size = element.find_element(By.CLASS_NAME, "size-info").text.strip()
                    except:
                        size = None

                    verified = len(element.find_elements(By.CLASS_NAME, "verified-badge")) > 0

                    review_data = {
                        'product_id': product_id,
                        'product_name': product_name,
                        'product_url': product_url,
                        'rating': rating,
                        'review_text': review_text,
                        'customer_name': customer_name,
                        'review_date': review_date,
                        'size_purchased': size,
                        'verified_purchase': verified,
                        'scraped_at': datetime.now().isoformat()
                    }

                    reviews.append(review_data)
                except Exception as e:
                    print(f"Error extracting review: {e}")
                    continue

            # Store reviews in database
            for review in reviews:
                self.store_review(review)

            return reviews

        except Exception as e:
            print(f"Scraping error: {e}")
            return []

    def store_review(self, review_data: dict):
        """Store review in Supabase database"""
        try:
            result = self.supabase.table('reviews').insert(review_data).execute()
            print(f"Stored review: {result.data[0]['id']}")
            return result.data
        except Exception as e:
            print(f"Database error: {e}")

    def close(self):
        """Close the browser driver"""
        if self.driver:
            self.driver.quit()

# Usage
if __name__ == "__main__":
    scraper = ZaloraScraper(
        supabase_url=os.getenv("SUPABASE_URL"),
        supabase_key=os.getenv("SUPABASE_KEY")
    )

    try:
        scraper.initialize_driver()
        product_url = "https://www.zalora.com.my/p/fitleasure-women-s-blue-tie-n-dye-printed-running-training-sports-bra-blue-3078170"
        reviews = scraper.scrape_reviews(product_url)
        print(f"Successfully scraped {len(reviews)} reviews")
    finally:
        scraper.close()
```

#### Step 5: Run the Scraper

```bash
python scraper.py
```

---

## Phase 3: AI Analysis Pipeline

### Step 1: Create AI Analyzer Script

**For Python (recommended for AI analysis):**

Create `ai_analyzer.py`:

```python
# ai_analyzer.py
import openai
from supabase import create_client, Client
import json
from typing import Dict
import os
from dotenv import load_dotenv

load_dotenv()

class ReviewAnalyzer:
    def __init__(self, openai_api_key: str, supabase_url: str, supabase_key: str):
        self.client = openai.OpenAI(api_key=openai_api_key)
        self.supabase: Client = create_client(supabase_url, supabase_key)

    def analyze_sentiment(self, review_text: str) -> Dict:
        """Analyze sentiment using GPT-4"""
        system_prompt = """You are an expert sentiment analyzer for e-commerce product reviews.
        Analyze the given review and provide:
        1. Overall sentiment (positive, negative, or neutral)
        2. Confidence score (0.0 to 1.0)
        3. Key themes mentioned
        4. Relevant tags for categorization
        5. Product aspect categories (quality, fit, comfort, value, etc.)

        Return the analysis in JSON format."""

        user_prompt = f"""Analyze this product review:
        "{review_text}"

        Provide analysis in this JSON format:
        {{
            "sentiment": "positive|negative|neutral",
            "confidence_score": 0.95,
            "key_themes": ["comfort", "quality", "value"],
            "tags": ["comfortable", "good quality", "worth the price"],
            "categories": ["comfort", "quality", "value_for_money"]
        }}"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=500,
                temperature=0.1
            )

            analysis = json.loads(response.choices[0].message.content)
            return analysis

        except Exception as e:
            print(f"AI analysis error: {e}")
            return {
                "sentiment": "neutral",
                "confidence_score": 0.0,
                "key_themes": [],
                "tags": [],
                "categories": []
            }

    def process_unanalyzed_reviews(self):
        """Process all reviews that haven't been analyzed yet"""
        # Get unprocessed reviews
        result = self.supabase.table('reviews') \
            .select('*') \
            .is_('ai_sentiment', 'null') \
            .limit(100) \
            .execute()

        reviews = result.data
        processed_count = 0

        for review in reviews:
            try:
                # Analyze the review
                analysis = self.analyze_sentiment(review['review_text'])

                # Update the review with AI analysis
                update_data = {
                    'ai_sentiment': analysis['sentiment'],
                    'confidence_score': analysis['confidence_score'],
                    'key_themes': analysis['key_themes'],
                    'ai_tags': analysis['tags'],
                    'ai_categories': analysis['categories'],
                    'processed_at': datetime.now().isoformat()
                }

                self.supabase.table('reviews') \
                    .update(update_data) \
                    .eq('id', review['id']) \
                    .execute()

                processed_count += 1
                print(f"Processed review {review['id']}: {analysis['sentiment']}")

            except Exception as e:
                print(f"Error processing review {review['id']}: {e}")
                continue

        return processed_count

    def generate_insights_report(self, product_id: str = None) -> Dict:
        """Generate insights report for all reviews or specific product"""
        query = self.supabase.table('reviews').select('*')

        if product_id:
            query = query.eq('product_id', product_id)

        result = query.execute()
        reviews = result.data

        if not reviews:
            return {"error": "No reviews found"}

        # Calculate metrics
        total_reviews = len(reviews)
        sentiment_distribution = {}
        rating_distribution = {}
        theme_frequency = {}

        for review in reviews:
            # Sentiment distribution
            sentiment = review.get('ai_sentiment', 'unknown')
            sentiment_distribution[sentiment] = sentiment_distribution.get(sentiment, 0) + 1

            # Rating distribution
            rating = review.get('rating')
            if rating:
                rating_distribution[rating] = rating_distribution.get(rating, 0) + 1

            # Theme frequency
            themes = review.get('key_themes', [])
            if themes:
                for theme in themes:
                    theme_frequency[theme] = theme_frequency.get(theme, 0) + 1

        # Calculate percentages
        for sentiment in sentiment_distribution:
            sentiment_distribution[sentiment] = {
                'count': sentiment_distribution[sentiment],
                'percentage': round((sentiment_distribution[sentiment] / total_reviews) * 100, 2)
            }

        return {
            'total_reviews': total_reviews,
            'sentiment_distribution': sentiment_distribution,
            'rating_distribution': rating_distribution,
            'top_themes': sorted(theme_frequency.items(), key=lambda x: x[1], reverse=True)[:10],
            'average_rating': sum(r.get('rating', 0) for r in reviews) / len([r for r in reviews if r.get('rating')]),
            'processed_reviews': len([r for r in reviews if r.get('ai_sentiment')])
        }

# Usage example
if __name__ == "__main__":
    from datetime import datetime

    analyzer = ReviewAnalyzer(
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        supabase_url=os.getenv("SUPABASE_URL"),
        supabase_key=os.getenv("SUPABASE_KEY")
    )

    # Process unanalyzed reviews
    processed = analyzer.process_unanalyzed_reviews()
    print(f"\nProcessed {processed} reviews")

    # Generate insights report
    insights = analyzer.generate_insights_report()
    print("\n=== INSIGHTS REPORT ===")
    print(json.dumps(insights, indent=2))
```

### Step 2: Install Additional Dependencies

```bash
pip install openai
```

### Step 3: Run AI Analysis

```bash
python ai_analyzer.py
```

---

## Installation & Configuration

### Complete Setup Checklist

#### 1. Environment Setup

Create `.env` file with all credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxxxxxxxx  # For admin operations

# OpenAI Configuration
OPENAI_API_KEY=sk-xxxxxxxxxxxxx

# Optional: For other AI providers
GEMINI_API_KEY=your-gemini-key
```

#### 2. Project Structure

Your final project should look like:

```
review-scraper/
├── .env
├── .gitignore
├── package.json (or requirements.txt)
├── scraper.js (or scraper.py)
├── ai_analyzer.py
├── README.md
└── node_modules/ (or venv/)
```

#### 3. Create .gitignore

```gitignore
# Environment variables
.env
.env.local

# Dependencies
node_modules/
venv/
__pycache__/

# Browser data
.playwright/
chromedriver
```

---

## Production Considerations

### 1. Respectful Scraping Practices

**Important: Always comply with website Terms of Service**

```javascript
// Add delays between requests
async function scrapeManyProducts(urls) {
    for (const url of urls) {
        await scraper.scrapeProductReviews(url);

        // Wait 2-5 seconds between requests
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    }
}
```

### 2. Error Handling & Retry Logic

```javascript
async function scrapeWithRetry(url, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await scraper.scrapeProductReviews(url);
        } catch (error) {
            console.log(`Attempt ${i + 1} failed: ${error.message}`);
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 5000 * (i + 1)));
        }
    }
}
```

### 3. Data Deduplication

Add unique constraint in SQL:

```sql
-- Prevent duplicate reviews
ALTER TABLE reviews ADD CONSTRAINT unique_review
    UNIQUE (product_id, customer_name, review_text, review_date);
```

### 4. Scheduled Automation

**Using cron (Linux/Mac):**

```bash
# Edit crontab
crontab -e

# Run scraper daily at 2 AM
0 2 * * * cd /path/to/review-scraper && node scraper.js >> scraper.log 2>&1

# Run AI analysis every 6 hours
0 */6 * * * cd /path/to/review-scraper && python ai_analyzer.py >> analyzer.log 2>&1
```

**Using Windows Task Scheduler:**

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., Daily at 2:00 AM)
4. Action: Start a program
5. Program: `node` or `python`
6. Arguments: `scraper.js` or `ai_analyzer.py`
7. Start in: Your project directory

### 5. Monitoring & Logging

Add comprehensive logging:

```javascript
const fs = require('fs');

function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${level}: ${message}\n`;

    console.log(logMessage);
    fs.appendFileSync('scraper.log', logMessage);
}
```

### 6. Rate Limiting for AI API

```python
import time

class RateLimiter:
    def __init__(self, calls_per_minute=60):
        self.calls_per_minute = calls_per_minute
        self.calls = []

    def wait_if_needed(self):
        now = time.time()
        # Remove calls older than 1 minute
        self.calls = [c for c in self.calls if now - c < 60]

        if len(self.calls) >= self.calls_per_minute:
            sleep_time = 60 - (now - self.calls[0])
            time.sleep(sleep_time)

        self.calls.append(time.time())
```

### 7. Cost Optimization

**For OpenAI API:**
- Use `gpt-4o-mini` instead of `gpt-4` for cost savings
- Batch process reviews instead of real-time
- Cache repeated analyses
- Set max_tokens limits

**Estimated Costs:**
- GPT-4o-mini: ~$0.15 per 1M input tokens
- 1000 reviews ≈ 500K tokens ≈ $0.08

---

## Troubleshooting

### Common Issues

#### 1. Scraper Not Finding Elements

**Solution:** Website structure may have changed. Inspect the page and update selectors:

```javascript
// Open browser in non-headless mode to debug
this.browser = await chromium.launch({ headless: false });
```

#### 2. Supabase Connection Errors

**Solution:** Check your credentials and network:

```bash
# Test connection
curl https://your-project.supabase.co/rest/v1/reviews \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"
```

#### 3. AI Analysis Timeout

**Solution:** Reduce batch size or increase timeout:

```python
result = self.supabase.table('reviews') \
    .select('*') \
    .is_('ai_sentiment', 'null') \
    .limit(10) \  # Reduce from 100 to 10
    .execute()
```

---

## Next Steps

1. **Create Dashboard**: Build a frontend to visualize insights
2. **Expand Coverage**: Add support for multiple e-commerce platforms
3. **Advanced Analytics**: Implement trend detection, competitor analysis
4. **Alerting**: Set up notifications for negative reviews
5. **API Layer**: Create REST API for accessing insights

---

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use Row Level Security (RLS)** in Supabase for production
3. **Rotate API keys** regularly
4. **Use service role key only in backend** (never expose to client)
5. **Implement rate limiting** to prevent abuse
6. **Validate all scraped data** before storing
7. **Encrypt sensitive data** at rest

---

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Selenium Documentation](https://www.selenium.dev/documentation/)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Web Scraping Best Practices](https://www.scrapehero.com/web-scraping-best-practices/)

---

## License & Legal Notice

**Important:** This system is for educational purposes. Always:
- Review and comply with website Terms of Service
- Respect robots.txt directives
- Implement rate limiting
- Don't overwhelm servers
- Consider using official APIs when available

---

## Support

For issues or questions:
1. Check troubleshooting section
2. Review documentation links
3. Inspect browser console for errors
4. Check Supabase logs in dashboard
5. Verify API quotas haven't been exceeded
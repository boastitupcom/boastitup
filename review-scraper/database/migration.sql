-- Review Scraping System Database Migration
-- Created: 2025-10-03
-- Purpose: Add tables for e-commerce review scraping and AI analysis

-- ============================================================================
-- 1. CREATE REVIEWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS reviews (
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
    ai_sentiment TEXT CHECK (ai_sentiment IN ('positive', 'negative', 'neutral')),
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    key_themes TEXT[],
    ai_tags TEXT[],
    ai_categories TEXT[],
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_sentiment ON reviews(ai_sentiment);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_processed ON reviews(processed_at);

-- ============================================================================
-- 2. CREATE SCRAPED_PRODUCTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS scraped_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id TEXT UNIQUE NOT NULL,
    product_name TEXT NOT NULL,
    product_url TEXT NOT NULL,
    platform TEXT DEFAULT 'zalora',
    overall_rating DECIMAL(3,2),
    total_reviews INTEGER DEFAULT 0,
    last_scraped_at TIMESTAMP WITH TIME ZONE,
    category TEXT,
    brand TEXT,
    price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scraped_products_product_id ON scraped_products(product_id);

-- ============================================================================
-- 3. CREATE SCRAPING_JOBS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS scraping_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_url TEXT NOT NULL,
    platform TEXT DEFAULT 'zalora',
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')) DEFAULT 'pending',
    reviews_scraped INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);

-- ============================================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access" ON reviews;
CREATE POLICY "Enable all access" ON reviews FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access" ON scraped_products;
CREATE POLICY "Enable all access" ON scraped_products FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all access" ON scraping_jobs;
CREATE POLICY "Enable all access" ON scraping_jobs FOR ALL USING (true);

-- ============================================================================
-- 5. CREATE VIEWS
-- ============================================================================
CREATE OR REPLACE VIEW v_product_review_summary AS
SELECT
    p.product_id,
    p.product_name,
    p.brand,
    COUNT(r.id) as total_reviews,
    AVG(r.rating) as average_rating,
    COUNT(CASE WHEN r.ai_sentiment = 'positive' THEN 1 END) as positive_reviews,
    COUNT(CASE WHEN r.ai_sentiment = 'negative' THEN 1 END) as negative_reviews
FROM scraped_products p
LEFT JOIN reviews r ON p.product_id = r.product_id
GROUP BY p.id, p.product_id, p.product_name, p.brand;

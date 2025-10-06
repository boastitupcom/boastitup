-- Create analytics views (Run this in Supabase SQL Editor)

CREATE OR REPLACE VIEW v_product_review_summary AS
SELECT
    p.product_id,
    p.product_name,
    p.brand,
    COUNT(r.id) as total_reviews,
    AVG(r.rating) as average_rating,
    COUNT(CASE WHEN r.ai_sentiment = 'positive' THEN 1 END) as positive_reviews,
    COUNT(CASE WHEN r.ai_sentiment = 'negative' THEN 1 END) as negative_reviews,
    COUNT(CASE WHEN r.ai_sentiment = 'neutral' THEN 1 END) as neutral_reviews
FROM scraped_products p
LEFT JOIN reviews r ON p.product_id = r.product_id
GROUP BY p.id, p.product_id, p.product_name, p.brand;

CREATE OR REPLACE VIEW v_sentiment_trends AS
SELECT
    DATE(scraped_at) as review_date,
    ai_sentiment,
    COUNT(*) as review_count,
    AVG(rating) as avg_rating
FROM reviews
WHERE ai_sentiment IS NOT NULL
GROUP BY DATE(scraped_at), ai_sentiment
ORDER BY review_date DESC;

CREATE OR REPLACE VIEW v_top_themes AS
SELECT
    UNNEST(key_themes) as theme,
    COUNT(*) as mention_count,
    AVG(rating) as avg_rating,
    COUNT(CASE WHEN ai_sentiment = 'positive' THEN 1 END) as positive_mentions,
    COUNT(CASE WHEN ai_sentiment = 'negative' THEN 1 END) as negative_mentions
FROM reviews
WHERE key_themes IS NOT NULL AND array_length(key_themes, 1) > 0
GROUP BY UNNEST(key_themes)
ORDER BY mention_count DESC
LIMIT 50;

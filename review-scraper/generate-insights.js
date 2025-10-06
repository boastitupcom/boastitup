import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

console.log('\n📊 REVIEW INSIGHTS REPORT\n');
console.log('═══════════════════════════════════════\n');

// Get all reviews
const { data: reviews } = await supabase
    .from('product_reviews')
    .select('*');

if (!reviews || reviews.length === 0) {
    console.log('No reviews found');
    process.exit(0);
}

const total = reviews.length;
const processed = reviews.filter(r => r.ai_sentiment).length;

console.log(`📈 OVERVIEW`);
console.log(`─────────────────────────────────────────`);
console.log(`Total Reviews: ${total}`);
console.log(`Processed: ${processed} (${(processed/total*100).toFixed(0)}%)`);
console.log(`Platforms: ${[...new Set(reviews.map(r => r.platform))].join(', ')}`);
console.log('');

// Sentiment distribution
const sentiments = { positive: 0, negative: 0, neutral: 0 };
reviews.forEach(r => {
    if (r.ai_sentiment) sentiments[r.ai_sentiment]++;
});

console.log(`😊 SENTIMENT ANALYSIS`);
console.log(`─────────────────────────────────────────`);
console.log(`Positive: ${sentiments.positive} (${(sentiments.positive/processed*100).toFixed(1)}%)`);
console.log(`Negative: ${sentiments.negative} (${(sentiments.negative/processed*100).toFixed(1)}%)`);
console.log(`Neutral: ${sentiments.neutral} (${(sentiments.neutral/processed*100).toFixed(1)}%)`);
console.log('');

// Rating distribution
const ratings = {};
reviews.forEach(r => {
    if (r.rating) {
        ratings[r.rating] = (ratings[r.rating] || 0) + 1;
    }
});

console.log(`⭐ RATING BREAKDOWN`);
console.log(`─────────────────────────────────────────`);
for (let i = 5; i >= 1; i--) {
    const count = ratings[i] || 0;
    const bar = '█'.repeat(Math.round(count / total * 20));
    console.log(`${i} stars: ${bar} ${count} (${(count/total*100).toFixed(1)}%)`);
}

const avgRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / total;
console.log(`\nAverage Rating: ${avgRating.toFixed(2)}/5`);
console.log('');

// Top themes
const themes = {};
reviews.forEach(r => {
    if (r.key_themes) {
        r.key_themes.forEach(theme => {
            themes[theme] = (themes[theme] || 0) + 1;
        });
    }
});

const sortedThemes = Object.entries(themes).sort((a, b) => b[1] - a[1]);

console.log(`🔑 TOP THEMES`);
console.log(`─────────────────────────────────────────`);
sortedThemes.slice(0, 10).forEach(([theme, count], i) => {
    console.log(`${i + 1}. ${theme}: ${count} mentions`);
});
console.log('');

// Product breakdown
const productStats = {};
reviews.forEach(r => {
    if (!productStats[r.product_id]) {
        productStats[r.product_id] = {
            count: 0,
            positive: 0,
            negative: 0,
            neutral: 0,
            totalRating: 0
        };
    }
    const stats = productStats[r.product_id];
    stats.count++;
    if (r.ai_sentiment) stats[r.ai_sentiment]++;
    if (r.rating) stats.totalRating += r.rating;
});

console.log(`📦 PRODUCT BREAKDOWN`);
console.log(`─────────────────────────────────────────`);

// Get product names
const productIds = Object.keys(productStats);
for (const productId of productIds) {
    const { data: product } = await supabase
        .from('brand_products')
        .select('name, sku')
        .eq('id', productId)
        .single();

    const stats = productStats[productId];
    const avgRating = (stats.totalRating / stats.count).toFixed(1);

    console.log(`\n${product?.name || 'Unknown'} (${product?.sku || 'N/A'})`);
    console.log(`  Reviews: ${stats.count}`);
    console.log(`  Avg Rating: ${avgRating}/5`);
    console.log(`  Sentiment: +${stats.positive} / -${stats.negative} / =${stats.neutral}`);
}

console.log('\n═══════════════════════════════════════\n');
console.log('✅ Analysis complete!\n');

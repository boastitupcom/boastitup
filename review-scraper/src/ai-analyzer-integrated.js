// AI Analysis using Gemini - Integrated with existing product_reviews table
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { createLogger } from './logger.js';

dotenv.config();
const logger = createLogger('ai-analyzer');

class ReviewAnalyzer {
    constructor() {
        this.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    }

    async analyzeSentiment(reviewText) {
        const prompt = `Analyze this product review and return ONLY a JSON object:

Review: "${reviewText}"

Return this exact format:
{
  "sentiment": "positive|negative|neutral",
  "confidence_score": 0.95,
  "key_themes": ["comfort", "quality", "value"],
  "tags": ["comfortable", "good quality"],
  "categories": ["comfort", "quality", "value_for_money"]
}`;

        try {
            const result = await this.model.generateContent(prompt);
            const text = result.response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON in response');

            const analysis = JSON.parse(jsonMatch[0]);
            return {
                sentiment: analysis.sentiment || 'neutral',
                confidence_score: analysis.confidence_score || 0.5,
                key_themes: analysis.key_themes || [],
                tags: analysis.tags || [],
                categories: analysis.categories || []
            };
        } catch (error) {
            logger.error('AI analysis failed:', error.message);
            return {
                sentiment: 'neutral',
                confidence_score: 0.0,
                key_themes: [],
                tags: [],
                categories: []
            };
        }
    }

    async processUnanalyzedReviews(limit = 50) {
        // Get unprocessed reviews from product_reviews table
        const { data: reviews, error } = await this.supabase
            .from('product_reviews')
            .select('*')
            .is('ai_sentiment', null)
            .limit(limit);

        if (error) {
            logger.error('Error fetching reviews:', error);
            return 0;
        }

        if (!reviews || reviews.length === 0) {
            logger.info('No unanalyzed reviews found');
            return 0;
        }

        logger.info(`Processing ${reviews.length} reviews...`);
        let processed = 0;

        for (const review of reviews) {
            try {
                // Analyze the review
                const analysis = await this.analyzeSentiment(review.review_text);

                // Update the review with AI analysis
                const updateData = {
                    ai_sentiment: analysis.sentiment,
                    confidence_score: analysis.confidence_score,
                    key_themes: analysis.key_themes,
                    ai_tags: analysis.tags,
                    ai_categories: analysis.categories,
                    processed_at: new Date().toISOString()
                };

                const { error: updateError } = await this.supabase
                    .from('product_reviews')
                    .update(updateData)
                    .eq('id', review.id);

                if (updateError) {
                    logger.error(`Update failed for review ${review.id}:`, updateError);
                    continue;
                }

                processed++;
                logger.info(`✓ Analyzed ${processed}/${reviews.length}: ${analysis.sentiment} (${(analysis.confidence_score * 100).toFixed(0)}% confident)`);

                // Rate limiting - Gemini free tier: 5 requests per minute
                await new Promise(resolve => setTimeout(resolve, 12000)); // 12 seconds between requests

            } catch (error) {
                logger.error(`Error processing review ${review.id}:`, error.message);
            }
        }

        logger.info(`\n✓ Processed ${processed}/${reviews.length} reviews successfully`);
        return processed;
    }

    async generateInsightsReport(productId = null, brandId = null) {
        let query = this.supabase.from('product_reviews').select('*');

        if (productId) query = query.eq('product_id', productId);
        if (brandId) query = query.eq('brand_id', brandId);

        const { data: reviews } = await query;
        if (!reviews || reviews.length === 0) return { error: 'No reviews found' };

        const total = reviews.length;
        const sentiments = { positive: 0, negative: 0, neutral: 0 };
        const themes = {};
        const ratings = [];

        reviews.forEach(r => {
            if (r.ai_sentiment) sentiments[r.ai_sentiment]++;
            if (r.rating) ratings.push(r.rating);
            if (r.key_themes) {
                r.key_themes.forEach(theme => {
                    themes[theme] = (themes[theme] || 0) + 1;
                });
            }
        });

        return {
            total_reviews: total,
            sentiment_distribution: {
                positive: { count: sentiments.positive, percentage: (sentiments.positive / total * 100).toFixed(2) },
                negative: { count: sentiments.negative, percentage: (sentiments.negative / total * 100).toFixed(2) },
                neutral: { count: sentiments.neutral, percentage: (sentiments.neutral / total * 100).toFixed(2) }
            },
            top_themes: Object.entries(themes).sort((a, b) => b[1] - a[1]).slice(0, 10),
            avg_rating: ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(2) : 0,
            processed_reviews: reviews.filter(r => r.ai_sentiment).length
        };
    }
}

async function main() {
    const analyzer = new ReviewAnalyzer();

    console.log('\n🤖 Starting AI Review Analysis\n');
    console.log('═══════════════════════════════════════\n');

    // Check total reviews
    const { count: totalReviews } = await analyzer.supabase
        .from('product_reviews')
        .select('*', { count: 'exact', head: true });

    console.log(`📝 Total reviews in database: ${totalReviews}`);

    const { count: unprocessed } = await analyzer.supabase
        .from('product_reviews')
        .select('*', { count: 'exact', head: true })
        .is('ai_sentiment', null);

    console.log(`🤖 Unprocessed reviews: ${unprocessed}\n`);

    if (unprocessed === 0) {
        console.log('✓ All reviews already analyzed!\n');
    } else {
        console.log('Starting analysis...\n');
        const processed = await analyzer.processUnanalyzedReviews(unprocessed);
        console.log(`\n✅ Analysis complete! Processed ${processed} reviews\n`);
    }

    // Generate insights report
    console.log('═══════════════════════════════════════');
    console.log('📊 INSIGHTS REPORT\n');

    const insights = await analyzer.generateInsightsReport();
    console.log(JSON.stringify(insights, null, 2));

    console.log('\n═══════════════════════════════════════\n');
}

if (import.meta.url === `file://${process.argv[1]}`) main();

export { ReviewAnalyzer };

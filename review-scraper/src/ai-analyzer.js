// AI Analysis using Gemini
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
        const { data: reviews } = await this.supabase
            .from('reviews')
            .select('*')
            .is('ai_sentiment', null)
            .limit(limit);

        if (!reviews || reviews.length === 0) {
            logger.info('No unanalyzed reviews found');
            return 0;
        }

        logger.info(`Processing ${reviews.length} reviews...`);
        let processed = 0;

        for (const review of reviews) {
            try {
                const analysis = await this.analyzeSentiment(review.review_text);

                await this.supabase.from('reviews').update({
                    ai_sentiment: analysis.sentiment,
                    confidence_score: analysis.confidence_score,
                    key_themes: analysis.key_themes,
                    ai_tags: analysis.tags,
                    ai_categories: analysis.categories,
                    processed_at: new Date().toISOString()
                }).eq('id', review.id);

                processed++;
                logger.info(`✓ Analyzed ${processed}/${reviews.length}: ${analysis.sentiment}`);

                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                logger.error(`Failed to analyze review ${review.id}:`, error.message);
            }
        }

        logger.info(`\n✓ Processed ${processed} reviews`);
        return processed;
    }

    async generateInsightsReport(productId = null) {
        let query = this.supabase.from('reviews').select('*');
        if (productId) query = query.eq('product_id', productId);

        const { data: reviews } = await query;
        if (!reviews || reviews.length === 0) return { error: 'No reviews found' };

        const total = reviews.length;
        const sentiments = { positive: 0, negative: 0, neutral: 0 };
        const themes = {};

        reviews.forEach(r => {
            if (r.ai_sentiment) sentiments[r.ai_sentiment]++;
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
            avg_rating: (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / total).toFixed(2)
        };
    }
}

async function main() {
    const analyzer = new ReviewAnalyzer();

    console.log('Starting AI analysis...\n');
    const processed = await analyzer.processUnanalyzedReviews(50);

    console.log('\nGenerating insights report...\n');
    const insights = await analyzer.generateInsightsReport();
    console.log(JSON.stringify(insights, null, 2));

    console.log('\n✓ Analysis complete!');
    console.log('Next: npm run insights');
}

if (import.meta.url === `file://${process.argv[1]}`) main();
export { ReviewAnalyzer };

// Insights Report Generator
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { createLogger } from './logger.js';

dotenv.config();
const logger = createLogger('insights');

class InsightsGenerator {
    constructor() {
        this.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    }

    async getProductSummary(productId = null) {
        let query = this.supabase.from('v_product_review_summary').select('*');
        if (productId) query = query.eq('product_id', productId);

        const { data } = await query;
        return data || [];
    }

    async getSentimentTrends(days = 30) {
        const { data } = await this.supabase
            .from('v_sentiment_trends')
            .select('*')
            .limit(days);
        return data || [];
    }

    async getTopThemes(limit = 20) {
        const { data } = await this.supabase
            .from('v_top_themes')
            .select('*')
            .limit(limit);
        return data || [];
    }

    async generateFullReport(productId = null) {
        logger.info('Generating insights report...');

        const [summary, trends, themes] = await Promise.all([
            this.getProductSummary(productId),
            this.getSentimentTrends(),
            this.getTopThemes()
        ]);

        const report = {
            generated_at: new Date().toISOString(),
            product_summary: summary,
            sentiment_trends: trends,
            top_themes: themes,
            key_insights: this.generateKeyInsights(summary, trends, themes)
        };

        return report;
    }

    generateKeyInsights(summary, trends, themes) {
        const insights = [];

        if (summary.length > 0) {
            const product = summary[0];
            const positiveRate = (product.positive_reviews / product.total_reviews * 100).toFixed(1);
            const negativeRate = (product.negative_reviews / product.total_reviews * 100).toFixed(1);

            insights.push({
                type: 'sentiment',
                message: `${positiveRate}% positive sentiment, ${negativeRate}% negative`,
                data: { positive_rate: positiveRate, negative_rate: negativeRate }
            });

            if (product.average_rating >= 4) {
                insights.push({
                    type: 'rating',
                    message: `High average rating of ${product.average_rating.toFixed(2)}/5`,
                    data: { rating: product.average_rating }
                });
            }
        }

        if (themes.length > 0) {
            const topTheme = themes[0];
            insights.push({
                type: 'theme',
                message: `Most mentioned: "${topTheme.theme}" (${topTheme.mention_count} mentions)`,
                data: { theme: topTheme.theme, count: topTheme.mention_count }
            });
        }

        return insights;
    }

    printReport(report) {
        console.log('\n' + '='.repeat(60));
        console.log('REVIEW INSIGHTS REPORT');
        console.log('='.repeat(60));
        console.log(`Generated: ${new Date(report.generated_at).toLocaleString()}\n`);

        if (report.product_summary.length > 0) {
            console.log('📊 PRODUCT SUMMARY');
            console.log('-'.repeat(60));
            report.product_summary.forEach(p => {
                console.log(`Product: ${p.product_name}`);
                console.log(`Brand: ${p.brand || 'N/A'}`);
                console.log(`Total Reviews: ${p.total_reviews}`);
                console.log(`Average Rating: ${parseFloat(p.average_rating).toFixed(2)}/5`);
                console.log(`Positive: ${p.positive_reviews} | Negative: ${p.negative_reviews} | Neutral: ${p.neutral_reviews}`);
                console.log('');
            });
        }

        if (report.top_themes.length > 0) {
            console.log('🔑 TOP THEMES');
            console.log('-'.repeat(60));
            report.top_themes.slice(0, 10).forEach((theme, i) => {
                console.log(`${i + 1}. ${theme.theme}: ${theme.mention_count} mentions (avg rating: ${parseFloat(theme.avg_rating).toFixed(2)})`);
            });
            console.log('');
        }

        if (report.key_insights.length > 0) {
            console.log('💡 KEY INSIGHTS');
            console.log('-'.repeat(60));
            report.key_insights.forEach(insight => {
                console.log(`• ${insight.message}`);
            });
            console.log('');
        }

        console.log('='.repeat(60));
    }
}

async function main() {
    const generator = new InsightsGenerator();

    const productId = process.argv[2] || null;
    const report = await generator.generateFullReport(productId);

    generator.printReport(report);

    // Optionally save to file
    // import fs from 'fs';
    // fs.writeFileSync('insights-report.json', JSON.stringify(report, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) main();
export { InsightsGenerator };

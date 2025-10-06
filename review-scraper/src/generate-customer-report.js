// Generate Amazon-style "Customers say" report - Production Ready
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

/**
 * Generate Amazon-style customer sentiment report for a product
 * @param {string} productId - UUID of the product
 * @returns {Promise<Object>} Report object with markdown and metadata
 */
export async function generateCustomerReport(productId) {
    try {
        // Fetch reviews for the product
        const { data: reviews, error } = await supabase
            .from('product_reviews')
            .select(`
                *,
                brand_products (
                    name,
                    sku
                )
            `)
            .eq('product_id', productId);

        if (error) throw error;
        if (!reviews || reviews.length === 0) {
            return {
                success: false,
                error: 'No reviews found for this product'
            };
        }

        const productName = reviews[0].brand_products?.name || 'Product';

        // Prepare review texts
        const reviewTexts = reviews.map((r, i) =>
            `Review ${i + 1} (${r.rating}/5 stars): ${r.review_text}`
        ).join('\n\n');

        // Gemini prompt
        const prompt = `Analyze these product reviews and generate a customer sentiment report in this EXACT format:

### **Customers say**

[Write 1-2 sentences summarizing overall sentiment, mentioning both positives AND negatives if applicable]

> 🤖 Generated from the text of customer reviews

**Select to learn more**

✅ [Theme 1] &nbsp;&nbsp;&nbsp; ✅ [Theme 2]

> [!NOTE]
> X customers mention "[Most Important Theme]" &nbsp;&nbsp;&nbsp; <span style="color:green;">Y positive</span> &nbsp;&nbsp;&nbsp; <span style="color:orange;">Z negative</span>
>
> [Write one clear sentence summarizing what customers say about this theme]
>
> **[Extract key phrase and make it bold]**
>
> [Another snippet with **bold key phrase**]
>
> [Another snippet with **bold key phrase**]

IMPORTANT RULES:
- Use EXACT format above
- Bold the most important phrases in snippets
- Count accurately how many customers mention each theme
- Include both positive and negative counts
- Keep snippets short and impactful

REVIEWS TO ANALYZE:

${reviewTexts}`;

        // Generate report
        const result = await model.generateContent(prompt);
        const reportMarkdown = result.response.text();

        // Calculate stats
        const stats = {
            totalReviews: reviews.length,
            avgRating: (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(2),
            positiveCount: reviews.filter(r => r.ai_sentiment === 'positive').length,
            negativeCount: reviews.filter(r => r.ai_sentiment === 'negative').length,
            neutralCount: reviews.filter(r => r.ai_sentiment === 'neutral').length
        };

        return {
            success: true,
            productId,
            productName,
            reportMarkdown,
            stats,
            generatedAt: new Date().toISOString()
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// CLI usage
async function main() {
    const productId = process.argv[2];

    if (!productId) {
        console.log('Usage: node generate-customer-report.js <product_id>\n');
        console.log('Available products:');

        const { data: products } = await supabase
            .from('brand_products')
            .select('id, name, sku');

        if (products) {
            products.forEach(p => {
                console.log(`  ${p.id} - ${p.name} (${p.sku})`);
            });
        }
        return;
    }

    console.log('\n🤖 Generating Customer Report\n');
    console.log('═══════════════════════════════════════\n');

    const result = await generateCustomerReport(productId);

    if (result.success) {
        console.log(`Product: ${result.productName}`);
        console.log(`Reviews: ${result.stats.totalReviews}`);
        console.log(`Avg Rating: ${result.stats.avgRating}/5\n`);
        console.log('═══════════════════════════════════════\n');
        console.log(result.reportMarkdown);
        console.log('\n═══════════════════════════════════════\n');
        console.log('✅ Report generated successfully!\n');

        // Save to file
        const filename = `customer-report-${productId.substring(0, 8)}.md`;
        await import('fs').then(fs => {
            fs.default.writeFileSync(filename, result.reportMarkdown);
            console.log(`📄 Saved to: ${filename}\n`);
        });
    } else {
        console.error('✗ Error:', result.error);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

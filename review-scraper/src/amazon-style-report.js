// Generate Amazon-style "Customers say" report using Gemini AI
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

async function generateAmazonStyleReport(productId) {
    console.log('\n🤖 Generating Amazon-style Customer Report\n');
    console.log('═══════════════════════════════════════\n');

    // Get all reviews for this product
    const { data: reviews, error } = await supabase
        .from('product_reviews')
        .select('*, brand_products(name, sku)')
        .eq('product_id', productId);

    if (error || !reviews || reviews.length === 0) {
        console.log('No reviews found for this product');
        return null;
    }

    const productName = reviews[0].brand_products.name;
    console.log(`Product: ${productName}`);
    console.log(`Total Reviews: ${reviews.length}\n`);

    // Prepare review text for Gemini
    const reviewTexts = reviews.map((r, i) =>
        `Review ${i + 1} (${r.rating}/5 stars): ${r.review_text}`
    ).join('\n\n');

    const prompt = `Objective: Analyze the provided product reviews to generate a structured and insightful customer sentiment summary.

Input: A collection of customer reviews for a single product.

Instructions:

Your task is to transform the raw customer reviews into a formatted summary. Instead of a simple list, you must generate the output in the specific multi-part format detailed below.

1. Comprehensive Analysis:

Read through all the provided reviews to understand the overall customer experience.

Identify the 2-3 most significant or frequently mentioned key themes (e.g., "Taste," "Packaging," "Value for Money," "Authenticity," "Effectiveness").

For each review mentioning a theme, determine if the sentiment is positive or negative.

2. Output Generation:
Construct your response using the following structure precisely.

Part A: Overall Summary
Heading:
Start with the markdown heading: ### **Customers say**

Summary Paragraph:
Write a concise, 1-2 sentence paragraph that summarizes the overall sentiment and the most critical findings from the reviews. This paragraph should be a narrative synthesis, mentioning both the positive highlights and the major complaints.

Attribution Line:
Immediately follow the summary paragraph with this exact line:
> 🤖 Generated from the text of customer reviews

Part B: Key Themes
Subheading:
Add the subheading: **Select to learn more**

Theme Tags:
On the next line, list the top 2-3 key themes you identified. Each theme should be preceded by a checkmark emoji (✅) and separated by spaces.
Example: ✅ Quality &nbsp;&nbsp;&nbsp; ✅ Taste

Part C: Expanded Theme Detail
Select the single most impactful or frequently mentioned theme and create a detailed "expanded view" for it within a blockquote.

Format:
Start the section with > [!NOTE] to create the container. Inside it, include the following three components in order:

Mention Count:
State how many customers mentioned the theme, with a clear breakdown of positive and negative sentiment.

Format: X customers mention "[Theme Name]" &nbsp;&nbsp;&nbsp; <span style="color:green;">Y positive</span> &nbsp;&nbsp;&nbsp; <span style="color:orange;">Z negative</span>

Theme Summary:
Write one clear sentence that summarizes what customers are saying about this specific theme.

Supporting Snippets:
Provide 2-4 short, direct quotes or paraphrased snippets from the reviews that support your analysis of this theme.

The most relevant word or phrase in each snippet must be bolded.

Each snippet must be on its own line.

Do not add a "Read more" link after the snippets.

---

HERE ARE THE REVIEWS TO ANALYZE:

${reviewTexts}

---

Generate the customer sentiment report now following the exact format above:`;

    console.log('Sending to Gemini AI...\n');

    try {
        const result = await model.generateContent(prompt);
        const report = result.response.text();

        console.log('✓ Report generated!\n');
        console.log('═══════════════════════════════════════\n');
        console.log(report);
        console.log('\n═══════════════════════════════════════\n');

        return report;

    } catch (error) {
        console.error('Error generating report:', error.message);
        return null;
    }
}

// Main execution
async function main() {
    const productId = process.argv[2];

    if (!productId) {
        console.log('Usage: node amazon-style-report.js <product_id>');
        console.log('\nAvailable products:');

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

    const report = await generateAmazonStyleReport(productId);

    if (report) {
        // Save to file
        const filename = `customer-report-${Date.now()}.md`;
        fs.writeFileSync(filename, report);
        console.log(`✓ Report saved to: ${filename}\n`);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { generateAmazonStyleReport };

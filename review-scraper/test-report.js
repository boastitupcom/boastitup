import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

console.log('Generating Amazon-style report...\n');

// Get Vitamin D3 K2 reviews
const productId = 'dadade0b-4a88-4454-9f3d-5e3b6dcfb464';

const { data: reviews } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('product_id', productId);

console.log(`Found ${reviews.length} reviews\n`);

const reviewTexts = reviews.map((r, i) =>
    `Review ${i + 1} (${r.rating}/5 stars): ${r.review_text}`
).join('\n\n');

const prompt = `Analyze these product reviews and generate a customer sentiment report in this EXACT format:

### **Customers say**

[1-2 sentence summary mentioning both positives and negatives]

> 🤖 Generated from the text of customer reviews

**Select to learn more**

✅ [Theme 1] &nbsp;&nbsp;&nbsp; ✅ [Theme 2]

> [!NOTE]
> X customers mention "[Most Important Theme]" &nbsp;&nbsp;&nbsp; <span style="color:green;">Y positive</span> &nbsp;&nbsp;&nbsp; <span style="color:orange;">Z negative</span>
>
> [One sentence summary about this theme]
>
> **[Key phrase from review]**
>
> [Another snippet with **bold key phrase**]
>
> [Another snippet with **bold key phrase**]

REVIEWS:

${reviewTexts}`;

console.log('Sending to Gemini...\n');

const result = await model.generateContent(prompt);
const report = result.response.text();

console.log('GENERATED REPORT:\n');
console.log('═══════════════════════════════════════\n');
console.log(report);
console.log('\n═══════════════════════════════════════\n');

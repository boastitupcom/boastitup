import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const API_KEY = 'AIzaSyB_KXOm3MQDLANiVTyuSPpLP-gLQEE67p0';

async function testNewAPI() {
  console.log('🔍 Fetching reviews from Supabase...\n');

  const productId = 'ba55c9ce-34ff-4b1f-a3d0-a8242dae93e2'; // Nitra Whey

  const { data: reviews, error } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('product_id', productId);

  if (error) {
    console.error('❌ Error fetching reviews:', error);
    return;
  }

  console.log(`✅ Found ${reviews.length} reviews\n`);

  // Prepare review data
  const reviewsData = reviews.map((r, i) => ({
    id: i + 1,
    rating: r.rating,
    text: r.review_text,
    customer: r.customer_name || 'Anonymous'
  }));

  const prompt = `Objective: Analyze the provided product reviews to generate a structured and insightful customer sentiment summary.

Input: A collection of customer reviews for a single product.

Instructions:

Your task is to transform the raw customer reviews into a formatted summary. You must generate the output as valid JSON.

1. Comprehensive Analysis:
- Read through all the provided reviews to understand the overall customer experience.
- Identify the 2-3 most significant or frequently mentioned key themes (e.g., "Taste," "Packaging," "Value for Money," "Authenticity," "Effectiveness").
- For each review mentioning a theme, determine if the sentiment is positive or negative.

2. Output Generation:
Return a JSON object with this EXACT structure:

{
  "summary": "A concise, 1-2 sentence paragraph that summarizes the overall sentiment and the most critical findings from the reviews. This paragraph should be a narrative synthesis, mentioning both the positive highlights and the major complaints.",
  "themes": ["Theme 1", "Theme 2", "Theme 3"],
  "primaryTheme": {
    "name": "Most Important Theme Name",
    "totalMentions": 0,
    "positiveMentions": 0,
    "negativeMentions": 0,
    "summary": "One clear sentence that summarizes what customers are saying about this specific theme.",
    "snippets": [
      "Short quote or paraphrase with the **most relevant phrase** in bold",
      "Another snippet with **key phrase** bolded",
      "Third snippet with **important words** emphasized"
    ]
  }
}

IMPORTANT:
- Return ONLY valid JSON, no markdown, no explanation
- Bold text in snippets using **text** format
- Count mentions accurately
- Include 2-4 snippets maximum
- Each snippet should be a direct quote or close paraphrase from the reviews

REVIEWS DATA:
${JSON.stringify(reviewsData, null, 2)}`;

  console.log('🤖 Calling Gemini API...\n');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ API Error:', error);
    return;
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;

  console.log('📄 Raw AI Response:\n');
  console.log(text);
  console.log('\n' + '='.repeat(80) + '\n');

  // Extract JSON
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('❌ Could not extract JSON from response');
    return;
  }

  const analysis = JSON.parse(jsonMatch[0]);

  console.log('✅ Parsed JSON:\n');
  console.log(JSON.stringify(analysis, null, 2));
  console.log('\n' + '='.repeat(80) + '\n');

  // Generate formatted markdown
  const reportMarkdown = `### **Customers say**

${analysis.summary}

> 🤖 Generated from the text of customer reviews

**Select to learn more**

${analysis.themes.map(t => `✅ ${t}`).join(' &nbsp;&nbsp;&nbsp; ')}

> [!NOTE]
> ${analysis.primaryTheme.totalMentions} customers mention "${analysis.primaryTheme.name}" &nbsp;&nbsp;&nbsp; <span style="color:green;">${analysis.primaryTheme.positiveMentions} positive</span> &nbsp;&nbsp;&nbsp; <span style="color:orange;">${analysis.primaryTheme.negativeMentions} negative</span>
>
> ${analysis.primaryTheme.summary}
>
${analysis.primaryTheme.snippets.map(s => `> ${s}`).join('\n>\n')}`;

  console.log('📝 Formatted Markdown Report:\n');
  console.log(reportMarkdown);
  console.log('\n' + '='.repeat(80) + '\n');
  console.log('✅ TEST COMPLETED SUCCESSFULLY!\n');
}

testNewAPI().catch(console.error);

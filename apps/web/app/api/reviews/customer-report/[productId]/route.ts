// API Route: Generate customer report for a product
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@boastitup/supabase/server';

// Try using a direct HTTP request to avoid regional routing issues
async function generateWithGemini(prompt: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    const supabase = await createClient();

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
      return NextResponse.json(
        { error: 'No reviews found for this product' },
        { status: 404 }
      );
    }

    const productName = reviews[0].brand_products?.name || 'Product';

    // Prepare review texts
    const reviewTexts = reviews
      .map((r: any, i: number) => `Review ${i + 1} (${r.rating}/5 stars): ${r.review_text}`)
      .join('\n\n');

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
    const reportMarkdown = await generateWithGemini(prompt);

    // Calculate stats
    const stats = {
      totalReviews: reviews.length,
      avgRating: (
        reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length
      ).toFixed(2),
      positiveCount: reviews.filter((r: any) => r.ai_sentiment === 'positive').length,
      negativeCount: reviews.filter((r: any) => r.ai_sentiment === 'negative').length,
      neutralCount: reviews.filter((r: any) => r.ai_sentiment === 'neutral').length,
    };

    return NextResponse.json({
      success: true,
      productId,
      productName,
      reportMarkdown,
      stats,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

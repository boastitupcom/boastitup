"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { createClient } from "@boastitup/supabase/client";

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface ReviewAnalysis {
  summary: string;
  themes: string[];
  primaryTheme: {
    name: string;
    totalMentions: number;
    positiveMentions: number;
    negativeMentions: number;
    summary: string;
    snippets: string[];
  };
}

interface Stats {
  totalReviews: number;
  avgRating: string;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
}

interface ReportData {
  success: boolean;
  productId: string;
  productName: string;
  reportMarkdown: string;
  analysis: ReviewAnalysis;
  stats: Stats;
  generatedAt: string;
}

const GEMINI_API_KEY = "AIzaSyB_KXOm3MQDLANiVTyuSPpLP-gLQEE67p0";

export default function TestReviewsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("brand_products")
        .select("id, name, sku")
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      setError(`Failed to load products: ${err.message}`);
    }
  };

  const generateReport = async () => {
    if (!selectedProduct) return;

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const supabase = createClient();

      // Fetch reviews directly from Supabase
      const { data: reviews, error: reviewError } = await supabase
        .from("product_reviews")
        .select(`
          *,
          brand_products (
            name,
            sku
          )
        `)
        .eq("product_id", selectedProduct);

      if (reviewError) throw reviewError;
      if (!reviews || reviews.length === 0) {
        throw new Error("No reviews found for this product");
      }

      const productName = reviews[0].brand_products?.name || "Product";

      // Prepare review data
      const reviewsData = reviews.map((r: any, i: number) => ({
        id: i + 1,
        rating: r.rating,
        text: r.review_text,
        customer: r.customer_name || "Anonymous",
      }));

      const prompt = `Objective: Analyze the provided product reviews to generate a structured and insightful customer sentiment summary.

Input: A collection of customer reviews for a single product.

Instructions:

Your task is to transform the raw customer reviews into a formatted summary. You must generate the output as valid JSON.

1. Comprehensive Analysis:
- Read through all the provided reviews to understand the overall customer experience.
- Identify the 2-3 most significant or frequently mentioned key themes (e.g., "Taste," "Packaging," "Value for Money," "Authenticity", "Effectiveness").
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

      // Call Gemini API directly from client (bypasses server regional restrictions)
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${errorText}`);
      }

      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid JSON response from AI");
      }

      const analysis: ReviewAnalysis = JSON.parse(jsonMatch[0]);

      // Generate formatted markdown
      const reportMarkdown = `### **Customers say**

${analysis.summary}

> 🤖 Generated from the text of customer reviews


${analysis.themes.map((t) => `✅ ${t}`).join("   ")}

**${analysis.primaryTheme.totalMentions} customers mention "${analysis.primaryTheme.name}"**

${analysis.primaryTheme.positiveMentions} positive   |   ${analysis.primaryTheme.negativeMentions} negative

${analysis.primaryTheme.summary}

${analysis.primaryTheme.snippets.map((s) => `• ${s}`).join("\n\n")}`;

      // Calculate stats
      const stats: Stats = {
        totalReviews: reviews.length,
        avgRating: (
          reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) /
          reviews.length
        ).toFixed(2),
        positiveCount: reviews.filter((r: any) => r.ai_sentiment === "positive")
          .length,
        negativeCount: reviews.filter(
          (r: any) => r.ai_sentiment === "negative"
        ).length,
        neutralCount: reviews.filter((r: any) => r.ai_sentiment === "neutral")
          .length,
      };

      setReport({
        success: true,
        productId: selectedProduct,
        productName,
        reportMarkdown,
        analysis,
        stats,
        generatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Customer Reviews Report - Test Page
          </h1>
          <p className="text-gray-600 mb-6">
            Generate Amazon-style customer sentiment reports for your products
          </p>

          {/* Product Selection */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Product
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Choose a product --</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={generateReport}
              disabled={!selectedProduct || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Error:</p>
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Report Display */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Analyzing reviews with AI...</p>
          </div>
        )}

        {report && !loading && (
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Stats Header */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {report.productName}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {report.stats.totalReviews}
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {report.stats.avgRating}/5
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Positive</p>
                  <p className="text-2xl font-bold text-green-600">
                    {report.stats.positiveCount}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Negative</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {report.stats.negativeCount}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Neutral</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {report.stats.neutralCount}
                  </p>
                </div>
              </div>
            </div>

            {/* Markdown Report */}
            <div className="prose max-w-none">
              <ReactMarkdown
                components={{
                  h3: ({ node, ...props }) => (
                    <h3 className="text-xl font-bold mb-4" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="border-l-4 border-blue-500 bg-blue-50 p-4 my-4 rounded-r-lg"
                      {...props}
                    />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="mb-3 text-gray-700" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-semibold text-gray-900" {...props} />
                  ),
                }}
              >
                {report.reportMarkdown}
              </ReactMarkdown>
            </div>

            {/* Generation Info */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
              Generated at: {new Date(report.generatedAt).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

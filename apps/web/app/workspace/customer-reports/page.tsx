'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface ReportData {
  success: boolean;
  productId: string;
  productName: string;
  reportMarkdown: string;
  stats: {
    totalReviews: number;
    avgRating: string;
    positiveCount: number;
    negativeCount: number;
    neutralCount: number;
  };
  generatedAt: string;
}

export default function CustomerReportsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  }

  async function generateReport() {
    if (!selectedProduct) return;

    setLoading(true);
    setError('');
    setReport(null);

    try {
      const response = await fetch(`/api/reviews/customer-report/${selectedProduct}`);
      const data = await response.json();

      if (data.success) {
        setReport(data);
      } else {
        setError(data.error || 'Failed to generate report');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Customer Reports
          </h1>
          <p className="text-gray-600">
            AI-generated customer sentiment analysis for your products
          </p>
        </div>

        {/* Product Selector */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Product
          </label>
          <div className="flex gap-4">
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            >
              <option value="">Choose a product...</option>
              {/* Hardcoded products for now */}
              <option value="dadade0b-4a88-4454-9f3d-5e3b6dcfb464">
                Vitamin D3 K2 Supplement (10 reviews)
              </option>
              <option value="ba55c9ce-34ff-4b1f-a3d0-a8242dae93e2">
                Nitra Whey (3 reviews)
              </option>
            </select>
            <button
              onClick={generateReport}
              disabled={!selectedProduct || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing reviews with AI...</p>
            <p className="text-sm text-gray-400 mt-2">This may take a few seconds</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Report Display */}
        {report && !loading && (
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {report.productName}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {report.stats.totalReviews}
                  </div>
                  <div className="text-sm text-gray-600">Total Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {report.stats.avgRating} ⭐
                  </div>
                  <div className="text-sm text-gray-600">Avg Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {report.stats.positiveCount}
                  </div>
                  <div className="text-sm text-gray-600">Positive</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {report.stats.negativeCount}
                  </div>
                  <div className="text-sm text-gray-600">Negative</div>
                </div>
              </div>
            </div>

            {/* Report Content */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Custom styling for blockquotes
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        className="border-l-4 border-blue-500 bg-blue-50 p-4 my-4"
                        {...props}
                      />
                    ),
                    // Custom styling for spans with colors
                    span: ({ node, ...props }) => {
                      const style = (props as any).style;
                      return <span {...props} />;
                    },
                  }}
                >
                  {report.reportMarkdown}
                </ReactMarkdown>
              </div>
              <div className="mt-6 pt-4 border-t text-sm text-gray-500">
                Generated at: {new Date(report.generatedAt).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!report && !loading && !error && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Report Generated Yet
            </h3>
            <p className="text-gray-600">
              Select a product and click "Generate Report" to see AI-powered customer insights
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// app/dashboard/content-spark/seo-blog-writer/page.tsx
import SEOAgentChat from '@/components/SEOAgentChat';

export default function SEOChatPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">SEO Content Strategist</h1>
      <div className="h-96">
        <SEOAgentChat sessionId="demo-001" mode="outline" />
      </div>
    </div>
  );
}
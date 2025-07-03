// app/workspace/content-spark/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@boastitup/ui';
import { Button } from '@boastitup/ui';
import { FileText, Video, Sparkles, TrendingUp, Zap, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function ContentSparkPage() {
  const contentTypes = [
    {
      title: "SEO Blog Writer",
      description: "Create SEO-optimized blog posts with AI assistance",
      icon: FileText,
      href: "/workspace/content-spark/seo-blog-writer",
      color: "text-blue-500",
      features: ["Keyword optimization", "Meta descriptions", "Content outlines"]
    },
    {
      title: "Instagram Reel Generator",
      description: "Generate engaging Instagram reel scripts and ideas",
      icon: Video,
      href: "/workspace/content-spark/instagram-reel-generator",
      color: "text-pink-500",
      features: ["Script writing", "Hashtag suggestions", "Trending audio ideas"]
    },
    {
      title: "Social Media Posts",
      description: "Create posts for multiple social platforms",
      icon: MessageSquare,
      href: "/workspace/content-spark/social-posts",
      color: "text-purple-500",
      features: ["Multi-platform", "Engagement focused", "Caption writing"],
      comingSoon: true
    },
    {
      title: "Email Campaigns",
      description: "Craft compelling email marketing campaigns",
      icon: Zap,
      href: "/workspace/content-spark/email-campaigns",
      color: "text-green-500",
      features: ["Subject lines", "A/B testing ideas", "Call-to-actions"],
      comingSoon: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-yellow-500" />
          Content Spark
        </h1>
        <p className="text-muted-foreground mt-2">
          AI-powered content creation tools to supercharge your marketing
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Content Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0h</div>
            <p className="text-xs text-muted-foreground">Estimated</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              0%
            </div>
            <p className="text-xs text-muted-foreground">Average increase</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Types Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {contentTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Card 
              key={type.href} 
              className={`relative overflow-hidden ${
                type.comingSoon ? 'opacity-75' : 'hover:shadow-lg transition-shadow cursor-pointer'
              }`}
            >
              {type.comingSoon && (
                <div className="absolute top-2 right-2">
                  <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Icon className={`h-6 w-6 ${type.color}`} />
                  {type.title}
                </CardTitle>
                <CardDescription>{type.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {type.features.map((feature) => (
                      <span 
                        key={feature} 
                        className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  
                  {!type.comingSoon && (
                    <Button asChild className="w-full">
                      <Link href={type.href}>
                        Get Started
                        <Sparkles className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💡 Pro Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Use your brand settings to maintain consistent voice across all content</li>
            <li>• Start with SEO blog posts to build your domain authority</li>
            <li>• Repurpose blog content into social media posts for maximum reach</li>
            <li>• Track engagement metrics to refine your content strategy</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
// apps/web/app/workspace/content-spark/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@boastitup/ui';
import { Button } from '@boastitup/ui';
import { FileText, Video, Sparkles, TrendingUp, Zap, MessageSquare, Images, Instagram, Camera, Edit } from "lucide-react";
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
      title: "Content Gallery",
      description: "Organize your Instagram posts, carousels, and reel content",
      icon: Images,
      href: "/workspace/content-spark/image-gallery",
      color: "text-purple-500",
      features: ["Video player", "Content categorization", "Instagram optimization"],
      isHighlighted: true
    },
    {
      title: "Social Media Posts",
      description: "Create posts for multiple social platforms",
      icon: MessageSquare,
      href: "/workspace/content-spark/social-posts",
      color: "text-green-500",
      features: ["Multi-platform", "Engagement focused", "Caption writing"],
      comingSoon: true
    },
    {
      title: "Content Editor",
      description: "Edit and enhance your visual content",
      icon: Edit,
      href: "/workspace/content-spark/content-editor",
      color: "text-orange-500",
      features: ["Image editing", "Video trimming", "Filter effects"],
      comingSoon: true
    }
  ];

  const instagramStats = [
    {
      label: "Source Images",
      value: "12",
      description: "Raw photos ready for editing",
      icon: Camera,
      color: "text-blue-500"
    },
    {
      label: "Carousel Sets",
      value: "5",
      description: "Multi-image posts prepared",
      icon: Images,
      color: "text-purple-500"
    },
    {
      label: "Final Posts",
      value: "8",
      description: "Ready-to-publish content",
      icon: Sparkles,
      color: "text-green-500"
    },
    {
      label: "Reels",
      value: "3",
      description: "Video content for Instagram",
      icon: Video,
      color: "text-pink-500"
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
          AI-powered content creation tools to supercharge your Instagram marketing
        </p>
      </div>

      {/* Instagram Content Overview */}
      <Card className="border-2 border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-6 w-6 text-pink-500" />
            Instagram Content Overview
          </CardTitle>
          <CardDescription>
            Your visual content organized by Instagram post types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {instagramStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-white ${stat.color} mb-2`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm font-medium">{stat.label}</div>
                  <div className="text-xs text-muted-foreground">{stat.description}</div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button asChild>
              <Link href="/workspace/content-spark/image-gallery">
                <Images className="h-4 w-4 mr-2" />
                View Content Gallery
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Content Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              12.5%
            </div>
            <p className="text-xs text-muted-foreground">Instagram posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15h</div>
            <p className="text-xs text-muted-foreground">Estimated</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Creation Tools */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {contentTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Card 
              key={type.href} 
              className={`relative overflow-hidden transition-all duration-200 ${
                type.comingSoon 
                  ? 'opacity-75' 
                  : type.isHighlighted
                  ? 'ring-2 ring-purple-500 shadow-lg hover:shadow-xl'
                  : 'hover:shadow-lg hover:scale-[1.02]'
              }`}
            >
              {type.comingSoon && (
                <div className="absolute top-2 right-2">
                  <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
                </div>
              )}
              
              {type.isHighlighted && (
                <div className="absolute top-2 right-2">
                  <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                    Featured
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
                        {type.isHighlighted ? 'Explore Gallery' : 'Get Started'}
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

      {/* Instagram Workflow Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Instagram className="h-5 w-5 text-pink-500" />
            Instagram Content Workflow
          </CardTitle>
          <CardDescription>
            Optimize your content creation process for maximum engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium">📸 For Images:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Source:</strong> Raw photos from shoots or stock images</li>
                <li>• <strong>Carousel:</strong> Multi-image posts with consistent theme</li>
                <li>• <strong>Final:</strong> Branded, edited posts ready to publish</li>
                <li>• Use the Content Gallery to organize by post type</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">🎬 For Videos:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Reels:</strong> Vertical video content (9:16 ratio)</li>
                <li>• Keep videos under 60 seconds for maximum reach</li>
                <li>• Use trending audio and hashtags for discovery</li>
                <li>• Preview videos with our built-in player</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🚀 Quick Actions</CardTitle>
          <CardDescription>
            Jump to the most common tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button variant="outline" asChild className="h-auto p-4">
              <Link href="/workspace/content-spark/image-gallery?filter=reel">
                <div className="text-center">
                  <Video className="h-6 w-6 mx-auto mb-2 text-pink-500" />
                  <div className="font-medium">View Reels</div>
                  <div className="text-xs text-muted-foreground">Check video content</div>
                </div>
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="h-auto p-4">
              <Link href="/workspace/content-spark/image-gallery?filter=final">
                <div className="text-center">
                  <Sparkles className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <div className="font-medium">Ready Posts</div>
                  <div className="text-xs text-muted-foreground">Content ready to publish</div>
                </div>
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="h-auto p-4">
              <Link href="/workspace/content-spark/instagram-reel-generator">
                <div className="text-center">
                  <Edit className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <div className="font-medium">Create Reel</div>
                  <div className="text-xs text-muted-foreground">Generate new content</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📈 Recent Activity</CardTitle>
          <CardDescription>
            Your latest content creation activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Images className="h-5 w-5 text-purple-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Content Gallery updated</p>
                <p className="text-xs text-muted-foreground">Added video player and Instagram categorization</p>
              </div>
              <span className="text-xs text-muted-foreground">Just now</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Video className="h-5 w-5 text-pink-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">New reel script generated</p>
                <p className="text-xs text-muted-foreground">Product showcase reel for winter collection</p>
              </div>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Blog post published</p>
                <p className="text-xs text-muted-foreground">"5 Instagram Trends for 2024" - 1,200 words</p>
              </div>
              <span className="text-xs text-muted-foreground">Yesterday</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
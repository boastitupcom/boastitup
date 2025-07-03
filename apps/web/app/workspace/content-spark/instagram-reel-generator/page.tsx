// app/dashboard/content-spark/instagram-reel-generator/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Video,
  Sparkles,
  Hash,
  Music,
  TrendingUp,
  Package,
  Wand2,
  Play,
  Download,
  Share,
  Copy,
  Eye,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Target,
  Loader2
} from "lucide-react";
import { ProductGallery } from '@/components/ProductGallery';
import { ProductImage } from '@/lib/services/azure-blob';

interface ReelFormData {
  brand: string;
  topic: string;
  goal: string;
  duration: string;
  style: string;
  tone: string;
  targetAudience: string;
  hookIdea: string;
  callToAction: string;
  products: ProductImage[];
  customPrompt: string;
}

interface GeneratedContent {
  script: string;
  hashtags: string[];
  audioSuggestions: string[];
  postingTips: string[];
  visualCues: string[];
  engagement: {
    estimatedReach: string;
    bestPostingTimes: string[];
    targetDemographics: string[];
  };
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

export default function InstagramReelGeneratorPage() {
  const [loading, setLoading] = useState(false);
  const [savingToDatabase, setSavingToDatabase] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState<ReelFormData>({
    brand: '',
    topic: '',
    goal: '',
    duration: '',
    style: '',
    tone: '',
    targetAudience: '',
    hookIdea: '',
    callToAction: '',
    products: [],
    customPrompt: ''
  });
  
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'products' | 'advanced'>('details');

  // Load user's brands
  useEffect(() => {
    loadUserBrands();
  }, []);

  const loadUserBrands = async () => {
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('User authentication error:', userError);
        throw new Error(`Authentication failed: ${userError.message}`);
      }
      
      if (!user) {
        console.warn('No authenticated user found');
        return;
      }

      console.log('Loading brands for user:', user.id);

      const { data, error } = await supabase
        .from('user_brand_roles')
        .select(`
          brand:brands!inner(id, name, slug)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error('Supabase query error:', error);
        throw new Error(`Database query failed: ${error.message}`);
      }

      console.log('Raw brand data from Supabase:', data);

      // Handle the nested brand data more carefully
      const brandData = data
        ?.map((item: any) => {
          console.log('Processing brand item:', item);
          return item.brand;
        })
        .filter(Boolean) || [];

      console.log('Processed brand data:', brandData);
      setBrands(brandData);
      
      if (brandData.length > 0 && !formData.brand) {
        setFormData(prev => ({ ...prev, brand: brandData[0].id }));
      } else if (brandData.length === 0) {
        toast({
          title: "No Brands Found",
          description: "Please create a brand first to generate content",
          variant: "default",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error loading brands:', errorMessage, error);
      toast({
        title: "Error",
        description: `Failed to load your brands: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoadingBrands(false);
    }
  };

  const handleInputChange = (field: keyof ReelFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProductSelection = (selectedProducts: ProductImage[]) => {
    setFormData(prev => ({ ...prev, products: selectedProducts }));
  };

  const generateReelScript = async () => {
    setLoading(true);
    
    try {
      // Simulate API call - in real implementation, this would call your AI service
      await new Promise(resolve => setTimeout(resolve, 3000));

      const selectedBrand = brands.find(b => b.id === formData.brand);
      const productNames = formData.products.map(p => p.name).join(', ');

      // Enhanced mock generated content with more realistic data
      const mockContent: GeneratedContent = {
        script: `🎬 HOOK: "${formData.hookIdea || `POV: You discover the ${formData.topic.toLowerCase()} that changes everything!`}"

📱 SCENE 1 (0-3s): 
${formData.products.length > 0 
  ? `Start with a stunning close-up of ${formData.products[0].name} in perfect lighting. Use trending audio with beat drop.`
  : 'Open with an attention-grabbing visual that immediately hooks your audience.'
}

📱 SCENE 2 (3-8s):
${formData.style === 'tutorial' 
  ? 'Step-by-step demonstration of the key features. Use quick cuts and clear visuals.'
  : formData.style === 'before-after'
  ? 'Show the dramatic before/after transformation. Build anticipation with music.'
  : 'Product in action - showcase the transformation or key benefits with dynamic angles.'
}

📱 SCENE 3 (8-12s):
${formData.style === 'lifestyle' 
  ? 'Lifestyle shots showing how this fits into daily routine. Make it aspirational.'
  : 'Zoom in on details and benefits. Add text overlays with key selling points.'
}

${parseInt(formData.duration) > 30 ? `📱 SCENE 4 (12-${formData.duration}s):
Multiple angles and use cases. Show versatility and create desire.

📱 FINAL SCENE:
` : '📱 FINAL SCENE (12-15s):'
}Strong call-to-action visual with your branding.

🎯 CALL TO ACTION: "${formData.callToAction || 'Save this for later & follow for more amazing finds!'}"

💡 Pro tip: ${formData.tone === 'professional' 
  ? 'Keep transitions smooth and maintain brand consistency throughout.'
  : formData.tone === 'trendy'
  ? 'Use trending sounds and stay current with popular editing styles.'
  : 'Focus on authentic moments that resonate with your audience.'
}`,

        hashtags: generateHashtags(formData),
        
        audioSuggestions: [
          `Trending ${formData.goal === 'entertainment' ? 'comedy' : 'inspirational'} audio clips`,
          'Upbeat electronic music (15-30 second clips)',
          `${formData.tone === 'professional' ? 'Subtle background music' : 'High-energy trending beats'}`,
          'Voiceover with trending background track',
          'Original audio from similar viral reels'
        ],

        postingTips: [
          `Post between ${formData.targetAudience.includes('professional') ? '7-9 AM or 5-7 PM' : '6-9 PM'} for maximum engagement`,
          'Use all 30 hashtags in your first comment for better reach',
          'Engage with comments within the first hour to boost algorithm',
          'Share to your story immediately and pin for 24 hours',
          `Cross-post to ${formData.goal === 'sales' ? 'Facebook and TikTok' : 'TikTok for broader reach'}`,
          'Reply to comments with video responses when possible'
        ],

        visualCues: [
          'Hook viewers in the first 1-2 seconds with movement or surprise',
          `Use ${formData.duration === '15' ? '6-8 cuts' : formData.duration === '30' ? '10-12 cuts' : '15-20 cuts'} to maintain attention`,
          'Include captions/text overlays for 85% of viewers who watch without sound',
          'End with clear next step - follow, save, or visit link in bio',
          'Use consistent brand colors and fonts throughout',
          `${formData.style === 'tutorial' ? 'Number your steps clearly (1, 2, 3...)' : 'Create visual hierarchy with size and contrast'}`
        ],

        engagement: {
          estimatedReach: formData.products.length > 2 ? '10K-50K views' : '5K-25K views',
          bestPostingTimes: ['6:00 PM', '7:30 PM', '8:00 PM'],
          targetDemographics: formData.targetAudience ? [formData.targetAudience] : ['18-34 years', 'Interested in lifestyle content']
        }
      };

      setGeneratedContent(mockContent);
      
      toast({
        title: "Script Generated!",
        description: "Your Instagram Reel script is ready. You can now save it or make edits.",
      });

    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating your script. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateHashtags = (data: ReelFormData): string[] => {
    const baseHashtags = ['#reels', '#viral', '#trending', '#instagood', '#explore'];
    const goalHashtags = {
      engagement: ['#engage', '#community', '#interactive'],
      awareness: ['#brand', '#awareness', '#discover'],
      sales: ['#shop', '#deal', '#musthave'],
      education: ['#learn', '#tips', '#howto'],
      entertainment: ['#fun', '#entertainment', '#comedy']
    };
    
    const styleHashtags = {
      'product-showcase': ['#product', '#review', '#showcase'],
      'tutorial': ['#tutorial', '#howto', '#learn'],
      'before-after': ['#transformation', '#beforeafter', '#results'],
      'lifestyle': ['#lifestyle', '#daily', '#routine'],
      'unboxing': ['#unboxing', '#new', '#reveal']
    };

    return [
      ...baseHashtags,
      ...(goalHashtags[data.goal as keyof typeof goalHashtags] || []),
      ...(styleHashtags[data.style as keyof typeof styleHashtags] || []),
      `#${data.topic.toLowerCase().replace(/\s+/g, '')}`,
      ...(data.targetAudience ? [`#${data.targetAudience.toLowerCase().replace(/\s+/g, '')}`] : [])
    ].slice(0, 15); // Limit to 15 hashtags for the preview
  };

  const saveToDatabase = async () => {
    if (!generatedContent) return;

    setSavingToDatabase(true);
    try {
      const response = await fetch('/api/content/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `Instagram Reel: ${formData.topic}`,
          content: generatedContent.script,
          contentType: 'instagram_reel',
          brandId: formData.brand,
          metadata: {
            formData,
            generatedContent,
            created_with: 'instagram_reel_generator',
            version: '1.0'
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save content');
      }

      toast({
        title: "Saved Successfully!",
        description: "Your reel script has been saved to your content library.",
      });

    } catch (error) {
      console.error('Error saving to database:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save to database",
        variant: "destructive",
      });
    } finally {
      setSavingToDatabase(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const canGenerate = formData.topic && formData.goal && formData.duration;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Video className="h-8 w-8 text-pink-500" />
            Instagram Reel Generator
          </h1>
          <p className="text-muted-foreground mt-2">
            Create engaging Instagram Reel scripts with AI-powered insights
          </p>
        </div>

        {generatedContent && (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={saveToDatabase}
              disabled={savingToDatabase}
            >
              {savingToDatabase ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => copyToClipboard(generatedContent.script)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Script
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Form Tabs */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 text-sm font-medium py-2 px-3 rounded-md transition-colors ${activeTab === 'details'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Reel Details
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 text-sm font-medium py-2 px-3 rounded-md transition-colors ${activeTab === 'products'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Products ({formData.products.length})
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`flex-1 text-sm font-medium py-2 px-3 rounded-md transition-colors ${activeTab === 'advanced'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Advanced
            </button>
          </div>

          {/* Reel Details Tab */}
          {activeTab === 'details' && (
            <Card>
              <CardHeader>
                <CardTitle>Reel Configuration</CardTitle>
                <CardDescription>
                  Configure your Instagram Reel parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Select 
                      value={formData.brand} 
                      onValueChange={(value) => handleInputChange('brand', value)}
                      disabled={loadingBrands}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingBrands ? "Loading brands..." : "Select brand"} />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal">Reel Goal</Label>
                    <Select value={formData.goal} onValueChange={(value) => handleInputChange('goal', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engagement">📈 Increase Engagement</SelectItem>
                        <SelectItem value="awareness">🎯 Build Brand Awareness</SelectItem>
                        <SelectItem value="sales">💰 Drive Sales</SelectItem>
                        <SelectItem value="education">📚 Educate Audience</SelectItem>
                        <SelectItem value="entertainment">🎪 Entertain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Reel Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Summer fashion essentials, Tech gadget review, Morning routine"
                    value={formData.topic}
                    onChange={(e) => handleInputChange('topic', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">⚡ 15 seconds (Quick & Punchy)</SelectItem>
                        <SelectItem value="30">🎯 30 seconds (Standard)</SelectItem>
                        <SelectItem value="60">📖 60 seconds (Detailed)</SelectItem>
                        <SelectItem value="90">🎬 90 seconds (In-depth)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="style">Visual Style</Label>
                    <Select value={formData.style} onValueChange={(value) => handleInputChange('style', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product-showcase">✨ Product Showcase</SelectItem>
                        <SelectItem value="tutorial">📚 Tutorial/How-to</SelectItem>
                        <SelectItem value="before-after">🔄 Before & After</SelectItem>
                        <SelectItem value="lifestyle">🌟 Lifestyle</SelectItem>
                        <SelectItem value="unboxing">📦 Unboxing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tone">Brand Tone</Label>
                    <Select value={formData.tone} onValueChange={(value) => handleInputChange('tone', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">💼 Professional</SelectItem>
                        <SelectItem value="casual">😊 Casual & Fun</SelectItem>
                        <SelectItem value="luxury">👑 Luxury & Premium</SelectItem>
                        <SelectItem value="educational">🎓 Educational</SelectItem>
                        <SelectItem value="trendy">🔥 Trendy & Hip</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Input
                      id="targetAudience"
                      placeholder="e.g., Young professionals, Fashion enthusiasts"
                      value={formData.targetAudience}
                      onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hookIdea">Hook Idea (Optional)</Label>
                  <Input
                    id="hookIdea"
                    placeholder="e.g., You won't believe this transformation..."
                    value={formData.hookIdea}
                    onChange={(e) => handleInputChange('hookIdea', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    The opening line that grabs attention in the first 3 seconds
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="callToAction">Call to Action</Label>
                  <Input
                    id="callToAction"
                    placeholder="e.g., Follow for more style tips, Save this for later!"
                    value={formData.callToAction}
                    onChange={(e) => handleInputChange('callToAction', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <ProductGallery
              onSelectImages={handleProductSelection}
              selectedImages={formData.products}
              multiSelect={true}
              className="min-h-[600px]"
            />
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <Card>
              <CardHeader>
                <CardTitle>Advanced Options</CardTitle>
                <CardDescription>
                  Fine-tune your content generation with custom parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customPrompt">Custom AI Prompt (Optional)</Label>
                  <Textarea
                    id="customPrompt"
                    placeholder="Add specific instructions for the AI to follow when generating your script..."
                    value={formData.customPrompt}
                    onChange={(e) => handleInputChange('customPrompt', e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Example: "Focus on sustainability benefits" or "Include pricing information"
                  </p>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Pro tip:</strong> The more specific your inputs, the better your generated content will be. 
                    Include details about your brand voice, key messages, and unique selling points.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Selected Products Summary */}
          {formData.products.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Selected Products ({formData.products.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {formData.products.map((product) => (
                    <Badge key={product.url} variant="secondary" className="flex items-center gap-1">
                      <img
                        src={product.url}
                        alt={product.name}
                        className="w-4 h-4 rounded object-cover"
                      />
                      {product.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generate Button */}
          <Button
            className="w-full h-12 text-lg"
            disabled={loading || !canGenerate}
            onClick={generateReelScript}
          >
            {loading ? (
              <>
                <Wand2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Your AI-Powered Reel Script...
              </>
            ) : (
              <>
                <Video className="mr-2 h-5 w-5" />
                Generate Reel Script with AI
              </>
            )}
          </Button>

          {!canGenerate && (
            <p className="text-sm text-muted-foreground text-center">
              Please fill in Topic, Goal, and Duration to generate your script
            </p>
          )}
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          {!generatedContent ? (
            <Card>
              <CardHeader>
                <CardTitle>Generated Script</CardTitle>
                <CardDescription>
                  Your AI-generated Instagram Reel script will appear here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="min-h-[400px] p-8 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-center text-muted-foreground">
                  <Play className="h-12 w-12 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Create?</h3>
                  <p className="mb-4">Fill in the reel details and select products to generate your script</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      AI-Powered
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-blue-500" />
                      30 seconds
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4 text-purple-500" />
                      Optimized
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Generated Script */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Generated Script</CardTitle>
                    <CardDescription>
                      Professional reel script with visual cues and timing
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(generatedContent.script)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap font-mono">
                      {generatedContent.script}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Engagement Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Engagement Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {generatedContent.engagement.estimatedReach}
                      </div>
                      <div className="text-sm text-muted-foreground">Estimated Reach</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {generatedContent.engagement.bestPostingTimes[0]}
                      </div>
                      <div className="text-sm text-muted-foreground">Best Posting Time</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Target Demographics:</h4>
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.engagement.targetDemographics.map((demo, index) => (
                        <Badge key={index} variant="outline">
                          <Users className="h-3 w-3 mr-1" />
                          {demo}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    AI Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Hashtags */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Hashtags</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(generatedContent.hashtags.join(' '))}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.hashtags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-blue-600">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Audio Suggestions */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Music className="h-4 w-4 text-pink-500" />
                      <span className="font-medium">Audio Suggestions</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      {generatedContent.audioSuggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2 p-2 bg-muted rounded">
                          <span className="text-pink-500 mt-1">♪</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  {/* Posting Tips */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Optimization Tips</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      {generatedContent.postingTips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded border-l-2 border-green-500">
                          <span className="text-green-500 mt-1">💡</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  {/* Visual Cues */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">Visual Guidelines</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      {generatedContent.visualCues.map((cue, index) => (
                        <li key={index} className="flex items-start gap-2 p-2 bg-purple-50 rounded border-l-2 border-purple-500">
                          <span className="text-purple-500 mt-1">🎬</span>
                          <span>{cue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card>
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                  <CardDescription>
                    What would you like to do with your generated content?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={saveToDatabase}
                    disabled={savingToDatabase}
                  >
                    {savingToDatabase ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving to Content Library...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save to Content Library
                      </>
                    )}
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const fullContent = `${generatedContent.script}\n\n${generatedContent.hashtags.join(' ')}`;
                        copyToClipboard(fullContent);
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy All
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => {
                        // Reset form for new generation
                        setGeneratedContent(null);
                        setFormData(prev => ({
                          ...prev,
                          topic: '',
                          hookIdea: '',
                          products: []
                        }));
                      }}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Create New
                    </Button>
                  </div>

                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Pro tip:</strong> Test different variations of your script and compare performance. 
                      Save the best-performing versions to your content library for future reference.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
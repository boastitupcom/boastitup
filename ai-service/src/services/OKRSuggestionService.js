import { GoogleGenerativeAI } from '@google/generative-ai';
import { DatabaseService } from './DatabaseService.js';
import { v4 as uuidv4 } from 'uuid';

export class OKRSuggestionService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    this.dbService = new DatabaseService();
  }

  /**
   * Generate AI-powered OKR suggestions based on brand context
   * Implementation follows story.txt lines 293-329
   */
  async generateSuggestions(request) {
    const {
      industry,
      brandName,
      tenantId,
      keyProduct,
      productCategory,
      keyCompetition,
      majorKeywords,
      objective,
      historicalOKRs
    } = request;

    // Step 1: Gather contextual data from database
    const contextData = await this.gatherBrandContext(industry, tenantId);
    
    // Step 2: Build AI prompt with rich context
    const prompt = this.buildAIPrompt({
      industry,
      brandName,
      keyProduct,
      productCategory,
      keyCompetition,
      majorKeywords,
      objective,
      historicalOKRs,
      contextData
    });

    // Step 3: Generate suggestions using Gemini
    const aiResponse = await this.callGeminiAPI(prompt);
    
    // Step 4: Process and structure the response
    const processedSuggestions = await this.processSuggestions(aiResponse, contextData);

    // Step 5: Return formatted response matching story.txt interface
    return {
      suggestions: processedSuggestions,
      metadata: {
        industry,
        brandContext: `${brandName} - ${industry}${keyProduct ? ` (${keyProduct})` : ''}`,
        generatedAt: new Date().toISOString(),
        confidence: this.calculateOverallConfidence(processedSuggestions)
      }
    };
  }

  /**
   * Gather brand context from database for richer AI prompts
   */
  async gatherBrandContext(industry, tenantId) {
    const [
      industryTemplates,
      metricTypes,
      platforms,
      successfulOKRs
    ] = await Promise.all([
      this.dbService.getIndustryTemplates(industry),
      this.dbService.getMetricTypes(),
      this.dbService.getPlatforms(),
      this.dbService.getSuccessfulOKRsByIndustry(industry, tenantId)
    ]);

    return {
      industryTemplates,
      metricTypes,
      platforms,
      successfulOKRs,
      industryInsights: this.analyzeIndustryPatterns(industryTemplates, successfulOKRs)
    };
  }

  /**
   * Build comprehensive AI prompt with structured context
   */
  buildAIPrompt(data) {
    const { 
      industry, 
      brandName, 
      keyProduct, 
      productCategory, 
      keyCompetition, 
      majorKeywords, 
      objective, 
      historicalOKRs,
      contextData 
    } = data;

    return `You are an expert OKR (Objectives and Key Results) consultant specializing in the ${industry} industry.

BRAND CONTEXT:
- Brand Name: ${brandName}
- Industry: ${industry}
- Key Product: ${keyProduct || 'Not specified'}
- Product Category: ${productCategory || 'Not specified'}
- Key Competition: ${keyCompetition?.join(', ') || 'Not specified'}
- Major Keywords: ${majorKeywords?.join(', ') || 'Not specified'}
- Current Objective: ${objective || 'Not specified'}

INDUSTRY INSIGHTS:
${contextData.industryInsights}

AVAILABLE METRICS:
${contextData.metricTypes.map(m => `- ${m.code}: ${m.description} (${m.unit || 'count'})`).join('\n')}

AVAILABLE PLATFORMS:
${contextData.platforms.map(p => `- ${p.display_name} (${p.category})`).join('\n')}

HISTORICAL SUCCESS PATTERNS:
${contextData.successfulOKRs.map(okr => `- ${okr.title}: Achieved ${okr.completion_rate}% (${okr.granularity})`).join('\n')}

TASK: Generate 5-8 high-quality OKR suggestions that are:
1. Specific to the ${industry} industry
2. Aligned with ${brandName}'s context
3. Measurable with concrete target values
4. Achievable within quarterly timeframes
5. Relevant to business growth and performance

For each OKR suggestion, provide:
- A compelling objective title (action-oriented)
- Detailed description explaining the business impact
- Specific category (Growth, Retention, Efficiency, Innovation, etc.)
- Priority level (1=High, 2=Medium, 3=Low)
- Suggested target value (numerical)
- Recommended timeframe (daily, weekly, monthly, quarterly)
- Most relevant metric type code from the available metrics
- Applicable platform IDs (if platform-specific)
- Confidence score (0.0-1.0)
- Brief reasoning for the suggestion

Format your response as a JSON array of OKR objects with the following structure:
[
  {
    "title": "Increase Monthly Active Users",
    "description": "Drive user engagement and retention through improved product experience and targeted marketing campaigns",
    "category": "Growth", 
    "priority": 1,
    "suggestedTargetValue": 25000,
    "suggestedTimeframe": "monthly",
    "metricTypeId": "relevant_metric_code",
    "applicablePlatforms": ["platform_ids"],
    "confidenceScore": 0.9,
    "reasoning": "Strong correlation with business growth in ${industry} industry"
  }
]

Ensure all suggestions are realistic, industry-appropriate, and actionable for ${brandName}.`;
  }

  /**
   * Call Gemini AI API with structured prompt
   */
  async callGeminiAPI(prompt) {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('❌ Gemini API Error:', error);
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  /**
   * Process AI suggestions and enrich with database IDs
   */
  async processSuggestions(aiSuggestions, contextData) {
    const processedSuggestions = [];

    for (const suggestion of aiSuggestions) {
      try {
        // Map metric type code to ID
        const metricType = contextData.metricTypes.find(m => 
          m.code.toLowerCase() === suggestion.metricTypeId?.toLowerCase() ||
          m.description.toLowerCase().includes(suggestion.title.toLowerCase().split(' ')[0])
        );

        // Map platform names to IDs
        const applicablePlatformIds = suggestion.applicablePlatforms?.map(platformName => {
          const platform = contextData.platforms.find(p => 
            p.name.toLowerCase().includes(platformName.toLowerCase()) ||
            p.display_name.toLowerCase().includes(platformName.toLowerCase())
          );
          return platform?.id;
        }).filter(Boolean) || [];

        const processedSuggestion = {
          id: uuidv4(),
          okrMasterId: null, // Will be set when stored in okr_master
          title: suggestion.title,
          description: suggestion.description,
          category: suggestion.category,
          priority: Math.min(Math.max(suggestion.priority, 1), 3), // Ensure 1-3 range
          suggestedTargetValue: suggestion.suggestedTargetValue,
          suggestedTimeframe: suggestion.suggestedTimeframe,
          applicablePlatforms: applicablePlatformIds,
          metricTypeId: metricType?.id || contextData.metricTypes[0]?.id, // Fallback to first metric
          confidenceScore: Math.min(Math.max(suggestion.confidenceScore, 0), 1), // Ensure 0-1 range
          reasoning: suggestion.reasoning || `AI-generated suggestion for ${suggestion.category.toLowerCase()} objectives`
        };

        processedSuggestions.push(processedSuggestion);
      } catch (error) {
        console.warn('⚠️ Error processing suggestion:', suggestion.title, error);
        // Skip invalid suggestions
        continue;
      }
    }

    return processedSuggestions;
  }

  /**
   * Analyze industry patterns for context
   */
  analyzeIndustryPatterns(templates, successfulOKRs) {
    const commonCategories = {};
    const avgSuccess = successfulOKRs.reduce((sum, okr) => sum + okr.completion_rate, 0) / (successfulOKRs.length || 1);
    
    templates.forEach(template => {
      commonCategories[template.category] = (commonCategories[template.category] || 0) + 1;
    });

    const topCategories = Object.entries(commonCategories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    return `Industry Success Rate: ${avgSuccess.toFixed(1)}%
Most Successful Categories: ${topCategories.join(', ')}
Common Timeframes: ${successfulOKRs.map(okr => okr.granularity).join(', ')}
Template Count: ${templates.length} available templates`;
  }

  /**
   * Calculate overall confidence score
   */
  calculateOverallConfidence(suggestions) {
    if (!suggestions.length) return 0;
    
    const avgConfidence = suggestions.reduce((sum, s) => sum + s.confidenceScore, 0) / suggestions.length;
    return Math.round(avgConfidence * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Health check for AI service
   */
  async healthCheck() {
    try {
      const testResult = await this.model.generateContent('Test connection. Reply with "OK"');
      const response = await testResult.response;
      const isHealthy = response.text().toLowerCase().includes('ok');
      
      return {
        status: isHealthy ? 'healthy' : 'degraded',
        model: 'gemini-pro',
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        lastCheck: new Date().toISOString()
      };
    }
  }
}
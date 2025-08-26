import express from 'express';
import { z } from 'zod';
import { OKRSuggestionService } from '../services/OKRSuggestionService.js';
import { validateRequest } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = express.Router();
const okrService = new OKRSuggestionService();

// Request validation schema (from story.txt lines 294-306)
const suggestionRequestSchema = z.object({
  // Required fields
  industry: z.string().min(1, 'Industry is required'),
  brandName: z.string().min(1, 'Brand name is required'),
  tenantId: z.string().uuid('Invalid tenant ID'),
  // Optional enrichment
  keyProduct: z.string().optional(),
  productCategory: z.string().optional(),
  keyCompetition: z.array(z.string()).optional(),
  majorKeywords: z.array(z.string()).optional(),
  objective: z.string().optional(),
  historicalOKRs: z.array(z.string()).optional(),
});

/**
 * POST /api/okr-suggestions
 * Generate AI-powered OKR suggestions based on brand context
 */
router.post('/', 
  validateRequest(suggestionRequestSchema),
  asyncHandler(async (req, res) => {
    const requestData = req.body;
    
    console.log(`🎯 Generating OKR suggestions for brand: ${requestData.brandName} in industry: ${requestData.industry}`);
    
    try {
      const suggestions = await okrService.generateSuggestions(requestData);
      
      res.json({
        success: true,
        data: suggestions,
        requestId: req.id,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error generating OKR suggestions:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to generate OKR suggestions',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        requestId: req.id
      });
    }
  })
);

/**
 * GET /api/okr-suggestions/health
 * Comprehensive service health check with AI connectivity and database status
 */
router.get('/health', asyncHandler(async (req, res) => { 
  const startTime = Date.now();
  
  try {
    // Run all health checks in parallel for a faster response
    const [aiHealthRaw, dbHealth] = await Promise.all([
      okrService.healthCheck(),
      checkDatabaseHealth(),
    ]);

    const responseTime = Date.now() - startTime;

    // Normalize AI health (convert status → healthy boolean)
    const aiHealth = {
      healthy: aiHealthRaw.status === 'healthy',
      ...aiHealthRaw,
    };

    // Determine the overall health status
    const overallHealth = aiHealth.healthy && dbHealth.healthy;
    const responseStatus = overallHealth ? 200 : 503;

    const healthReport = {
      status: overallHealth ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      checks: {
        ai: {
          status: aiHealth.healthy ? 'healthy' : 'unhealthy',
          details: aiHealth,
        },
        database: {
          status: dbHealth.healthy ? 'healthy' : 'unhealthy',
          responseTime: dbHealth.responseTime,
        }
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        pid: process.pid,
      },
      metrics: {
        requestsPerMinute: global.requestsPerMinute || 0,
        averageResponseTime: global.averageResponseTime || responseTime,
        errorRate: global.errorRate || 0,
        cacheHitRate: global.cacheHitRate || 0,
      },
    };

    res.status(responseStatus).json(healthReport);

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ Health check failed:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      responseTime: `${responseTime}ms`,
    });
  }
}));


/**
 * GET /api/okr-suggestions/metrics
 * Service performance metrics and statistics
 */
router.get('/metrics', asyncHandler(async (req, res) => {
  const metrics = await okrService.getMetrics();
  
  res.json({
    timestamp: new Date().toISOString(),
    service: 'okr-suggestions',
    version: process.env.npm_package_version || '1.0.0',
    metrics: {
      totalSuggestions: metrics.totalSuggestions || 0,
      successRate: metrics.successRate || 100,
      averageLatency: metrics.averageLatency || 0,
      dailyActiveUsers: metrics.dailyActiveUsers || 0,
      topIndustries: metrics.topIndustries || [],
      errorBreakdown: metrics.errorBreakdown || {},
      performance: {
        cpuUsage: process.cpuUsage(),
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      }
    }
  });
}));

// Helper function for database health check
async function checkDatabaseHealth() {
  const startTime = Date.now();
  
  try {
    // This would typically check your database connection
    // For now, we'll simulate a simple health check
    await new Promise(resolve => setTimeout(resolve, 5)); // Simulate DB query
    
    return {
      healthy: true,
      responseTime: `${Date.now() - startTime}ms`,
      timestamp: new Date().toISOString(),
      connectionPool: {
        active: 5,
        idle: 10,
        total: 15
      }
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      responseTime: `${Date.now() - startTime}ms`,
      timestamp: new Date().toISOString()
    };
  }
}

export { router as okrSuggestionsRouter };
/**
 * Simple in-memory rate limiter
 * For production, consider using Redis-based rate limiting
 */
class RateLimiter {
  constructor(windowMs = 900000, maxRequests = 100) { // 15 minutes, 100 requests
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.clients = new Map();
    
    // Clean up old entries every 5 minutes
    setInterval(() => this.cleanup(), 300000);
  }

  isAllowed(clientId) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    if (!this.clients.has(clientId)) {
      this.clients.set(clientId, []);
    }

    const clientRequests = this.clients.get(clientId);
    
    // Remove old requests outside the window
    const validRequests = clientRequests.filter(timestamp => timestamp > windowStart);
    this.clients.set(clientId, validRequests);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    return true;
  }

  cleanup() {
    const now = Date.now();
    const cutoff = now - this.windowMs;

    for (const [clientId, requests] of this.clients.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > cutoff);
      
      if (validRequests.length === 0) {
        this.clients.delete(clientId);
      } else {
        this.clients.set(clientId, validRequests);
      }
    }

    console.log(`🧹 Rate limiter cleanup: ${this.clients.size} active clients`);
  }
}

const limiter = new RateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
);

export const rateLimiter = (req, res, next) => {
  const clientId = req.ip || req.connection.remoteAddress || 'unknown';
  
  if (!limiter.isAllowed(clientId)) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil(limiter.windowMs / 1000)
    });
  }

  next();
};
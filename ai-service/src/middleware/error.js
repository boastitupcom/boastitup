/**
 * Global error handler middleware
 */
export const errorHandler = (error, req, res, next) => {
  console.error(`❌ Error [${req.id}]:`, error);

  const isDevelopment = process.env.NODE_ENV === 'development';

  // Default error response
  const errorResponse = {
    success: false,
    error: 'Internal server error',
    requestId: req.id,
    timestamp: new Date().toISOString()
  };

  // Add detailed error info in development
  if (isDevelopment) {
    errorResponse.details = {
      message: error.message,
      stack: error.stack,
      name: error.name
    };
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    errorResponse.error = 'Request validation failed';
    errorResponse.status = 400;
  } else if (error.name === 'DatabaseError') {
    errorResponse.error = 'Database operation failed';
    errorResponse.status = 503;
  } else if (error.name === 'AIServiceError') {
    errorResponse.error = 'AI service unavailable';
    errorResponse.status = 502;
  }

  const statusCode = errorResponse.status || 500;
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 handler for unmatched routes
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
};
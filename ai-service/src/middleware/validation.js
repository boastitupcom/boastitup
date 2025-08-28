import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to validate request data against Zod schema
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    // Add request ID for tracking
    req.id = uuidv4();
    
    try {
      // Validate request body
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      // Zod validation error
      const errorDetails = error.errors?.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      })) || [];

      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorDetails,
        requestId: req.id
      });
    }
  };
};
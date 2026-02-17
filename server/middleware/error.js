// Error handling middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  console.error(`[Error Handler] ${req.method} ${req.originalUrl}`);
  console.error(`[Error Handler] Status: ${err.statusCode}`);
  console.error(`[Error Handler] Message: ${err.message}`);
  console.error(`[Error Handler] Stack:`, err.stack);

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate Field Value Entered`;
    err = new Error(message);
    err.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    err = new Error(message);
    err.statusCode = 400;
  }

  // Ensure response is always JSON
  res.setHeader('Content-Type', 'application/json');
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;

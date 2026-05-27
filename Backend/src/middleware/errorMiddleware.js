export const errorHandler = (err, req, res, next) => {
  // FIX 2: Specific error types ka status code
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  if (err.name === "ValidationError") statusCode = 400;
  if (err.name === "CastError") statusCode = 400;
  if (err.code === 11000) statusCode = 409;

  // FIX 1: Logging
  console.error(`[${req.method}] ${req.path} → ${statusCode}:`, err.message);

  res.status(statusCode).json({
    message:
      err.code === 11000
        ? "Yeh record pehle se exist karta hai"
        : err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
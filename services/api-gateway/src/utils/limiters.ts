import rateLimit from "express-rate-limit";

// Auth limiter: 50 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: "Too many requests to /auth, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Order limiter: 10 requests per minute
export const orderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many requests to /order, please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

const { default: rateLimit } = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: "too many requests, please try again after 10 minutes",

  keyGenerator: (req, res) => {
    if (req.body.phone) {
      return req.body.phone; // per-user limit
    }
    return ipKeyGenerator(req); // proper IPv6-safe fallback
  },
});
module.exports = limiter;

package middleware

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
)

// RateLimit creates a rate limiting middleware
func RateLimit() fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        100,               // Maximum number of requests
		Expiration: 15 * time.Minute,  // Time window
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP() // Use IP address as the key
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error":   "Too Many Requests",
				"message": "Rate limit exceeded. Please try again later.",
				"retry_after": 15 * 60, // 15 minutes in seconds
			})
		},
		SkipFailedRequests:     false,
		SkipSuccessfulRequests: false,
	})
}

// AuthRateLimit creates a stricter rate limiting for auth endpoints
func AuthRateLimit() fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        10,                // Only 10 login attempts
		Expiration: 15 * time.Minute,  // Per 15 minutes
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error":   "Too Many Login Attempts",
				"message": "Too many login attempts. Please try again in 15 minutes.",
				"retry_after": 15 * 60,
			})
		},
		SkipFailedRequests:     false,
		SkipSuccessfulRequests: true, // Don't count successful logins
	})
}

// UploadRateLimit creates rate limiting for file uploads
func UploadRateLimit() fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        20,               // 20 uploads per hour
		Expiration: 1 * time.Hour,    // Per hour
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error":   "Upload Limit Exceeded",
				"message": "Too many uploads. Please try again in an hour.",
				"retry_after": 60 * 60, // 1 hour in seconds
			})
		},
		SkipFailedRequests:     true,  // Don't count failed uploads
		SkipSuccessfulRequests: false,
	})
}

// ContactRateLimit creates rate limiting for contact form submissions
func ContactRateLimit() fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        5,                // 5 contact submissions
		Expiration: 1 * time.Hour,    // Per hour
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error":   "Contact Limit Exceeded",
				"message": "Too many contact submissions. Please try again in an hour.",
				"retry_after": 60 * 60,
			})
		},
		SkipFailedRequests:     true,
		SkipSuccessfulRequests: false,
	})
}

// APIRateLimit creates a general API rate limit
func APIRateLimit() fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        1000,             // 1000 requests
		Expiration: 1 * time.Hour,    // Per hour
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error":   "API Rate Limit Exceeded",
				"message": "API rate limit exceeded. Please try again later.",
				"retry_after": 60 * 60,
			})
		},
		SkipFailedRequests:     false,
		SkipSuccessfulRequests: false,
	})
} 
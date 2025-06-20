package config

import (
	"os"
	"strconv"
	"strings"
	"time"
)

// Config holds all configuration for the application
type Config struct {
	// Server
	Port        string
	Environment string
	CorsOrigin  string

	// Database
	DatabaseURL string
	DBHost      string
	DBPort      string
	DBName      string
	DBUser      string
	DBPassword  string

	// JWT
	JWTSecret    string
	JWTExpiresIn time.Duration

	// AWS S3
	AWSAccessKeyID     string
	AWSSecretAccessKey string
	AWSRegion          string
	AWSS3Bucket        string
	AWSS3BucketThumbs  string
	AWSCloudFrontURL   string

	// Stripe
	StripeSecretKey     string
	StripePublishableKey string
	StripeWebhookSecret string
	StripeSuccessURL    string
	StripeCancelURL     string

	// Email
	SMTPHost    string
	SMTPPort    int
	SMTPUser    string
	SMTPPass    string
	FromEmail   string
	ContactEmail string

	// Rate Limiting
	RateLimitRequests int
	RateLimitWindow   time.Duration

	// File Upload
	MaxFileSize        int64
	AllowedImageTypes  []string
	AllowedVideoTypes  []string
}

// LoadConfig loads configuration from environment variables
func LoadConfig() *Config {
	cfg := &Config{
		Port:        getEnv("PORT", "8080"),
		Environment: getEnv("ENVIRONMENT", "development"),
		CorsOrigin:  getEnv("CORS_ORIGIN", "http://localhost:3000"),

		DatabaseURL: getEnv("DATABASE_URL", ""),
		DBHost:      getEnv("DB_HOST", "localhost"),
		DBPort:      getEnv("DB_PORT", "5432"),
		DBName:      getEnv("DB_NAME", "portfolio"),
		DBUser:      getEnv("DB_USER", "user"),
		DBPassword:  getEnv("DB_PASSWORD", "password"),

		JWTSecret:    getEnv("JWT_SECRET", "your-secret-key"),
		JWTExpiresIn: parseDuration(getEnv("JWT_EXPIRES_IN", "24h"), 24*time.Hour),

		AWSAccessKeyID:     getEnv("AWS_ACCESS_KEY_ID", ""),
		AWSSecretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY", ""),
		AWSRegion:          getEnv("AWS_REGION", "us-east-1"),
		AWSS3Bucket:        getEnv("AWS_S3_BUCKET", ""),
		AWSS3BucketThumbs:  getEnv("AWS_S3_BUCKET_THUMBNAILS", ""),
		AWSCloudFrontURL:   getEnv("AWS_CLOUDFRONT_URL", ""),

		StripeSecretKey:     getEnv("STRIPE_SECRET_KEY", ""),
		StripePublishableKey: getEnv("STRIPE_PUBLISHABLE_KEY", ""),
		StripeWebhookSecret: getEnv("STRIPE_WEBHOOK_SECRET", ""),
		StripeSuccessURL:    getEnv("STRIPE_SUCCESS_URL", "http://localhost:3000/success"),
		StripeCancelURL:     getEnv("STRIPE_CANCEL_URL", "http://localhost:3000/cancel"),

		SMTPHost:     getEnv("SMTP_HOST", ""),
		SMTPPort:     parseInt(getEnv("SMTP_PORT", "587"), 587),
		SMTPUser:     getEnv("SMTP_USER", ""),
		SMTPPass:     getEnv("SMTP_PASS", ""),
		FromEmail:    getEnv("FROM_EMAIL", "noreply@portfolio.com"),
		ContactEmail: getEnv("CONTACT_EMAIL", "contact@portfolio.com"),

		RateLimitRequests: parseInt(getEnv("RATE_LIMIT_REQUESTS", "100"), 100),
		RateLimitWindow:   parseDuration(getEnv("RATE_LIMIT_WINDOW", "900s"), 15*time.Minute),

		MaxFileSize:       parseFileSize(getEnv("MAX_FILE_SIZE", "50MB"), 50*1024*1024),
		AllowedImageTypes: parseStringSlice(getEnv("ALLOWED_IMAGE_TYPES", "jpg,jpeg,png,webp")),
		AllowedVideoTypes: parseStringSlice(getEnv("ALLOWED_VIDEO_TYPES", "mp4,mov,avi")),
	}

	return cfg
}

// getEnv gets an environment variable with a fallback value
func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

// parseInt parses a string to int with fallback
func parseInt(s string, fallback int) int {
	if i, err := strconv.Atoi(s); err == nil {
		return i
	}
	return fallback
}

// parseDuration parses a string to time.Duration with fallback
func parseDuration(s string, fallback time.Duration) time.Duration {
	if d, err := time.ParseDuration(s); err == nil {
		return d
	}
	return fallback
}

// parseFileSize parses file size string (e.g., "50MB") to bytes
func parseFileSize(s string, fallback int64) int64 {
	// Simple parsing for MB
	if len(s) > 2 && s[len(s)-2:] == "MB" {
		if size, err := strconv.ParseInt(s[:len(s)-2], 10, 64); err == nil {
			return size * 1024 * 1024
		}
	}
	return fallback
}

// parseStringSlice parses comma-separated string to slice
func parseStringSlice(s string) []string {
	if s == "" {
		return []string{}
	}
	result := []string{}
	for _, item := range strings.Split(s, ",") {
		if trimmed := strings.TrimSpace(item); trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}

// IsProduction checks if the environment is production
func (c *Config) IsProduction() bool {
	return c.Environment == "production"
}

// IsDevelopment checks if the environment is development
func (c *Config) IsDevelopment() bool {
	return c.Environment == "development"
} 
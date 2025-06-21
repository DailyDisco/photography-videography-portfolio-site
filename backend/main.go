package main

import (
	"log"
	"os"

	"photography-portfolio/config"
	"photography-portfolio/handlers"
	"photography-portfolio/middleware"
	"photography-portfolio/models"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables - try different env files
	envFiles := []string{"../env.development", ".env", "../.env"}
	var envLoaded bool
	
	for _, envFile := range envFiles {
		if err := godotenv.Load(envFile); err == nil {
			log.Printf("✅ Loaded environment from: %s", envFile)
			envLoaded = true
			break
		}
	}
	
	if !envLoaded {
		log.Println("⚠️  Warning: No environment file found, using system environment variables")
	}

	// Initialize configuration
	cfg := config.LoadConfig()

	// Initialize database
	db, err := config.InitDatabase(cfg)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto-migrate database models
	if err := models.MigrateModels(db); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Initialize Fiber app
	app := fiber.New(fiber.Config{
		ErrorHandler: middleware.ErrorHandler,
		BodyLimit:    50 * 1024 * 1024, // 50MB
	})

	// Global middleware
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${method} ${path} ${latency}\n",
	}))

	// CORS middleware
	app.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.CorsOrigin,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, DELETE, OPTIONS",
		AllowCredentials: true,
	}))

	// Rate limiting middleware
	app.Use(middleware.RateLimit())

	// Health check endpoint
	app.Get("/api/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "Photography Portfolio API is running",
			"version": "1.0.0",
		})
	})

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(db, cfg)
	mediaHandler := handlers.NewMediaHandler(db, cfg)
	contactHandler := handlers.NewContactHandler(db, cfg)
	stripeHandler := handlers.NewStripeHandler(db, cfg)
	adminHandler := handlers.NewAdminHandler(db)

	// API routes
	api := app.Group("/api")

	// Auth routes
	auth := api.Group("/auth")
	auth.Post("/login", authHandler.Login)
	auth.Post("/logout", authHandler.Logout)
	auth.Get("/me", middleware.AuthRequired(cfg), authHandler.GetProfile)

	// Media routes
	media := api.Group("/media")
	media.Get("/:category", mediaHandler.GetMediaByCategory)
	media.Get("/item/:id", mediaHandler.GetMediaItem)
	
	// Protected media routes (admin only)
	mediaAdmin := media.Use(middleware.AuthRequired(cfg))
	mediaAdmin.Post("/upload", mediaHandler.UploadMedia)
	mediaAdmin.Put("/:id", mediaHandler.UpdateMedia)
	mediaAdmin.Delete("/:id", mediaHandler.DeleteMedia)
	mediaAdmin.Delete("/bulk", mediaHandler.BulkDeleteMedia)
	mediaAdmin.Get("/admin/all", mediaHandler.GetAllMediaAdmin)

	// Contact routes
	api.Post("/contact", contactHandler.SubmitContact)
	
	// Protected contact routes (admin only)
	contactAdmin := api.Group("/contact", middleware.AuthRequired(cfg))
	contactAdmin.Get("/messages", adminHandler.GetContactMessages)
	contactAdmin.Put("/messages/:id/read", adminHandler.MarkMessageAsRead)
	contactAdmin.Put("/messages/:id/unread", adminHandler.MarkMessageAsUnread)
	contactAdmin.Delete("/messages/:id", adminHandler.DeleteMessage)

	// Stripe routes
	stripe := api.Group("/stripe")
	stripe.Post("/checkout", stripeHandler.CreateCheckoutSession)
	stripe.Get("/success", stripeHandler.HandleSuccess)
	stripe.Get("/cancel", stripeHandler.HandleCancel)
	stripe.Post("/webhook", stripeHandler.HandleWebhook)

	// Admin routes (protected)
	admin := api.Group("/admin", middleware.AuthRequired(cfg))
	admin.Get("/dashboard", adminHandler.GetDashboard)
	admin.Get("/analytics", adminHandler.GetAnalytics)

	// Static files - serve uploaded media
	app.Static("/uploads", "./uploads")

	// 404 handler
	app.Use(func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   "Not Found",
			"message": "The requested resource was not found",
		})
	})

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Server starting on port %s", port)
	log.Printf("📊 Environment: %s", cfg.Environment)
	log.Printf("🗄️  Database: Connected")
	log.Printf("🔗 CORS Origin: %s", cfg.CorsOrigin)

	if err := app.Listen(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
} 
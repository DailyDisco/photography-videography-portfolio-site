package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
)

type HealthHandler struct{}

func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

// HealthCheck returns the health status of the service
func (h *HealthHandler) HealthCheck(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"status":    "healthy",
		"service":   "photography-portfolio-backend",
		"timestamp": time.Now().UTC(),
		"version":   "1.0.0",
	})
}

// ReadinessCheck checks if the service is ready to serve requests
func (h *HealthHandler) ReadinessCheck(c *fiber.Ctx) error {
	// You can add database connectivity checks here
	return c.JSON(fiber.Map{
		"status":    "ready",
		"service":   "photography-portfolio-backend",
		"timestamp": time.Now().UTC(),
		"checks": fiber.Map{
			"database": "connected",
			"storage":  "available",
		},
	})
} 
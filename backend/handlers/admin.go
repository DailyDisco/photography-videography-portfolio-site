package handlers

import (
	"github.com/gofiber/fiber/v2"
)

// GetDashboard returns admin dashboard data
func GetDashboard(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"message": "Dashboard handler not implemented yet",
	})
}

// GetAnalytics returns admin analytics data
func GetAnalytics(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"message": "Analytics handler not implemented yet",
	})
} 
package handlers

import (
	"photography-portfolio/config"
	"photography-portfolio/models"
	"photography-portfolio/utils"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type AuthHandler struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewAuthHandler(db *gorm.DB, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		db:  db,
		cfg: cfg,
	}
}

// Login handles user authentication
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req models.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
		})
	}

	// Find user by email
	var user models.User
	if err := h.db.Where("email = ? AND is_active = ?", req.Email, true).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(401).JSON(fiber.Map{
				"success": false,
				"message": "Invalid email or password",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Database error",
		})
	}

	// Check password
	if !user.CheckPassword(req.Password) {
		return c.Status(401).JSON(fiber.Map{
			"success": false,
			"message": "Invalid email or password",
		})
	}

	// Update last login time
	if err := user.UpdateLastLogin(h.db); err != nil {
		// Log error but don't fail the login
		// log.Printf("Failed to update last login: %v", err)
	}

	// Generate JWT token
	token, err := utils.GenerateJWT(user.ID, user.Email, user.Role, h.cfg.JWTSecret, h.cfg.JWTExpiresIn)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Failed to generate token",
		})
	}

	// Return successful login response
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Login successful",
		"data": fiber.Map{
			"user":  user.ToResponse(),
			"token": token,
		},
	})
}

// Logout handles user logout
func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	// In a JWT-based system, logout is typically handled client-side
	// by removing the token. Server-side logout would require token blacklisting.
	// For now, we'll just return a success response.
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Logout successful",
	})
}

// GetProfile returns the current user's profile
func (h *AuthHandler) GetProfile(c *fiber.Ctx) error {
	// Get user ID from JWT token (set by auth middleware)
	userIDRaw := c.Locals("userID")
	if userIDRaw == nil {
		return c.Status(401).JSON(fiber.Map{
			"success": false,
			"message": "User ID not found in token",
		})
	}

	// Convert userID to uint (JWT claims store numbers as float64)
	var userID uint
	switch v := userIDRaw.(type) {
	case float64:
		userID = uint(v)
	case int:
		userID = uint(v)
	case uint:
		userID = v
	default:
		return c.Status(401).JSON(fiber.Map{
			"success": false,
			"message": "Invalid user ID format",
		})
	}

	var user models.User
	if err := h.db.First(&user, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{
				"success": false,
				"message": "User not found",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Database error",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    user.ToResponse(),
	})
} 
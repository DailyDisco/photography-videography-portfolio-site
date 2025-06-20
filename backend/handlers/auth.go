package handlers

import (
	"photography-portfolio/config"

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

// TODO: Implement auth handlers
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Auth handler not implemented yet"})
}

func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Auth handler not implemented yet"})
}

func (h *AuthHandler) GetProfile(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Auth handler not implemented yet"})
} 
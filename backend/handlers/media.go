package handlers

import (
	"photography-portfolio/config"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type MediaHandler struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewMediaHandler(db *gorm.DB, cfg *config.Config) *MediaHandler {
	return &MediaHandler{
		db:  db,
		cfg: cfg,
	}
}

// TODO: Implement media handlers
func (h *MediaHandler) GetMediaByCategory(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Media handler not implemented yet"})
}

func (h *MediaHandler) GetMediaItem(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Media handler not implemented yet"})
}

func (h *MediaHandler) UploadMedia(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Media handler not implemented yet"})
}

func (h *MediaHandler) UpdateMedia(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Media handler not implemented yet"})
}

func (h *MediaHandler) DeleteMedia(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Media handler not implemented yet"})
}

func (h *MediaHandler) GetAllMediaAdmin(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Media handler not implemented yet"})
} 
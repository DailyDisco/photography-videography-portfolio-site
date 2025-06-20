package handlers

import (
	"photography-portfolio/config"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type StripeHandler struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewStripeHandler(db *gorm.DB, cfg *config.Config) *StripeHandler {
	return &StripeHandler{
		db:  db,
		cfg: cfg,
	}
}

// TODO: Implement stripe handlers
func (h *StripeHandler) CreateCheckoutSession(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Stripe handler not implemented yet"})
}

func (h *StripeHandler) HandleSuccess(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Stripe handler not implemented yet"})
}

func (h *StripeHandler) HandleWebhook(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"message": "Stripe handler not implemented yet"})
} 
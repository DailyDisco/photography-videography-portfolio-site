package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"time"

	"photography-portfolio/config"
	"photography-portfolio/models"

	"github.com/gofiber/fiber/v2"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/checkout/session"
	"github.com/stripe/stripe-go/v76/webhook"
	"gorm.io/gorm"
)

type StripeHandler struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewStripeHandler(db *gorm.DB, cfg *config.Config) *StripeHandler {
	// Initialize Stripe with secret key
	stripe.Key = cfg.StripeSecretKey
	
	return &StripeHandler{
		db:  db,
		cfg: cfg,
	}
}

// Service type to Stripe price mapping
var servicePriceMap = map[models.ServiceType]string{
	models.ServicePortrait:    "price_1RcEFRQ0pj80I7YmxtfzfUkq", // $150/hour
	models.ServiceWedding:     "price_1RcEHuQ0pj80I7YmjS1LkEf6", // $300/hour
	models.ServiceEvent:       "price_1RcEInQ0pj80I7Ympjlz2BML", // $200/hour
	models.ServiceCommercial:  "price_1RcEptQ0pj80I7YmA1nus5Xt", // $250/hour
	models.ServiceSports:      "price_1RcEtXQ0pj80I7YmoxrA2Ntf", // $180/hour
	models.ServiceNature:      "price_1RcEuKQ0pj80I7YmBpxaliqd", // $120/hour
}

// CreateCheckoutRequest represents the request payload for creating a checkout session
type CreateCheckoutRequest struct {
	ClientName    string                `json:"client_name" validate:"required"`
	ClientEmail   string                `json:"client_email" validate:"required,email"`
	ClientPhone   string                `json:"client_phone"`
	ServiceType   models.ServiceType    `json:"service_type" validate:"required"`
	Description   string                `json:"description"`
	Location      string                `json:"location"`
	ScheduledDate string                `json:"scheduled_date" validate:"required"`
	Duration      int                   `json:"duration" validate:"required,min=1,max=24"`
	Notes         string                `json:"notes"`
}

// CreateCheckoutSession creates a Stripe checkout session for booking payment
func (h *StripeHandler) CreateCheckoutSession(c *fiber.Ctx) error {
	var req CreateCheckoutRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
		})
	}

	// Validate service type
	if !models.ValidateServiceType(string(req.ServiceType)) {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Invalid service type",
		})
	}

	// Parse scheduled date
	scheduledDate, err := time.Parse("2006-01-02T15:04:05Z", req.ScheduledDate)
	if err != nil {
		// Try alternative formats
		if scheduledDate, err = time.Parse("2006-01-02", req.ScheduledDate); err != nil {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"message": "Invalid date format. Use ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SSZ)",
			})
		}
	}

	// Calculate total price
	totalPrice := models.GetServicePrice(req.ServiceType, req.Duration)
	
	// Create pending booking in database
	booking := models.Booking{
		ClientName:    req.ClientName,
		ClientEmail:   req.ClientEmail,
		ClientPhone:   req.ClientPhone,
		ServiceType:   req.ServiceType,
		Description:   req.Description,
		Location:      req.Location,
		ScheduledDate: scheduledDate,
		Duration:      req.Duration,
		Price:         totalPrice,
		Status:        models.BookingStatusPending,
		Notes:         req.Notes,
		PaymentStatus: "pending",
	}

	if err := h.db.Create(&booking).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Failed to create booking",
		})
	}

	// Get Stripe price ID for the service
	priceID, exists := servicePriceMap[req.ServiceType]
	if !exists {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Service not available for online booking",
		})
	}

	// Create Stripe checkout session
	params := &stripe.CheckoutSessionParams{
		PaymentMethodTypes: stripe.StringSlice([]string{"card"}),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(priceID),
				Quantity: stripe.Int64(int64(req.Duration)),
			},
		},
		Mode:       stripe.String(string(stripe.CheckoutSessionModePayment)),
		SuccessURL: stripe.String(fmt.Sprintf("%s/booking/success?session_id={CHECKOUT_SESSION_ID}", h.cfg.CorsOrigin)),
		CancelURL:  stripe.String(fmt.Sprintf("%s/booking/cancel", h.cfg.CorsOrigin)),
		ClientReferenceID: stripe.String(fmt.Sprintf("%d", booking.ID)),
		CustomerEmail: stripe.String(req.ClientEmail),
		Metadata: map[string]string{
			"booking_id":     fmt.Sprintf("%d", booking.ID),
			"service_type":   string(req.ServiceType),
			"duration":       fmt.Sprintf("%d", req.Duration),
			"client_name":    req.ClientName,
		},
	}

	sess, err := session.New(params)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Failed to create checkout session",
			"error":   err.Error(),
		})
	}

	// Update booking with Stripe session ID
	booking.StripeSessionID = sess.ID
	h.db.Save(&booking)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"checkout_url": sess.URL,
			"session_id":   sess.ID,
			"booking_id":   booking.ID,
		},
	})
}

// HandleSuccess handles successful payment redirect
func (h *StripeHandler) HandleSuccess(c *fiber.Ctx) error {
	sessionID := c.Query("session_id")
	if sessionID == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Missing session ID",
		})
	}

	// Find booking by session ID
	var booking models.Booking
	if err := h.db.Where("stripe_session_id = ?", sessionID).First(&booking).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"message": "Booking not found",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"booking":    booking.ToResponse(),
			"session_id": sessionID,
			"message":    "Payment successful! Your booking is confirmed.",
		},
	})
}

// HandleCancel handles payment cancellation
func (h *StripeHandler) HandleCancel(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"success": false,
		"message": "Payment was cancelled. Your booking has not been confirmed.",
	})
}

// HandleWebhook handles Stripe webhooks for payment status updates
func (h *StripeHandler) HandleWebhook(c *fiber.Ctx) error {
	payload := c.Body()
	sigHeader := c.Get("Stripe-Signature")

	// Verify webhook signature
	event, err := webhook.ConstructEvent(payload, sigHeader, h.cfg.StripeWebhookSecret)
	if err != nil {
		log.Printf("Webhook signature verification failed: %v", err)
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid signature",
		})
	}

	// Handle the event
	switch event.Type {
	case "checkout.session.completed":
		var session stripe.CheckoutSession
		if err := json.Unmarshal(event.Data.Raw, &session); err != nil {
			log.Printf("Error parsing webhook JSON: %v", err)
			return c.Status(400).JSON(fiber.Map{
				"error": "Invalid JSON",
			})
		}

		// Update booking status
		if err := h.handleCheckoutSessionCompleted(&session); err != nil {
			log.Printf("Error handling checkout session completed: %v", err)
			return c.Status(500).JSON(fiber.Map{
				"error": "Internal server error",
			})
		}

	case "payment_intent.succeeded":
		log.Println("Payment succeeded!")

	case "payment_intent.payment_failed":
		log.Println("Payment failed!")

	default:
		log.Printf("Unhandled event type: %s", event.Type)
	}

	return c.JSON(fiber.Map{
		"received": true,
	})
}

// handleCheckoutSessionCompleted processes successful checkout sessions
func (h *StripeHandler) handleCheckoutSessionCompleted(session *stripe.CheckoutSession) error {
	bookingIDStr := session.ClientReferenceID
	if bookingIDStr == "" {
		return fmt.Errorf("no booking ID in session")
	}

	bookingID, err := strconv.ParseUint(bookingIDStr, 10, 32)
	if err != nil {
		return fmt.Errorf("invalid booking ID: %v", err)
	}

	// Find and update booking
	var booking models.Booking
	if err := h.db.First(&booking, uint(bookingID)).Error; err != nil {
		return fmt.Errorf("booking not found: %v", err)
	}

	// Update booking status
	now := time.Now()
	booking.Status = models.BookingStatusConfirmed
	booking.PaymentStatus = "paid"
	booking.PaidAt = &now

	if err := h.db.Save(&booking).Error; err != nil {
		return fmt.Errorf("failed to update booking: %v", err)
	}

	log.Printf("Booking %d confirmed and marked as paid", booking.ID)
	return nil
} 
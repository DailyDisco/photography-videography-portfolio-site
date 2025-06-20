package handlers

import (
	"photography-portfolio/config"
	"photography-portfolio/models"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type ContactHandler struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewContactHandler(db *gorm.DB, cfg *config.Config) *ContactHandler {
	return &ContactHandler{
		db:  db,
		cfg: cfg,
	}
}

// SubmitContact handles contact form submissions
func (h *ContactHandler) SubmitContact(c *fiber.Ctx) error {
	var req models.ContactRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request body",
			"message": "Please check your form data and try again",
		})
	}

	// Validate required fields
	if req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Name is required",
			"message": "Please enter your name",
		})
	}

	if req.Email == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Email is required",
			"message": "Please enter your email address",
		})
	}

	if req.Subject == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Subject is required",
			"message": "Please enter a subject",
		})
	}

	if req.Message == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Message is required",
			"message": "Please enter your message",
		})
	}

	// Trim whitespace
	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(req.Email)
	req.Subject = strings.TrimSpace(req.Subject)
	req.Message = strings.TrimSpace(req.Message)
	req.Phone = strings.TrimSpace(req.Phone)

	// Create contact message
	contact := models.ContactMessage{
		Name:      req.Name,
		Email:     req.Email,
		Phone:     req.Phone,
		Subject:   req.Subject,
		Message:   req.Message,
		IPAddress: c.IP(),
		UserAgent: c.Get("User-Agent"),
	}

	// Save to database
	if err := h.db.Create(&contact).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to save message",
			"message": "We're having trouble saving your message. Please try again later.",
		})
	}

	// Return success response
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Thank you for your message! We'll get back to you soon.",
		"data": fiber.Map{
			"id": contact.ID,
		},
	})
}

// GetMessages retrieves all contact messages (admin only)
func (h *ContactHandler) GetMessages(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	pageSize, _ := strconv.Atoi(c.Query("page_size", "20"))
	isRead := c.Query("is_read")
	search := c.Query("search")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	offset := (page - 1) * pageSize

	query := h.db.Model(&models.ContactMessage{})

	// Apply filters
	if isRead != "" {
		if isRead == "true" {
			query = query.Where("is_read = ?", true)
		} else {
			query = query.Where("is_read = ?", false)
		}
	}

	if search != "" {
		search = "%" + search + "%"
		query = query.Where("name ILIKE ? OR email ILIKE ? OR subject ILIKE ? OR message ILIKE ?",
			search, search, search, search)
	}

	// Get total count
	var total int64
	query.Count(&total)

	// Get unread count
	var unreadCount int64
	h.db.Model(&models.ContactMessage{}).Where("is_read = ?", false).Count(&unreadCount)

	// Get messages
	var messages []models.ContactMessage
	err := query.Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&messages).Error

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to retrieve messages",
			"message": "Unable to load contact messages",
		})
	}

	// Convert to response format
	var responses []models.ContactResponse
	for _, message := range messages {
		responses = append(responses, message.ToResponse())
	}

	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))

	response := models.ContactListResponse{
		Messages:    responses,
		TotalCount:  total,
		UnreadCount: unreadCount,
		Page:        page,
		PageSize:    pageSize,
		TotalPages:  totalPages,
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    response,
	})
}

// MarkAsRead marks a contact message as read (admin only)
func (h *ContactHandler) MarkAsRead(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Message ID is required",
		})
	}

	var message models.ContactMessage
	if err := h.db.First(&message, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"error":   "Message not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to retrieve message",
		})
	}

	if err := message.MarkAsRead(h.db); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to mark message as read",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Message marked as read",
		"data":    message.ToResponse(),
	})
}

// DeleteMessage deletes a contact message (admin only)
func (h *ContactHandler) DeleteMessage(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Message ID is required",
		})
	}

	var message models.ContactMessage
	if err := h.db.First(&message, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"error":   "Message not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to retrieve message",
		})
	}

	if err := h.db.Delete(&message).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to delete message",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Message deleted successfully",
	})
} 
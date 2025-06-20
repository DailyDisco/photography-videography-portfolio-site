package handlers

import (
	"photography-portfolio/models"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type AdminHandler struct {
	db *gorm.DB
}

func NewAdminHandler(db *gorm.DB) *AdminHandler {
	return &AdminHandler{db: db}
}

// GetDashboard returns admin dashboard data with stats
func (h *AdminHandler) GetDashboard(c *fiber.Ctx) error {
	var stats struct {
		TotalMedia    int64 `json:"totalMedia"`
		TotalMessages int64 `json:"totalMessages"`
		UnreadMessages int64 `json:"unreadMessages"`
		RecentMessages []models.ContactMessage `json:"recentMessages"`
	}

	// Get total media count
	h.db.Model(&models.Media{}).Count(&stats.TotalMedia)

	// Get total messages count
	h.db.Model(&models.ContactMessage{}).Count(&stats.TotalMessages)

	// Get unread messages count
	h.db.Model(&models.ContactMessage{}).Where("is_read = ?", false).Count(&stats.UnreadMessages)

	// Get recent messages (last 5)
	h.db.Model(&models.ContactMessage{}).
		Order("created_at DESC").
		Limit(5).
		Find(&stats.RecentMessages)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    stats,
	})
}

// GetContactMessages returns all contact messages with pagination
func (h *AdminHandler) GetContactMessages(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	status := c.Query("status", "") // "read", "unread", or "" for all

	offset := (page - 1) * limit

	var messages []models.ContactMessage
	var total int64

	query := h.db.Model(&models.ContactMessage{})

	// Filter by read status if specified
	if status == "read" {
		query = query.Where("is_read = ?", true)
	} else if status == "unread" {
		query = query.Where("is_read = ?", false)
	}

	// Get total count
	query.Count(&total)

	// Get paginated results
	err := query.Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&messages).Error

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Failed to fetch messages",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"messages": messages,
			"total":    total,
			"page":     page,
			"limit":    limit,
			"pages":    (total + int64(limit) - 1) / int64(limit),
		},
	})
}

// MarkMessageAsRead marks a contact message as read
func (h *AdminHandler) MarkMessageAsRead(c *fiber.Ctx) error {
	id := c.Params("id")

	var message models.ContactMessage
	if err := h.db.First(&message, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{
				"success": false,
				"message": "Message not found",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Database error",
		})
	}

	message.IsRead = true
	if err := h.db.Save(&message).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Failed to update message",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Message marked as read",
		"data":    message,
	})
}

// MarkMessageAsUnread marks a contact message as unread
func (h *AdminHandler) MarkMessageAsUnread(c *fiber.Ctx) error {
	id := c.Params("id")

	var message models.ContactMessage
	if err := h.db.First(&message, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{
				"success": false,
				"message": "Message not found",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Database error",
		})
	}

	message.IsRead = false
	if err := h.db.Save(&message).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Failed to update message",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Message marked as unread",
		"data":    message,
	})
}

// DeleteMessage deletes a contact message
func (h *AdminHandler) DeleteMessage(c *fiber.Ctx) error {
	id := c.Params("id")

	var message models.ContactMessage
	if err := h.db.First(&message, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{
				"success": false,
				"message": "Message not found",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Database error",
		})
	}

	if err := h.db.Delete(&message).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Failed to delete message",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Message deleted successfully",
	})
}

// GetAnalytics returns admin analytics data
func (h *AdminHandler) GetAnalytics(c *fiber.Ctx) error {
	var analytics struct {
		MediaByCategory map[string]int64 `json:"mediaByCategory"`
		MessagesThisMonth int64 `json:"messagesThisMonth"`
		PopularCategories []struct {
			Category string `json:"category"`
			Count    int64  `json:"count"`
		} `json:"popularCategories"`
		RecentActivity []struct {
			Type      string `json:"type"`
			Message   string `json:"message"`
			Timestamp string `json:"timestamp"`
		} `json:"recentActivity"`
	}

	// Initialize map
	analytics.MediaByCategory = make(map[string]int64)

	// Get media by category
	var mediaStats []struct {
		Category string
		Count    int64
	}
	h.db.Model(&models.Media{}).
		Select("category, count(*) as count").
		Group("category").
		Scan(&mediaStats)

	for _, stat := range mediaStats {
		analytics.MediaByCategory[stat.Category] = stat.Count
	}

	// Get messages this month
	h.db.Model(&models.ContactMessage{}).
		Where("created_at > DATE_SUB(NOW(), INTERVAL 1 MONTH)").
		Count(&analytics.MessagesThisMonth)

	// Get popular categories (top 5)
	h.db.Model(&models.Media{}).
		Select("category, count(*) as count").
		Group("category").
		Order("count DESC").
		Limit(5).
		Scan(&analytics.PopularCategories)

	// Mock recent activity (you can implement based on your needs)
	analytics.RecentActivity = []struct {
		Type      string `json:"type"`
		Message   string `json:"message"`
		Timestamp string `json:"timestamp"`
	}{
		{Type: "info", Message: "System running smoothly", Timestamp: "2024-01-01T12:00:00Z"},
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    analytics,
	})
} 
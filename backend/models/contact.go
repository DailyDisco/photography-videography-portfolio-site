package models

import (
	"time"

	"gorm.io/gorm"
)

// ContactMessage represents a contact form submission
type ContactMessage struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Name      string         `json:"name" gorm:"not null;size:255"`
	Email     string         `json:"email" gorm:"not null;size:255"`
	Phone     string         `json:"phone" gorm:"size:50"`
	Subject   string         `json:"subject" gorm:"not null;size:255"`
	Message   string         `json:"message" gorm:"not null;type:text"`
	IsRead    bool           `json:"is_read" gorm:"default:false"`
	ReadAt    *time.Time     `json:"read_at"`
	IPAddress string         `json:"ip_address" gorm:"size:45"`
	UserAgent string         `json:"user_agent" gorm:"size:500"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

// ContactRequest represents the request payload for contact form
type ContactRequest struct {
	Name    string `json:"name" validate:"required,max=255"`
	Email   string `json:"email" validate:"required,email"`
	Phone   string `json:"phone" validate:"max=50"`
	Subject string `json:"subject" validate:"required,max=255"`
	Message string `json:"message" validate:"required,max=2000"`
}

// ContactResponse represents the response payload for contact message
type ContactResponse struct {
	ID        uint       `json:"id"`
	Name      string     `json:"name"`
	Email     string     `json:"email"`
	Phone     string     `json:"phone"`
	Subject   string     `json:"subject"`
	Message   string     `json:"message"`
	IsRead    bool       `json:"is_read"`
	ReadAt    *time.Time `json:"read_at"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

// ContactListResponse represents the response for contact messages list
type ContactListResponse struct {
	Messages   []ContactResponse `json:"messages"`
	TotalCount int64             `json:"total_count"`
	UnreadCount int64            `json:"unread_count"`
	Page       int               `json:"page"`
	PageSize   int               `json:"page_size"`
	TotalPages int               `json:"total_pages"`
}

// ContactFilter represents filters for contact message queries
type ContactFilter struct {
	IsRead    *bool  `json:"is_read,omitempty"`
	Search    string `json:"search,omitempty"`
	Page      int    `json:"page,omitempty"`
	PageSize  int    `json:"page_size,omitempty"`
	SortBy    string `json:"sort_by,omitempty"`    // created_at, name, subject
	SortOrder string `json:"sort_order,omitempty"` // asc, desc
}

// ToResponse converts ContactMessage to ContactResponse
func (c *ContactMessage) ToResponse() ContactResponse {
	return ContactResponse{
		ID:        c.ID,
		Name:      c.Name,
		Email:     c.Email,
		Phone:     c.Phone,
		Subject:   c.Subject,
		Message:   c.Message,
		IsRead:    c.IsRead,
		ReadAt:    c.ReadAt,
		CreatedAt: c.CreatedAt,
		UpdatedAt: c.UpdatedAt,
	}
}

// MarkAsRead marks the contact message as read
func (c *ContactMessage) MarkAsRead(tx *gorm.DB) error {
	if !c.IsRead {
		now := time.Now()
		c.IsRead = true
		c.ReadAt = &now
		return tx.Model(c).Updates(map[string]interface{}{
			"is_read": true,
			"read_at": now,
		}).Error
	}
	return nil
}

// GetDisplayName returns the name for display purposes
func (c *ContactMessage) GetDisplayName() string {
	if c.Name != "" {
		return c.Name
	}
	return c.Email
}

// IsRecent checks if the message was created within the last 24 hours
func (c *ContactMessage) IsRecent() bool {
	return time.Since(c.CreatedAt) < 24*time.Hour
} 
package models

import (
	"time"

	"gorm.io/gorm"
)

// BookingStatus represents the booking status
type BookingStatus string

const (
	BookingStatusPending   BookingStatus = "pending"
	BookingStatusConfirmed BookingStatus = "confirmed"
	BookingStatusCompleted BookingStatus = "completed"
	BookingStatusCancelled BookingStatus = "cancelled"
	BookingStatusRefunded  BookingStatus = "refunded"
)

// ServiceType represents the type of photography service
type ServiceType string

const (
	ServicePortrait    ServiceType = "portrait"
	ServiceWedding     ServiceType = "wedding"
	ServiceEvent       ServiceType = "event"
	ServiceCommercial  ServiceType = "commercial"
	ServiceSports      ServiceType = "sports"
	ServiceNature      ServiceType = "nature"
)

// Booking represents a photography session booking
type Booking struct {
	ID             uint           `json:"id" gorm:"primaryKey"`
	ClientName     string         `json:"client_name" gorm:"not null;size:255"`
	ClientEmail    string         `json:"client_email" gorm:"not null;size:255"`
	ClientPhone    string         `json:"client_phone" gorm:"size:50"`
	ServiceType    ServiceType    `json:"service_type" gorm:"not null;size:50"`
	Description    string         `json:"description" gorm:"type:text"`
	Location       string         `json:"location" gorm:"size:500"`
	ScheduledDate  time.Time      `json:"scheduled_date" gorm:"not null"`
	Duration       int            `json:"duration" gorm:"not null"` // Duration in hours
	Price          float64        `json:"price" gorm:"not null"`
	Status         BookingStatus  `json:"status" gorm:"default:pending;size:20"`
	Notes          string         `json:"notes" gorm:"type:text"`
	StripeSessionID string        `json:"stripe_session_id" gorm:"size:255"`
	PaymentStatus  string         `json:"payment_status" gorm:"default:pending;size:20"`
	PaidAt         *time.Time     `json:"paid_at"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`

	// Foreign keys
	UserID uint `json:"user_id" gorm:"index"`

	// Relationships
	User User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// BookingRequest represents the request payload for creating a booking
type BookingRequest struct {
	ClientName    string      `json:"client_name" validate:"required,max=255"`
	ClientEmail   string      `json:"client_email" validate:"required,email"`
	ClientPhone   string      `json:"client_phone" validate:"max=50"`
	ServiceType   ServiceType `json:"service_type" validate:"required"`
	Description   string      `json:"description" validate:"max=1000"`
	Location      string      `json:"location" validate:"max=500"`
	ScheduledDate string      `json:"scheduled_date" validate:"required"` // ISO date string
	Duration      int         `json:"duration" validate:"required,min=1,max=24"`
	Notes         string      `json:"notes" validate:"max=1000"`
}

// BookingResponse represents the response payload for booking data
type BookingResponse struct {
	ID             uint          `json:"id"`
	ClientName     string        `json:"client_name"`
	ClientEmail    string        `json:"client_email"`
	ClientPhone    string        `json:"client_phone"`
	ServiceType    ServiceType   `json:"service_type"`
	Description    string        `json:"description"`
	Location       string        `json:"location"`
	ScheduledDate  time.Time     `json:"scheduled_date"`
	Duration       int           `json:"duration"`
	Price          float64       `json:"price"`
	Status         BookingStatus `json:"status"`
	Notes          string        `json:"notes"`
	PaymentStatus  string        `json:"payment_status"`
	PaidAt         *time.Time    `json:"paid_at"`
	CreatedAt      time.Time     `json:"created_at"`
	UpdatedAt      time.Time     `json:"updated_at"`
	User           UserResponse  `json:"user,omitempty"`
}

// BookingListResponse represents the response for booking list with pagination
type BookingListResponse struct {
	Bookings   []BookingResponse `json:"bookings"`
	TotalCount int64             `json:"total_count"`
	Page       int               `json:"page"`
	PageSize   int               `json:"page_size"`
	TotalPages int               `json:"total_pages"`
}

// BookingFilter represents filters for booking queries
type BookingFilter struct {
	Status      BookingStatus `json:"status,omitempty"`
	ServiceType ServiceType   `json:"service_type,omitempty"`
	DateFrom    *time.Time    `json:"date_from,omitempty"`
	DateTo      *time.Time    `json:"date_to,omitempty"`
	Search      string        `json:"search,omitempty"`
	Page        int           `json:"page,omitempty"`
	PageSize    int           `json:"page_size,omitempty"`
	SortBy      string        `json:"sort_by,omitempty"`    // created_at, scheduled_date, price
	SortOrder   string        `json:"sort_order,omitempty"` // asc, desc
}

// ToResponse converts Booking to BookingResponse
func (b *Booking) ToResponse() BookingResponse {
	return BookingResponse{
		ID:            b.ID,
		ClientName:    b.ClientName,
		ClientEmail:   b.ClientEmail,
		ClientPhone:   b.ClientPhone,
		ServiceType:   b.ServiceType,
		Description:   b.Description,
		Location:      b.Location,
		ScheduledDate: b.ScheduledDate,
		Duration:      b.Duration,
		Price:         b.Price,
		Status:        b.Status,
		Notes:         b.Notes,
		PaymentStatus: b.PaymentStatus,
		PaidAt:        b.PaidAt,
		CreatedAt:     b.CreatedAt,
		UpdatedAt:     b.UpdatedAt,
		User:          b.User.ToResponse(),
	}
}

// IsConfirmed checks if the booking is confirmed
func (b *Booking) IsConfirmed() bool {
	return b.Status == BookingStatusConfirmed
}

// IsCompleted checks if the booking is completed
func (b *Booking) IsCompleted() bool {
	return b.Status == BookingStatusCompleted
}

// IsPaid checks if the booking is paid
func (b *Booking) IsPaid() bool {
	return b.PaymentStatus == "paid" && b.PaidAt != nil
}

// CanBeCancelled checks if the booking can be cancelled
func (b *Booking) CanBeCancelled() bool {
	return b.Status == BookingStatusPending || b.Status == BookingStatusConfirmed
}

// GetServicePrice returns the price for a specific service type
func GetServicePrice(serviceType ServiceType, duration int) float64 {
	// Base prices per hour (in cents to avoid floating point issues)
	basePrices := map[ServiceType]float64{
		ServicePortrait:   150.00, // $150/hour
		ServiceWedding:    300.00, // $300/hour
		ServiceEvent:      200.00, // $200/hour
		ServiceCommercial: 250.00, // $250/hour
		ServiceSports:     180.00, // $180/hour
		ServiceNature:     120.00, // $120/hour
	}

	basePrice, exists := basePrices[serviceType]
	if !exists {
		basePrice = 150.00 // Default price
	}

	return basePrice * float64(duration)
}

// GetValidServiceTypes returns all valid service types
func GetValidServiceTypes() []ServiceType {
	return []ServiceType{
		ServicePortrait,
		ServiceWedding,
		ServiceEvent,
		ServiceCommercial,
		ServiceSports,
		ServiceNature,
	}
}

// ValidateServiceType checks if the service type is valid
func ValidateServiceType(serviceType string) bool {
	validTypes := GetValidServiceTypes()
	for _, validType := range validTypes {
		if ServiceType(serviceType) == validType {
			return true
		}
	}
	return false
} 
package models

import (
	"fmt"
	"time"

	"gorm.io/gorm"
)

// MediaCategory represents the available gallery categories
type MediaCategory string

const (
	CategoryAthletes  MediaCategory = "athletes"
	CategoryFood      MediaCategory = "food"
	CategoryNature    MediaCategory = "nature"
	CategoryPortraits MediaCategory = "portraits"
	CategoryAction    MediaCategory = "action"
)

// MediaType represents the type of media (image or video)
type MediaType string

const (
	MediaTypeImage MediaType = "image"
	MediaTypeVideo MediaType = "video"
)

// Media represents the media file model
type Media struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	Title        string         `json:"title" gorm:"not null;size:255"`
	Description  string         `json:"description" gorm:"type:text"`
	Category     MediaCategory  `json:"category" gorm:"not null;index;size:50"`
	Type         MediaType      `json:"type" gorm:"not null;size:20"`
	S3URL        string         `json:"s3_url" gorm:"not null;size:500"`
	ThumbnailURL string         `json:"thumbnail_url" gorm:"not null;size:500"`
	FileName     string         `json:"file_name" gorm:"not null;size:255"`
	FileSize     int64          `json:"file_size" gorm:"not null"`
	MimeType     string         `json:"mime_type" gorm:"not null;size:100"`
	Width        int            `json:"width"`
	Height       int            `json:"height"`
	Duration     int            `json:"duration,omitempty"` // For videos (in seconds)
	Alt          string         `json:"alt" gorm:"size:255"`
	Tags         string         `json:"tags" gorm:"type:text"` // JSON array as string
	IsPublic     bool           `json:"is_public" gorm:"default:true"`
	IsFeatured   bool           `json:"is_featured" gorm:"default:false"`
	SortOrder    int            `json:"sort_order" gorm:"default:0"`
	ViewCount    int            `json:"view_count" gorm:"default:0"`
	UploadedAt   time.Time      `json:"uploaded_at"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`

	// Foreign keys
	UserID uint `json:"user_id" gorm:"not null;index"`

	// Relationships
	User User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// MediaRequest represents the request payload for media upload
type MediaRequest struct {
	Title       string        `json:"title" validate:"required,max=255"`
	Description string        `json:"description" validate:"max=1000"`
	Category    MediaCategory `json:"category" validate:"required,oneof=athletes food nature portraits action"`
	Alt         string        `json:"alt" validate:"max=255"`
	Tags        []string      `json:"tags" validate:"dive,max=50"`
	IsPublic    *bool         `json:"is_public"`
	IsFeatured  *bool         `json:"is_featured"`
	SortOrder   *int          `json:"sort_order"`
}

// MediaResponse represents the response payload for media data
type MediaResponse struct {
	ID           uint          `json:"id"`
	Title        string        `json:"title"`
	Description  string        `json:"description"`
	Category     MediaCategory `json:"category"`
	Type         MediaType     `json:"type"`
	S3URL        string        `json:"s3_url"`
	ThumbnailURL string        `json:"thumbnail_url"`
	FileName     string        `json:"file_name"`
	FileSize     int64         `json:"file_size"`
	MimeType     string        `json:"mime_type"`
	Width        int           `json:"width"`
	Height       int           `json:"height"`
	Duration     int           `json:"duration,omitempty"`
	Alt          string        `json:"alt"`
	Tags         []string      `json:"tags"`
	IsPublic     bool          `json:"is_public"`
	IsFeatured   bool          `json:"is_featured"`
	SortOrder    int           `json:"sort_order"`
	ViewCount    int           `json:"view_count"`
	UploadedAt   time.Time     `json:"uploaded_at"`
	CreatedAt    time.Time     `json:"created_at"`
	UpdatedAt    time.Time     `json:"updated_at"`
	User         UserResponse  `json:"user,omitempty"`
}

// MediaListResponse represents the response for media list with pagination
type MediaListResponse struct {
	Media      []MediaResponse `json:"media"`
	TotalCount int64           `json:"total_count"`
	Page       int             `json:"page"`
	PageSize   int             `json:"page_size"`
	TotalPages int             `json:"total_pages"`
}

// MediaFilter represents filters for media queries
type MediaFilter struct {
	Category   MediaCategory `json:"category,omitempty"`
	Type       MediaType     `json:"type,omitempty"`
	IsPublic   *bool         `json:"is_public,omitempty"`
	IsFeatured *bool         `json:"is_featured,omitempty"`
	Tags       []string      `json:"tags,omitempty"`
	Search     string        `json:"search,omitempty"`
	Page       int           `json:"page,omitempty"`
	PageSize   int           `json:"page_size,omitempty"`
	SortBy     string        `json:"sort_by,omitempty"`     // created_at, uploaded_at, title, sort_order
	SortOrder  string        `json:"sort_order,omitempty"`  // asc, desc
}

// BeforeCreate is a GORM hook that runs before creating media
func (m *Media) BeforeCreate(tx *gorm.DB) error {
	if m.UploadedAt.IsZero() {
		m.UploadedAt = time.Now()
	}
	return nil
}

// ToResponse converts Media to MediaResponse
func (m *Media) ToResponse() MediaResponse {
	response := MediaResponse{
		ID:           m.ID,
		Title:        m.Title,
		Description:  m.Description,
		Category:     m.Category,
		Type:         m.Type,
		S3URL:        m.S3URL,
		ThumbnailURL: m.ThumbnailURL,
		FileName:     m.FileName,
		FileSize:     m.FileSize,
		MimeType:     m.MimeType,
		Width:        m.Width,
		Height:       m.Height,
		Duration:     m.Duration,
		Alt:          m.Alt,
		Tags:         parseTagsFromString(m.Tags),
		IsPublic:     m.IsPublic,
		IsFeatured:   m.IsFeatured,
		SortOrder:    m.SortOrder,
		ViewCount:    m.ViewCount,
		UploadedAt:   m.UploadedAt,
		CreatedAt:    m.CreatedAt,
		UpdatedAt:    m.UpdatedAt,
		User:         m.User.ToResponse(),
	}
	return response
}

// IncrementViewCount increments the view count for the media
func (m *Media) IncrementViewCount(tx *gorm.DB) error {
	return tx.Model(m).UpdateColumn("view_count", gorm.Expr("view_count + 1")).Error
}

// IsImage checks if the media is an image
func (m *Media) IsImage() bool {
	return m.Type == MediaTypeImage
}

// IsVideo checks if the media is a video
func (m *Media) IsVideo() bool {
	return m.Type == MediaTypeVideo
}

// GetDimensions returns the media dimensions as a string
func (m *Media) GetDimensions() string {
	if m.Width > 0 && m.Height > 0 {
		return fmt.Sprintf("%dx%d", m.Width, m.Height)
	}
	return ""
}

// ValidateCategory checks if the category is valid
func ValidateCategory(category string) bool {
	validCategories := []MediaCategory{
		CategoryAthletes,
		CategoryFood,
		CategoryNature,
		CategoryPortraits,
		CategoryAction,
	}
	
	for _, validCategory := range validCategories {
		if MediaCategory(category) == validCategory {
			return true
		}
	}
	return false
}

// GetValidCategories returns all valid categories
func GetValidCategories() []MediaCategory {
	return []MediaCategory{
		CategoryAthletes,
		CategoryFood,
		CategoryNature,
		CategoryPortraits,
		CategoryAction,
	}
}

// parseTagsFromString parses tags from JSON string
func parseTagsFromString(tags string) []string {
	if tags == "" {
		return []string{}
	}
	// This would need proper JSON parsing in a real implementation
	// For now, return empty slice
	return []string{}
}

// tagsToString converts tags slice to JSON string
func tagsToString(tags []string) string {
	if len(tags) == 0 {
		return ""
	}
	// This would need proper JSON marshaling in a real implementation
	// For now, return empty string
	return ""
} 
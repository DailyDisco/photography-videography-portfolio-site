package handlers

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"photography-portfolio/config"
	"photography-portfolio/models"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
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

// GetMediaByCategory returns media items for a specific category
func (h *MediaHandler) GetMediaByCategory(c *fiber.Ctx) error {
	category := c.Params("category")
	
	// Get pagination parameters
	page, err := strconv.Atoi(c.Query("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}
	
	limit, err := strconv.Atoi(c.Query("limit", "20"))
	if err != nil || limit < 1 || limit > 100 {
		limit = 20
	}
	
	// Calculate offset
	offset := (page - 1) * limit
	
	// Validate category
	validCategories := []string{"athletes", "food", "nature", "portraits", "action"}
	isValid := false
	for _, validCat := range validCategories {
		if category == validCat {
			isValid = true
			break
		}
	}
	
	if !isValid {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Invalid category",
		})
	}

	var media []models.Media
	var total int64
	
	// Get total count
	h.db.Model(&models.Media{}).Where("category = ?", category).Count(&total)
	
	// Get paginated media
	err = h.db.Where("category = ?", category).
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&media).Error

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Failed to fetch media",
		})
	}

	// Create GalleryData response structure
	galleryData := fiber.Map{
		"category": category,
		"media":    media,
		"total":    int(total),
		"page":     page,
		"limit":    limit,
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    galleryData,
	})
}

// GetMediaItem returns a specific media item and increments view count
func (h *MediaHandler) GetMediaItem(c *fiber.Ctx) error {
	id := c.Params("id")

	var media models.Media
	if err := h.db.First(&media, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{
				"success": false,
				"message": "Media not found",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Database error",
		})
	}

	// Increment view count
	media.ViewCount++
	h.db.Save(&media)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    media,
	})
}

// UploadMedia handles file upload and creates media record
func (h *MediaHandler) UploadMedia(c *fiber.Ctx) error {
	// Get form data
	category := c.FormValue("category")
	title := c.FormValue("title")
	description := c.FormValue("description")
	isFeaturedStr := c.FormValue("is_featured", "false")

	// Validate category
	validCategories := []string{"athletes", "food", "nature", "portraits", "action"}
	isValidCategory := false
	for _, validCat := range validCategories {
		if category == validCat {
			isValidCategory = true
			break
		}
	}
	
	if !isValidCategory {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Invalid category. Must be one of: athletes, food, nature, portraits, action",
		})
	}

	isFeatured, _ := strconv.ParseBool(isFeaturedStr)

	// Get uploaded file
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "No file uploaded",
		})
	}

	// Validate file type
	allowedTypes := []string{".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".mov", ".avi"}
	fileExt := strings.ToLower(filepath.Ext(file.Filename))
	isValidType := false
	for _, allowedType := range allowedTypes {
		if fileExt == allowedType {
			isValidType = true
			break
		}
	}

	if !isValidType {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Invalid file type. Allowed: jpg, jpeg, png, gif, webp, mp4, mov, avi",
		})
	}

	// Generate unique filename
	fileID := uuid.New().String()
	filename := fmt.Sprintf("%s%s", fileID, fileExt)

	// Create upload directory if it doesn't exist
	uploadDir := "uploads/media"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Failed to create upload directory",
		})
	}

	// Save file
	filePath := filepath.Join(uploadDir, filename)
	if err := c.SaveFile(file, filePath); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Failed to save file",
		})
	}

	// Determine media type
	var mediaType models.MediaType = models.MediaTypeImage
	if fileExt == ".mp4" || fileExt == ".mov" || fileExt == ".avi" {
		mediaType = models.MediaTypeVideo
	}

	// Create media record
	media := models.Media{
		Title:        title,
		Description:  description,
		S3URL:        fmt.Sprintf("/uploads/%s", filename),
		ThumbnailURL: fmt.Sprintf("/uploads/%s", filename), // For now, same as URL
		Category:     models.MediaCategory(category),
		Type:         mediaType,
		IsFeatured:   isFeatured,
		FileName:     filename,
		FileSize:     file.Size,
		ViewCount:    0,
		UserID:       1, // TODO: Get from auth context
	}

	if err := h.db.Create(&media).Error; err != nil {
		// Clean up uploaded file if database insert fails
		os.Remove(filePath)
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Failed to save media record",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Media uploaded successfully",
		"data":    media,
	})
}

// UpdateMedia updates an existing media record
func (h *MediaHandler) UpdateMedia(c *fiber.Ctx) error {
	id := c.Params("id")

	var media models.Media
	if err := h.db.First(&media, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{
				"success": false,
				"message": "Media not found",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Database error",
		})
	}

	// Parse request body
	var updateData struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		Category    string `json:"category"`
		IsFeatured  bool   `json:"is_featured"`
	}

	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
		})
	}

	// Validate category if provided
	if updateData.Category != "" {
		validCategories := []string{"athletes", "food", "nature", "portraits", "action"}
		isValid := false
		for _, validCat := range validCategories {
			if updateData.Category == validCat {
				isValid = true
				break
			}
		}
		if !isValid {
			return c.Status(400).JSON(fiber.Map{
				"success": false,
				"message": "Invalid category",
			})
		}
		media.Category = models.MediaCategory(updateData.Category)
	}

	// Update fields
	if updateData.Title != "" {
		media.Title = updateData.Title
	}
	if updateData.Description != "" {
		media.Description = updateData.Description
	}
	media.IsFeatured = updateData.IsFeatured

	if err := h.db.Save(&media).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Failed to update media",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Media updated successfully",
		"data":    media,
	})
}

// DeleteMedia deletes a media record and its file
func (h *MediaHandler) DeleteMedia(c *fiber.Ctx) error {
	id := c.Params("id")

	var media models.Media
	if err := h.db.First(&media, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{
				"success": false,
				"message": "Media not found",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Database error",
		})
	}

	// Delete file from filesystem
	if media.FileName != "" {
		filePath := filepath.Join("uploads/media", media.FileName)
		if err := os.Remove(filePath); err != nil {
			// Log error but don't fail the request
			fmt.Printf("Warning: Failed to delete file %s: %v\n", filePath, err)
		}
	}

	// Delete database record
	if err := h.db.Delete(&media).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Failed to delete media record",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Media deleted successfully",
	})
}

// GetAllMediaAdmin returns all media with pagination for admin
func (h *MediaHandler) GetAllMediaAdmin(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "12"))
	category := c.Query("category", "")
	mediaType := c.Query("type", "")

	offset := (page - 1) * limit

	var media []models.Media
	var total int64

	query := h.db.Model(&models.Media{})

	// Filter by category if specified
	if category != "" {
		query = query.Where("category = ?", category)
	}

	// Filter by media type if specified
	if mediaType != "" {
		query = query.Where("type = ?", mediaType)
	}

	// Get total count
	query.Count(&total)

	// Get paginated results
	err := query.Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&media).Error

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Failed to fetch media",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"media": media,
			"total": total,
			"page":  page,
			"limit": limit,
			"pages": (total + int64(limit) - 1) / int64(limit),
		},
	})
}

// BulkDeleteMedia deletes multiple media items
func (h *MediaHandler) BulkDeleteMedia(c *fiber.Ctx) error {
	var requestData struct {
		IDs []uint `json:"ids"`
	}

	if err := c.BodyParser(&requestData); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
		})
	}

	if len(requestData.IDs) == 0 {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "No IDs provided",
		})
	}

	// Get all media records first to delete files
	var mediaList []models.Media
	if err := h.db.Where("id IN ?", requestData.IDs).Find(&mediaList).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Failed to fetch media records",
		})
	}

	// Delete files from filesystem
	for _, media := range mediaList {
		if media.FileName != "" {
			filePath := filepath.Join("uploads/media", media.FileName)
			if err := os.Remove(filePath); err != nil {
				fmt.Printf("Warning: Failed to delete file %s: %v\n", filePath, err)
			}
		}
	}

	// Delete database records
	result := h.db.Where("id IN ?", requestData.IDs).Delete(&models.Media{})
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Failed to delete media records",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": fmt.Sprintf("Successfully deleted %d media items", result.RowsAffected),
		"deleted_count": result.RowsAffected,
	})
}

// Helper function to save uploaded file
func saveUploadedFile(file *multipart.FileHeader, dst string) error {
	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, src)
	return err
} 
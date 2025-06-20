package models

import (
	"log"

	"gorm.io/gorm"
)

// MigrateModels runs the auto-migration for all models
func MigrateModels(db *gorm.DB) error {
	log.Println("🔄 Running database migrations...")

	// Run migrations for all models
	err := db.AutoMigrate(
		&User{},
		&Media{},
		&Booking{},
		&ContactMessage{},
	)

	if err != nil {
		log.Printf("❌ Migration failed: %v", err)
		return err
	}

	log.Println("✅ Database migrations completed successfully")

	// Create default admin user if none exists
	if err := createDefaultAdmin(db); err != nil {
		log.Printf("⚠️  Warning: Failed to create default admin: %v", err)
	}

	return nil
}

// createDefaultAdmin creates a default admin user if none exists
func createDefaultAdmin(db *gorm.DB) error {
	var count int64
	if err := db.Model(&User{}).Count(&count).Error; err != nil {
		return err
	}

	// If no users exist, create default admin
	if count == 0 {
		defaultAdmin := &User{
			Email:     "admin@portfolio.com",
			Password:  "admin123", // This will be hashed by the BeforeCreate hook
			FirstName: "Admin",
			LastName:  "User",
			Role:      "admin",
			IsActive:  true,
		}

		if err := db.Create(defaultAdmin).Error; err != nil {
			return err
		}

		log.Println("👤 Default admin user created:")
		log.Println("   Email: admin@portfolio.com")
		log.Println("   Password: admin123")
		log.Println("   ⚠️  Please change the password after first login!")
	}

	return nil
}

// SeedData seeds the database with sample data for development
func SeedData(db *gorm.DB) error {
	log.Println("🌱 Seeding database with sample data...")

	// Check if we're in development mode and no media exists
	var mediaCount int64
	if err := db.Model(&Media{}).Count(&mediaCount).Error; err != nil {
		return err
	}

	if mediaCount > 0 {
		log.Println("📄 Sample data already exists, skipping seed")
		return nil
	}

	// Get the first admin user
	var admin User
	if err := db.Where("role = ?", "admin").First(&admin).Error; err != nil {
		log.Println("⚠️  No admin user found, skipping media seed")
		return nil
	}

	// Sample media data (using placeholder URLs)
	sampleMedia := []Media{
		{
			Title:        "Athletic Excellence",
			Description:  "Professional sports photography capturing peak performance",
			Category:     CategoryAthletes,
			Type:         MediaTypeImage,
			S3URL:        "https://via.placeholder.com/800x600/0066cc/ffffff?text=Athletes",
			ThumbnailURL: "https://via.placeholder.com/300x200/0066cc/ffffff?text=Athletes",
			FileName:     "athletes_sample_1.jpg",
			FileSize:     1024000,
			MimeType:     "image/jpeg",
			Width:        800,
			Height:       600,
			Alt:          "Professional athlete in action",
			IsPublic:     true,
			IsFeatured:   true,
			SortOrder:    1,
			UserID:       admin.ID,
		},
		{
			Title:        "Culinary Artistry",
			Description:  "Food photography that makes dishes come alive",
			Category:     CategoryFood,
			Type:         MediaTypeImage,
			S3URL:        "https://via.placeholder.com/800x600/ff6600/ffffff?text=Food",
			ThumbnailURL: "https://via.placeholder.com/300x200/ff6600/ffffff?text=Food",
			FileName:     "food_sample_1.jpg",
			FileSize:     950000,
			MimeType:     "image/jpeg",
			Width:        800,
			Height:       600,
			Alt:          "Beautifully plated gourmet dish",
			IsPublic:     true,
			IsFeatured:   true,
			SortOrder:    2,
			UserID:       admin.ID,
		},
		{
			Title:        "Natural Beauty",
			Description:  "Landscape photography showcasing nature's wonders",
			Category:     CategoryNature,
			Type:         MediaTypeImage,
			S3URL:        "https://via.placeholder.com/800x600/009933/ffffff?text=Nature",
			ThumbnailURL: "https://via.placeholder.com/300x200/009933/ffffff?text=Nature",
			FileName:     "nature_sample_1.jpg",
			FileSize:     1200000,
			MimeType:     "image/jpeg",
			Width:        800,
			Height:       600,
			Alt:          "Stunning mountain landscape at sunset",
			IsPublic:     true,
			IsFeatured:   false,
			SortOrder:    3,
			UserID:       admin.ID,
		},
		{
			Title:        "Portrait Elegance",
			Description:  "Professional portrait photography with artistic flair",
			Category:     CategoryPortraits,
			Type:         MediaTypeImage,
			S3URL:        "https://via.placeholder.com/800x600/cc0066/ffffff?text=Portraits",
			ThumbnailURL: "https://via.placeholder.com/300x200/cc0066/ffffff?text=Portraits",
			FileName:     "portrait_sample_1.jpg",
			FileSize:     890000,
			MimeType:     "image/jpeg",
			Width:        800,
			Height:       600,
			Alt:          "Professional headshot with dramatic lighting",
			IsPublic:     true,
			IsFeatured:   false,
			SortOrder:    4,
			UserID:       admin.ID,
		},
		{
			Title:        "Action Moments",
			Description:  "Dynamic action photography freezing motion in time",
			Category:     CategoryAction,
			Type:         MediaTypeImage,
			S3URL:        "https://via.placeholder.com/800x600/ff3300/ffffff?text=Action",
			ThumbnailURL: "https://via.placeholder.com/300x200/ff3300/ffffff?text=Action",
			FileName:     "action_sample_1.jpg",
			FileSize:     1100000,
			MimeType:     "image/jpeg",
			Width:        800,
			Height:       600,
			Alt:          "High-speed action shot with motion blur",
			IsPublic:     true,
			IsFeatured:   true,
			SortOrder:    5,
			UserID:       admin.ID,
		},
	}

	// Create sample media
	for _, media := range sampleMedia {
		if err := db.Create(&media).Error; err != nil {
			log.Printf("⚠️  Failed to create sample media: %v", err)
			continue
		}
	}

	log.Printf("✅ Created %d sample media items", len(sampleMedia))
	return nil
} 
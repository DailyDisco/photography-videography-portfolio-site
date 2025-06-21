package main

import (
	"fmt"
	"log"
	"photography-portfolio/config"
	"photography-portfolio/models"
	"strings"

	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	envFiles := []string{"../../env.development", "../.env", "../../.env"}
	var envLoaded bool
	
	for _, envFile := range envFiles {
		if err := godotenv.Load(envFile); err == nil {
			log.Printf("✅ Loaded environment from: %s", envFile)
			envLoaded = true
			break
		}
	}
	
	if !envLoaded {
		log.Println("⚠️  Warning: No environment file found, using system environment variables")
	}

	// Initialize configuration
	cfg := config.LoadConfig()

	// Initialize database
	db, err := config.InitDatabase(cfg)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Get all media records
	var mediaList []models.Media
	if err := db.Find(&mediaList).Error; err != nil {
		log.Fatal("Failed to fetch media records:", err)
	}

	log.Printf("🔄 Found %d media records to fix", len(mediaList))

	// Fix URL paths
	fixedCount := 0
	for _, media := range mediaList {
		needsUpdate := false
		
		// Fix S3URL - remove extra /media from path
		if strings.HasPrefix(media.S3URL, "/uploads/media/") {
			media.S3URL = strings.Replace(media.S3URL, "/uploads/media/", "/uploads/", 1)
			needsUpdate = true
		}
		
		// Fix ThumbnailURL - remove extra /media from path
		if strings.HasPrefix(media.ThumbnailURL, "/uploads/media/") {
			media.ThumbnailURL = strings.Replace(media.ThumbnailURL, "/uploads/media/", "/uploads/", 1)
			needsUpdate = true
		}
		
		if needsUpdate {
			if err := db.Save(&media).Error; err != nil {
				log.Printf("❌ Failed to update media ID %d: %v", media.ID, err)
				continue
			}
			log.Printf("✅ Fixed URLs for: %s (ID: %d)", media.FileName, media.ID)
			fixedCount++
		}
	}

	log.Printf("🎉 Successfully fixed %d media records", fixedCount)
	
	// Verify fix by checking a few records
	log.Println("\n📋 Sample of fixed URLs:")
	var sampleMedia []models.Media
	db.Limit(5).Find(&sampleMedia)
	for _, media := range sampleMedia {
		fmt.Printf("  %s -> %s\n", media.FileName, media.S3URL)
	}
	
	log.Println("\n✅ Database URL fix complete!")
	log.Println("🔗 URLs now point to: /uploads/filename.jpg")
} 
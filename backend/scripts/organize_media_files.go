package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
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

	log.Println("🔧 Starting media file organization...")

	// Step 1: Move files from uploads/media/ to uploads/
	sourceDir := "uploads/media"
	targetDir := "uploads"
	
	if _, err := os.Stat(sourceDir); os.IsNotExist(err) {
		// Try relative path for local development
		sourceDir = "../uploads/media"
		targetDir = "../uploads"
	}

	if _, err := os.Stat(sourceDir); !os.IsNotExist(err) {
		log.Printf("📁 Moving files from %s to %s", sourceDir, targetDir)
		
		files, err := filepath.Glob(filepath.Join(sourceDir, "*"))
		if err != nil {
			log.Fatal("Failed to list files:", err)
		}

		movedCount := 0
		for _, file := range files {
			if filepath.Ext(file) == "" {
				continue // Skip directories
			}
			
			filename := filepath.Base(file)
			targetPath := filepath.Join(targetDir, filename)
			
			// Check if target already exists
			if _, err := os.Stat(targetPath); err == nil {
				log.Printf("⏭️  Skipping %s (already exists in target)", filename)
				continue
			}
			
			// Move file
			if err := os.Rename(file, targetPath); err != nil {
				log.Printf("❌ Failed to move %s: %v", filename, err)
				continue
			}
			
			log.Printf("✅ Moved: %s", filename)
			movedCount++
		}
		
		log.Printf("📦 Moved %d files to uploads directory", movedCount)
	} else {
		log.Println("📁 No uploads/media directory found - files may already be organized")
	}

	// Step 2: Update database URLs
	var mediaList []models.Media
	if err := db.Find(&mediaList).Error; err != nil {
		log.Fatal("Failed to fetch media records:", err)
	}

	log.Printf("🔄 Updating %d database records", len(mediaList))

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
			fixedCount++
		}
	}

	log.Printf("🎉 Successfully updated %d media records", fixedCount)
	
	// Step 3: Verify files exist and are accessible
	log.Println("🔍 Verifying file accessibility...")
	var brokenCount int
	var workingCount int
	
	for _, media := range mediaList {
		// Check if file exists (remove /uploads prefix for file system path)
		filePath := strings.TrimPrefix(media.S3URL, "/uploads/")
		fullPath := filepath.Join(targetDir, filePath)
		
		if _, err := os.Stat(fullPath); os.IsNotExist(err) {
			log.Printf("⚠️  Missing file: %s (expected at %s)", media.FileName, fullPath)
			brokenCount++
		} else {
			workingCount++
		}
	}
	
	log.Printf("✅ %d files are accessible", workingCount)
	if brokenCount > 0 {
		log.Printf("❌ %d files are missing", brokenCount)
	}

	// Step 4: Show sample URLs
	log.Println("\n📋 Sample URLs after fix:")
	var sampleMedia []models.Media
	db.Limit(5).Find(&sampleMedia)
	for _, media := range sampleMedia {
		fmt.Printf("  %s -> %s\n", media.FileName, media.S3URL)
	}
	
	log.Println("\n✅ Media organization complete!")
	log.Println("🔗 Files should now be accessible at: http://localhost:8080/uploads/filename.jpg")
	log.Println("🎯 Test the frontend - images should now display correctly!")
} 
package main

import (
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"photography-portfolio/config"
	"photography-portfolio/models"
	"strings"

	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables - try different env files
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

	// Auto-migrate database models
	if err := models.MigrateModels(db); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Source directory (your stock photos) - check if running in Docker
	sourceDir := "/photos" // Docker mount path
	if _, err := os.Stat(sourceDir); os.IsNotExist(err) {
		// Fallback to local development path
		sourceDir = "../frontend/src/public/Photography App Pictures"
	}
	
	// Destination directory (backend uploads)
	destDir := "uploads/media" // Docker path
	if _, err := os.Stat("../uploads"); !os.IsNotExist(err) {
		// Running locally, use relative path
		destDir = "../uploads/media"
	}

	// Create destination directory if it doesn't exist
	if err := os.MkdirAll(destDir, 0755); err != nil {
		log.Fatal("Failed to create destination directory:", err)
	}

	// Category mapping
	categoryMap := map[string]string{
		"Athletes":  "athletes",
		"Food":      "food",
		"Nature":    "nature",
		"Portraits": "portraits",
		"Action":    "action",
	}

	// Walk through source directory
	err = filepath.Walk(sourceDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Skip directories and non-image files
		if info.IsDir() || !isImageFile(info.Name()) {
			return nil
		}

		// Get category from parent directory
		parentDir := filepath.Base(filepath.Dir(path))
		category, exists := categoryMap[parentDir]
		if !exists {
			fmt.Printf("Skipping file in unknown category: %s\n", path)
			return nil
		}

		// Generate filename for destination
		filename := info.Name()
		destPath := filepath.Join(destDir, filename)

		// Copy file if it doesn't exist
		if _, err := os.Stat(destPath); os.IsNotExist(err) {
			if err := copyFile(path, destPath); err != nil {
				fmt.Printf("Failed to copy %s: %v\n", path, err)
				return nil
			}
			fmt.Printf("Copied: %s -> %s\n", path, destPath)
		}

		// Check if media record already exists
		var existingMedia models.Media
		result := db.Where("file_name = ?", filename).First(&existingMedia)
		if result.Error == nil {
			fmt.Printf("Media record already exists for: %s\n", filename)
			return nil
		}

		// Create media record
		media := models.Media{
			Title:        generateTitle(filename),
			Description:  fmt.Sprintf("Professional %s photography", category),
			S3URL:        fmt.Sprintf("/uploads/%s", filename),
			ThumbnailURL: fmt.Sprintf("/uploads/%s", filename),
			Category:     models.MediaCategory(category),
			Type:         models.MediaTypeImage,
			IsFeatured:   false, // You can manually set featured items later
			FileName:     filename,
			FileSize:     info.Size(),
			MimeType:     "image/jpeg", // Default, could be detected based on file extension
			ViewCount:    0,
			UserID:       1, // Assuming admin user has ID 1
		}

		if err := db.Create(&media).Error; err != nil {
			fmt.Printf("Failed to create media record for %s: %v\n", filename, err)
			return nil
		}

		fmt.Printf("Created media record: %s (%s)\n", media.Title, media.Category)
		return nil
	})

	if err != nil {
		log.Fatal("Failed to walk source directory:", err)
	}

	// Print summary
	var totalMedia int64
	db.Model(&models.Media{}).Count(&totalMedia)
	fmt.Printf("\n✅ Import completed! Total media items in database: %d\n", totalMedia)

	// Print category breakdown
	fmt.Println("\nCategory breakdown:")
	for _, category := range []string{"athletes", "food", "nature", "portraits", "action"} {
		var count int64
		db.Model(&models.Media{}).Where("category = ?", category).Count(&count)
		fmt.Printf("  %s: %d items\n", strings.Title(category), count)
	}
}

// isImageFile checks if the file is an image based on extension
func isImageFile(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	imageExts := []string{".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tiff"}
	
	for _, validExt := range imageExts {
		if ext == validExt {
			return true
		}
	}
	return false
}

// copyFile copies a file from source to destination
func copyFile(src, dst string) error {
	sourceFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer sourceFile.Close()

	destFile, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer destFile.Close()

	_, err = io.Copy(destFile, sourceFile)
	return err
}

// generateTitle creates a nice title from filename
func generateTitle(filename string) string {
	// Remove extension
	name := strings.TrimSuffix(filename, filepath.Ext(filename))
	
	// Replace underscores and hyphens with spaces
	name = strings.ReplaceAll(name, "_", " ")
	name = strings.ReplaceAll(name, "-", " ")
	
	// Capitalize first letter of each word
	words := strings.Fields(name)
	for i, word := range words {
		if len(word) > 0 {
			words[i] = strings.ToUpper(word[:1]) + strings.ToLower(word[1:])
		}
	}
	
	return strings.Join(words, " ")
} 
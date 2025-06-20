package middleware

import (
	"strings"

	"photography-portfolio/config"
	"photography-portfolio/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// AuthRequired middleware checks for valid JWT token
func AuthRequired(cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get token from Authorization header
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "Unauthorized",
				"message": "Authorization header is required",
			})
		}

		// Extract token from "Bearer <token>" format
		tokenString := ""
		if strings.HasPrefix(authHeader, "Bearer ") {
			tokenString = strings.TrimPrefix(authHeader, "Bearer ")
		} else {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "Unauthorized",
				"message": "Invalid authorization header format",
			})
		}

		// Parse and validate token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Validate the signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.NewError(fiber.StatusUnauthorized, "Invalid signing method")
			}
			return []byte(cfg.JWTSecret), nil
		})

		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "Unauthorized",
				"message": "Invalid or expired token",
				"details": err.Error(),
			})
		}

		// Extract claims
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			// Store user info in context
			c.Locals("userID", claims["user_id"])
			c.Locals("userEmail", claims["email"])
			c.Locals("userRole", claims["role"])

			// Validate token expiration
			if !utils.ValidateTokenExpiration(claims) {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"error":   "Unauthorized",
					"message": "Token has expired",
				})
			}

			return c.Next()
		}

		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error":   "Unauthorized",
			"message": "Invalid token claims",
		})
	}
}

// AdminRequired middleware checks if user has admin role
func AdminRequired() fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRole := c.Locals("userRole")
		if userRole == nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error":   "Unauthorized",
				"message": "User role not found in token",
			})
		}

		role, ok := userRole.(string)
		if !ok || role != "admin" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error":   "Forbidden",
				"message": "Admin access required",
			})
		}

		return c.Next()
	}
}

// OptionalAuth middleware that extracts user info if token is present but doesn't require it
func OptionalAuth(cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Next()
		}

		tokenString := ""
		if strings.HasPrefix(authHeader, "Bearer ") {
			tokenString = strings.TrimPrefix(authHeader, "Bearer ")
		} else {
			return c.Next()
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.NewError(fiber.StatusUnauthorized, "Invalid signing method")
			}
			return []byte(cfg.JWTSecret), nil
		})

		if err != nil {
			return c.Next() // Continue without auth if token is invalid
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			if utils.ValidateTokenExpiration(claims) {
				c.Locals("userID", claims["user_id"])
				c.Locals("userEmail", claims["email"])
				c.Locals("userRole", claims["role"])
			}
		}

		return c.Next()
	}
}

// GetUserIDFromContext extracts user ID from fiber context
func GetUserIDFromContext(c *fiber.Ctx) (uint, bool) {
	userID := c.Locals("userID")
	if userID == nil {
		return 0, false
	}

	// Handle different number types that might come from JWT claims
	switch v := userID.(type) {
	case float64:
		return uint(v), true
	case int:
		return uint(v), true
	case uint:
		return v, true
	default:
		return 0, false
	}
}

// GetUserEmailFromContext extracts user email from fiber context
func GetUserEmailFromContext(c *fiber.Ctx) (string, bool) {
	userEmail := c.Locals("userEmail")
	if userEmail == nil {
		return "", false
	}

	email, ok := userEmail.(string)
	return email, ok
}

// GetUserRoleFromContext extracts user role from fiber context
func GetUserRoleFromContext(c *fiber.Ctx) (string, bool) {
	userRole := c.Locals("userRole")
	if userRole == nil {
		return "", false
	}

	role, ok := userRole.(string)
	return role, ok
}

// IsAuthenticatedUser checks if the current user is authenticated
func IsAuthenticatedUser(c *fiber.Ctx) bool {
	_, exists := GetUserIDFromContext(c)
	return exists
}

// IsAdminUser checks if the current user is an admin
func IsAdminUser(c *fiber.Ctx) bool {
	role, exists := GetUserRoleFromContext(c)
	return exists && role == "admin"
} 
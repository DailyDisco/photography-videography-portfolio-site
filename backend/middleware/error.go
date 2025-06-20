package middleware

import (
	"log"

	"github.com/gofiber/fiber/v2"
)

// ErrorResponse represents a standard error response
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
	Code    int    `json:"code,omitempty"`
	Details string `json:"details,omitempty"`
}

// ErrorHandler is a global error handler for Fiber
func ErrorHandler(c *fiber.Ctx, err error) error {
	// Default error code
	code := fiber.StatusInternalServerError
	message := "Internal Server Error"
	details := err.Error()

	// Handle Fiber errors
	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
		message = e.Message
	}

	// Log the error for debugging
	log.Printf("Error: %s - Path: %s - Method: %s - IP: %s", 
		err.Error(), c.Path(), c.Method(), c.IP())

	// Return error response
	return c.Status(code).JSON(ErrorResponse{
		Error:   getErrorName(code),
		Message: message,
		Code:    code,
		Details: details,
	})
}

// getErrorName returns a human-readable error name for HTTP status codes
func getErrorName(code int) string {
	switch code {
	case fiber.StatusBadRequest:
		return "Bad Request"
	case fiber.StatusUnauthorized:
		return "Unauthorized"
	case fiber.StatusForbidden:
		return "Forbidden"
	case fiber.StatusNotFound:
		return "Not Found"
	case fiber.StatusMethodNotAllowed:
		return "Method Not Allowed"
	case fiber.StatusConflict:
		return "Conflict"
	case fiber.StatusUnprocessableEntity:
		return "Unprocessable Entity"
	case fiber.StatusTooManyRequests:
		return "Too Many Requests"
	case fiber.StatusInternalServerError:
		return "Internal Server Error"
	case fiber.StatusBadGateway:
		return "Bad Gateway"
	case fiber.StatusServiceUnavailable:
		return "Service Unavailable"
	default:
		return "Error"
	}
}

// NotFoundHandler handles 404 errors
func NotFoundHandler(c *fiber.Ctx) error {
	return c.Status(fiber.StatusNotFound).JSON(ErrorResponse{
		Error:   "Not Found",
		Message: "The requested resource was not found",
		Code:    fiber.StatusNotFound,
	})
}

// ValidationErrorResponse creates a validation error response
func ValidationErrorResponse(c *fiber.Ctx, message string, details string) error {
	return c.Status(fiber.StatusBadRequest).JSON(ErrorResponse{
		Error:   "Validation Error",
		Message: message,
		Code:    fiber.StatusBadRequest,
		Details: details,
	})
}

// UnauthorizedResponse creates an unauthorized error response
func UnauthorizedResponse(c *fiber.Ctx, message string) error {
	return c.Status(fiber.StatusUnauthorized).JSON(ErrorResponse{
		Error:   "Unauthorized",
		Message: message,
		Code:    fiber.StatusUnauthorized,
	})
}

// ForbiddenResponse creates a forbidden error response
func ForbiddenResponse(c *fiber.Ctx, message string) error {
	return c.Status(fiber.StatusForbidden).JSON(ErrorResponse{
		Error:   "Forbidden",
		Message: message,
		Code:    fiber.StatusForbidden,
	})
}

// ConflictResponse creates a conflict error response
func ConflictResponse(c *fiber.Ctx, message string) error {
	return c.Status(fiber.StatusConflict).JSON(ErrorResponse{
		Error:   "Conflict",
		Message: message,
		Code:    fiber.StatusConflict,
	})
}

// InternalServerErrorResponse creates an internal server error response
func InternalServerErrorResponse(c *fiber.Ctx, message string) error {
	return c.Status(fiber.StatusInternalServerError).JSON(ErrorResponse{
		Error:   "Internal Server Error",
		Message: message,
		Code:    fiber.StatusInternalServerError,
	})
} 
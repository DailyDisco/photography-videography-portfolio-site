package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWTClaims represents the JWT claims structure
type JWTClaims struct {
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// GenerateJWT generates a new JWT token for a user
func GenerateJWT(userID uint, email, role, secret string, expiresIn time.Duration) (string, error) {
	claims := JWTClaims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiresIn)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "photography-portfolio",
			Subject:   email,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// ValidateTokenExpiration checks if the token is expired
func ValidateTokenExpiration(claims jwt.MapClaims) bool {
	if exp, ok := claims["exp"]; ok {
		if expTime, ok := exp.(float64); ok {
			return time.Unix(int64(expTime), 0).After(time.Now())
		}
	}
	return false
}

// ParseJWT parses and validates a JWT token
func ParseJWT(tokenString, secret string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, jwt.ErrTokenInvalid
}

// RefreshToken generates a new token with extended expiration
func RefreshToken(tokenString, secret string, newExpiresIn time.Duration) (string, error) {
	claims, err := ParseJWT(tokenString, secret)
	if err != nil {
		return "", err
	}

	// Update expiration time
	claims.ExpiresAt = jwt.NewNumericDate(time.Now().Add(newExpiresIn))
	claims.IssuedAt = jwt.NewNumericDate(time.Now())

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
} 
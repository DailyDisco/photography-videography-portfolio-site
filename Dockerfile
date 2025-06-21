# Railway-optimized production build
# Single stage build for simplicity and reliability

FROM golang:1.24-alpine AS builder

# Install build dependencies including Node.js
RUN apk add --no-cache git ca-certificates curl nodejs npm

# Set working directory
WORKDIR /app

# Copy entire project (Railway context includes everything)
COPY . .

# Navigate to backend and build
WORKDIR /app/backend

# Ensure go.sum exists and download dependencies
RUN go mod tidy && go mod download

# Build the Go application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Navigate to frontend and build
WORKDIR /app/frontend

# Install Node.js dependencies and build
RUN npm ci --only=production && npm run build

# Final stage - create runtime container
FROM alpine:latest

# Install runtime dependencies
RUN apk --no-cache add ca-certificates curl tzdata

# Set timezone
ENV TZ=UTC

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Set working directory
WORKDIR /app

# Copy backend binary
COPY --from=builder /app/backend/main .

# Copy built frontend
COPY --from=builder /app/frontend/dist ./static/

# Create uploads directory
RUN mkdir -p uploads logs && \
    chown -R appuser:appgroup /app

# Change to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# Set production environment
ENV ENVIRONMENT=production
ENV GIN_MODE=release

# Run the application
CMD ["./main"] 
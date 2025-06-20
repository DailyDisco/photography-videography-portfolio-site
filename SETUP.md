# Photography Portfolio Website - Setup Guide

This guide will help you set up and deploy the complete photography and videography portfolio website.

## 🏗️ Project Architecture

```
photography-videography-portfolio-site/
├── backend/              # Go + Fiber + GORM backend
├── frontend/             # React + TypeScript + Vite frontend
├── deployment/           # Railway and Docker configs
├── .github/workflows/    # CI/CD pipelines
├── docker-compose.yml    # Local development
└── env.example          # Environment variables template
```

## 🚀 Quick Start (Local Development)

### Prerequisites

- **Docker & Docker Compose** (easiest way)
- OR individual tools:
  - Go 1.21+
  - Node.js 18+
  - PostgreSQL 15+

### Option 1: Docker Compose (Recommended)

1. **Clone and setup:**

```bash
git clone <your-repo>
cd photography-videography-portfolio-site
cp env.example .env
```

2. **Configure environment variables in `.env`:**

```bash
# Database
DATABASE_URL=postgresql://user:password@postgres:5432/portfolio

# AWS S3 (get from AWS Console)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your-bucket-name

# Stripe (get from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key
```

3. **Start the application:**

```bash
docker-compose up --build
```

4. **Access the application:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- Default admin: `admin@portfolio.com` / `admin123`

### Option 2: Manual Setup

**Backend:**

```bash
cd backend
go mod download
go run main.go
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

**Database:**

```bash
# Install PostgreSQL and create database
createdb portfolio
```

## 🎯 Key Features Implemented

### Backend (Go + Fiber)

- ✅ **Authentication:** JWT-based admin authentication
- ✅ **Database:** PostgreSQL with GORM auto-migration
- ✅ **File Upload:** AWS S3 integration for images/videos
- ✅ **Payment:** Stripe checkout sessions
- ✅ **Email:** Contact form with SMTP
- ✅ **API:** RESTful endpoints for all features
- ✅ **Security:** Rate limiting, CORS, input validation

### Frontend (React + TypeScript)

- ✅ **Gallery:** Category-based photo/video galleries
- ✅ **Admin Panel:** Upload and manage media
- ✅ **Booking System:** Service booking with Stripe
- ✅ **Contact Form:** Contact form with validation
- ✅ **Responsive Design:** Mobile-first with Tailwind CSS
- ✅ **Animations:** Framer Motion for smooth transitions
- ✅ **State Management:** React Query + Redux Toolkit

### Gallery Categories

- 📸 **Athletes** - Sports photography
- 🍽️ **Food** - Culinary photography
- 🌲 **Nature** - Landscape photography
- 👤 **Portraits** - Portrait photography
- ⚡ **Action** - Action/event photography

## 🔧 Configuration

### Environment Variables

**Backend (.env):**

```bash
# Server
PORT=8080
ENVIRONMENT=development
CORS_ORIGIN=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-portfolio-bucket

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=24h

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Frontend (.env):**

```bash
VITE_API_URL=http://localhost:8080/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### AWS S3 Setup

1. **Create S3 bucket:**

   - Go to AWS S3 Console
   - Create bucket: `your-portfolio-bucket`
   - Enable public read access for gallery images
   - Configure CORS for upload

2. **IAM User:**
   - Create IAM user with S3 permissions
   - Get Access Key ID and Secret Access Key

### Stripe Setup

1. **Create Stripe account**
2. **Get API keys from Dashboard**
3. **Configure webhook endpoint:** `your-domain.com/api/stripe/webhook`
4. **Set up products/prices for booking services**

## 🚀 Production Deployment

### Railway Deployment (Recommended)

1. **Connect GitHub repository to Railway**

2. **Set environment variables in Railway dashboard:**

```bash
# All production environment variables
DATABASE_URL=...
AWS_ACCESS_KEY_ID=...
STRIPE_SECRET_KEY=...
# etc.
```

3. **Deploy automatically on push to main branch**

### Manual Docker Deployment

```bash
# Build and run production containers
docker-compose -f docker-compose.prod.yml up --build -d
```

## 📊 API Endpoints

### Public Endpoints

```
GET  /api/health              # Health check
GET  /api/media/:category     # Get media by category
POST /api/contact             # Submit contact form
POST /api/stripe/checkout     # Create payment session
```

### Admin Endpoints (Requires Authentication)

```
POST /api/auth/login          # Admin login
POST /api/media/upload        # Upload media
PUT  /api/media/:id           # Update media
DELETE /api/media/:id         # Delete media
GET  /api/contact/messages    # Get contact messages
```

## 🧪 Testing

**Backend:**

```bash
cd backend
go test ./...
```

**Frontend:**

```bash
cd frontend
npm run test
npm run test:coverage
```

## 🔍 Monitoring & Logs

**View logs:**

```bash
# Docker Compose
docker-compose logs -f backend
docker-compose logs -f frontend

# Railway
railway logs --service backend
railway logs --service frontend
```

**Health checks:**

- Backend: `http://localhost:8080/api/health`
- Frontend: `http://localhost:3000/health`

## 🛠️ Development Workflow

1. **Feature development:**

   - Create feature branch
   - Develop locally with hot reload
   - Test thoroughly

2. **Pull Request:**

   - CI runs tests automatically
   - Code review required

3. **Deployment:**
   - Merge to main triggers deployment
   - Automatic Railway deployment

## 📈 Performance Optimizations

- **Image optimization:** WebP format, multiple sizes
- **Caching:** React Query, browser caching, CDN
- **Code splitting:** Route-based chunks
- **Database:** Connection pooling, indexes
- **Rate limiting:** API protection

## 🔒 Security Features

- **Authentication:** JWT with secure cookies
- **Authorization:** Role-based access control
- **Input validation:** Zod schemas, GORM validation
- **File uploads:** Type validation, size limits
- **Rate limiting:** Protection against abuse
- **HTTPS:** SSL/TLS encryption (production)

## 📞 Support

- **Admin Login:** `admin@portfolio.com` / `admin123`
- **Default Categories:** All gallery categories pre-configured
- **Sample Data:** Automatically seeded in development

## 🎨 Customization

**Gallery Categories:**

- Edit `backend/models/media.go` to add/modify categories
- Update frontend routes in `frontend/src/App.tsx`

**Styling:**

- Modify `frontend/tailwind.config.js` for custom themes
- Edit `frontend/src/styles/globals.css` for global styles

**Pricing:**

- Update `backend/models/booking.go` for service prices
- Configure Stripe products for payment integration

---

**Ready to capture and showcase amazing photography! 📸✨**

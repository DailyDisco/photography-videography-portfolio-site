# Photography & Videography Portfolio Website

A full-stack web application for showcasing categorized visual content with booking and payment capabilities.

## 🚀 Tech Stack

### Backend
- **Go** with **Fiber** framework
- **GORM** for database ORM
- **PostgreSQL** database
- **AWS S3** for media storage
- **Stripe** for payments
- **JWT** authentication

### Frontend
- **React 18** with **TypeScript**
- **Vite** for build tooling
- **TailwindCSS** + **ShadCN UI** for styling
- **React Query** for data fetching
- **React Hook Form** + **Zod** for forms
- **Framer Motion** for animations
- **React Router** for navigation

### DevOps
- **Docker** + **Docker Compose**
- **Railway** for deployment
- **GitHub Actions** for CI/CD
- **PostgreSQL** database

## 📁 Project Structure

```
photography-videography-portfolio-site/
├── backend/          # Go backend application
├── frontend/         # React frontend application
├── deployment/       # Deployment configurations
├── .github/         # GitHub Actions workflows
└── docker-compose.yml
```

## 🛠️ Development Setup

### Prerequisites
- **Go 1.21+**
- **Node.js 18+**
- **Docker** & **Docker Compose**
- **PostgreSQL** (or use Docker)

### Quick Start

1. **Clone and setup environment:**
```bash
git clone <repository-url>
cd photography-videography-portfolio-site
cp .env.example .env
# Edit .env with your configuration
```

2. **Start with Docker Compose:**
```bash
docker-compose up --build
```

3. **Or run individually:**

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

## 🗂️ Gallery Categories

- `/athletes` - Sports and athletic photography
- `/food` - Culinary and food photography  
- `/nature` - Landscape and nature photography
- `/portraits` - Portrait photography
- `/action` - Action and event photography

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# JWT
JWT_SECRET=your-jwt-secret

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🚀 Deployment

### Railway Deployment

1. **Connect your GitHub repository to Railway**
2. **Set environment variables in Railway dashboard**
3. **Deploy automatically on push to main branch**

### Manual Deployment

```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up --build -d
```

## 📊 API Endpoints

### Public Endpoints
- `GET /api/media/:category` - Get media by category
- `POST /api/contact` - Submit contact form
- `GET /api/health` - Health check

### Protected Endpoints (Admin)
- `POST /api/auth/login` - Admin login
- `POST /api/media/upload` - Upload media
- `DELETE /api/media/:id` - Delete media

### Payment Endpoints
- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/webhook` - Stripe webhook handler

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
```

## 📝 Features

- ✅ Responsive gallery with categories
- ✅ Admin panel for media management
- ✅ Secure file upload to S3
- ✅ Stripe payment integration
- ✅ Contact form with email notifications
- ✅ JWT-based authentication
- ✅ Image optimization and lazy loading
- ✅ Mobile-first responsive design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 
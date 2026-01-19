# Swift Transfer - Money Transfer System

A full-stack money transfer system built with **Node.js**, **Express**, **React**, **TypeScript**, **MS SQL Server**, **Redis**, and **Kafka**. Enables secure money transfers from Japan (JPY) to Nepal (NPR) with real-time exchange rates, transaction tracking, and comprehensive user management.

## ✨ Features

### 💰 Money Transfer
- **Cross-border transfers** from Japan to Nepal
- **Real-time exchange rates** with automatic calculations
- **Multi-tier service fees** based on transfer amount
- **Transaction tracking** with unique IDs and status updates
- **Secure payment processing** with validation

### 👥 User Management
- **Role-based access control** (Admin, User, Viewer)
- **JWT authentication** with secure session management
- **User profiles** with activity tracking
- **Admin panel** for user and system management

### 📋 Sender & Receiver Management
- **Sender profiles** with identity verification
- **Receiver management** linked to senders
- **Bank account details** for Nepali recipients
- **Relationship tracking** (family, friends, business)

### 📊 Dashboard & Analytics
- **Transaction statistics** and volume tracking
- **Real-time metrics** and performance indicators
- **Export capabilities** for reporting
- **Comprehensive filtering** and search

### 🔧 Technical Features
- **Server-side pagination** for large datasets
- **Advanced filtering** across all entities
- **Kafka messaging**
- **Docker containerization** for easy deployment
- **Comprehensive API** with OpenAPI documentation

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Yarn or npm

## 🐳 Docker Setup

The project supports multiple Docker configurations for different development scenarios:

### Option 1: Development with Local Frontend (Recommended)

**Services run in Docker, Frontend runs locally for hot reloading**

```bash
# Start Docker services (DB, Redis, Kafka)
./scripts/dev.sh

# In another terminal, start frontend locally
cd frontend && yarn dev

# In another terminal, start backend locally
cd backend && yarn dev

# If not working, Try
docker-compose down
docker volume rm swift-transfer_kafka_data
docker-compose up -d
cd backend && yarn dev
```

**URLs:**

- Frontend: <http://localhost:8080>
- Backend API: <http://localhost:3000>
- Database: localhost:1433
- Redis: localhost:6379
- Kafka: localhost:9092

### Option 2: Full Docker Development

**Everything runs in Docker with volume mounting for hot reloading**

```bash
# Start all services in Docker
./scripts/dev-docker.sh

# Start frontend locally (for fastest hot reloading)
cd frontend && yarn dev
```

**URLs:**

- Frontend: <http://localhost:8080> (local)
- Backend: <http://localhost:3000> (Docker with hot reloading)
- Database: localhost:1433
- Redis: localhost:6379
- Kafka: localhost:9092

### Option 3: Production

**Full production deployment with frontend and backend in containers**

```bash
# Start production environment
./scripts/prod.sh
```

**URLs:**

- Full App: <http://localhost:8080>
- Backend API: <http://localhost:3000>
- Database: localhost:1433
- Redis: localhost:6379
- Kafka: localhost:9092

## 🛠️ Manual Docker Commands

### Start Services Only

```bash
docker-compose up -d
```

### Start with Backend

```bash
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
```

### Start Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Stop Services

```bash
# Development
docker-compose down

# Production
docker-compose -f docker-compose.prod.yml down
```

## 🏠 Local Development (Without Docker)

If you prefer running everything locally without Docker:

### Prerequisites

- MS SQL Server running locally or remotely
- Redis server running locally
- Kafka cluster running locally
- Node.js 18+

### Setup Steps

1. **Install dependencies:**

   ```bash
   cd backend && yarn install
   cd ../frontend && yarn install
   ```

2. **Configure environment:**

   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your local service URLs
   ```

3. **Setup database:**

   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

4. **Start services:**

   ```bash
   # Terminal 1: Backend
   cd backend && yarn dev

   # Terminal 2: Frontend
   cd frontend && yarn dev
   ```

## 📁 Project Structure

```
swift-transfer/
├── backend/                    # Node.js/Express API (TypeScript)
│   ├── src/
│   │   ├── config/            # Database, Redis, Kafka configs
│   │   ├── modules/           # Feature modules:
│   │   │   ├── auth/          # Authentication & JWT
│   │   │   ├── user/          # User management
│   │   │   ├── senders/       # Sender profiles & management
│   │   │   ├── receivers/     # Receiver profiles & management
│   │   │   ├── transactions/  # Money transfer transactions
│   │   │   ├── dashboard/     # Analytics & statistics
│   │   │   └── monitoring/    # Health checks & metrics
│   │   ├── middleware/        # Express middleware (auth, validation, error handling)
│   │   ├── routes/            # API route definitions
│   │   ├── utils/             # Utilities (fees, forex, helpers, logger)
│   │   ├── types/             # TypeScript type definitions
│   │   └── server.ts          # Server entry point
│   ├── prisma/                # Database schema, migrations, seed data
│   ├── Dockerfile             # Backend container config
│   └── docker-compose.yml     # Backend services (legacy)
├── frontend/                  # React/TypeScript/Vite frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # React contexts (Auth, Error)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utilities & configurations
│   │   ├── modules/           # Feature modules (matching backend)
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service functions
│   │   ├── shared/            # Shared components & utilities
│   │   ├── types/             # TypeScript definitions
│   │   └── utils/             # Helper functions
│   ├── Dockerfile             # Frontend container config
│   └── nginx.conf             # Nginx config for production
├── docker-compose.yml         # Development services (DB, Redis, Kafka)
├── docker-compose.override.yml # Development backend override
├── docker-compose.prod.yml    # Production full stack
└── scripts/                   # Convenience scripts
    ├── dev.sh                 # Development mode
    ├── dev-docker.sh          # Docker development mode
    └── prod.sh                # Production mode
```

## 🔧 Environment Configuration

The project uses different environment files for different scenarios:

- `.env` - Default local development
- `.env.local` - Local development (localhost services)
- `.env.docker` - Docker development (container service names)
- `.env.prod` - Production environment

### Environment Variables

The project requires the following environment variables. Copy `.env.example` to `.env` and configure appropriately:

```bash
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DATABASE_URL="sqlserver://localhost:1433;database=swift_transfer;user=sa;password=YourStrongPassword123!;trustServerCertificate=true"

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Kafka Configuration
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=swift-transfer-backend

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-32-chars-minimum
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-32-chars-minimum
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# OTP Configuration
OTP_EXPIRY_SECONDS=300
OTP_RATE_LIMIT_MAX=5
OTP_RATE_LIMIT_WINDOW=60000

# CORS Configuration
CORS_ORIGIN=http://localhost:8080

# Logging
LOG_LEVEL=info

# Forex Configuration
EXCHANGE_RATE_JPY_TO_NPR=0.92

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Key Environment Variables

**Database:**

- `DATABASE_URL` - MS SQL Server connection string

**Redis:**

- `REDIS_HOST` - Redis hostname
- `REDIS_PORT` - Redis port

**Kafka:**

- `KAFKA_BROKERS` - Kafka broker URLs

**JWT:**

- `JWT_SECRET` - JWT signing secret (32+ characters, change in production!)
- `JWT_REFRESH_SECRET` - JWT refresh token secret (32+ characters)

## 🗄️ Database Setup

### Using Docker (Recommended)

The docker-compose.yml includes MS SQL Server, which is automatically configured.

### Using Local MS SQL Server

1. Install MS SQL Server locally
2. Create database: `swift_transfer`
3. Update `DATABASE_URL` in your `.env` file

### Database Commands

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Create migration
npx prisma migrate dev

# Seed database
npx prisma db seed

# View database
npx prisma studio
```

## 🧪 Testing

```bash
# Backend tests
cd backend && yarn test

# Frontend tests
cd frontend && yarn test
```

## 📊 Monitoring

### Health Checks

- Backend: `GET /health`
- Database connectivity
- Redis connectivity
- Kafka connectivity

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f mssql
docker-compose logs -f redis
docker-compose logs -f kafka
```

## 🚀 Deployment

### Production Checklist

- [ ] Change JWT secrets in `.env.prod`
- [ ] Configure proper CORS origins
- [ ] Set up proper logging
- [ ] Configure SSL certificates
- [ ] Set up database backups
- [ ] Configure monitoring and alerts

### Docker Production Deployment

```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d --build

# Scale services if needed
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

## 🔍 Troubleshooting

### Common Issues

**Backend won't start:**

- Check if all services are running: `docker-compose ps`
- Check logs: `docker-compose logs backend`
- Verify environment variables

**Database connection issues:**

- Ensure MS SQL Server is running and accessible
- Check `DATABASE_URL` format
- Verify network connectivity in Docker

**Prisma issues:**

- Run `npx prisma generate` after schema changes
- Check OpenSSL compatibility (fixed in Dockerfile)

**Port conflicts:**

- Ensure ports 3000, 5173, 1433, 6379, 9092 are available
- Or modify port mappings in docker-compose files

**Permission issues:**

- Ensure Docker has proper permissions
- Check file permissions on mounted volumes

### Reset Everything

```bash
# Stop all containers
docker-compose down
docker-compose -f docker-compose.prod.yml down

# Remove volumes (WARNING: deletes data)
docker-compose down -v
docker-compose -f docker-compose.prod.yml down -v

# Rebuild from scratch
docker-compose build --no-cache
```

#!/bin/bash

# Production script - runs everything in Docker
echo "🚀 Starting Swift Transfer in Production Mode"
echo "🐳 All services will run in Docker containers"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Stop any existing development services
echo "🛑 Stopping any existing development services..."
docker-compose down

# Start production services
echo "🐳 Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 15

# Check if services are healthy
echo "🔍 Checking service health..."

# Check backend health
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Backend is ready"
else
    echo "❌ Backend is not ready yet"
fi

echo ""
echo "🎯 All services are running!"
echo ""
echo "🔗 Service URLs:"
echo "  - Frontend: http://localhost:8080"
echo "  - Backend API: http://localhost:3000"
echo "  - MSSQL: localhost:1433"
echo "  - Redis: localhost:6379"
echo "  - Kafka: localhost:9092"
echo ""
echo "📊 View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "🛑 To stop services: docker-compose -f docker-compose.prod.yml down"

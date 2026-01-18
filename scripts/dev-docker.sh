#!/bin/bash

# Development Docker script - runs everything in Docker with hot reloading
echo "🚀 Starting Swift Transfer in Docker Development Mode"
echo "🐳 All services will run in Docker with volume mounting for hot reloading"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start all services with override (includes backend with volume mounting)
echo "🐳 Starting all services with hot reloading..."
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d

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
echo "🎯 All services are running with hot reloading!"
echo ""
echo "🔗 Service URLs:"
echo "  - Backend: http://localhost:3000 (with hot reloading)"
echo "  - Frontend: Run 'cd frontend && yarn dev' locally for hot reloading"
echo "  - MSSQL: localhost:1433"
echo "  - Redis: localhost:6379"
echo "  - Kafka: localhost:9092"
echo ""
echo "📊 View logs: docker-compose -f docker-compose.yml -f docker-compose.override.yml logs -f"
echo "🛑 To stop services: docker-compose -f docker-compose.yml -f docker-compose.override.yml down"

#!/bin/bash

# Development script - runs services in Docker, backend locally
echo "🚀 Starting Swift Transfer in Development Mode"
echo "📊 Services (DB, Redis, Kafka) will run in Docker"
echo "💻 Backend will run locally for hot reloading"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start Docker services (without backend)
echo "🐳 Starting Docker services..."
docker-compose up -d mssql redis zookeeper kafka

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are healthy
echo "🔍 Checking service health..."

# Check MSSQL
if docker-compose exec -T mssql /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P StrongPassword123! -Q "SELECT 1" > /dev/null 2>&1; then
    echo "✅ MSSQL is ready"
else
    echo "❌ MSSQL is not ready yet"
fi

# Check Redis
if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
    echo "✅ Redis is ready"
else
    echo "❌ Redis is not ready yet"
fi

# Check Kafka
if docker-compose exec -T kafka kafka-broker-api-versions --bootstrap-server localhost:9092 > /dev/null 2>&1; then
    echo "✅ Kafka is ready"
else
    echo "❌ Kafka is not ready yet"
fi

echo ""
echo "🎯 Services are running!"
echo "💻 Run 'cd backend && yarn dev' to start the backend locally"
echo "🌐 Frontend: Run 'cd frontend && yarn dev' to start the frontend locally"
echo ""
echo "🔗 Service URLs:"
echo "  - MSSQL: localhost:1433"
echo "  - Redis: localhost:6379"
echo "  - Kafka: localhost:9092"
echo "  - Backend: http://localhost:3000 (when running locally)"
echo "  - Frontend: http://localhost:8080 (when running locally)"
echo ""
echo "🛑 To stop services: docker-compose down"

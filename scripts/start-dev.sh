#!/bin/bash

# Trinety Development Environment Startup Script

set -e

echo "🚀 Iniciando ambiente de desenvolvimento Trinety..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker Desktop."
    exit 1
fi

# Start only PostgreSQL
echo "📦 Iniciando PostgreSQL..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Aguardando PostgreSQL ficar pronto..."
until docker-compose exec -T postgres pg_isready -U trinety > /dev/null 2>&1; do
    sleep 1
done
echo "✅ PostgreSQL pronto!"

# Install backend dependencies if needed
if [ ! -d "backend/node_modules" ]; then
    echo "📥 Instalando dependências do backend..."
    cd backend && npm install && cd ..
fi

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependências do frontend..."
    npm install
fi

# Start backend in background
echo "🔧 Iniciando backend NestJS..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
sleep 5

# Start frontend
echo "🎨 Iniciando frontend React..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Ambiente de desenvolvimento iniciado!"
echo ""
echo "📌 URLs disponíveis:"
echo "   Frontend: http://localhost:8080"
echo "   Backend:  http://localhost:3000/api"
echo "   Database: localhost:5432 (trinety/trinety)"
echo ""
echo "Para parar: Ctrl+C"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID

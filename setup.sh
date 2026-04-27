#!/bin/bash

echo "🚀 Dynamic App Generator - Setup Script"
echo "========================================"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed"
    echo "Please install PostgreSQL first:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql"
    exit 1
fi

echo "✓ PostgreSQL found"

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw dynamic_app; then
    echo "✓ Database 'dynamic_app' already exists"
else
    echo "Creating database 'dynamic_app'..."
    createdb dynamic_app
    if [ $? -eq 0 ]; then
        echo "✓ Database created"
    else
        echo "❌ Failed to create database"
        echo "Try manually: createdb dynamic_app"
        exit 1
    fi
fi

# Setup backend
echo ""
echo "Setting up backend..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi
echo "✓ Backend dependencies installed"

# Setup frontend
echo ""
echo "Setting up frontend..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
fi
echo "✓ Frontend dependencies installed"

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend && npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend && npm run dev"
echo ""
echo "Then visit: http://localhost:3000"
echo ""

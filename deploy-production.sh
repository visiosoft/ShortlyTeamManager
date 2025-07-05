#!/bin/bash

echo "🚀 Deploying CORS Fix to Production"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "backend/src/main.ts" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Build the backend
echo "📦 Building backend..."
cd backend
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build completed successfully"

# Check if production environment file exists
if [ ! -f ".env.production" ]; then
    echo "⚠️  Warning: .env.production file not found"
    echo "Please create .env.production with your production settings"
    echo "You can copy from .env.production.example"
    echo ""
    echo "Required environment variables:"
    echo "- MONGODB_URI"
    echo "- JWT_SECRET"
    echo "- GOOGLE_CLIENT_ID"
    echo "- GOOGLE_CLIENT_SECRET"
    echo "- BASE_URL=https://shortlyapi.mypaperlessoffice.org"
    echo "- FRONTEND_URL=https://shorly.uk"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Stop existing process if running
echo "🛑 Stopping existing processes..."
pm2 stop shortly-api 2>/dev/null || true
pm2 delete shortly-api 2>/dev/null || true

# Start the production server
echo "🚀 Starting production server..."
pm2 start dist/main.js --name "shortly-api" --env production

if [ $? -eq 0 ]; then
    echo "✅ Server started successfully"
    
    # Save PM2 configuration
    pm2 save
    
    echo ""
    echo "🎉 Deployment completed!"
    echo ""
    echo "Next steps:"
    echo "1. Test the API: curl https://shortlyapi.mypaperlessoffice.org/api"
    echo "2. Test CORS: curl -H 'Origin: https://shorly.uk' -X OPTIONS https://shortlyapi.mypaperlessoffice.org/api/auth/login"
    echo "3. Check logs: pm2 logs shortly-api"
    echo "4. Update frontend environment: NEXT_PUBLIC_API_URL=https://shortlyapi.mypaperlessoffice.org"
    echo ""
    echo "Server status:"
    pm2 status
else
    echo "❌ Failed to start server"
    echo "Check the logs: pm2 logs shortly-api"
    exit 1
fi 
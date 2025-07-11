#!/bin/bash

echo "🚀 Deploying Referral System to Production Server"

# Step 1: Build the backend
echo "📦 Building backend..."
cd backend
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Backend build failed!"
    exit 1
fi

echo "✅ Backend built successfully"

# Step 2: Build the frontend
echo "📦 Building frontend..."
cd ../frontend
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Frontend built successfully"

# Step 3: Deploy to production server
echo "🌐 Deploying to production server..."

# SSH into the server and deploy
ssh root@shortlyapi.mypaperlessoffice.org << 'EOF'
    echo "📁 Navigating to application directory..."
    cd /root/shortlink
    
    echo "📥 Pulling latest changes..."
    git pull origin main
    
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    
    echo "🔨 Building backend application..."
    npm run build
    
    echo "🔄 Restarting backend application..."
    pm2 restart shortly-api
    
    echo "📦 Installing frontend dependencies..."
    cd ../frontend
    npm install
    
    echo "🔨 Building frontend application..."
    npm run build
    
    echo "✅ Deployment completed!"
    
    echo "🧪 Testing referral endpoints..."
    curl -H "Authorization: Bearer $(cat /tmp/test_token 2>/dev/null || echo 'test')" \
         https://shortlyapi.mypaperlessoffice.org/api/referrals/team-stats
EOF

echo "✅ Referral system deployed successfully!"
echo "🔍 Please test the referral functionality at https://shorly.uk/referrals"
echo "📋 New features added:"
echo "   - Unique referral codes for each team"
echo "   - 1000 PKR signup bonus for new users"
echo "   - 500 PKR referral bonus for team members"
echo "   - Referral tracking and statistics"
echo "   - Referral link sharing functionality" 
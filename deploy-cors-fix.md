# CORS Fix Deployment Guide

## Issue
The production API at `https://shortlyapi.mypaperlessoffice.org` is blocking requests from `https://shorly.uk` due to missing CORS headers.

## Solution
Deploy the updated CORS configuration to your production server.

## Steps to Deploy

### 1. Build the Production Version
```bash
cd backend
npm run build
```

### 2. Update Production Environment
Create or update your production environment file:
```bash
# Copy the example file
cp .env.production.example .env.production

# Edit the production environment
nano .env.production
```

Update these values in `.env.production`:
```env
# Database
MONGODB_URI=your-actual-production-mongodb-uri
DB_NAME=shotly

# Server Configuration
PORT=3009
NODE_ENV=production

# Production Base URLs
BASE_URL=https://shortlyapi.mypaperlessoffice.org
FRONTEND_URL=https://shorly.uk

# JWT Configuration
JWT_SECRET=your-actual-production-jwt-secret

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
GOOGLE_CALLBACK_URL=https://shortlyapi.mypaperlessoffice.org/api/auth/google/callback
```

### 3. Deploy to Production Server

#### Option A: Using PM2 (Recommended)
```bash
# Install PM2 if not already installed
npm install -g pm2

# Start the production server
pm2 start dist/main.js --name "shortly-api" --env production

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

#### Option B: Using Docker
```bash
# Build Docker image
docker build -t shortly-api .

# Run container
docker run -d \
  --name shortly-api \
  -p 3009:3009 \
  --env-file .env.production \
  shortly-api
```

#### Option C: Direct Node.js
```bash
# Set environment
export NODE_ENV=production

# Start server
node dist/main.js
```

### 4. Verify Deployment
Test the CORS configuration:
```bash
curl -H "Origin: https://shorly.uk" \
     -H "Content-Type: application/json" \
     -X OPTIONS \
     https://shortlyapi.mypaperlessoffice.org/api/auth/login
```

Expected response should include:
```
Access-Control-Allow-Origin: https://shorly.uk
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
```

### 5. Update Frontend Environment
On your frontend server (`shorly.uk`), set the environment variable:
```bash
NEXT_PUBLIC_API_URL=https://shortlyapi.mypaperlessoffice.org
```

### 6. Test the Complete Flow
1. Visit `https://shorly.uk`
2. Try to login
3. Check browser console for CORS errors
4. Verify API calls work without CORS issues

## Troubleshooting

### If CORS still fails:
1. Check if the server is running: `curl https://shortlyapi.mypaperlessoffice.org/api`
2. Check server logs: `pm2 logs shortly-api`
3. Verify environment variables are loaded correctly
4. Restart the server after environment changes

### If server won't start:
1. Check MongoDB connection
2. Verify all environment variables are set
3. Check port availability
4. Review server logs for specific errors

## CORS Configuration Details

The updated CORS configuration allows:
- `https://shorly.uk`
- `https://www.shorly.uk`
- `https://shortlyapi.mypaperlessoffice.org`
- All localhost origins for development
- All origins with logging for debugging

This should resolve the CORS issue between your frontend and API. 
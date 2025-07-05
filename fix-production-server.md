# 🚨 Production Server Fix Guide

## Current Issue
- **502 Bad Gateway** - Backend application not running
- **CORS Error** - No CORS headers because app is down
- **Server**: `https://shortlyapi.mypaperlessoffice.org`

## 🔧 Step-by-Step Fix

### 1. SSH into Your Production Server
```bash
ssh root@shortlyapi.mypaperlessoffice.org
# or
ssh your-username@shortlyapi.mypaperlessoffice.org
```

### 2. Check Current Status
```bash
# Check if any Node.js processes are running
ps aux | grep node

# Check if PM2 is installed and running
pm2 status

# Check nginx status
systemctl status nginx

# Check if port 3009 is in use
netstat -tlnp | grep :3009
```

### 3. Navigate to Your Application Directory
```bash
cd /path/to/your/backend
# or wherever your application is deployed
```

### 4. Update the Code with CORS Fix
```bash
# Pull latest changes (if using git)
git pull origin main

# Or manually update the CORS configuration in src/main.ts
```

### 5. Install Dependencies
```bash
npm install
```

### 6. Build the Application
```bash
npm run build
```

### 7. Set Up Environment Variables
```bash
# Create production environment file
cp .env.production.example .env.production

# Edit the environment file
nano .env.production
```

**Required environment variables:**
```env
# Database
MONGODB_URI=your-production-mongodb-uri
DB_NAME=shotly

# Server Configuration
PORT=3009
NODE_ENV=production

# Production Base URLs
BASE_URL=https://shortlyapi.mypaperlessoffice.org
FRONTEND_URL=https://shorly.uk

# JWT Configuration
JWT_SECRET=your-production-jwt-secret

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
GOOGLE_CALLBACK_URL=https://shortlyapi.mypaperlessoffice.org/api/auth/google/callback
```

### 8. Start the Application with PM2
```bash
# Install PM2 if not already installed
npm install -g pm2

# Stop any existing processes
pm2 stop shortly-api 2>/dev/null || true
pm2 delete shortly-api 2>/dev/null || true

# Start the application
pm2 start dist/main.js --name "shortly-api" --env production

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

### 9. Verify the Application is Running
```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs shortly-api

# Test the API endpoint
curl http://localhost:3009/api

# Test CORS headers
curl -H "Origin: https://shorly.uk" -X OPTIONS http://localhost:3009/api/auth/login
```

### 10. Update Nginx Configuration (if needed)
```bash
# Check nginx configuration
sudo nano /etc/nginx/sites-available/shortlyapi.mypaperlessoffice.org

# Make sure it's configured to proxy to port 3009
# Example configuration:
```

```nginx
server {
    listen 80;
    server_name shortlyapi.mypaperlessoffice.org;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name shortlyapi.mypaperlessoffice.org;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    location / {
        proxy_pass http://localhost:3009;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 11. Test the Complete Setup
```bash
# Test from your local machine
curl -H "Origin: https://shorly.uk" -X OPTIONS https://shortlyapi.mypaperlessoffice.org/api/auth/login
```

Expected response should include:
```
Access-Control-Allow-Origin: https://shorly.uk
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
```

### 12. Update Frontend Environment
On your frontend server (`shorly.uk`), set:
```bash
NEXT_PUBLIC_API_URL=https://shortlyapi.mypaperlessoffice.org
```

## 🚨 Troubleshooting

### If PM2 fails to start:
```bash
# Check the logs
pm2 logs shortly-api

# Common issues:
# 1. Missing environment variables
# 2. MongoDB connection failed
# 3. Port already in use
# 4. Missing dependencies
```

### If nginx still shows 502:
```bash
# Check if the app is running on port 3009
netstat -tlnp | grep :3009

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check application logs
pm2 logs shortly-api
```

### If CORS still fails:
```bash
# Verify the CORS configuration is loaded
pm2 restart shortly-api

# Check the application logs for CORS messages
pm2 logs shortly-api | grep CORS
```

## ✅ Success Indicators
- ✅ `curl https://shortlyapi.mypaperlessoffice.org/api` returns 200
- ✅ CORS headers are present in responses
- ✅ Frontend can login without CORS errors
- ✅ PM2 shows the application as "online"

## 📞 Need Help?
If you're still having issues, please provide:
1. Output of `pm2 status`
2. Output of `pm2 logs shortly-api`
3. Output of `sudo nginx -t`
4. Your nginx configuration file 
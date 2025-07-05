# 🔧 Fix CORS Duplicate Headers Issue

## 🚨 Problem
The error shows: `The 'Access-Control-Allow-Origin' header contains multiple values 'https://shorly.uk, https://shorly.uk'`

This happens when the CORS header is set multiple times or incorrectly.

## ✅ Solution Applied

### 1. **Fixed Backend CORS Configuration**
Updated `backend/src/main.ts` to use a simple array-based origin configuration:

```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:4000',
    'https://shorly.uk',
    'https://www.shorly.uk',
    'https://shortlyapi.mypaperlessoffice.org',
    'https://www.shortlyapi.mypaperlessoffice.org'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Origin', 
    'Accept',
    'Cache-Control',
    'X-File-Name'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
});
```

### 2. **Removed Complex Origin Function**
The previous configuration used a function that could cause issues. Now using a simple array.

## 🚀 Deploy the Fix

### Step 1: Build the Updated Code
```bash
cd backend
npm run build
```

### Step 2: Deploy to Production Server
SSH into your production server and deploy the updated code:

```bash
# SSH into your server
ssh root@shortlyapi.mypaperlessoffice.org

# Navigate to your application directory
cd /path/to/your/backend

# Pull latest changes (if using git)
git pull origin main

# Install dependencies
npm install

# Build the application
npm run build

# Restart the application
pm2 restart shortly-api
```

### Step 3: Verify the Fix
Test the CORS headers:

```bash
# Test from your local machine
curl -H "Origin: https://shorly.uk" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type, Authorization" \
     -X OPTIONS \
     https://shortlyapi.mypaperlessoffice.org/api/auth/login
```

Expected response should have:
```
Access-Control-Allow-Origin: https://shorly.uk
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization,X-Requested-With,Origin,Accept,Cache-Control,X-File-Name
```

## 🔍 Check for Other Sources of Duplicate Headers

### 1. **Nginx Configuration**
Check if nginx is adding CORS headers:

```bash
# SSH into your server
sudo nano /etc/nginx/sites-available/shortlyapi.mypaperlessoffice.org
```

Make sure nginx is NOT adding CORS headers. The configuration should look like:

```nginx
server {
    listen 443 ssl http2;
    server_name shortlyapi.mypaperlessoffice.org;

    # SSL configuration...

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
        
        # DO NOT add CORS headers here - let the application handle them
    }
}
```

### 2. **Remove Any Nginx CORS Headers**
If you find CORS headers in nginx configuration, remove them:

```nginx
# REMOVE these lines if they exist:
# add_header Access-Control-Allow-Origin *;
# add_header Access-Control-Allow-Methods *;
# add_header Access-Control-Allow-Headers *;
```

### 3. **Check for Multiple Middleware**
Make sure you don't have multiple CORS middleware in your NestJS application.

## 🧪 Test the Fix

Run the test script to verify:

```bash
node test-cors-duplicate-fix.js
```

## ✅ Success Indicators

After deployment, you should see:
- ✅ Single `Access-Control-Allow-Origin` header
- ✅ No duplicate values in CORS headers
- ✅ Frontend can make requests without CORS errors
- ✅ Login works from `https://shorly.uk`

## 🚨 If Issue Persists

If you still see duplicate headers after deployment:

1. **Check nginx logs**:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

2. **Check application logs**:
   ```bash
   pm2 logs shortly-api
   ```

3. **Test with curl** to see exact headers:
   ```bash
   curl -v -H "Origin: https://shorly.uk" \
        -X OPTIONS \
        https://shortlyapi.mypaperlessoffice.org/api/auth/login
   ```

4. **Restart both nginx and the application**:
   ```bash
   sudo systemctl reload nginx
   pm2 restart shortly-api
   ```

## 📞 Need Help?

If the issue persists, please provide:
1. Output of `curl -v` test
2. Your nginx configuration
3. Application logs from PM2
4. The exact error message from the browser console 
# 🚀 Production Deployment Fix Guide

## 🎯 **Issue**
Production site is showing `http://localhost:3000/pdA9l1` instead of `https://shorly.uk/pdA9l1` for shortened URLs.

## 🔧 **Root Cause**
Production environment variables are not set correctly, causing the backend to use development URLs.

## 🚀 **Solution Steps**

### 1. **Backend Environment Variables (Production)**

SSH into your production server and set these environment variables:

```bash
# Set backend environment variables
export NODE_ENV=production
export BASE_URL=https://shorly.uk
export FRONTEND_URL=https://shorly.uk
export MONGODB_URI=mongodb+srv://cutly:hl3yLRKU0Ia4GfPj@cluster0.ddcez.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
export DB_NAME=shotly
export JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
export PORT=3009
```

### 2. **Frontend Environment Variables (Production)**

Set these environment variables for the frontend:

```bash
# Set frontend environment variables
export NEXT_PUBLIC_API_URL=https://shortlyapi.mypaperlessoffice.org
export NEXT_PUBLIC_BASE_URL=https://shorly.uk
```

### 3. **Deploy Updated Code**

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build the application
npm run build

# Restart the services
pm2 restart all
```

### 4. **Verify Environment Variables**

Check if environment variables are set correctly:

```bash
# Check backend environment
echo $NODE_ENV
echo $BASE_URL
echo $FRONTEND_URL

# Check frontend environment
echo $NEXT_PUBLIC_API_URL
echo $NEXT_PUBLIC_BASE_URL
```

### 5. **Test the Fix**

1. Create a new shortened URL
2. Verify it shows `https://shorly.uk/abc123` instead of `http://localhost:3000/abc123`
3. Test the redirect functionality

### 6. **Alternative: PM2 Ecosystem File**

Create a `ecosystem.config.js` file for PM2 with environment variables:

```javascript
module.exports = {
  apps: [
    {
      name: 'shortlink-backend',
      script: 'dist/main.js',
      cwd: './backend',
      env: {
        NODE_ENV: 'production',
        BASE_URL: 'https://shorly.uk',
        FRONTEND_URL: 'https://shorly.uk',
        MONGODB_URI: 'mongodb+srv://cutly:hl3yLRKU0Ia4GfPj@cluster0.ddcez.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
        DB_NAME: 'shotly',
        JWT_SECRET: 'your-super-secret-jwt-key-change-this-in-production',
        PORT: 3009
      }
    },
    {
      name: 'shortlink-frontend',
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_API_URL: 'https://shortlyapi.mypaperlessoffice.org',
        NEXT_PUBLIC_BASE_URL: 'https://shorly.uk'
      }
    }
  ]
};
```

Then restart with:
```bash
pm2 start ecosystem.config.js
```

## ✅ **Expected Result**

After applying these fixes:
- Shortened URLs will show: `https://shorly.uk/abc123`
- All redirects will work correctly
- CORS issues will be resolved
- Production environment will be properly configured

## 🔍 **Troubleshooting**

If the issue persists:

1. **Check PM2 logs:**
   ```bash
   pm2 logs
   ```

2. **Verify environment variables:**
   ```bash
   pm2 env <app-name>
   ```

3. **Restart services:**
   ```bash
   pm2 restart all
   ```

4. **Check nginx configuration** (if using nginx as reverse proxy)

## 📝 **Notes**

- The backend code has been updated to better handle production URLs
- Environment variables take precedence over hardcoded values
- Make sure to restart both backend and frontend services after changes 
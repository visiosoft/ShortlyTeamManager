# 🚀 Manual Test Data Setup for toheed@yahoo.com

## Option 1: Manual URL Creation (Recommended)

### Step 1: Create URLs Manually
1. Go to http://localhost:3000/dashboard
2. Login with toheed@yahoo.com
3. Create some URLs manually:
   - Original URL: https://google.com, Short Code: toheed1
   - Original URL: https://github.com, Short Code: toheed2
   - Original URL: https://stackoverflow.com, Short Code: toheed3
   - Original URL: https://reddit.com, Short Code: toheed4
   - Original URL: https://youtube.com, Short Code: toheed5

### Step 2: Get Real Clicks
1. Share your URLs with friends or on social media
2. Or use ngrok to make your local server accessible:
   ```bash
   npx ngrok http 3000
   ```
3. Share the ngrok URL (e.g., https://abc123.ngrok.io/toheed1)

### Step 3: Check Analytics
1. Go to http://localhost:3000/analytics
2. Login with toheed@yahoo.com
3. View your analytics data

## Option 2: Automated Test Data (Requires JWT Token)

### Step 1: Get Your JWT Token
1. Go to http://localhost:3000/login
2. Login with toheed@yahoo.com
3. Open browser Developer Tools (F12)
4. Go to Application/Storage tab
5. Look for "token" in localStorage
6. Copy the token value

### Step 2: Update Script
1. Open `create-test-data-via-api.js`
2. Replace `YOUR_JWT_TOKEN_HERE` with your actual token
3. Uncomment the last line: `createTestDataViaAPI();`

### Step 3: Run Script
```bash
node create-test-data-via-api.js
```

## Option 3: Quick Test with Browser

### Step 1: Create URLs
1. Go to http://localhost:3000/dashboard
2. Create a few URLs

### Step 2: Simulate Clicks
1. Open multiple browser tabs
2. Visit your short URLs multiple times
3. Use different browsers (Chrome, Firefox, Safari)
4. Use incognito/private mode for different sessions

### Step 3: Check Analytics
1. Go to http://localhost:3000/analytics
2. You should see basic analytics data

## Expected Results

Once you have test data, you should see:

### For Regular Users:
- Total clicks
- Click history
- Country breakdown
- Browser/OS statistics

### For Admin Users:
- Team total clicks for the month
- Team countries breakdown
- Top team countries
- All regular user analytics

## Troubleshooting

### If analytics page is empty:
1. Make sure you have created URLs
2. Make sure you have clicks on those URLs
3. Check that you're logged in with the correct account
4. Verify the backend is running on port 3009

### If you're not seeing admin analytics:
1. Make sure your account has admin role
2. Check that you have team members
3. Verify team data exists

## Quick Commands

```bash
# Check if backend is running
curl http://localhost:3009/api/urls/my-urls

# Check if frontend is running
curl http://localhost:3000

# Create a test URL via API (requires token)
curl -X POST http://localhost:3009/api/urls \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"originalUrl":"https://google.com","shortCode":"test1"}'
``` 
# Manual Test Instructions for Referral Click Earnings

## Prerequisites
- Backend is running on port 3009 ✅
- Referral code validation is working ✅
- Referral earnings processing logic is implemented ✅

## Step-by-Step Test Process

### 1. Get a JWT Token
```bash
# Login via your frontend or use curl:
curl -X POST http://localhost:3009/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "password": "your-password"}'
```

### 2. Create a Short URL
```bash
# Replace YOUR_JWT_TOKEN with the token from step 1
curl -X POST http://localhost:3009/api/urls \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "originalUrl": "https://example.com/test",
    "title": "Test URL",
    "description": "Testing referral earnings"
  }'
```

### 3. Simulate a Click
```bash
# Replace SHORT_CODE with the shortCode from step 2
curl -L http://localhost:3009/SHORT_CODE
```

### 4. Check Referral Stats
```bash
# Check current user's referral stats
curl -X GET http://localhost:3009/api/referrals/user-stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Check Backend Logs
Look for these messages in your backend terminal:
```
Processing referral earnings from click for user: <userId>, amount: 1
Found referring user: <email>
Adding <amount> to referrer: <referrerId>
Adding <amount> to referred user: <userId>
```

## Expected Results

### If the user was referred by someone:
- `totalReferralEarnings` should increase for both the referrer and referred user
- `referralBonuses` array should contain new entries with `type: 'click_earnings'`
- Backend logs should show the earnings processing

### If the user was not referred by anyone:
- No earnings should be added
- Backend logs should show "User was not referred by anyone"

## Troubleshooting

### If earnings don't update:
1. Check that the user has a `referredBy` field in the database
2. Verify the referrer user exists and has `role: 'admin'`
3. Check backend logs for any errors in the referral processing
4. Ensure the click is being tracked properly

### If you get authentication errors:
1. Make sure your JWT token is valid and not expired
2. Check that the token has the correct permissions
3. Try logging in again to get a fresh token

## Quick Test Script
You can also use the provided test scripts:
- `test-complete-referral-flow.js` - Full automated test (requires JWT token)
- `test-referral-earnings-simple.js` - Simple validation test (no auth required) 
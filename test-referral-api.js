const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

// Test data - you'll need to replace these with actual JWT tokens
const TEST_TOKENS = [
  'YOUR_JWT_TOKEN_1_HERE', // Replace with actual token
  'YOUR_JWT_TOKEN_2_HERE', // Replace with actual token
];

async function testReferralAPI() {
  console.log('🧪 Testing Referral API Endpoints');
  console.log('==================================\n');

  // Test 1: Test referral link endpoint without auth
  console.log('1️⃣ Testing referral link endpoint (no auth)...');
  try {
    const response = await axios.get(`${BASE_URL}/referrals/link`);
    console.log('❌ Should have failed with 401, but got:', response.status);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly returned 401 Unauthorized');
    } else {
      console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
    }
  }

  // Test 2: Test referral validation
  console.log('\n2️⃣ Testing referral code validation...');
  try {
    const response = await axios.post(`${BASE_URL}/referrals/validate`, {
      referralCode: 'TEST123'
    });
    console.log('✅ Referral validation response:', response.data);
  } catch (error) {
    console.log('❌ Referral validation error:', error.response?.data || error.message);
  }

  // Test 3: Test with actual tokens (if provided)
  if (TEST_TOKENS[0] !== 'YOUR_JWT_TOKEN_1_HERE') {
    console.log('\n3️⃣ Testing with authenticated user...');
    try {
      const response = await axios.get(`${BASE_URL}/referrals/link`, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKENS[0]}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Authenticated referral link response:', response.data);
    } catch (error) {
      console.log('❌ Authenticated request error:', error.response?.data || error.message);
    }
  }

  console.log('\n📝 Instructions for manual testing:');
  console.log('1. Login to the frontend at http://localhost:3000/login');
  console.log('2. Get your JWT token from browser localStorage');
  console.log('3. Replace the tokens in this script and run again');
  console.log('4. Or test directly in the frontend referrals page');
}

testReferralAPI(); 
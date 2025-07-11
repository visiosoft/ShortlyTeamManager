const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testUserReferralCodes() {
  try {
    console.log('🧪 Testing User Referral Codes System');
    console.log('=====================================\n');

    // Test 1: Get user referral link
    console.log('1️⃣ Testing user referral link generation...');
    try {
      const response = await axios.get(`${BASE_URL}/referrals/link`, {
        headers: {
          'Content-Type': 'application/json',
          // You'll need to add a valid JWT token here
          // 'Authorization': 'Bearer YOUR_JWT_TOKEN'
        }
      });
      console.log('✅ User referral link response:', response.data);
    } catch (error) {
      console.log('❌ Error getting user referral link:', error.response?.data || error.message);
    }

    // Test 2: Get user referral stats
    console.log('\n2️⃣ Testing user referral stats...');
    try {
      const response = await axios.get(`${BASE_URL}/referrals/user-stats`, {
        headers: {
          'Content-Type': 'application/json',
          // You'll need to add a valid JWT token here
          // 'Authorization': 'Bearer YOUR_JWT_TOKEN'
        }
      });
      console.log('✅ User referral stats response:', response.data);
    } catch (error) {
      console.log('❌ Error getting user referral stats:', error.response?.data || error.message);
    }

    // Test 3: Test referral code validation
    console.log('\n3️⃣ Testing referral code validation...');
    try {
      const response = await axios.post(`${BASE_URL}/referrals/validate`, {
        referralCode: 'TEST123'
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Referral code validation response:', response.data);
    } catch (error) {
      console.log('❌ Error validating referral code:', error.response?.data || error.message);
    }

    console.log('\n📝 To test with authentication:');
    console.log('1. Get a JWT token by logging in to the frontend');
    console.log('2. Add the token to the Authorization header in this script');
    console.log('3. Run the script again');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUserReferralCodes(); 
const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function debugReferralCode() {
  console.log('🔍 Debugging Referral Code Issue');
  console.log('==================================\n');

  try {
    // Step 1: Register a test user
    console.log('1️⃣ Registering test user...');
    const timestamp = Date.now();
    const testUser = {
      email: `debuguser_${timestamp}@example.com`,
      password: 'password123',
      firstName: 'Debug',
      lastName: 'User',
      teamName: 'Debug Team'
    };

    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
    console.log('✅ User registered successfully');
    console.log(`   Email: ${registerResponse.data.user.email}`);
    console.log(`   Referral Code: ${registerResponse.data.user.referralCode}`);
    
    const referralCode = registerResponse.data.user.referralCode;
    const token = registerResponse.data.access_token;

    // Step 2: Test validation endpoint
    console.log('\n2️⃣ Testing validation endpoint...');
    const validationResponse = await axios.post(`${BASE_URL}/referrals/validate`, {
      referralCode: referralCode
    });
    console.log('✅ Validation response:');
    console.log(`   Valid: ${validationResponse.data.valid}`);
    console.log(`   Message: ${validationResponse.data.message}`);
    if (validationResponse.data.user) {
      console.log(`   User: ${validationResponse.data.user.firstName} ${validationResponse.data.user.lastName}`);
    }

    // Step 3: Test getting referral link
    console.log('\n3️⃣ Testing referral link endpoint...');
    const linkResponse = await axios.get(`${BASE_URL}/referrals/link`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Link response:');
    console.log(`   Referral Link: ${linkResponse.data.referralLink}`);
    console.log(`   Referral Code: ${linkResponse.data.referralCode}`);

    // Step 4: Test registration with referral code
    console.log('\n4️⃣ Testing registration with referral code...');
    const newUser = {
      email: `newuser_${timestamp}@example.com`,
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      referralCode: referralCode
    };

    try {
      const registerWithReferralResponse = await axios.post(`${BASE_URL}/auth/register-with-referral`, newUser);
      console.log('✅ Registration with referral successful');
      console.log(`   Email: ${registerWithReferralResponse.data.user.email}`);
      console.log(`   Referral Code: ${registerWithReferralResponse.data.user.referralCode}`);
    } catch (error) {
      console.log('❌ Registration with referral failed:');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
      console.log(`   Status: ${error.response?.status}`);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

debugReferralCode(); 
const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testReferralSystem() {
  try {
    console.log('Testing referral system...');
    
    // Step 1: Register a user (this will generate a referral code)
    console.log('\n1. Registering a user...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      password: 'password123',
      teamName: 'Test Team'
    });
    
    console.log('Registration response:', registerResponse.data);
    
    if (registerResponse.data.user && registerResponse.data.user.referralCode) {
      const referralCode = registerResponse.data.user.referralCode;
      console.log(`Generated referral code: ${referralCode}`);
      
      // Step 2: Test referral code validation
      console.log('\n2. Testing referral code validation...');
      const validateResponse = await axios.post(`${BASE_URL}/referrals/validate`, {
        referralCode: referralCode
      });
      
      console.log('Validation response:', validateResponse.data);
      
      // Step 3: Register another user with the referral code
      console.log('\n3. Registering another user with referral code...');
      const registerWithReferralResponse = await axios.post(`${BASE_URL}/auth/register-with-referral`, {
        firstName: 'Referred',
        lastName: 'User',
        email: 'referred@example.com',
        password: 'password123',
        referralCode: referralCode
      });
      
      console.log('Register with referral response:', registerWithReferralResponse.data);
      
      // Step 4: Login and get referral stats
      console.log('\n4. Logging in and getting referral stats...');
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'testuser@example.com',
        password: 'password123'
      });
      
      const token = loginResponse.data.access_token;
      const headers = { Authorization: `Bearer ${token}` };
      
      const statsResponse = await axios.get(`${BASE_URL}/referrals/user-stats`, { headers });
      console.log('Referral stats:', statsResponse.data);
      
    } else {
      console.log('No referral code generated in registration response');
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testReferralSystem(); 
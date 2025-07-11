const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testReferralCodeCheck() {
  try {
    console.log('Testing referral code check...\n');
    
    const timestamp = Date.now();
    const referrerEmail = `referrer${timestamp}@example.com`;
    const referredEmail = `referred${timestamp}@example.com`;
    
    // Step 1: Register a referrer user
    console.log('1. Registering referrer user...');
    const referrerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      firstName: 'Referrer',
      lastName: 'User',
      email: referrerEmail,
      password: 'password123',
      teamName: 'Referrer Team'
    });
    
    const referrerUser = referrerResponse.data.user;
    const referrerReferralCode = referrerUser.referralCode;
    console.log(`Referrer referral code: ${referrerReferralCode}\n`);
    
    // Step 2: Validate the referral code
    console.log('2. Validating referral code...');
    const validateResponse = await axios.post(`${BASE_URL}/referrals/validate`, {
      referralCode: referrerReferralCode
    });
    
    console.log('Validation response:', validateResponse.data);
    
    // Step 3: Try to register with this referral code
    console.log('3. Registering with referral code...');
    const newUserResponse = await axios.post(`${BASE_URL}/auth/register-with-referral`, {
      firstName: 'Referred',
      lastName: 'User',
      email: referredEmail,
      password: 'password123',
      referralCode: referrerReferralCode
    });
    
    console.log('Registration response:', newUserResponse.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testReferralCodeCheck(); 
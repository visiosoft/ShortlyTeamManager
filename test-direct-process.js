const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testDirectProcess() {
  try {
    console.log('Testing direct referral processing...\n');
    
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
    
    // Step 2: Register a new user with the referral code
    console.log('2. Registering new user with referral code...');
    const newUserResponse = await axios.post(`${BASE_URL}/auth/register-with-referral`, {
      firstName: 'Referred',
      lastName: 'User',
      email: referredEmail,
      password: 'password123',
      referralCode: referrerReferralCode
    });
    
    console.log('Registration response:', newUserResponse.data);
    const newUser = newUserResponse.data.user;
    console.log(`New user ID: ${newUser.id}\n`);
    
    // Step 3: Check if the referral code exists in the database
    console.log('3. Checking if referral code exists...');
    const validateResponse = await axios.post(`${BASE_URL}/referrals/validate`, {
      referralCode: referrerReferralCode
    });
    
    console.log('Validation response:', validateResponse.data);
    
    // Step 4: Check the database directly for the referring user
    console.log('4. Checking database for referring user...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: referrerEmail,
      password: 'password123'
    });
    
    const token = loginResponse.data.access_token;
    const userStatsResponse = await axios.get(`${BASE_URL}/referrals/user-stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('User stats response:', userStatsResponse.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testDirectProcess(); 
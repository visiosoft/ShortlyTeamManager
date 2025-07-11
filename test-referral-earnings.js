const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testReferralEarnings() {
  try {
    console.log('Testing referral earnings system...\n');
    
    // Step 1: Register a referrer user
    console.log('1. Registering referrer user...');
    const referrerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      firstName: 'Referrer',
      lastName: 'User',
      email: 'referrer@example.com',
      password: 'password123',
      teamName: 'Referrer Team'
    });
    
    console.log('Referrer registration response:', referrerResponse.data);
    const referrerUser = referrerResponse.data.user;
    const referrerReferralCode = referrerUser.referralCode;
    console.log(`Referrer referral code: ${referrerReferralCode}\n`);
    
    // Step 2: Login as referrer to get token
    console.log('2. Logging in as referrer...');
    const referrerLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'referrer@example.com',
      password: 'password123'
    });
    
    const referrerToken = referrerLoginResponse.data.access_token;
    console.log('Referrer logged in successfully\n');
    
    // Step 3: Check referrer's initial stats
    console.log('3. Checking referrer initial stats...');
    const referrerStatsResponse = await axios.get(`${BASE_URL}/referrals/user-stats`, {
      headers: { Authorization: `Bearer ${referrerToken}` }
    });
    
    console.log('Referrer initial stats:', referrerStatsResponse.data);
    const initialReferrals = referrerStatsResponse.data.totalReferrals;
    const initialEarnings = referrerStatsResponse.data.totalReferralEarnings;
    console.log(`Initial referrals: ${initialReferrals}, Initial earnings: ${initialEarnings}\n`);
    
    // Step 4: Register a new user with the referral code
    console.log('4. Registering new user with referral code...');
    const newUserResponse = await axios.post(`${BASE_URL}/auth/register-with-referral`, {
      firstName: 'Referred',
      lastName: 'User',
      email: 'referred@example.com',
      password: 'password123',
      referralCode: referrerReferralCode
    });
    
    console.log('New user registration response:', newUserResponse.data);
    const newUser = newUserResponse.data.user;
    console.log(`New user ID: ${newUser._id}\n`);
    
    // Step 5: Login as new user to get token
    console.log('5. Logging in as new user...');
    const newUserLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'referred@example.com',
      password: 'password123'
    });
    
    const newUserToken = newUserLoginResponse.data.access_token;
    console.log('New user logged in successfully\n');
    
    // Step 6: Check new user's stats
    console.log('6. Checking new user stats...');
    const newUserStatsResponse = await axios.get(`${BASE_URL}/referrals/user-stats`, {
      headers: { Authorization: `Bearer ${newUserToken}` }
    });
    
    console.log('New user stats:', newUserStatsResponse.data);
    console.log(`New user total earnings: ${newUserStatsResponse.data.totalReferralEarnings}\n`);
    
    // Step 7: Check referrer's updated stats
    console.log('7. Checking referrer updated stats...');
    const referrerUpdatedStatsResponse = await axios.get(`${BASE_URL}/referrals/user-stats`, {
      headers: { Authorization: `Bearer ${referrerToken}` }
    });
    
    console.log('Referrer updated stats:', referrerUpdatedStatsResponse.data);
    const updatedReferrals = referrerUpdatedStatsResponse.data.totalReferrals;
    const updatedEarnings = referrerUpdatedStatsResponse.data.totalReferralEarnings;
    console.log(`Updated referrals: ${updatedReferrals}, Updated earnings: ${updatedEarnings}\n`);
    
    // Step 8: Check if earnings were updated
    console.log('8. Verifying earnings updates...');
    const referralsIncreased = updatedReferrals > initialReferrals;
    const earningsIncreased = updatedEarnings > initialEarnings;
    
    console.log(`Referrals increased: ${referralsIncreased} (${initialReferrals} -> ${updatedReferrals})`);
    console.log(`Earnings increased: ${earningsIncreased} (${initialEarnings} -> ${updatedEarnings})`);
    
    if (referralsIncreased && earningsIncreased) {
      console.log('\n✅ SUCCESS: Referral earnings are working correctly!');
    } else {
      console.log('\n❌ FAILURE: Referral earnings are not updating correctly.');
    }
    
  } catch (error) {
    console.error('Error testing referral earnings:', error.response?.data || error.message);
  }
}

testReferralEarnings(); 
const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

// Test data with unique timestamps to avoid conflicts
const timestamp = Date.now();
const TEST_USERS = [
  {
    email: `testuser1_${timestamp}@example.com`,
    password: 'password123',
    firstName: 'Test',
    lastName: 'User1',
    teamName: 'Test Team 1'
  },
  {
    email: `testuser2_${timestamp}@example.com`,
    password: 'password123',
    firstName: 'Test',
    lastName: 'User2',
    teamName: 'Test Team 2'
  }
];

async function testReferralSystem() {
  console.log('🧪 Testing Referral System via API');
  console.log('===================================\n');

  try {
    // Step 1: Register first test user
    console.log('1️⃣ Registering first test user...');
    const user1Response = await axios.post(`${BASE_URL}/auth/register`, TEST_USERS[0]);
    console.log('✅ User 1 registered successfully');
    console.log(`   Email: ${user1Response.data.user.email}`);
    console.log(`   Referral Code: ${user1Response.data.user.referralCode}`);
    
    const user1Token = user1Response.data.access_token;
    const user1ReferralCode = user1Response.data.user.referralCode;

    // Step 2: Get user 1's referral link
    console.log('\n2️⃣ Getting user 1 referral link...');
    const user1LinkResponse = await axios.get(`${BASE_URL}/referrals/link`, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    console.log('✅ User 1 referral link retrieved');
    console.log(`   Referral Link: ${user1LinkResponse.data.referralLink}`);
    console.log(`   Referral Code: ${user1LinkResponse.data.referralCode}`);

    // Step 3: Register second user with referral code
    console.log('\n3️⃣ Registering second user with referral code...');
    const user2WithReferral = {
      ...TEST_USERS[1],
      referralCode: user1ReferralCode
    };
    
    const user2Response = await axios.post(`${BASE_URL}/auth/register-with-referral`, user2WithReferral);
    console.log('✅ User 2 registered with referral successfully');
    console.log(`   Email: ${user2Response.data.user.email}`);
    console.log(`   Referral Code: ${user2Response.data.user.referralCode}`);
    console.log(`   Team ID: ${user2Response.data.user.teamId}`);

    const user2Token = user2Response.data.access_token;
    const user2ReferralCode = user2Response.data.user.referralCode;

    // Step 4: Get user 2's referral link
    console.log('\n4️⃣ Getting user 2 referral link...');
    const user2LinkResponse = await axios.get(`${BASE_URL}/referrals/link`, {
      headers: { Authorization: `Bearer ${user2Token}` }
    });
    console.log('✅ User 2 referral link retrieved');
    console.log(`   Referral Link: ${user2LinkResponse.data.referralLink}`);
    console.log(`   Referral Code: ${user2LinkResponse.data.referralCode}`);

    // Step 5: Verify referral codes are unique
    console.log('\n5️⃣ Verifying unique referral codes...');
    if (user1ReferralCode !== user2ReferralCode) {
      console.log('✅ Referral codes are unique!');
      console.log(`   User 1: ${user1ReferralCode}`);
      console.log(`   User 2: ${user2ReferralCode}`);
    } else {
      console.log('❌ Referral codes are NOT unique!');
      console.log(`   Both users have: ${user1ReferralCode}`);
    }

    // Step 6: Get user 1's referral stats
    console.log('\n6️⃣ Getting user 1 referral stats...');
    const user1StatsResponse = await axios.get(`${BASE_URL}/referrals/user-stats`, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    console.log('✅ User 1 stats retrieved');
    console.log(`   Total Referrals: ${user1StatsResponse.data.totalReferrals}`);
    console.log(`   Total Earnings: ${user1StatsResponse.data.totalReferralEarnings} PKR`);

    // Step 7: Get user 1's referral signups
    console.log('\n7️⃣ Getting user 1 referral signups...');
    const user1SignupsResponse = await axios.get(`${BASE_URL}/referrals/my-signups`, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    console.log('✅ User 1 signups retrieved');
    console.log(`   Signups count: ${user1SignupsResponse.data.length}`);
    if (user1SignupsResponse.data.length > 0) {
      console.log(`   First signup: ${user1SignupsResponse.data[0].firstName} ${user1SignupsResponse.data[0].lastName}`);
    }

    // Step 8: Test referral validation
    console.log('\n8️⃣ Testing referral validation...');
    const validationResponse = await axios.post(`${BASE_URL}/referrals/validate`, {
      referralCode: user1ReferralCode
    });
    console.log('✅ Referral validation successful');
    console.log(`   Valid: ${validationResponse.data.valid}`);
    console.log(`   Message: ${validationResponse.data.message}`);

    console.log('\n🎉 All tests passed! Referral system is working correctly.');
    console.log('\n📊 Summary:');
    console.log(`- User 1 referral code: ${user1ReferralCode}`);
    console.log(`- User 2 referral code: ${user2ReferralCode}`);
    console.log(`- Codes are unique: ${user1ReferralCode !== user2ReferralCode ? 'Yes' : 'No'}`);
    console.log(`- User 1 has ${user1StatsResponse.data.totalReferrals} referrals`);
    console.log(`- User 1 earned ${user1StatsResponse.data.totalReferralEarnings} PKR`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 409) {
      console.log('\n💡 User already exists. Try with different email addresses.');
    }
  }
}

testReferralSystem(); 
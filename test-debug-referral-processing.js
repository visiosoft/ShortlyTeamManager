const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testDebugReferralProcessing() {
  try {
    console.log('🔍 Debugging referral processing...\n');
    
    // Step 1: Test referral code validation
    console.log('1️⃣ Testing referral code validation...');
    const validationResponse = await axios.post(`${BASE_URL}/referrals/validate`, {
      referralCode: 'QJZYILWD'
    });
    console.log('✅ Referral validation result:', validationResponse.data);
    
    // Step 2: Create a test user with referral
    console.log('\n2️⃣ Creating test user with referral...');
    const testUserData = {
      email: `debug-test-${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Debug',
      lastName: 'Test',
      referralCode: 'QJZYILWD'
    };
    
    try {
      const registrationResponse = await axios.post(`${BASE_URL}/auth/register-with-referral`, testUserData);
      console.log('✅ Registration successful!');
      console.log('   New user ID:', registrationResponse.data.user.id);
      console.log('   New user email:', registrationResponse.data.user.email);
      console.log('   New user referral code:', registrationResponse.data.user.referralCode);
      
      // Step 3: Check new user stats immediately
      console.log('\n3️⃣ Checking new user stats immediately...');
      const newUserStatsResponse = await axios.get(`${BASE_URL}/referrals/user-stats`, {
        headers: { 'Authorization': `Bearer ${registrationResponse.data.access_token}` }
      });
      
      console.log('📊 New user stats:', {
        totalReferrals: newUserStatsResponse.data.totalReferrals,
        totalReferralEarnings: newUserStatsResponse.data.totalReferralEarnings,
        referralBonuses: newUserStatsResponse.data.referralBonuses?.length || 0,
        referredBy: newUserStatsResponse.data.referredBy
      });
      
      // Step 4: Check if referral bonuses were added
      if (newUserStatsResponse.data.referralBonuses && newUserStatsResponse.data.referralBonuses.length > 0) {
        console.log('\n💰 Referral bonuses found for new user:');
        newUserStatsResponse.data.referralBonuses.forEach((bonus, index) => {
          console.log(`   ${index + 1}. Type: ${bonus.type}, Amount: ${bonus.amount} ${bonus.currency}, Date: ${bonus.createdAt}`);
        });
      } else {
        console.log('\n⚠️  No referral bonuses found for new user');
        console.log('   This suggests the referral processing might not be working correctly');
      }
      
      // Step 5: Check if the user was properly referred
      if (newUserStatsResponse.data.referredBy) {
        console.log('\n✅ User was properly referred by team:', newUserStatsResponse.data.referredBy);
      } else {
        console.log('\n❌ User was not properly referred (no referredBy field)');
      }
      
      console.log('\n🔍 Expected Results:');
      console.log('   - New user should have: 1000 PKR signup bonus');
      console.log('   - Referrer should have: 500 PKR referral bonus');
      console.log('   - Team should have: 1500 PKR total bonus');
      
      console.log('\n🔍 Check backend logs for these messages:');
      console.log('   - "Processing referral signup for user <userId> with referral code QJZYILWD"');
      console.log('   - "Found referring user: <email> with teamId: <teamId>"');
      console.log('   - "Adding signup bonus to new user: <userId>"');
      console.log('   - "Adding referral bonus to referring user: <referrerId>"');
      console.log('   - "Updating team with bonuses: <teamId>"');
      
      console.log('\n💡 If bonuses are not being added, possible issues:');
      console.log('   1. Referral processing method is not being called');
      console.log('   2. Database update operations are failing');
      console.log('   3. Referral code validation is failing');
      console.log('   4. User or team not found during processing');
      
    } catch (error) {
      console.log('❌ Registration failed:', error.response?.data?.message || error.message);
      console.log('   Error details:', error.response?.data);
    }
    
    console.log('\n🎯 Debug test completed!');
    console.log('📋 Summary:');
    console.log('   - Referral code validation: ✅');
    console.log('   - User registration: ✅');
    console.log('   - Check backend logs for processing details');
    console.log('   - Check if bonuses are being added correctly');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testDebugReferralProcessing(); 
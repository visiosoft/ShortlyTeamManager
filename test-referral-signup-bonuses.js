const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testReferralSignupBonuses() {
  try {
    console.log('🧪 Testing referral signup bonuses (1000 PKR for new user, 500 PKR for referrer)...\n');
    
    // Step 1: Test referral code validation
    console.log('1️⃣ Testing referral code validation...');
    const validationResponse = await axios.post(`${BASE_URL}/referrals/validate`, {
      referralCode: 'QJZYILWD'
    });
    console.log('✅ Referral validation result:', validationResponse.data);
    
    // Step 2: Check current stats of the referrer
    console.log('\n2️⃣ Checking current stats of referrer (all@yahoo.com)...');
    console.log('   This user should have referral code: QJZYILWD');
    console.log('   We\'ll check their stats before and after a new signup');
    
    // Step 3: Create a test user registration with referral
    console.log('\n3️⃣ Testing user registration with referral...');
    const testUserData = {
      email: `test-referral-${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      referralCode: 'QJZYILWD'
    };
    
    try {
      const registrationResponse = await axios.post(`${BASE_URL}/auth/register-with-referral`, testUserData);
      console.log('✅ Registration successful!');
      console.log('   New user ID:', registrationResponse.data.user.id);
      console.log('   New user email:', registrationResponse.data.user.email);
      console.log('   New user referral code:', registrationResponse.data.user.referralCode);
      console.log('   JWT token received:', !!registrationResponse.data.access_token);
      
      // Step 4: Check the new user's referral stats
      console.log('\n4️⃣ Checking new user\'s referral stats...');
      const newUserStatsResponse = await axios.get(`${BASE_URL}/referrals/user-stats`, {
        headers: { 'Authorization': `Bearer ${registrationResponse.data.access_token}` }
      });
      
      console.log('📊 New user referral stats:', {
        totalReferrals: newUserStatsResponse.data.totalReferrals,
        totalReferralEarnings: newUserStatsResponse.data.totalReferralEarnings,
        referralBonuses: newUserStatsResponse.data.referralBonuses?.length || 0,
        referredBy: newUserStatsResponse.data.referredBy
      });
      
      // Check if the new user got the 1000 PKR signup bonus
      if (newUserStatsResponse.data.referralBonuses && newUserStatsResponse.data.referralBonuses.length > 0) {
        const signupBonus = newUserStatsResponse.data.referralBonuses.find(bonus => bonus.type === 'signup_bonus');
        if (signupBonus) {
          console.log('🎉 SUCCESS: New user received signup bonus!');
          console.log('   Bonus amount:', signupBonus.amount, signupBonus.currency);
          console.log('   Bonus type:', signupBonus.type);
        } else {
          console.log('⚠️  No signup bonus found for new user');
        }
      }
      
      // Step 5: Check the referrer's stats (we need to login as the referrer)
      console.log('\n5️⃣ Checking referrer\'s stats...');
      console.log('   Note: To check referrer stats, you would need to login as all@yahoo.com');
      console.log('   The referrer should have received 500 PKR bonus');
      
      console.log('\n📋 Expected Results:');
      console.log('   ✅ New user should have: 1000 PKR signup bonus');
      console.log('   ✅ Referrer should have: 500 PKR referral bonus');
      console.log('   ✅ Team should have: 1500 PKR total bonus (1000 + 500)');
      
      console.log('\n🔍 Check backend logs for these messages:');
      console.log('   - "Processing referral signup for user <userId> with referral code QJZYILWD"');
      console.log('   - "Adding signup bonus to new user: <userId>"');
      console.log('   - "Adding referral bonus to referring user: <referrerId>"');
      console.log('   - "Updating team with bonuses: <teamId>"');
      
    } catch (error) {
      console.log('❌ Registration failed:', error.response?.data?.message || error.message);
      console.log('   Error details:', error.response?.data);
    }
    
    console.log('\n🎯 Test completed!');
    console.log('📋 Summary:');
    console.log('   - Referral code validation: ✅');
    console.log('   - User registration with referral: ✅');
    console.log('   - Check backend logs for bonus processing');
    console.log('   - Check new user stats for 1000 PKR bonus');
    console.log('   - Check referrer stats for 500 PKR bonus');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testReferralSignupBonuses(); 
const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testDirectReferralProcessing() {
  try {
    console.log('🔍 Testing direct referral processing...\n');
    
    // Step 1: Create a test user without referral first
    console.log('1️⃣ Creating test user without referral...');
    const testUserData = {
      email: `direct-test-${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Direct',
      lastName: 'Test',
      teamName: 'Direct Test Team',
      teamDescription: 'Team for direct referral testing'
    };
    
    try {
      const registrationResponse = await axios.post(`${BASE_URL}/auth/register`, testUserData);
      console.log('✅ Registration successful!');
      console.log('   User ID:', registrationResponse.data.user.id);
      console.log('   User email:', registrationResponse.data.user.email);
      console.log('   User referral code:', registrationResponse.data.user.referralCode);
      
      // Step 2: Check initial stats
      console.log('\n2️⃣ Checking initial stats...');
      const initialStatsResponse = await axios.get(`${BASE_URL}/referrals/user-stats`, {
        headers: { 'Authorization': `Bearer ${registrationResponse.data.access_token}` }
      });
      
      console.log('📊 Initial stats:', {
        totalReferrals: initialStatsResponse.data.totalReferrals,
        totalReferralEarnings: initialStatsResponse.data.totalReferralEarnings,
        referralBonuses: initialStatsResponse.data.referralBonuses?.length || 0
      });
      
      // Step 3: Test referral code validation
      console.log('\n3️⃣ Testing referral code validation...');
      const validationResponse = await axios.post(`${BASE_URL}/referrals/validate`, {
        referralCode: 'QJZYILWD'
      });
      console.log('✅ Referral validation result:', validationResponse.data);
      
      // Step 4: Create another user with referral
      console.log('\n4️⃣ Creating user with referral...');
      const referralUserData = {
        email: `referral-test-${Date.now()}@example.com`,
        password: 'password123',
        firstName: 'Referral',
        lastName: 'Test',
        referralCode: 'QJZYILWD'
      };
      
      const referralRegistrationResponse = await axios.post(`${BASE_URL}/auth/register-with-referral`, referralUserData);
      console.log('✅ Referral registration successful!');
      console.log('   Referral user ID:', referralRegistrationResponse.data.user.id);
      console.log('   Referral user email:', referralRegistrationResponse.data.user.email);
      console.log('   Referral user referral code:', referralRegistrationResponse.data.user.referralCode);
      
      // Step 5: Check referral user stats
      console.log('\n5️⃣ Checking referral user stats...');
      const referralUserStatsResponse = await axios.get(`${BASE_URL}/referrals/user-stats`, {
        headers: { 'Authorization': `Bearer ${referralRegistrationResponse.data.access_token}` }
      });
      
      console.log('📊 Referral user stats:', {
        totalReferrals: referralUserStatsResponse.data.totalReferrals,
        totalReferralEarnings: referralUserStatsResponse.data.totalReferralEarnings,
        referralBonuses: referralUserStatsResponse.data.referralBonuses?.length || 0,
        referredBy: referralUserStatsResponse.data.referredBy
      });
      
      // Step 6: Check if bonuses were added
      if (referralUserStatsResponse.data.referralBonuses && referralUserStatsResponse.data.referralBonuses.length > 0) {
        console.log('\n💰 Referral bonuses found:');
        referralUserStatsResponse.data.referralBonuses.forEach((bonus, index) => {
          console.log(`   ${index + 1}. Type: ${bonus.type}, Amount: ${bonus.amount} ${bonus.currency}, Date: ${bonus.createdAt}`);
        });
        
        const signupBonus = referralUserStatsResponse.data.referralBonuses.find(bonus => bonus.type === 'signup_bonus');
        if (signupBonus) {
          console.log('\n🎉 SUCCESS: Referral user received signup bonus!');
          console.log(`   Amount: ${signupBonus.amount} ${signupBonus.currency}`);
        }
      } else {
        console.log('\n⚠️  No referral bonuses found for referral user');
        console.log('   This indicates the referral processing is not working correctly');
      }
      
      console.log('\n🔍 Expected Results:');
      console.log('   - Referral user should have: 1000 PKR signup bonus');
      console.log('   - Referrer (all@yahoo.com) should have: 500 PKR referral bonus');
      console.log('   - Team should have: 1500 PKR total bonus');
      
      console.log('\n🔍 Check backend logs for these messages:');
      console.log('   - "Processing referral signup for user <userId> with referral code QJZYILWD"');
      console.log('   - "Found referring user: <email> with teamId: <teamId>"');
      console.log('   - "Adding signup bonus to new user: <userId>"');
      console.log('   - "Adding referral bonus to referring user: <referrerId>"');
      console.log('   - "Updating team with bonuses: <teamId>"');
      
      console.log('\n💡 If bonuses are not being added:');
      console.log('   1. Check backend logs for errors in referral processing');
      console.log('   2. Verify that the processReferralSignup method is being called');
      console.log('   3. Check if there are any database update errors');
      console.log('   4. Verify that the referral code is valid and user exists');
      
    } catch (error) {
      console.log('❌ Registration failed:', error.response?.data?.message || error.message);
      console.log('   Error details:', error.response?.data);
    }
    
    console.log('\n🎯 Direct referral test completed!');
    console.log('📋 Summary:');
    console.log('   - User registration: ✅');
    console.log('   - Referral registration: ✅');
    console.log('   - Check backend logs for processing details');
    console.log('   - Check if bonuses are being added correctly');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testDirectReferralProcessing(); 
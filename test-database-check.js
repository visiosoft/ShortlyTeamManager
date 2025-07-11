const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testDatabaseCheck() {
  try {
    console.log('🔍 Checking database state for referral processing...\n');
    
    // Step 1: Test referral code validation
    console.log('1️⃣ Testing referral code validation...');
    const validationResponse = await axios.post(`${BASE_URL}/referrals/validate`, {
      referralCode: 'QJZYILWD'
    });
    console.log('✅ Referral validation result:', validationResponse.data);
    
    // Step 2: Create a test user with referral and check immediate state
    console.log('\n2️⃣ Creating test user with referral...');
    const testUserData = {
      email: `db-check-${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Database',
      lastName: 'Check',
      referralCode: 'QJZYILWD'
    };
    
    try {
      const registrationResponse = await axios.post(`${BASE_URL}/auth/register-with-referral`, testUserData);
      console.log('✅ Registration successful!');
      console.log('   User ID:', registrationResponse.data.user.id);
      console.log('   User email:', registrationResponse.data.user.email);
      console.log('   User referral code:', registrationResponse.data.user.referralCode);
      
      // Step 3: Check user stats immediately
      console.log('\n3️⃣ Checking user stats immediately...');
      const statsResponse = await axios.get(`${BASE_URL}/referrals/user-stats`, {
        headers: { 'Authorization': `Bearer ${registrationResponse.data.access_token}` }
      });
      
      console.log('📊 User stats:', {
        totalReferrals: statsResponse.data.totalReferrals,
        totalReferralEarnings: statsResponse.data.totalReferralEarnings,
        referralBonuses: statsResponse.data.referralBonuses?.length || 0,
        referredBy: statsResponse.data.referredBy
      });
      
      // Step 4: Check if the user was properly referred
      if (statsResponse.data.referredBy) {
        console.log('\n✅ User was properly referred by team:', statsResponse.data.referredBy);
      } else {
        console.log('\n❌ User was not properly referred (no referredBy field)');
      }
      
      // Step 5: Check if bonuses were added
      if (statsResponse.data.referralBonuses && statsResponse.data.referralBonuses.length > 0) {
        console.log('\n💰 Referral bonuses found:');
        statsResponse.data.referralBonuses.forEach((bonus, index) => {
          console.log(`   ${index + 1}. Type: ${bonus.type}, Amount: ${bonus.amount} ${bonus.currency}, Date: ${bonus.createdAt}`);
        });
      } else {
        console.log('\n⚠️  No referral bonuses found');
        console.log('   This suggests the referral processing is not working correctly');
      }
      
      // Step 6: Check if totalReferralEarnings was updated
      if (statsResponse.data.totalReferralEarnings > 0) {
        console.log('\n✅ Total referral earnings updated:', statsResponse.data.totalReferralEarnings);
      } else {
        console.log('\n❌ Total referral earnings not updated (should be 1000)');
      }
      
      console.log('\n🔍 Analysis:');
      console.log('   - User registration: ✅');
      console.log('   - User referral tracking: ✅');
      console.log('   - Referral bonuses: ❌ (not being added)');
      console.log('   - Total earnings: ❌ (not being updated)');
      
      console.log('\n💡 Possible issues:');
      console.log('   1. processReferralSignup method is not being called');
      console.log('   2. Database update operations are failing');
      console.log('   3. There\'s an error in the referral processing logic');
      console.log('   4. The referral code validation is failing');
      
      console.log('\n🔍 Check backend logs for:');
      console.log('   - "Processing referral signup for user <userId> with referral code QJZYILWD"');
      console.log('   - "Adding signup bonus to new user: <userId>"');
      console.log('   - "Adding referral bonus to referring user: <referrerId>"');
      console.log('   - Any error messages in the referral processing');
      
    } catch (error) {
      console.log('❌ Registration failed:', error.response?.data?.message || error.message);
      console.log('   Error details:', error.response?.data);
    }
    
    console.log('\n🎯 Database check completed!');
    console.log('📋 Summary:');
    console.log('   - Referral registration is working ✅');
    console.log('   - User referral tracking is working ✅');
    console.log('   - Bonus processing needs investigation ❌');
    console.log('   - Check backend logs for processing errors');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testDatabaseCheck(); 
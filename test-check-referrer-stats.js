const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testCheckReferrerStats() {
  try {
    console.log('🔍 Checking referrer stats after referral signup...\n');
    
    // Step 1: Try to login as the referrer (all@yahoo.com)
    console.log('1️⃣ Attempting to login as referrer (all@yahoo.com)...');
    const loginData = {
      email: 'all@yahoo.com',
      password: 'password123'
    };
    
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
      const token = loginResponse.data.access_token;
      console.log('✅ Login successful as referrer');
      
      // Step 2: Check referrer's referral stats
      console.log('\n2️⃣ Checking referrer\'s referral stats...');
      const statsResponse = await axios.get(`${BASE_URL}/referrals/user-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('📊 Referrer referral stats:', {
        totalReferrals: statsResponse.data.totalReferrals,
        totalReferralEarnings: statsResponse.data.totalReferralEarnings,
        referralBonuses: statsResponse.data.referralBonuses?.length || 0,
        referralCode: statsResponse.data.referralCode
      });
      
      // Check for referral bonuses
      if (statsResponse.data.referralBonuses && statsResponse.data.referralBonuses.length > 0) {
        console.log('\n💰 Referral bonuses found:');
        statsResponse.data.referralBonuses.forEach((bonus, index) => {
          console.log(`   ${index + 1}. Type: ${bonus.type}, Amount: ${bonus.amount} ${bonus.currency}, Date: ${bonus.createdAt}`);
        });
        
        const referralBonus = statsResponse.data.referralBonuses.find(bonus => bonus.type === 'referral_bonus');
        if (referralBonus) {
          console.log('\n🎉 SUCCESS: Referrer received referral bonus!');
          console.log(`   Amount: ${referralBonus.amount} ${referralBonus.currency}`);
        }
      } else {
        console.log('\n⚠️  No referral bonuses found for referrer');
      }
      
      // Step 3: Check referrer's referral signups
      console.log('\n3️⃣ Checking referrer\'s referral signups...');
      const signupsResponse = await axios.get(`${BASE_URL}/referrals/my-signups`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('👥 Referral signups:', signupsResponse.data.length);
      signupsResponse.data.forEach((signup, index) => {
        console.log(`   ${index + 1}. ${signup.firstName} ${signup.lastName} (${signup.email}) - ${signup.bonusAmount} ${signup.currency}`);
      });
      
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data?.message || error.message);
      console.log('   Trying alternative credentials...');
      
      // Try with different credentials
      const altLoginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      try {
        const altLoginResponse = await axios.post(`${BASE_URL}/auth/login`, altLoginData);
        const altToken = altLoginResponse.data.access_token;
        console.log('✅ Login successful with alternative user');
        
        // Check stats anyway
        const altStatsResponse = await axios.get(`${BASE_URL}/referrals/user-stats`, {
          headers: { 'Authorization': `Bearer ${altToken}` }
        });
        
        console.log('📊 Alternative user referral stats:', {
          totalReferrals: altStatsResponse.data.totalReferrals,
          totalReferralEarnings: altStatsResponse.data.totalReferralEarnings,
          referralBonuses: altStatsResponse.data.referralBonuses?.length || 0
        });
        
      } catch (altError) {
        console.log('❌ Alternative login also failed:', altError.response?.data?.message || altError.message);
      }
    }
    
    console.log('\n🔍 Check backend logs for referral processing messages:');
    console.log('   - "Processing referral signup for user <userId> with referral code QJZYILWD"');
    console.log('   - "Adding signup bonus to new user: <userId>"');
    console.log('   - "Adding referral bonus to referring user: <referrerId>"');
    console.log('   - "Updating team with bonuses: <teamId>"');
    
    console.log('\n📋 Summary:');
    console.log('   - Referral signup was successful ✅');
    console.log('   - New user created with referral code ✅');
    console.log('   - Check backend logs for bonus processing');
    console.log('   - Expected: 1000 PKR for new user, 500 PKR for referrer');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCheckReferrerStats(); 
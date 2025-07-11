const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

// Test user credentials - replace with real credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

// JWT token - replace with a real token from your login
const JWT_TOKEN = process.env.JWT_TOKEN || 'your-jwt-token-here';

async function testCompleteReferralFlow() {
  try {
    console.log('🚀 Starting complete referral click earnings test...\n');
    
    // Step 1: Login and get JWT token (if not provided)
    console.log('1️⃣ Logging in to get JWT token...');
    let token = JWT_TOKEN;
    
    if (token === 'your-jwt-token-here') {
      try {
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, TEST_USER);
        token = loginResponse.data.access_token;
        console.log('✅ Login successful, got JWT token');
      } catch (error) {
        console.log('⚠️  Login failed, using provided token or proceeding without auth');
        console.log('   Error:', error.response?.data?.message || error.message);
      }
    }
    
    // Step 2: Check current referral stats
    console.log('\n2️⃣ Checking current referral stats...');
    try {
      const statsResponse = await axios.get(`${BASE_URL}/referrals/user-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('📊 Current referral stats:', {
        totalReferrals: statsResponse.data.totalReferrals,
        totalReferralEarnings: statsResponse.data.totalReferralEarnings,
        referralCode: statsResponse.data.referralCode,
        referredBy: statsResponse.data.referredBy
      });
    } catch (error) {
      console.log('⚠️  Could not get referral stats:', error.response?.data?.message || error.message);
    }
    
    // Step 3: Create a test URL
    console.log('\n3️⃣ Creating a test URL...');
    const testUrlData = {
      originalUrl: 'https://example.com/referral-test',
      title: 'Referral Test URL',
      description: 'Testing referral click earnings'
    };
    
    let shortCode = null;
    try {
      const urlResponse = await axios.post(`${BASE_URL}/urls`, testUrlData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      shortCode = urlResponse.data.shortCode;
      console.log('✅ URL created successfully');
      console.log('   Short Code:', shortCode);
      console.log('   Original URL:', urlResponse.data.originalUrl);
    } catch (error) {
      console.log('❌ Failed to create URL:', error.response?.data?.message || error.message);
      console.log('   This might be due to authentication issues.');
      return;
    }
    
    // Step 4: Simulate a click on the URL
    console.log('\n4️⃣ Simulating a click on the short URL...');
    try {
      const clickResponse = await axios.get(`http://localhost:3009/${shortCode}`, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400; // Accept redirects
        }
      });
      console.log('✅ Click simulated successfully');
      console.log('   Response status:', clickResponse.status);
    } catch (error) {
      if (error.response && (error.response.status === 302 || error.response.status === 301)) {
        console.log('✅ Click tracked successfully (redirect)');
      } else {
        console.log('❌ Click simulation failed:', error.response?.data || error.message);
      }
    }
    
    // Step 5: Wait for processing
    console.log('\n5️⃣ Waiting for referral earnings processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 6: Check updated referral stats
    console.log('\n6️⃣ Checking updated referral stats...');
    try {
      const updatedStatsResponse = await axios.get(`${BASE_URL}/referrals/user-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('📊 Updated referral stats:', {
        totalReferrals: updatedStatsResponse.data.totalReferrals,
        totalReferralEarnings: updatedStatsResponse.data.totalReferralEarnings,
        referralBonuses: updatedStatsResponse.data.referralBonuses?.length || 0
      });
      
      // Check if earnings increased
      if (updatedStatsResponse.data.referralBonuses && updatedStatsResponse.data.referralBonuses.length > 0) {
        console.log('🎉 SUCCESS: Referral earnings have been updated!');
        console.log('   Latest bonus:', updatedStatsResponse.data.referralBonuses[updatedStatsResponse.data.referralBonuses.length - 1]);
      } else {
        console.log('⚠️  No referral bonuses found. This might be normal if the user was not referred by anyone.');
      }
    } catch (error) {
      console.log('❌ Could not get updated stats:', error.response?.data?.message || error.message);
    }
    
    // Step 7: Check referrer stats (if user was referred)
    console.log('\n7️⃣ Checking referrer stats...');
    try {
      const referrerStatsResponse = await axios.get(`${BASE_URL}/referrals/user-stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { userId: '6869696d477add447e0b0c97' } // The referrer ID
      });
      console.log('📊 Referrer stats:', {
        totalReferrals: referrerStatsResponse.data.totalReferrals,
        totalReferralEarnings: referrerStatsResponse.data.totalReferralEarnings
      });
    } catch (error) {
      console.log('⚠️  Could not get referrer stats:', error.response?.data?.message || error.message);
    }
    
    console.log('\n🎯 Test completed! Check the backend logs for detailed referral earnings processing.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Instructions for the user
console.log('📋 INSTRUCTIONS:');
console.log('1. Replace JWT_TOKEN with a real token from your login');
console.log('2. Or update TEST_USER with real credentials');
console.log('3. Make sure the backend is running on port 3009');
console.log('4. Run this script to test the complete referral flow\n');

testCompleteReferralFlow(); 
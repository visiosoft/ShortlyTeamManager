const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testReferralUrl() {
  try {
    console.log('🔍 Testing Referral URL Generation...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'zulfiqar@yahoo.com',
      password: 'Xulfi1234@'
    });

    const adminToken = adminLoginResponse.data.access_token;
    console.log('✅ Admin login successful');

    // Step 2: Get referral link
    console.log('\n2. Getting referral link...');
    const referralLinkResponse = await axios.get(`${BASE_URL}/referrals/link`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ Referral link response received');
    console.log('Referral Link:', referralLinkResponse.data.referralLink);
    console.log('Referral Code:', referralLinkResponse.data.referralCode);

    // Step 3: Check if the URL uses the correct base URL
    const expectedBaseUrl = 'http://localhost:4000';
    if (referralLinkResponse.data.referralLink.startsWith(expectedBaseUrl)) {
      console.log('\n✅ SUCCESS: Referral link is using the correct base URL!');
      console.log(`Expected: ${expectedBaseUrl}`);
      console.log(`Actual: ${referralLinkResponse.data.referralLink.split('/register')[0]}`);
    } else {
      console.log('\n❌ FAILED: Referral link is not using the correct base URL');
      console.log(`Expected: ${expectedBaseUrl}`);
      console.log(`Actual: ${referralLinkResponse.data.referralLink.split('/register')[0]}`);
    }

    console.log('\n🎉 Referral URL test completed!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testReferralUrl(); 
const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function createAdminTest() {
  try {
    console.log('🔧 Creating Admin User for Testing...\n');

    // Step 1: Create a new admin user
    console.log('1. Creating new admin user...');
    const adminEmail = `admin${Date.now()}@test.com`;
    const adminPassword = 'AdminPass123!';
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      firstName: 'Admin',
      lastName: 'Test',
      email: adminEmail,
      password: adminPassword,
      teamName: 'Admin Test Team'
    });

    console.log('✅ Admin user created:', adminEmail);
    console.log('User ID:', registerResponse.data.user.id);
    console.log('Team ID:', registerResponse.data.user.teamId);
    console.log('Role:', registerResponse.data.user.role);

    // Step 2: Login as the new admin
    console.log('\n2. Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: adminEmail,
      password: adminPassword
    });

    const adminToken = loginResponse.data.access_token;
    console.log('✅ Admin login successful');

    // Step 3: Get referral link
    console.log('\n3. Getting referral link...');
    const referralLinkResponse = await axios.get(`${BASE_URL}/referrals/link`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ Referral link response received');
    console.log('Referral Link:', referralLinkResponse.data.referralLink);
    console.log('Referral Code:', referralLinkResponse.data.referralCode);

    // Step 4: Check if the URL uses the correct base URL
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

    console.log('\n📋 Test Credentials:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);

    console.log('\n🎉 Admin test completed!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

createAdminTest(); 
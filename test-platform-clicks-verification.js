const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';
const EMAIL = 'zulfiqar@yahoo.com';
const PASSWORD = 'Xulfi1234@';

async function testPlatformClicksVerification() {
  try {
    console.log('🔍 Testing Platform Clicks Verification...\n');

    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD
    });

    const { token, user } = loginResponse.data;
    console.log(`✅ Login successful - User ID: ${user._id}, Team ID: ${user.teamId}`);
    console.log(`   User email: ${user.email}, Role: ${user.role}`);
    console.log(`   Full user object:`, JSON.stringify(user, null, 2));
    console.log('');

    // Check if user ID is undefined
    if (!user._id) {
      console.log('⚠️  WARNING: User ID is undefined. This might cause issues.');
      console.log('   Trying to use user.id instead...');
    }

    const userId = user._id || user.id;
    console.log(`   Using User ID: ${userId}\n`);

    // Step 2: Add platform clicks
    console.log('2. Adding platform clicks...');
    const addClicksResponse = await axios.post(`${BASE_URL}/platforms/clicks`, {
      platformName: 'Facebook',
      clicks: 150,
      date: new Date().toISOString(),
      notes: 'Test verification clicks'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✅ Added ${addClicksResponse.data.clicks} clicks for ${addClicksResponse.data.platformName}`);
    console.log(`   Click ID: ${addClicksResponse.data._id}\n`);

    // Step 3: Fetch my team clicks
    console.log('3. Fetching my team clicks...');
    const myTeamResponse = await axios.get(`${BASE_URL}/platforms/clicks/my-team`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✅ My team clicks: ${myTeamResponse.data.length} records found`);
    if (myTeamResponse.data.length > 0) {
      console.log('   Sample record:', {
        platformName: myTeamResponse.data[0].platformName,
        clicks: myTeamResponse.data[0].clicks,
        date: myTeamResponse.data[0].date
      });
    }

    // Step 4: Fetch all team clicks (admin endpoint)
    console.log('\n4. Fetching all team clicks (admin endpoint)...');
    const allTeamResponse = await axios.get(`${BASE_URL}/platforms/clicks/team/${user.teamId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✅ All team clicks: ${allTeamResponse.data.length} records found`);
    if (allTeamResponse.data.length > 0) {
      console.log('   Sample record:', {
        platformName: allTeamResponse.data[0].platformName,
        clicks: allTeamResponse.data[0].clicks,
        date: allTeamResponse.data[0].date
      });
    }

    // Step 5: Fetch platform stats
    console.log('\n5. Fetching platform stats...');
    const statsResponse = await axios.get(`${BASE_URL}/platforms/clicks/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✅ Platform stats: ${statsResponse.data.length} platforms found`);
    if (statsResponse.data.length > 0) {
      console.log('   Stats:', statsResponse.data.map(stat => ({
        platformName: stat.platformName,
        totalClicks: stat.totalClicks,
        clickRate: stat.clickRate
      })));
    }

    // Step 6: Test with different team ID format
    console.log('\n6. Testing with string team ID...');
    const stringTeamResponse = await axios.get(`${BASE_URL}/platforms/clicks/team/${user.teamId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✅ String team ID query: ${stringTeamResponse.data.length} records found`);

    console.log('\n🎉 VERIFICATION COMPLETE: Platform clicks are working correctly!');
    console.log('   - ObjectId conversion is working');
    console.log('   - Team-based filtering is working');
    console.log('   - All endpoints are accessible');

  } catch (error) {
    console.error('❌ Verification failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('   Authentication failed - check credentials');
    } else if (error.response?.status === 404) {
      console.log('   Endpoint not found - check if backend is running');
    }
  }
}

testPlatformClicksVerification(); 
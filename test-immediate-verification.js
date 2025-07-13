const axios = require('axios');

const API_BASE_URL = 'http://localhost:3009/api';

async function testImmediateVerification() {
  console.log('🔧 Testing Immediate Verification...\n');
  
  // Login as admin
  const adminToken = await loginUser('admin@test.com', 'password123');
  if (!adminToken) {
    console.log('❌ Admin login failed. Cannot proceed.');
    return;
  }
  
  // Get platforms
  const platformsResponse = await axios.get(`${API_BASE_URL}/platforms`, {
    headers: await getAuthHeaders(adminToken)
  });
  
  const platform = platformsResponse.data[0];
  console.log(`✅ Using platform: ${platform.name} (${platform._id})`);
  
  // Get team members
  const teamResponse = await axios.get(`${API_BASE_URL}/users/team-members`, {
    headers: await getAuthHeaders(adminToken)
  });
  
  const teamMember = teamResponse.data[0];
  console.log(`✅ Using team member: ${teamMember.firstName} ${teamMember.lastName} (${teamMember._id})`);
  
  // Add clicks for a unique date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  console.log(`\n📊 Adding clicks for ${tomorrowStr}...`);
  const clickData = {
    platformId: platform._id,
    userId: teamMember._id,
    clicks: 500,
    date: tomorrowStr,
    ratePerClick: 2.0,
    notes: 'Test clicks for immediate verification'
  };
  
  try {
    const clickResponse = await axios.post(
      `${API_BASE_URL}/platforms/clicks`,
      clickData,
      { headers: await getAuthHeaders(adminToken) }
    );
    
    console.log(`✅ Platform clicks added successfully:`);
    console.log(`   - Click ID: ${clickResponse.data._id}`);
    console.log(`   - Clicks: ${clickResponse.data.clicks}`);
    console.log(`   - Earnings: ${clickResponse.data.earnings} PKR`);
    console.log(`   - Team ID: ${clickResponse.data.teamId}`);
    console.log(`   - Date: ${clickResponse.data.date}`);
    
    // Immediately check if clicks appear
    console.log('\n🔍 Immediately checking if clicks appear...');
    
    // Check 1: All clicks endpoint
    const allClicksResponse = await axios.get(`${API_BASE_URL}/platforms/clicks/all`, {
      headers: await getAuthHeaders(adminToken)
    });
    console.log(`✅ All clicks endpoint: ${allClicksResponse.data.length} clicks`);
    
    // Check 2: Team clicks endpoint
    const teamClicksResponse = await axios.get(`${API_BASE_URL}/platforms/clicks/team/${clickResponse.data.teamId}`, {
      headers: await getAuthHeaders(adminToken)
    });
    console.log(`✅ Team clicks endpoint: ${teamClicksResponse.data.length} clicks`);
    
    // Check 3: User clicks endpoint
    const userClicksResponse = await axios.get(`${API_BASE_URL}/platforms/clicks/user/${teamMember._id}`, {
      headers: await getAuthHeaders(adminToken)
    });
    console.log(`✅ User clicks endpoint: ${userClicksResponse.data.length} clicks`);
    
    // Check 4: Date-specific query
    const dateClicksResponse = await axios.get(`${API_BASE_URL}/platforms/clicks/all?startDate=${tomorrowStr}&endDate=${tomorrowStr}`, {
      headers: await getAuthHeaders(adminToken)
    });
    console.log(`✅ Date-specific query: ${dateClicksResponse.data.length} clicks`);
    
    // Check 5: Statistics
    const statsResponse = await axios.get(`${API_BASE_URL}/platforms/clicks/stats`, {
      headers: await getAuthHeaders(adminToken)
    });
    console.log(`✅ Statistics:`, statsResponse.data);
    
    if (allClicksResponse.data.length > 0) {
      console.log('\n📋 Found clicks:');
      allClicksResponse.data.forEach((click, index) => {
        console.log(`   Click ${index + 1}:`);
        console.log(`     - Platform: ${click.platformId?.name || 'Unknown'}`);
        console.log(`     - User: ${click.userId?.firstName} ${click.userId?.lastName}`);
        console.log(`     - Clicks: ${click.clicks}`);
        console.log(`     - Earnings: ${click.earnings} PKR`);
        console.log(`     - Date: ${click.date}`);
      });
    } else {
      console.log('\n❌ No clicks found in any endpoint!');
      console.log('This suggests a database or query issue.');
    }
    
  } catch (error) {
    console.log(`❌ Click addition failed:`, error.response?.data?.message || error.message);
  }
}

async function loginUser(email, password) {
  try {
    console.log(`🔐 Logging in as ${email}...`);
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password
    });
    
    if (response.data && response.data.access_token) {
      console.log(`✅ Login successful for ${email}`);
      return response.data.access_token;
    } else {
      console.log(`❌ Login failed for ${email}: No token received`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Login failed for ${email}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function getAuthHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

testImmediateVerification().catch(console.error); 
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3009/api';

async function testAddClicksForAdmin() {
  console.log('🔧 Adding Platform Clicks for Admin Team...\n');
  
  // Login as admin
  const adminToken = await loginUser('admin@test.com', 'password123');
  if (!adminToken) {
    console.log('❌ Admin login failed. Cannot proceed.');
    return;
  }
  
  // Get platforms
  console.log('📋 Getting available platforms...');
  const platformsResponse = await axios.get(`${API_BASE_URL}/platforms`, {
    headers: await getAuthHeaders(adminToken)
  });
  
  if (platformsResponse.data.length === 0) {
    console.log('❌ No platforms available. Creating one...');
    await createPlatform(adminToken);
  }
  
  const platform = platformsResponse.data[0];
  console.log(`✅ Using platform: ${platform.name} (${platform._id})`);
  
  // Get team members
  console.log('\n👥 Getting team members...');
  const teamResponse = await axios.get(`${API_BASE_URL}/users/team-members`, {
    headers: await getAuthHeaders(adminToken)
  });
  
  if (teamResponse.data.length === 0) {
    console.log('❌ No team members found.');
    return;
  }
  
  const teamMember = teamResponse.data[0];
  console.log(`✅ Using team member: ${teamMember.firstName} ${teamMember.lastName} (${teamMember._id})`);
  console.log(`🏢 Team: ${teamMember.teamId.name} (${teamMember.teamId._id})`);
  
  // Add clicks for today
  console.log('\n📊 Adding platform clicks...');
  const today = new Date().toISOString().split('T')[0];
  const clickData = {
    platformId: platform._id,
    userId: teamMember._id,
    clicks: 200,
    date: today,
    ratePerClick: 1.0,
    notes: 'Test clicks for admin team'
  };
  
  try {
    const clickResponse = await axios.post(
      `${API_BASE_URL}/platforms/clicks`,
      clickData,
      { headers: await getAuthHeaders(adminToken) }
    );
    
    console.log(`✅ Platform clicks added successfully:`);
    console.log(`   - Click ID: ${clickResponse.data._id}`);
    console.log(`   - Platform: ${platform.name}`);
    console.log(`   - User: ${teamMember.firstName} ${teamMember.lastName}`);
    console.log(`   - Clicks: ${clickResponse.data.clicks}`);
    console.log(`   - Earnings: ${clickResponse.data.earnings} PKR`);
    console.log(`   - Rate: ${clickResponse.data.ratePerClick} PKR per click`);
    console.log(`   - Team ID: ${clickResponse.data.teamId}`);
    console.log(`   - Date: ${clickResponse.data.date}`);
    
    // Now test if the clicks appear in the frontend endpoint
    console.log('\n🔍 Testing if clicks appear in frontend endpoint...');
    const clicksResponse = await axios.get(`${API_BASE_URL}/platforms/clicks/all`, {
      headers: await getAuthHeaders(adminToken)
    });
    
    console.log(`✅ Frontend endpoint returns ${clicksResponse.data.length} clicks`);
    
    if (clicksResponse.data.length > 0) {
      clicksResponse.data.forEach((click, index) => {
        console.log(`   Click ${index + 1}:`);
        console.log(`     - Platform: ${click.platformId?.name || 'Unknown'}`);
        console.log(`     - User: ${click.userId?.firstName} ${click.userId?.lastName}`);
        console.log(`     - Clicks: ${click.clicks}`);
        console.log(`     - Earnings: ${click.earnings} PKR`);
        console.log(`     - Date: ${click.date}`);
      });
    } else {
      console.log('❌ No clicks returned by frontend endpoint');
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

async function createPlatform(token) {
  const platformData = {
    name: 'Twitter',
    description: 'Social media platform for short messages',
    website: 'https://twitter.com',
    type: 'external',
    isActive: true
  };
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/platforms`,
      platformData,
      { headers: await getAuthHeaders(token) }
    );
    
    console.log(`✅ Platform created: ${response.data.name} (${response.data._id})`);
    return response.data._id;
  } catch (error) {
    console.log(`❌ Platform creation failed:`, error.response?.data?.message || error.message);
    return null;
  }
}

testAddClicksForAdmin().catch(console.error); 
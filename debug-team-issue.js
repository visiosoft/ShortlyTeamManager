const axios = require('axios');

const API_BASE_URL = 'http://localhost:3009/api';

async function debugTeamIssue() {
  console.log('🔍 Debugging Team Issue...\n');
  
  // Login as admin
  const adminToken = await loginUser('admin@test.com', 'password123');
  if (!adminToken) {
    console.log('❌ Admin login failed. Cannot proceed.');
    return;
  }
  
  console.log('\n📊 Checking User and Team Information:');
  
  // Get user profile
  try {
    const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: await getAuthHeaders(adminToken)
    });
    console.log('✅ User Profile:', profileResponse.data);
  } catch (error) {
    console.log('❌ Profile failed:', error.response?.data?.message || error.message);
  }
  
  // Get team members
  try {
    const teamResponse = await axios.get(`${API_BASE_URL}/users/team-members`, {
      headers: await getAuthHeaders(adminToken)
    });
    console.log('\n✅ Team Members:');
    teamResponse.data.forEach(member => {
      console.log(`   - ${member.firstName} ${member.lastName} (${member._id})`);
      console.log(`     Team: ${member.teamId.name} (${member.teamId._id})`);
    });
  } catch (error) {
    console.log('❌ Team members failed:', error.response?.data?.message || error.message);
  }
  
  // Test direct team endpoint
  try {
    const teamClicksResponse = await axios.get(`${API_BASE_URL}/platforms/clicks/team/6873cb8b1e72b23d12273a03`, {
      headers: await getAuthHeaders(adminToken)
    });
    console.log(`\n✅ Direct team clicks: ${teamClicksResponse.data.length} clicks`);
    
    if (teamClicksResponse.data.length > 0) {
      teamClicksResponse.data.forEach((click, index) => {
        console.log(`   Click ${index + 1}:`);
        console.log(`     - Platform: ${click.platformId?.name || 'Unknown'}`);
        console.log(`     - User: ${click.userId?.firstName} ${click.userId?.lastName}`);
        console.log(`     - Clicks: ${click.clicks}`);
        console.log(`     - Team: ${click.teamId?.name || click.teamId}`);
      });
    }
  } catch (error) {
    console.log('❌ Direct team clicks failed:', error.response?.data?.message || error.message);
  }
  
  // Test my-team endpoint
  try {
    const myTeamResponse = await axios.get(`${API_BASE_URL}/platforms/clicks/my-team`, {
      headers: await getAuthHeaders(adminToken)
    });
    console.log(`\n✅ My team clicks: ${myTeamResponse.data.length} clicks`);
  } catch (error) {
    console.log('❌ My team clicks failed:', error.response?.data?.message || error.message);
  }
  
  // Test all clicks endpoint
  try {
    const allClicksResponse = await axios.get(`${API_BASE_URL}/platforms/clicks/all`, {
      headers: await getAuthHeaders(adminToken)
    });
    console.log(`\n✅ All clicks: ${allClicksResponse.data.length} clicks`);
  } catch (error) {
    console.log('❌ All clicks failed:', error.response?.data?.message || error.message);
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

debugTeamIssue().catch(console.error); 
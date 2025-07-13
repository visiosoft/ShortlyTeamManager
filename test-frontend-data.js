const axios = require('axios');

const API_BASE_URL = 'http://localhost:3009/api';

async function testFrontendData() {
  console.log('🔍 Testing Frontend Data Flow...\n');
  
  // Test with admin user (who should have clicks)
  console.log('1. Testing with Admin User:');
  const adminToken = await loginUser('admin@test.com', 'password123');
  if (adminToken) {
    await testEndpoints(adminToken, 'Admin');
  }
  
  console.log('\n2. Testing with Regular User:');
  const userToken = await loginUser('user@test.com', 'password123');
  if (userToken) {
    await testEndpoints(userToken, 'User');
  }
  
  console.log('\n3. Testing with Different Endpoints:');
  if (adminToken) {
    await testAllEndpoints(adminToken);
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
      console.log(`   User ID: ${response.data.user?._id || 'N/A'}`);
      console.log(`   Team ID: ${response.data.user?.teamId || 'N/A'}`);
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

async function testEndpoints(token, userType) {
  const headers = await getAuthHeaders(token);
  
  // Test platforms endpoint
  try {
    const platformsResponse = await axios.get(`${API_BASE_URL}/platforms`, { headers });
    console.log(`✅ ${userType} can see ${platformsResponse.data.length} platforms`);
  } catch (error) {
    console.log(`❌ ${userType} platforms failed:`, error.response?.data?.message || error.message);
  }
  
  // Test clicks endpoint (frontend uses this)
  try {
    const clicksResponse = await axios.get(`${API_BASE_URL}/platforms/clicks/all`, { headers });
    console.log(`✅ ${userType} can see ${clicksResponse.data.length} clicks`);
    
    if (clicksResponse.data.length > 0) {
      clicksResponse.data.forEach((click, index) => {
        console.log(`   Click ${index + 1}:`);
        console.log(`     - Platform: ${click.platformId?.name || 'Unknown'}`);
        console.log(`     - User: ${click.userId?.firstName} ${click.userId?.lastName}`);
        console.log(`     - Clicks: ${click.clicks}`);
        console.log(`     - Earnings: ${click.earnings} PKR`);
        console.log(`     - Team: ${click.teamId?.name || click.teamId}`);
      });
    }
  } catch (error) {
    console.log(`❌ ${userType} clicks failed:`, error.response?.data?.message || error.message);
  }
  
  // Test team members endpoint
  try {
    const teamResponse = await axios.get(`${API_BASE_URL}/users/team-members`, { headers });
    console.log(`✅ ${userType} can see ${teamResponse.data.length} team members`);
  } catch (error) {
    console.log(`❌ ${userType} team members failed:`, error.response?.data?.message || error.message);
  }
}

async function testAllEndpoints(token) {
  const headers = await getAuthHeaders(token);
  
  console.log('\n📊 Testing All Platform Click Endpoints:');
  
  const endpoints = [
    { name: '/api/platforms/clicks/all', method: 'GET' },
    { name: '/api/platforms/clicks/my-clicks', method: 'GET' },
    { name: '/api/platforms/clicks/my-team', method: 'GET' },
    { name: '/api/platforms/clicks/stats', method: 'GET' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios({
        method: endpoint.method,
        url: `${API_BASE_URL}${endpoint.name}`,
        headers
      });
      
      if (endpoint.name.includes('stats')) {
        console.log(`✅ ${endpoint.name}:`, response.data);
      } else {
        console.log(`✅ ${endpoint.name}: ${response.data.length} clicks`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name} failed:`, error.response?.data?.message || error.message);
    }
  }
}

testFrontendData().catch(console.error); 
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3009/api';

let adminToken = '';
let userToken = '';

async function testLogin(email, password) {
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

async function debugPlatformClicks() {
  console.log('🔍 Debugging Platform Clicks...\n');
  
  // Login
  adminToken = await testLogin('admin@test.com', 'password123');
  userToken = await testLogin('user@test.com', 'password123');
  
  if (!adminToken || !userToken) {
    console.log('❌ Login failed. Cannot proceed.');
    return;
  }
  
  // Test different endpoints
  console.log('\n📊 Testing Different Endpoints:');
  
  // 1. Test /api/platforms/clicks/all (admin)
  try {
    const allClicksResponse = await axios.get(
      `${API_BASE_URL}/platforms/clicks/all`,
      { headers: await getAuthHeaders(adminToken) }
    );
    console.log(`✅ /api/platforms/clicks/all: ${allClicksResponse.data.length} clicks`);
  } catch (error) {
    console.log(`❌ /api/platforms/clicks/all failed:`, error.response?.data?.message || error.message);
  }
  
  // 2. Test /api/platforms/clicks/my-clicks (user)
  try {
    const myClicksResponse = await axios.get(
      `${API_BASE_URL}/platforms/clicks/my-clicks`,
      { headers: await getAuthHeaders(userToken) }
    );
    console.log(`✅ /api/platforms/clicks/my-clicks: ${myClicksResponse.data.length} clicks`);
  } catch (error) {
    console.log(`❌ /api/platforms/clicks/my-clicks failed:`, error.response?.data?.message || error.message);
  }
  
  // 3. Test /api/platforms/clicks/my-team (user)
  try {
    const teamClicksResponse = await axios.get(
      `${API_BASE_URL}/platforms/clicks/my-team`,
      { headers: await getAuthHeaders(userToken) }
    );
    console.log(`✅ /api/platforms/clicks/my-team: ${teamClicksResponse.data.length} clicks`);
  } catch (error) {
    console.log(`❌ /api/platforms/clicks/my-team failed:`, error.response?.data?.message || error.message);
  }
  
  // 4. Test /api/platforms/clicks/stats (admin)
  try {
    const statsResponse = await axios.get(
      `${API_BASE_URL}/platforms/clicks/stats`,
      { headers: await getAuthHeaders(adminToken) }
    );
    console.log(`✅ /api/platforms/clicks/stats:`, statsResponse.data);
  } catch (error) {
    console.log(`❌ /api/platforms/clicks/stats failed:`, error.response?.data?.message || error.message);
  }
  
  // 5. Test specific team endpoint
  try {
    const teamResponse = await axios.get(
      `${API_BASE_URL}/platforms/clicks/team/6873cb8b1e72b23d12273a03`,
      { headers: await getAuthHeaders(adminToken) }
    );
    console.log(`✅ /api/platforms/clicks/team/6873cb8b1e72b23d12273a03: ${teamResponse.data.length} clicks`);
  } catch (error) {
    console.log(`❌ Team endpoint failed:`, error.response?.data?.message || error.message);
  }
  
  // 6. Test specific user endpoint
  try {
    const userResponse = await axios.get(
      `${API_BASE_URL}/platforms/clicks/user/6873cb8b1e72b23d12273a05`,
      { headers: await getAuthHeaders(adminToken) }
    );
    console.log(`✅ /api/platforms/clicks/user/6873cb8b1e72b23d12273a05: ${userResponse.data.length} clicks`);
  } catch (error) {
    console.log(`❌ User endpoint failed:`, error.response?.data?.message || error.message);
  }
}

debugPlatformClicks().catch(console.error); 
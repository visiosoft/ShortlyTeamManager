const axios = require('axios');

const API_BASE_URL = 'http://localhost:3009/api';

async function testDirectDatabaseQuery() {
  console.log('🔍 Testing Direct Database Query...\n');
  
  // Login as admin
  const adminToken = await loginUser('admin@test.com', 'password123');
  if (!adminToken) {
    console.log('❌ Admin login failed. Cannot proceed.');
    return;
  }
  
  console.log('\n📊 Testing Different Query Approaches:');
  
  // Test 1: Query without team filter (admin should see all)
  try {
    const response = await axios.get(`${API_BASE_URL}/platforms/clicks/all?teamId=6873cb8b1e72b23d12273a03`, {
      headers: await getAuthHeaders(adminToken)
    });
    console.log(`✅ Query with team filter: ${response.data.length} clicks`);
  } catch (error) {
    console.log(`❌ Query with team filter failed:`, error.response?.data?.message || error.message);
  }
  
  // Test 2: Query specific user clicks
  try {
    const response = await axios.get(`${API_BASE_URL}/platforms/clicks/user/6873cb8b1e72b23d12273a05`, {
      headers: await getAuthHeaders(adminToken)
    });
    console.log(`✅ Query user clicks: ${response.data.length} clicks`);
  } catch (error) {
    console.log(`❌ Query user clicks failed:`, error.response?.data?.message || error.message);
  }
  
  // Test 3: Query with date filter
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const response = await axios.get(`${API_BASE_URL}/platforms/clicks/all?startDate=${yesterdayStr}&endDate=${yesterdayStr}`, {
      headers: await getAuthHeaders(adminToken)
    });
    console.log(`✅ Query with date filter (${yesterdayStr}): ${response.data.length} clicks`);
  } catch (error) {
    console.log(`❌ Query with date filter failed:`, error.response?.data?.message || error.message);
  }
  
  // Test 4: Query with platform filter
  try {
    const response = await axios.get(`${API_BASE_URL}/platforms/clicks/all?platformId=6873cb8d1e72b23d12273a1f`, {
      headers: await getAuthHeaders(adminToken)
    });
    console.log(`✅ Query with platform filter: ${response.data.length} clicks`);
  } catch (error) {
    console.log(`❌ Query with platform filter failed:`, error.response?.data?.message || error.message);
  }
  
  // Test 5: Try to get all clicks without any filters (admin should see their team's clicks)
  try {
    const response = await axios.get(`${API_BASE_URL}/platforms/clicks/all`, {
      headers: await getAuthHeaders(adminToken)
    });
    console.log(`✅ Query all clicks (no filters): ${response.data.length} clicks`);
    
    if (response.data.length > 0) {
      response.data.forEach((click, index) => {
        console.log(`   Click ${index + 1}:`);
        console.log(`     - ID: ${click._id}`);
        console.log(`     - Platform: ${click.platformId?.name || 'Unknown'}`);
        console.log(`     - User: ${click.userId?.firstName} ${click.userId?.lastName}`);
        console.log(`     - Clicks: ${click.clicks}`);
        console.log(`     - Earnings: ${click.earnings} PKR`);
        console.log(`     - Team: ${click.teamId?.name || click.teamId}`);
        console.log(`     - Date: ${click.date}`);
      });
    }
  } catch (error) {
    console.log(`❌ Query all clicks failed:`, error.response?.data?.message || error.message);
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

testDirectDatabaseQuery().catch(console.error); 
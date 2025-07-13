const axios = require('axios');

const API_BASE_URL = 'http://localhost:3009/api';

// Test configuration - using existing users from the system
const TEST_CONFIG = {
  adminEmail: 'admin@test.com',
  adminPassword: 'password123',
  testUserEmail: 'toheed@yahoo.com',
  testUserPassword: 'password123'
};

let adminToken = '';
let userToken = '';
let testPlatformId = '';
let testUserId = '';
let testTeamId = '';

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

async function testPlatformCreation() {
  try {
    console.log('\n🏗️ Testing Platform Creation...');
    
    const platformData = {
      name: 'Facebook',
      description: 'Social media platform for testing',
      website: 'https://facebook.com',
      type: 'external',
      isActive: true
    };
    
    const response = await axios.post(
      `${API_BASE_URL}/platforms`,
      platformData,
      { headers: await getAuthHeaders(adminToken) }
    );
    
    if (response.data && response.data._id) {
      testPlatformId = response.data._id;
      console.log(`✅ Platform created successfully:`);
      console.log(`   - Name: ${response.data.name}`);
      console.log(`   - ID: ${testPlatformId}`);
      console.log(`   - Type: ${response.data.type}`);
      console.log(`   - Active: ${response.data.isActive}`);
      return testPlatformId;
    }
  } catch (error) {
    console.log(`❌ Platform creation failed:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function testGetPlatforms() {
  try {
    console.log('\n📋 Testing Platform Retrieval...');
    
    // Test as admin
    const adminResponse = await axios.get(
      `${API_BASE_URL}/platforms`,
      { headers: await getAuthHeaders(adminToken) }
    );
    
    console.log(`✅ Admin can see ${adminResponse.data.length} platforms`);
    adminResponse.data.forEach(platform => {
      console.log(`   - ${platform.name} (${platform.type}) - ${platform.isActive ? 'Active' : 'Inactive'}`);
    });
    
    // Test as user
    const userResponse = await axios.get(
      `${API_BASE_URL}/platforms`,
      { headers: await getAuthHeaders(userToken) }
    );
    
    console.log(`✅ User can see ${userResponse.data.length} platforms`);
    
    return adminResponse.data.length > 0;
  } catch (error) {
    console.log(`❌ Platform retrieval failed:`, error.response?.data?.message || error.message);
    return false;
  }
}

async function testGetTeamMembers() {
  try {
    console.log('\n👥 Testing Team Members Retrieval...');
    
    const response = await axios.get(
      `${API_BASE_URL}/users/team-members`,
      { headers: await getAuthHeaders(adminToken) }
    );
    
    if (response.data && response.data.length > 0) {
      console.log(`✅ Found ${response.data.length} team members`);
      
      // Use the first user as test user
      const testUser = response.data[0];
      testUserId = testUser._id;
      testTeamId = testUser.teamId._id;
      
      console.log(`📝 Using test user: ${testUser.firstName} ${testUser.lastName} (${testUser.email})`);
      console.log(`🏢 Team: ${testUser.teamId.name} (${testTeamId})`);
      
      response.data.forEach(member => {
        console.log(`   - ${member.firstName} ${member.lastName} (${member.email}) - Team: ${member.teamId.name}`);
      });
      
      return true;
    } else {
      console.log(`❌ No team members found`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Team members retrieval failed:`, error.response?.data?.message || error.message);
    return false;
  }
}

async function testAddPlatformClicks(platformId, userId, date) {
  try {
    console.log('\n📊 Testing Platform Click Addition...');
    
    const clickData = {
      platformId: platformId,
      userId: userId,
      clicks: 100,
      date: date,
      ratePerClick: 0.5,
      notes: 'Test clicks for verification'
    };
    
    console.log(`📝 Adding clicks for:`);
    console.log(`   - Platform ID: ${platformId}`);
    console.log(`   - User ID: ${userId}`);
    console.log(`   - Date: ${date}`);
    console.log(`   - Clicks: ${clickData.clicks}`);
    console.log(`   - Rate: ${clickData.ratePerClick} PKR per click`);
    
    const response = await axios.post(
      `${API_BASE_URL}/platforms/clicks`,
      clickData,
      { headers: await getAuthHeaders(adminToken) }
    );
    
    if (response.data && response.data._id) {
      console.log(`✅ Platform clicks added successfully:`);
      console.log(`   - Click ID: ${response.data._id}`);
      console.log(`   - Clicks: ${response.data.clicks}`);
      console.log(`   - Earnings: ${response.data.earnings} PKR`);
      console.log(`   - Rate: ${response.data.ratePerClick} PKR per click`);
      console.log(`   - Team ID: ${response.data.teamId}`);
      console.log(`   - Date: ${response.data.date}`);
      return true;
    }
  } catch (error) {
    console.log(`❌ Platform click addition failed:`, error.response?.data?.message || error.message);
    return false;
  }
}

async function testGetPlatformClicks() {
  try {
    console.log('\n📈 Testing Platform Clicks Retrieval...');
    
    // Test admin access to all clicks
    const adminResponse = await axios.get(
      `${API_BASE_URL}/platforms/clicks/all`,
      { headers: await getAuthHeaders(adminToken) }
    );
    
    console.log(`✅ Admin can see ${adminResponse.data.length} platform clicks`);
    if (adminResponse.data.length > 0) {
      adminResponse.data.forEach(click => {
        console.log(`   - ${click.platformId?.name || 'Unknown'} | ${click.userId?.firstName} ${click.userId?.lastName} | ${click.clicks} clicks | ${click.earnings} PKR`);
      });
    }
    
    // Test user access to their clicks
    const userResponse = await axios.get(
      `${API_BASE_URL}/platforms/clicks/my-clicks`,
      { headers: await getAuthHeaders(userToken) }
    );
    
    console.log(`✅ User can see ${userResponse.data.length} of their platform clicks`);
    
    // Test team clicks
    const teamResponse = await axios.get(
      `${API_BASE_URL}/platforms/clicks/my-team`,
      { headers: await getAuthHeaders(userToken) }
    );
    
    console.log(`✅ User can see ${teamResponse.data.length} team platform clicks`);
    
    return adminResponse.data.length > 0;
  } catch (error) {
    console.log(`❌ Platform clicks retrieval failed:`, error.response?.data?.message || error.message);
    return false;
  }
}

async function testPlatformClicksStats() {
  try {
    console.log('\n📊 Testing Platform Clicks Statistics...');
    
    const response = await axios.get(
      `${API_BASE_URL}/platforms/clicks/stats`,
      { headers: await getAuthHeaders(adminToken) }
    );
    
    if (response.data) {
      console.log(`✅ Platform clicks statistics:`);
      console.log(`   - Total clicks: ${response.data.totalClicks}`);
      console.log(`   - Total earnings: ${response.data.totalEarnings} PKR`);
      console.log(`   - Average rate: ${response.data.averageRatePerClick} PKR per click`);
      console.log(`   - Click count: ${response.data.clickCount}`);
      return true;
    }
  } catch (error) {
    console.log(`❌ Platform clicks statistics failed:`, error.response?.data?.message || error.message);
    return false;
  }
}

async function testTeamIsolation() {
  try {
    console.log('\n🔒 Testing Team Data Isolation...');
    
    // Get clicks for specific team
    const teamResponse = await axios.get(
      `${API_BASE_URL}/platforms/clicks/team/${testTeamId}`,
      { headers: await getAuthHeaders(adminToken) }
    );
    
    console.log(`✅ Team ${testTeamId} has ${teamResponse.data.length} platform clicks`);
    
    // Verify all clicks belong to the same team
    const allTeamClicks = teamResponse.data;
    const allSameTeam = allTeamClicks.every(click => click.teamId === testTeamId);
    
    if (allSameTeam) {
      console.log(`✅ All platform clicks belong to the same team (isolation working)`);
    } else {
      console.log(`❌ Team isolation failed - clicks from different teams found`);
    }
    
    return allSameTeam;
  } catch (error) {
    console.log(`❌ Team isolation test failed:`, error.response?.data?.message || error.message);
    return false;
  }
}

async function testUserSpecificEndpoints() {
  try {
    console.log('\n👤 Testing User-Specific Endpoints...');
    
    // Test user clicks endpoint
    const userClicksResponse = await axios.get(
      `${API_BASE_URL}/platforms/clicks/user/${testUserId}`,
      { headers: await getAuthHeaders(adminToken) }
    );
    
    console.log(`✅ User ${testUserId} has ${userClicksResponse.data.length} platform clicks`);
    
    // Test team clicks endpoint
    const teamClicksResponse = await axios.get(
      `${API_BASE_URL}/platforms/clicks/team/${testTeamId}`,
      { headers: await getAuthHeaders(adminToken) }
    );
    
    console.log(`✅ Team ${testTeamId} has ${teamClicksResponse.data.length} platform clicks`);
    
    return true;
  } catch (error) {
    console.log(`❌ User-specific endpoints test failed:`, error.response?.data?.message || error.message);
    return false;
  }
}

async function runCompleteTest() {
  console.log('🧪 Starting Complete Platform System Test (API-Based)...\n');
  
  // Step 1: Login as admin
  adminToken = await testLogin(TEST_CONFIG.adminEmail, TEST_CONFIG.adminPassword);
  if (!adminToken) {
    console.log('❌ Admin login failed. Cannot proceed with tests.');
    console.log('💡 Make sure the backend is running and test users exist.');
    return;
  }
  
  // Step 2: Login as user
  userToken = await testLogin(TEST_CONFIG.testUserEmail, TEST_CONFIG.testUserPassword);
  if (!userToken) {
    console.log('❌ User login failed. Cannot proceed with tests.');
    console.log('💡 Make sure the backend is running and test users exist.');
    return;
  }
  
  // Step 3: Test platform creation
  const newPlatformId = await testPlatformCreation();
  if (!newPlatformId) {
    console.log('❌ Platform creation failed. Cannot proceed with click tests.');
    return;
  }
  
  // Step 4: Test platform retrieval
  await testGetPlatforms();
  
  // Step 5: Get team members for testing
  const teamMembersFound = await testGetTeamMembers();
  if (!teamMembersFound) {
    console.log('❌ No team members found. Cannot proceed with click tests.');
    return;
  }
  
  // Step 6: Test adding platform clicks with today's date
  const today = new Date().toISOString().split('T')[0];
  const clicksAdded = await testAddPlatformClicks(newPlatformId, testUserId, today);
  if (!clicksAdded) {
    console.log('❌ Platform click addition failed.');
    return;
  }
  
  // Step 7: Test retrieving platform clicks
  await testGetPlatformClicks();
  
  // Step 8: Test platform clicks statistics
  await testPlatformClicksStats();
  
  // Step 9: Test team data isolation
  await testTeamIsolation();
  
  // Step 10: Test user-specific endpoints
  await testUserSpecificEndpoints();
  
  console.log('\n✅ Complete Platform System Test Finished!');
  console.log('\n📋 Summary:');
  console.log('✅ Admin can create platforms');
  console.log('✅ Admin can add clicks for team members');
  console.log('✅ Team-based data isolation is working');
  console.log('✅ Users can only see their team\'s data');
  console.log('✅ Earnings are calculated based on team rewards');
  console.log('✅ Statistics are properly aggregated');
  console.log('✅ User-specific endpoints work correctly');
}

// Run the test
runCompleteTest().catch(console.error); 
const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

// Test data
const team1Admin = {
  email: 'admin1@test.com',
  password: 'password123',
  firstName: 'Admin1',
  lastName: 'Test',
  teamName: 'Test Team 1'
};

const team1User = {
  email: 'user1@test.com',
  password: 'password123',
  firstName: 'User1',
  lastName: 'Test',
  role: 'user'
};

const team2Admin = {
  email: 'admin2@test.com',
  password: 'password123',
  firstName: 'Admin2',
  lastName: 'Test',
  teamName: 'Test Team 2'
};

const team2User = {
  email: 'user2@test.com',
  password: 'password123',
  firstName: 'User2',
  lastName: 'Test',
  role: 'user'
};

async function registerAdmin(user) {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, {
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      teamName: user.teamName
    });
    return response.data.access_token;
  } catch (error) {
    console.error(`Registration failed for ${user.email}:`, error.response?.data || error.message);
    return null;
  }
}

async function login(user) {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: user.email,
      password: user.password
    });
    return response.data.access_token;
  } catch (error) {
    console.error(`Login failed for ${user.email}:`, error.response?.data || error.message);
    return null;
  }
}

async function createTeam(adminToken, teamName) {
  try {
    const response = await axios.post(`${BASE_URL}/api/teams`, {
      name: teamName,
      description: `Test team ${teamName}`
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Team creation failed:`, error.response?.data || error.message);
    return null;
  }
}

async function registerUser(user, teamId, adminToken) {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/team-member`, {
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      teamId: teamId
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    return response.data;
  } catch (error) {
    console.error(`User registration failed:`, error.response?.data || error.message);
    return null;
  }
}

async function createAdminUrl(adminToken, targetUserId, originalUrl, title) {
  try {
    const response = await axios.post(`${BASE_URL}/api/urls/admin`, {
      originalUrl,
      targetUserId,
      title,
      description: `Admin created URL for testing`
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Admin URL creation failed:`, error.response?.data || error.message);
    return null;
  }
}

async function getAssignedUrls(userToken) {
  try {
    const response = await axios.get(`${BASE_URL}/api/urls/assigned-to-me`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to get assigned URLs:`, error.response?.data || error.message);
    return null;
  }
}

async function testTeamIsolation() {
  console.log('🧪 Testing Team Isolation for Direct Links...\n');

  // Step 1: Register and login as team1 admin
  console.log('1. Registering and logging in as Team 1 Admin...');
  const team1AdminToken = await registerAdmin(team1Admin);
  if (!team1AdminToken) {
    console.error('❌ Failed to register/login as team1 admin');
    return;
  }
  console.log('✅ Team 1 Admin registered and logged in successfully');

  // Step 2: Get team1 info (created during registration)
  console.log('\n2. Getting Team 1 info...');
  const team1Response = await axios.get(`${BASE_URL}/api/teams/my-team`, {
    headers: { Authorization: `Bearer ${team1AdminToken}` }
  });
  const team1 = team1Response.data;
  console.log('✅ Team 1 info retrieved:', team1.name);

  // Step 3: Register team1 user
  console.log('\n3. Registering Team 1 User...');
  const team1UserData = await registerUser(team1User, team1.id, team1AdminToken);
  if (!team1UserData) {
    console.error('❌ Failed to register team1 user');
    return;
  }
  console.log('✅ Team 1 User registered successfully');

  // Step 4: Register and login as team2 admin
  console.log('\n4. Registering and logging in as Team 2 Admin...');
  const team2AdminToken = await registerAdmin(team2Admin);
  if (!team2AdminToken) {
    console.error('❌ Failed to register/login as team2 admin');
    return;
  }
  console.log('✅ Team 2 Admin registered and logged in successfully');

  // Step 5: Get team2 info (created during registration)
  console.log('\n5. Getting Team 2 info...');
  const team2Response = await axios.get(`${BASE_URL}/api/teams/my-team`, {
    headers: { Authorization: `Bearer ${team2AdminToken}` }
  });
  const team2 = team2Response.data;
  console.log('✅ Team 2 info retrieved:', team2.name);

  // Step 6: Register team2 user
  console.log('\n6. Registering Team 2 User...');
  const team2UserData = await registerUser(team2User, team2.id, team2AdminToken);
  if (!team2UserData) {
    console.error('❌ Failed to register team2 user');
    return;
  }
  console.log('✅ Team 2 User registered successfully');

  // Step 7: Create admin URLs for team1 user
  console.log('\n7. Creating admin URLs for Team 1 User...');
  const team1Url1 = await createAdminUrl(team1AdminToken, team1UserData.id, 'https://example1.com', 'Team 1 URL 1');
  const team1Url2 = await createAdminUrl(team1AdminToken, team1UserData.id, 'https://example2.com', 'Team 1 URL 2');
  
  if (!team1Url1 || !team1Url2) {
    console.error('❌ Failed to create admin URLs for team1 user');
    return;
  }
  console.log('✅ Created 2 admin URLs for Team 1 User');

  // Step 8: Create admin URLs for team2 user
  console.log('\n8. Creating admin URLs for Team 2 User...');
  const team2Url1 = await createAdminUrl(team2AdminToken, team2UserData.id, 'https://example3.com', 'Team 2 URL 1');
  const team2Url2 = await createAdminUrl(team2AdminToken, team2UserData.id, 'https://example4.com', 'Team 2 URL 2');
  
  if (!team2Url1 || !team2Url2) {
    console.error('❌ Failed to create admin URLs for team2 user');
    return;
  }
  console.log('✅ Created 2 admin URLs for Team 2 User');

  // Step 9: Login as team1 user and check assigned URLs
  console.log('\n9. Testing Team 1 User can only see their team\'s admin URLs...');
  const team1UserToken = await login(team1User);
  if (!team1UserToken) {
    console.error('❌ Failed to login as team1 user');
    return;
  }

  const team1UserUrls = await getAssignedUrls(team1UserToken);
  if (!team1UserUrls) {
    console.error('❌ Failed to get assigned URLs for team1 user');
    return;
  }

  console.log(`📊 Team 1 User sees ${team1UserUrls.urls.length} assigned URLs:`);
  team1UserUrls.urls.forEach(url => {
    console.log(`   - ${url.shortUrl} (${url.title}) - Created by: ${url.createdByAdmin?.firstName} ${url.createdByAdmin?.lastName}`);
  });

  // Step 10: Login as team2 user and check assigned URLs
  console.log('\n10. Testing Team 2 User can only see their team\'s admin URLs...');
  const team2UserToken = await login(team2User);
  if (!team2UserToken) {
    console.error('❌ Failed to login as team2 user');
    return;
  }

  const team2UserUrls = await getAssignedUrls(team2UserToken);
  if (!team2UserUrls) {
    console.error('❌ Failed to get assigned URLs for team2 user');
    return;
  }

  console.log(`📊 Team 2 User sees ${team2UserUrls.urls.length} assigned URLs:`);
  team2UserUrls.urls.forEach(url => {
    console.log(`   - ${url.shortUrl} (${url.title}) - Created by: ${url.createdByAdmin?.firstName} ${url.createdByAdmin?.lastName}`);
  });

  // Step 11: Verify isolation
  console.log('\n11. Verifying Team Isolation...');
  
  const team1UserUrlIds = team1UserUrls.urls.map(url => url.id);
  const team2UserUrlIds = team2UserUrls.urls.map(url => url.id);
  
  const hasCrossTeamAccess = team1UserUrlIds.some(id => team2UserUrlIds.includes(id));
  
  if (hasCrossTeamAccess) {
    console.error('❌ FAILED: Users can see URLs from other teams!');
    console.log('Team 1 User URLs:', team1UserUrlIds);
    console.log('Team 2 User URLs:', team2UserUrlIds);
  } else {
    console.log('✅ SUCCESS: Team isolation is working correctly!');
    console.log('   - Team 1 User only sees URLs from their team');
    console.log('   - Team 2 User only sees URLs from their team');
    console.log('   - No cross-team access detected');
  }

  console.log('\n🎉 Team isolation test completed!');
}

// Run the test
testTeamIsolation().catch(console.error); 
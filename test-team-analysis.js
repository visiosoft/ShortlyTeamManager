const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

// Test credentials
const adminCredentials = {
  email: 'khantoheedali@gmail.com',
  password: 'Digital@'
};

const userCredentials = {
  email: 'zulfiqar@gmail.com',
  password: 'Xulfi1234@'
};

async function login(credentials) {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: credentials.email,
      password: credentials.password
    });
    return response.data.access_token;
  } catch (error) {
    console.error(`Login failed for ${credentials.email}:`, error.response?.data || error.message);
    return null;
  }
}

async function getProfile(token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get profile:', error.response?.data || error.message);
    return null;
  }
}

async function getTeamInfo(token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/teams/my-team`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get team info:', error.response?.data || error.message);
    return null;
  }
}

async function getAssignedUrls(token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/urls/assigned-to-me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get assigned URLs:', error.response?.data || error.message);
    return null;
  }
}

async function analyzeTeamRelationships() {
  console.log('🔍 Analyzing Team Relationships...\n');

  // Step 1: Login as admin
  console.log('1. Logging in as admin...');
  const adminToken = await login(adminCredentials);
  if (!adminToken) {
    console.error('❌ Failed to login as admin');
    return;
  }

  // Step 2: Get admin profile and team
  console.log('\n2. Getting admin profile and team...');
  const adminProfile = await getProfile(adminToken);
  const adminTeam = await getTeamInfo(adminToken);
  if (!adminProfile || !adminTeam) {
    console.error('❌ Failed to get admin info');
    return;
  }
  console.log('✅ Admin:', adminProfile.email, 'User ID:', adminProfile.userId);
  console.log('✅ Admin Team:', adminTeam.name, 'Team ID:', adminTeam._id);

  // Step 3: Login as user
  console.log('\n3. Logging in as user...');
  const userToken = await login(userCredentials);
  if (!userToken) {
    console.error('❌ Failed to login as user');
    return;
  }

  // Step 4: Get user profile and team
  console.log('\n4. Getting user profile and team...');
  const userProfile = await getProfile(userToken);
  const userTeam = await getTeamInfo(userToken);
  if (!userProfile || !userTeam) {
    console.error('❌ Failed to get user info');
    return;
  }
  console.log('✅ User:', userProfile.email, 'User ID:', userProfile.userId);
  console.log('✅ User Team:', userTeam.name, 'Team ID:', userTeam._id);

  // Step 5: Check if they're in the same team
  console.log('\n5. Checking team relationship...');
  if (adminTeam._id === userTeam._id) {
    console.log('✅ Admin and user are in the SAME team');
  } else {
    console.log('❌ Admin and user are in DIFFERENT teams');
    console.log('   - Admin Team ID:', adminTeam._id);
    console.log('   - User Team ID:', userTeam._id);
  }

  // Step 6: Get assigned URLs and analyze
  console.log('\n6. Analyzing assigned URLs...');
  const assignedUrls = await getAssignedUrls(userToken);
  if (!assignedUrls) {
    console.error('❌ Failed to get assigned URLs');
    return;
  }

  console.log(`📊 Assigned URLs (${assignedUrls.urls.length} total):`);
  
  const urlsByCreator = {};
  assignedUrls.urls.forEach((url, index) => {
    const creatorId = url.createdByAdmin?.id || 'Unknown';
    const creatorName = url.createdByAdmin ? `${url.createdByAdmin.firstName} ${url.createdByAdmin.lastName}` : 'Unknown';
    
    if (!urlsByCreator[creatorId]) {
      urlsByCreator[creatorId] = {
        name: creatorName,
        count: 0,
        urls: []
      };
    }
    
    urlsByCreator[creatorId].count++;
    urlsByCreator[creatorId].urls.push(url);
    
    console.log(`   ${index + 1}. ${url.shortUrl} (${url.title || 'No title'}) - Created by: ${creatorName} (${creatorId})`);
  });

  // Step 7: Summary
  console.log('\n7. Summary:');
  console.log('📈 URLs by Creator:');
  Object.entries(urlsByCreator).forEach(([creatorId, data]) => {
    console.log(`   - ${data.name} (${creatorId}): ${data.count} URLs`);
  });

  // Check if any URLs are from different team admins
  const adminCreatorId = adminProfile.userId;
  const urlsFromAdmin = urlsByCreator[adminCreatorId] || { count: 0 };
  const urlsFromOthers = Object.entries(urlsByCreator)
    .filter(([creatorId]) => creatorId !== adminCreatorId)
    .reduce((sum, [, data]) => sum + data.count, 0);

  console.log(`\n📊 Analysis:`);
  console.log(`   - URLs from admin (${adminProfile.email}): ${urlsFromAdmin.count}`);
  console.log(`   - URLs from other admins: ${urlsFromOthers}`);
  console.log(`   - Total URLs: ${assignedUrls.urls.length}`);

  if (urlsFromOthers > 0) {
    console.log('❌ ISSUE: User has URLs from other team admins!');
    console.log('   - This should not happen - users should only see URLs from their own team admin');
  } else {
    console.log('✅ SUCCESS: User only has URLs from their team admin');
  }

  console.log('\n🎉 Team relationship analysis completed!');
}

// Run the analysis
analyzeTeamRelationships().catch(console.error); 
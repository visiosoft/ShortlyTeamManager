const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function testNewUserWithAdminUrls() {
  console.log('🧪 Testing New User - With Admin URLs...\n');

  // Step 1: Login as admin and check default URLs
  console.log('1. Logging in as admin...');
  const adminToken = await axios.post(`${BASE_URL}/api/auth/login`, {
    email: 'khantoheedali@gmail.com',
    password: 'Digital@'
  }).then(res => res.data.access_token);

  console.log('✅ Admin logged in');

  // Step 2: Get default URLs (admin view)
  console.log('\n2. Getting default URLs (admin view)...');
  const defaultUrls = await axios.get(`${BASE_URL}/api/urls/default`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  }).then(res => res.data);

  console.log(`📊 Default URLs (${defaultUrls.length} total):`);
  defaultUrls.forEach((url, index) => {
    console.log(`   ${index + 1}. ${url.shortUrl} (${url.title || 'No title'})`);
  });

  // Step 3: Register a new user
  console.log('\n3. Registering new user...');
  const newUserEmail = `testuser${Date.now()}@example.com`;
  
  try {
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      email: newUserEmail,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      teamName: 'Test Team'
    });
    
    console.log('✅ New user registered successfully');
    const newUserToken = registerResponse.data.access_token;
    
    // Step 4: Get new user profile
    console.log('\n4. Getting new user profile...');
    const userProfile = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${newUserToken}` }
    }).then(res => res.data);
    
    console.log('✅ User profile:', userProfile.email, 'Team ID:', userProfile.teamId, 'Role:', userProfile.role);
    
    // Step 5: Get assigned URLs for new user
    console.log('\n5. Getting assigned URLs for new user...');
    const assignedUrls = await axios.get(`${BASE_URL}/api/urls/assigned-to-me`, {
      headers: { Authorization: `Bearer ${newUserToken}` }
    }).then(res => res.data);
    
    console.log(`📊 Assigned URLs for new user (${assignedUrls.urls.length} total):`);
    assignedUrls.urls.forEach((url, index) => {
      const creatorName = url.createdByAdmin ? `${url.createdByAdmin.firstName} ${url.createdByAdmin.lastName}` : 'Unknown';
      console.log(`   ${index + 1}. ${url.shortUrl} (${url.title || 'No title'}) - Created by: ${creatorName}`);
    });
    
    // Step 6: Get user's own URLs
    console.log('\n6. Getting user\'s own URLs...');
    const userUrls = await axios.get(`${BASE_URL}/api/urls/my-urls`, {
      headers: { Authorization: `Bearer ${newUserToken}` }
    }).then(res => res.data);
    
    console.log(`📊 User's own URLs (${userUrls.urls.length} total):`);
    userUrls.urls.forEach((url, index) => {
      console.log(`   ${index + 1}. ${url.shortUrl} (${url.title || 'No title'})`);
    });
    
    // Step 7: Analyze the results
    console.log('\n7. Analyzing results...');
    console.log(`📈 Analysis:`);
    console.log(`   - Default URLs in admin team: ${defaultUrls.length}`);
    console.log(`   - URLs assigned to new user: ${assignedUrls.urls.length}`);
    console.log(`   - User's own URLs: ${userUrls.urls.length}`);
    console.log(`   - New user team ID: ${userProfile.teamId}`);
    console.log(`   - New user role: ${userProfile.role}`);
    
    if (assignedUrls.urls.length === defaultUrls.length) {
      console.log('✅ SUCCESS: New user got all admin default URLs!');
    } else {
      console.log('❌ ISSUE: New user did not get all admin default URLs');
      console.log(`   - Expected: ${defaultUrls.length} URLs`);
      console.log(`   - Actual: ${assignedUrls.urls.length} URLs`);
    }
    
    // Step 8: Verify team membership
    console.log('\n8. Verifying team membership...');
    const adminTeamId = '6872137b3bd64eb1d84237d1'; // Admin's team ID
    const userTeamId = userProfile.teamId;
    
    if (userTeamId === adminTeamId) {
      console.log('✅ SUCCESS: New user is in admin team (correct)');
    } else {
      console.log('❌ ISSUE: New user is not in admin team');
      console.log(`   - Expected team: ${adminTeamId}`);
      console.log(`   - Actual team: ${userTeamId}`);
    }
    
  } catch (error) {
    console.error('❌ Failed to register new user:', error.response?.data || error.message);
  }

  console.log('\n🎉 New user with admin URLs test completed!');
}

testNewUserWithAdminUrls().catch(console.error); 
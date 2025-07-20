const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function testNewUserAssignment() {
  console.log('🧪 Testing New User Assignment...\n');

  // Step 1: Login as admin
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
    console.log(`   ${index + 1}. ${url.shortUrl} (${url.title || 'No title'}) - Template: ${url.isTemplate || false}`);
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
    
    console.log('✅ User profile:', userProfile.email, 'Team ID:', userProfile.teamId);
    
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
    
    // Step 6: Analyze the assignment
    console.log('\n6. Analyzing assignment...');
    console.log(`📈 Analysis:`);
    console.log(`   - Default URLs available: ${defaultUrls.length}`);
    console.log(`   - URLs assigned to new user: ${assignedUrls.urls.length}`);
    
    if (assignedUrls.urls.length === defaultUrls.length) {
      console.log('✅ SUCCESS: All default URLs were assigned to new user');
    } else {
      console.log('❌ ISSUE: Not all default URLs were assigned to new user');
      console.log(`   - Expected: ${defaultUrls.length} URLs`);
      console.log(`   - Actual: ${assignedUrls.urls.length} URLs`);
      console.log(`   - Missing: ${defaultUrls.length - assignedUrls.urls.length} URLs`);
    }
    
  } catch (error) {
    console.error('❌ Failed to register new user:', error.response?.data || error.message);
  }

  console.log('\n🎉 New user assignment test completed!');
}

testNewUserAssignment().catch(console.error); 
const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testRegistrationLogs() {
  try {
    console.log('🔍 Testing Registration with Logs...\n');

    // Step 1: Create a new test user
    console.log('1. Creating new test user...');
    const newUserEmail = `logtest${Date.now()}@example.com`;
    const newUserPassword = 'TestPass123!';
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      firstName: 'Log',
      lastName: 'Test',
      email: newUserEmail,
      password: newUserPassword,
      teamName: 'Log Test Team'
    });

    console.log('✅ New user created:', newUserEmail);
    console.log('User ID:', registerResponse.data.user.id);
    console.log('Team ID:', registerResponse.data.user.teamId);

    // Step 2: Login as the new user
    console.log('\n2. Logging in as new user...');
    const userLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: newUserEmail,
      password: newUserPassword
    });

    const userToken = userLoginResponse.data.access_token;
    const newUser = userLoginResponse.data.user;
    console.log('✅ New user login successful');

    // Step 3: Check user's assigned URLs
    console.log('\n3. Checking user\'s assigned URLs...');
    const assignedUrlsResponse = await axios.get(`${BASE_URL}/urls/assigned-to-me`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    console.log('✅ Assigned URLs response received');
    console.log('Total assigned URLs:', assignedUrlsResponse.data.urls.length);
    
    if (assignedUrlsResponse.data.urls.length > 0) {
      console.log('\n📋 Assigned URLs:');
      assignedUrlsResponse.data.urls.forEach((url, index) => {
        console.log(`  ${index + 1}. ${url.shortCode} -> ${url.originalUrl}`);
        console.log(`     Type: ${url.isAdminCreated ? 'Admin Created' : 'User Created'}`);
      });
    } else {
      console.log('❌ No URLs assigned to new user!');
    }

    console.log('\n🎉 Test completed!');
    console.log('Check the backend logs for assignment details...');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testRegistrationLogs(); 
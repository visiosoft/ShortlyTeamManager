const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testRegistrationDebug() {
  try {
    console.log('🔍 Debugging Registration Process...\n');

    // Step 1: Create a new test user
    console.log('1. Creating new test user...');
    const newUserEmail = `testdebug${Date.now()}@example.com`;
    const newUserPassword = 'TestPass123!';
    
    console.log('Sending registration request...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      firstName: 'Test',
      lastName: 'Debug',
      email: newUserEmail,
      password: newUserPassword,
      teamName: 'Debug Team'
    });

    console.log('✅ Registration response received');
    console.log('User ID:', registerResponse.data.user.id);
    console.log('Team ID:', registerResponse.data.user.teamId);
    console.log('Access Token:', registerResponse.data.access_token ? 'Present' : 'Missing');

    // Step 2: Wait a moment for any background processing
    console.log('\n2. Waiting for background processing...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Login as the new user
    console.log('\n3. Logging in as new user...');
    const userLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: newUserEmail,
      password: newUserPassword
    });

    const userToken = userLoginResponse.data.access_token;
    const newUser = userLoginResponse.data.user;
    console.log('✅ New user login successful');
    console.log('User ID:', newUser.id);
    console.log('Team ID:', newUser.teamId);

    // Step 4: Check assigned URLs
    console.log('\n4. Checking assigned URLs...');
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

    // Step 5: Check if the user can create their own URLs
    console.log('\n5. Testing user URL creation...');
    try {
      const createUrlResponse = await axios.post(`${BASE_URL}/urls`, {
        originalUrl: 'https://user-created-url.com',
        title: 'User Created URL',
        description: 'URL created by user for testing'
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      console.log('✅ User URL creation successful');
      console.log('Created URL:', createUrlResponse.data.shortCode);
    } catch (error) {
      console.error('❌ User URL creation failed:', error.response?.data || error.message);
    }

    console.log('\n🎉 Registration debug test completed!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testRegistrationDebug(); 
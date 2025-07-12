const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testAssignmentDebug() {
  try {
    console.log('🔍 Debugging Default URL Assignment...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'zulfiqar@yahoo.com',
      password: 'Xulfi1234@'
    });

    const adminToken = adminLoginResponse.data.access_token;
    console.log('✅ Admin login successful');

    // Step 2: Check default URLs as admin
    console.log('\n2. Checking default URLs...');
    const defaultUrlsResponse = await axios.get(`${BASE_URL}/urls/default`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ Default URLs retrieved:', defaultUrlsResponse.data.length);
    console.log('\n📋 Default URLs:');
    defaultUrlsResponse.data.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url.shortCode} -> ${url.originalUrl}`);
      console.log(`     Team ID: ${url.teamId}`);
      console.log(`     Is Template: ${url.isTemplate}`);
      console.log(`     Is Admin Created: ${url.isAdminCreated}`);
      console.log('');
    });

    // Step 3: Create a new test user
    console.log('\n3. Creating new test user...');
    const newUserEmail = `testdebug${Date.now()}@example.com`;
    const newUserPassword = 'TestPass123!';
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      firstName: 'Test',
      lastName: 'Debug',
      email: newUserEmail,
      password: newUserPassword,
      teamName: 'Debug Team'
    });

    console.log('✅ New user created:', newUserEmail);
    console.log('Registration response teamId:', registerResponse.data.user.teamId);

    // Step 4: Login as the new user
    console.log('\n4. Logging in as new user...');
    const userLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: newUserEmail,
      password: newUserPassword
    });

    const userToken = userLoginResponse.data.access_token;
    const newUser = userLoginResponse.data.user;
    console.log('✅ New user login successful');
    console.log('User ID:', newUser.id);
    console.log('Team ID:', newUser.teamId);

    // Step 5: Check assigned URLs
    console.log('\n5. Checking assigned URLs...');
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

    console.log('\n🎉 Debug test completed!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAssignmentDebug(); 
const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testDirectAssignment() {
  try {
    console.log('🔍 Testing Direct Assignment Function...\n');

    // Step 1: Create a new test user
    console.log('1. Creating new test user...');
    const newUserEmail = `testdirect${Date.now()}@example.com`;
    const newUserPassword = 'TestPass123!';
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      firstName: 'Test',
      lastName: 'Direct',
      email: newUserEmail,
      password: newUserPassword,
      teamName: 'Direct Test Team'
    });

    console.log('✅ New user created:', newUserEmail);
    console.log('Registration response teamId:', registerResponse.data.user.teamId);
    console.log('Registration response userId:', registerResponse.data.user.id);

    // Step 2: Login as admin to check default URLs
    console.log('\n2. Logging in as admin...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'zulfiqar@yahoo.com',
      password: 'Xulfi1234@'
    });

    const adminToken = adminLoginResponse.data.access_token;
    console.log('✅ Admin login successful');

    // Step 3: Check default URLs
    console.log('\n3. Checking default URLs...');
    const defaultUrlsResponse = await axios.get(`${BASE_URL}/urls/default`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ Default URLs retrieved:', defaultUrlsResponse.data.length);
    
    if (defaultUrlsResponse.data.length > 0) {
      console.log('\n📋 First Default URL:');
      console.log('Short Code:', defaultUrlsResponse.data[0].shortCode);
      console.log('Original URL:', defaultUrlsResponse.data[0].originalUrl);
      console.log('Team ID:', defaultUrlsResponse.data[0].teamId);
      console.log('Is Admin Created:', defaultUrlsResponse.data[0].isAdminCreated);
      console.log('Is Template:', defaultUrlsResponse.data[0].isTemplate);
    }

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

    console.log('\n🎉 Direct assignment test completed!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testDirectAssignment(); 
const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function checkTemplateStructure() {
  try {
    console.log('🔍 Checking Template URL Structure...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'zulfiqar@yahoo.com',
      password: 'Xulfi1234@'
    });

    const adminToken = adminLoginResponse.data.access_token;
    console.log('✅ Admin login successful');

    // Step 2: Get all default URLs
    console.log('\n2. Getting all default URLs...');
    const defaultUrlsResponse = await axios.get(`${BASE_URL}/urls/default`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ Default URLs retrieved:', defaultUrlsResponse.data.length);
    
    if (defaultUrlsResponse.data.length > 0) {
      console.log('\n📋 Template URL Structure:');
      defaultUrlsResponse.data.forEach((url, index) => {
        console.log(`  ${index + 1}. ${url.shortCode} -> ${url.originalUrl}`);
        console.log(`     Team ID: ${url.teamId}`);
        console.log(`     Is Admin Created: ${url.isAdminCreated}`);
        console.log(`     Is Template: ${url.isTemplate}`);
        console.log(`     User ID: ${url.userId}`);
        console.log('');
      });
    }

    // Step 3: Create a new test user
    console.log('\n3. Creating new test user...');
    const newUserEmail = `teststruct${Date.now()}@example.com`;
    const newUserPassword = 'TestPass123!';
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      firstName: 'Test',
      lastName: 'Struct',
      email: newUserEmail,
      password: newUserPassword,
      teamName: 'Struct Test Team'
    });

    console.log('✅ New user created:', newUserEmail);
    console.log('User ID:', registerResponse.data.user.id);
    console.log('Team ID:', registerResponse.data.user.teamId);

    // Step 4: Login as the new user
    console.log('\n4. Logging in as new user...');
    const userLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: newUserEmail,
      password: newUserPassword
    });

    const userToken = userLoginResponse.data.access_token;
    const newUser = userLoginResponse.data.user;
    console.log('✅ New user login successful');

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

    console.log('\n🎉 Template structure check completed!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkTemplateStructure(); 
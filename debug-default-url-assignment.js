const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function debugDefaultUrlAssignment() {
  try {
    console.log('🔍 Debugging Default URL Assignment...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'zulfiqar@yahoo.com',
      password: 'Xulfi1234@'
    });

    const adminToken = adminLoginResponse.data.access_token;
    const adminUser = adminLoginResponse.data.user;
    console.log('✅ Admin login successful');
    console.log('Admin Team ID:', adminUser.teamId);

    // Step 2: Check existing default URLs
    console.log('\n2. Checking existing default URLs...');
    const defaultUrlsResponse = await axios.get(`${BASE_URL}/urls/default`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ Default URLs retrieved:', defaultUrlsResponse.data.length);
    
    if (defaultUrlsResponse.data.length > 0) {
      console.log('\n📋 Default URLs Details:');
      defaultUrlsResponse.data.forEach((url, index) => {
        console.log(`  ${index + 1}. ${url.shortCode} -> ${url.originalUrl}`);
        console.log(`     Team ID: ${url.teamId}`);
        console.log(`     Is Template: ${url.isTemplate}`);
        console.log(`     Is Admin Created: ${url.isAdminCreated}`);
        console.log(`     User ID: ${url.userId}`);
        console.log('');
      });
    }

    // Step 3: Create a new test user
    console.log('\n3. Creating new test user...');
    const newUserEmail = `debugtest${Date.now()}@example.com`;
    const newUserPassword = 'TestPass123!';
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      firstName: 'Debug',
      lastName: 'Test',
      email: newUserEmail,
      password: newUserPassword,
      teamName: 'Debug Test Team'
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

    // Step 5: Check user's assigned URLs
    console.log('\n5. Checking user\'s assigned URLs...');
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

    // Step 6: Manually test the assignment logic
    console.log('\n6. Testing manual assignment...');
    try {
      const manualAssignmentResponse = await axios.post(`${BASE_URL}/urls/assign-default-urls`, {
        userId: newUser.id,
        teamId: newUser.teamId
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      console.log('✅ Manual assignment response:', manualAssignmentResponse.data);
    } catch (error) {
      console.error('❌ Manual assignment failed:', error.response?.data || error.message);
    }

    // Step 7: Check again after manual assignment
    console.log('\n7. Checking URLs after manual assignment...');
    const assignedUrlsResponse2 = await axios.get(`${BASE_URL}/urls/assigned-to-me`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    console.log('✅ Assigned URLs after manual assignment:', assignedUrlsResponse2.data.urls.length);

    console.log('\n🎉 Debug completed!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugDefaultUrlAssignment(); 
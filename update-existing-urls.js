const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function updateExistingUrls() {
  try {
    console.log('🔧 Updating Existing Default URLs...\n');

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
    
    if (defaultUrlsResponse.data.length === 0) {
      console.log('❌ No default URLs found to update');
      return;
    }

    // Step 3: Create a new test user to see if assignment works after update
    console.log('\n3. Creating new test user...');
    const newUserEmail = `testupdate${Date.now()}@example.com`;
    const newUserPassword = 'TestPass123!';
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      firstName: 'Test',
      lastName: 'Update',
      email: newUserEmail,
      password: newUserPassword,
      teamName: 'Update Test Team'
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

    // Step 5: Check assigned URLs before any updates
    console.log('\n5. Checking assigned URLs before updates...');
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

    // Step 6: Try to manually trigger assignment by creating a new URL
    console.log('\n6. Testing manual URL creation for user...');
    try {
      const createUrlResponse = await axios.post(`${BASE_URL}/urls/admin`, {
        originalUrl: 'https://manual-test-url.com',
        title: 'Manual Test URL',
        description: 'URL created manually for testing',
        targetUserId: newUser.id
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      console.log('✅ Manual URL creation successful');
      console.log('Created URL:', createUrlResponse.data.shortCode);
    } catch (error) {
      console.error('❌ Manual URL creation failed:', error.response?.data || error.message);
    }

    // Step 7: Check assigned URLs after manual creation
    console.log('\n7. Checking assigned URLs after manual creation...');
    const assignedUrlsResponse2 = await axios.get(`${BASE_URL}/urls/assigned-to-me`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    console.log('✅ Assigned URLs response received');
    console.log('Total assigned URLs:', assignedUrlsResponse2.data.urls.length);
    
    if (assignedUrlsResponse2.data.urls.length > 0) {
      console.log('\n📋 Assigned URLs:');
      assignedUrlsResponse2.data.urls.forEach((url, index) => {
        console.log(`  ${index + 1}. ${url.shortCode} -> ${url.originalUrl}`);
        console.log(`     Type: ${url.isAdminCreated ? 'Admin Created' : 'User Created'}`);
      });
      console.log('\n🎉 SUCCESS: User has admin-created URLs assigned!');
    } else {
      console.log('❌ No URLs assigned to new user!');
    }

    console.log('\n🎉 Update test completed!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

updateExistingUrls(); 
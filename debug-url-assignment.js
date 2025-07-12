const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function debugUrlAssignment() {
  try {
    console.log('🔍 Debugging URL Assignment Process...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'zulfiqar@yahoo.com',
      password: 'Xulfi1234@'
    });

    const adminToken = adminLoginResponse.data.access_token;
    console.log('✅ Admin login successful');

    // Step 2: Create a new test user
    console.log('\n2. Creating new test user...');
    const newUserEmail = `testdebug${Date.now()}@example.com`;
    const newUserPassword = 'TestPass123!';
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      firstName: 'Test',
      lastName: 'Debug',
      email: newUserEmail,
      password: newUserPassword,
      teamName: 'Debug Test Team'
    });

    console.log('✅ New user created:', newUserEmail);
    console.log('User ID:', registerResponse.data.user.id);
    console.log('Team ID:', registerResponse.data.user.teamId);

    // Step 3: Login as the new user
    console.log('\n3. Logging in as new user...');
    const userLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: newUserEmail,
      password: newUserPassword
    });

    const userToken = userLoginResponse.data.access_token;
    const newUser = userLoginResponse.data.user;
    console.log('✅ New user login successful');

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

    // Step 5: Check all URLs for this user (including user-created ones)
    console.log('\n5. Checking all URLs for this user...');
    const allUrlsResponse = await axios.get(`${BASE_URL}/urls/my-urls?page=1&limit=50`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    console.log('✅ All URLs response received');
    console.log('Total URLs:', allUrlsResponse.data.urls.length);
    
    if (allUrlsResponse.data.urls.length > 0) {
      console.log('\n📋 All URLs:');
      allUrlsResponse.data.urls.forEach((url, index) => {
        console.log(`  ${index + 1}. ${url.shortCode} -> ${url.originalUrl}`);
        console.log(`     Type: ${url.isAdminCreated ? 'Admin Created' : 'User Created'}`);
        console.log(`     User ID: ${url.userId}`);
        console.log(`     Team ID: ${url.teamId}`);
      });
    } else {
      console.log('❌ No URLs found for user!');
    }

    // Step 6: Try to create a URL manually for this user
    console.log('\n6. Creating URL manually for user...');
    try {
      const createUrlResponse = await axios.post(`${BASE_URL}/urls/admin`, {
        originalUrl: 'https://debug-test-url.com',
        title: 'Debug Test URL',
        description: 'URL created for debugging',
        targetUserId: newUser.id
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      console.log('✅ Manual URL creation successful');
      console.log('Created URL:', createUrlResponse.data.shortCode);
      console.log('Created URL User ID:', createUrlResponse.data.userId);
      console.log('Created URL Team ID:', createUrlResponse.data.teamId);
    } catch (error) {
      console.error('❌ Manual URL creation failed:', error.response?.data || error.message);
    }

    // Step 7: Check assigned URLs again after manual creation
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
    } else {
      console.log('❌ No URLs assigned to new user!');
    }

    // Step 8: Check all URLs again
    console.log('\n8. Checking all URLs again...');
    const allUrlsResponse2 = await axios.get(`${BASE_URL}/urls/my-urls?page=1&limit=50`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    console.log('✅ All URLs response received');
    console.log('Total URLs:', allUrlsResponse2.data.urls.length);
    
    if (allUrlsResponse2.data.urls.length > 0) {
      console.log('\n📋 All URLs:');
      allUrlsResponse2.data.urls.forEach((url, index) => {
        console.log(`  ${index + 1}. ${url.shortCode} -> ${url.originalUrl}`);
        console.log(`     Type: ${url.isAdminCreated ? 'Admin Created' : 'User Created'}`);
        console.log(`     User ID: ${url.userId}`);
        console.log(`     Team ID: ${url.teamId}`);
      });
    } else {
      console.log('❌ No URLs found for user!');
    }

    console.log('\n🎉 Debug completed!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugUrlAssignment(); 
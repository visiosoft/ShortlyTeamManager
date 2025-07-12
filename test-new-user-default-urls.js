const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testNewUserDefaultUrls() {
  try {
    console.log('🔍 Testing New User Default URL Assignment...\n');

    // Step 1: Login as admin to create default URLs
    console.log('1. Logging in as admin...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'zulfiqar@yahoo.com',
      password: 'Xulfi1234@'
    });

    const adminToken = adminLoginResponse.data.access_token;
    console.log('✅ Admin login successful');

    // Step 2: Create a new default URL
    console.log('\n2. Creating new default URL...');
    const createDefaultUrlResponse = await axios.post(`${BASE_URL}/urls/default`, {
      originalUrl: 'https://test-default-url.com',
      title: 'Test Default URL',
      description: 'Test URL for new user verification'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ New default URL created');

    // Step 3: Create a new test user
    console.log('\n3. Creating new test user...');
    const newUserEmail = `testuser${Date.now()}@example.com`;
    const newUserPassword = 'TestPass123!';
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      firstName: 'Test',
      lastName: 'User',
      email: newUserEmail,
      password: newUserPassword,
      teamName: 'Test Team'
    });

    console.log('✅ New user created:', newUserEmail);

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

    // Step 5: Check if new user has assigned URLs
    console.log('\n5. Checking assigned URLs for new user...');
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
        console.log(`     Created: ${new Date(url.createdAt).toLocaleDateString()}`);
        if (url.createdByAdmin) {
          console.log(`     Created by: ${url.createdByAdmin.firstName} ${url.createdByAdmin.lastName}`);
        }
        console.log('');
      });
    } else {
      console.log('❌ No URLs assigned to new user!');
    }

    // Step 6: Check default URLs as admin
    console.log('\n6. Checking default URLs as admin...');
    const defaultUrlsResponse = await axios.get(`${BASE_URL}/urls/default`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ Default URLs retrieved:', defaultUrlsResponse.data.length);
    console.log('\n📋 Default URLs:');
    defaultUrlsResponse.data.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url.shortCode} -> ${url.originalUrl}`);
    });

    // Step 7: Check if new user can access direct-links page data
    console.log('\n7. Testing direct-links page data access...');
    try {
      const directLinksResponse = await axios.get(`${BASE_URL}/urls/assigned-to-me`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      
      console.log('✅ Direct-links data accessible');
      console.log('URLs count:', directLinksResponse.data.urls.length);
      
      // Check if any are admin-created (default URLs)
      const adminCreatedUrls = directLinksResponse.data.urls.filter(url => url.isAdminCreated);
      console.log('Admin-created URLs:', adminCreatedUrls.length);
      
      if (adminCreatedUrls.length === 0) {
        console.log('❌ ISSUE: New user has no admin-created URLs assigned!');
        console.log('This means default URLs are not being assigned to new users.');
      } else {
        console.log('✅ SUCCESS: New user has admin-created URLs assigned!');
      }
      
    } catch (error) {
      console.error('❌ Error accessing direct-links data:', error.response?.data || error.message);
    }

    console.log('\n🎉 Test completed!');
    console.log('\n📊 Summary:');
    console.log(`- New user created: ${newUserEmail}`);
    console.log(`- Default URLs available: ${defaultUrlsResponse.data.length}`);
    console.log(`- URLs assigned to new user: ${assignedUrlsResponse.data.urls.length}`);
    console.log(`- Admin-created URLs assigned: ${assignedUrlsResponse.data.urls.filter(url => url.isAdminCreated).length}`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testNewUserDefaultUrls(); 
const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testMultipleDefaultUrls() {
  try {
    console.log('🔍 Testing Multiple Default URLs functionality...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'zulfiqar@yahoo.com',
      password: 'Xulfi1234@'
    });

    const adminToken = adminLoginResponse.data.access_token;
    console.log('✅ Admin login successful');

    // Step 2: Create multiple default URLs
    console.log('\n2. Creating multiple default URLs...');
    const defaultUrls = [
      {
        originalUrl: 'https://google.com',
        title: 'Google Search',
        description: 'Default Google search URL for new users'
      },
      {
        originalUrl: 'https://youtube.com',
        title: 'YouTube',
        description: 'Default YouTube URL for new users'
      },
      {
        originalUrl: 'https://facebook.com',
        title: 'Facebook',
        description: 'Default Facebook URL for new users'
      }
    ];

    for (const urlData of defaultUrls) {
      try {
        const response = await axios.post(`${BASE_URL}/urls/default`, urlData, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log(`✅ Created default URL: ${urlData.title} -> ${urlData.originalUrl}`);
      } catch (error) {
        console.error(`❌ Failed to create default URL ${urlData.title}:`, error.response?.data || error.message);
      }
    }

    // Step 3: Get all default URLs
    console.log('\n3. Getting all default URLs...');
    const getDefaultUrlsResponse = await axios.get(`${BASE_URL}/urls/default`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ Default URLs retrieved:', getDefaultUrlsResponse.data.length);
    getDefaultUrlsResponse.data.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url.shortCode} -> ${url.originalUrl}`);
    });

    // Step 4: Create a new test user
    console.log('\n4. Creating new test user...');
    const newUserEmail = `testmultiple${Date.now()}@example.com`;
    const newUserPassword = 'TestPass123!';
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      firstName: 'Test',
      lastName: 'Multiple',
      email: newUserEmail,
      password: newUserPassword,
      teamName: 'Multiple Test Team'
    });

    console.log('✅ New user created:', newUserEmail);
    console.log('User ID:', registerResponse.data.user.id);
    console.log('Team ID:', registerResponse.data.user.teamId);

    // Step 5: Login as the new user
    console.log('\n5. Logging in as new user...');
    const userLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: newUserEmail,
      password: newUserPassword
    });

    const userToken = userLoginResponse.data.access_token;
    const newUser = userLoginResponse.data.user;
    console.log('✅ New user login successful');

    // Step 6: Check user's assigned URLs (should include all default URLs)
    console.log('\n6. Checking user\'s assigned URLs...');
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

    // Step 7: Check user's my-urls endpoint (should also include admin-assigned URLs)
    console.log('\n7. Checking user\'s my-urls endpoint...');
    const myUrlsResponse = await axios.get(`${BASE_URL}/urls/my-urls`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    console.log('✅ My URLs response received');
    console.log('Total my URLs:', myUrlsResponse.data.urls.length);
    
    if (myUrlsResponse.data.urls.length > 0) {
      console.log('\n📋 My URLs:');
      myUrlsResponse.data.urls.forEach((url, index) => {
        console.log(`  ${index + 1}. ${url.shortCode} -> ${url.originalUrl}`);
        console.log(`     Type: ${url.isAdminCreated ? 'Admin Created' : 'User Created'}`);
      });
    } else {
      console.log('❌ No URLs found in my-urls!');
    }

    // Step 8: Verify the counts match
    console.log('\n8. Verifying URL counts...');
    const assignedCount = assignedUrlsResponse.data.urls.length;
    const myUrlsCount = myUrlsResponse.data.urls.length;
    const adminCreatedCount = assignedUrlsResponse.data.urls.filter(url => url.isAdminCreated).length;
    
    console.log(`📊 Summary:`);
    console.log(`- Assigned URLs: ${assignedCount}`);
    console.log(`- My URLs: ${myUrlsCount}`);
    console.log(`- Admin-created URLs: ${adminCreatedCount}`);
    
    if (adminCreatedCount >= 3) {
      console.log('✅ SUCCESS: User has multiple admin-assigned default URLs!');
    } else {
      console.log('❌ ISSUE: User does not have multiple admin-assigned URLs');
    }

    console.log('\n🎉 Test completed!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testMultipleDefaultUrls(); 
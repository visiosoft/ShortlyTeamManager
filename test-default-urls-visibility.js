const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testDefaultUrlsVisibility() {
  try {
    console.log('🔍 Testing Default URLs Visibility for Users...\n');

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

    // Step 2: Create some default URLs as admin
    console.log('\n2. Creating default URLs as admin...');
    const defaultUrls = [
      {
        originalUrl: 'https://google.com',
        title: 'Google Search',
        description: 'Default Google search URL'
      },
      {
        originalUrl: 'https://facebook.com',
        title: 'Facebook',
        description: 'Default Facebook URL'
      },
      {
        originalUrl: 'https://youtube.com',
        title: 'YouTube',
        description: 'Default YouTube URL'
      }
    ];

    for (const urlData of defaultUrls) {
      try {
        const createResponse = await axios.post(`${BASE_URL}/urls/default`, urlData, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log(`✅ Created default URL: ${urlData.title}`);
      } catch (error) {
        console.log(`⚠️  URL ${urlData.title} might already exist:`, error.response?.data?.message || error.message);
      }
    }

    // Step 3: Get default URLs as admin
    console.log('\n3. Getting default URLs as admin...');
    const defaultUrlsResponse = await axios.get(`${BASE_URL}/urls/default`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ Default URLs retrieved:', defaultUrlsResponse.data.length);
    defaultUrlsResponse.data.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url.shortCode} -> ${url.originalUrl} (${url.title})`);
    });

    // Step 4: Create a new user
    console.log('\n4. Creating a new test user...');
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

    // Step 6: Check user's assigned URLs (should now include all default URLs)
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
        console.log(`     Title: ${url.title}`);
        console.log(`     Type: ${url.isAdminCreated ? 'Admin Created' : 'User Created'}`);
        console.log(`     User ID: ${url.userId || 'Template (no specific user)'}`);
        console.log('');
      });
    } else {
      console.log('❌ No URLs assigned to new user!');
    }

    // Step 7: Check user's my-urls endpoint (should also include default URLs)
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
        console.log(`     Title: ${url.title}`);
        console.log(`     Type: ${url.isAdminCreated ? 'Admin Created' : 'User Created'}`);
        console.log(`     User ID: ${url.userId || 'Template (no specific user)'}`);
        console.log('');
      });
    } else {
      console.log('❌ No URLs found in my-urls!');
    }

    // Step 8: Summary
    console.log('\n8. Summary:');
    const assignedCount = assignedUrlsResponse.data.urls.length;
    const myUrlsCount = myUrlsResponse.data.urls.length;
    const adminCreatedCount = assignedUrlsResponse.data.urls.filter(url => url.isAdminCreated).length;
    const templateCount = assignedUrlsResponse.data.urls.filter(url => !url.userId).length;
    
    console.log(`📊 Summary:`);
    console.log(`- Assigned URLs: ${assignedCount}`);
    console.log(`- My URLs: ${myUrlsCount}`);
    console.log(`- Admin-created URLs: ${adminCreatedCount}`);
    console.log(`- Template URLs (no specific user): ${templateCount}`);
    
    if (assignedCount > 0 && templateCount > 0) {
      console.log('\n🎉 SUCCESS: User can now see all default URLs for their team!');
    } else {
      console.log('\n❌ ISSUE: User cannot see all default URLs');
    }

    console.log('\n🎉 Test completed!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testDefaultUrlsVisibility(); 
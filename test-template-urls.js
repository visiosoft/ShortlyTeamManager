const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testTemplateUrls() {
  try {
    console.log('🔍 Testing Template URLs in Database...\n');

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

    // Step 2: Get default URLs as admin
    console.log('\n2. Getting default URLs as admin...');
    const defaultUrlsResponse = await axios.get(`${BASE_URL}/urls/default`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ Default URLs retrieved:', defaultUrlsResponse.data.length);
    console.log('\n📋 Default URLs (Templates):');
    defaultUrlsResponse.data.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url.shortCode} -> ${url.originalUrl}`);
      console.log(`     Title: ${url.title}`);
      console.log(`     User ID: ${url.userId || 'NULL (Template)'}`);
      console.log(`     Is Admin Created: ${url.isAdminCreated}`);
      console.log('');
    });

    // Step 3: Create a new user
    console.log('\n3. Creating a new test user...');
    const newUserEmail = `templateuser${Date.now()}@example.com`;
    const newUserPassword = 'TestPass123!';
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      firstName: 'Template',
      lastName: 'User',
      email: newUserEmail,
      password: newUserPassword,
      teamName: 'Template Test Team'
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
        console.log(`     Title: ${url.title}`);
        console.log(`     User ID: ${url.userId || 'NULL (Template)'}`);
        console.log(`     Type: ${url.isAdminCreated ? 'Admin Created' : 'User Created'}`);
        console.log('');
      });
    } else {
      console.log('❌ No URLs assigned to new user!');
    }

    // Step 6: Check user's my-urls endpoint
    console.log('\n6. Checking user\'s my-urls endpoint...');
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
        console.log(`     User ID: ${url.userId || 'NULL (Template)'}`);
        console.log(`     Type: ${url.isAdminCreated ? 'Admin Created' : 'User Created'}`);
        console.log('');
      });
    } else {
      console.log('❌ No URLs found in my-urls!');
    }

    // Step 7: Summary
    console.log('\n7. Summary:');
    const assignedCount = assignedUrlsResponse.data.urls.length;
    const myUrlsCount = myUrlsResponse.data.urls.length;
    const adminCreatedCount = assignedUrlsResponse.data.urls.filter(url => url.isAdminCreated).length;
    const templateCount = assignedUrlsResponse.data.urls.filter(url => !url.userId).length;
    const userSpecificCount = assignedUrlsResponse.data.urls.filter(url => url.userId).length;
    
    console.log(`📊 Summary:`);
    console.log(`- Assigned URLs: ${assignedCount}`);
    console.log(`- My URLs: ${myUrlsCount}`);
    console.log(`- Admin-created URLs: ${adminCreatedCount}`);
    console.log(`- Template URLs (no specific user): ${templateCount}`);
    console.log(`- User-specific URLs: ${userSpecificCount}`);
    
    if (templateCount > 0) {
      console.log('\n🎉 SUCCESS: User can see template URLs!');
    } else {
      console.log('\n❌ ISSUE: User cannot see template URLs');
    }

    console.log('\n🎉 Test completed!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testTemplateUrls(); 
const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testExistingUser() {
  try {
    console.log('🔍 Testing Existing User Access to Template URLs...\n');

    // Step 1: Create a new user without assigning URLs
    console.log('1. Creating a new user...');
    const newUserEmail = `existinguser${Date.now()}@example.com`;
    const newUserPassword = 'TestPass123!';
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      firstName: 'Existing',
      lastName: 'User',
      email: newUserEmail,
      password: newUserPassword,
      teamName: 'Existing Test Team'
    });

    console.log('✅ New user created:', newUserEmail);
    console.log('User ID:', registerResponse.data.user.id);
    console.log('Team ID:', registerResponse.data.user.teamId);

    // Step 2: Login as the new user
    console.log('\n2. Logging in as new user...');
    const userLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: newUserEmail,
      password: newUserPassword
    });

    const userToken = userLoginResponse.data.access_token;
    const newUser = userLoginResponse.data.user;
    console.log('✅ New user login successful');

    // Step 3: Check user's assigned URLs (should include template URLs)
    console.log('\n3. Checking user\'s assigned URLs...');
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

    // Step 4: Check user's my-urls endpoint
    console.log('\n4. Checking user\'s my-urls endpoint...');
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

    // Step 5: Summary
    console.log('\n5. Summary:');
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

testExistingUser(); 
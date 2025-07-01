const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testDirectLinks() {
  try {
    console.log('🔍 Testing Direct Links functionality...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    const adminToken = adminLoginResponse.data.access_token;
    const adminUser = adminLoginResponse.data.user;
    console.log('✅ Admin logged in:', adminUser.email, 'Role:', adminUser.role);

    // Step 2: Login as regular user
    console.log('\n2. Logging in as regular user...');
    const userLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'user@test.com',
      password: 'user123'
    });
    const userToken = userLoginResponse.data.access_token;
    const userUser = userLoginResponse.data.user;
    console.log('✅ User logged in:', userUser.email, 'Role:', userUser.role);

    // Step 3: Admin creates a URL for the user
    console.log('\n3. Admin creating URL for user...');
    const createUrlResponse = await axios.post(`${BASE_URL}/urls/admin`, {
      originalUrl: 'https://example.com/test-direct-link',
      targetUserId: userUser.id,
      title: 'Test Direct Link',
      description: 'Created by admin for user'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const createdUrl = createUrlResponse.data;
    console.log('✅ Admin created URL:', createdUrl.shortUrl);
    console.log('   - Assigned to user ID:', createdUrl.userId);
    console.log('   - Is admin created:', createdUrl.isAdminCreated);

    // Step 4: Check what URLs admin sees in team-urls endpoint
    console.log('\n4. Checking what admin sees in team-urls...');
    const adminTeamUrlsResponse = await axios.get(`${BASE_URL}/urls/team-urls`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminTeamUrls = adminTeamUrlsResponse.data.urls;
    const adminCreatedUrls = adminTeamUrls.filter(url => url.isAdminCreated);
    console.log('✅ Admin sees', adminCreatedUrls.length, 'admin-created URLs');
    adminCreatedUrls.forEach(url => {
      console.log(`   - ${url.shortUrl} (assigned to: ${url.userId})`);
    });

    // Step 5: Check what user sees in team-urls endpoint
    console.log('\n5. Checking what user sees in team-urls...');
    const userTeamUrlsResponse = await axios.get(`${BASE_URL}/urls/team-urls`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const userTeamUrls = userTeamUrlsResponse.data.urls;
    const userAdminCreatedUrls = userTeamUrls.filter(url => url.isAdminCreated && url.userId === userUser.id);
    console.log('✅ User sees', userAdminCreatedUrls.length, 'admin-created URLs assigned to them');
    userAdminCreatedUrls.forEach(url => {
      console.log(`   - ${url.shortUrl} (assigned to: ${url.userId})`);
    });

    // Step 6: Check user's own URLs
    console.log('\n6. Checking user\'s own URLs...');
    const userUrlsResponse = await axios.get(`${BASE_URL}/urls`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const userUrls = userUrlsResponse.data.urls;
    console.log('✅ User has', userUrls.length, 'total URLs');
    userUrls.forEach(url => {
      console.log(`   - ${url.shortUrl} (isAdminCreated: ${url.isAdminCreated})`);
    });

    // Step 7: Debug the filtering logic
    console.log('\n7. Debugging filtering logic...');
    console.log('User ID:', userUser.id);
    console.log('User role:', userUser.role);
    
    const shouldShowUrl = userTeamUrls.filter(url => {
      const isAdminCreated = url.isAdminCreated;
      const isAssignedToUser = url.userId === userUser.id;
      const isAdmin = userUser.role === 'admin';
      
      console.log(`URL ${url.shortUrl}: isAdminCreated=${isAdminCreated}, isAssignedToUser=${isAssignedToUser}, isAdmin=${isAdmin}`);
      
      if (isAdmin) {
        return isAdminCreated;
      } else {
        return isAdminCreated && isAssignedToUser;
      }
    });
    
    console.log('✅ URLs that should show for user:', shouldShowUrl.length);
    shouldShowUrl.forEach(url => {
      console.log(`   - ${url.shortUrl}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testDirectLinks(); 
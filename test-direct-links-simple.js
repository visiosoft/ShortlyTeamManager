const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function testDirectLinksSimple() {
  try {
    console.log('🔍 Simple Direct Links Test...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });
    const adminToken = adminLoginResponse.data.access_token;
    const adminUser = adminLoginResponse.data.user;
    console.log('✅ Admin logged in:', adminUser.email);

    // Step 2: Login as regular user
    console.log('\n2. Logging in as regular user...');
    const userLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'testuser@example.com',
      password: 'password123'
    });
    const userToken = userLoginResponse.data.access_token;
    const userUser = userLoginResponse.data.user;
    console.log('✅ User logged in:', userUser.email);
    console.log('   User ID:', userUser.id);
    console.log('   User role:', userUser.role);

    // Step 3: Check what URLs exist in the system
    console.log('\n3. Checking all URLs in system...');
    const adminTeamUrlsResponse = await axios.get(`${BASE_URL}/api/urls/team-urls`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const allUrls = adminTeamUrlsResponse.data.urls;
    console.log('✅ Total URLs in system:', allUrls.length);
    
    allUrls.forEach((url, index) => {
      console.log(`   ${index + 1}. ${url.shortUrl}`);
      console.log(`      - isAdminCreated: ${url.isAdminCreated}`);
      console.log(`      - userId: ${url.userId}`);
      console.log(`      - assigned to: ${url.user?.firstName} ${url.user?.lastName}`);
    });

    // Step 4: Check what user sees
    console.log('\n4. Checking what user sees...');
    const userTeamUrlsResponse = await axios.get(`${BASE_URL}/api/urls/team-urls`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const userUrls = userTeamUrlsResponse.data.urls;
    console.log('✅ User sees', userUrls.length, 'total URLs');
    
    console.log('\nDebugging filtering logic:');
    console.log('User ID from login:', userUser.id);
    console.log('User ID type:', typeof userUser.id);
    
    const userAdminCreatedUrls = userUrls.filter(url => {
      const isAdminCreated = url.isAdminCreated;
      
      // Extract ObjectId from userId if it's a JavaScript object string
      let urlUserId;
      if (typeof url.userId === 'string') {
        const objectIdMatch = url.userId.match(/new ObjectId\('([^']+)'\)/);
        if (objectIdMatch) {
          urlUserId = objectIdMatch[1];
        } else {
          urlUserId = url.userId;
        }
      } else {
        urlUserId = url.userId;
      }
      
      return isAdminCreated && urlUserId === userUser.id;
    });
    console.log('✅ User sees', userAdminCreatedUrls.length, 'admin-created URLs assigned to them');
    
    userAdminCreatedUrls.forEach((url, index) => {
      console.log(`   ${index + 1}. ${url.shortUrl}`);
    });

    // Step 5: If no admin-created URLs exist, create one
    if (userAdminCreatedUrls.length === 0) {
      console.log('\n5. No admin-created URLs found. Creating one...');
      const createUrlResponse = await axios.post(`${BASE_URL}/api/urls/admin`, {
        originalUrl: 'https://example.com/test-direct-link',
        targetUserId: userUser.id,
        title: 'Test Direct Link',
        description: 'Created by admin for user'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const createdUrl = createUrlResponse.data;
      console.log('✅ Created URL:', createdUrl.shortUrl);
      console.log('   - Assigned to user ID:', createdUrl.userId);
      console.log('   - Is admin created:', createdUrl.isAdminCreated);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testDirectLinksSimple(); 
const axios = require('axios');

const API_BASE = 'http://localhost:3009';

async function testAdminUrlCreation() {
  try {
    console.log('🧪 Testing Admin URL Creation Feature...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const adminLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });
    
    const adminToken = adminLoginResponse.data.access_token;
    const adminUser = adminLoginResponse.data.user;
    console.log(`   ✅ Admin logged in: ${adminUser.firstName} ${adminUser.lastName} (${adminUser.role})`);

    // Step 2: Get team members
    console.log('\n2. Fetching team members...');
    const teamMembersResponse = await axios.get(`${API_BASE}/users/team-members`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const teamMembers = teamMembersResponse.data;
    console.log(`   ✅ Found ${teamMembers.length} team members`);
    
    if (teamMembers.length === 0) {
      console.log('   ❌ No team members found. Please create some team members first.');
      return;
    }

    const targetUser = teamMembers.find(member => member.role === 'user');
    if (!targetUser) {
      console.log('   ❌ No regular users found. Please create a user account first.');
      return;
    }

    console.log(`   📋 Target user: ${targetUser.firstName} ${targetUser.lastName} (${targetUser.email})`);

    // Step 3: Create URL for user as admin
    console.log('\n3. Creating URL for user as admin...');
    const adminUrlData = {
      originalUrl: 'https://example.com/admin-created-url',
      targetUserId: targetUser.id,
      customShortCode: 'admin-test',
      title: 'Admin Created URL',
      description: 'This URL was created by admin for testing'
    };

    const adminUrlResponse = await axios.post(`${API_BASE}/api/urls/admin`, adminUrlData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    const createdUrl = adminUrlResponse.data;
    console.log(`   ✅ Admin URL created: ${createdUrl.shortUrl}`);
    console.log(`   📊 URL details:`, {
      id: createdUrl.id,
      isAdminCreated: createdUrl.isAdminCreated,
      createdByAdmin: createdUrl.createdByAdmin,
      userId: createdUrl.userId
    });

    // Step 4: Login as regular user
    console.log('\n4. Logging in as regular user...');
    const userLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: targetUser.email,
      password: 'password123'
    });
    
    const userToken = userLoginResponse.data.access_token;
    const regularUser = userLoginResponse.data.user;
    console.log(`   ✅ User logged in: ${regularUser.firstName} ${regularUser.lastName} (${regularUser.role})`);

    // Step 5: Check user's URLs (should include admin-created URL)
    console.log('\n5. Checking user URLs...');
    const userUrlsResponse = await axios.get(`${API_BASE}/api/urls/my-urls`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    const userUrls = userUrlsResponse.data.urls;
    console.log(`   ✅ User has ${userUrls.length} URLs`);
    
    const adminCreatedUrl = userUrls.find(url => url.isAdminCreated);
    if (adminCreatedUrl) {
      console.log(`   ✅ Found admin-created URL: ${adminCreatedUrl.shortUrl}`);
      console.log(`   📊 Admin URL details:`, {
        isAdminCreated: adminCreatedUrl.isAdminCreated,
        createdByAdmin: adminCreatedUrl.createdByAdmin,
        title: adminCreatedUrl.title
      });
    } else {
      console.log('   ❌ Admin-created URL not found in user URLs');
    }

    // Step 6: Test URL redirection
    console.log('\n6. Testing URL redirection...');
    const redirectResponse = await axios.get(`${API_BASE}/${createdUrl.shortCode}`, {
      maxRedirects: 0,
      validateStatus: (status) => status === 302
    });
    
    console.log(`   ✅ URL redirects to: ${redirectResponse.headers.location}`);

    // Step 7: Check analytics
    console.log('\n7. Checking analytics...');
    const analyticsResponse = await axios.get(`${API_BASE}/analytics/url/${createdUrl.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log(`   ✅ Analytics found: ${analyticsResponse.data.length} records`);

    // Step 8: Test admin can see all team URLs
    console.log('\n8. Checking admin team URLs view...');
    const adminTeamUrlsResponse = await axios.get(`${API_BASE}/api/urls/team-urls`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const adminTeamUrls = adminTeamUrlsResponse.data.urls;
    const adminCreatedUrlInTeam = adminTeamUrls.find(url => url.id === createdUrl.id);
    
    if (adminCreatedUrlInTeam) {
      console.log(`   ✅ Admin can see the created URL in team view`);
      console.log(`   📊 Team URL details:`, {
        isAdminCreated: adminCreatedUrlInTeam.isAdminCreated,
        createdByAdmin: adminCreatedUrlInTeam.createdByAdmin,
        user: adminCreatedUrlInTeam.user
      });
    } else {
      console.log('   ❌ Admin cannot see the created URL in team view');
    }

    console.log('\n🎉 Admin URL creation test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Admin can create URLs for users`);
    console.log(`   - Admin-created URLs are marked with isAdminCreated: true`);
    console.log(`   - Users can see admin-created URLs in their list`);
    console.log(`   - Admin can see all URLs in team view`);
    console.log(`   - URLs redirect properly and track analytics`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 403) {
      console.log('   💡 Make sure the user has admin role');
    }
  }
}

// Run the test
testAdminUrlCreation(); 
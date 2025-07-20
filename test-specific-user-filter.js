const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

// Test credentials
const adminCredentials = {
  email: 'khantoheedali@gmail.com',
  password: 'Digital@'
};

const userCredentials = {
  email: 'zulfiqar@gmail.com',
  password: 'Xulfi1234@'
};

async function login(credentials) {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: credentials.email,
      password: credentials.password
    });
    return response.data.access_token;
  } catch (error) {
    console.error(`Login failed for ${credentials.email}:`, error.response?.data || error.message);
    return null;
  }
}

async function getProfile(token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get profile:', error.response?.data || error.message);
    return null;
  }
}

async function getDefaultUrls(token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/urls/default`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get default URLs:', error.response?.data || error.message);
    return null;
  }
}

async function getAssignedUrls(token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/urls/assigned-to-me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get assigned URLs:', error.response?.data || error.message);
    return null;
  }
}

async function getMyUrls(token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/urls/my-urls`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get my URLs:', error.response?.data || error.message);
    return null;
  }
}

async function testSpecificUserFilter() {
  console.log('🧪 Testing Specific User Filter...\n');

  // Step 1: Login as admin
  console.log('1. Logging in as admin (khantoheedali@gmail.com)...');
  const adminToken = await login(adminCredentials);
  if (!adminToken) {
    console.error('❌ Failed to login as admin');
    return;
  }
  console.log('✅ Admin logged in successfully');

  // Step 2: Get admin profile
  console.log('\n2. Getting admin profile...');
  const adminProfile = await getProfile(adminToken);
  if (!adminProfile) {
    console.error('❌ Failed to get admin profile');
    return;
  }
  console.log('✅ Admin profile:', adminProfile.email, 'User ID:', adminProfile.userId, 'Role:', adminProfile.role);

  // Step 3: Get default URLs (admin view)
  console.log('\n3. Getting default URLs (admin view)...');
  const defaultUrls = await getDefaultUrls(adminToken);
  if (!defaultUrls) {
    console.error('❌ Failed to get default URLs');
    return;
  }

  console.log(`📊 Default URLs (${defaultUrls.length} total):`);
  defaultUrls.forEach((url, index) => {
    console.log(`   ${index + 1}. ${url.shortUrl} (${url.title || 'No title'}) - Template: ${url.isTemplate || false}`);
  });

  // Step 4: Login as user
  console.log('\n4. Logging in as user (zulfiqar@gmail.com)...');
  const userToken = await login(userCredentials);
  if (!userToken) {
    console.error('❌ Failed to login as user');
    return;
  }
  console.log('✅ User logged in successfully');

  // Step 5: Get user profile
  console.log('\n5. Getting user profile...');
  const userProfile = await getProfile(userToken);
  if (!userProfile) {
    console.error('❌ Failed to get user profile');
    return;
  }
  console.log('✅ User profile:', userProfile.email, 'User ID:', userProfile.userId, 'Role:', userProfile.role);

  // Step 6: Get assigned URLs (user view)
  console.log('\n6. Getting assigned URLs (user view)...');
  const assignedUrls = await getAssignedUrls(userToken);
  if (!assignedUrls) {
    console.error('❌ Failed to get assigned URLs');
    return;
  }

  console.log(`📊 Assigned URLs (${assignedUrls.urls.length} total):`);
  assignedUrls.urls.forEach((url, index) => {
    console.log(`   ${index + 1}. ${url.shortUrl} (${url.title || 'No title'}) - Admin Created: ${url.isAdminCreated}, Template: ${url.isTemplate || false}`);
  });

  // Step 7: Get my URLs (user view)
  console.log('\n7. Getting my URLs (user view)...');
  const myUrls = await getMyUrls(userToken);
  if (!myUrls) {
    console.error('❌ Failed to get my URLs');
    return;
  }

  console.log(`📊 My URLs (${myUrls.urls.length} total):`);
  myUrls.urls.forEach((url, index) => {
    console.log(`   ${index + 1}. ${url.shortUrl} (${url.title || 'No title'}) - Admin Created: ${url.isAdminCreated}, Template: ${url.isTemplate || false}`);
  });

  // Step 8: Verify the issue
  console.log('\n8. Analyzing the issue...');
  
  const adminCreatedUrls = assignedUrls.urls.filter(url => url.isAdminCreated);
  const nonAdminUrls = assignedUrls.urls.filter(url => !url.isAdminCreated);
  
  console.log(`📈 Analysis:`);
  console.log(`   - Total assigned URLs: ${assignedUrls.urls.length}`);
  console.log(`   - Admin-created URLs: ${adminCreatedUrls.length}`);
  console.log(`   - Non-admin URLs: ${nonAdminUrls.length}`);
  console.log(`   - Default URLs created by admin: ${defaultUrls.length}`);
  
  if (assignedUrls.urls.length > defaultUrls.length) {
    console.log('❌ ISSUE FOUND: User is seeing more URLs than admin created!');
    console.log('   - Expected: Only default URLs created by admin');
    console.log('   - Actual: User sees additional URLs');
    
    // Check if there are non-admin URLs in assigned list
    if (nonAdminUrls.length > 0) {
      console.log('   - Problem: Non-admin URLs are being shown in assigned URLs');
    }
    
    // Check if there are admin URLs that are not from the same team
    const adminUrlsFromDifferentTeam = adminCreatedUrls.filter(url => 
      url.createdByAdmin && url.createdByAdmin.id !== adminProfile.userId
    );
    
    if (adminUrlsFromDifferentTeam.length > 0) {
      console.log('   - Problem: URLs from different team admins are being shown');
    }
  } else {
    console.log('✅ SUCCESS: User only sees the expected number of URLs');
  }

  console.log('\n🎉 Specific user filter test completed!');
}

// Run the test
testSpecificUserFilter().catch(console.error); 
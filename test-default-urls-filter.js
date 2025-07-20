const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

// Test user credentials
const testUser = {
  email: 'testuser4@example.com',
  password: 'password123',
  firstName: 'Test',
  lastName: 'User',
  teamName: 'Test Team 4'
};

async function registerUser(user) {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, {
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      teamName: user.teamName
    });
    return response.data.access_token;
  } catch (error) {
    console.error(`Registration failed:`, error.response?.data || error.message);
    return null;
  }
}

async function login(user) {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: user.email,
      password: user.password
    });
    return response.data.access_token;
  } catch (error) {
    console.error(`Login failed:`, error.response?.data || error.message);
    return null;
  }
}

async function createDefaultUrl(adminToken, originalUrl, title) {
  try {
    const response = await axios.post(`${BASE_URL}/api/urls/default`, {
      originalUrl,
      title,
      description: `Default URL for testing`
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Default URL creation failed:`, error.response?.data || error.message);
    return null;
  }
}

async function createAdminUrl(adminToken, targetUserId, originalUrl) {
  try {
    const response = await axios.post(`${BASE_URL}/api/urls/admin`, {
      originalUrl,
      targetUserId,
      title: 'Admin Created URL',
      description: 'This is an admin-created URL (not default)'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Admin URL creation failed:`, error.response?.data || error.message);
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
    console.error(`Failed to get assigned URLs:`, error.response?.data || error.message);
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
    console.error(`Failed to get default URLs:`, error.response?.data || error.message);
    return null;
  }
}

async function testDefaultUrlsFilter() {
  console.log('🧪 Testing Default URLs Filter...\n');

  // Step 1: Register and login as admin
  console.log('1. Registering and logging in as Admin...');
  const adminToken = await registerUser({
    ...testUser,
    email: 'admin4@example.com'
  });
  if (!adminToken) {
    console.error('❌ Failed to register/login as admin');
    return;
  }
  console.log('✅ Admin registered and logged in successfully');

  // Step 2: Get team info
  console.log('\n2. Getting team info...');
  const teamResponse = await axios.get(`${BASE_URL}/api/teams/my-team`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const team = teamResponse.data;
  console.log('✅ Team info retrieved:', team.name);

  // Step 3: Register a test user
  console.log('\n3. Registering test user...');
  const userToken = await registerUser(testUser);
  if (!userToken) {
    console.error('❌ Failed to register test user');
    return;
  }
  console.log('✅ Test user registered successfully');

  // Step 4: Get user info
  console.log('\n4. Getting user info...');
  const userResponse = await axios.get(`${BASE_URL}/api/auth/profile`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  const user = userResponse.data;
  console.log('✅ User info retrieved:', user.email, 'User ID:', user.userId);

  // Step 5: Create default URL (template)
  console.log('\n5. Creating default URL (template)...');
  const defaultUrl = await createDefaultUrl(adminToken, 'https://default-url.com', 'Default URL');
  if (!defaultUrl) {
    console.error('❌ Failed to create default URL');
    return;
  }
  console.log('✅ Default URL created successfully');

  // Step 6: Create admin URL (not default)
  console.log('\n6. Creating admin URL (not default)...');
  const adminUrl = await createAdminUrl(adminToken, user.userId, 'https://admin-url.com');
  if (!adminUrl) {
    console.error('❌ Failed to create admin URL');
    return;
  }
  console.log('✅ Admin URL created successfully');

  // Step 7: Check default URLs (admin view)
  console.log('\n7. Checking default URLs (admin view)...');
  const defaultUrls = await getDefaultUrls(adminToken);
  if (!defaultUrls) {
    console.error('❌ Failed to get default URLs');
    return;
  }

  console.log(`📊 Default URLs (${defaultUrls.length} total):`);
  defaultUrls.forEach(url => {
    console.log(`   - ${url.shortUrl} (${url.title}) - Template: ${url.isTemplate || false}`);
  });

  // Step 8: Check assigned URLs (user view)
  console.log('\n8. Checking assigned URLs (user view)...');
  const assignedUrls = await getAssignedUrls(userToken);
  if (!assignedUrls) {
    console.error('❌ Failed to get assigned URLs');
    return;
  }

  console.log(`📊 Assigned URLs (${assignedUrls.urls.length} total):`);
  assignedUrls.urls.forEach(url => {
    console.log(`   - ${url.shortUrl} (${url.title}) - Admin Created: ${url.isAdminCreated}, Template: ${url.isTemplate || false}`);
  });

  // Step 9: Verify filtering
  console.log('\n9. Verifying URL filtering...');
  
  const hasOnlyDefaultUrls = assignedUrls.urls.every(url => 
    url.isAdminCreated && 
    (url.isTemplate === false || url.isTemplate === undefined || url.isTemplate === null)
  );
  
  const hasNoTemplates = !assignedUrls.urls.some(url => url.isTemplate === true);
  
  if (hasOnlyDefaultUrls && hasNoTemplates) {
    console.log('✅ SUCCESS: Default URL filtering is working correctly!');
    console.log('   - Assigned URLs only contains admin-created URLs');
    console.log('   - No template URLs are shown to users');
    console.log('   - Only default URLs (assigned to users) are shown');
  } else {
    console.error('❌ FAILED: Default URL filtering is not working correctly!');
    console.log('   - Has only default URLs:', hasOnlyDefaultUrls);
    console.log('   - Has no templates:', hasNoTemplates);
  }

  console.log('\n🎉 Default URL filtering test completed!');
}

// Run the test
testDefaultUrlsFilter().catch(console.error); 
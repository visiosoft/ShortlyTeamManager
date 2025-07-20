const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

// Test user credentials
const testUser = {
  email: 'testuser3@example.com',
  password: 'password123',
  firstName: 'Test',
  lastName: 'User',
  teamName: 'Test Team 3'
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

async function createUserUrl(token, originalUrl) {
  try {
    const response = await axios.post(`${BASE_URL}/api/urls`, {
      originalUrl,
      title: 'User Created URL',
      description: 'This is a user-created URL'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`User URL creation failed:`, error.response?.data || error.message);
    return null;
  }
}

async function createAdminUrl(adminToken, targetUserId, originalUrl) {
  try {
    const response = await axios.post(`${BASE_URL}/api/urls/admin`, {
      originalUrl,
      targetUserId,
      title: 'Admin Created URL',
      description: 'This is an admin-created URL'
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

async function getMyUrls(token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/urls/my-urls`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to get my URLs:`, error.response?.data || error.message);
    return null;
  }
}

async function testAssignedUrlsFilter() {
  console.log('🧪 Testing Assigned URLs Filter...\n');

  // Step 1: Register and login as admin
  console.log('1. Registering and logging in as Admin...');
  const adminToken = await registerUser({
    ...testUser,
    email: 'admin3@example.com'
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

  // Step 5: Create admin URL for the user
  console.log('\n5. Creating admin URL for user...');
  const adminUrl = await createAdminUrl(adminToken, user.userId, 'https://admin-created-url.com');
  if (!adminUrl) {
    console.error('❌ Failed to create admin URL');
    return;
  }
  console.log('✅ Admin URL created successfully');

  // Step 6: Create user URL
  console.log('\n6. Creating user URL...');
  const userUrl = await createUserUrl(userToken, 'https://user-created-url.com');
  if (!userUrl) {
    console.error('❌ Failed to create user URL');
    return;
  }
  console.log('✅ User URL created successfully');

  // Step 7: Check assigned URLs (should only show admin-created)
  console.log('\n7. Checking assigned URLs (should only show admin-created)...');
  const assignedUrls = await getAssignedUrls(userToken);
  if (!assignedUrls) {
    console.error('❌ Failed to get assigned URLs');
    return;
  }

  console.log(`📊 Assigned URLs (${assignedUrls.urls.length} total):`);
  assignedUrls.urls.forEach(url => {
    console.log(`   - ${url.shortUrl} (${url.title}) - Admin Created: ${url.isAdminCreated}`);
  });

  // Step 8: Check my URLs (should show user-created)
  console.log('\n8. Checking my URLs (should show user-created)...');
  const myUrls = await getMyUrls(userToken);
  if (!myUrls) {
    console.error('❌ Failed to get my URLs');
    return;
  }

  console.log(`📊 My URLs (${myUrls.urls.length} total):`);
  myUrls.urls.forEach(url => {
    console.log(`   - ${url.shortUrl} (${url.title}) - Admin Created: ${url.isAdminCreated}`);
  });

  // Step 9: Verify filtering
  console.log('\n9. Verifying URL filtering...');
  
  const adminCreatedInAssigned = assignedUrls.urls.every(url => url.isAdminCreated);
  const userCreatedInMyUrls = myUrls.urls.some(url => !url.isAdminCreated);
  
  if (adminCreatedInAssigned && userCreatedInMyUrls) {
    console.log('✅ SUCCESS: URL filtering is working correctly!');
    console.log('   - Assigned URLs only contains admin-created URLs');
    console.log('   - My URLs contains user-created URLs');
  } else {
    console.error('❌ FAILED: URL filtering is not working correctly!');
    console.log('   - Admin created in assigned:', adminCreatedInAssigned);
    console.log('   - User created in my URLs:', userCreatedInMyUrls);
  }

  console.log('\n🎉 URL filtering test completed!');
}

// Run the test
testAssignedUrlsFilter().catch(console.error); 
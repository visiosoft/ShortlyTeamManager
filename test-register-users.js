const axios = require('axios');

const API_BASE_URL = 'http://localhost:3009/api';

async function registerTestUsers() {
  try {
    console.log('🔧 Registering fresh test users...\n');
    
    // Register admin user
    console.log('1. Registering admin user...');
    const adminData = {
      firstName: 'Admin',
      lastName: 'Test',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    };
    
    try {
      const adminResponse = await axios.post(`${API_BASE_URL}/auth/register`, adminData);
      console.log('✅ Admin user registered:', adminResponse.data.email);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('⚠️ Admin user already exists');
      } else {
        console.log('❌ Admin registration failed:', error.response?.data?.message || error.message);
      }
    }
    
    // Register regular user
    console.log('\n2. Registering regular user...');
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'user@test.com',
      password: 'password123',
      role: 'user'
    };
    
    try {
      const userResponse = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      console.log('✅ Regular user registered:', userResponse.data.email);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('⚠️ Regular user already exists');
      } else {
        console.log('❌ User registration failed:', error.response?.data?.message || error.message);
      }
    }
    
    console.log('\n✅ User registration completed!');
    
  } catch (error) {
    console.error('❌ Error registering users:', error.message);
  }
}

async function testLogin(email, password) {
  try {
    console.log(`🔐 Logging in as ${email}...`);
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password
    });
    
    if (response.data && response.data.access_token) {
      console.log(`✅ Login successful for ${email}`);
      return response.data.access_token;
    } else {
      console.log(`❌ Login failed for ${email}: No token received`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Login failed for ${email}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function testPlatformSystem() {
  console.log('\n🧪 Testing Platform System...\n');
  
  // Test login
  const adminToken = await testLogin('admin@test.com', 'password123');
  if (!adminToken) {
    console.log('❌ Admin login failed. Cannot proceed.');
    return;
  }
  
  const userToken = await testLogin('user@test.com', 'password123');
  if (!userToken) {
    console.log('❌ User login failed. Cannot proceed.');
    return;
  }
  
  console.log('\n✅ Both users logged in successfully!');
  console.log('✅ Platform system is ready for testing!');
}

// Run the registration and test
async function runTest() {
  await registerTestUsers();
  await testPlatformSystem();
}

runTest().catch(console.error); 
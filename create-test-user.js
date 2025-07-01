const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function createTestUser() {
  try {
    console.log('🔧 Creating test user...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });
    const adminToken = adminLoginResponse.data.access_token;
    console.log('✅ Admin logged in successfully');

    // Step 2: Create a test user
    console.log('\n2. Creating test user...');
    const userCreateResponse = await axios.post(`${BASE_URL}/auth/team-member`, {
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'user'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Test user created:', userCreateResponse.data.firstName, userCreateResponse.data.lastName);
    console.log('   Email:', userCreateResponse.data.email);
    console.log('   Role:', userCreateResponse.data.role);

    // Step 3: Test login as the new user
    console.log('\n3. Testing login as new user...');
    const userLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'testuser@example.com',
      password: 'password123'
    });
    const userToken = userLoginResponse.data.access_token;
    const userUser = userLoginResponse.data.user;
    console.log('✅ User logged in successfully');
    console.log('   User ID:', userUser.id);
    console.log('   User role:', userUser.role);

    console.log('\n🎉 Test user created and verified!');
    console.log('\n📋 Test Accounts:');
    console.log(`   Admin: admin@example.com / password123`);
    console.log(`   User: testuser@example.com / password123`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

createTestUser(); 
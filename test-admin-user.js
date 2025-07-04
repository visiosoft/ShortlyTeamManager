const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function testAdminUser() {
  try {
    console.log('🔍 Testing admin user access...\n');
    
    // Step 1: Login as current user
    console.log('1️⃣ Logging in as current user...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'adnan@yahoo.com',
      password: 'Change1234@'
    });
    
    const token = loginResponse.data.access_token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful:', user.email);
    console.log('   - Role:', user.role);
    console.log('   - User ID:', user.id);
    
    // Step 2: Check if user is team admin
    console.log('\n2️⃣ Checking team info...');
    try {
      const teamResponse = await axios.get(`${BASE_URL}/api/teams/my-team`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Team info retrieved');
      console.log('   - Team name:', teamResponse.data.name);
      console.log('   - Team ID:', teamResponse.data._id);
      console.log('   - Team admin ID:', teamResponse.data.adminId);
      console.log('   - Is current user admin?', teamResponse.data.adminId === user.id);
    } catch (error) {
      console.log('❌ Error getting team info:', error.response?.data || error.message);
    }
    
    // Step 3: Try to access admin endpoints
    console.log('\n3️⃣ Testing admin endpoints...');
    try {
      const adminResponse = await axios.get(`${BASE_URL}/api/payments/admin/team-payment-info`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Admin access granted');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('❌ Access denied - user is not admin');
        console.log('   - Current role:', user.role);
        console.log('   - Need to update user role to "admin"');
      } else {
        console.log('❌ Error:', error.response?.data || error.message);
      }
    }
    
    console.log('\n📝 To fix admin access:');
    console.log('   - Update user role to "admin" in database');
    console.log('   - Or create a new admin user');
    console.log('   - Or update the backend to allow team admins access');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAdminUser(); 
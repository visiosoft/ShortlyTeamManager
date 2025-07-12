const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function checkAdminUsers() {
  try {
    console.log('🔍 Checking for admin users...\n');

    // Try to login with different users to find an admin
    const testUsers = [
      { email: 'sajid@yahoo.com', password: 'Xulfi1234@' },
      { email: 'all@yahoo.com', password: 'Xulfi1234@' },
      { email: 'zulfiqar@yahoo.com', password: 'Xulfi1234@' },
    ];

    for (const user of testUsers) {
      try {
        console.log(`Trying to login with: ${user.email}`);
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: user.email,
          password: user.password
        });

        const { user: userData } = loginResponse.data;
        console.log(`✅ Login successful for ${user.email}`);
        console.log(`  Role: ${userData.role}`);
        console.log(`  Team: ${userData.team?.name}`);
        console.log(`  Team ID: ${userData.teamId}`);
        console.log('');

        if (userData.role === 'admin') {
          console.log(`🎉 Found admin user: ${user.email}`);
          return userData;
        }
      } catch (error) {
        console.log(`❌ Failed to login with ${user.email}: ${error.response?.data?.message || error.message}`);
      }
    }

    console.log('❌ No admin users found');
    return null;

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkAdminUsers(); 
const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';
const ADMIN_EMAIL = 'zulfiqar@yahoo.com';
const ADMIN_PASSWORD = 'Xulfi1234@';

async function main() {
  try {
    // 1. Log in as admin
    console.log('Logging in as admin...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    const token = loginRes.data.access_token;
    if (!token) {
      console.error('❌ Login response did not contain access_token. Full response:', loginRes.data);
      return;
    }
    console.log('✅ Login successful. Token:', token.slice(0, 30) + '...');

    // 2. Call /api/platforms with the token
    console.log('\nCalling /api/platforms with JWT...');
    try {
      const platformsRes = await axios.get(`${BASE_URL}/platforms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ /api/platforms response:');
      console.log(platformsRes.data);
    } catch (error) {
      if (error.response) {
        console.error('❌ /api/platforms Error:', error.response.status, error.response.data);
      } else {
        console.error('❌ /api/platforms Error:', error.message);
      }
    }

    // 3. Call /api/users/profile with the token
    console.log('\nCalling /api/users/profile with JWT...');
    try {
      const profileRes = await axios.get(`${BASE_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ /api/users/profile response:');
      console.log(profileRes.data);
    } catch (error) {
      if (error.response) {
        console.error('❌ /api/users/profile Error:', error.response.status, error.response.data);
      } else {
        console.error('❌ /api/users/profile Error:', error.message);
      }
    }
  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

main(); 
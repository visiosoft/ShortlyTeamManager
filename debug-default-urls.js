const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function debugDefaultUrls() {
  try {
    console.log('🔍 Debugging Default URLs endpoint...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'zulfiqar@yahoo.com',
      password: 'Xulfi1234@'
    });

    const { access_token, user } = loginResponse.data;
    console.log('✅ Login successful');
    console.log('User:', user.email);
    console.log('Role:', user.role);
    console.log('Team ID:', user.teamId);

    // Step 2: Test the GET /urls/default endpoint directly
    console.log('\n2. Testing GET /urls/default endpoint...');
    try {
      const getDefaultUrlsResponse = await axios.get(`${BASE_URL}/urls/default`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      console.log('✅ GET /urls/default successful');
      console.log('Response:', JSON.stringify(getDefaultUrlsResponse.data, null, 2));
    } catch (error) {
      console.log('❌ GET /urls/default failed');
      console.log('Error status:', error.response?.status);
      console.log('Error data:', error.response?.data);
      console.log('Error message:', error.message);
    }

    // Step 3: Test creating another default URL
    console.log('\n3. Creating another default URL...');
    try {
      const createResponse = await axios.post(`${BASE_URL}/urls/default`, {
        originalUrl: 'https://facebook.com',
        title: 'Facebook',
        description: 'Default Facebook URL'
      }, {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      console.log('✅ POST /urls/default successful');
      console.log('Created URLs:', createResponse.data.length);
    } catch (error) {
      console.log('❌ POST /urls/default failed');
      console.log('Error:', error.response?.data);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugDefaultUrls(); 
const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function checkDefaultUrlsStructure() {
  try {
    console.log('🔍 Checking Default URLs Database Structure...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'zulfiqar@yahoo.com',
      password: 'Xulfi1234@'
    });

    const adminToken = adminLoginResponse.data.access_token;
    console.log('✅ Admin login successful');

    // Step 2: Get admin's team ID
    console.log('\n2. Getting admin team info...');
    const adminUser = adminLoginResponse.data.user;
    console.log('Admin Team ID:', adminUser.teamId);

    // Step 3: Check default URLs
    console.log('\n3. Checking default URLs structure...');
    const defaultUrlsResponse = await axios.get(`${BASE_URL}/urls/default`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ Default URLs retrieved:', defaultUrlsResponse.data.length);
    
    if (defaultUrlsResponse.data.length > 0) {
      const firstUrl = defaultUrlsResponse.data[0];
      console.log('\n📋 First Default URL Structure:');
      console.log(JSON.stringify(firstUrl, null, 2));
    }

    // Step 4: Check if there are any URLs in the admin's team
    console.log('\n4. Checking URLs in admin team...');
    const teamUrlsResponse = await axios.get(`${BASE_URL}/urls/team-urls`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ Team URLs retrieved:', teamUrlsResponse.data.urls.length);
    
    if (teamUrlsResponse.data.urls.length > 0) {
      console.log('\n📋 First Team URL Structure:');
      console.log(JSON.stringify(teamUrlsResponse.data.urls[0], null, 2));
    }

    console.log('\n🎉 Structure check completed!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkDefaultUrlsStructure(); 
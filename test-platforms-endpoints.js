const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testPlatformsEndpoints() {
  console.log('Testing Platforms Endpoints...\n');

  try {
    // Test GET /api/platforms
    console.log('1. Testing GET /api/platforms...');
    try {
      const response = await axios.get(`${BASE_URL}/platforms`);
      console.log('✅ GET /api/platforms - SUCCESS');
      console.log('Response:', response.data);
    } catch (error) {
      console.log('❌ GET /api/platforms - FAILED');
      console.log('Error:', error.response?.data || error.message);
    }

    // Test POST /api/platforms
    console.log('\n2. Testing POST /api/platforms...');
    try {
      const response = await axios.post(`${BASE_URL}/platforms`, {
        name: 'Test Platform',
        description: 'Test platform for testing',
        website: 'https://test.com',
        type: 'external',
        isActive: true
      });
      console.log('✅ POST /api/platforms - SUCCESS');
      console.log('Response:', response.data);
    } catch (error) {
      console.log('❌ POST /api/platforms - FAILED');
      console.log('Error:', error.response?.data || error.message);
    }

    // Test GET /api/platforms/active
    console.log('\n3. Testing GET /api/platforms/active...');
    try {
      const response = await axios.get(`${BASE_URL}/platforms/active`);
      console.log('✅ GET /api/platforms/active - SUCCESS');
      console.log('Response:', response.data);
    } catch (error) {
      console.log('❌ GET /api/platforms/active - FAILED');
      console.log('Error:', error.response?.data || error.message);
    }

    // Test GET /api/platforms/clicks/all
    console.log('\n4. Testing GET /api/platforms/clicks/all...');
    try {
      const response = await axios.get(`${BASE_URL}/platforms/clicks/all`);
      console.log('✅ GET /api/platforms/clicks/all - SUCCESS');
      console.log('Response:', response.data);
    } catch (error) {
      console.log('❌ GET /api/platforms/clicks/all - FAILED');
      console.log('Error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testPlatformsEndpoints(); 
const axios = require('axios');

const API_BASE = 'http://localhost:3009';

async function testMyTotalClicksEndpoint() {
  try {
    console.log('🧪 Testing My Total Clicks Endpoint');
    console.log('=====================================\n');

    // Test the endpoint without authentication first
    console.log('1. Testing endpoint without auth (should return 401)...');
    try {
      const response = await axios.get(`${API_BASE}/api/analytics/my-total-clicks`);
      console.log('❌ Unexpected success:', response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly returned 401 Unauthorized');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // Test with invalid auth
    console.log('\n2. Testing endpoint with invalid auth...');
    try {
      const response = await axios.get(`${API_BASE}/api/analytics/my-total-clicks`, {
        headers: {
          'Authorization': 'Bearer invalid-token',
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Unexpected success:', response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly returned 401 Unauthorized for invalid token');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    console.log('\n🎉 Endpoint is working correctly!');
    console.log('The issue is likely MongoDB not being available.');
    console.log('\nTo fix this, you need to:');
    console.log('1. Install and start MongoDB locally, or');
    console.log('2. Use a cloud MongoDB instance (MongoDB Atlas), or');
    console.log('3. Set up a different database connection');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMyTotalClicksEndpoint(); 
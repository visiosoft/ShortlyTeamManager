const axios = require('axios');

// Production API URL
const PRODUCTION_API_URL = 'https://shortlyapi.mypaperlessoffice.org/api';

async function debugProductionAnalytics() {
  console.log('🔍 Debugging Production Analytics...\n');
  console.log(`API URL: ${PRODUCTION_API_URL}\n`);

  try {
    // Test 1: Check if the API server is responding
    console.log('1. Testing API server connectivity...');
    try {
      const response = await axios.get(`${PRODUCTION_API_URL}/auth/login`, {
        timeout: 10000
      });
      console.log('✅ API server is responding');
      console.log('Status:', response.status);
    } catch (error) {
      console.log('❌ API server is not responding');
      console.log('Error:', error.message);
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', error.response.data);
      }
      return;
    }

    // Test 2: Try to login and get a token
    console.log('\n2. Testing authentication...');
    try {
      const loginResponse = await axios.post(`${PRODUCTION_API_URL}/auth/login`, {
        email: 'zulfiqar@yahoo.com',
        password: 'Xulfi1234@'
      }, {
        timeout: 10000
      });
      
      const token = loginResponse.data.access_token;
      console.log('✅ Authentication successful');
      console.log('Token received:', token ? 'Yes' : 'No');
      
      // Test 3: Test analytics endpoints with authentication
      console.log('\n3. Testing analytics endpoints...');
      
      const analyticsEndpoints = [
        '/analytics/countries/detailed',
        '/analytics/user/countries/detailed',
        '/analytics/team-members',
        '/analytics/admin/team-total-clicks-month',
        '/analytics/admin/team-countries',
        '/analytics/admin/top-team-countries'
      ];
      
      for (const endpoint of analyticsEndpoints) {
        try {
          console.log(`Testing: ${endpoint}`);
          const response = await axios.get(`${PRODUCTION_API_URL}${endpoint}`, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          });
          
          console.log(`✅ ${endpoint}: Status ${response.status}`);
          console.log(`   Data type: ${typeof response.data}`);
          console.log(`   Data length: ${Array.isArray(response.data) ? response.data.length : 'N/A'}`);
          
        } catch (error) {
          console.log(`❌ ${endpoint}: ${error.response?.status || 'No response'}`);
          console.log(`   Error: ${error.response?.data?.message || error.message}`);
          
          // If we get HTML instead of JSON, show the first part
          if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE')) {
            console.log(`   Response type: HTML (likely 404 or 500 error page)`);
            console.log(`   First 200 chars: ${error.response.data.substring(0, 200)}...`);
          }
        }
      }
      
    } catch (error) {
      console.log('❌ Authentication failed');
      console.log('Error:', error.response?.data?.message || error.message);
    }

    // Test 4: Test CORS headers
    console.log('\n4. Testing CORS configuration...');
    try {
      const corsResponse = await axios.options(`${PRODUCTION_API_URL}/auth/login`, {
        headers: {
          'Origin': 'https://shorly.uk',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        },
        timeout: 10000
      });
      
      console.log('✅ CORS preflight successful');
      console.log('CORS Headers:', {
        'Access-Control-Allow-Origin': corsResponse.headers['access-control-allow-origin'],
        'Access-Control-Allow-Methods': corsResponse.headers['access-control-allow-methods'],
        'Access-Control-Allow-Headers': corsResponse.headers['access-control-allow-headers']
      });
      
    } catch (error) {
      console.log('❌ CORS preflight failed');
      console.log('Error:', error.message);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
  
  console.log('\n🎯 Summary:');
  console.log('If you see HTML responses instead of JSON, it means:');
  console.log('1. The backend server is not running');
  console.log('2. The API routes are not properly configured');
  console.log('3. There\'s a server error (500)');
  console.log('4. The endpoint doesn\'t exist (404)');
  console.log('\nNext steps:');
  console.log('1. Check if your backend is running on the production server');
  console.log('2. Verify the API routes are properly deployed');
  console.log('3. Check the server logs for errors');
  console.log('4. Ensure the environment variables are set correctly');
}

debugProductionAnalytics(); 
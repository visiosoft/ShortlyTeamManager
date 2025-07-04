const axios = require('axios');

const API_BASE = 'http://localhost:3009/api';

// You'll need to replace this with a valid admin token
const ADMIN_TOKEN = 'YOUR_ADMIN_JWT_TOKEN_HERE';

async function testAdminAnalytics() {
  try {
    console.log('Testing Admin Analytics APIs...\n');

    // Test 1: Team Total Clicks for Current Month
    console.log('1. Testing Team Total Clicks for Current Month:');
    const totalClicksResponse = await axios.get(`${API_BASE}/analytics/admin/team-total-clicks-month`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    console.log('Response:', JSON.stringify(totalClicksResponse.data, null, 2));
    console.log('');

    // Test 2: Team Countries
    console.log('2. Testing Team Countries:');
    const countriesResponse = await axios.get(`${API_BASE}/analytics/admin/team-countries`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    console.log('Response:', JSON.stringify(countriesResponse.data, null, 2));
    console.log('');

    // Test 3: Top Team Countries
    console.log('3. Testing Top Team Countries:');
    const topCountriesResponse = await axios.get(`${API_BASE}/analytics/admin/top-team-countries?limit=5`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    console.log('Response:', JSON.stringify(topCountriesResponse.data, null, 2));
    console.log('');

    // Test 4: User Detailed Country Analytics (existing endpoint)
    console.log('4. Testing User Detailed Country Analytics:');
    const userCountriesResponse = await axios.get(`${API_BASE}/analytics/user/countries/detailed`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    console.log('Response:', JSON.stringify(userCountriesResponse.data, null, 2));
    console.log('');

    console.log('All tests completed successfully!');

  } catch (error) {
    console.error('Error testing admin analytics:', error.response?.data || error.message);
  }
}

// Instructions for use
console.log('Admin Analytics API Test Script');
console.log('================================');
console.log('');
console.log('Before running this script:');
console.log('1. Make sure your backend server is running on port 3009');
console.log('2. Replace ADMIN_TOKEN with a valid JWT token from an admin user');
console.log('3. Run: node test-admin-analytics.js');
console.log('');
console.log('To get an admin token, you can:');
console.log('1. Login as an admin user through your frontend');
console.log('2. Check the browser\'s developer tools -> Application -> Local Storage');
console.log('3. Look for the JWT token');
console.log('');

// Uncomment the line below to run the tests
// testAdminAnalytics(); 
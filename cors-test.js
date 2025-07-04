const axios = require('axios');

async function testCORS() {
  try {
    console.log('Testing CORS configuration...');
    
    // Test with credentials
    const response = await axios.get('http://localhost:3009/api/urls', {
      withCredentials: true,
      headers: {
        'Origin': 'http://localhost:3000',
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ CORS test passed!');
    console.log('Response status:', response.status);
    console.log('CORS headers:', {
      'access-control-allow-origin': response.headers['access-control-allow-origin'],
      'access-control-allow-credentials': response.headers['access-control-allow-credentials'],
      'access-control-allow-methods': response.headers['access-control-allow-methods'],
    });
    
  } catch (error) {
    console.error('❌ CORS test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testCORS(); 
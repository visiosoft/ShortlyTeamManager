const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testDirectReferralEarnings() {
  try {
    console.log('Testing direct referral earnings processing...');
    
    // Test the referral validation endpoint
    console.log('\n1. Testing referral code validation...');
    const validationResponse = await axios.post(`${BASE_URL}/referrals/validate`, {
      referralCode: 'QJZYILWD'
    });
    console.log('Referral validation result:', validationResponse.data);
    
    // Test the increment endpoint with a valid short code
    console.log('\n2. Testing click increment with a valid short code...');
    
    // First, let's try to get info about an existing URL
    try {
      const urlInfoResponse = await axios.get(`${BASE_URL}/urls/info/test123`);
      console.log('URL info:', urlInfoResponse.data);
      
      // If URL exists, try to increment clicks
      const incrementResponse = await axios.post(`${BASE_URL}/urls/increment/test123`);
      console.log('Increment response:', incrementResponse.data);
      
    } catch (error) {
      console.log('URL not found or increment failed:', error.response?.data?.message || error.message);
    }
    
    // Test with a different approach - try to access a URL directly
    console.log('\n3. Testing direct URL access...');
    try {
      const directResponse = await axios.get('http://localhost:3009/test123', {
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400
      });
      console.log('Direct access response status:', directResponse.status);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('URL not found (expected)');
      } else {
        console.log('Direct access error:', error.response?.data || error.message);
      }
    }
    
    console.log('\n4. Check backend logs to see if referral earnings processing is working...');
    console.log('The backend should show logs about processing referral earnings from clicks.');
    
  } catch (error) {
    console.error('Error in test:', error.response?.data || error.message);
  }
}

testDirectReferralEarnings(); 
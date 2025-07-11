const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testReferralEarningsUpdate() {
  try {
    console.log('Testing referral earnings update...');
    
    // First, let's check the current state of the referred user
    const referredUserId = '6869696d477add447e0b0c97'; // The referrer
    const newUserId = 'QJZYILWD'; // The referred user's referral code
    
    console.log('\n1. Checking current referral stats for referrer...');
    const referrerStats = await axios.get(`${BASE_URL}/referrals/user-stats`, {
      headers: {
        'Authorization': `Bearer ${process.env.JWT_TOKEN || 'test-token'}`
      }
    });
    console.log('Referrer stats:', referrerStats.data);
    
    // Simulate a click for the referred user
    console.log('\n2. Simulating a click for the referred user...');
    
    // First, let's create a test URL for the referred user
    const testUrlData = {
      originalUrl: 'https://example.com',
      title: 'Test URL',
      description: 'Test URL for referral earnings test'
    };
    
    const urlResponse = await axios.post(`${BASE_URL}/urls`, testUrlData, {
      headers: {
        'Authorization': `Bearer ${process.env.JWT_TOKEN || 'test-token'}`
      }
    });
    console.log('Test URL created:', urlResponse.data);
    
    // Now simulate a click by accessing the short URL
    const shortCode = urlResponse.data.shortCode;
    console.log(`Simulating click on short code: ${shortCode}`);
    
    try {
      const clickResponse = await axios.get(`${BASE_URL.replace('/api', '')}/${shortCode}`, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400; // Accept redirects
        }
      });
      console.log('Click tracked successfully');
    } catch (error) {
      if (error.response && (error.response.status === 302 || error.response.status === 301)) {
        console.log('Click tracked successfully (redirect)');
      } else {
        console.error('Error tracking click:', error.response?.data || error.message);
      }
    }
    
    // Wait a moment for processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check referral stats again
    console.log('\n3. Checking referral stats after click...');
    const updatedStats = await axios.get(`${BASE_URL}/referrals/user-stats`, {
      headers: {
        'Authorization': `Bearer ${process.env.JWT_TOKEN || 'test-token'}`
      }
    });
    console.log('Updated referrer stats:', updatedStats.data);
    
    // Check the referred user's stats
    console.log('\n4. Checking referred user stats...');
    const referredUserStats = await axios.get(`${BASE_URL}/referrals/user-stats`, {
      headers: {
        'Authorization': `Bearer ${process.env.JWT_TOKEN || 'test-token'}`
      },
      params: { userId: newUserId }
    });
    console.log('Referred user stats:', referredUserStats.data);
    
  } catch (error) {
    console.error('Error testing referral earnings:', error.response?.data || error.message);
  }
}

testReferralEarningsUpdate(); 
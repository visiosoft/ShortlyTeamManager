const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testReferralEarningsFromClick() {
  try {
    console.log('Testing referral earnings from click...');
    
    // First, let's check the current state of the referred user
    console.log('\n1. Checking current referral stats for referred user...');
    const validationResponse = await axios.post(`${BASE_URL}/referrals/validate`, {
      referralCode: 'QJZYILWD'
    });
    console.log('Referral validation result:', validationResponse.data);
    
    // Create a test URL to simulate a click
    console.log('\n2. Creating a test URL...');
    const testUrlData = {
      originalUrl: 'https://example.com/test-click',
      title: 'Test URL for Click Earnings',
      description: 'Testing referral earnings from clicks'
    };
    
    try {
      const urlResponse = await axios.post(`${BASE_URL}/urls`, testUrlData, {
        headers: {
          'Authorization': `Bearer ${process.env.JWT_TOKEN || 'test-token'}`
        }
      });
      console.log('Test URL created:', urlResponse.data);
      
      // Simulate a click by accessing the short URL
      const shortCode = urlResponse.data.shortCode;
      console.log(`\n3. Simulating click on short code: ${shortCode}`);
      
      const clickResponse = await axios.get(`http://localhost:3009/${shortCode}`, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400; // Accept redirects
        }
      });
      console.log('Click response status:', clickResponse.status);
      
      // Wait a moment for processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('\n4. Click processed successfully!');
      console.log('Referral earnings should have been updated for both referrer and referred user.');
      
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('Authentication required for URL creation. Testing direct click increment...');
        
        // Test direct click increment
        try {
          const incrementResponse = await axios.post(`${BASE_URL}/urls/increment/test123`);
          console.log('Direct increment response:', incrementResponse.data);
        } catch (incrementError) {
          console.log('Direct increment failed:', incrementError.response?.data?.message || incrementError.message);
        }
      } else if (error.response && (error.response.status === 302 || error.response.status === 301)) {
        console.log('Click tracked successfully (redirect)');
      } else {
        console.error('Error:', error.response?.data || error.message);
      }
    }
    
  } catch (error) {
    console.error('Error in test:', error.response?.data || error.message);
  }
}

testReferralEarningsFromClick(); 
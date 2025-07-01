const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function simulateClicks() {
  try {
    console.log('🔍 Simulating clicks and testing earnings...\n');
    
    // Login
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Logged in successfully');
    
    // Get user's URLs
    console.log('🔍 Getting user URLs...');
    const urlsResponse = await axios.get(`${BASE_URL}/api/urls/my-urls`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const urls = urlsResponse.data.urls;
    console.log(`✅ Found ${urls.length} URLs`);
    
    if (urls.length === 0) {
      console.log('❌ No URLs found. Creating one first...');
      
      const createUrlResponse = await axios.post(`${BASE_URL}/api/urls`, {
        originalUrl: 'https://www.example.com',
        customShortCode: 'demo123'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Created URL:', createUrlResponse.data.shortUrl);
      
      // Get URLs again
      const urlsResponse2 = await axios.get(`${BASE_URL}/api/urls/my-urls`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      urls = urlsResponse2.data.urls;
    }
    
    // Simulate clicks by accessing the short URLs
    console.log('\n🔍 Simulating clicks...');
    const testUrl = urls[0];
    const shortCode = testUrl.shortCode;
    
    console.log(`📊 Simulating 150 clicks on: ${BASE_URL}/${shortCode}`);
    
    // Simulate multiple clicks
    for (let i = 0; i < 150; i++) {
      try {
        await axios.get(`${BASE_URL}/${shortCode}`, {
          maxRedirects: 0,
          validateStatus: function (status) {
            return status >= 200 && status < 400; // Accept redirects
          }
        });
      } catch (error) {
        // Ignore redirect errors
      }
    }
    
    console.log('✅ Simulated 150 clicks');
    
    // Wait a moment for the database to update
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check earnings now
    console.log('\n🔍 Checking earnings after clicks...');
    const earningsResponse = await axios.get(`${BASE_URL}/teams/my-earnings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Earnings after clicks:', earningsResponse.data);
    
    // Also check the URL to see updated clicks
    console.log('\n🔍 Checking updated URL clicks...');
    const updatedUrlsResponse = await axios.get(`${BASE_URL}/api/urls/my-urls`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const updatedUrls = updatedUrlsResponse.data.urls;
    console.log('✅ Updated URLs:', updatedUrls.map(url => ({
      shortCode: url.shortCode,
      clicks: url.clicks,
      originalUrl: url.originalUrl
    })));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

simulateClicks(); 
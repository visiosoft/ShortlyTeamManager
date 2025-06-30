const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function checkUserUrls() {
  try {
    console.log('🔍 Checking user URLs and clicks...\n');
    
    // Login
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');
    
    // Get user's URLs
    console.log('\n🔍 Getting user URLs...');
    const urlsResponse = await axios.get(`${BASE_URL}/api/urls/my-urls`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const urls = urlsResponse.data.urls;
    console.log(`✅ Found ${urls.length} URLs`);
    
    if (urls.length > 0) {
      console.log('\n📊 URL Details:');
      urls.forEach((url, index) => {
        console.log(`${index + 1}. ${url.shortCode}: ${url.clicks} clicks`);
        console.log(`   Original: ${url.originalUrl}`);
        console.log(`   Short: ${url.shortUrl}`);
        console.log('');
      });
      
      const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
      console.log(`📈 Total clicks: ${totalClicks}`);
    } else {
      console.log('❌ No URLs found for this user');
    }
    
    // Also check team URLs
    console.log('\n🔍 Getting team URLs...');
    const teamUrlsResponse = await axios.get(`${BASE_URL}/api/urls/team-urls`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const teamUrls = teamUrlsResponse.data.urls;
    console.log(`✅ Found ${teamUrls.length} team URLs`);
    
    if (teamUrls.length > 0) {
      console.log('\n📊 Team URL Details:');
      teamUrls.forEach((url, index) => {
        console.log(`${index + 1}. ${url.shortCode}: ${url.clicks} clicks (by ${url.user?.email || 'unknown'})`);
        console.log(`   Original: ${url.originalUrl}`);
        console.log(`   Short: ${url.shortUrl}`);
        console.log('');
      });
      
      const teamTotalClicks = teamUrls.reduce((sum, url) => sum + url.clicks, 0);
      console.log(`📈 Team total clicks: ${teamTotalClicks}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkUserUrls(); 
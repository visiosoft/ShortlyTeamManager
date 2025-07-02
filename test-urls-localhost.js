const axios = require('axios');

async function testUrls() {
  try {
    // First login to get a token
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post('http://localhost:3009/api/auth/login', {
      email: 'admin@test.com',
      password: 'admin123'
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');

    // Get URLs
    console.log('📋 Fetching URLs...');
    const urlsResponse = await axios.get('http://localhost:3009/api/urls', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ URLs fetched successfully');
    console.log('📊 Total URLs:', urlsResponse.data.urls.length);
    
    // Check the first few URLs
    urlsResponse.data.urls.slice(0, 3).forEach((url, index) => {
      console.log(`\n🔗 URL ${index + 1}:`);
      console.log(`  Short Code: ${url.shortCode}`);
      console.log(`  Original URL: ${url.originalUrl}`);
      console.log(`  Short URL: ${url.shortUrl}`);
      console.log(`  Is localhost: ${url.shortUrl.includes('localhost')}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testUrls(); 
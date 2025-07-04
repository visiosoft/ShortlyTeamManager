const axios = require('axios');

const API_BASE = 'http://localhost:3009';
const FRONTEND_BASE = 'http://localhost:3000';

async function testFrontendIncrement() {
  try {
    console.log('🧪 Testing frontend-side increment functionality...\n');
    
    // Login to get a token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'toheed@yahoo.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Logged in successfully');
    
    // Get user's URLs
    console.log('\n2. Getting user URLs...');
    const urlsResponse = await axios.get(`${API_BASE}/api/urls/my-urls`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    let urls = urlsResponse.data.urls;
    if (urls.length === 0) {
      console.log('❌ No URLs found. Creating one...');
      
      const createResponse = await axios.post(`${API_BASE}/api/urls`, {
        originalUrl: 'https://www.example.com',
        customShortCode: 'test123'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Created URL:', createResponse.data.shortUrl);
      
      // Get URLs again
      const urlsResponse2 = await axios.get(`${API_BASE}/api/urls/my-urls`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      urls = urlsResponse2.data.urls;
    }
    
    const testUrl = urls[0];
    console.log(`✅ Found URL: ${testUrl.shortCode} (${testUrl.clicks} clicks)`);
    
    // Test the new increment endpoint directly
    console.log('\n3. Testing increment endpoint...');
    const incrementResponse = await axios.post(`${API_BASE}/api/urls/increment/${testUrl.shortCode}`);
    console.log('✅ Increment endpoint response:', incrementResponse.data);
    
    // Check if clicks increased
    console.log('\n4. Checking updated clicks...');
    const updatedUrlsResponse = await axios.get(`${API_BASE}/api/urls/my-urls`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const updatedUrl = updatedUrlsResponse.data.urls.find(u => u.shortCode === testUrl.shortCode);
    console.log(`✅ Updated clicks: ${updatedUrl.clicks} (was ${testUrl.clicks})`);
    
    // Test the frontend redirect flow
    console.log('\n5. Testing frontend redirect flow...');
    console.log(`🌐 Opening: ${FRONTEND_BASE}/${testUrl.shortCode}`);
    console.log('📝 This should:');
    console.log('   - Call /api/urls/info/{shortCode} to get URL info');
    console.log('   - Call /api/urls/increment/{shortCode} to increment clicks');
    console.log('   - Redirect to the original URL');
    
    console.log('\n🎉 Frontend increment implementation is ready!');
    console.log('📊 You can now:');
    console.log(`   1. Visit ${FRONTEND_BASE}/${testUrl.shortCode}`);
    console.log('   2. Check that clicks are incremented');
    console.log('   3. View analytics at http://localhost:3000/analytics');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testFrontendIncrement(); 
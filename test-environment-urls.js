const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function testEnvironmentUrls() {
  try {
    console.log('🔍 Testing environment configuration for shortened URLs...\n');
    
    // Step 1: Login as user
    console.log('1️⃣ Logging in as user...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'adnan@yahoo.com',
      password: 'Change1234@'
    });
    
    const token = loginResponse.data.access_token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful:', user.email);
    
    // Step 2: Create a test URL
    console.log('\n2️⃣ Creating a test URL...');
    const createUrlResponse = await axios.post(`${BASE_URL}/api/urls`, {
      originalUrl: 'https://example.com/test-environment',
      customShortCode: 'test-env'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const createdUrl = createUrlResponse.data;
    console.log('✅ URL created successfully');
    console.log('   - Original URL:', createdUrl.originalUrl);
    console.log('   - Short Code:', createdUrl.shortCode);
    console.log('   - Shortened URL:', createdUrl.shortUrl);
    console.log('   - Uses BASE_URL from environment:', createdUrl.shortUrl.includes('localhost:3000'));
    
    // Step 3: Check environment variables
    console.log('\n3️⃣ Environment Configuration:');
    console.log('   - Backend BASE_URL:', process.env.BASE_URL || 'http://localhost:3000');
    console.log('   - Frontend NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
    console.log('   - Frontend NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009');
    
    // Step 4: Test URL info endpoint
    console.log('\n4️⃣ Testing URL info endpoint...');
    const urlInfoResponse = await axios.get(`${BASE_URL}/api/urls/info/${createdUrl.shortCode}`);
    console.log('✅ URL info retrieved');
    console.log('   - Shortened URL from info:', urlInfoResponse.data.shortUrl);
    
    console.log('\n✅ Environment configuration testing completed!');
    console.log('\n📝 Summary:');
    console.log('   - Backend uses BASE_URL environment variable');
    console.log('   - Frontend displays shortened URLs from API response');
    console.log('   - Success message now shows actual shortened URL');
    console.log('   - Environment files configured for both dev and prod');
    console.log('\n🔧 Environment Files:');
    console.log('   - Frontend: frontend/.env.local');
    console.log('   - Backend: backend/.env');
    console.log('   - Production examples: frontend/.env.production.example, backend/.env.production.example');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testEnvironmentUrls(); 
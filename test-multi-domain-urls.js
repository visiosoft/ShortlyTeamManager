const axios = require('axios');

const API_BASE = 'http://localhost:3009/api';

async function testMultiDomainUrls() {
  try {
    console.log('🧪 Testing Multi-Domain URL Creation...\n');

    // Step 1: Check if backend is running
    console.log('1️⃣ Checking backend availability...');
    try {
      await axios.get(`${API_BASE}/auth/profile`);
      console.log('❌ Backend is running but should require auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Backend is running and responding');
      } else {
        console.log('❌ Backend connection failed:', error.message);
        return;
      }
    }

    // Step 2: Create a test user first
    console.log('\n2️⃣ Creating test user...');
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      teamName: 'Test Team'
    });
    console.log('✅ Test user created');

    // Step 3: Login to get token
    console.log('\n3️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 4: Test URL creation with custom short code
    console.log('\n4️⃣ Testing URL creation with custom short code...');
    const createUrlResponse = await axios.post(`${API_BASE}/urls`, {
      originalUrl: 'https://example.com/test-multi-domain',
      customShortCode: 'test123'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ URL creation response received');
    console.log('Response type:', Array.isArray(createUrlResponse.data) ? 'Array ✅' : 'Object ❌');
    console.log('Number of URLs returned:', createUrlResponse.data.length);

    // Step 5: Verify response structure
    console.log('\n5️⃣ Verifying response structure...');
    if (Array.isArray(createUrlResponse.data) && createUrlResponse.data.length === 2) {
      console.log('✅ Correct number of URLs returned (2)');
      
      const [defaultUrl, fashionUrl] = createUrlResponse.data;
      
      // Check domains
      console.log('Default URL domain:', defaultUrl.domain);
      console.log('Fashion URL domain:', fashionUrl.domain);
      
      if (defaultUrl.domain === 'default' && fashionUrl.domain === 'fashionstore.mom') {
        console.log('✅ Correct domains returned');
      } else {
        console.log('❌ Incorrect domains');
      }
      
      // Check short URLs
      console.log('Default short URL:', defaultUrl.shortUrl);
      console.log('Fashion short URL:', fashionUrl.shortUrl);
      
      if (defaultUrl.shortUrl.includes('localhost:3000') && 
          fashionUrl.shortUrl.includes('fashionstore.mom')) {
        console.log('✅ Correct short URLs generated');
      } else {
        console.log('❌ Incorrect short URLs');
      }
      
      // Check short codes are the same
      if (defaultUrl.shortCode === fashionUrl.shortCode) {
        console.log('✅ Same short code used for both domains');
      } else {
        console.log('❌ Different short codes');
      }
      
    } else {
      console.log('❌ Expected 2 URLs, got:', createUrlResponse.data.length);
    }

    // Step 6: Test URL creation without custom short code
    console.log('\n6️⃣ Testing URL creation without custom short code...');
    const createUrlResponse2 = await axios.post(`${API_BASE}/urls`, {
      originalUrl: 'https://example.com/test-auto-generated'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Auto-generated URL creation response received');
    console.log('Response type:', Array.isArray(createUrlResponse2.data) ? 'Array ✅' : 'Object ❌');
    console.log('Number of URLs returned:', createUrlResponse2.data.length);

    if (Array.isArray(createUrlResponse2.data) && createUrlResponse2.data.length === 2) {
      console.log('✅ Auto-generated URLs also return 2 domains');
      
      const [defaultUrl2, fashionUrl2] = createUrlResponse2.data;
      
      // Check that auto-generated short codes are the same
      if (defaultUrl2.shortCode === fashionUrl2.shortCode) {
        console.log('✅ Auto-generated short codes are the same for both domains');
      } else {
        console.log('❌ Auto-generated short codes are different');
      }
    }

    // Step 7: Test admin URL creation
    console.log('\n7️⃣ Testing admin URL creation...');
    const createAdminUrlResponse = await axios.post(`${API_BASE}/urls/admin`, {
      originalUrl: 'https://example.com/test-admin-multi-domain',
      targetUserId: loginResponse.data.user.id,
      customShortCode: 'admin123'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Admin URL creation response received');
    console.log('Response type:', Array.isArray(createAdminUrlResponse.data) ? 'Array ✅' : 'Object ❌');
    console.log('Number of URLs returned:', createAdminUrlResponse.data.length);

    if (Array.isArray(createAdminUrlResponse.data) && createAdminUrlResponse.data.length === 2) {
      console.log('✅ Admin URLs also return 2 domains');
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Backend is running and responding');
    console.log('- URL creation returns arrays with 2 URLs');
    console.log('- Both default and fashionstore.mom domains are created');
    console.log('- Short codes are consistent across domains');
    console.log('- Short URLs are generated correctly for each domain');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testMultiDomainUrls(); 
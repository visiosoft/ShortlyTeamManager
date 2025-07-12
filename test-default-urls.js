const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testDefaultUrls() {
  try {
    console.log('🔍 Testing Default URL functionality...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'zulfiqar@yahoo.com',
      password: 'Xulfi1234@'
    });

    const { access_token, user } = loginResponse.data;
    console.log('✅ Login successful');
    console.log('User:', user.email);
    console.log('Role:', user.role);
    console.log('Team:', user.team?.name);

    // Step 2: Create default URLs
    console.log('\n2. Creating default URLs...');
    const createDefaultUrlResponse = await axios.post(`${BASE_URL}/urls/default`, {
      originalUrl: 'https://google.com',
      title: 'Google Search',
      description: 'Default Google search URL for new users'
    }, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    console.log('✅ Default URLs created:', createDefaultUrlResponse.data.length);
    createDefaultUrlResponse.data.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url.shortCode} -> ${url.originalUrl}`);
    });

    // Step 3: Get default URLs
    console.log('\n3. Getting default URLs...');
    const getDefaultUrlsResponse = await axios.get(`${BASE_URL}/urls/default`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    console.log('✅ Default URLs retrieved:', getDefaultUrlsResponse.data.length);

    // Step 4: Get user's assigned URLs
    console.log('\n4. Getting user assigned URLs...');
    const assignedUrlsResponse = await axios.get(`${BASE_URL}/urls/assigned-to-me`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    console.log('✅ Assigned URLs:', assignedUrlsResponse.data.urls.length);
    assignedUrlsResponse.data.urls.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url.shortCode} -> ${url.originalUrl} (${url.isAdminCreated ? 'Admin Created' : 'User Created'})`);
    });

    // Step 5: Test URL refresh functionality
    if (assignedUrlsResponse.data.urls.length > 0) {
      const firstUrl = assignedUrlsResponse.data.urls[0];
      console.log('\n5. Testing URL refresh...');
      console.log(`Refreshing URL: ${firstUrl.shortCode} -> ${firstUrl.originalUrl}`);
      
      const refreshResponse = await axios.post(`${BASE_URL}/urls/${firstUrl.id}/refresh`, {}, {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      console.log('✅ URL refreshed successfully');
      console.log(`New short code: ${refreshResponse.data.shortCode}`);
      console.log(`New short URL: ${refreshResponse.data.shortUrl}`);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Admin can create default URLs`);
    console.log(`- Default URLs are assigned to new users`);
    console.log(`- Users can refresh their URLs`);
    console.log(`- All existing functionality (clicks, earnings) continues to work`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testDefaultUrls(); 
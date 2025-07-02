const axios = require('axios');

async function testCreateAndRedirect() {
  try {
    console.log('🔐 Step 1: Logging in...');
    const loginResponse = await axios.post('http://localhost:3009/api/auth/login', {
      email: 'admin@example.com',
      password: 'password123'
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');

    console.log('\n🔗 Step 2: Creating a test URL...');
    const createUrlResponse = await axios.post('http://localhost:3009/api/urls', {
      originalUrl: 'https://www.google.com',
      title: 'Test Google URL',
      description: 'Testing redirect functionality'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const createdUrl = createUrlResponse.data;
    console.log('✅ URL created successfully:');
    console.log(`  Short Code: ${createdUrl.shortCode}`);
    console.log(`  Original URL: ${createdUrl.originalUrl}`);
    console.log(`  Short URL: ${createdUrl.shortUrl}`);

    console.log('\n🔄 Step 3: Testing redirect...');
    console.log(`Testing: ${createdUrl.shortUrl}`);
    
    const redirectResponse = await axios.get(createdUrl.shortUrl, {
      maxRedirects: 0,
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Accept redirects
      }
    });

    console.log('✅ Redirect response:');
    console.log(`  Status: ${redirectResponse.status}`);
    console.log(`  Location: ${redirectResponse.headers.location || 'No location header'}`);

  } catch (error) {
    if (error.response) {
      console.log('✅ Expected redirect response:');
      console.log(`  Status: ${error.response.status}`);
      console.log(`  Location: ${error.response.headers.location || 'No location header'}`);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testCreateAndRedirect(); 
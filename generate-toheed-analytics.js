const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function generateToheedAnalytics() {
  console.log('🔧 Generating test analytics data for toheed@yahoo.com...\n');

  try {
    // 1. Login
    console.log('1. Logging in as toheed@yahoo.com...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'toheed@yahoo.com',
      password: '123456'
    });

    const token = loginResponse.data.access_token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful!');
    console.log(`User: ${user.firstName} ${user.lastName} (${user.role})`);
    console.log(`User ID: ${user.id}\n`);

    // 2. Create test URLs
    console.log('2. Creating test URLs...');
    const testUrls = [
      { originalUrl: 'https://google.com', shortCode: 'test1' },
      { originalUrl: 'https://youtube.com', shortCode: 'test2' },
      { originalUrl: 'https://github.com', shortCode: 'test3' }
    ];

    for (const urlData of testUrls) {
      try {
        const urlResponse = await axios.post(`${BASE_URL}/urls`, urlData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Created URL: ${urlData.shortCode} -> ${urlData.originalUrl}`);
      } catch (error) {
        if (error.response?.status === 409) {
          console.log(`⚠️  URL ${urlData.shortCode} already exists`);
        } else {
          console.log(`❌ Failed to create URL ${urlData.shortCode}: ${error.response?.data?.message || error.message}`);
        }
      }
    }

    // 3. Get user's URLs
    console.log('\n3. Getting user URLs...');
    const urlsResponse = await axios.get(`${BASE_URL}/urls/my-urls`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const urls = urlsResponse.data;
    console.log(`✅ Found ${urls.length} URLs`);

    if (urls.length === 0) {
      console.log('❌ No URLs found. Cannot generate analytics data.');
      return;
    }

    // 4. Simulate clicks with geolocation data
    console.log('\n4. Simulating clicks with geolocation data...');
    
    const testClicks = [
      { ip: '8.8.8.8', country: 'United States', countryCode: 'US', city: 'Mountain View' },
      { ip: '1.1.1.1', country: 'Australia', countryCode: 'AU', city: 'Sydney' },
      { ip: '208.67.222.222', country: 'United States', countryCode: 'US', city: 'San Francisco' },
      { ip: '9.9.9.9', country: 'Germany', countryCode: 'DE', city: 'Berlin' },
      { ip: '185.228.168.9', country: 'United Kingdom', countryCode: 'GB', city: 'London' },
      { ip: '76.76.19.56', country: 'Canada', countryCode: 'CA', city: 'Toronto' },
      { ip: '94.140.14.14', country: 'Netherlands', countryCode: 'NL', city: 'Amsterdam' },
      { ip: '176.103.130.130', country: 'Switzerland', countryCode: 'CH', city: 'Zurich' },
      { ip: '8.8.4.4', country: 'United States', countryCode: 'US', city: 'New York' },
      { ip: '1.0.0.1', country: 'Australia', countryCode: 'AU', city: 'Melbourne' }
    ];

    for (const url of urls) {
      console.log(`\nSimulating clicks for: ${url.shortCode}`);
      
      // Generate 5-15 clicks per URL
      const clickCount = Math.floor(Math.random() * 10) + 5;
      
      for (let i = 0; i < clickCount; i++) {
        const clickData = testClicks[Math.floor(Math.random() * testClicks.length)];
        
        try {
          await axios.post(`${BASE_URL}/urls/increment/${url.shortCode}`, {
            ipAddress: clickData.ip,
            userAgent: 'Mozilla/5.0 (Test Browser)',
            referer: 'https://test.com'
          });
          
          console.log(`✅ Click ${i + 1}: ${clickData.country} (${clickData.city})`);
        } catch (error) {
          console.log(`❌ Failed to simulate click: ${error.response?.data?.message || error.message}`);
        }
      }
    }

    // 5. Check analytics data
    console.log('\n5. Checking analytics data...');
    try {
      const analyticsResponse = await axios.get(`${BASE_URL}/analytics/user/countries/detailed`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const analyticsData = analyticsResponse.data;
      console.log(`✅ Found ${analyticsData.length} countries with analytics data`);

      if (analyticsData.length > 0) {
        console.log('\n📊 Analytics Data:');
        analyticsData.forEach((country, index) => {
          console.log(`${index + 1}. ${country.country} (${country.countryCode}): ${country.clicks} clicks`);
          if (country.cities.length > 0) {
            console.log(`   Top cities: ${country.cities.slice(0, 3).map(c => `${c.city} (${c.clicks})`).join(', ')}`);
          }
        });
        
        console.log('\n🎉 Success! You should now see highlighted countries on the analytics map.');
        console.log('Refresh your analytics page to see the changes.');
      } else {
        console.log('❌ No analytics data found. The clicks might not have been recorded properly.');
      }
    } catch (error) {
      console.log('❌ Could not fetch analytics data:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

generateToheedAnalytics(); 
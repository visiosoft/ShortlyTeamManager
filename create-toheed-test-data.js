const axios = require('axios');
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:3009/api';
const MONGODB_URI = 'mongodb://localhost:27017/shortlink';

async function createToheedTestData() {
  console.log('🔧 Creating test data for toheed@yahoo.com...\n');

  try {
    // 1. Connect to MongoDB
    console.log('1. Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 2. Login as toheed
    console.log('2. Logging in as toheed@yahoo.com...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'toheed@yahoo.com',
      password: '123456'
    });

    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful!');
    console.log(`User: ${user.firstName} ${user.lastName} (${user.role})`);
    console.log(`User ID: ${user._id}\n`);

    // 3. Create some test URLs
    console.log('3. Creating test URLs...');
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
        console.log(`⚠️  URL ${urlData.shortCode} might already exist`);
      }
    }

    // 4. Simulate some clicks with geolocation data
    console.log('\n4. Simulating clicks with geolocation data...');
    
    const testClicks = [
      { ip: '8.8.8.8', country: 'United States', countryCode: 'US', city: 'Mountain View' },
      { ip: '1.1.1.1', country: 'Australia', countryCode: 'AU', city: 'Sydney' },
      { ip: '208.67.222.222', country: 'United States', countryCode: 'US', city: 'San Francisco' },
      { ip: '9.9.9.9', country: 'Germany', countryCode: 'DE', city: 'Berlin' },
      { ip: '185.228.168.9', country: 'United Kingdom', countryCode: 'GB', city: 'London' },
      { ip: '76.76.19.56', country: 'Canada', countryCode: 'CA', city: 'Toronto' },
      { ip: '94.140.14.14', country: 'Netherlands', countryCode: 'NL', city: 'Amsterdam' },
      { ip: '176.103.130.130', country: 'Switzerland', countryCode: 'CH', city: 'Zurich' }
    ];

    // Get user's URLs
    const urlsResponse = await axios.get(`${BASE_URL}/urls/my-urls`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const urls = urlsResponse.data;
    console.log(`Found ${urls.length} URLs to simulate clicks for`);

    for (const url of urls) {
      console.log(`\nSimulating clicks for: ${url.shortCode}`);
      
      for (let i = 0; i < 3; i++) {
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
      }
    } catch (error) {
      console.log('❌ Could not fetch analytics data:', error.response?.data?.message || error.message);
    }

    console.log('\n✅ Test data creation completed!');
    console.log('Now you should see highlighted countries on the analytics map.');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createToheedTestData(); 
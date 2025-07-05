const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testMapHighlighting() {
  console.log('🔧 Testing map highlighting with diverse country data...\n');

  try {
    // 1. Login
    console.log('1. Logging in as toheed@yahoo.com...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'toheed@yahoo.com',
      password: '123456'
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Login successful!\n');

    // 2. Get user's URLs
    console.log('2. Getting user URLs...');
    const urlsResponse = await axios.get(`${BASE_URL}/urls/my-urls`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const urls = urlsResponse.data.urls;
    console.log(`✅ Found ${urls.length} URLs`);

    // 3. Simulate clicks from different countries
    console.log('\n3. Simulating clicks from different countries...');
    
    const testCountries = [
      { country: 'United States', countryCode: 'US', ip: '8.8.8.8', clicks: 10 },
      { country: 'United Kingdom', countryCode: 'GB', ip: '185.228.168.9', clicks: 8 },
      { country: 'Germany', countryCode: 'DE', ip: '9.9.9.9', clicks: 6 },
      { country: 'Canada', countryCode: 'CA', ip: '76.76.19.56', clicks: 5 },
      { country: 'Australia', countryCode: 'AU', ip: '1.1.1.1', clicks: 4 },
      { country: 'Netherlands', countryCode: 'NL', ip: '94.140.14.14', clicks: 3 },
      { country: 'France', countryCode: 'FR', ip: '176.103.130.131', clicks: 7 },
      { country: 'Spain', countryCode: 'ES', ip: '176.103.130.132', clicks: 4 },
      { country: 'Italy', countryCode: 'IT', ip: '176.103.130.133', clicks: 3 },
      { country: 'Japan', countryCode: 'JP', ip: '176.103.130.134', clicks: 9 },
      { country: 'India', countryCode: 'IN', ip: '176.103.130.136', clicks: 12 },
      { country: 'Brazil', countryCode: 'BR', ip: '176.103.130.137', clicks: 6 }
    ];

    for (const url of urls.slice(0, 2)) { // Use first 2 URLs
      console.log(`\nSimulating clicks for: ${url.shortCode}`);
      
      for (const countryData of testCountries) {
        console.log(`Adding ${countryData.clicks} clicks from ${countryData.country}...`);
        
        for (let i = 0; i < countryData.clicks; i++) {
          try {
            await axios.post(`${BASE_URL}/urls/increment/${url.shortCode}`, {
              ipAddress: countryData.ip,
              userAgent: 'Mozilla/5.0 (Test Browser)',
              referer: 'https://test.com'
            });
          } catch (error) {
            console.log(`⚠️  Failed to add click for ${countryData.country}: ${error.response?.data?.message || error.message}`);
          }
        }
      }
    }

    // 4. Check analytics data
    console.log('\n4. Checking analytics data...');
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

testMapHighlighting(); 
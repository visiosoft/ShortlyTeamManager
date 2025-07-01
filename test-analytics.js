const axios = require('axios');

async function testAnalytics() {
  try {
    console.log('🔍 Testing Analytics with IP Geolocation...\n');

    // Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3009/auth/login', {
      email: 'admin@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful\n');

    // Create a URL
    console.log('2. Creating a test URL...');
    const urlResponse = await axios.post('http://localhost:3009/api/urls', {
      originalUrl: 'https://www.google.com',
      customShortCode: 'test123'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const shortCode = urlResponse.data.shortCode;
    console.log(`✅ URL created: ${shortCode}\n`);

    // Simulate clicks from different IPs (these will be detected as different countries)
    console.log('3. Simulating clicks from different IPs...');
    
    const testIPs = [
      '8.8.8.8',      // Google DNS (US)
      '1.1.1.1',      // Cloudflare DNS (US)
      '208.67.222.222', // OpenDNS (US)
      '127.0.0.1',    // Localhost
      '192.168.1.1'   // Local network
    ];

    for (let i = 0; i < testIPs.length; i++) {
      const ip = testIPs[i];
      console.log(`   Clicking from IP: ${ip}`);
      
      // Simulate a click by making a request to the short URL
      try {
        await axios.get(`http://localhost:3009/${shortCode}`, {
          headers: {
            'X-Forwarded-For': ip,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          maxRedirects: 0,
          validateStatus: function (status) {
            return status >= 200 && status < 400; // Accept redirects
          }
        });
      } catch (error) {
        // Expected redirect error
        if (error.response && error.response.status === 302) {
          console.log(`   ✅ Click recorded from ${ip}`);
        } else {
          console.log(`   ❌ Error recording click from ${ip}:`, error.message);
        }
      }
    }

    // Wait a moment for analytics to be processed
    console.log('\n4. Waiting for analytics processing...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get country analytics
    console.log('5. Fetching country analytics...');
    const analyticsResponse = await axios.get('http://localhost:3009/analytics/countries/detailed', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const countryData = analyticsResponse.data;
    console.log('✅ Analytics data retrieved\n');

    // Display results
    console.log('📊 Analytics Results:');
    console.log('=====================');
    
    if (countryData.length === 0) {
      console.log('❌ No country data found');
    } else {
      console.log(`🌍 Countries with clicks: ${countryData.length}`);
      
      countryData.forEach((country, index) => {
        console.log(`\n${index + 1}. ${country.country} (${country.countryCode})`);
        console.log(`   Clicks: ${country.clicks}`);
        console.log(`   Cities: ${country.cities.length}`);
        console.log(`   Unique IPs: ${country.ipAddresses.length}`);
        
        if (country.cities.length > 0) {
          console.log('   Top cities:');
          country.cities.slice(0, 3).forEach(city => {
            console.log(`     - ${city.city}: ${city.clicks} clicks`);
          });
        }
        
        if (country.ipAddresses.length > 0) {
          console.log('   Recent IPs:');
          country.ipAddresses.slice(0, 3).forEach(ip => {
            console.log(`     - ${ip}`);
          });
        }
      });
    }

    // Get basic country stats
    console.log('\n6. Fetching basic country stats...');
    const basicStatsResponse = await axios.get('http://localhost:3009/analytics/countries', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Basic stats retrieved');
    console.log('\n📈 Basic Country Statistics:');
    basicStatsResponse.data.forEach((stat, index) => {
      console.log(`${index + 1}. ${stat.country}: ${stat.clicks} clicks`);
    });

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testAnalytics(); 
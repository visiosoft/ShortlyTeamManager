const axios = require('axios');

async function testRealIPs() {
  try {
    console.log('🌍 Testing Analytics with Real IPs...\n');

    // Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3009/auth/login', {
      email: 'admin@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful\n');

    // Create a test URL
    console.log('2. Creating test URL...');
    const shortCode = 'tst' + Math.floor(100000 + Math.random() * 900000); // 9 chars
    const urlResponse = await axios.post('http://localhost:3009/api/urls', {
      originalUrl: 'https://www.google.com',
      customShortCode: shortCode
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ URL created: ${shortCode}\n`);

    // Test IPs that geoip-lite can resolve
    const testIPs = [
      '8.8.8.8',        // Google DNS (US)
      '1.1.1.1',        // Cloudflare DNS (US) 
      '208.67.222.222', // OpenDNS (US)
      '9.9.9.9',        // Quad9 DNS (US)
      '185.228.168.9',  // CleanBrowsing (US)
      '76.76.19.19',    // Alternate DNS (US)
      '94.140.14.14',   // AdGuard DNS (RU)
      '176.103.130.130' // AdGuard DNS (RU)
    ];

    console.log('3. Simulating clicks with real IPs...');
    
    for (let i = 0; i < testIPs.length; i++) {
      const ip = testIPs[i];
      console.log(`   Clicking from IP: ${ip}`);
      
      try {
        await axios.get(`http://localhost:3009/${shortCode}`, {
          headers: {
            'X-Forwarded-For': ip,
            'X-Real-IP': ip,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          maxRedirects: 0,
          validateStatus: function (status) {
            return status >= 200 && status < 400;
          }
        });
        console.log(`   ✅ Click recorded from ${ip}`);
      } catch (error) {
        if (error.response && error.response.status === 302) {
          console.log(`   ✅ Click recorded from ${ip}`);
        } else {
          console.log(`   ❌ Error recording click from ${ip}:`, error.message);
        }
      }
    }

    // Wait for analytics to be processed
    console.log('\n4. Waiting for analytics processing...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check analytics with real IPs
    console.log('5. Checking analytics with real IPs...');
    const analyticsResponse = await axios.get('http://localhost:3009/analytics/team?limit=20', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Recent analytics records:');
    analyticsResponse.data.analytics.slice(0, 10).forEach((record, index) => {
      console.log(`\nRecord ${index + 1}:`);
      console.log(`  IP: ${record.ipAddress}`);
      console.log(`  Country: ${record.country || 'NULL'}`);
      console.log(`  City: ${record.city || 'NULL'}`);
    });

    // Check country analytics
    console.log('\n6. Checking country analytics...');
    const countryResponse = await axios.get('http://localhost:3009/analytics/countries', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Country analytics:');
    if (countryResponse.data.length === 0) {
      console.log('❌ Still no countries found');
    } else {
      countryResponse.data.forEach(country => {
        console.log(`  - ${country.country}: ${country.clicks} clicks`);
      });
    }

    // Check detailed country analytics
    console.log('\n7. Checking detailed country analytics...');
    const detailedCountryResponse = await axios.get('http://localhost:3009/analytics/countries/detailed', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Detailed country analytics:');
    if (detailedCountryResponse.data.length === 0) {
      console.log('❌ Still no detailed countries found');
    } else {
      detailedCountryResponse.data.forEach(country => {
        console.log(`  - ${country.country}: ${country.clicks} clicks`);
        console.log(`    Cities: ${country.cities.length}`);
        console.log(`    IPs: ${country.ipAddresses.length}`);
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testRealIPs(); 
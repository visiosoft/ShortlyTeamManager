const axios = require('axios');

async function testAnalyticsTracking() {
  try {
    console.log('🔍 Testing Analytics Tracking...\n');

    // Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3009/api/auth/login', {
      email: 'admin@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful\n');

    // Create a test URL
    console.log('2. Creating a test URL...');
    const urlResponse = await axios.post('http://localhost:3009/api/urls', {
      originalUrl: 'https://www.google.com',
      customShortCode: 'test-analytics'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const shortCode = urlResponse.data.shortCode;
    console.log(`✅ URL created: ${shortCode}\n`);

    // Simulate clicks with different IPs
    console.log('3. Simulating clicks with different IPs...');
    
    const testIPs = [
      '8.8.8.8',      // Google DNS (US)
      '1.1.1.1',      // Cloudflare DNS (US)
      '208.67.222.222', // OpenDNS (US)
      '185.60.216.35', // UK
      '91.198.174.192', // Germany
    ];

    for (let i = 0; i < testIPs.length; i++) {
      const ip = testIPs[i];
      console.log(`   Clicking from IP: ${ip}`);
      
      try {
        // Simulate a click by making a request to the short URL
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
        console.log(`   ✅ Click recorded from ${ip}`);
      } catch (error) {
        // Expected redirect error
        if (error.response && error.response.status === 302) {
          console.log(`   ✅ Click recorded from ${ip}`);
        } else {
          console.log(`   ❌ Error recording click from ${ip}:`, error.message);
        }
      }
      
      // Small delay between clicks
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Wait for analytics to be processed
    console.log('\n4. Waiting for analytics processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check if analytics were recorded
    console.log('5. Checking analytics records...');
    const analyticsResponse = await axios.get('http://localhost:3009/api/analytics/team?limit=10', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Found ${analyticsResponse.data.total} analytics records`);
    
    if (analyticsResponse.data.analytics.length > 0) {
      console.log('\n📊 Recent Analytics Records:');
      analyticsResponse.data.analytics.slice(0, 5).forEach((record, index) => {
        console.log(`\nRecord ${index + 1}:`);
        console.log(`  IP: ${record.ipAddress}`);
        console.log(`  Country: ${record.country || 'NULL'}`);
        console.log(`  City: ${record.city || 'NULL'}`);
        console.log(`  Created: ${record.createdAt}`);
      });
    } else {
      console.log('❌ No analytics records found');
    }

    // Check country analytics
    console.log('\n6. Checking country analytics...');
    try {
      const countryResponse = await axios.get('http://localhost:3009/api/analytics/countries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Country analytics:');
      if (countryResponse.data.length === 0) {
        console.log('❌ No country data found');
      } else {
        countryResponse.data.forEach(country => {
          console.log(`  - ${country.country}: ${country.clicks} clicks`);
        });
      }
    } catch (error) {
      console.log('❌ Error getting country analytics:', error.response?.data || error.message);
    }

    // Check detailed country analytics
    console.log('\n7. Checking detailed country analytics...');
    try {
      const detailedCountryResponse = await axios.get('http://localhost:3009/api/analytics/countries/detailed', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Detailed country analytics:');
      if (detailedCountryResponse.data.length === 0) {
        console.log('❌ No detailed country data found');
      } else {
        detailedCountryResponse.data.forEach(country => {
          console.log(`  - ${country.country}: ${country.clicks} clicks, ${country.cities.length} cities`);
        });
      }
    } catch (error) {
      console.log('❌ Error getting detailed country analytics:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAnalyticsTracking(); 
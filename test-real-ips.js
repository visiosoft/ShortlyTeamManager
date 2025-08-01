const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testRealIPs() {
  console.log('🔧 Testing with real IP addresses for map highlighting...\n');

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

    // 3. Test with real IP addresses that should be recognized by geoip-lite
    console.log('\n3. Testing with real IP addresses...');
    
    const realIPs = [
      { ip: '8.8.8.8', expectedCountry: 'US' }, // Google DNS
      { ip: '1.1.1.1', expectedCountry: 'AU' }, // Cloudflare DNS
      { ip: '208.67.222.222', expectedCountry: 'US' }, // OpenDNS
      { ip: '9.9.9.9', expectedCountry: 'DE' }, // Quad9 DNS
      { ip: '185.228.168.9', expectedCountry: 'GB' }, // CleanBrowsing
      { ip: '76.76.19.56', expectedCountry: 'CA' }, // Alternate DNS
      { ip: '94.140.14.14', expectedCountry: 'NL' }, // AdGuard DNS
      { ip: '176.103.130.130', expectedCountry: 'CH' }, // AdGuard DNS
      { ip: '8.8.4.4', expectedCountry: 'US' }, // Google DNS
      { ip: '1.0.0.1', expectedCountry: 'AU' }, // Cloudflare DNS
      { ip: '208.67.220.220', expectedCountry: 'US' }, // OpenDNS
      { ip: '9.9.9.10', expectedCountry: 'DE' }, // Quad9 DNS
      { ip: '185.228.169.9', expectedCountry: 'GB' }, // CleanBrowsing
      { ip: '76.76.2.0', expectedCountry: 'CA' }, // Alternate DNS
      { ip: '94.140.15.15', expectedCountry: 'NL' }, // AdGuard DNS
    ];

    for (const url of urls.slice(0, 1)) { // Use first URL
      console.log(`\nSimulating clicks for: ${url.shortCode}`);
      
      for (let i = 0; i < realIPs.length; i++) {
        const ipData = realIPs[i];
        const clicks = Math.floor(Math.random() * 5) + 2; // 2-6 clicks per IP
        
        console.log(`Adding ${clicks} clicks from IP ${ipData.ip} (expected: ${ipData.expectedCountry})...`);
        
        for (let j = 0; j < clicks; j++) {
          try {
            await axios.post(`${BASE_URL}/urls/increment/${url.shortCode}`, {
              ipAddress: ipData.ip,
              userAgent: 'Mozilla/5.0 (Test Browser)',
              referer: 'https://test.com'
            });
          } catch (error) {
            console.log(`⚠️  Failed to add click for IP ${ipData.ip}: ${error.response?.data?.message || error.message}`);
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

testRealIPs(); 
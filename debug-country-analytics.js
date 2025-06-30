const axios = require('axios');

async function debugCountryAnalytics() {
  try {
    console.log('🔍 Debugging Country Analytics...\n');

    // Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'admin@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful\n');

    // Get raw analytics data to see what's stored
    console.log('2. Getting raw analytics data...');
    const teamAnalyticsResponse = await axios.get('http://localhost:3001/analytics/team?limit=10', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Total analytics records:', teamAnalyticsResponse.data.total);
    console.log('Sample records:');
    
    teamAnalyticsResponse.data.analytics.slice(0, 5).forEach((record, index) => {
      console.log(`\nRecord ${index + 1}:`);
      console.log(`  IP: ${record.ipAddress}`);
      console.log(`  Country: ${record.country || 'NULL'}`);
      console.log(`  City: ${record.city || 'NULL'}`);
      console.log(`  User Agent: ${record.userAgent?.substring(0, 50) || 'NULL'}...`);
      console.log(`  Created: ${record.createdAt}`);
    });

    // Check if any records have country data
    const recordsWithCountry = teamAnalyticsResponse.data.analytics.filter(r => r.country);
    const recordsWithoutCountry = teamAnalyticsResponse.data.analytics.filter(r => !r.country);
    
    console.log(`\n3. Country Data Analysis:`);
    console.log(`Records with country: ${recordsWithCountry.length}`);
    console.log(`Records without country: ${recordsWithoutCountry.length}`);
    
    if (recordsWithCountry.length > 0) {
      console.log('\nCountries found:');
      const countries = [...new Set(recordsWithCountry.map(r => r.country))];
      countries.forEach(country => {
        const count = recordsWithCountry.filter(r => r.country === country).length;
        console.log(`  - ${country}: ${count} clicks`);
      });
    }

    // Test IP geolocation manually
    console.log('\n4. Testing IP geolocation...');
    const testIPs = ['8.8.8.8', '1.1.1.1', '127.0.0.1', '192.168.1.1'];
    
    const geoip = require('geoip-lite');
    testIPs.forEach(ip => {
      const geo = geoip.lookup(ip);
      console.log(`  ${ip}: ${geo ? `${geo.country} (${geo.city})` : 'Not found'}`);
    });

    // Check the country analytics query
    console.log('\n5. Testing country analytics endpoint...');
    try {
      const countryResponse = await axios.get('http://localhost:3001/analytics/countries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Country analytics response:', countryResponse.data);
    } catch (err) {
      console.log('Country analytics error:', err.response?.data || err.message);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

// Run the debug
debugCountryAnalytics(); 
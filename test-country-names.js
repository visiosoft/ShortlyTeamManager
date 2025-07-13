const axios = require('axios');

async function testCountryNames() {
  try {
    console.log('🔍 Testing Country Names Display...');
    
    // Get JWT token
    const tokenResponse = await axios.post('http://localhost:3009/api/auth/login', {
      email: 'admin1752438560619@test.com',
      password: 'AdminPass123!'
    });
    
    const token = tokenResponse.data.token;
    console.log('✅ Logged in successfully');
    
    // Test detailed country analytics
    console.log('\n2. Testing detailed country analytics...');
    const analyticsResponse = await axios.get('http://localhost:3009/api/analytics/countries/detailed', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Analytics data received');
    console.log('\n📊 Country Data:');
    
    if (analyticsResponse.data.length === 0) {
      console.log('❌ No country data found');
    } else {
      analyticsResponse.data.forEach((country, index) => {
        console.log(`${index + 1}. Country: "${country.country}" (Code: ${country.countryCode})`);
        console.log(`   Clicks: ${country.clicks}`);
        console.log(`   Cities: ${country.cities.length}`);
        console.log(`   IPs: ${country.ipAddresses.length}`);
        console.log('');
      });
    }
    
    // Test basic country analytics
    console.log('\n3. Testing basic country analytics...');
    const basicResponse = await axios.get('http://localhost:3009/api/analytics/countries', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Basic analytics data received');
    console.log('\n📊 Basic Country Data:');
    
    if (basicResponse.data.length === 0) {
      console.log('❌ No basic country data found');
    } else {
      basicResponse.data.forEach((country, index) => {
        console.log(`${index + 1}. Country: "${country.country}" (Code: ${country.countryCode})`);
        console.log(`   Clicks: ${country.clicks}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCountryNames(); 
const axios = require('axios');

async function checkCurrentAnalytics() {
  try {
    console.log('🔍 Checking Current Analytics Data...\n');

    // Login as regular user
    console.log('1. Logging in as regular user...');
    const loginResponse = await axios.post('http://localhost:3009/api/auth/login', {
      email: 'toheed@yahoo.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful\n');

    // Check team analytics
    console.log('2. Checking team analytics...');
    const teamAnalyticsResponse = await axios.get('http://localhost:3009/api/analytics/team?limit=20', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Found ${teamAnalyticsResponse.data.total} analytics records`);
    
    if (teamAnalyticsResponse.data.analytics.length > 0) {
      console.log('\n📊 Recent Analytics Records:');
      teamAnalyticsResponse.data.analytics.slice(0, 10).forEach((record, index) => {
        console.log(`\nRecord ${index + 1}:`);
        console.log(`  IP: ${record.ipAddress}`);
        console.log(`  Country: ${record.country || 'NULL'}`);
        console.log(`  City: ${record.city || 'NULL'}`);
        console.log(`  User: ${record.userId?.firstName} ${record.userId?.lastName}`);
        console.log(`  URL: ${record.urlId?.shortCode}`);
        console.log(`  Created: ${record.createdAt}`);
      });
    } else {
      console.log('❌ No analytics records found');
    }

    // Check country analytics
    console.log('\n3. Checking country analytics...');
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
    console.log('\n4. Checking detailed country analytics...');
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
          if (country.cities.length > 0) {
            console.log(`    Cities: ${country.cities.map(c => `${c.city}(${c.clicks})`).join(', ')}`);
          }
        });
      }
    } catch (error) {
      console.log('❌ Error getting detailed country analytics:', error.response?.data || error.message);
    }

    // Check my total clicks
    console.log('\n5. Checking my total clicks...');
    try {
      const myClicksResponse = await axios.get('http://localhost:3009/api/analytics/my-total-clicks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ My total clicks:');
      console.log(`  Total clicks: ${myClicksResponse.data.totalClicks}`);
      console.log(`  Unique IPs: ${myClicksResponse.data.uniqueIPs}`);
      console.log(`  Unique countries: ${myClicksResponse.data.uniqueCountries}`);
      
      if (myClicksResponse.data.detailedClicks.length > 0) {
        console.log('\n📊 Recent clicks:');
        myClicksResponse.data.detailedClicks.slice(0, 5).forEach((click, index) => {
          console.log(`  ${index + 1}. ${click.ipAddress} - ${click.country || 'Unknown'} (${click.city || 'Unknown'})`);
        });
      }
    } catch (error) {
      console.log('❌ Error getting my total clicks:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

checkCurrentAnalytics(); 
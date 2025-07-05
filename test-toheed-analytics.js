const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testToheedAnalytics() {
  console.log('🔍 Testing Analytics for toheed@yahoo.com...\n');

  try {
    // 1. Login with toheed@yahoo.com
    console.log('1. Logging in as toheed@yahoo.com...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'toheed@yahoo.com',
      password: '123456'
    });

    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful!');
    console.log(`User: ${user.firstName} ${user.lastName} (${user.role})`);
    console.log(`User ID: ${user._id}\n`);

    // 2. Check user's analytics data
    console.log('2. Checking user analytics data...');
    const analyticsResponse = await axios.get(`${BASE_URL}/analytics/user/countries/detailed`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const analyticsData = analyticsResponse.data;
    console.log(`✅ Found ${analyticsData.length} countries with analytics data`);

    if (analyticsData.length === 0) {
      console.log('❌ No analytics data found for this user');
      console.log('This means no clicks have been recorded for URLs owned by this user');
    } else {
      console.log('\n📊 Analytics Data:');
      analyticsData.forEach((country, index) => {
        console.log(`${index + 1}. ${country.country} (${country.countryCode}): ${country.clicks} clicks`);
        if (country.cities.length > 0) {
          console.log(`   Top cities: ${country.cities.slice(0, 3).map(c => `${c.city} (${c.clicks})`).join(', ')}`);
        }
      });
    }

    // 3. Check user's URLs
    console.log('\n3. Checking user URLs...');
    const urlsResponse = await axios.get(`${BASE_URL}/urls/my-urls`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const urls = urlsResponse.data;
    console.log(`✅ Found ${urls.length} URLs owned by this user`);

    if (urls.length === 0) {
      console.log('❌ No URLs found for this user');
      console.log('You need to create some URLs first to see analytics data');
    } else {
      console.log('\n🔗 User URLs:');
      urls.forEach((url, index) => {
        console.log(`${index + 1}. ${url.shortCode} -> ${url.originalUrl}`);
        console.log(`   Clicks: ${url.clicks}`);
        console.log(`   Created: ${new Date(url.createdAt).toLocaleDateString()}`);
      });
    }

    // 4. Check total clicks
    console.log('\n4. Checking total clicks...');
    const totalClicksResponse = await axios.get(`${BASE_URL}/analytics/my-total-clicks`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const totalClicks = totalClicksResponse.data;
    console.log(`✅ Total clicks: ${totalClicks.totalClicks}`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 The login failed. This could mean:');
      console.log('- The user does not exist');
      console.log('- The password is incorrect');
      console.log('- The user account is not properly set up');
    }
  }
}

testToheedAnalytics(); 
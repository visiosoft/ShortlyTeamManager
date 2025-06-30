const axios = require('axios');

async function debugAnalytics() {
  try {
    console.log('🔍 Debugging Analytics - Checking Database State...\n');

    // Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'admin@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful\n');

    // Check team info
    console.log('2. Getting team info...');
    const teamResponse = await axios.get('http://localhost:3001/teams/my-team', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Team ID:', teamResponse.data.id);
    console.log('Team Name:', teamResponse.data.name);

    // Check URLs
    console.log('\n3. Checking URLs...');
    const urlsResponse = await axios.get('http://localhost:3001/api/urls/my-urls', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Total URLs:', urlsResponse.data.total);
    console.log('URLs with clicks:');
    urlsResponse.data.urls.forEach(url => {
      console.log(`  - ${url.shortCode}: ${url.clicks} clicks`);
    });

    // Check team URLs
    console.log('\n4. Checking team URLs...');
    const teamUrlsResponse = await axios.get('http://localhost:3001/api/urls/team-urls', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Total team URLs:', teamUrlsResponse.data.total);
    console.log('Team URLs with clicks:');
    teamUrlsResponse.data.urls.forEach(url => {
      console.log(`  - ${url.shortCode} (${url.user?.firstName}): ${url.clicks} clicks`);
    });

    // Check analytics endpoints
    console.log('\n5. Checking analytics endpoints...');
    
    // Team analytics
    try {
      const teamAnalyticsResponse = await axios.get('http://localhost:3001/analytics/team', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Team analytics total:', teamAnalyticsResponse.data.total);
      console.log('Team analytics records:', teamAnalyticsResponse.data.analytics.length);
    } catch (err) {
      console.log('❌ Team analytics error:', err.response?.data || err.message);
    }

    // Country analytics
    try {
      const countryAnalyticsResponse = await axios.get('http://localhost:3001/analytics/countries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Country analytics:', countryAnalyticsResponse.data.length, 'countries');
      countryAnalyticsResponse.data.forEach(country => {
        console.log(`  - ${country.country}: ${country.clicks} clicks`);
      });
    } catch (err) {
      console.log('❌ Country analytics error:', err.response?.data || err.message);
    }

    // Team member stats
    try {
      const teamMembersResponse = await axios.get('http://localhost:3001/analytics/team-members', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Team member stats:', teamMembersResponse.data.length, 'members');
      teamMembersResponse.data.forEach(member => {
        console.log(`  - ${member.user?.firstName} ${member.user?.lastName}: ${member.clicks} clicks`);
      });
    } catch (err) {
      console.log('❌ Team member stats error:', err.response?.data || err.message);
    }

    // Check if we need to create test data
    console.log('\n6. Summary:');
    const totalTeamClicks = teamUrlsResponse.data.urls.reduce((sum, url) => sum + url.clicks, 0);
    console.log(`Total team clicks from URLs: ${totalTeamClicks}`);
    
    if (totalTeamClicks === 0) {
      console.log('\n⚠️  No clicks found! This could be because:');
      console.log('   - URLs haven\'t been clicked yet');
      console.log('   - Click tracking is not working');
      console.log('   - Analytics records are not being created');
      
      console.log('\n💡 To test:');
      console.log('   1. Create a URL');
      console.log('   2. Click the short URL');
      console.log('   3. Check analytics again');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

// Run the debug
debugAnalytics(); 
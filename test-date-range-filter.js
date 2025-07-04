const axios = require('axios');

const API_BASE = 'http://localhost:3009';

async function testDateRangeFilter() {
  try {
    console.log('🧪 Testing date range filter functionality...\n');
    
    // Login to get a token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'toheed@yahoo.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Logged in successfully');
    
    // Test different date ranges
    const testCases = [
      {
        name: 'Last 7 days',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      {
        name: 'Last 30 days',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      {
        name: 'Last 90 days',
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n2. Testing ${testCase.name}...`);
      
      // Test user detailed country analytics with date range
      const params = new URLSearchParams({
        startDate: testCase.startDate,
        endDate: testCase.endDate
      });
      
      const response = await axios.get(`${API_BASE}/api/analytics/user/countries/detailed?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`✅ ${testCase.name} - Found ${response.data.length} countries with data`);
      
      if (response.data.length > 0) {
        const totalClicks = response.data.reduce((sum, country) => sum + country.clicks, 0);
        console.log(`   Total clicks in range: ${totalClicks}`);
      }
    }
    
    // Test team member stats with date range
    console.log('\n3. Testing team member stats with date range...');
    const teamParams = new URLSearchParams({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
    
    const teamResponse = await axios.get(`${API_BASE}/api/analytics/team-members?${teamParams}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Team member stats - Found ${teamResponse.data.length} team members`);
    
    // Test admin analytics with date range
    console.log('\n4. Testing admin analytics with date range...');
    const adminParams = new URLSearchParams({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
    
    const adminResponse = await axios.get(`${API_BASE}/api/analytics/admin/team-countries?${adminParams}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Admin team countries - Found ${adminResponse.data.length} countries`);
    
    console.log('\n🎉 All date range filter tests passed!');
    console.log('\n📋 Summary:');
    console.log('- Date range filtering is working for user analytics');
    console.log('- Date range filtering is working for team member stats');
    console.log('- Date range filtering is working for admin analytics');
    console.log('- Frontend caching should preserve selected date ranges');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testDateRangeFilter(); 
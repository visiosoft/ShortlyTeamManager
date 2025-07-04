const axios = require('axios');

const API_BASE = 'http://localhost:3009/api';

async function debugAnalytics() {
  console.log('🔍 Debugging Analytics for toheed@yahoo.com...\n');
  
  try {
    // Test 1: Check if backend is responding
    console.log('📡 Test 1: Backend connectivity');
    try {
      const response = await axios.get(`${API_BASE}/urls/my-urls`);
      console.log('✅ Backend is responding');
      console.log('📊 URLs found:', response.data.length);
      if (response.data.length > 0) {
        response.data.forEach((url, index) => {
          console.log(`   ${index + 1}. ${url.shortCode} → ${url.originalUrl} (${url.clicks} clicks)`);
        });
      }
    } catch (error) {
      console.log('❌ Backend error:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    console.log('\n📊 Test 2: Check analytics endpoints');
    
    // Test analytics endpoints
    const analyticsEndpoints = [
      '/analytics/team',
      '/analytics/countries',
      '/analytics/countries/detailed',
      '/analytics/user/countries/detailed',
      '/analytics/team-members',
      '/analytics/admin/team-total-clicks-month',
      '/analytics/admin/team-countries',
      '/analytics/admin/top-team-countries'
    ];
    
    for (const endpoint of analyticsEndpoints) {
      try {
        const response = await axios.get(`${API_BASE}${endpoint}`);
        console.log(`✅ ${endpoint}: ${JSON.stringify(response.data).substring(0, 100)}...`);
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
    }
    
    console.log('\n🎯 Test 3: Check specific URLs');
    
    // Test if our test URLs actually exist
    const testUrls = ['test1', 'test2', 'test3', 'test4', 'test5'];
    
    for (const shortCode of testUrls) {
      try {
        const response = await axios.get(`${API_BASE}/urls/info/${shortCode}`);
        console.log(`✅ ${shortCode}: ${response.data.originalUrl} (${response.data.clicks} clicks)`);
      } catch (error) {
        console.log(`❌ ${shortCode}: ${error.response?.status} - ${error.response?.data?.message || 'Not found'}`);
      }
    }
    
    console.log('\n🔧 Next Steps:');
    console.log('1. If no URLs exist, create them manually at http://localhost:3000/dashboard');
    console.log('2. If URLs exist but no analytics, the clicks might not have been recorded');
    console.log('3. Check if you\'re logged in with the correct account');
    console.log('4. Try refreshing the analytics page (Ctrl+F5)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugAnalytics(); 
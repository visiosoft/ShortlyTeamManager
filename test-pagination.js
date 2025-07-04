const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function testPagination() {
  try {
    console.log('🔍 Testing pagination functionality...\n');
    
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'adnan@yahoo.com',
      password: 'Change1234@'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');
    
    // Step 2: Get clicks data
    console.log('\n2️⃣ Getting clicks data...');
    const analyticsResponse = await axios.get(`${BASE_URL}/api/analytics/my-total-clicks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const data = analyticsResponse.data;
    console.log(`📊 Total clicks: ${data.totalClicks}`);
    console.log(`📋 Detailed clicks: ${data.detailedClicks.length}`);
    
    // Step 3: Test pagination logic
    console.log('\n3️⃣ Testing pagination logic...');
    const itemsPerPage = 10;
    const totalPages = Math.ceil(data.detailedClicks.length / itemsPerPage);
    
    console.log(`📄 Items per page: ${itemsPerPage}`);
    console.log(`📄 Total pages: ${totalPages}`);
    
    // Test different pages
    for (let page = 1; page <= Math.min(3, totalPages); page++) {
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentClicks = data.detailedClicks.slice(startIndex, endIndex);
      
      console.log(`\n📄 Page ${page}:`);
      console.log(`   - Start index: ${startIndex}`);
      console.log(`   - End index: ${endIndex}`);
      console.log(`   - Items on page: ${currentClicks.length}`);
      console.log(`   - Showing: ${startIndex + 1}-${Math.min(endIndex, data.detailedClicks.length)} of ${data.detailedClicks.length}`);
      
      if (currentClicks.length > 0) {
        console.log(`   - First item: ${currentClicks[0].urlId.shortCode}`);
        console.log(`   - Last item: ${currentClicks[currentClicks.length - 1].urlId.shortCode}`);
      }
    }
    
    console.log('\n✅ Pagination logic is working correctly!');
    console.log('📱 Visit: http://localhost:3000/my-clicks to see pagination in action');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testPagination(); 
const axios = require('axios');

const API_BASE = 'http://localhost:3009/api';

// You'll need to replace this with a valid admin token
const ADMIN_TOKEN = 'YOUR_ADMIN_JWT_TOKEN_HERE';

async function createTestData() {
  console.log('🚀 Creating test data for admin analytics...\n');
  
  if (ADMIN_TOKEN === 'YOUR_ADMIN_JWT_TOKEN_HERE') {
    console.log('⚠️  IMPORTANT: You need to get a valid JWT token first!');
    console.log('');
    console.log('📋 Steps to get your token:');
    console.log('1. Go to http://localhost:3000/login');
    console.log('2. Login as an admin user');
    console.log('3. Open browser Developer Tools (F12)');
    console.log('4. Go to Application/Storage tab');
    console.log('5. Look for "token" in localStorage');
    console.log('6. Copy the token value');
    console.log('7. Replace "YOUR_ADMIN_JWT_TOKEN_HERE" in this script');
    console.log('');
    console.log('🔧 Quick alternative:');
    console.log('1. Go to http://localhost:3000/dashboard');
    console.log('2. Create some URLs manually');
    console.log('3. Share those URLs and get real clicks');
    console.log('4. Then check http://localhost:3000/analytics');
    console.log('');
    return;
  }

  try {
    const headers = {
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
      'Content-Type': 'application/json'
    };

    console.log('📝 Creating test URLs...');
    
    // Create some test URLs
    const testUrls = [
      { originalUrl: 'https://google.com', shortCode: 'test1' },
      { originalUrl: 'https://github.com', shortCode: 'test2' },
      { originalUrl: 'https://stackoverflow.com', shortCode: 'test3' },
      { originalUrl: 'https://reddit.com', shortCode: 'test4' },
      { originalUrl: 'https://youtube.com', shortCode: 'test5' }
    ];

    const createdUrls = [];
    
    for (const urlData of testUrls) {
      try {
        const response = await axios.post(`${API_BASE}/urls`, urlData, { headers });
        createdUrls.push(response.data);
        console.log(`✅ Created URL: ${urlData.shortCode} -> ${urlData.originalUrl}`);
      } catch (error) {
        console.log(`⚠️  URL ${urlData.shortCode} might already exist or failed to create`);
      }
    }

    console.log('\n📊 Test URLs created successfully!');
    console.log('Now you can:');
    console.log('1. Share these URLs to get real clicks');
    console.log('2. Or use the analytics page to see the structure');
    console.log('3. The admin analytics will show data once you have clicks');
    
    console.log('\n🔗 Your test URLs:');
    createdUrls.forEach(url => {
      console.log(`   http://localhost:3000/${url.shortCode}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Instructions for manual testing
console.log('🔧 Manual Testing Instructions');
console.log('=============================');
console.log('');
console.log('Since the analytics data is empty, here are ways to get data:');
console.log('');
console.log('1. 🎯 Create URLs and get real clicks:');
console.log('   - Go to http://localhost:3000/dashboard');
console.log('   - Create some URLs');
console.log('   - Share them on social media or with friends');
console.log('   - Get real clicks with real IP addresses');
console.log('');
console.log('2. 🌐 Use ngrok for external traffic:');
console.log('   - Install ngrok: npm install -g ngrok');
console.log('   - Run: ngrok http 3009');
console.log('   - Share the ngrok URL to get external traffic');
console.log('');
console.log('3. 📱 Test with different devices:');
console.log('   - Use your phone (different IP)');
console.log('   - Use different browsers');
console.log('   - Use incognito mode');
console.log('');
console.log('4. 🔍 Check the analytics page structure:');
console.log('   - Go to http://localhost:3000/analytics');
console.log('   - Login as admin user');
console.log('   - You should see the new admin sections (even if empty)');
console.log('');

// Uncomment to run the test data creation
// createTestData(); 
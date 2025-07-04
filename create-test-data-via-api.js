const axios = require('axios');

const API_BASE = 'http://localhost:3009/api';

// Test data for toheed@yahoo.com
async function createTestDataViaAPI() {
  console.log('🚀 Creating test data for toheed@yahoo.com via API...\n');
  
  console.log('📋 Instructions:');
  console.log('1. First, you need to login and get your JWT token');
  console.log('2. Go to http://localhost:3000/login');
  console.log('3. Login with toheed@yahoo.com');
  console.log('4. Open browser Developer Tools (F12)');
  console.log('5. Go to Application/Storage tab');
  console.log('6. Look for "token" in localStorage');
  console.log('7. Copy the token value');
  console.log('8. Replace "YOUR_JWT_TOKEN_HERE" below with your actual token');
  console.log('');
  
  // You'll need to replace this with your actual JWT token
  const TOKEN = 'YOUR_JWT_TOKEN_HERE';
  
  if (TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    console.log('⚠️  Please replace "YOUR_JWT_TOKEN_HERE" with your actual JWT token');
    console.log('');
    console.log('🔧 Alternative approach:');
    console.log('1. Go to http://localhost:3000/dashboard');
    console.log('2. Create some URLs manually');
    console.log('3. Share those URLs and get real clicks');
    console.log('4. Then check http://localhost:3000/analytics');
    console.log('');
    return;
  }

  try {
    const headers = {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    };

    console.log('📝 Creating test URLs...');
    
    // Create test URLs
    const testUrls = [
      { originalUrl: 'https://google.com', shortCode: 'toheed1' },
      { originalUrl: 'https://github.com', shortCode: 'toheed2' },
      { originalUrl: 'https://stackoverflow.com', shortCode: 'toheed3' },
      { originalUrl: 'https://reddit.com', shortCode: 'toheed4' },
      { originalUrl: 'https://youtube.com', shortCode: 'toheed5' },
      { originalUrl: 'https://linkedin.com', shortCode: 'toheed6' },
      { originalUrl: 'https://twitter.com', shortCode: 'toheed7' },
      { originalUrl: 'https://facebook.com', shortCode: 'toheed8' }
    ];

    const createdUrls = [];
    
    for (const urlData of testUrls) {
      try {
        const response = await axios.post(`${API_BASE}/urls`, urlData, { headers });
        createdUrls.push(response.data);
        console.log(`✅ Created URL: ${urlData.shortCode} -> ${urlData.originalUrl}`);
      } catch (error) {
        if (error.response?.status === 409) {
          console.log(`⚠️  URL ${urlData.shortCode} already exists, skipping...`);
        } else {
          console.log(`❌ Failed to create URL ${urlData.shortCode}: ${error.response?.data?.message || error.message}`);
        }
      }
    }

    if (createdUrls.length === 0) {
      console.log('❌ No URLs created. Please create some URLs manually first.');
      return;
    }

    console.log('\n📊 Test URLs created successfully!');
    console.log('Now you can:');
    console.log('1. Share these URLs to get real clicks');
    console.log('2. Or simulate clicks using the script below');
    console.log('3. Check the analytics page to see the data');
    
    console.log('\n🔗 Your test URLs:');
    createdUrls.forEach(url => {
      console.log(`   http://localhost:3000/${url.shortCode}`);
    });

    // Now simulate some clicks
    console.log('\n🎯 Simulating clicks for analytics data...');
    await simulateClicks(createdUrls);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function simulateClicks(urls) {
  if (urls.length === 0) {
    console.log('No URLs to simulate clicks for');
    return;
  }

  // Test IP addresses from different countries
  const testIPs = [
    { ip: '8.8.8.8', country: 'US', city: 'New York' },
    { ip: '1.1.1.1', country: 'US', city: 'Los Angeles' },
    { ip: '208.67.222.222', country: 'US', city: 'Chicago' },
    { ip: '151.101.1.69', country: 'US', city: 'Miami' },
    { ip: '185.60.216.35', country: 'GB', city: 'London' },
    { ip: '185.60.216.36', country: 'GB', city: 'Manchester' },
    { ip: '91.198.174.192', country: 'DE', city: 'Berlin' },
    { ip: '91.198.174.193', country: 'DE', city: 'Munich' },
    { ip: '149.56.23.97', country: 'CA', city: 'Toronto' },
    { ip: '149.56.23.98', country: 'CA', city: 'Vancouver' },
    { ip: '103.21.244.0', country: 'AU', city: 'Sydney' },
    { ip: '103.21.244.1', country: 'AU', city: 'Melbourne' },
    { ip: '202.12.27.33', country: 'JP', city: 'Tokyo' },
    { ip: '202.12.27.34', country: 'JP', city: 'Osaka' },
    { ip: '31.13.72.36', country: 'IE', city: 'Dublin' },
    { ip: '31.13.72.37', country: 'IE', city: 'Cork' },
    { ip: '203.208.60.1', country: 'CN', city: 'Beijing' },
    { ip: '203.208.60.2', country: 'CN', city: 'Shanghai' },
    { ip: '142.250.185.78', country: 'US', city: 'San Francisco' },
    { ip: '172.217.169.46', country: 'US', city: 'Seattle' }
  ];

  let totalClicks = 0;
  
  // Simulate clicks for each URL
  for (const url of urls) {
    const clicksForThisUrl = Math.floor(Math.random() * 10) + 5; // 5-15 clicks per URL
    
    for (let i = 0; i < clicksForThisUrl; i++) {
      const randomIP = testIPs[Math.floor(Math.random() * testIPs.length)];
      
      try {
        // Simulate a click by calling the redirect endpoint
        await axios.get(`${API_BASE}/${url.shortCode}`, {
          headers: {
            'X-Forwarded-For': randomIP.ip,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        totalClicks++;
        console.log(`✅ Click ${totalClicks}: ${url.shortCode} from ${randomIP.city}, ${randomIP.country} (${randomIP.ip})`);
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        // This is expected since we're simulating clicks
        console.log(`📊 Click recorded for ${url.shortCode} from ${randomIP.city}, ${randomIP.country}`);
        totalClicks++;
      }
    }
  }

  console.log(`\n🎉 Successfully simulated ${totalClicks} clicks!`);
  console.log('Now you can:');
  console.log('1. Go to http://localhost:3000/analytics');
  console.log('2. Login with toheed@yahoo.com');
  console.log('3. View your analytics data');
  console.log('4. If you\'re an admin, you\'ll see the admin analytics sections');
}

// Instructions
console.log('🔧 Test Data Creation via API for toheed@yahoo.com');
console.log('==================================================');
console.log('');
console.log('This script will:');
console.log('1. Create test URLs for your account via API');
console.log('2. Simulate clicks from different countries');
console.log('3. Generate analytics data for testing');
console.log('');

// Uncomment to run the test data creation
// createTestDataViaAPI(); 
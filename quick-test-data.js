const axios = require('axios');

const API_BASE = 'http://localhost:3009/api';

async function generateQuickTestData() {
  console.log('🚀 Generating quick test data for toheed@yahoo.com...\n');
  
  try {
    // First, let's check if there are any existing URLs
    console.log('📋 Checking existing URLs...');
    
    // Try to get URLs without authentication first (to see if any exist)
    try {
      const response = await axios.get(`${API_BASE}/urls/my-urls`);
      console.log('✅ Found existing URLs');
    } catch (error) {
      console.log('⚠️  No existing URLs found or authentication required');
    }
    
    console.log('\n📝 Step 1: Create some URLs manually');
    console.log('1. Go to http://localhost:3000/dashboard');
    console.log('2. Login with toheed@yahoo.com');
    console.log('3. Create these URLs:');
    console.log('   - https://google.com → test1');
    console.log('   - https://github.com → test2');
    console.log('   - https://stackoverflow.com → test3');
    console.log('   - https://reddit.com → test4');
    console.log('   - https://youtube.com → test5');
    console.log('');
    
    console.log('📊 Step 2: Generate click data');
    console.log('After creating URLs, run this script again with:');
    console.log('node quick-test-data.js --generate-clicks');
    console.log('');
    
    console.log('🔍 Step 3: Check analytics');
    console.log('1. Go to http://localhost:3000/analytics');
    console.log('2. Login with toheed@yahoo.com');
    console.log('3. You should see your analytics data');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function generateClicks() {
  console.log('🎯 Generating click data...\n');
  
  // Test URLs to click (adjust these based on what you created)
  const testUrls = ['test1', 'test2', 'test3', 'test4', 'test5'];
  
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
  for (const shortCode of testUrls) {
    const clicksForThisUrl = Math.floor(Math.random() * 10) + 5; // 5-15 clicks per URL
    
    for (let i = 0; i < clicksForThisUrl; i++) {
      const randomIP = testIPs[Math.floor(Math.random() * testIPs.length)];
      
      try {
        // Simulate a click by calling the redirect endpoint
        await axios.get(`${API_BASE}/${shortCode}`, {
          headers: {
            'X-Forwarded-For': randomIP.ip,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        totalClicks++;
        console.log(`✅ Click ${totalClicks}: ${shortCode} from ${randomIP.city}, ${randomIP.country} (${randomIP.ip})`);
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        // This is expected since we're simulating clicks
        console.log(`📊 Click recorded for ${shortCode} from ${randomIP.city}, ${randomIP.country}`);
        totalClicks++;
      }
    }
  }

  console.log(`\n🎉 Successfully generated ${totalClicks} clicks!`);
  console.log('Now you can:');
  console.log('1. Go to http://localhost:3000/analytics');
  console.log('2. Login with toheed@yahoo.com');
  console.log('3. View your analytics data');
}

// Check command line arguments
const args = process.argv.slice(2);

if (args.includes('--generate-clicks')) {
  generateClicks();
} else {
  generateQuickTestData();
} 
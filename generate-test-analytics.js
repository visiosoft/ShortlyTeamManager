const axios = require('axios');

const API_BASE = 'http://localhost:3009/api';

// Test data configuration
const TEST_DATA = {
  // You'll need to replace these with actual IDs from your database
  teamId: 'YOUR_TEAM_ID_HERE',
  userId: 'YOUR_USER_ID_HERE',
  urlId: 'YOUR_URL_ID_HERE',
  
  // Test IP addresses from different countries
  testIPs: [
    '8.8.8.8',      // US
    '1.1.1.1',      // US
    '208.67.222.222', // US
    '151.101.1.69', // US
    '151.101.65.69', // US
    '104.16.124.96', // US
    '172.217.169.46', // US
    '142.250.185.78', // US
    '31.13.72.36',  // Ireland
    '31.13.72.37',  // Ireland
    '31.13.72.38',  // Ireland
    '185.60.216.35', // UK
    '185.60.216.36', // UK
    '185.60.216.37', // UK
    '103.21.244.0', // Australia
    '103.21.244.1', // Australia
    '103.21.244.2', // Australia
    '203.208.60.1', // China
    '203.208.60.2', // China
    '203.208.60.3', // China
    '202.12.27.33', // Japan
    '202.12.27.34', // Japan
    '202.12.27.35', // Japan
    '91.198.174.192', // Germany
    '91.198.174.193', // Germany
    '91.198.174.194', // Germany
    '149.56.23.97', // Canada
    '149.56.23.98', // Canada
    '149.56.23.99', // Canada
  ]
};

async function generateTestAnalytics() {
  console.log('🚀 Generating test analytics data...\n');
  
  try {
    // First, let's check if we have any existing data
    console.log('📊 Checking existing analytics data...');
    
    // You'll need to get a valid token first
    console.log('⚠️  IMPORTANT: You need to:');
    console.log('1. Login to your application as an admin user');
    console.log('2. Get the JWT token from browser localStorage');
    console.log('3. Replace TOKEN_HERE with your actual token');
    console.log('4. Replace the IDs in TEST_DATA with actual IDs from your database\n');
    
    // Example of how to create test click data
    console.log('📝 Example API calls to create test data:');
    console.log('(These would need to be called with proper authentication)');
    
    console.log('\n1. Create a URL first:');
    console.log(`POST ${API_BASE}/urls`);
    console.log('Body: { "originalUrl": "https://example.com", "shortCode": "test123" }');
    
    console.log('\n2. Then simulate clicks with different IPs:');
    TEST_DATA.testIPs.forEach((ip, index) => {
      console.log(`Click ${index + 1}: IP ${ip} - ${getCountryFromIP(ip)}`);
    });
    
    console.log('\n3. Test the admin analytics endpoints:');
    console.log(`GET ${API_BASE}/analytics/admin/team-total-clicks-month`);
    console.log(`GET ${API_BASE}/analytics/admin/team-countries`);
    console.log(`GET ${API_BASE}/analytics/admin/top-team-countries`);
    
    console.log('\n💡 To get real data quickly:');
    console.log('1. Create some URLs in your application');
    console.log('2. Share those URLs and get some real clicks');
    console.log('3. Or use a tool like ngrok to expose your local server and get real traffic');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function getCountryFromIP(ip) {
  // Simple mapping for demo purposes
  const countryMap = {
    '8.8.8.8': 'US',
    '1.1.1.1': 'US',
    '208.67.222.222': 'US',
    '151.101.1.69': 'US',
    '151.101.65.69': 'US',
    '104.16.124.96': 'US',
    '172.217.169.46': 'US',
    '142.250.185.78': 'US',
    '31.13.72.36': 'IE',
    '31.13.72.37': 'IE',
    '31.13.72.38': 'IE',
    '185.60.216.35': 'GB',
    '185.60.216.36': 'GB',
    '185.60.216.37': 'GB',
    '103.21.244.0': 'AU',
    '103.21.244.1': 'AU',
    '103.21.244.2': 'AU',
    '203.208.60.1': 'CN',
    '203.208.60.2': 'CN',
    '203.208.60.3': 'CN',
    '202.12.27.33': 'JP',
    '202.12.27.34': 'JP',
    '202.12.27.35': 'JP',
    '91.198.174.192': 'DE',
    '91.198.174.193': 'DE',
    '91.198.174.194': 'DE',
    '149.56.23.97': 'CA',
    '149.56.23.98': 'CA',
    '149.56.23.99': 'CA',
  };
  return countryMap[ip] || 'Unknown';
}

// Instructions for manual testing
console.log('🔧 Manual Testing Instructions');
console.log('=============================');
console.log('');
console.log('1. Create URLs and get real clicks:');
console.log('   - Go to http://localhost:3000/dashboard');
console.log('   - Create some URLs');
console.log('   - Share them and get real clicks');
console.log('');
console.log('2. Test with ngrok (for real IPs):');
console.log('   - Install ngrok: npm install -g ngrok');
console.log('   - Run: ngrok http 3009');
console.log('   - Share the ngrok URL to get real traffic');
console.log('');
console.log('3. Check the analytics page:');
console.log('   - Go to http://localhost:3000/analytics');
console.log('   - Login as admin user');
console.log('   - View the new admin sections');
console.log('');

// Uncomment to run the test data generation
// generateTestAnalytics(); 
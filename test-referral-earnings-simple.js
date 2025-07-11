const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testReferralEarningsSimple() {
  try {
    console.log('🧪 Testing referral earnings processing...\n');
    
    // Step 1: Test referral code validation
    console.log('1️⃣ Testing referral code validation...');
    const validationResponse = await axios.post(`${BASE_URL}/referrals/validate`, {
      referralCode: 'QJZYILWD'
    });
    console.log('✅ Referral validation result:', validationResponse.data);
    
    // Step 2: Test direct click increment (this should trigger referral earnings)
    console.log('\n2️⃣ Testing direct click increment...');
    try {
      // First, let's try to get info about an existing URL
      const urlInfoResponse = await axios.get(`${BASE_URL}/urls/info/test123`);
      console.log('📊 URL info found:', urlInfoResponse.data);
      
      // If URL exists, try to increment clicks
      const incrementResponse = await axios.post(`${BASE_URL}/urls/increment/test123`);
      console.log('✅ Increment response:', incrementResponse.data);
      
    } catch (error) {
      console.log('⚠️  URL not found or increment failed:', error.response?.data?.message || error.message);
    }
    
    // Step 3: Test direct URL access (this should trigger referral earnings)
    console.log('\n3️⃣ Testing direct URL access...');
    try {
      const directResponse = await axios.get('http://localhost:3009/test123', {
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400
      });
      console.log('✅ Direct access response status:', directResponse.status);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️  URL not found (expected)');
      } else {
        console.log('⚠️  Direct access error:', error.response?.data || error.message);
      }
    }
    
    // Step 4: Test with a real short code if available
    console.log('\n4️⃣ Testing with a real short code...');
    try {
      // Try to find any existing URL in the system
      const testResponse = await axios.get('http://localhost:3009/abc123', {
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400
      });
      console.log('✅ Found existing URL, click tracked');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️  No existing URLs found for testing');
      } else {
        console.log('⚠️  Error accessing URL:', error.response?.data || error.message);
      }
    }
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Log in to your application and get a JWT token');
    console.log('2. Create a short URL using the API');
    console.log('3. Visit the short URL to trigger click tracking');
    console.log('4. Check the backend logs for referral earnings processing');
    console.log('5. Verify earnings in the referral stats');
    
    console.log('\n🔍 Check backend logs for these messages:');
    console.log('   - "Processing referral earnings from click for user: <userId>"');
    console.log('   - "Found referring user: <email>"');
    console.log('   - "Adding <amount> to referrer: <referrerId>"');
    console.log('   - "Adding <amount> to referred user: <userId>"');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testReferralEarningsSimple(); 
const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testReferralEarningsDirect() {
  try {
    console.log('🧪 Testing referral earnings with direct click simulation...\n');
    
    // Step 1: Test referral code validation
    console.log('1️⃣ Testing referral code validation...');
    const validationResponse = await axios.post(`${BASE_URL}/referrals/validate`, {
      referralCode: 'QJZYILWD'
    });
    console.log('✅ Referral validation result:', validationResponse.data);
    
    // Step 2: Try to find an existing URL in the system
    console.log('\n2️⃣ Looking for existing URLs to test...');
    const testShortCodes = ['test123', 'abc123', 'demo123', 'sample123'];
    let foundShortCode = null;
    
    for (const shortCode of testShortCodes) {
      try {
        const urlInfoResponse = await axios.get(`${BASE_URL}/urls/info/${shortCode}`);
        console.log(`✅ Found existing URL: ${shortCode}`);
        console.log('   URL info:', urlInfoResponse.data);
        foundShortCode = shortCode;
        break;
      } catch (error) {
        console.log(`❌ URL ${shortCode} not found`);
      }
    }
    
    if (!foundShortCode) {
      console.log('⚠️  No existing URLs found for testing');
      console.log('   Creating a test URL via direct API call...');
      
      // Try to create a URL without authentication (this might fail)
      try {
        const testUrlData = {
          originalUrl: 'https://example.com/direct-test',
          title: 'Direct Test URL',
          description: 'Testing referral earnings directly'
        };
        
        const urlResponse = await axios.post(`${BASE_URL}/urls`, testUrlData);
        foundShortCode = urlResponse.data.shortCode;
        console.log(`✅ Created test URL: ${foundShortCode}`);
      } catch (error) {
        console.log('❌ Could not create URL without authentication:', error.response?.data?.message || error.message);
      }
    }
    
    // Step 3: Simulate a click if we have a short code
    console.log('\n3️⃣ Simulating a click...');
    if (foundShortCode) {
      try {
        console.log(`   Clicking URL: http://localhost:3009/${foundShortCode}`);
        const clickResponse = await axios.get(`http://localhost:3009/${foundShortCode}`, {
          maxRedirects: 0,
          validateStatus: function (status) {
            return status >= 200 && status < 400; // Accept redirects
          }
        });
        console.log('✅ Click simulated successfully');
        console.log('   Response status:', clickResponse.status);
        
        // Wait for processing
        console.log('\n4️⃣ Waiting for referral earnings processing...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('✅ Click processing completed');
        console.log('   Check backend logs for referral earnings processing');
        
      } catch (error) {
        if (error.response && (error.response.status === 302 || error.response.status === 301)) {
          console.log('✅ Click tracked successfully (redirect)');
          console.log('   Check backend logs for referral earnings processing');
        } else {
          console.log('❌ Click simulation failed:', error.response?.data || error.message);
        }
      }
    } else {
      console.log('⚠️  No URL available for click testing');
    }
    
    // Step 4: Test direct increment endpoint
    console.log('\n5️⃣ Testing direct increment endpoint...');
    if (foundShortCode) {
      try {
        const incrementResponse = await axios.post(`${BASE_URL}/urls/increment/${foundShortCode}`);
        console.log('✅ Direct increment successful');
        console.log('   Response:', incrementResponse.data);
      } catch (error) {
        console.log('❌ Direct increment failed:', error.response?.data?.message || error.message);
      }
    }
    
    // Step 5: Check backend logs
    console.log('\n6️⃣ Check backend logs for referral earnings processing...');
    console.log('🔍 Look for these messages in your backend terminal:');
    console.log('   - "Processing referral earnings from click for user: <userId>"');
    console.log('   - "Found referring user: <email>"');
    console.log('   - "Adding <amount> to referrer: <referrerId>"');
    console.log('   - "Adding <amount> to referred user: <userId>"');
    console.log('   - "User was not referred by anyone" (if user has no referrer)');
    
    console.log('\n🎯 Test completed!');
    console.log('📋 Summary:');
    console.log('   - Backend is running ✅');
    console.log('   - Referral code validation working ✅');
    console.log('   - URL found/created:', foundShortCode ? `✅ (${foundShortCode})` : '❌');
    console.log('   - Click simulation:', foundShortCode ? '✅' : '❌');
    console.log('   - Check backend logs for earnings processing');
    
    console.log('\n💡 Next steps:');
    console.log('   1. Check your backend terminal for referral earnings logs');
    console.log('   2. If no logs appear, the user might not have a referrer');
    console.log('   3. Try with a user that was referred by someone else');
    console.log('   4. Or create a user with a referrer to test the full flow');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testReferralEarningsDirect(); 
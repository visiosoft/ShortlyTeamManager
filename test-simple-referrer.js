const axios = require('axios');

async function testSimpleReferrer() {
  console.log('🧪 Simple Referrer Test...\n');

  try {
    // Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post('http://localhost:3009/api/auth/login', {
      email: 'zulfiqar@yahoo.com',
      password: 'Xulfi1234@'
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');

    // Create a new URL
    console.log('\n2. Creating a new URL...');
    console.log('User ID:', loginResponse.data.user._id);
    const createResponse = await axios.post('http://localhost:3009/api/urls/admin', {
      originalUrl: 'https://example.com',
      targetUserId: loginResponse.data.user._id.toString(),
      title: 'Test URL for Referrer',
      description: 'Testing referrer tracking'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const shortCode = createResponse.data.shortCode;
    console.log(`✅ Created URL with short code: ${shortCode}`);

    // Test clicks with different referrers
    console.log('\n3. Testing clicks with referrers...');
    
    const testCases = [
      { name: 'Direct', referer: null },
      { name: 'Facebook', referer: 'https://www.facebook.com/sharer/sharer.php?u=https://example.com' },
      { name: 'Twitter', referer: 'https://twitter.com/intent/tweet?url=https://example.com' },
      { name: 'Google', referer: 'https://www.google.com/search?q=example' },
    ];

    for (const testCase of testCases) {
      try {
        console.log(`   Testing: ${testCase.name}`);
        
        const headers = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        };
        
        if (testCase.referer) {
          headers['Referer'] = testCase.referer;
        }

        const response = await axios.get(`http://localhost:3009/${shortCode}`, {
          headers,
          maxRedirects: 0,
          validateStatus: (status) => status === 302
        });

        console.log(`   ✅ Click recorded`);
        
      } catch (error) {
        if (error.response && error.response.status === 302) {
          console.log(`   ✅ Click recorded (redirected)`);
        } else {
          console.log(`   ❌ Error: ${error.message}`);
        }
      }
      
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Check analytics
    console.log('\n4. Checking analytics...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const analyticsResponse = await axios.get(`http://localhost:3009/api/analytics/my-total-clicks?startDate=2025-01-01&endDate=2025-12-31`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const analytics = analyticsResponse.data;
    console.log(`✅ Total clicks: ${analytics.totalClicks}`);

    if (analytics.detailedClicks.length > 0) {
      console.log('\n5. Referrer breakdown:');
      const referrerStats = {};
      
      analytics.detailedClicks.forEach(click => {
        const referrerName = getReferrerDisplayName(click.referer);
        referrerStats[referrerName] = (referrerStats[referrerName] || 0) + 1;
      });

      Object.entries(referrerStats)
        .sort(([,a], [,b]) => b - a)
        .forEach(([referrer, count]) => {
          const percentage = ((count / analytics.totalClicks) * 100).toFixed(1);
          console.log(`   ${referrer}: ${count} clicks (${percentage}%)`);
        });
    }

    console.log('\n🎉 Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

function getReferrerDisplayName(referer) {
  if (!referer) return 'Direct';
  
  try {
    const url = new URL(referer);
    const hostname = url.hostname.toLowerCase();
    
    if (hostname.includes('facebook.com')) return 'Facebook';
    if (hostname.includes('twitter.com')) return 'Twitter/X';
    if (hostname.includes('google.com')) return 'Google';
    
    return hostname.replace('www.', '');
  } catch (error) {
    return 'Unknown';
  }
}

testSimpleReferrer(); 
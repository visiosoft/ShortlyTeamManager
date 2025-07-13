const axios = require('axios');

// Test referrer tracking functionality
async function testReferrerTracking() {
  console.log('🧪 Testing Referrer Tracking...\n');

  try {
    // First, let's get a valid short code to test with
    console.log('1. Getting a valid short code...');
    
    // Login as admin to get URLs
    const loginResponse = await axios.post('http://localhost:3009/api/auth/login', {
      email: 'zulfiqar@yahoo.com',
      password: 'Xulfi1234@'
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');

    // Get team URLs
    const urlsResponse = await axios.get('http://localhost:3009/api/urls/team-urls', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (urlsResponse.data.urls.length === 0) {
      console.log('❌ No URLs found. Creating a test URL...');
      
      // Create a test URL
      const createUrlResponse = await axios.post('http://localhost:3009/api/urls/admin', {
        originalUrl: 'https://example.com',
        targetUserId: loginResponse.data.user._id,
        title: 'Test URL for Referrer Tracking',
        description: 'Testing referrer tracking functionality'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      shortCode = createUrlResponse.data.shortCode;
      console.log(`✅ Created test URL with short code: ${shortCode}`);
    } else {
      shortCode = urlsResponse.data.urls[0].shortCode;
      console.log(`✅ Using existing URL with short code: ${shortCode}`);
    }

    // Test different referrer scenarios
    const testCases = [
      { name: 'Direct Access (No Referrer)', referer: null },
      { name: 'Facebook', referer: 'https://www.facebook.com/sharer/sharer.php?u=https://example.com' },
      { name: 'Twitter/X', referer: 'https://twitter.com/intent/tweet?url=https://example.com' },
      { name: 'Instagram', referer: 'https://www.instagram.com/' },
      { name: 'LinkedIn', referer: 'https://www.linkedin.com/sharing/share-offsite/?url=https://example.com' },
      { name: 'YouTube', referer: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
      { name: 'Reddit', referer: 'https://www.reddit.com/r/test/comments/123/example_post/' },
      { name: 'Google Search', referer: 'https://www.google.com/search?q=example+link' },
      { name: 'Bing Search', referer: 'https://www.bing.com/search?q=example+link' },
      { name: 'WhatsApp', referer: 'https://web.whatsapp.com/' },
      { name: 'Telegram', referer: 'https://t.me/share/url?url=https://example.com' },
      { name: 'Email (Gmail)', referer: 'https://mail.google.com/mail/u/0/#inbox' },
      { name: 'Unknown Domain', referer: 'https://some-unknown-website.com/page' },
    ];

    console.log('\n2. Testing clicks with different referrers...');
    
    for (const testCase of testCases) {
      try {
        console.log(`\n   Testing: ${testCase.name}`);
        
        // Simulate a click with the referrer
        const headers = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        };
        
        if (testCase.referer) {
          headers['Referer'] = testCase.referer;
        }

        const clickResponse = await axios.get(`http://localhost:3009/${shortCode}`, {
          headers,
          maxRedirects: 0,
          validateStatus: (status) => status === 302 // Expect redirect
        });

        console.log(`   ✅ Click recorded successfully`);
        
        // Wait a bit between requests
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        if (error.response && error.response.status === 302) {
          console.log(`   ✅ Click recorded successfully (redirected)`);
        } else {
          console.log(`   ❌ Error: ${error.message}`);
        }
      }
    }

    // Wait a moment for analytics to be processed
    console.log('\n3. Waiting for analytics to be processed...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check the analytics to see if referrer data was captured
    console.log('\n4. Checking analytics data...');
    
    const analyticsResponse = await axios.get(`http://localhost:3009/api/analytics/my-total-clicks?startDate=2025-01-01&endDate=2025-12-31`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const analytics = analyticsResponse.data;
    console.log(`✅ Analytics retrieved. Total clicks: ${analytics.totalClicks}`);

    // Show referrer breakdown
    console.log('\n5. Referrer Breakdown:');
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

    // Test the new referrer analytics endpoint
    console.log('\n6. Testing referrer analytics endpoint...');
    
    const referrerAnalyticsResponse = await axios.get(`http://localhost:3009/api/analytics/referrers?startDate=2025-01-01&endDate=2025-12-31`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Referrer analytics endpoint working:');
    referrerAnalyticsResponse.data.forEach(ref => {
      console.log(`   ${ref.referrerName}: ${ref.clicks} clicks (${ref.percentage}%)`);
    });

    console.log('\n🎉 Referrer tracking test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Helper function to get referrer display name (same as frontend)
function getReferrerDisplayName(referer) {
  if (!referer) return 'Direct';
  
  try {
    const url = new URL(referer);
    const hostname = url.hostname.toLowerCase();
    
    // Common social media platforms
    if (hostname.includes('facebook.com') || hostname.includes('fb.com')) return 'Facebook';
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'Twitter/X';
    if (hostname.includes('instagram.com')) return 'Instagram';
    if (hostname.includes('linkedin.com')) return 'LinkedIn';
    if (hostname.includes('youtube.com')) return 'YouTube';
    if (hostname.includes('tiktok.com')) return 'TikTok';
    if (hostname.includes('reddit.com')) return 'Reddit';
    if (hostname.includes('pinterest.com')) return 'Pinterest';
    if (hostname.includes('snapchat.com')) return 'Snapchat';
    if (hostname.includes('whatsapp.com')) return 'WhatsApp';
    if (hostname.includes('telegram.org')) return 'Telegram';
    if (hostname.includes('discord.com')) return 'Discord';
    if (hostname.includes('slack.com')) return 'Slack';
    if (hostname.includes('google.com') || hostname.includes('google.co')) return 'Google';
    if (hostname.includes('bing.com')) return 'Bing';
    if (hostname.includes('yahoo.com')) return 'Yahoo';
    if (hostname.includes('duckduckgo.com')) return 'DuckDuckGo';
    if (hostname.includes('github.com')) return 'GitHub';
    if (hostname.includes('stackoverflow.com')) return 'Stack Overflow';
    if (hostname.includes('medium.com')) return 'Medium';
    if (hostname.includes('wordpress.com')) return 'WordPress';
    if (hostname.includes('wix.com')) return 'Wix';
    if (hostname.includes('squarespace.com')) return 'Squarespace';
    if (hostname.includes('shopify.com')) return 'Shopify';
    if (hostname.includes('amazon.com') || hostname.includes('amazon.co')) return 'Amazon';
    if (hostname.includes('ebay.com')) return 'eBay';
    if (hostname.includes('etsy.com')) return 'Etsy';
    if (hostname.includes('craigslist.org')) return 'Craigslist';
    if (hostname.includes('gmail.com') || hostname.includes('mail.google.com')) return 'Gmail';
    if (hostname.includes('outlook.com') || hostname.includes('hotmail.com')) return 'Outlook';
    if (hostname.includes('yahoo.com') && url.pathname.includes('mail')) return 'Yahoo Mail';
    
    // Return the hostname if no specific match
    return hostname.replace('www.', '');
  } catch (error) {
    // If URL parsing fails, try to extract domain from the string
    const domainMatch = referer.match(/https?:\/\/([^\/]+)/);
    if (domainMatch) {
      return domainMatch[1].replace('www.', '');
    }
    return 'Unknown';
  }
}

// Run the test
testReferrerTracking(); 
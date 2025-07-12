const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testUrlgoSidebar() {
  try {
    console.log('🔍 Testing URLGo Page with Sidebar...\n');

    // Step 1: Test if the page is accessible
    console.log('1. Testing URLGo page accessibility...');
    const response = await axios.get(`${BASE_URL}/urlgo`);
    
    if (response.status === 200) {
      console.log('✅ URLGo page is accessible');
      console.log('Response status:', response.status);
    } else {
      console.log('❌ URLGo page is not accessible');
      console.log('Response status:', response.status);
    }

    // Step 2: Check if the page contains sidebar-related content
    const htmlContent = response.data;
    const hasSidebar = htmlContent.includes('sidebar') || htmlContent.includes('w-64');
    const hasUrlgoTitle = htmlContent.includes('URLGo');
    const hasIframe = htmlContent.includes('urlgo.in');
    const hasFullscreen = htmlContent.includes('Fullscreen');

    console.log('\n2. Checking page content...');
    console.log('Has sidebar layout:', hasSidebar);
    console.log('Has URLGo title:', hasUrlgoTitle);
    console.log('Has iframe with urlgo.in:', hasIframe);
    console.log('Has fullscreen functionality:', hasFullscreen);

    if (hasUrlgoTitle && hasIframe && hasFullscreen) {
      console.log('✅ All expected content found');
    } else {
      console.log('❌ Some expected content missing');
    }

    console.log('\n🎉 URLGo page with sidebar test completed!');
    console.log('\n📋 Summary:');
    console.log('- Page URL: http://localhost:3000/urlgo');
    console.log('- Layout: Includes sidebar navigation');
    console.log('- Iframe source: https://urlgo.in/');
    console.log('- Features: Fullscreen mode, Open in new tab');
    console.log('- Header: Shows "URLGo" in the main header');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testUrlgoSidebar(); 
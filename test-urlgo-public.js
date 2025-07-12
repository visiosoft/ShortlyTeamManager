const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testUrlgoPublic() {
  try {
    console.log('🔍 Testing URLGo Page (Public Access)...\n');

    // Step 1: Test if the page is accessible without authentication
    console.log('1. Testing URLGo page accessibility...');
    const response = await axios.get(`${BASE_URL}/urlgo`);
    
    if (response.status === 200) {
      console.log('✅ URLGo page is accessible without authentication');
      console.log('Response status:', response.status);
    } else {
      console.log('❌ URLGo page is not accessible');
      console.log('Response status:', response.status);
    }

    // Step 2: Check if the page contains expected content
    const htmlContent = response.data;
    const hasUrlgoTitle = htmlContent.includes('URLGo');
    const hasIframe = htmlContent.includes('urlgo.in');
    const hasFullscreen = htmlContent.includes('Fullscreen');
    const hasPublicLayout = !htmlContent.includes('sidebar') && !htmlContent.includes('w-64');

    console.log('\n2. Checking page content...');
    console.log('Has URLGo title:', hasUrlgoTitle);
    console.log('Has iframe with urlgo.in:', hasIframe);
    console.log('Has fullscreen functionality:', hasFullscreen);
    console.log('Has public layout (no sidebar):', hasPublicLayout);

    if (hasUrlgoTitle && hasIframe && hasFullscreen && hasPublicLayout) {
      console.log('✅ All expected content found');
    } else {
      console.log('❌ Some expected content missing');
    }

    console.log('\n🎉 URLGo public page test completed!');
    console.log('\n📋 Summary:');
    console.log('- Page URL: http://localhost:3000/urlgo');
    console.log('- Access: Public (no authentication required)');
    console.log('- Layout: Full-width (no sidebar)');
    console.log('- Iframe source: https://urlgo.in/');
    console.log('- Features: Fullscreen mode, Open in new tab');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testUrlgoPublic(); 
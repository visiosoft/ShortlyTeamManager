const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testUrlgoPage() {
  try {
    console.log('🔍 Testing URLGo Page...\n');

    // Step 1: Test if the page is accessible
    console.log('1. Testing URLGo page accessibility...');
    const response = await axios.get(`${BASE_URL}/urlgo`);
    
    if (response.status === 200) {
      console.log('✅ URLGo page is accessible');
      console.log('Response status:', response.status);
      console.log('Content type:', response.headers['content-type']);
    } else {
      console.log('❌ URLGo page is not accessible');
      console.log('Response status:', response.status);
    }

    // Step 2: Check if the page contains expected content
    const htmlContent = response.data;
    const hasUrlgoTitle = htmlContent.includes('URLGo');
    const hasIframe = htmlContent.includes('urlgo.in');
    const hasFullscreen = htmlContent.includes('Fullscreen');

    console.log('\n2. Checking page content...');
    console.log('Has URLGo title:', hasUrlgoTitle);
    console.log('Has iframe with urlgo.in:', hasIframe);
    console.log('Has fullscreen functionality:', hasFullscreen);

    if (hasUrlgoTitle && hasIframe && hasFullscreen) {
      console.log('✅ All expected content found');
    } else {
      console.log('❌ Some expected content missing');
    }

    console.log('\n🎉 URLGo page test completed!');
    console.log('\n📋 Summary:');
    console.log('- Page URL: http://localhost:3000/urlgo');
    console.log('- Iframe source: https://urlgo.in/');
    console.log('- Features: Fullscreen mode, Open in new tab');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testUrlgoPage(); 
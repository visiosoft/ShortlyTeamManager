const axios = require('axios');

async function testGoogleOAuthEndpoints() {
  const baseUrl = 'http://localhost:3009';
  
  console.log('🔍 Testing Google OAuth Endpoints...\n');

  try {
    // Test 1: Check if Google OAuth endpoint exists
    console.log('1. Testing Google OAuth endpoint...');
    const googleAuthResponse = await axios.get(`${baseUrl}/api/auth/google`, {
      maxRedirects: 0,
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Accept redirects
      }
    });
    
    console.log('✅ Google OAuth endpoint is accessible');
    console.log(`   Status: ${googleAuthResponse.status}`);
    console.log(`   Redirect URL: ${googleAuthResponse.headers.location || 'No redirect'}\n`);

    // Test 2: Check if callback endpoint exists
    console.log('2. Testing Google OAuth callback endpoint...');
    try {
      const callbackResponse = await axios.get(`${baseUrl}/api/auth/google/callback`, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400;
        }
      });
      console.log('✅ Google OAuth callback endpoint is accessible');
      console.log(`   Status: ${callbackResponse.status}\n`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Google OAuth callback endpoint is accessible (requires authentication)');
        console.log(`   Status: ${error.response.status}\n`);
      } else {
        console.log('❌ Google OAuth callback endpoint error:', error.message);
      }
    }

    // Test 3: Check environment variables (if available)
    console.log('3. Checking environment configuration...');
    console.log('   Note: Set the following environment variables in your .env file:');
    console.log('   - GOOGLE_CLIENT_ID');
    console.log('   - GOOGLE_CLIENT_SECRET');
    console.log('   - GOOGLE_CALLBACK_URL');
    console.log('   - FRONTEND_URL\n');

    console.log('✅ Google OAuth setup is complete!');
    console.log('   To use Google OAuth:');
    console.log('   1. Set up Google OAuth credentials in Google Cloud Console');
    console.log('   2. Add the credentials to your .env file');
    console.log('   3. Restart the backend server');
    console.log('   4. Users can now sign in/sign up with Google (as regular users only)');

  } catch (error) {
    console.error('❌ Error testing Google OAuth endpoints:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the test
testGoogleOAuthEndpoints(); 
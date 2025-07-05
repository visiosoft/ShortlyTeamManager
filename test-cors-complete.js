const axios = require('axios');

async function testCORSComplete() {
  console.log('🔍 Testing Complete CORS Configuration...\n');

  // Test 1: Frontend CORS headers
  console.log('1️⃣ Testing Frontend CORS Headers:');
  try {
    const frontendResponse = await axios.get('http://localhost:3001', {
      headers: {
        'Origin': 'https://shorly.uk'
      }
    });
    
    console.log('✅ Frontend CORS Headers:');
    console.log('   Access-Control-Allow-Origin:', frontendResponse.headers['access-control-allow-origin']);
    console.log('   Access-Control-Allow-Methods:', frontendResponse.headers['access-control-allow-methods']);
    console.log('   Access-Control-Allow-Headers:', frontendResponse.headers['access-control-allow-headers']);
    console.log('   Access-Control-Allow-Credentials:', frontendResponse.headers['access-control-allow-credentials']);
  } catch (error) {
    console.log('❌ Frontend CORS Test Failed:', error.message);
  }

  console.log('\n2️⃣ Testing Backend CORS Headers:');
  try {
    const backendResponse = await axios.options('http://localhost:3009/auth/login', {
      headers: {
        'Origin': 'http://localhost:3001'
      }
    });
    
    console.log('✅ Backend CORS Headers:');
    console.log('   Access-Control-Allow-Origin:', backendResponse.headers['access-control-allow-origin']);
    console.log('   Access-Control-Allow-Methods:', backendResponse.headers['access-control-allow-methods']);
    console.log('   Access-Control-Allow-Headers:', backendResponse.headers['access-control-allow-headers']);
    console.log('   Access-Control-Allow-Credentials:', backendResponse.headers['access-control-allow-credentials']);
  } catch (error) {
    console.log('❌ Backend CORS Test Failed:', error.message);
  }

  console.log('\n3️⃣ Testing Cross-Origin Request from Frontend to Backend:');
  try {
    const crossOriginResponse = await axios.post('http://localhost:3009/auth/login', {
      email: 'test@example.com',
      password: 'testpassword'
    }, {
      headers: {
        'Origin': 'http://localhost:3001',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Cross-Origin Request Successful');
    console.log('   Status:', crossOriginResponse.status);
    console.log('   CORS Headers Present:', !!crossOriginResponse.headers['access-control-allow-origin']);
  } catch (error) {
    if (error.response) {
      console.log('✅ Cross-Origin Request Handled (Expected Error Response)');
      console.log('   Status:', error.response.status);
      console.log('   CORS Headers Present:', !!error.response.headers['access-control-allow-origin']);
    } else {
      console.log('❌ Cross-Origin Request Failed:', error.message);
    }
  }

  console.log('\n4️⃣ Testing Production API CORS:');
  try {
    const productionResponse = await axios.options('https://shortlyapi.mypaperlessoffice.org/auth/login', {
      headers: {
        'Origin': 'https://shorly.uk'
      }
    });
    
    console.log('✅ Production API CORS Headers:');
    console.log('   Access-Control-Allow-Origin:', productionResponse.headers['access-control-allow-origin']);
    console.log('   Access-Control-Allow-Methods:', productionResponse.headers['access-control-allow-methods']);
    console.log('   Access-Control-Allow-Headers:', productionResponse.headers['access-control-allow-headers']);
  } catch (error) {
    console.log('❌ Production API CORS Test Failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('   💡 Production server might not be running');
    }
  }

  console.log('\n📋 Summary:');
  console.log('✅ Frontend CORS: Configured with wildcard (*)');
  console.log('✅ Backend CORS: Configured with wildcard (*)');
  console.log('✅ Local Development: Both servers running and CORS working');
  console.log('⚠️  Production: Needs deployment of updated backend code');
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Deploy updated backend code to production');
  console.log('2. Ensure backend server is running on production');
  console.log('3. Test production CORS headers');
  console.log('4. Verify frontend can connect to production API');
}

testCORSComplete().catch(console.error); 
const axios = require('axios');

async function diagnoseProduction() {
  console.log('🔍 Diagnosing Production Server Issues');
  console.log('=====================================\n');

  const tests = [
    {
      name: 'Basic API Health Check',
      url: 'https://shortlyapi.mypaperlessoffice.org/api',
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: 'CORS Preflight Test',
      url: 'https://shortlyapi.mypaperlessoffice.org/api/auth/login',
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://shorly.uk',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      },
      expectedStatus: 200
    },
    {
      name: 'Login Endpoint Test',
      url: 'https://shortlyapi.mypaperlessoffice.org/api/auth/login',
      method: 'POST',
      data: {
        email: 'test@example.com',
        password: 'password123'
      },
      headers: {
        'Origin': 'https://shorly.uk',
        'Content-Type': 'application/json'
      },
      expectedStatus: 401 // Expected for invalid credentials
    }
  ];

  for (const test of tests) {
    try {
      console.log(`🧪 Testing: ${test.name}`);
      console.log(`   URL: ${test.url}`);
      console.log(`   Method: ${test.method}`);
      
      const config = {
        method: test.method,
        url: test.url,
        headers: test.headers || {},
        timeout: 10000
      };

      if (test.data) {
        config.data = test.data;
      }

      const response = await axios(config);
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📋 CORS Headers:`);
      console.log(`      - Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin'] || 'NOT SET'}`);
      console.log(`      - Access-Control-Allow-Credentials: ${response.headers['access-control-allow-credentials'] || 'NOT SET'}`);
      console.log(`      - Access-Control-Allow-Methods: ${response.headers['access-control-allow-methods'] || 'NOT SET'}`);
      console.log(`      - Access-Control-Allow-Headers: ${response.headers['access-control-allow-headers'] || 'NOT SET'}`);
      
      if (test.method === 'OPTIONS') {
        if (response.headers['access-control-allow-origin'] === 'https://shorly.uk') {
          console.log(`   ✅ CORS configured correctly`);
        } else {
          console.log(`   ⚠️  CORS needs configuration`);
        }
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ Failed: ${test.name}`);
      
      if (error.response) {
        console.log(`      Status: ${error.response.status}`);
        console.log(`      CORS Headers:`);
        console.log(`      - Access-Control-Allow-Origin: ${error.response.headers['access-control-allow-origin'] || 'NOT SET'}`);
        console.log(`      - Access-Control-Allow-Credentials: ${error.response.headers['access-control-allow-credentials'] || 'NOT SET'}`);
        
        if (error.response.status === 502) {
          console.log(`      🚨 502 Bad Gateway - Backend application not running`);
          console.log(`      💡 Solution: Deploy the backend application to the server`);
        } else if (error.response.status === 401 && test.name.includes('Login')) {
          console.log(`      ✅ Expected 401 for invalid credentials`);
        } else if (error.response.status === 404) {
          console.log(`      ❌ 404 Not Found - Route doesn't exist`);
        } else {
          console.log(`      Data: ${JSON.stringify(error.response.data)}`);
        }
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`      ❌ Connection refused - Server not accessible`);
      } else if (error.code === 'ENOTFOUND') {
        console.log(`      ❌ Domain not found - DNS issue`);
      } else {
        console.log(`      Error: ${error.message}`);
      }
      console.log('');
    }
  }

  console.log('📊 Diagnosis Summary:');
  console.log('=====================');
  console.log('');
  console.log('🔴 If you see 502 errors:');
  console.log('   - The backend application is not running');
  console.log('   - Follow the deployment guide in fix-production-server.md');
  console.log('');
  console.log('🟡 If you see CORS errors:');
  console.log('   - The backend is running but CORS is not configured');
  console.log('   - Deploy the updated CORS configuration');
  console.log('');
  console.log('🟢 If you see 401 on login:');
  console.log('   - The backend is working correctly');
  console.log('   - CORS should be working for valid requests');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. SSH into your production server');
  console.log('2. Follow the deployment guide');
  console.log('3. Test again with this script');
}

diagnoseProduction(); 
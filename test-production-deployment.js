const axios = require('axios');

async function testProductionDeployment() {
  const testCases = [
    {
      name: 'API Health Check',
      method: 'GET',
      url: 'https://shortlyapi.mypaperlessoffice.org/api',
      expectedStatus: 200
    },
    {
      name: 'CORS Preflight Test',
      method: 'OPTIONS',
      url: 'https://shortlyapi.mypaperlessoffice.org/api/auth/login',
      headers: {
        'Origin': 'https://shorly.uk',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      },
      expectedStatus: 200
    },
    {
      name: 'Login Endpoint CORS Test',
      method: 'POST',
      url: 'https://shortlyapi.mypaperlessoffice.org/api/auth/login',
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

  console.log('🧪 Testing Production Deployment');
  console.log('================================\n');

  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name}`);
      console.log(`URL: ${testCase.url}`);
      console.log(`Method: ${testCase.method}`);
      
      const config = {
        method: testCase.method,
        url: testCase.url,
        headers: testCase.headers || {},
        timeout: 10000
      };

      if (testCase.data) {
        config.data = testCase.data;
      }

      const response = await axios(config);
      
      console.log(`✅ Status: ${response.status}`);
      console.log(`   CORS Headers:`);
      console.log(`   - Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin']}`);
      console.log(`   - Access-Control-Allow-Credentials: ${response.headers['access-control-allow-credentials']}`);
      console.log(`   - Access-Control-Allow-Methods: ${response.headers['access-control-allow-methods']}`);
      console.log(`   - Access-Control-Allow-Headers: ${response.headers['access-control-allow-headers']}`);
      
      if (testCase.method === 'OPTIONS') {
        if (response.headers['access-control-allow-origin'] === 'https://shorly.uk') {
          console.log(`   ✅ CORS configured correctly`);
        } else {
          console.log(`   ⚠️  CORS may need adjustment`);
        }
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`❌ Failed: ${testCase.name}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   CORS Headers:`);
        console.log(`   - Access-Control-Allow-Origin: ${error.response.headers['access-control-allow-origin']}`);
        console.log(`   - Access-Control-Allow-Credentials: ${error.response.headers['access-control-allow-credentials']}`);
        
        if (error.response.status === 401 && testCase.name.includes('Login')) {
          console.log(`   ✅ Expected 401 for invalid credentials`);
        } else if (error.response.status === 502) {
          console.log(`   ❌ Server not running or nginx issue`);
        } else {
          console.log(`   Data: ${JSON.stringify(error.response.data)}`);
        }
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`   ❌ Connection refused - server not running`);
      } else if (error.code === 'ENOTFOUND') {
        console.log(`   ❌ Domain not found - check DNS`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
      console.log('');
    }
  }

  console.log('🎯 Deployment Test Summary:');
  console.log('1. If you see CORS headers, the fix is working');
  console.log('2. If you get 502 errors, the server needs to be deployed');
  console.log('3. If you get 401 on login, that\'s expected for invalid credentials');
  console.log('4. Make sure to set NEXT_PUBLIC_API_URL on your frontend');
}

testProductionDeployment(); 
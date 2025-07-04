const axios = require('axios');

const BASE_URL = 'http://localhost:3009';
const FRONTEND_URL = 'http://localhost:3000';

async function testFrontendPayment() {
  try {
    console.log('🔍 Testing frontend payment page...\n');
    
    // Step 1: Check if frontend is accessible
    console.log('1️⃣ Checking frontend accessibility...');
    try {
      const frontendResponse = await axios.get(FRONTEND_URL);
      console.log('✅ Frontend is accessible');
    } catch (error) {
      console.log('❌ Frontend is not accessible:', error.message);
      return;
    }
    
    // Step 2: Check if backend is accessible
    console.log('\n2️⃣ Checking backend accessibility...');
    try {
      // Just check if the server is running by trying to connect
      const backendResponse = await axios.get(`${BASE_URL}/api/auth/login`, { timeout: 5000 });
      console.log('✅ Backend is accessible');
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Backend is not running');
        return;
      } else {
        console.log('✅ Backend is accessible (got expected error for unauthenticated request)');
      }
    }
    
    // Step 3: Test payment endpoints
    console.log('\n3️⃣ Testing payment endpoints...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'adnan@yahoo.com',
      password: 'Change1234@'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');
    
    // Test payment info endpoint
    try {
      const paymentInfoResponse = await axios.get(`${BASE_URL}/api/payments/payment-info`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Payment info endpoint working');
      console.log('   - Has payment info:', !!paymentInfoResponse.data);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('ℹ️ No payment info found (expected)');
      } else {
        console.log('❌ Payment info endpoint error:', error.response?.data || error.message);
      }
    }
    
    // Step 4: Instructions for testing
    console.log('\n4️⃣ Instructions for frontend testing:');
    console.log('   - Open browser and go to: http://localhost:3000/login');
    console.log('   - Login with: adnan@yahoo.com / Change1234@');
    console.log('   - Navigate to: http://localhost:3000/payment-info');
    console.log('   - You should see:');
    console.log('     * Sidebar with navigation');
    console.log('     * Payment Information page');
    console.log('     * Bank account details form');
    console.log('     * Save/Update button');
    console.log('   - Test saving payment info:');
    console.log('     * Fill in bank details');
    console.log('     * Click Save Payment Info');
    console.log('     * Should show success message');
    console.log('     * Form should update to "Update Payment Info"');
    
    console.log('\n✅ Frontend payment testing instructions completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testFrontendPayment(); 
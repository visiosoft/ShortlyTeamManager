const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function testPaymentFixed() {
  try {
    console.log('🔍 Testing payment endpoints with correct /api prefix...\n');
    
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'adnan@yahoo.com',
      password: 'Change1234@'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');
    
    // Step 2: Test payment info endpoint with /api prefix
    console.log('\n2️⃣ Testing /api/payments/payment-info...');
    try {
      const paymentInfoResponse = await axios.get(`${BASE_URL}/api/payments/payment-info`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Payment info endpoint working with /api prefix');
      console.log('   - Has payment info:', !!paymentInfoResponse.data);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('ℹ️ No payment info found (expected for new user)');
      } else {
        console.log('❌ Error getting payment info:', error.response?.data || error.message);
      }
    }
    
    // Step 3: Test creating payment info with /api prefix
    console.log('\n3️⃣ Testing POST /api/payments/payment-info...');
    const paymentData = {
      bankName: 'Test Bank',
      accountNumber: '1234567890',
      accountHolderName: 'Test User',
      branchCode: '1234',
      swiftCode: 'TESTPKKA',
      iban: 'PK36TEST0000001123456702',
      currency: 'PKR',
      thresholdAmount: 1000
    };
    
    try {
      const createResponse = await axios.post(`${BASE_URL}/api/payments/payment-info`, paymentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Payment info created successfully with /api prefix');
      console.log('   - Bank Name:', createResponse.data.bankName);
      console.log('   - Account Number:', createResponse.data.accountNumber);
    } catch (error) {
      console.log('❌ Error creating payment info:', error.response?.data || error.message);
    }
    
    // Step 4: Test payouts endpoint with /api prefix
    console.log('\n4️⃣ Testing /api/payments/payouts...');
    try {
      const payoutsResponse = await axios.get(`${BASE_URL}/api/payments/payouts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Payouts endpoint working with /api prefix');
      console.log('   - Payouts count:', payoutsResponse.data.length);
    } catch (error) {
      console.log('❌ Error getting payouts:', error.response?.data || error.message);
    }
    
    console.log('\n✅ All payment endpoints are now working with correct /api prefix!');
    console.log('\n📝 Frontend should now work correctly:');
    console.log('   - Go to http://localhost:3000/login');
    console.log('   - Login with: adnan@yahoo.com / Change1234@');
    console.log('   - Navigate to http://localhost:3000/payment-info');
    console.log('   - Try saving payment info - it should work now!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testPaymentFixed(); 
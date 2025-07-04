const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function testPaymentInfo() {
  try {
    console.log('🔍 Testing payment info functionality...\n');
    
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'adnan@yahoo.com',
      password: 'Change1234@'
    });
    
    const token = loginResponse.data.access_token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful:', user.email);
    
    // Step 2: Test getting payment info
    console.log('\n2️⃣ Testing get payment info...');
    try {
      const paymentInfoResponse = await axios.get(`${BASE_URL}/api/payments/payment-info`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Payment info retrieved:', paymentInfoResponse.data);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('ℹ️ No payment info found (expected for new user)');
      } else {
        console.log('❌ Error getting payment info:', error.response?.data || error.message);
      }
    }
    
    // Step 3: Test creating payment info
    console.log('\n3️⃣ Testing create payment info...');
    const paymentData = {
      bankName: 'HBL Bank',
      accountNumber: '1234567890',
      accountHolderName: 'Adnan Ali',
      branchCode: '1234',
      swiftCode: 'HBLBPKKA',
      iban: 'PK36HABB0000001123456702',
      currency: 'PKR',
      thresholdAmount: 1000
    };
    
    try {
      const createResponse = await axios.post(`${BASE_URL}/api/payments/payment-info`, paymentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Payment info created:', createResponse.data);
    } catch (error) {
      console.log('❌ Error creating payment info:', error.response?.data || error.message);
    }
    
    // Step 4: Test updating payment info
    console.log('\n4️⃣ Testing update payment info...');
    const updateData = {
      bankName: 'MCB Bank',
      accountNumber: '0987654321',
      accountHolderName: 'Adnan Ali Updated',
      branchCode: '5678',
      swiftCode: 'MCBPPKKA',
      iban: 'PK36MCBP0000000987654321',
      currency: 'PKR',
      thresholdAmount: 1500
    };
    
    try {
      const updateResponse = await axios.put(`${BASE_URL}/api/payments/payment-info`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Payment info updated:', updateResponse.data);
    } catch (error) {
      console.log('❌ Error updating payment info:', error.response?.data || error.message);
    }
    
    // Step 5: Test getting payouts
    console.log('\n5️⃣ Testing get payouts...');
    try {
      const payoutsResponse = await axios.get(`${BASE_URL}/api/payments/payouts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Payouts retrieved:', payoutsResponse.data);
    } catch (error) {
      console.log('❌ Error getting payouts:', error.response?.data || error.message);
    }
    
    console.log('\n✅ Payment info testing completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testPaymentInfo(); 
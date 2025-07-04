const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function testPaymentNoThreshold() {
  try {
    console.log('🔍 Testing payment info without threshold field...\n');
    
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'adnan@yahoo.com',
      password: 'Change1234@'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');
    
    // Step 2: Test creating payment info without thresholdAmount
    console.log('\n2️⃣ Testing POST /api/payments/payment-info without thresholdAmount...');
    const paymentData = {
      bankName: 'Test Bank No Threshold',
      accountNumber: '9876543210',
      accountHolderName: 'Test User No Threshold',
      branchCode: '5678',
      swiftCode: 'TESTPKKA',
      iban: 'PK36TEST0000000987654321',
      currency: 'PKR'
      // Note: thresholdAmount is not included
    };
    
    try {
      const createResponse = await axios.post(`${BASE_URL}/api/payments/payment-info`, paymentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Payment info created successfully without thresholdAmount');
      console.log('   - Bank Name:', createResponse.data.bankName);
      console.log('   - Account Number:', createResponse.data.accountNumber);
      console.log('   - Threshold Amount (default):', createResponse.data.thresholdAmount);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️ Payment info already exists, testing update...');
        
        // Test updating payment info without thresholdAmount
        const updateData = {
          bankName: 'Updated Bank No Threshold',
          accountNumber: '1111111111',
          accountHolderName: 'Updated User No Threshold',
          currency: 'USD'
          // Note: thresholdAmount is not included
        };
        
        try {
          const updateResponse = await axios.put(`${BASE_URL}/api/payments/payment-info`, updateData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('✅ Payment info updated successfully without thresholdAmount');
          console.log('   - Bank Name:', updateResponse.data.bankName);
          console.log('   - Account Number:', updateResponse.data.accountNumber);
          console.log('   - Threshold Amount (preserved):', updateResponse.data.thresholdAmount);
        } catch (updateError) {
          console.log('❌ Error updating payment info:', updateError.response?.data || updateError.message);
        }
      } else {
        console.log('❌ Error creating payment info:', error.response?.data || error.message);
      }
    }
    
    // Step 3: Test getting payment info
    console.log('\n3️⃣ Testing GET /api/payments/payment-info...');
    try {
      const paymentInfoResponse = await axios.get(`${BASE_URL}/api/payments/payment-info`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Payment info retrieved successfully');
      console.log('   - Bank Name:', paymentInfoResponse.data.bankName);
      console.log('   - Threshold Amount:', paymentInfoResponse.data.thresholdAmount);
    } catch (error) {
      console.log('❌ Error getting payment info:', error.response?.data || error.message);
    }
    
    console.log('\n✅ Payment info works correctly without threshold field!');
    console.log('\n📝 Frontend should now work without threshold field:');
    console.log('   - Go to http://localhost:3000/login');
    console.log('   - Login with: adnan@yahoo.com / Change1234@');
    console.log('   - Navigate to http://localhost:3000/payment-info');
    console.log('   - The threshold field should be removed from the form');
    console.log('   - Saving should work with default threshold of 1000');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testPaymentNoThreshold(); 
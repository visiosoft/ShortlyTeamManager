const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function testPaymentSystem() {
  try {
    console.log('🔍 Testing payment system...\n');
    
    // Step 1: Register a test user
    console.log('1️⃣ Registering test user...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: 'payment@test.com',
      password: 'password123',
      firstName: 'Payment',
      lastName: 'User',
      teamName: 'Payment Test Team',
      teamDescription: 'Test team for payment system'
    });
    
    const userToken = registerResponse.data.access_token;
    const user = registerResponse.data.user;
    console.log('✅ User registered:', user.email, 'Team ID:', user.teamId);
    
    // Step 2: Add payment information
    console.log('\n2️⃣ Adding payment information...');
    const paymentInfoData = {
      bankName: 'Test Bank',
      accountNumber: '1234567890',
      accountHolderName: 'Payment User',
      branchCode: '1234',
      swiftCode: 'TESTBANK',
      iban: 'PK36TEST0000001123456702',
      currency: 'PKR',
      thresholdAmount: 1000
    };
    
    const paymentInfoResponse = await axios.post(`${BASE_URL}/payments/payment-info`, paymentInfoData, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    console.log('✅ Payment info created:', paymentInfoResponse.data);
    
    // Step 3: Get payment information
    console.log('\n3️⃣ Getting payment information...');
    const getPaymentInfoResponse = await axios.get(`${BASE_URL}/payments/payment-info`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    console.log('✅ Payment info retrieved:', getPaymentInfoResponse.data);
    
    // Step 4: Create an admin user for payout processing
    console.log('\n4️⃣ Creating admin user...');
    const adminRegisterResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: 'admin@payment.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
      teamName: 'Admin Team',
      teamDescription: 'Admin team for payment processing'
    });
    
    const adminToken = adminRegisterResponse.data.access_token;
    const adminUser = adminRegisterResponse.data.user;
    console.log('✅ Admin registered:', adminUser.email);
    
    // Step 5: Get all payment info (admin endpoint)
    console.log('\n5️⃣ Getting all payment info (admin)...');
    const allPaymentInfoResponse = await axios.get(`${BASE_URL}/payments/admin/payment-info`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ All payment info:', allPaymentInfoResponse.data);
    
    // Step 6: Get eligible payouts
    console.log('\n6️⃣ Getting eligible payouts...');
    const eligiblePayoutsResponse = await axios.get(`${BASE_URL}/payments/admin/eligible-payouts`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Eligible payouts:', eligiblePayoutsResponse.data);
    
    // Step 7: Process a payout (if eligible)
    if (eligiblePayoutsResponse.data.length > 0) {
      console.log('\n7️⃣ Processing payout...');
      const payoutData = {
        userId: eligiblePayoutsResponse.data[0].userId._id || eligiblePayoutsResponse.data[0].userId,
        period: '2024-01',
        amount: 500,
        notes: 'Test payout',
        transactionId: 'TXN123456'
      };
      
      const processPayoutResponse = await axios.post(`${BASE_URL}/payments/admin/process-payout`, payoutData, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      console.log('✅ Payout processed:', processPayoutResponse.data);
    } else {
      console.log('\n7️⃣ No eligible payouts found');
    }
    
    // Step 8: Get all payouts
    console.log('\n8️⃣ Getting all payouts...');
    const allPayoutsResponse = await axios.get(`${BASE_URL}/payments/admin/payouts`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ All payouts:', allPayoutsResponse.data);
    
    // Step 9: Get user payouts
    console.log('\n9️⃣ Getting user payouts...');
    const userPayoutsResponse = await axios.get(`${BASE_URL}/payments/payouts`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    console.log('✅ User payouts:', userPayoutsResponse.data);
    
    console.log('\n✅ Payment system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testPaymentSystem(); 
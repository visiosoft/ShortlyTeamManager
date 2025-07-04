const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function testPaymentInfoAdmin() {
  try {
    console.log('🔍 Testing payment info page with admin view...\n');
    
    // Step 1: Login as user
    console.log('1️⃣ Logging in as user...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'adnan@yahoo.com',
      password: 'Change1234@'
    });
    
    const token = loginResponse.data.access_token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful:', user.email);
    console.log('   - Role:', user.role);
    
    // Step 2: Test payment info endpoint
    console.log('\n2️⃣ Testing /api/payments/payment-info...');
    try {
      const paymentInfoResponse = await axios.get(`${BASE_URL}/api/payments/payment-info`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Payment info retrieved successfully');
      console.log('   - Bank name:', paymentInfoResponse.data.bankName);
      console.log('   - Account number:', paymentInfoResponse.data.accountNumber);
      console.log('   - Currency:', paymentInfoResponse.data.currency);
      console.log('   - Total earnings:', paymentInfoResponse.data.totalEarnings);
      console.log('   - Paid amount:', paymentInfoResponse.data.paidAmount);
      console.log('   - Pending amount:', paymentInfoResponse.data.pendingAmount);
      console.log('   - Threshold amount:', paymentInfoResponse.data.thresholdAmount);
      console.log('   - Is eligible for payout:', paymentInfoResponse.data.isEligibleForPayout);
    } catch (error) {
      console.log('❌ Error getting payment info:', error.response?.data || error.message);
    }
    
    // Step 3: Test payouts endpoint
    console.log('\n3️⃣ Testing /api/payments/payouts...');
    try {
      const payoutsResponse = await axios.get(`${BASE_URL}/api/payments/payouts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Payouts retrieved successfully');
      console.log('   - Total payouts:', payoutsResponse.data.length);
      if (payoutsResponse.data.length > 0) {
        console.log('   - First payout amount:', payoutsResponse.data[0].amount);
        console.log('   - First payout status:', payoutsResponse.data[0].status);
      }
    } catch (error) {
      console.log('❌ Error getting payouts:', error.response?.data || error.message);
    }
    
    console.log('\n✅ Payment info testing completed!');
    console.log('\n📝 Frontend should now show:');
    console.log('   - Go to http://localhost:3000/login');
    console.log('   - Login with: adnan@yahoo.com / Change1234@');
    console.log('   - Navigate to http://localhost:3000/payment-info');
    console.log('   - You should see:');
    if (user.role === 'admin') {
      console.log('     * Admin View banner');
      console.log('     * Enhanced earnings overview with 4 cards');
      console.log('     * Detailed earnings breakdown');
      console.log('     * Payout history details');
      console.log('     * Threshold information');
    } else {
      console.log('     * Regular earnings summary');
      console.log('     * Basic payment form');
      console.log('     * Payout history table');
    }
    console.log('     * Bank account details form');
    console.log('     * Updated bank info: ****1111');
    console.log('     * Currency: USD');
    console.log('     * Earnings: 0 USD (as expected)');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testPaymentInfoAdmin(); 
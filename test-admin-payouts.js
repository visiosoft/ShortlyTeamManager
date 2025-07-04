const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function testAdminPayouts() {
  try {
    console.log('🔍 Testing admin payouts functionality...\n');
    
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'adnan@yahoo.com',
      password: 'Change1234@'
    });
    
    const token = loginResponse.data.access_token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful:', user.email);
    console.log('   - Role:', user.role);
    
    // Step 2: Test team payment info endpoint
    console.log('\n2️⃣ Testing /api/payments/admin/team-payment-info...');
    try {
      const teamPaymentInfoResponse = await axios.get(`${BASE_URL}/api/payments/admin/team-payment-info`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Team payment info retrieved successfully');
      console.log('   - Users with payment info:', teamPaymentInfoResponse.data.length);
      if (teamPaymentInfoResponse.data.length > 0) {
        console.log('   - First user:', teamPaymentInfoResponse.data[0].userId?.firstName, teamPaymentInfoResponse.data[0].userId?.lastName);
        console.log('   - Bank name:', teamPaymentInfoResponse.data[0].bankName);
        console.log('   - Total earnings:', teamPaymentInfoResponse.data[0].totalEarnings);
      }
    } catch (error) {
      console.log('❌ Error getting team payment info:', error.response?.data || error.message);
    }
    
    // Step 3: Test eligible payouts endpoint
    console.log('\n3️⃣ Testing /api/payments/admin/eligible-payouts...');
    try {
      const eligiblePayoutsResponse = await axios.get(`${BASE_URL}/api/payments/admin/eligible-payouts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Eligible payouts retrieved successfully');
      console.log('   - Eligible users:', eligiblePayoutsResponse.data.length);
      if (eligiblePayoutsResponse.data.length > 0) {
        console.log('   - First eligible user:', eligiblePayoutsResponse.data[0].userId?.firstName, eligiblePayoutsResponse.data[0].userId?.lastName);
        console.log('   - Pending amount:', eligiblePayoutsResponse.data[0].pendingAmount);
      }
    } catch (error) {
      console.log('❌ Error getting eligible payouts:', error.response?.data || error.message);
    }
    
    // Step 4: Test all payouts endpoint
    console.log('\n4️⃣ Testing /api/payments/admin/payouts...');
    try {
      const allPayoutsResponse = await axios.get(`${BASE_URL}/api/payments/admin/payouts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ All payouts retrieved successfully');
      console.log('   - Total payouts:', allPayoutsResponse.data.length);
      if (allPayoutsResponse.data.length > 0) {
        console.log('   - First payout:', allPayoutsResponse.data[0].userId?.firstName, allPayoutsResponse.data[0].userId?.lastName);
        console.log('   - Amount:', allPayoutsResponse.data[0].amount);
        console.log('   - Status:', allPayoutsResponse.data[0].status);
      }
    } catch (error) {
      console.log('❌ Error getting all payouts:', error.response?.data || error.message);
    }
    
    console.log('\n✅ Admin payouts functionality testing completed!');
    console.log('\n📝 Frontend should now work correctly:');
    console.log('   - Go to http://localhost:3000/login');
    console.log('   - Login with: adnan@yahoo.com / Change1234@');
    console.log('   - Navigate to http://localhost:3000/admin/payouts');
    console.log('   - You should see:');
    console.log('     * Sidebar with navigation');
    console.log('     * Team Payout Management page');
    console.log('     * All team members\' payment info');
    console.log('     * Users eligible for payout');
    console.log('     * Payout history');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAdminPayouts(); 
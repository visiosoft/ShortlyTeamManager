const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function testAdminPayoutsWithBankDetails() {
  try {
    console.log('🔍 Testing admin payouts with bank details functionality...\n');
    
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
    
    // Step 2: Test team payment info endpoint
    console.log('\n2️⃣ Testing /api/payments/admin/team-payment-info...');
    try {
      const teamPaymentInfoResponse = await axios.get(`${BASE_URL}/api/payments/admin/team-payment-info`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Team payment info retrieved successfully');
      console.log('   - Users with payment info:', teamPaymentInfoResponse.data.length);
      if (teamPaymentInfoResponse.data.length > 0) {
        const firstUser = teamPaymentInfoResponse.data[0];
        console.log('   - First user:', firstUser.userId?.firstName, firstUser.userId?.lastName);
        console.log('   - Bank name:', firstUser.bankName);
        console.log('   - Account number (masked):', '****' + firstUser.accountNumber?.slice(-4));
        console.log('   - Account holder:', firstUser.accountHolderName);
        console.log('   - Currency:', firstUser.currency);
        console.log('   - Total earnings:', firstUser.totalEarnings);
        console.log('   - Is eligible for payout:', firstUser.isEligibleForPayout);
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
        const firstEligible = eligiblePayoutsResponse.data[0];
        console.log('   - First eligible user:', firstEligible.userId?.firstName, firstEligible.userId?.lastName);
        console.log('   - Pending amount:', firstEligible.pendingAmount);
        console.log('   - Bank details available for viewing');
      }
    } catch (error) {
      console.log('❌ Error getting eligible payouts:', error.response?.data || error.message);
    }
    
    console.log('\n✅ Admin payouts with bank details testing completed!');
    console.log('\n📝 Frontend should now show:');
    console.log('   - Go to http://localhost:3000/login');
    console.log('   - Login with: adnan@yahoo.com / Change1234@');
    console.log('   - Navigate to http://localhost:3000/admin/payouts');
    console.log('   - You should see:');
    console.log('     * Team Payout Management page with sidebar');
    console.log('     * Stats cards (Total Users, Eligible for Payout, Total Payouts)');
    console.log('     * "Users Eligible for Payout" table with:');
    console.log('       - User info (name, email)');
    console.log('       - Team name');
    console.log('       - Bank details (masked)');
    console.log('       - Earnings and pending amounts');
    console.log('       - "View Bank Details" button (gray)');
    console.log('       - "Process Payout" button (blue-green gradient)');
    console.log('     * "All Payment Information" table with:');
    console.log('       - All users with payment info');
    console.log('       - "View Bank Details" button for all users');
    console.log('       - "Process Payout" button only for eligible users');
    console.log('     * "Payout History" table (if any payouts exist)');
    console.log('     * Bank Details Modal when "View Bank Details" is clicked:');
    console.log('       - Complete bank information');
    console.log('       - Account number (unmasked)');
    console.log('       - Account holder name');
    console.log('       - Currency and other bank details');
    console.log('       - Earnings information');
    console.log('       - "Process Payout" button if eligible');
    console.log('     * Process Payout Modal when "Process Payout" is clicked');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAdminPayoutsWithBankDetails(); 
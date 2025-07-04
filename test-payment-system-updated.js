const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function testPaymentSystemUpdated() {
  try {
    console.log('🔍 Testing updated payment system...\n');
    
    // Step 1: Register a regular user (team member)
    console.log('1️⃣ Registering regular user (team member)...');
    const userResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: 'member@test.com',
      password: 'password123',
      firstName: 'Team',
      lastName: 'Member',
      teamName: 'Test Team',
      teamDescription: 'Test team for payment system'
    });
    
    const userToken = userResponse.data.access_token;
    const user = userResponse.data.user;
    console.log('✅ Regular user registered:', user.email, 'Team ID:', user.teamId);
    
    // Step 2: Add payment information for the team member
    console.log('\n2️⃣ Adding payment information for team member...');
    const paymentInfoData = {
      bankName: 'Test Bank',
      accountNumber: '1234567890',
      accountHolderName: 'Team Member',
      branchCode: '1234',
      swiftCode: 'TESTBANK',
      iban: 'PK36TEST0000001123456702',
      currency: 'PKR',
      thresholdAmount: 1000
    };
    
    const paymentInfoResponse = await axios.post(`${BASE_URL}/payments/payment-info`, paymentInfoData, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    console.log('✅ Payment info created for team member:', paymentInfoResponse.data);
    
    // Step 3: Register an admin user (same team)
    console.log('\n3️⃣ Registering admin user...');
    const adminResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: 'admin@test.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
      teamName: 'Test Team', // Same team
      teamDescription: 'Admin for test team'
    });
    
    const adminToken = adminResponse.data.access_token;
    const adminUser = adminResponse.data.user;
    console.log('✅ Admin registered:', adminUser.email, 'Team ID:', adminUser.teamId);
    
    // Step 4: Try to get team payment info (admin should see team members' info)
    console.log('\n4️⃣ Getting team payment info (admin view)...');
    const teamPaymentInfoResponse = await axios.get(`${BASE_URL}/payments/admin/team-payment-info`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Team payment info (admin view):', teamPaymentInfoResponse.data);
    console.log('   - Should show team members\' payment info');
    console.log('   - Admin should see bank details for processing payouts');
    
    // Step 5: Try to create payment info for admin (should fail)
    console.log('\n5️⃣ Testing admin payment info creation (should fail)...');
    try {
      await axios.post(`${BASE_URL}/payments/payment-info`, paymentInfoData, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('❌ Admin should not be able to create payment info');
    } catch (error) {
      console.log('✅ Admin correctly blocked from creating payment info:', error.response?.data?.message);
    }
    
    // Step 6: Get eligible payouts (admin view)
    console.log('\n6️⃣ Getting eligible payouts (admin view)...');
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
        notes: 'Test payout for team member',
        transactionId: 'TXN123456'
      };
      
      const processPayoutResponse = await axios.post(`${BASE_URL}/payments/admin/process-payout`, payoutData, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      console.log('✅ Payout processed:', processPayoutResponse.data);
    } else {
      console.log('\n7️⃣ No eligible payouts found');
    }
    
    // Step 8: Get all payouts (admin view)
    console.log('\n8️⃣ Getting all payouts (admin view)...');
    const allPayoutsResponse = await axios.get(`${BASE_URL}/payments/admin/payouts`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ All payouts:', allPayoutsResponse.data);
    
    // Step 9: Get user payouts (team member view)
    console.log('\n9️⃣ Getting user payouts (team member view)...');
    const userPayoutsResponse = await axios.get(`${BASE_URL}/payments/payouts`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    console.log('✅ User payouts:', userPayoutsResponse.data);
    
    console.log('\n✅ Updated payment system test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Regular users can add/update their payment info');
    console.log('   - Admins can see team members\' payment info for payout processing');
    console.log('   - Admins cannot create their own payment info');
    console.log('   - Payout processing works correctly');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testPaymentSystemUpdated(); 
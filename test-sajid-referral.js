const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testSajidReferral() {
  try {
    console.log('🔍 Testing referral system with sajid@yahoo.com...\n');

    // Login with sajid@yahoo.com
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'sajid@yahoo.com',
      password: 'Xulfi1234@'
    });

    const { access_token, user } = loginResponse.data;
    console.log('✅ Login successful');
    console.log('User ID:', user.id);
    console.log('User email:', user.email);
    console.log('Team ID:', user.teamId);
    console.log('Team name:', user.team?.name);
    console.log('Team referral code:', user.team?.referralCode);
    console.log('Team total referrals:', user.team?.totalReferrals);
    console.log('Team total earnings:', user.team?.totalReferralEarnings);

    // Get user stats
    console.log('\n2. Getting user stats...');
    const statsResponse = await axios.get(`${BASE_URL}/referrals/user-stats`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const stats = statsResponse.data;
    console.log('✅ User stats:', stats);

    // Get referral link
    console.log('\n3. Getting referral link...');
    const linkResponse = await axios.get(`${BASE_URL}/referrals/link`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    console.log('✅ Referral link:', linkResponse.data.referralLink);

    // Get referral history
    console.log('\n4. Getting referral history...');
    const historyResponse = await axios.get(`${BASE_URL}/referrals/history`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const history = historyResponse.data;
    console.log('✅ Referral history count:', history.length);

    // Get my signups
    console.log('\n5. Getting my signups...');
    const signupsResponse = await axios.get(`${BASE_URL}/referrals/my-signups`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const signups = signupsResponse.data;
    console.log('✅ My signups count:', signups.length);

    console.log('\n🎉 Test completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- User: ${user.email}`);
    console.log(`- Team: ${user.team?.name}`);
    console.log(`- Team Referral Code: ${user.team?.referralCode}`);
    console.log(`- Team Total Referrals: ${user.team?.totalReferrals}`);
    console.log(`- Team Total Earnings: ${user.team?.totalReferralEarnings} PKR`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testSajidReferral(); 
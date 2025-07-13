const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testToheedTeamClicks() {
  try {
    console.log('🔍 Testing team clicks for toheed@yahoo.com...\n');

    // Step 1: Login as zulfiqar@yahoo.com
    console.log('1. Logging in as zulfiqar@yahoo.com...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'zulfiqar@yahoo.com',
      password: 'Xulfi1234@'
    });

    if (loginResponse.data.token) {
      const token = loginResponse.data.token;
      console.log('✅ Login successful');
      console.log('User ID:', loginResponse.data.user._id);
      console.log('Team ID:', loginResponse.data.user.teamId);
      console.log('Role:', loginResponse.data.user.role);
      console.log('');

      // Set headers for authenticated requests
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Step 2: Get user profile
      console.log('2. Getting user profile...');
      const profileResponse = await axios.get(`${BASE_URL}/users/profile`, { headers });
      console.log('✅ Profile retrieved');
      console.log('Team:', profileResponse.data.teamId.name);
      console.log('');

      // Step 3: Get platforms
      console.log('3. Getting platforms...');
      const platformsResponse = await axios.get(`${BASE_URL}/platforms`, { headers });
      console.log('✅ Platforms retrieved:', platformsResponse.data.length, 'platforms');
      console.log('');

      // Step 4: Get team clicks
      console.log('4. Getting team platform clicks...');
      const teamClicksResponse = await axios.get(`${BASE_URL}/platforms/clicks/my-team`, { headers });
      console.log('✅ Team clicks retrieved:', teamClicksResponse.data.length, 'records');
      
      if (teamClicksResponse.data.length > 0) {
        console.log('\n📊 Team Clicks Data:');
        teamClicksResponse.data.forEach((click, index) => {
          console.log(`${index + 1}. Platform: ${click.platformId?.name || 'Unknown'}`);
          console.log(`   User: ${click.userId?.firstName} ${click.userId?.lastName}`);
          console.log(`   Clicks: ${click.clicks}`);
          console.log(`   Earnings: ${click.earnings} PKR`);
          console.log(`   Date: ${new Date(click.date).toLocaleDateString()}`);
          console.log('');
        });
      } else {
        console.log('❌ No team clicks found');
      }

      // Step 5: Get all clicks (admin view)
      console.log('5. Getting all clicks (admin view)...');
      const allClicksResponse = await axios.get(`${BASE_URL}/platforms/clicks/all`, { headers });
      console.log('✅ All clicks retrieved:', allClicksResponse.data.length, 'records');
      
      if (allClicksResponse.data.length > 0) {
        console.log('\n📊 All Clicks Data:');
        allClicksResponse.data.forEach((click, index) => {
          console.log(`${index + 1}. Platform: ${click.platformId?.name || 'Unknown'}`);
          console.log(`   User: ${click.userId?.firstName} ${click.userId?.lastName}`);
          console.log(`   Clicks: ${click.clicks}`);
          console.log(`   Earnings: ${click.earnings} PKR`);
          console.log(`   Date: ${new Date(click.date).toLocaleDateString()}`);
          console.log('');
        });
      } else {
        console.log('❌ No clicks found');
      }

      // Step 6: Get team members
      console.log('6. Getting team members...');
      const teamMembersResponse = await axios.get(`${BASE_URL}/users/team-members`, { headers });
      console.log('✅ Team members retrieved:', teamMembersResponse.data.length, 'members');
      
      if (teamMembersResponse.data.length > 0) {
        console.log('\n👥 Team Members:');
        teamMembersResponse.data.forEach((member, index) => {
          console.log(`${index + 1}. ${member.firstName} ${member.lastName} (${member.email})`);
          console.log(`   Role: ${member.role}`);
          console.log(`   ID: ${member._id}`);
          console.log('');
        });
      }

    } else {
      console.log('❌ Login failed');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testToheedTeamClicks(); 
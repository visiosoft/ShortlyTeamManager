const axios = require('axios');

const API_BASE = 'http://localhost:3009';

async function testTeamMembersFixed() {
  try {
    console.log('🧪 Testing Team Members After ObjectId Fix\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'dev.xulfiqar@gmail.com',
      password: '123456'
    });
    
    const token = loginResponse.data.access_token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful:', user.email);
    console.log('   Team:', user.team.name);
    console.log('   Role:', user.role);

    // Step 2: Check current team members
    console.log('\n2. Checking current team members...');
    const teamMembersResponse = await axios.get(`${API_BASE}/users/team-members`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Team members count:', teamMembersResponse.data.length);
    teamMembersResponse.data.forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.firstName} ${member.lastName} (${member.email}) - ${member.role}`);
    });

    // Step 3: Create a new team member to test the fix
    console.log('\n3. Creating new team member to test ObjectId fix...');
    const newMemberData = {
      email: 'newmember@abc.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'Member',
      role: 'user'
    };

    try {
      const memberResponse = await axios.post(`${API_BASE}/auth/team-member`, newMemberData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Created new member: ${memberResponse.data.firstName} ${memberResponse.data.lastName}`);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️  Member already exists');
      } else {
        console.error('❌ Error creating member:', error.response?.data || error.message);
      }
    }

    // Step 4: Check team members again
    console.log('\n4. Checking team members after creation...');
    const finalTeamMembersResponse = await axios.get(`${API_BASE}/users/team-members`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Final team members count:', finalTeamMembersResponse.data.length);
    finalTeamMembersResponse.data.forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.firstName} ${member.lastName} (${member.email}) - ${member.role}`);
    });

    if (finalTeamMembersResponse.data.length > 1) {
      console.log('\n🎉 SUCCESS! Team members are now working correctly!');
      console.log('   The ObjectId fix is working properly.');
    } else {
      console.log('\n⚠️  Still only seeing 1 team member. The fix may need more investigation.');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testTeamMembersFixed(); 
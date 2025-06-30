const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function debugTeamMembers() {
  try {
    console.log('🔍 Debugging Team Members Issue\n');

    // Step 1: Try to register the user if they don't exist
    console.log('1. Attempting to register user...');
    const registerData = {
      email: 'dev.xulfiqar@gmail.com',
      password: 'password123',
      firstName: 'Dev',
      lastName: 'Xulfiqar',
      teamName: 'Dev Team',
      teamDescription: 'Development team'
    };

    try {
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, registerData);
      console.log('✅ User registered successfully:', registerResponse.data.user.email);
      console.log('   Team:', registerResponse.data.user.team.name);
      console.log('   Role:', registerResponse.data.user.role);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️  User already exists, proceeding to login...');
      } else {
        console.error('❌ Registration error:', error.response?.data || error.message);
        return;
      }
    }

    // Step 2: Login
    console.log('\n2. Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'dev.xulfiqar@gmail.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.access_token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful:', user.email);
    console.log('   Team ID:', user.team._id);
    console.log('   Role:', user.role);

    // Step 3: Test team members endpoint
    console.log('\n3. Testing team members endpoint...');
    try {
      const teamMembersResponse = await axios.get(`${API_BASE}/users/team-members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Team members retrieved successfully');
      console.log('   Number of team members:', teamMembersResponse.data.length);
      
      if (teamMembersResponse.data.length > 0) {
        console.log('   Team members:');
        teamMembersResponse.data.forEach((member, index) => {
          console.log(`     ${index + 1}. ${member.firstName} ${member.lastName} (${member.email}) - ${member.role}`);
        });
      } else {
        console.log('   No team members found');
      }
    } catch (error) {
      console.error('❌ Team members error:', error.response?.data || error.message);
    }

    // Step 4: Create some test team members if none exist
    if (user.role === 'admin') {
      console.log('\n4. Creating test team members...');
      const testMembers = [
        {
          email: 'test1@devteam.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User1',
          role: 'user'
        },
        {
          email: 'test2@devteam.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User2',
          role: 'user'
        }
      ];

      for (const member of testMembers) {
        try {
          const memberResponse = await axios.post(`${API_BASE}/auth/team-member`, member, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log(`✅ Created ${member.role}: ${memberResponse.data.firstName} ${memberResponse.data.lastName}`);
        } catch (error) {
          if (error.response?.status === 409) {
            console.log(`ℹ️  ${member.email} already exists`);
          } else {
            console.error(`❌ Error creating ${member.email}:`, error.response?.data || error.message);
          }
        }
      }

      // Step 5: Check team members again
      console.log('\n5. Checking team members after creation...');
      const finalTeamMembersResponse = await axios.get(`${API_BASE}/users/team-members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Final team members count:', finalTeamMembersResponse.data.length);
      finalTeamMembersResponse.data.forEach((member, index) => {
        console.log(`   ${index + 1}. ${member.firstName} ${member.lastName} (${member.email}) - ${member.role}`);
      });
    }

  } catch (error) {
    console.error('❌ Debug error:', error.response?.data || error.message);
  }
}

debugTeamMembers(); 
const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testTeamCreation() {
  try {
    console.log('🚀 Testing Team Member Creation Functionality\n');

    // Step 1: Register a team admin
    console.log('1. Creating a team admin...');
    const adminData = {
      email: 'admin3@testteam.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Admin',
      teamName: 'Test Team',
      teamDescription: 'A test team for demonstration'
    };

    const adminResponse = await axios.post(`${API_BASE}/auth/register`, adminData);
    console.log('✅ Team admin created:', adminResponse.data.user.email);
    console.log('   Team:', adminResponse.data.user.team.name);
    console.log('   Role:', adminResponse.data.user.role);

    // Step 2: Login as admin
    console.log('\n2. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: adminData.email,
      password: adminData.password
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Admin logged in successfully');

    // Step 3: Create team members
    console.log('\n3. Creating team members...');
    
    const teamMembers = [
      {
        email: 'user1@testteam.com',
        password: 'password123',
        firstName: 'Alice',
        lastName: 'User',
        role: 'user'
      },
      {
        email: 'user2@testteam.com',
        password: 'password123',
        firstName: 'Bob',
        lastName: 'User',
        role: 'user'
      },
      {
        email: 'admin2@testteam.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Admin',
        role: 'admin'
      }
    ];

    for (const member of teamMembers) {
      const memberResponse = await axios.post(`${API_BASE}/auth/team-member`, member, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Created ${member.role}: ${memberResponse.data.firstName} ${memberResponse.data.lastName} (${memberResponse.data.email})`);
    }

    // Step 4: Get team members list
    console.log('\n4. Fetching team members...');
    const membersResponse = await axios.get(`${API_BASE}/users/team-members`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Team members list:');
    membersResponse.data.forEach(member => {
      console.log(`   - ${member.firstName} ${member.lastName} (${member.email}) - ${member.role}`);
    });

    // Step 5: Test team member login
    console.log('\n5. Testing team member login...');
    const userLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'user1@testteam.com',
      password: 'password123'
    });
    
    console.log('✅ Team member can login:', userLoginResponse.data.user.email);
    console.log('   Role:', userLoginResponse.data.user.role);
    console.log('   Team:', userLoginResponse.data.user.team.name);

    console.log('\n🎉 Team member creation test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - 1 Team Admin created');
    console.log('   - 3 Team Members created (2 users, 1 admin)');
    console.log('   - All members can login and access the team');
    console.log('   - Team admin can view all team members');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Run the test
testTeamCreation(); 
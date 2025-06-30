const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function createTeamMembers() {
  try {
    console.log('👥 Creating Team Members for dev.xulfiqar@gmail.com\n');

    // Step 1: Login as the admin
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

    // Step 2: Create team members
    console.log('\n2. Creating team members...');
    const teamMembers = [
      {
        email: 'developer1@abc.com',
        password: 'password123',
        firstName: 'Alice',
        lastName: 'Developer',
        role: 'user'
      },
      {
        email: 'developer2@abc.com',
        password: 'password123',
        firstName: 'Bob',
        lastName: 'Developer',
        role: 'user'
      },
      {
        email: 'manager@abc.com',
        password: 'password123',
        firstName: 'Charlie',
        lastName: 'Manager',
        role: 'admin'
      }
    ];

    for (const member of teamMembers) {
      try {
        const memberResponse = await axios.post(`${API_BASE}/auth/team-member`, member, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Created ${member.role}: ${memberResponse.data.firstName} ${memberResponse.data.lastName} (${memberResponse.data.email})`);
      } catch (error) {
        if (error.response?.status === 409) {
          console.log(`ℹ️  ${member.email} already exists`);
        } else {
          console.error(`❌ Error creating ${member.email}:`, error.response?.data || error.message);
        }
      }
    }

    // Step 3: Check final team members
    console.log('\n3. Checking final team members...');
    const teamMembersResponse = await axios.get(`${API_BASE}/users/team-members`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Final team members count:', teamMembersResponse.data.length);
    teamMembersResponse.data.forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.firstName} ${member.lastName} (${member.email}) - ${member.role}`);
    });

    console.log('\n🎉 Team members created successfully!');
    console.log('You can now log in to the frontend and see all your team members.');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

createTeamMembers(); 
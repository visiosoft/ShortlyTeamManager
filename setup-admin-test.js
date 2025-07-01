const axios = require('axios');

const API_BASE = 'http://localhost:3009/api';

async function setupAdminTest() {
  try {
    console.log('🔧 Setting up admin test environment...\n');

    // Step 1: Register admin user
    console.log('1. Creating admin user...');
    const adminRegisterResponse = await axios.post(`${API_BASE}/auth/register`, {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'password123',
      teamName: 'Test Team',
      teamDescription: 'Team for testing admin features'
    });
    
    console.log(`   ✅ Admin user created: ${adminRegisterResponse.data.user.firstName} ${adminRegisterResponse.data.user.lastName}`);
    console.log(`   📋 Team created: ${adminRegisterResponse.data.user.team.name}`);

    // Step 2: Login as admin to get token
    console.log('\n2. Logging in as admin...');
    const adminLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });
    
    const adminToken = adminLoginResponse.data.access_token;
    console.log(`   ✅ Admin logged in successfully`);

    // Step 3: Create a regular user account
    console.log('\n3. Creating regular user account...');
    const userRegisterResponse = await axios.post(`${API_BASE}/auth/team-member`, {
      firstName: 'Regular',
      lastName: 'User',
      email: 'user@example.com',
      password: 'password123',
      role: 'user'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log(`   ✅ Regular user created: ${userRegisterResponse.data.firstName} ${userRegisterResponse.data.lastName}`);

    // Step 4: Verify team members
    console.log('\n4. Verifying team members...');
    const teamMembersResponse = await axios.get(`${API_BASE}/users/team-members`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const teamMembers = teamMembersResponse.data;
    console.log(`   ✅ Team has ${teamMembers.length} members:`);
    teamMembers.forEach(member => {
      console.log(`      - ${member.firstName} ${member.lastName} (${member.email}) - ${member.role}`);
    });

    console.log('\n🎉 Admin test environment setup completed!');
    console.log('\n📋 Test Accounts:');
    console.log(`   Admin: admin@example.com / password123`);
    console.log(`   User: user@example.com / password123`);
    console.log('\n💡 You can now run the admin URL creation test.');

  } catch (error) {
    console.error('❌ Setup failed:', error.response?.data || error.message);
    if (error.response?.status === 409) {
      console.log('   💡 Users already exist. You can proceed with the test.');
    }
  }
}

// Run the setup
setupAdminTest(); 
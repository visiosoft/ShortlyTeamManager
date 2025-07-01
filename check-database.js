const axios = require('axios');

const API_BASE = 'http://localhost:3009';

async function checkDatabase() {
  try {
    console.log('🔍 Checking Database Users\n');

    // Try different common passwords
    const passwords = ['password123', 'password', '123456', 'admin', 'test'];
    const emails = ['dev.xulfiqar@gmail.com', 'admin@testteam.com', 'admin3@testteam.com'];

    for (const email of emails) {
      console.log(`\nTrying email: ${email}`);
      
      for (const password of passwords) {
        try {
          const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
            email: email,
            password: password
          });
          
          console.log(`✅ Login successful with password: ${password}`);
          console.log(`   User: ${loginResponse.data.user.firstName} ${loginResponse.data.user.lastName}`);
          console.log(`   Role: ${loginResponse.data.user.role}`);
          console.log(`   Team: ${loginResponse.data.user.team.name}`);
          
          // Test team members endpoint
          const token = loginResponse.data.access_token;
          try {
            const teamMembersResponse = await axios.get(`${API_BASE}/users/team-members`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`   Team members: ${teamMembersResponse.data.length}`);
            
            if (teamMembersResponse.data.length > 0) {
              teamMembersResponse.data.forEach((member, index) => {
                console.log(`     ${index + 1}. ${member.firstName} ${member.lastName} (${member.email})`);
              });
            }
          } catch (error) {
            console.log(`   ❌ Team members error: ${error.response?.data?.message || error.message}`);
          }
          
          break; // Found working password, move to next email
        } catch (error) {
          // Continue trying other passwords
        }
      }
    }

    // Try to create a new admin user
    console.log('\n\n🔄 Creating new admin user for testing...');
    const newAdminData = {
      email: 'newadmin@test.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'Admin',
      teamName: 'Test Team',
      teamDescription: 'Test team for debugging'
    };

    try {
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, newAdminData);
      console.log('✅ New admin created:', registerResponse.data.user.email);
      console.log('   Team:', registerResponse.data.user.team.name);
      console.log('   Role:', registerResponse.data.user.role);
      
      // Test team members with new admin
      const token = registerResponse.data.access_token;
      const teamMembersResponse = await axios.get(`${API_BASE}/users/team-members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   Team members count:', teamMembersResponse.data.length);
      
    } catch (error) {
      console.log('❌ Could not create new admin:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Check error:', error.response?.data || error.message);
  }
}

checkDatabase(); 
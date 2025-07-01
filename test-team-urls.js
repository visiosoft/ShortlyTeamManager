const axios = require('axios');

async function testTeamUrlCreation() {
  try {
    console.log('🔍 Testing Team URL Creation...');
    
    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3009/auth/login', {
      email: 'admin@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');
    
    // Step 2: Get team members
    console.log('2. Fetching team members...');
    const teamMembersResponse = await axios.get('http://localhost:3009/users/team-members', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const teamMembers = teamMembersResponse.data;
    console.log(`✅ Found ${teamMembers.length} team members`);
    
    if (teamMembers.length === 0) {
      console.log('❌ No team members found. Cannot test team URL creation.');
      return;
    }
    
    // Step 3: Create team URL
    console.log('3. Creating team URL...');
    const targetUserId = teamMembers[0].id;
    
    const createUrlResponse = await axios.post('http://localhost:3009/api/urls/admin', {
      originalUrl: 'https://example.com/test-team-url',
      targetUserId: targetUserId,
      customShortCode: 'test-team-' + Date.now(),
      title: 'Test Team URL',
      description: 'This is a test URL created by admin for team member'
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Team URL created successfully!');
    console.log('Created URL:', createUrlResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

testTeamUrlCreation(); 
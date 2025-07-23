const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function debugRegistration() {
  console.log('🔍 Debugging Registration...\n');

  // Step 1: Register a new user
  console.log('1. Registering new user...');
  const newUserEmail = `debuguser${Date.now()}@example.com`;
  
  try {
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      email: newUserEmail,
      password: 'password123',
      firstName: 'Debug',
      lastName: 'User',
      teamName: 'Debug Team'
    });
    
    console.log('✅ Registration response:');
    console.log('   - Status:', registerResponse.status);
    console.log('   - User ID:', registerResponse.data.user.id);
    console.log('   - Team ID:', registerResponse.data.user.teamId);
    console.log('   - Role:', registerResponse.data.user.role);
    console.log('   - Team Name:', registerResponse.data.user.team?.name);
    
    const newUserToken = registerResponse.data.access_token;
    
    // Step 2: Get user profile
    console.log('\n2. Getting user profile...');
    const userProfile = await axios.get(`${BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${newUserToken}` }
    }).then(res => res.data);
    
    console.log('✅ User profile:');
    console.log('   - Email:', userProfile.email);
    console.log('   - Team ID:', userProfile.teamId);
    console.log('   - Role:', userProfile.role);
    
    // Step 3: Check if user is in admin team
    console.log('\n3. Checking team membership...');
    const adminTeamId = '6872137b3bd64eb1d84237d1';
    const userTeamId = userProfile.teamId;
    
    console.log(`   - Admin team ID: ${adminTeamId}`);
    console.log(`   - User team ID: ${userTeamId}`);
    console.log(`   - Teams match: ${userTeamId === adminTeamId ? 'YES' : 'NO'}`);
    
    if (userTeamId === adminTeamId) {
      console.log('✅ SUCCESS: User is in admin team');
    } else {
      console.log('❌ ISSUE: User is not in admin team');
    }
    
  } catch (error) {
    console.error('❌ Registration failed:', error.response?.data || error.message);
  }

  console.log('\n🎉 Registration debug completed!');
}

debugRegistration().catch(console.error); 
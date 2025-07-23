const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function debugTeams() {
  console.log('🔍 Debugging Teams...\n');

  // Step 1: Login as admin
  console.log('1. Logging in as admin...');
  const adminToken = await axios.post(`${BASE_URL}/api/auth/login`, {
    email: 'khantoheedali@gmail.com',
    password: 'Digital@'
  }).then(res => res.data.access_token);

  console.log('✅ Admin logged in');

  // Step 2: Get admin profile
  console.log('\n2. Getting admin profile...');
  const adminProfile = await axios.get(`${BASE_URL}/api/auth/profile`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  }).then(res => res.data);

  console.log('✅ Admin profile:', adminProfile.email, 'Team ID:', adminProfile.teamId);

  // Step 3: Login as existing user
  console.log('\n3. Logging in as existing user...');
  const userToken = await axios.post(`${BASE_URL}/api/auth/login`, {
    email: 'zulfiqar@gmail.com',
    password: 'Xulfi1234@'
  }).then(res => res.data.access_token);

  console.log('✅ User logged in');

  // Step 4: Get user profile
  console.log('\n4. Getting user profile...');
  const userProfile = await axios.get(`${BASE_URL}/api/auth/profile`, {
    headers: { Authorization: `Bearer ${userToken}` }
  }).then(res => res.data);

  console.log('✅ User profile:', userProfile.email, 'Team ID:', userProfile.teamId);

  // Step 5: Analysis
  console.log('\n5. Team Analysis:');
  console.log(`📊 Admin team ID: ${adminProfile.teamId}`);
  console.log(`📊 User team ID: ${userProfile.teamId}`);
  console.log(`📊 Teams match: ${adminProfile.teamId === userProfile.teamId ? 'YES' : 'NO'}`);

  if (adminProfile.teamId === userProfile.teamId) {
    console.log('✅ SUCCESS: Both users are in the same team');
  } else {
    console.log('❌ ISSUE: Users are in different teams');
  }

  console.log('\n🎉 Team debug completed!');
}

debugTeams().catch(console.error); 
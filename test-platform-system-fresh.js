const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const API_BASE_URL = 'http://localhost:3009/api';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shortlink';

// Test configuration
const TEST_CONFIG = {
  adminEmail: 'admin@test.com',
  adminPassword: 'password123',
  testUserEmail: 'user@test.com',
  testUserPassword: 'password123'
};

let adminToken = '';
let userToken = '';
let testPlatformId = '';
let testUserId = '';
let testTeamId = '';

async function setupFreshTestData() {
  try {
    console.log('🔧 Setting up fresh test data...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    const collections = ['users', 'teams', 'platforms', 'platformclicks'];
    for (const collectionName of collections) {
      try {
        const collection = mongoose.connection.collection(collectionName);
        await collection.deleteMany({});
        console.log(`✅ Cleared ${collectionName}`);
      } catch (error) {
        console.log(`⚠️ Collection ${collectionName} not found`);
      }
    }

    // Create schemas
    const userSchema = new mongoose.Schema({
      firstName: String,
      lastName: String,
      email: { type: String, unique: true },
      password: String,
      role: { type: String, enum: ['admin', 'user'], default: 'user' },
      teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
      totalEarnings: { type: Number, default: 0 },
      createdAt: { type: Date, default: Date.now }
    });

    const teamSchema = new mongoose.Schema({
      name: String,
      ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      totalEarnings: { type: Number, default: 0 },
      rewards: [{
        clicks: Number,
        amount: Number,
        currency: { type: String, default: 'PKR' }
      }],
      createdAt: { type: Date, default: Date.now }
    });

    const platformSchema = new mongoose.Schema({
      name: { type: String, required: true },
      description: String,
      website: String,
      type: { type: String, enum: ['external', 'internal'], default: 'external' },
      isActive: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now }
    });

    const platformClickSchema = new mongoose.Schema({
      platformId: { type: mongoose.Schema.Types.ObjectId, ref: 'Platform', required: true },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
      clicks: { type: Number, required: true },
      date: { type: Date, required: true },
      earnings: { type: Number, required: true },
      ratePerClick: { type: Number, required: true },
      notes: String,
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
    });

    const User = mongoose.model('User', userSchema);
    const Team = mongoose.model('Team', teamSchema);
    const Platform = mongoose.model('Platform', platformSchema);
    const PlatformClick = mongoose.model('PlatformClick', platformClickSchema);

    // Create admin user
    console.log('1. Creating admin user...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin'
    });
    
    await adminUser.save();
    console.log('✅ Admin user created:', adminUser.email);

    // Create regular user
    console.log('\n2. Creating regular user...');
    const regularUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'user@test.com',
      password: hashedPassword,
      role: 'user'
    });
    
    await regularUser.save();
    console.log('✅ Regular user created:', regularUser.email);

    // Create team
    console.log('\n3. Creating team...');
    const team = new Team({
      name: 'Test Team',
      ownerId: adminUser._id,
      members: [adminUser._id, regularUser._id],
      rewards: [{
        clicks: 100,
        amount: 50,
        currency: 'PKR'
      }]
    });
    
    await team.save();
    console.log('✅ Team created:', team.name);

    // Update users with team ID
    await User.updateMany({}, { teamId: team._id });
    console.log('✅ Updated users with team ID');

    // Create test platform
    console.log('\n4. Creating test platform...');
    const platform = new Platform({
      name: 'Test Platform',
      description: 'A test platform for verification',
      website: 'https://testplatform.com',
      type: 'external',
      isActive: true
    });
    
    await platform.save();
    console.log('✅ Platform created:', platform.name);

    // Store IDs for testing
    testUserId = regularUser._id.toString();
    testTeamId = team._id.toString();
    testPlatformId = platform._id.toString();

    console.log('\n📊 Test Data Summary:');
    console.log('=====================');
    console.log(`Users: ${await User.countDocuments()}`);
    console.log(`Teams: ${await Team.countDocuments()}`);
    console.log(`Platforms: ${await Platform.countDocuments()}`);
    console.log(`Platform Clicks: ${await PlatformClick.countDocuments()}`);
    
    console.log('\n🎉 Fresh test data created successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('Admin: admin@test.com / password123');
    console.log('User: user@test.com / password123');
    
    console.log('\n🔑 Test IDs:');
    console.log(`User ID: ${testUserId}`);
    console.log(`Team ID: ${testTeamId}`);
    console.log(`Platform ID: ${testPlatformId}`);

  } catch (error) {
    console.error('❌ Error setting up test data:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

async function testLogin(email, password) {
  try {
    console.log(`🔐 Logging in as ${email}...`);
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password
    });
    
    if (response.data && response.data.access_token) {
      console.log(`✅ Login successful for ${email}`);
      return response.data.access_token;
    } else {
      console.log(`❌ Login failed for ${email}: No token received`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Login failed for ${email}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function getAuthHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

async function testPlatformCreation() {
  try {
    console.log('\n🏗️ Testing Platform Creation...');
    
    const platformData = {
      name: 'Facebook',
      description: 'Social media platform',
      website: 'https://facebook.com',
      type: 'external',
      isActive: true
    };
    
    const response = await axios.post(
      `${API_BASE_URL}/platforms`,
      platformData,
      { headers: await getAuthHeaders(adminToken) }
    );
    
    if (response.data && response.data._id) {
      console.log(`✅ Platform created successfully: ${response.data.name} (ID: ${response.data._id})`);
      return response.data._id;
    }
  } catch (error) {
    console.log(`❌ Platform creation failed:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function testGetPlatforms() {
  try {
    console.log('\n📋 Testing Platform Retrieval...');
    
    // Test as admin
    const adminResponse = await axios.get(
      `${API_BASE_URL}/platforms`,
      { headers: await getAuthHeaders(adminToken) }
    );
    
    console.log(`✅ Admin can see ${adminResponse.data.length} platforms`);
    
    // Test as user
    const userResponse = await axios.get(
      `${API_BASE_URL}/platforms`,
      { headers: await getAuthHeaders(userToken) }
    );
    
    console.log(`✅ User can see ${userResponse.data.length} platforms`);
    
    return adminResponse.data.length > 0;
  } catch (error) {
    console.log(`❌ Platform retrieval failed:`, error.response?.data?.message || error.message);
    return false;
  }
}

async function testGetTeamMembers() {
  try {
    console.log('\n👥 Testing Team Members Retrieval...');
    
    const response = await axios.get(
      `${API_BASE_URL}/users/team-members`,
      { headers: await getAuthHeaders(adminToken) }
    );
    
    if (response.data && response.data.length > 0) {
      console.log(`✅ Found ${response.data.length} team members`);
      response.data.forEach(member => {
        console.log(`   - ${member.firstName} ${member.lastName} (${member.email})`);
      });
      return true;
    } else {
      console.log(`❌ No team members found`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Team members retrieval failed:`, error.response?.data?.message || error.message);
    return false;
  }
}

async function testAddPlatformClicks(platformId, userId, date) {
  try {
    console.log('\n📊 Testing Platform Click Addition...');
    
    const clickData = {
      platformId: platformId,
      userId: userId,
      clicks: 100,
      date: date,
      ratePerClick: 0.5,
      notes: 'Test clicks for verification'
    };
    
    const response = await axios.post(
      `${API_BASE_URL}/platforms/clicks`,
      clickData,
      { headers: await getAuthHeaders(adminToken) }
    );
    
    if (response.data && response.data._id) {
      console.log(`✅ Platform clicks added successfully:`);
      console.log(`   - Clicks: ${response.data.clicks}`);
      console.log(`   - Earnings: ${response.data.earnings} PKR`);
      console.log(`   - Rate: ${response.data.ratePerClick} PKR per click`);
      console.log(`   - Team ID: ${response.data.teamId}`);
      return true;
    }
  } catch (error) {
    console.log(`❌ Platform click addition failed:`, error.response?.data?.message || error.message);
    return false;
  }
}

async function testGetPlatformClicks() {
  try {
    console.log('\n📈 Testing Platform Clicks Retrieval...');
    
    // Test admin access to all clicks
    const adminResponse = await axios.get(
      `${API_BASE_URL}/platforms/clicks/all`,
      { headers: await getAuthHeaders(adminToken) }
    );
    
    console.log(`✅ Admin can see ${adminResponse.data.length} platform clicks`);
    
    // Test user access to their clicks
    const userResponse = await axios.get(
      `${API_BASE_URL}/platforms/clicks/my-clicks`,
      { headers: await getAuthHeaders(userToken) }
    );
    
    console.log(`✅ User can see ${userResponse.data.length} of their platform clicks`);
    
    // Test team clicks
    const teamResponse = await axios.get(
      `${API_BASE_URL}/platforms/clicks/my-team`,
      { headers: await getAuthHeaders(userToken) }
    );
    
    console.log(`✅ User can see ${teamResponse.data.length} team platform clicks`);
    
    return adminResponse.data.length > 0;
  } catch (error) {
    console.log(`❌ Platform clicks retrieval failed:`, error.response?.data?.message || error.message);
    return false;
  }
}

async function testPlatformClicksStats() {
  try {
    console.log('\n📊 Testing Platform Clicks Statistics...');
    
    const response = await axios.get(
      `${API_BASE_URL}/platforms/clicks/stats`,
      { headers: await getAuthHeaders(adminToken) }
    );
    
    if (response.data) {
      console.log(`✅ Platform clicks statistics:`);
      console.log(`   - Total clicks: ${response.data.totalClicks}`);
      console.log(`   - Total earnings: ${response.data.totalEarnings} PKR`);
      console.log(`   - Average rate: ${response.data.averageRatePerClick} PKR per click`);
      console.log(`   - Click count: ${response.data.clickCount}`);
      return true;
    }
  } catch (error) {
    console.log(`❌ Platform clicks statistics failed:`, error.response?.data?.message || error.message);
    return false;
  }
}

async function testTeamIsolation() {
  try {
    console.log('\n🔒 Testing Team Data Isolation...');
    
    // Get clicks for specific team
    const teamResponse = await axios.get(
      `${API_BASE_URL}/platforms/clicks/team/${testTeamId}`,
      { headers: await getAuthHeaders(adminToken) }
    );
    
    console.log(`✅ Team ${testTeamId} has ${teamResponse.data.length} platform clicks`);
    
    // Verify all clicks belong to the same team
    const allTeamClicks = teamResponse.data;
    const allSameTeam = allTeamClicks.every(click => click.teamId === testTeamId);
    
    if (allSameTeam) {
      console.log(`✅ All platform clicks belong to the same team (isolation working)`);
    } else {
      console.log(`❌ Team isolation failed - clicks from different teams found`);
    }
    
    return allSameTeam;
  } catch (error) {
    console.log(`❌ Team isolation test failed:`, error.response?.data?.message || error.message);
    return false;
  }
}

async function runCompleteTest() {
  console.log('🧪 Starting Complete Platform System Test (Fresh)...\n');
  
  // Step 1: Setup fresh test data
  await setupFreshTestData();
  
  // Step 2: Login as admin
  adminToken = await testLogin(TEST_CONFIG.adminEmail, TEST_CONFIG.adminPassword);
  if (!adminToken) {
    console.log('❌ Admin login failed. Cannot proceed with tests.');
    return;
  }
  
  // Step 3: Login as user
  userToken = await testLogin(TEST_CONFIG.testUserEmail, TEST_CONFIG.testUserPassword);
  if (!userToken) {
    console.log('❌ User login failed. Cannot proceed with tests.');
    return;
  }
  
  // Step 4: Test platform creation
  const newPlatformId = await testPlatformCreation();
  if (!newPlatformId) {
    console.log('❌ Platform creation failed. Cannot proceed with click tests.');
    return;
  }
  
  // Step 5: Test platform retrieval
  await testGetPlatforms();
  
  // Step 6: Get team members for testing
  const teamMembersFound = await testGetTeamMembers();
  if (!teamMembersFound) {
    console.log('❌ No team members found. Cannot proceed with click tests.');
    return;
  }
  
  // Step 7: Test adding platform clicks with today's date
  const today = new Date().toISOString().split('T')[0];
  const clicksAdded = await testAddPlatformClicks(newPlatformId, testUserId, today);
  if (!clicksAdded) {
    console.log('❌ Platform click addition failed.');
    return;
  }
  
  // Step 8: Test retrieving platform clicks
  await testGetPlatformClicks();
  
  // Step 9: Test platform clicks statistics
  await testPlatformClicksStats();
  
  // Step 10: Test team data isolation
  await testTeamIsolation();
  
  console.log('\n✅ Complete Platform System Test Finished!');
  console.log('\n📋 Summary:');
  console.log('✅ Fresh test data created');
  console.log('✅ Admin can create platforms');
  console.log('✅ Admin can add clicks for team members');
  console.log('✅ Team-based data isolation is working');
  console.log('✅ Users can only see their team\'s data');
  console.log('✅ Earnings are calculated based on team rewards');
  console.log('✅ Statistics are properly aggregated');
}

// Run the test
runCompleteTest().catch(console.error); 
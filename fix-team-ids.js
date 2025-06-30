const axios = require('axios');
const { MongoClient, ObjectId } = require('mongodb');

const API_BASE = 'http://localhost:3001';
const MONGODB_URI = 'mongodb://localhost:27017/url-shortener';

async function fixTeamIds() {
  try {
    console.log('🔧 Fixing Team IDs in Database\n');

    // Connect to MongoDB
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const usersCollection = db.collection('users');

    // Find all users
    const allUsers = await usersCollection.find({}).toArray();
    console.log(`📊 Found ${allUsers.length} users in database`);

    // Check each user's teamId
    for (const user of allUsers) {
      console.log(`\n👤 User: ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`   Current teamId: ${user.teamId} (type: ${typeof user.teamId})`);
      
      // If teamId is a string, convert it to ObjectId
      if (typeof user.teamId === 'string') {
        try {
          const objectId = new ObjectId(user.teamId);
          await usersCollection.updateOne(
            { _id: user._id },
            { $set: { teamId: objectId } }
          );
          console.log(`   ✅ Fixed: Converted to ObjectId ${objectId}`);
        } catch (error) {
          console.log(`   ❌ Error converting teamId: ${error.message}`);
        }
      } else if (user.teamId instanceof ObjectId) {
        console.log(`   ✅ Already ObjectId: ${user.teamId}`);
      } else {
        console.log(`   ⚠️  Unknown type: ${typeof user.teamId}`);
      }
    }

    // Verify the fix by checking team members
    console.log('\n🔍 Verifying fix...');
    
    // Login as admin
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'dev.xulfiqar@gmail.com',
      password: '123456'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Logged in as admin');

    // Check team members
    const teamMembersResponse = await axios.get(`${API_BASE}/users/team-members`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Team members count: ${teamMembersResponse.data.length}`);
    teamMembersResponse.data.forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.firstName} ${member.lastName} (${member.email})`);
    });

    await client.close();
    console.log('\n🎉 Team ID fix completed!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

fixTeamIds(); 
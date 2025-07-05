const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://cutly:hl3yLRKU0Ia4GfPj@cluster0.ddcez.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// User Schema
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: String,
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function checkAdminUsers() {
  try {
    console.log('🔍 Checking Admin Users...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all users
    const allUsers = await User.find({}).sort({ createdAt: -1 });
    
    console.log(`📊 Found ${allUsers.length} users\n`);
    
    if (allUsers.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    // Display user information
    console.log('📋 User Information:');
    console.log('====================');
    
    allUsers.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`  ID: ${user._id}`);
      console.log(`  Name: ${user.firstName} ${user.lastName}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Team ID: ${user.teamId}`);
      console.log(`  Created: ${user.createdAt}`);
    });

    // Check for admin users
    const adminUsers = allUsers.filter(user => user.role === 'admin');
    console.log(`\n👑 Admin Users: ${adminUsers.length}`);
    
    if (adminUsers.length > 0) {
      adminUsers.forEach((admin, index) => {
        console.log(`\nAdmin ${index + 1}:`);
        console.log(`  Email: ${admin.email}`);
        console.log(`  Name: ${admin.firstName} ${admin.lastName}`);
      });
    } else {
      console.log('❌ No admin users found');
    }

    // Check for regular users
    const regularUsers = allUsers.filter(user => user.role !== 'admin');
    console.log(`\n👤 Regular Users: ${regularUsers.length}`);
    
    if (regularUsers.length > 0) {
      regularUsers.forEach((user, index) => {
        console.log(`\nUser ${index + 1}:`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Name: ${user.firstName} ${user.lastName}`);
        console.log(`  Role: ${user.role}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

checkAdminUsers(); 
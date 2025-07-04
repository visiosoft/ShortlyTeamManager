const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/shortlink';

async function checkAdminUsers() {
  try {
    console.log('🔍 Checking for admin users...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get the User model
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      firstName: String,
      lastName: String,
      role: String,
      teamId: mongoose.Schema.Types.ObjectId
    }));
    
    // Check all users
    const allUsers = await User.find({});
    console.log('📊 All users in database:');
    allUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.firstName} ${user.lastName}) - Role: ${user.role}`);
    });
    
    // Check for admin users
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`\n👑 Admin users found: ${adminUsers.length}`);
    adminUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.firstName} ${user.lastName})`);
    });
    
    // Check specific user
    const targetUser = await User.findOne({ email: 'adnan@yahoo.com' });
    if (targetUser) {
      console.log(`\n🎯 Target user: ${targetUser.email}`);
      console.log(`   - Current role: ${targetUser.role}`);
      console.log(`   - User ID: ${targetUser._id}`);
      
      // Update to admin role
      if (targetUser.role !== 'admin') {
        console.log('\n🔄 Updating user role to admin...');
        await User.findByIdAndUpdate(targetUser._id, { role: 'admin' });
        console.log('✅ User role updated to admin');
        
        // Verify the update
        const updatedUser = await User.findById(targetUser._id);
        console.log(`   - New role: ${updatedUser.role}`);
      } else {
        console.log('✅ User is already admin');
      }
    } else {
      console.log('❌ Target user not found');
    }
    
    console.log('\n📝 Next steps:');
    console.log('   - Restart the backend server');
    console.log('   - Test admin endpoints again');
    console.log('   - Access http://localhost:3000/admin/payouts');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkAdminUsers(); 
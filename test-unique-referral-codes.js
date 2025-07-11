const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/shortlink', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = mongoose.model('User', {
  email: String,
  firstName: String,
  lastName: String,
  referralCode: String,
  teamId: mongoose.Schema.Types.ObjectId,
  role: String,
  referralBonuses: [{
    userId: mongoose.Schema.Types.ObjectId,
    amount: Number,
    currency: String,
    createdAt: Date,
    type: String
  }]
});

async function testUniqueReferralCodes() {
  try {
    console.log('🧪 Testing Unique Referral Codes');
    console.log('================================\n');

    // Find all users
    const allUsers = await User.find({});
    console.log(`Total users found: ${allUsers.length}`);

    // Check users without referral codes
    const usersWithoutCodes = allUsers.filter(user => !user.referralCode);
    console.log(`Users without referral codes: ${usersWithoutCodes.length}`);

    // Generate referral codes for users who don't have them
    let generatedCount = 0;
    for (const user of usersWithoutCodes) {
      // Generate a unique 8-character referral code
      let referralCode;
      let isUnique = false;
      
      while (!isUnique) {
        referralCode = nanoid(8).toUpperCase();
        const existingUser = await User.findOne({ referralCode });
        if (!existingUser) {
          isUnique = true;
        }
      }
      
      // Update user with referral code
      await User.findByIdAndUpdate(user._id, { referralCode });
      console.log(`✅ Generated referral code ${referralCode} for user ${user.email}`);
      generatedCount++;
    }

    console.log(`\n📊 Generated ${generatedCount} new referral codes`);

    // Check for duplicate referral codes
    const allUsersWithCodes = await User.find({ referralCode: { $exists: true } });
    const referralCodes = allUsersWithCodes.map(user => user.referralCode);
    const uniqueCodes = new Set(referralCodes);
    
    console.log(`\n🔍 Referral Code Analysis:`);
    console.log(`Total users with codes: ${allUsersWithCodes.length}`);
    console.log(`Unique codes: ${uniqueCodes.size}`);
    console.log(`Duplicate codes: ${referralCodes.length - uniqueCodes.size}`);

    if (referralCodes.length !== uniqueCodes.size) {
      console.log('\n❌ WARNING: Duplicate referral codes found!');
      const duplicates = referralCodes.filter((code, index) => referralCodes.indexOf(code) !== index);
      console.log('Duplicate codes:', [...new Set(duplicates)]);
    } else {
      console.log('\n✅ All referral codes are unique!');
    }

    // Show some sample users and their codes
    console.log('\n📋 Sample Users and Their Referral Codes:');
    const sampleUsers = allUsersWithCodes.slice(0, 5);
    sampleUsers.forEach(user => {
      console.log(`- ${user.email}: ${user.referralCode}`);
    });

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

testUniqueReferralCodes(); 
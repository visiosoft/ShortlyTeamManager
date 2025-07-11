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
  }],
  totalReferrals: Number,
  totalReferralEarnings: Number
});

const Team = mongoose.model('Team', {
  name: String,
  referralCode: String,
  referralBonuses: [{
    userId: mongoose.Schema.Types.ObjectId,
    amount: Number,
    currency: String,
    createdAt: Date,
    type: String
  }],
  totalReferrals: Number,
  totalReferralEarnings: Number
});

async function fixReferralData() {
  try {
    console.log('🔧 Fixing Referral Data Issues');
    console.log('================================\n');

    // Step 1: Fix User referralBonuses format
    console.log('1️⃣ Fixing User referralBonuses format...');
    const usersWithInvalidBonuses = await User.find({
      $or: [
        { referralBonuses: { $exists: false } },
        { referralBonuses: { $type: "string" } },
        { referralBonuses: { $elemMatch: { $type: "string" } } }
      ]
    });

    console.log(`Found ${usersWithInvalidBonuses.length} users with invalid referralBonuses format`);

    for (const user of usersWithInvalidBonuses) {
      // Reset referralBonuses to empty array if it's malformed
      await User.updateOne(
        { _id: user._id },
        { 
          $set: { 
            referralBonuses: [],
            totalReferrals: 0,
            totalReferralEarnings: 0
          }
        }
      );
      console.log(`Fixed user: ${user.email}`);
    }

    // Step 2: Fix Team referralBonuses format
    console.log('\n2️⃣ Fixing Team referralBonuses format...');
    const teamsWithInvalidBonuses = await Team.find({
      $or: [
        { referralBonuses: { $exists: false } },
        { referralBonuses: { $type: "string" } },
        { referralBonuses: { $elemMatch: { $type: "string" } } }
      ]
    });

    console.log(`Found ${teamsWithInvalidBonuses.length} teams with invalid referralBonuses format`);

    for (const team of teamsWithInvalidBonuses) {
      // Reset referralBonuses to empty array if it's malformed
      await Team.updateOne(
        { _id: team._id },
        { $set: { referralBonuses: [] } }
      );
      console.log(`Fixed team: ${team.name}`);
    }

    // Step 3: Generate referral codes for users without them
    console.log('\n3️⃣ Generating referral codes for users without them...');
    const usersWithoutCodes = await User.find({ 
      $or: [
        { referralCode: { $exists: false } },
        { referralCode: null },
        { referralCode: "" }
      ]
    });

    console.log(`Found ${usersWithoutCodes.length} users without referral codes`);

    for (const user of usersWithoutCodes) {
      const referralCode = nanoid(8);
      await User.updateOne(
        { _id: user._id },
        { $set: { referralCode } }
      );
      console.log(`Generated referral code ${referralCode} for user: ${user.email}`);
    }

    // Step 4: Verify all users have unique referral codes
    console.log('\n4️⃣ Verifying unique referral codes...');
    const allUsers = await User.find({});
    const referralCodes = allUsers.map(u => u.referralCode).filter(code => code);
    const uniqueCodes = new Set(referralCodes);
    
    if (referralCodes.length === uniqueCodes.size) {
      console.log('✅ All referral codes are unique!');
    } else {
      console.log('❌ Found duplicate referral codes, fixing...');
      
      // Find and fix duplicates
      const duplicates = referralCodes.filter((code, index) => referralCodes.indexOf(code) !== index);
      const uniqueDuplicates = [...new Set(duplicates)];
      
      for (const duplicateCode of uniqueDuplicates) {
        const usersWithDuplicate = await User.find({ referralCode: duplicateCode });
        for (let i = 1; i < usersWithDuplicate.length; i++) {
          const newCode = nanoid(8);
          await User.updateOne(
            { _id: usersWithDuplicate[i]._id },
            { $set: { referralCode: newCode } }
          );
          console.log(`Fixed duplicate: ${usersWithDuplicate[i].email} -> ${newCode}`);
        }
      }
    }

    // Step 5: Test the referral system
    console.log('\n5️⃣ Testing referral system...');
    const testUser = await User.findOne({});
    if (testUser) {
      console.log(`Test user: ${testUser.email}`);
      console.log(`Referral code: ${testUser.referralCode}`);
      console.log(`Referral bonuses count: ${testUser.referralBonuses?.length || 0}`);
    }

    console.log('\n✅ Referral data fix completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Fixed ${usersWithInvalidBonuses.length} users with invalid referralBonuses`);
    console.log(`- Fixed ${teamsWithInvalidBonuses.length} teams with invalid referralBonuses`);
    console.log(`- Generated ${usersWithoutCodes.length} new referral codes`);
    console.log(`- Total users: ${allUsers.length}`);

  } catch (error) {
    console.error('❌ Error fixing referral data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixReferralData(); 
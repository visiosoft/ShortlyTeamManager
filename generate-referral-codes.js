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
});

async function generateReferralCodesForExistingUsers() {
  try {
    console.log('Starting to generate referral codes for existing users...');
    
    // Find all users without referral codes
    const usersWithoutCodes = await User.find({ referralCode: { $exists: false } });
    console.log(`Found ${usersWithoutCodes.length} users without referral codes`);
    
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
      console.log(`Generated referral code ${referralCode} for user ${user.email}`);
      generatedCount++;
    }
    
    console.log(`Successfully generated referral codes for ${generatedCount} users`);
    
    // Verify all users now have referral codes
    const usersStillWithoutCodes = await User.find({ referralCode: { $exists: false } });
    console.log(`Users still without referral codes: ${usersStillWithoutCodes.length}`);
    
  } catch (error) {
    console.error('Error generating referral codes:', error);
  } finally {
    mongoose.connection.close();
  }
}

generateReferralCodesForExistingUsers(); 
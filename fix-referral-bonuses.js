const mongoose = require('mongoose');

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shortlink';
console.log('Connecting to MongoDB:', mongoUri);
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Fix user referralBonuses
    console.log('Fixing user referralBonuses...');
    const users = await db.collection('users').find({}).toArray();
    
    for (const user of users) {
      if (user.referralBonuses && Array.isArray(user.referralBonuses)) {
        let needsUpdate = false;
        const fixedBonuses = [];
        
        for (const bonus of user.referralBonuses) {
          if (typeof bonus === 'string') {
            console.log(`Fixing malformed bonus for user ${user.email}: ${bonus}`);
            needsUpdate = true;
            // Skip malformed string bonuses
            continue;
          }
          
          if (bonus && typeof bonus === 'object') {
            // Ensure the bonus has the correct structure
            const fixedBonus = {
              userId: bonus.userId || new mongoose.Types.ObjectId(),
              amount: bonus.amount || 0,
              currency: bonus.currency || 'PKR',
              createdAt: bonus.createdAt || new Date(),
              type: bonus.type || 'unknown'
            };
            fixedBonuses.push(fixedBonus);
          }
        }
        
        if (needsUpdate) {
          await db.collection('users').updateOne(
            { _id: user._id },
            { $set: { referralBonuses: fixedBonuses } }
          );
          console.log(`Fixed referralBonuses for user ${user.email}`);
        }
      }
    }
    
    // Fix team referralBonuses
    console.log('Fixing team referralBonuses...');
    const teams = await db.collection('teams').find({}).toArray();
    
    for (const team of teams) {
      if (team.referralBonuses && Array.isArray(team.referralBonuses)) {
        let needsUpdate = false;
        const fixedBonuses = [];
        
        for (const bonus of team.referralBonuses) {
          if (typeof bonus === 'string') {
            console.log(`Fixing malformed bonus for team ${team.name}: ${bonus}`);
            needsUpdate = true;
            // Skip malformed string bonuses
            continue;
          }
          
          if (bonus && typeof bonus === 'object') {
            // Ensure the bonus has the correct structure
            const fixedBonus = {
              userId: bonus.userId || new mongoose.Types.ObjectId(),
              amount: bonus.amount || 0,
              currency: bonus.currency || 'PKR',
              createdAt: bonus.createdAt || new Date(),
              type: bonus.type || 'unknown'
            };
            fixedBonuses.push(fixedBonus);
          }
        }
        
        if (needsUpdate) {
          await db.collection('teams').updateOne(
            { _id: team._id },
            { $set: { referralBonuses: fixedBonuses } }
          );
          console.log(`Fixed referralBonuses for team ${team.name}`);
        }
      }
    }
    
    console.log('Referral bonuses fix completed!');
    
  } catch (error) {
    console.error('Error fixing referral bonuses:', error);
  } finally {
    mongoose.connection.close();
  }
}); 
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

// Team Schema
const teamSchema = new mongoose.Schema({
  name: String,
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// URL Schema
const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortCode: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  clicks: { type: Number, default: 0 },
  title: String,
  description: String,
  isActive: { type: Boolean, default: true },
  isAdminCreated: { type: Boolean, default: false },
  createdByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Click Analytics Schema
const clickAnalyticsSchema = new mongoose.Schema({
  urlId: { type: mongoose.Schema.Types.ObjectId, ref: 'Url', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  ipAddress: String,
  userAgent: String,
  referer: String,
  country: String,
  city: String,
  browser: String,
  os: String,
  device: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Team = mongoose.model('Team', teamSchema);
const Url = mongoose.model('Url', urlSchema);
const ClickAnalytics = mongoose.model('ClickAnalytics', clickAnalyticsSchema);

async function createTestData() {
  try {
    console.log('🔧 Creating Test Data...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

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
      firstName: 'Toheed',
      lastName: 'Ali',
      email: 'toheed@yahoo.com',
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
      members: [adminUser._id, regularUser._id]
    });
    
    await team.save();
    console.log('✅ Team created:', team.name);

    // Update users with team ID
    await User.updateMany({}, { teamId: team._id });
    console.log('✅ Updated users with team ID');

    // Create test URLs
    console.log('\n4. Creating test URLs...');
    const testUrls = [
      {
        originalUrl: 'https://www.google.com',
        shortCode: 'google',
        title: 'Google Search',
        description: 'Search the web'
      },
      {
        originalUrl: 'https://www.youtube.com',
        shortCode: 'youtube',
        title: 'YouTube',
        description: 'Watch videos'
      },
      {
        originalUrl: 'https://www.github.com',
        shortCode: 'github',
        title: 'GitHub',
        description: 'Code repository'
      }
    ];

    const createdUrls = [];
    for (const urlData of testUrls) {
      const url = new Url({
        ...urlData,
        userId: regularUser._id,
        teamId: team._id
      });
      
      await url.save();
      createdUrls.push(url);
      console.log(`✅ URL created: ${url.shortCode} -> ${url.originalUrl}`);
    }

    // Create test analytics data
    console.log('\n5. Creating test analytics data...');
    const testIPs = [
      { ip: '8.8.8.8', country: 'US', city: 'New York' },
      { ip: '1.1.1.1', country: 'US', city: 'Los Angeles' },
      { ip: '208.67.222.222', country: 'US', city: 'Chicago' },
      { ip: '185.60.216.35', country: 'GB', city: 'London' },
      { ip: '91.198.174.192', country: 'DE', city: 'Berlin' },
      { ip: '149.56.23.97', country: 'CA', city: 'Toronto' },
      { ip: '103.21.244.0', country: 'AU', city: 'Sydney' },
      { ip: '202.12.27.33', country: 'JP', city: 'Tokyo' },
      { ip: '31.13.72.36', country: 'IE', city: 'Dublin' },
      { ip: '203.208.60.1', country: 'CN', city: 'Beijing' }
    ];

    const analyticsToInsert = [];
    
    // Create analytics for each URL
    for (const url of createdUrls) {
      for (let i = 0; i < 10; i++) { // 10 clicks per URL
        const randomIP = testIPs[Math.floor(Math.random() * testIPs.length)];
        
        analyticsToInsert.push({
          urlId: url._id,
          userId: regularUser._id,
          teamId: team._id,
          ipAddress: randomIP.ip,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          referer: 'https://google.com',
          country: randomIP.country,
          city: randomIP.city,
          browser: 'Chrome',
          os: 'Windows',
          device: 'Desktop',
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
        });
      }
    }

    await ClickAnalytics.insertMany(analyticsToInsert);
    console.log(`✅ Created ${analyticsToInsert.length} analytics records`);

    // Update URL click counts
    console.log('\n6. Updating URL click counts...');
    for (const url of createdUrls) {
      const clickCount = await ClickAnalytics.countDocuments({ urlId: url._id });
      await Url.updateOne({ _id: url._id }, { clicks: clickCount });
      console.log(`✅ Updated ${url.shortCode}: ${clickCount} clicks`);
    }

    // Summary
    console.log('\n📊 Test Data Summary:');
    console.log('=====================');
    console.log(`Users: ${await User.countDocuments()}`);
    console.log(`Teams: ${await Team.countDocuments()}`);
    console.log(`URLs: ${await Url.countDocuments()}`);
    console.log(`Analytics Records: ${await ClickAnalytics.countDocuments()}`);
    
    console.log('\n🎉 Test data created successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('Admin: admin@test.com / password123');
    console.log('User: toheed@yahoo.com / password123');
    
    console.log('\n🔗 Test URLs:');
    createdUrls.forEach(url => {
      console.log(`  http://localhost:3009/${url.shortCode} -> ${url.originalUrl}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

createTestData(); 
const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shortlink';

// User Schema
const userSchema = new mongoose.Schema({
  email: String,
  firstName: String,
  lastName: String,
  role: String,
  teamId: mongoose.Schema.Types.ObjectId
});

// Team Schema
const teamSchema = new mongoose.Schema({
  name: String,
  adminId: mongoose.Schema.Types.ObjectId
});

// URL Schema
const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortCode: String,
  userId: mongoose.Schema.Types.ObjectId,
  teamId: mongoose.Schema.Types.ObjectId,
  clicks: Number
});

// Click Analytics Schema
const clickAnalyticsSchema = new mongoose.Schema({
  urlId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  teamId: mongoose.Schema.Types.ObjectId,
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

async function findToheedAndCreateData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Find toheed@yahoo.com user
    console.log('🔍 Looking for toheed@yahoo.com...');
    const toheedUser = await User.findOne({ email: 'toheed@yahoo.com' });
    
    if (!toheedUser) {
      console.log('❌ User toheed@yahoo.com not found in database');
      console.log('Available users:');
      const allUsers = await User.find({});
      allUsers.forEach(user => {
        console.log(`  - ${user.email} (${user.firstName} ${user.lastName}) - Role: ${user.role}`);
      });
      return;
    }
    
    console.log('✅ Found user:', toheedUser.email);
    console.log('   Name:', toheedUser.firstName, toheedUser.lastName);
    console.log('   Role:', toheedUser.role);
    console.log('   User ID:', toheedUser._id);
    console.log('   Team ID:', toheedUser.teamId);
    console.log('');
    
    // Find or create team
    let teamId = toheedUser.teamId;
    if (!teamId) {
      console.log('⚠️  User has no team, creating one...');
      const team = new Team({
        name: 'Toheed\'s Team',
        adminId: toheedUser._id
      });
      await team.save();
      teamId = team._id;
      console.log('✅ Created team with ID:', teamId);
    }
    
    // Create test URLs
    console.log('📝 Creating test URLs...');
    const testUrls = [
      { originalUrl: 'https://google.com', shortCode: 'toheed1' },
      { originalUrl: 'https://github.com', shortCode: 'toheed2' },
      { originalUrl: 'https://stackoverflow.com', shortCode: 'toheed3' },
      { originalUrl: 'https://reddit.com', shortCode: 'toheed4' },
      { originalUrl: 'https://youtube.com', shortCode: 'toheed5' },
      { originalUrl: 'https://linkedin.com', shortCode: 'toheed6' },
      { originalUrl: 'https://twitter.com', shortCode: 'toheed7' },
      { originalUrl: 'https://facebook.com', shortCode: 'toheed8' }
    ];
    
    const createdUrls = [];
    for (const urlData of testUrls) {
      try {
        const url = new Url({
          originalUrl: urlData.originalUrl,
          shortCode: urlData.shortCode,
          userId: toheedUser._id,
          teamId: teamId,
          clicks: 0
        });
        await url.save();
        createdUrls.push(url);
        console.log(`✅ Created URL: ${urlData.shortCode} -> ${urlData.originalUrl}`);
      } catch (error) {
        console.log(`⚠️  URL ${urlData.shortCode} might already exist, skipping...`);
      }
    }
    
    if (createdUrls.length === 0) {
      console.log('❌ No URLs created, cannot generate analytics data');
      return;
    }
    
    // Create test analytics data
    console.log('\n📊 Creating test analytics data...');
    
    const testData = [
      // US clicks
      { country: 'US', city: 'New York', ipAddress: '8.8.8.8', clicks: 15 },
      { country: 'US', city: 'Los Angeles', ipAddress: '1.1.1.1', clicks: 12 },
      { country: 'US', city: 'Chicago', ipAddress: '208.67.222.222', clicks: 8 },
      { country: 'US', city: 'Miami', ipAddress: '151.101.1.69', clicks: 6 },
      { country: 'US', city: 'Seattle', ipAddress: '151.101.65.69', clicks: 4 },
      
      // UK clicks
      { country: 'GB', city: 'London', ipAddress: '185.60.216.35', clicks: 10 },
      { country: 'GB', city: 'Manchester', ipAddress: '185.60.216.36', clicks: 7 },
      { country: 'GB', city: 'Birmingham', ipAddress: '185.60.216.37', clicks: 5 },
      
      // Germany clicks
      { country: 'DE', city: 'Berlin', ipAddress: '91.198.174.192', clicks: 9 },
      { country: 'DE', city: 'Munich', ipAddress: '91.198.174.193', clicks: 6 },
      { country: 'DE', city: 'Hamburg', ipAddress: '91.198.174.194', clicks: 4 },
      
      // Canada clicks
      { country: 'CA', city: 'Toronto', ipAddress: '149.56.23.97', clicks: 8 },
      { country: 'CA', city: 'Vancouver', ipAddress: '149.56.23.98', clicks: 5 },
      { country: 'CA', city: 'Montreal', ipAddress: '149.56.23.99', clicks: 3 },
      
      // Australia clicks
      { country: 'AU', city: 'Sydney', ipAddress: '103.21.244.0', clicks: 7 },
      { country: 'AU', city: 'Melbourne', ipAddress: '103.21.244.1', clicks: 4 },
      { country: 'AU', city: 'Brisbane', ipAddress: '103.21.244.2', clicks: 2 },
      
      // Japan clicks
      { country: 'JP', city: 'Tokyo', ipAddress: '202.12.27.33', clicks: 6 },
      { country: 'JP', city: 'Osaka', ipAddress: '202.12.27.34', clicks: 3 },
      { country: 'JP', city: 'Kyoto', ipAddress: '202.12.27.35', clicks: 2 },
      
      // Ireland clicks
      { country: 'IE', city: 'Dublin', ipAddress: '31.13.72.36', clicks: 5 },
      { country: 'IE', city: 'Cork', ipAddress: '31.13.72.37', clicks: 2 },
      { country: 'IE', city: 'Galway', ipAddress: '31.13.72.38', clicks: 1 },
      
      // China clicks
      { country: 'CN', city: 'Beijing', ipAddress: '203.208.60.1', clicks: 4 },
      { country: 'CN', city: 'Shanghai', ipAddress: '203.208.60.2', clicks: 3 },
      { country: 'CN', city: 'Guangzhou', ipAddress: '203.208.60.3', clicks: 2 },
    ];
    
    const analyticsToInsert = [];
    
    testData.forEach((data) => {
      for (let i = 0; i < data.clicks; i++) {
        const randomUrl = createdUrls[Math.floor(Math.random() * createdUrls.length)];
        analyticsToInsert.push({
          urlId: randomUrl._id,
          userId: toheedUser._id,
          teamId: teamId,
          ipAddress: data.ipAddress,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          referer: 'https://google.com',
          country: data.country,
          city: data.city,
          browser: 'Chrome',
          os: 'Windows',
          device: 'Desktop',
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
        });
      }
    });
    
    await ClickAnalytics.insertMany(analyticsToInsert);
    console.log(`✅ Inserted ${analyticsToInsert.length} click records\n`);
    
    // Update URL click counts
    console.log('📈 Updating URL click counts...');
    for (const url of createdUrls) {
      const clickCount = await ClickAnalytics.countDocuments({ urlId: url._id });
      await Url.updateOne({ _id: url._id }, { clicks: clickCount });
      console.log(`✅ Updated ${url.shortCode}: ${clickCount} clicks`);
    }
    
    // Show summary
    console.log('\n📊 Test Data Summary:');
    const totalClicks = analyticsToInsert.length;
    const uniqueCountries = new Set(analyticsToInsert.map(a => a.country)).size;
    const uniqueCities = new Set(analyticsToInsert.map(a => a.city)).size;
    
    console.log(`Total Clicks: ${totalClicks}`);
    console.log(`Unique Countries: ${uniqueCountries}`);
    console.log(`Unique Cities: ${uniqueCities}`);
    
    console.log('\n🌍 Countries with clicks:');
    const countryStats = {};
    analyticsToInsert.forEach(a => {
      countryStats[a.country] = (countryStats[a.country] || 0) + 1;
    });
    
    Object.entries(countryStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([country, clicks]) => {
        console.log(`  ${country}: ${clicks} clicks`);
      });
    
    console.log('\n🎉 Test data created successfully for toheed@yahoo.com!');
    console.log('Now you can:');
    console.log('1. Go to http://localhost:3000/analytics');
    console.log('2. Login with toheed@yahoo.com');
    console.log('3. View your analytics data');
    console.log('4. If you\'re an admin, you\'ll see the admin analytics sections');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
findToheedAndCreateData(); 
const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/url-shortener';

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

const ClickAnalytics = mongoose.model('ClickAnalytics', clickAnalyticsSchema);

// Test data
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

async function insertTestData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get existing IDs (you'll need to replace these with actual IDs from your database)
    console.log('📋 Please provide the following IDs from your database:');
    console.log('1. Team ID (from teams collection)');
    console.log('2. User ID (from users collection)');
    console.log('3. URL ID (from urls collection)');
    console.log('');
    
    // For demo purposes, we'll use placeholder ObjectIds
    const teamId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const urlId = new mongoose.Types.ObjectId();
    
    console.log('🔧 Using placeholder IDs for demo:');
    console.log(`Team ID: ${teamId}`);
    console.log(`User ID: ${userId}`);
    console.log(`URL ID: ${urlId}\n`);
    
    // Clear existing test data
    console.log('🧹 Clearing existing test data...');
    await ClickAnalytics.deleteMany({});
    console.log('✅ Cleared existing data\n');
    
    // Insert test data
    console.log('📊 Inserting test analytics data...');
    const analyticsToInsert = [];
    
    testData.forEach((data, index) => {
      for (let i = 0; i < data.clicks; i++) {
        analyticsToInsert.push({
          urlId: urlId,
          userId: userId,
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
    
    // Show summary
    console.log('📈 Test Data Summary:');
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
    
    console.log('\n🎉 Test data inserted successfully!');
    console.log('Now you can:');
    console.log('1. Go to http://localhost:3000/analytics');
    console.log('2. Login as admin user');
    console.log('3. View the admin analytics sections');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
insertTestData(); 
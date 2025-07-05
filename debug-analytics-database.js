const mongoose = require('mongoose');
const geoip = require('geoip-lite');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://cutly:hl3yLRKU0Ia4GfPj@cluster0.ddcez.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

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

async function debugAnalyticsDatabase() {
  try {
    console.log('🔍 Debugging Analytics Database...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all analytics records
    const allAnalytics = await ClickAnalytics.find({}).sort({ createdAt: -1 }).limit(20);
    
    console.log(`📊 Found ${allAnalytics.length} analytics records\n`);
    
    if (allAnalytics.length === 0) {
      console.log('❌ No analytics records found in database');
      return;
    }

    // Analyze the records
    console.log('📋 Analytics Records Analysis:');
    console.log('==============================');
    
    let recordsWithCountry = 0;
    let recordsWithoutCountry = 0;
    let recordsWithCity = 0;
    let recordsWithoutCity = 0;
    
    allAnalytics.forEach((record, index) => {
      console.log(`\nRecord ${index + 1}:`);
      console.log(`  ID: ${record._id}`);
      console.log(`  IP: ${record.ipAddress || 'NULL'}`);
      console.log(`  Country: ${record.country || 'NULL'}`);
      console.log(`  City: ${record.city || 'NULL'}`);
      console.log(`  Created: ${record.createdAt}`);
      
      if (record.country) {
        recordsWithCountry++;
      } else {
        recordsWithoutCountry++;
      }
      
      if (record.city) {
        recordsWithCity++;
      } else {
        recordsWithoutCity++;
      }
    });

    console.log('\n📈 Summary:');
    console.log('===========');
    console.log(`Records with country: ${recordsWithCountry}`);
    console.log(`Records without country: ${recordsWithoutCountry}`);
    console.log(`Records with city: ${recordsWithCity}`);
    console.log(`Records without city: ${recordsWithoutCity}`);

    // Test IP geolocation for records without country data
    console.log('\n🔍 Testing IP Geolocation for Records Without Country:');
    console.log('=======================================================');
    
    const recordsWithoutCountryData = allAnalytics.filter(r => !r.country && r.ipAddress);
    
    if (recordsWithoutCountryData.length > 0) {
      console.log(`Found ${recordsWithoutCountryData.length} records with IP but no country data`);
      
      recordsWithoutCountryData.slice(0, 5).forEach((record, index) => {
        console.log(`\nRecord ${index + 1}:`);
        console.log(`  IP: ${record.ipAddress}`);
        
        // Test geolocation
        const geo = geoip.lookup(record.ipAddress);
        if (geo) {
          console.log(`  ✅ Geolocation found: ${geo.country} (${geo.city})`);
          console.log(`  📍 Should have been saved as: Country=${geo.country}, City=${geo.city}`);
        } else {
          console.log(`  ❌ No geolocation data found for this IP`);
        }
      });
    } else {
      console.log('✅ All records have country data or no IP address');
    }

    // Check for your specific IP
    console.log('\n🎯 Checking Your Specific IP (168.154.177.146):');
    console.log('===============================================');
    
    const yourIPRecords = allAnalytics.filter(r => r.ipAddress === '168.154.177.146');
    
    if (yourIPRecords.length > 0) {
      console.log(`Found ${yourIPRecords.length} records with your IP`);
      
      yourIPRecords.forEach((record, index) => {
        console.log(`\nRecord ${index + 1}:`);
        console.log(`  Country: ${record.country || 'NULL'}`);
        console.log(`  City: ${record.city || 'NULL'}`);
        console.log(`  Created: ${record.createdAt}`);
      });
    } else {
      console.log('❌ No records found with your IP address');
    }

    // Test current geolocation for your IP
    console.log('\n🔧 Current Geolocation Test for Your IP:');
    console.log('=========================================');
    const yourGeo = geoip.lookup('168.154.177.146');
    if (yourGeo) {
      console.log(`IP: 168.154.177.146`);
      console.log(`Country: ${yourGeo.country}`);
      console.log(`City: ${yourGeo.city}`);
      console.log(`Region: ${yourGeo.region}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

debugAnalyticsDatabase(); 
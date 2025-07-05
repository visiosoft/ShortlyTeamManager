const axios = require('axios');
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:3009/api';
const MONGODB_URI = 'mongodb://localhost:27017/shortlink';

async function insertDiverseCountries() {
  console.log('🔧 Inserting diverse country data for testing map highlighting...\n');

  try {
    // 1. Connect to MongoDB
    console.log('1. Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 2. Login to get user info
    console.log('2. Logging in as toheed@yahoo.com...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'toheed@yahoo.com',
      password: '123456'
    });

    const user = loginResponse.data.user;
    console.log('✅ Login successful!');
    console.log(`User ID: ${user.id}\n`);

    // 3. Get ClickAnalytics model
    const ClickAnalytics = mongoose.model('ClickAnalytics', new mongoose.Schema({
      urlId: String,
      userId: String,
      ipAddress: String,
      country: String,
      countryCode: String,
      city: String,
      userAgent: String,
      referer: String,
      timestamp: { type: Date, default: Date.now }
    }));

    // 4. Get user's URLs
    console.log('3. Getting user URLs...');
    const urlsResponse = await axios.get(`${BASE_URL}/urls/my-urls`, {
      headers: { Authorization: `Bearer ${loginResponse.data.access_token}` }
    });

    const urls = urlsResponse.data.urls;
    console.log(`✅ Found ${urls.length} URLs`);

    // 5. Clear existing analytics data
    console.log('\n4. Clearing existing analytics data...');
    await ClickAnalytics.deleteMany({ userId: user.id });
    console.log('✅ Cleared existing data');

    // 6. Insert diverse country data
    console.log('\n5. Inserting diverse country data...');
    
    const diverseCountries = [
      { country: 'United States', countryCode: 'US', city: 'New York', ip: '8.8.8.8', clicks: 25 },
      { country: 'United States', countryCode: 'US', city: 'Los Angeles', ip: '8.8.4.4', clicks: 18 },
      { country: 'United Kingdom', countryCode: 'GB', city: 'London', ip: '185.228.168.9', clicks: 15 },
      { country: 'Germany', countryCode: 'DE', city: 'Berlin', ip: '9.9.9.9', clicks: 12 },
      { country: 'Canada', countryCode: 'CA', city: 'Toronto', ip: '76.76.19.56', clicks: 10 },
      { country: 'Australia', countryCode: 'AU', city: 'Sydney', ip: '1.1.1.1', clicks: 8 },
      { country: 'Netherlands', countryCode: 'NL', city: 'Amsterdam', ip: '94.140.14.14', clicks: 6 },
      { country: 'France', countryCode: 'FR', city: 'Paris', ip: '176.103.130.131', clicks: 9 },
      { country: 'Spain', countryCode: 'ES', city: 'Madrid', ip: '176.103.130.132', clicks: 7 },
      { country: 'Italy', countryCode: 'IT', city: 'Rome', ip: '176.103.130.133', clicks: 5 },
      { country: 'Japan', countryCode: 'JP', city: 'Tokyo', ip: '176.103.130.134', clicks: 14 },
      { country: 'South Korea', countryCode: 'KR', city: 'Seoul', ip: '176.103.130.135', clicks: 11 },
      { country: 'India', countryCode: 'IN', city: 'Mumbai', ip: '176.103.130.136', clicks: 20 },
      { country: 'Brazil', countryCode: 'BR', city: 'São Paulo', ip: '176.103.130.137', clicks: 13 },
      { country: 'Mexico', countryCode: 'MX', city: 'Mexico City', ip: '176.103.130.138', clicks: 8 },
      { country: 'Pakistan', countryCode: 'PK', city: 'Rawalpindi', ip: '39.62.177.26', clicks: 8 }
    ];

    // Insert data for each country
    for (const url of urls.slice(0, 3)) { // Use first 3 URLs
      for (const countryData of diverseCountries) {
        for (let i = 0; i < countryData.clicks; i++) {
          await ClickAnalytics.create({
            urlId: url.id,
            userId: user.id,
            ipAddress: countryData.ip,
            country: countryData.country,
            countryCode: countryData.countryCode,
            city: countryData.city,
            userAgent: 'Mozilla/5.0 (Test Browser)',
            referer: 'https://test.com',
            timestamp: new Date()
          });
        }
        console.log(`✅ Added ${countryData.clicks} clicks for ${countryData.country} (${countryData.countryCode})`);
      }
    }

    console.log('\n✅ Diverse country data inserted successfully!');
    console.log('Now refresh your analytics page to see the highlighted countries on the map.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

insertDiverseCountries(); 
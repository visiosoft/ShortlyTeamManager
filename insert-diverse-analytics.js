const axios = require('axios');
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:3009/api';
const MONGODB_URI = 'mongodb://localhost:27017/shortlink';

async function insertDiverseAnalytics() {
  console.log('🔧 Inserting diverse analytics data for toheed@yahoo.com...\n');

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

    // 5. Insert diverse analytics data
    console.log('\n4. Inserting diverse analytics data...');
    
    const diverseData = [
      { country: 'United States', countryCode: 'US', city: 'New York', ip: '8.8.8.8', clicks: 15 },
      { country: 'United States', countryCode: 'US', city: 'Los Angeles', ip: '8.8.4.4', clicks: 12 },
      { country: 'United States', countryCode: 'US', city: 'San Francisco', ip: '208.67.222.222', clicks: 8 },
      { country: 'United Kingdom', countryCode: 'GB', city: 'London', ip: '185.228.168.9', clicks: 10 },
      { country: 'United Kingdom', countryCode: 'GB', city: 'Manchester', ip: '185.228.169.9', clicks: 6 },
      { country: 'Germany', countryCode: 'DE', city: 'Berlin', ip: '9.9.9.9', clicks: 9 },
      { country: 'Germany', countryCode: 'DE', city: 'Munich', ip: '9.9.9.10', clicks: 7 },
      { country: 'Canada', countryCode: 'CA', city: 'Toronto', ip: '76.76.19.56', clicks: 11 },
      { country: 'Canada', countryCode: 'CA', city: 'Vancouver', ip: '76.76.2.0', clicks: 5 },
      { country: 'Australia', countryCode: 'AU', city: 'Sydney', ip: '1.1.1.1', clicks: 8 },
      { country: 'Australia', countryCode: 'AU', city: 'Melbourne', ip: '1.0.0.1', clicks: 6 },
      { country: 'Netherlands', countryCode: 'NL', city: 'Amsterdam', ip: '94.140.14.14', clicks: 7 },
      { country: 'Netherlands', countryCode: 'NL', city: 'Rotterdam', ip: '94.140.15.15', clicks: 4 },
      { country: 'Switzerland', countryCode: 'CH', city: 'Zurich', ip: '176.103.130.130', clicks: 5 },
      { country: 'France', countryCode: 'FR', city: 'Paris', ip: '176.103.130.131', clicks: 9 },
      { country: 'Spain', countryCode: 'ES', city: 'Madrid', ip: '176.103.130.132', clicks: 6 },
      { country: 'Italy', countryCode: 'IT', city: 'Rome', ip: '176.103.130.133', clicks: 4 },
      { country: 'Japan', countryCode: 'JP', city: 'Tokyo', ip: '176.103.130.134', clicks: 12 },
      { country: 'South Korea', countryCode: 'KR', city: 'Seoul', ip: '176.103.130.135', clicks: 8 },
      { country: 'India', countryCode: 'IN', city: 'Mumbai', ip: '176.103.130.136', clicks: 15 },
      { country: 'Brazil', countryCode: 'BR', city: 'São Paulo', ip: '176.103.130.137', clicks: 10 },
      { country: 'Mexico', countryCode: 'MX', city: 'Mexico City', ip: '176.103.130.138', clicks: 7 }
    ];

    // Clear existing analytics data for this user
    console.log('Clearing existing analytics data...');
    await ClickAnalytics.deleteMany({ userId: user.id });

    // Insert new diverse data
    for (const url of urls.slice(0, 5)) { // Use first 5 URLs
      for (const data of diverseData) {
        for (let i = 0; i < data.clicks; i++) {
          await ClickAnalytics.create({
            urlId: url.id,
            userId: user.id,
            ipAddress: data.ip,
            country: data.country,
            countryCode: data.countryCode,
            city: data.city,
            userAgent: 'Mozilla/5.0 (Test Browser)',
            referer: 'https://test.com',
            timestamp: new Date()
          });
        }
        console.log(`✅ Added ${data.clicks} clicks for ${data.country} (${data.city})`);
      }
    }

    console.log('\n✅ Diverse analytics data inserted successfully!');
    console.log('Now refresh your analytics page to see the highlighted countries on the map.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

insertDiverseAnalytics(); 
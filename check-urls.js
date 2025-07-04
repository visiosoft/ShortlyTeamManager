const axios = require('axios');

const API_BASE = 'http://localhost:3009/api';

async function checkUrls() {
  console.log('🔍 Checking if URLs exist...\n');
  
  const testUrls = ['test1', 'test2', 'test3', 'test4', 'test5'];
  
  for (const shortCode of testUrls) {
    try {
      const response = await axios.get(`${API_BASE}/urls/info/${shortCode}`);
      console.log(`✅ ${shortCode}: ${response.data.originalUrl} (${response.data.clicks} clicks)`);
    } catch (error) {
      console.log(`❌ ${shortCode}: ${error.response?.status} - ${error.response?.data?.message || 'Not found'}`);
    }
  }
  
  console.log('\n📋 Instructions:');
  console.log('1. If you see "Not found" for all URLs, create them at http://localhost:3000/dashboard');
  console.log('2. If URLs exist, run: node quick-test-data.js --generate-clicks');
  console.log('3. Then check analytics at http://localhost:3000/analytics');
}

checkUrls(); 
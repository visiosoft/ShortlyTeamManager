const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testDirectLinksFiltering() {
  try {
    // Login as a regular user
    console.log('Logging in as regular user...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'zulfiqar@gmail.com',
      password: 'Xulfi1234@'
    });
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    
    console.log('User logged in:', user.firstName, user.lastName);
    console.log('User ID:', user.id);
    
    // Set auth header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Fetch both endpoints
    console.log('\nFetching assigned URLs...');
    const assignedUrlsResponse = await axios.get(`${BASE_URL}/urls/assigned-to-me`);
    const assignedUrls = assignedUrlsResponse.data.urls || [];
    
    console.log('\nFetching my URLs...');
    const myUrlsResponse = await axios.get(`${BASE_URL}/urls/my-urls`);
    const myUrls = myUrlsResponse.data.urls || [];
    
    console.log(`\nAssigned URLs count: ${assignedUrls.length}`);
    console.log(`My URLs count: ${myUrls.length}`);
    
    // Apply the same filtering logic as the frontend
    const adminCreated = assignedUrls;
    const userCreated = myUrls.filter((url) => !url.isAdminCreated);
    
    console.log(`\nFiltered Admin Created URLs: ${adminCreated.length}`);
    console.log(`Filtered User Created URLs: ${userCreated.length}`);
    
    console.log('\n=== ADMIN CREATED URLs ===');
    adminCreated.forEach((url, index) => {
      console.log(`${index + 1}. ${url.shortUrl} - isAdminCreated: ${url.isAdminCreated}`);
      if (url.createdByAdmin) {
        console.log(`   Created by: ${url.createdByAdmin.firstName} ${url.createdByAdmin.lastName}`);
      }
    });
    
    console.log('\n=== USER CREATED URLs ===');
    userCreated.forEach((url, index) => {
      console.log(`${index + 1}. ${url.shortUrl} - isAdminCreated: ${url.isAdminCreated}`);
      if (url.user) {
        console.log(`   Created by: ${url.user.firstName} ${url.user.lastName}`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testDirectLinksFiltering(); 
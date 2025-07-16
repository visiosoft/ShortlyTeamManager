const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function testAssignedUrlsDisplay() {
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
    console.log('Team ID:', user.team.id);
    
    // Set auth header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Fetch assigned URLs
    console.log('\nFetching assigned URLs...');
    const assignedUrlsResponse = await axios.get(`${BASE_URL}/urls/assigned-to-me`);
    const assignedUrls = assignedUrlsResponse.data.urls;
    
    console.log(`Found ${assignedUrls.length} assigned URLs:`);
    
    assignedUrls.forEach((url, index) => {
      console.log(`\nURL ${index + 1}:`);
      console.log(`  ID: ${url.id}`);
      console.log(`  Short URL: ${url.shortUrl}`);
      console.log(`  Original URL: ${url.originalUrl}`);
      console.log(`  User ID: ${url.userId}`);
      console.log(`  Is Admin Created: ${url.isAdminCreated}`);
      console.log(`  User Info:`, url.user ? `${url.user.firstName} ${url.user.lastName}` : 'No user info');
      console.log(`  Created By Admin:`, url.createdByAdmin ? `${url.createdByAdmin.firstName} ${url.createdByAdmin.lastName}` : 'No admin info');
      console.log(`  Title: ${url.title || 'No title'}`);
      console.log(`  Description: ${url.description || 'No description'}`);
    });
    
    // Also check my-urls endpoint
    console.log('\nFetching my-urls...');
    const myUrlsResponse = await axios.get(`${BASE_URL}/urls/my-urls`);
    const myUrls = myUrlsResponse.data.urls;
    
    console.log(`Found ${myUrls.length} my URLs:`);
    
    myUrls.forEach((url, index) => {
      console.log(`\nURL ${index + 1}:`);
      console.log(`  ID: ${url.id}`);
      console.log(`  Short URL: ${url.shortUrl}`);
      console.log(`  Original URL: ${url.originalUrl}`);
      console.log(`  User ID: ${url.userId}`);
      console.log(`  Is Admin Created: ${url.isAdminCreated}`);
      console.log(`  User Info:`, url.user ? `${url.user.firstName} ${url.user.lastName}` : 'No user info');
      console.log(`  Created By Admin:`, url.createdByAdmin ? `${url.createdByAdmin.firstName} ${url.createdByAdmin.lastName}` : 'No admin info');
      console.log(`  Title: ${url.title || 'No title'}`);
      console.log(`  Description: ${url.description || 'No description'}`);
    });
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAssignedUrlsDisplay(); 
const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

async function fixDefaultUrls() {
  try {
    console.log('🔧 Fixing Default URLs...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'zulfiqar@yahoo.com',
      password: 'Xulfi1234@'
    });

    const adminToken = adminLoginResponse.data.access_token;
    console.log('✅ Admin login successful');

    // Step 2: Get all default URLs
    console.log('\n2. Getting all default URLs...');
    const defaultUrlsResponse = await axios.get(`${BASE_URL}/urls/default`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('✅ Default URLs retrieved:', defaultUrlsResponse.data.length);
    
    if (defaultUrlsResponse.data.length === 0) {
      console.log('❌ No default URLs found to fix');
      return;
    }

    // Step 3: Create new template URLs to replace the old ones
    console.log('\n3. Creating new template URLs...');
    const newTemplateUrls = [];
    
    for (const oldUrl of defaultUrlsResponse.data) {
      try {
        console.log(`Creating template for: ${oldUrl.shortCode} -> ${oldUrl.originalUrl}`);
        
        const createTemplateResponse = await axios.post(`${BASE_URL}/urls/default`, {
          originalUrl: oldUrl.originalUrl,
          title: oldUrl.title || 'Default URL',
          description: oldUrl.description || 'Default URL for new users'
        }, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });

        if (createTemplateResponse.data && createTemplateResponse.data.length > 0) {
          const newUrl = createTemplateResponse.data[0];
          newTemplateUrls.push(newUrl);
          console.log(`✅ Created template: ${newUrl.shortCode} -> ${newUrl.originalUrl}`);
        }
      } catch (error) {
        console.error(`❌ Failed to create template for ${oldUrl.shortCode}:`, error.response?.data || error.message);
      }
    }

    console.log(`\n✅ Created ${newTemplateUrls.length} new template URLs`);

    // Step 4: Test with a new user
    console.log('\n4. Testing with a new user...');
    const newUserEmail = `testfix${Date.now()}@example.com`;
    const newUserPassword = 'TestPass123!';
    
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      firstName: 'Test',
      lastName: 'Fix',
      email: newUserEmail,
      password: newUserPassword,
      teamName: 'Fix Test Team'
    });

    console.log('✅ New user created:', newUserEmail);
    console.log('User ID:', registerResponse.data.user.id);
    console.log('Team ID:', registerResponse.data.user.teamId);

    // Step 5: Login as the new user
    console.log('\n5. Logging in as new user...');
    const userLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: newUserEmail,
      password: newUserPassword
    });

    const userToken = userLoginResponse.data.access_token;
    const newUser = userLoginResponse.data.user;
    console.log('✅ New user login successful');

    // Step 6: Check assigned URLs
    console.log('\n6. Checking assigned URLs...');
    const assignedUrlsResponse = await axios.get(`${BASE_URL}/urls/assigned-to-me`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    console.log('✅ Assigned URLs response received');
    console.log('Total assigned URLs:', assignedUrlsResponse.data.urls.length);
    
    if (assignedUrlsResponse.data.urls.length > 0) {
      console.log('\n📋 Assigned URLs:');
      assignedUrlsResponse.data.urls.forEach((url, index) => {
        console.log(`  ${index + 1}. ${url.shortCode} -> ${url.originalUrl}`);
        console.log(`     Type: ${url.isAdminCreated ? 'Admin Created' : 'User Created'}`);
      });
      console.log('\n🎉 SUCCESS: New user has default URLs assigned!');
    } else {
      console.log('❌ No URLs assigned to new user!');
    }

    console.log('\n🎉 Fix completed!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

fixDefaultUrls(); 
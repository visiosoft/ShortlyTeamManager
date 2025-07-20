const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function fixMissingUrls() {
  console.log('🔧 Fixing Missing URLs...\n');

  // Step 1: Login as admin
  console.log('1. Logging in as admin...');
  const adminToken = await axios.post(`${BASE_URL}/api/auth/login`, {
    email: 'khantoheedali@gmail.com',
    password: 'Digital@'
  }).then(res => res.data.access_token);

  console.log('✅ Admin logged in');

  // Step 2: Get default URLs
  console.log('\n2. Getting default URLs...');
  const defaultUrls = await axios.get(`${BASE_URL}/api/urls/default`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  }).then(res => res.data);

  console.log(`📊 Default URLs (${defaultUrls.length} total):`);
  defaultUrls.forEach((url, index) => {
    console.log(`   ${index + 1}. ${url.shortUrl} (${url.title || 'No title'})`);
  });

  // Step 3: Login as user
  console.log('\n3. Logging in as user...');
  const userToken = await axios.post(`${BASE_URL}/api/auth/login`, {
    email: 'zulfiqar@gmail.com',
    password: 'Xulfi1234@'
  }).then(res => res.data.access_token);

  console.log('✅ User logged in');

  // Step 4: Get user profile
  console.log('\n4. Getting user profile...');
  const userProfile = await axios.get(`${BASE_URL}/api/auth/profile`, {
    headers: { Authorization: `Bearer ${userToken}` }
  }).then(res => res.data);

  console.log('✅ User profile:', userProfile.email, 'Team ID:', userProfile.teamId);

  // Step 5: Get current assigned URLs
  console.log('\n5. Getting current assigned URLs...');
  const assignedUrls = await axios.get(`${BASE_URL}/api/urls/assigned-to-me`, {
    headers: { Authorization: `Bearer ${userToken}` }
  }).then(res => res.data);

  console.log(`📊 Current assigned URLs (${assignedUrls.urls.length} total):`);
  assignedUrls.urls.forEach((url, index) => {
    console.log(`   ${index + 1}. ${url.shortUrl} (${url.title || 'No title'})`);
  });

  // Step 6: Analyze what's missing
  console.log('\n6. Analyzing missing URLs...');
  console.log(`📈 Analysis:`);
  console.log(`   - Default URLs available: ${defaultUrls.length}`);
  console.log(`   - URLs currently assigned: ${assignedUrls.urls.length}`);
  console.log(`   - Missing URLs: ${defaultUrls.length - assignedUrls.urls.length}`);

  if (assignedUrls.urls.length === defaultUrls.length) {
    console.log('✅ SUCCESS: All default URLs are already assigned!');
    return;
  }

  // Step 7: Manually assign missing URLs
  console.log('\n7. Manually assigning missing URLs...');
  
  for (const defaultUrl of defaultUrls) {
    // Check if this default URL is already assigned
    const isAlreadyAssigned = assignedUrls.urls.some(assignedUrl => 
      assignedUrl.originalUrl === defaultUrl.originalUrl
    );

    if (!isAlreadyAssigned) {
      console.log(`   - Assigning: ${defaultUrl.shortUrl} (${defaultUrl.title || 'No title'})`);
      
      try {
        // Create a new URL for the user based on the default URL
        const response = await axios.post(`${BASE_URL}/api/urls/admin`, {
          originalUrl: defaultUrl.originalUrl,
          targetUserId: userProfile.userId,
          title: defaultUrl.title || 'Default URL',
          description: defaultUrl.description || 'Assigned from default URLs'
        }, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        console.log(`   ✅ Successfully assigned: ${response.data.shortUrl}`);
      } catch (error) {
        console.error(`   ❌ Failed to assign: ${defaultUrl.shortUrl}`, error.response?.data || error.message);
      }
    } else {
      console.log(`   - Already assigned: ${defaultUrl.shortUrl} (${defaultUrl.title || 'No title'})`);
    }
  }

  // Step 8: Verify the fix
  console.log('\n8. Verifying the fix...');
  const updatedAssignedUrls = await axios.get(`${BASE_URL}/api/urls/assigned-to-me`, {
    headers: { Authorization: `Bearer ${userToken}` }
  }).then(res => res.data);

  console.log(`📊 Updated assigned URLs (${updatedAssignedUrls.urls.length} total):`);
  updatedAssignedUrls.urls.forEach((url, index) => {
    console.log(`   ${index + 1}. ${url.shortUrl} (${url.title || 'No title'})`);
  });

  if (updatedAssignedUrls.urls.length === defaultUrls.length) {
    console.log('✅ SUCCESS: All default URLs are now assigned!');
  } else {
    console.log('❌ ISSUE: Still missing some URLs');
    console.log(`   - Expected: ${defaultUrls.length} URLs`);
    console.log(`   - Actual: ${updatedAssignedUrls.urls.length} URLs`);
  }

  console.log('\n🎉 Fix completed!');
}

fixMissingUrls().catch(console.error); 
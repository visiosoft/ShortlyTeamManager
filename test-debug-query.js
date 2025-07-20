const axios = require('axios');

const BASE_URL = 'http://localhost:3009';

async function debugQuery() {
  console.log('🔍 Debugging Query...\n');

  // Login as user
  const userToken = await axios.post(`${BASE_URL}/api/auth/login`, {
    email: 'zulfiqar@gmail.com',
    password: 'Xulfi1234@'
  }).then(res => res.data.access_token);

  console.log('✅ User logged in');

  // Get assigned URLs
  const assignedUrls = await axios.get(`${BASE_URL}/api/urls/assigned-to-me`, {
    headers: { Authorization: `Bearer ${userToken}` }
  }).then(res => res.data);

  console.log(`📊 Assigned URLs (${assignedUrls.urls.length} total):`);
  
  // Group by creator
  const urlsByCreator = {};
  assignedUrls.urls.forEach((url, index) => {
    const creatorId = url.createdByAdmin?.id || 'Unknown';
    const creatorName = url.createdByAdmin ? `${url.createdByAdmin.firstName} ${url.createdByAdmin.lastName}` : 'Unknown';
    
    if (!urlsByCreator[creatorId]) {
      urlsByCreator[creatorId] = {
        name: creatorName,
        count: 0,
        urls: []
      };
    }
    
    urlsByCreator[creatorId].count++;
    urlsByCreator[creatorId].urls.push(url);
    
    console.log(`   ${index + 1}. ${url.shortUrl} (${url.title || 'No title'}) - Created by: ${creatorName} (${creatorId})`);
  });

  console.log('\n📈 URLs by Creator:');
  Object.entries(urlsByCreator).forEach(([creatorId, data]) => {
    console.log(`   - ${data.name} (${creatorId}): ${data.count} URLs`);
  });

  // Login as admin to get default URLs
  const adminToken = await axios.post(`${BASE_URL}/api/auth/login`, {
    email: 'khantoheedali@gmail.com',
    password: 'Digital@'
  }).then(res => res.data.access_token);

  console.log('\n✅ Admin logged in');

  // Get default URLs
  const defaultUrls = await axios.get(`${BASE_URL}/api/urls/default`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  }).then(res => res.data);

  console.log(`📊 Default URLs (${defaultUrls.length} total):`);
  defaultUrls.forEach((url, index) => {
    const creatorId = url.createdByAdmin?.id || 'Unknown';
    const creatorName = url.createdByAdmin ? `${url.createdByAdmin.firstName} ${url.createdByAdmin.lastName}` : 'Unknown';
    console.log(`   ${index + 1}. ${url.shortUrl} (${url.title || 'No title'}) - Created by: ${creatorName} (${creatorId})`);
  });

  // Check which admin created the default URLs
  const defaultUrlCreators = [...new Set(defaultUrls.map(url => url.createdByAdmin?.id).filter(Boolean))];
  console.log('\n🔍 Default URL Creators:', defaultUrlCreators);

  // Check which creators are in assigned URLs
  const assignedUrlCreators = Object.keys(urlsByCreator);
  console.log('🔍 Assigned URL Creators:', assignedUrlCreators);

  // Check if assigned URLs contain creators not in default URLs
  const extraCreators = assignedUrlCreators.filter(creator => !defaultUrlCreators.includes(creator));
  console.log('🔍 Extra Creators in Assigned URLs:', extraCreators);

  if (extraCreators.length > 0) {
    console.log('❌ ISSUE: Assigned URLs contain creators not in default URLs!');
    extraCreators.forEach(creatorId => {
      const creator = urlsByCreator[creatorId];
      console.log(`   - ${creator.name} (${creatorId}): ${creator.count} URLs (should not be shown)`);
    });
  } else {
    console.log('✅ SUCCESS: All assigned URLs are from default URL creators');
  }

  console.log('\n🎉 Debug completed!');
}

debugQuery().catch(console.error); 
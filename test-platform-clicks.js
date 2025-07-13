const axios = require('axios');

async function testPlatformClicks() {
  console.log('🧪 Testing Platform Clicks...\n');

  try {
    // Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3009/api/auth/login', {
      email: 'zulfiqar@yahoo.com',
      password: 'Xulfi1234@'
    });

    const token = loginResponse.data.access_token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful');
    console.log('User ID:', user._id);
    console.log('Team ID:', user.teamId);

    // Get platforms
    console.log('\n2. Getting platforms...');
    const platformsResponse = await axios.get('http://localhost:3009/api/platforms', {
      headers: { Authorization: `Bearer ${token}` }
    });

    let platformId;
    if (platformsResponse.data.length > 0) {
      platformId = platformsResponse.data[0]._id;
      console.log(`✅ Using existing platform: ${platformsResponse.data[0].name} (${platformId})`);
    } else {
      console.log('❌ No platforms found. Creating a test platform...');
      const createPlatformResponse = await axios.post('http://localhost:3009/api/platforms', {
        name: 'Test Platform',
        description: 'Test platform for clicks',
        isActive: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      platformId = createPlatformResponse.data._id;
      console.log(`✅ Created platform: ${createPlatformResponse.data.name} (${platformId})`);
    }

    // Get team members
    console.log('\n3. Getting team members...');
    const teamMembersResponse = await axios.get('http://localhost:3009/api/users/team-members', {
      headers: { Authorization: `Bearer ${token}` }
    });

    let targetUserId;
    if (teamMembersResponse.data.length > 0) {
      targetUserId = teamMembersResponse.data[0]._id;
      console.log(`✅ Using team member: ${teamMembersResponse.data[0].firstName} ${teamMembersResponse.data[0].lastName} (${targetUserId})`);
    } else {
      console.log('❌ No team members found. Using current user...');
      targetUserId = user._id;
    }

    // Add platform clicks
    console.log('\n4. Adding platform clicks...');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const addClicksResponse = await axios.post('http://localhost:3009/api/platforms/clicks', {
      platformId: platformId,
      userId: targetUserId,
      clicks: 100,
      date: yesterdayStr,
      notes: 'Test platform clicks from yesterday'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Platform clicks added successfully');
    console.log('Click record:', addClicksResponse.data);

    // Test different endpoints
    console.log('\n5. Testing platform clicks endpoints...');

    // Test my clicks
    console.log('\n   Testing /api/platforms/clicks/my-clicks...');
    const myClicksResponse = await axios.get('http://localhost:3009/api/platforms/clicks/my-clicks', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ My clicks: ${myClicksResponse.data.length} records`);

    // Test team clicks
    console.log('\n   Testing /api/platforms/clicks/my-team...');
    const teamClicksResponse = await axios.get('http://localhost:3009/api/platforms/clicks/my-team', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ Team clicks: ${teamClicksResponse.data.length} records`);

    // Test all clicks (admin)
    console.log('\n   Testing /api/platforms/clicks/all...');
    const allClicksResponse = await axios.get('http://localhost:3009/api/platforms/clicks/all', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ All clicks: ${allClicksResponse.data.length} records`);

    // Test stats
    console.log('\n   Testing /api/platforms/clicks/stats...');
    const statsResponse = await axios.get('http://localhost:3009/api/platforms/clicks/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ Stats:`, statsResponse.data);

    // Test user-specific clicks
    console.log('\n   Testing /api/platforms/clicks/user/:userId...');
    const userClicksResponse = await axios.get(`http://localhost:3009/api/platforms/clicks/user/${targetUserId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ User clicks: ${userClicksResponse.data.length} records`);

    // Test team-specific clicks
    console.log('\n   Testing /api/platforms/clicks/team/:teamId...');
    const teamSpecificClicksResponse = await axios.get(`http://localhost:3009/api/platforms/clicks/team/${user.teamId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ Team-specific clicks: ${teamSpecificClicksResponse.data.length} records`);

    // Show detailed results
    if (teamClicksResponse.data.length > 0) {
      console.log('\n6. Team Platform Clicks Details:');
      teamClicksResponse.data.forEach((click, index) => {
        console.log(`   ${index + 1}. Platform: ${click.platformId?.name || 'Unknown'}`);
        console.log(`      User: ${click.userId?.firstName || 'Unknown'} ${click.userId?.lastName || ''}`);
        console.log(`      Clicks: ${click.clicks}`);
        console.log(`      Earnings: ${click.earnings} PKR`);
        console.log(`      Rate: ${click.ratePerClick} PKR per click`);
        console.log(`      Date: ${new Date(click.date).toLocaleDateString()}`);
        console.log(`      Notes: ${click.notes || 'None'}`);
        console.log('');
      });
    }

    console.log('\n🎉 Platform clicks test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testPlatformClicks(); 
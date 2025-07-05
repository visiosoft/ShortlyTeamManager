const geoip = require('geoip-lite');

function testIPGeolocation() {
  console.log('🔍 Testing IP Geolocation...\n');

  // Test IPs from your analytics
  const testIPs = [
    '168.154.177.146', // Your actual IP from analytics
    '8.8.8.8',         // Google DNS (US)
    '1.1.1.1',         // Cloudflare DNS (US)
    '127.0.0.1',       // Localhost
    '192.168.1.1',     // Local network
    '10.0.0.1',        // Private network
    '172.16.0.1',      // Private network
    '185.60.216.35',   // UK
    '91.198.174.192',  // Germany
    '203.208.60.1',    // China
  ];

  console.log('📊 IP Geolocation Results:');
  console.log('==========================');
  
  testIPs.forEach(ip => {
    const geo = geoip.lookup(ip);
    console.log(`\nIP: ${ip}`);
    if (geo) {
      console.log(`  Country: ${geo.country}`);
      console.log(`  City: ${geo.city}`);
      console.log(`  Region: ${geo.region}`);
      console.log(`  Timezone: ${geo.timezone}`);
      console.log(`  Coordinates: ${geo.ll}`);
    } else {
      console.log(`  ❌ No geolocation data found`);
    }
  });

  // Test the specific IP from your analytics
  console.log('\n🎯 Testing Your Specific IP:');
  console.log('============================');
  const yourIP = '168.154.177.146';
  const yourGeo = geoip.lookup(yourIP);
  
  if (yourGeo) {
    console.log(`IP: ${yourIP}`);
    console.log(`Country: ${yourGeo.country}`);
    console.log(`City: ${yourGeo.city}`);
    console.log(`Region: ${yourGeo.region}`);
    console.log(`Timezone: ${yourGeo.timezone}`);
    console.log(`Coordinates: ${yourGeo.ll}`);
  } else {
    console.log(`❌ No geolocation data found for ${yourIP}`);
    console.log('This might be a private IP or not in the geoip-lite database');
  }

  // Check if geoip-lite database is working
  console.log('\n🔧 Database Check:');
  console.log('==================');
  console.log('Testing with known public IPs...');
  
  const publicIPs = ['8.8.8.8', '1.1.1.1'];
  let workingCount = 0;
  
  publicIPs.forEach(ip => {
    const geo = geoip.lookup(ip);
    if (geo) {
      workingCount++;
      console.log(`✅ ${ip} -> ${geo.country} (${geo.city})`);
    } else {
      console.log(`❌ ${ip} -> No data`);
    }
  });
  
  console.log(`\nDatabase working: ${workingCount}/${publicIPs.length} public IPs resolved`);
  
  if (workingCount === 0) {
    console.log('❌ geoip-lite database might not be installed or corrupted');
    console.log('Try: npm install geoip-lite');
  } else if (workingCount < publicIPs.length) {
    console.log('⚠️  Partial database functionality');
  } else {
    console.log('✅ Database working correctly');
  }
}

testIPGeolocation(); 
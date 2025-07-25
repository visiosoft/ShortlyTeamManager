console.log('🔑 Getting JWT Token for toheed@yahoo.com');
console.log('==========================================');
console.log('');
console.log('📋 Follow these steps to get your JWT token:');
console.log('');
console.log('1. Open your browser and go to: http://localhost:3000/login');
console.log('2. Login with: toheed@yahoo.com');
console.log('3. After successful login, press F12 to open Developer Tools');
console.log('4. Go to the "Application" tab (or "Storage" in some browsers)');
console.log('5. In the left sidebar, expand "Local Storage"');
console.log('6. Click on "http://localhost:3000"');
console.log('7. Look for a key called "token"');
console.log('8. Copy the value (it should be a long string starting with "eyJ...")');
console.log('');
console.log('🔧 Alternative method (Console):');
console.log('1. After logging in, press F12');
console.log('2. Go to the "Console" tab');
console.log('3. Type: localStorage.getItem("token")');
console.log('4. Press Enter');
console.log('5. Copy the token value');
console.log('');
console.log('📝 Once you have the token:');
console.log('1. Open create-test-data-via-api.js');
console.log('2. Replace "YOUR_JWT_TOKEN_HERE" with your actual token');
console.log('3. Uncomment the last line: createTestDataViaAPI();');
console.log('4. Run: node create-test-data-via-api.js');
console.log('');
console.log('🎯 Quick test:');
console.log('If you want to test if your token works, you can run:');
console.log('curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3009/api/auth/profile');
console.log('');
console.log('✅ Expected response: Your user profile data');
console.log('❌ If you get 401 Unauthorized, the token is invalid or expired'); 
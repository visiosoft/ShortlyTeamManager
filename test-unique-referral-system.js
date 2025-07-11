const axios = require('axios');

const BASE_URL = 'http://localhost:3009/api';

// Test data
const TEST_USERS = [
  {
    email: 'test1@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User1',
    teamName: 'Test Team 1'
  },
  {
    email: 'test2@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User2',
    teamName: 'Test Team 2'
  },
  {
    email: 'test3@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User3',
    teamName: 'Test Team 3'
  }
];

async function testUniqueReferralSystem() {
  console.log('🧪 Testing Unique Referral System');
  console.log('==================================\n');

  const tokens = [];
  const referralCodes = [];

  try {
    // Step 1: Register test users
    console.log('1️⃣ Registering test users...');
    
    for (let i = 0; i < TEST_USERS.length; i++) {
      const user = TEST_USERS[i];
      console.log(`Registering ${user.email}...`);
      
      try {
        const response = await axios.post(`${BASE_URL}/auth/register`, user);
        console.log(`✅ ${user.email} registered successfully`);
        tokens.push(response.data.access_token);
      } catch (error) {
        if (error.response?.status === 409) {
          console.log(`⚠️ ${user.email} already exists, trying to login...`);
          try {
            const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
              email: user.email,
              password: user.password
            });
            console.log(`✅ ${user.email} logged in successfully`);
            tokens.push(loginResponse.data.access_token);
          } catch (loginError) {
            console.log(`❌ Failed to login ${user.email}:`, loginError.response?.data || loginError.message);
            continue;
          }
        } else {
          console.log(`❌ Failed to register ${user.email}:`, error.response?.data || error.message);
          continue;
        }
      }
    }

    if (tokens.length === 0) {
      console.log('❌ No valid tokens obtained. Cannot continue testing.');
      return;
    }

    // Step 2: Get referral codes for each user
    console.log('\n2️⃣ Getting referral codes for each user...');
    
    for (let i = 0; i < tokens.length; i++) {
      try {
        const response = await axios.get(`${BASE_URL}/referrals/link`, {
          headers: {
            'Authorization': `Bearer ${tokens[i]}`,
            'Content-Type': 'application/json'
          }
        });
        
        const referralCode = response.data.referralCode;
        const referralLink = response.data.referralLink;
        
        console.log(`User ${i + 1}: ${referralCode} -> ${referralLink}`);
        referralCodes.push(referralCode);
        
      } catch (error) {
        console.log(`❌ Failed to get referral code for user ${i + 1}:`, error.response?.data || error.message);
      }
    }

    // Step 3: Check for unique referral codes
    console.log('\n3️⃣ Checking for unique referral codes...');
    
    const uniqueCodes = [...new Set(referralCodes)];
    console.log(`Total referral codes: ${referralCodes.length}`);
    console.log(`Unique referral codes: ${uniqueCodes.length}`);
    
    if (referralCodes.length === uniqueCodes.length) {
      console.log('✅ All referral codes are unique!');
    } else {
      console.log('❌ Duplicate referral codes found!');
      console.log('All codes:', referralCodes);
      console.log('Unique codes:', uniqueCodes);
    }

    // Step 4: Test referral validation
    console.log('\n4️⃣ Testing referral validation...');
    
    if (referralCodes.length > 0) {
      const testCode = referralCodes[0];
      try {
        const response = await axios.post(`${BASE_URL}/referrals/validate`, {
          referralCode: testCode
        });
        console.log(`✅ Referral code ${testCode} is valid`);
      } catch (error) {
        console.log(`❌ Referral code ${testCode} validation failed:`, error.response?.data || error.message);
      }
    }

    // Step 5: Test registration with referral
    console.log('\n5️⃣ Testing registration with referral...');
    
    if (referralCodes.length > 0) {
      const referralCode = referralCodes[0];
      const newUser = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        teamName: 'New User Team',
        referralCode: referralCode
      };
      
      try {
        const response = await axios.post(`${BASE_URL}/auth/register-with-referral`, newUser);
        console.log(`✅ Registration with referral successful for ${newUser.email}`);
        
        // Get the new user's referral code
        const newUserToken = response.data.access_token;
        const newUserResponse = await axios.get(`${BASE_URL}/referrals/link`, {
          headers: {
            'Authorization': `Bearer ${newUserToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        const newUserReferralCode = newUserResponse.data.referralCode;
        console.log(`New user's referral code: ${newUserReferralCode}`);
        
        // Check if it's different from the original
        if (newUserReferralCode !== referralCode) {
          console.log('✅ New user has a different referral code!');
        } else {
          console.log('❌ New user has the same referral code as referrer!');
        }
        
      } catch (error) {
        console.log(`❌ Registration with referral failed:`, error.response?.data || error.message);
      }
    }

    // Step 6: Show final summary
    console.log('\n6️⃣ Final Summary:');
    console.log('==================');
    console.log(`Total test users: ${TEST_USERS.length}`);
    console.log(`Successful tokens: ${tokens.length}`);
    console.log(`Referral codes obtained: ${referralCodes.length}`);
    console.log(`Unique referral codes: ${uniqueCodes.length}`);
    
    if (referralCodes.length > 0) {
      console.log('\nReferral codes:');
      referralCodes.forEach((code, index) => {
        console.log(`  User ${index + 1}: ${code}`);
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUniqueReferralSystem(); 
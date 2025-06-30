const mongoose = require('mongoose');

async function checkUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/url-shortener');
    
    const User = mongoose.model('User', {
      email: String,
      password: String,
      role: String,
      teamId: String
    });
    
    const users = await User.find({});
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- Email: ${user.email}, Role: ${user.role}, TeamId: ${user.teamId}`);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsers(); 
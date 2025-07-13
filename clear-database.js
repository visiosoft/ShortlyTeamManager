const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shortlink';

async function clearDatabase() {
  try {
    console.log('🧹 Clearing Database...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear platform-related collections
    const collections = ['platforms', 'platformclicks'];
    
    for (const collectionName of collections) {
      try {
        const collection = mongoose.connection.collection(collectionName);
        const result = await collection.deleteMany({});
        console.log(`✅ Cleared ${result.deletedCount} records from ${collectionName}`);
      } catch (error) {
        console.log(`⚠️ Collection ${collectionName} not found or already empty`);
      }
    }

    console.log('\n✅ Database cleared successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

clearDatabase(); 
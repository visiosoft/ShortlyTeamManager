const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/shortlink', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortCode: String,
  userId: mongoose.Schema.Types.ObjectId,
  teamId: mongoose.Schema.Types.ObjectId,
  clicks: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  title: String,
  description: String,
  isAdminCreated: { type: Boolean, default: false },
  createdByAdmin: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Url = mongoose.model('Url', urlSchema);

async function checkUrls() {
  try {
    console.log('🔍 Checking URLs in database...');
    
    const urls = await Url.find({ isActive: true });
    
    if (urls.length > 0) {
      console.log(`✅ Found ${urls.length} active URLs:`);
      urls.forEach((url, index) => {
        console.log(`  ${index + 1}. ${url.shortCode} -> ${url.originalUrl} (clicks: ${url.clicks})`);
      });
    } else {
      console.log('❌ No active URLs found in database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkUrls(); 
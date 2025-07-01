import { redirect } from 'next/navigation'
import mongoose from 'mongoose'

// Connect to the production database
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/url-shortener')
    console.log('MongoDB connected')
  } catch (error) {
    console.error('MongoDB connection error:', error)
  }
}

// URL Schema
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
})

const Url = mongoose.models.Url || mongoose.model('Url', urlSchema)

interface PageProps {
  params: {
    shortCode: string
  }
}

export default async function ShortUrlRedirect({ params }: PageProps) {
  const { shortCode } = params

  try {
    await connectDB()
    
    // Find the URL by short code
    const url = await Url.findOne({ shortCode, isActive: true })
    
    if (!url) {
      // URL not found, redirect to 404
      redirect('/not-found')
    }

    // Increment clicks
    await Url.updateOne(
      { shortCode },
      { $inc: { clicks: 1 } }
    )

    // Redirect to the original URL
    redirect(url.originalUrl)
    
  } catch (error) {
    console.error('Error during redirect:', error)
    redirect('/not-found')
  }
} 
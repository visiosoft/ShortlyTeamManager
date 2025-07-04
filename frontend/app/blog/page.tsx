'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Play,
  Clock,
  User,
  Calendar,
  ArrowRight,
  Search,
  Filter,
  BookOpen,
  Video,
  Star,
  Eye,
  Share2,
  Heart
} from 'lucide-react'

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Posts', count: 12 },
    { id: 'tutorials', name: 'Video Tutorials', count: 6 },
    { id: 'tips', name: 'Tips & Tricks', count: 4 },
    { id: 'news', name: 'News & Updates', count: 2 }
  ]

  const blogPosts = [
    {
      id: 1,
      title: "How to Create Your First Short Link",
      excerpt: "Learn the basics of URL shortening and create your first short link in under 2 minutes.",
      category: "tutorials",
      author: "Sarah Johnson",
      date: "2024-01-15",
      readTime: "3 min read",
      views: "2.5k",
      likes: 128,
      thumbnail: "/api/placeholder/400/250",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      featured: true
    },
    {
      id: 2,
      title: "Advanced Analytics: Understanding Your Link Performance",
      excerpt: "Deep dive into analytics features and how to use data to improve your link performance.",
      category: "tutorials",
      author: "Mike Chen",
      date: "2024-01-12",
      readTime: "5 min read",
      views: "1.8k",
      likes: 95,
      thumbnail: "/api/placeholder/400/250",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
      id: 3,
      title: "Team Collaboration: Working with Your Team",
      excerpt: "Discover how to effectively collaborate with your team members on link management.",
      category: "tutorials",
      author: "Emily Rodriguez",
      date: "2024-01-10",
      readTime: "4 min read",
      views: "1.2k",
      likes: 76,
      thumbnail: "/api/placeholder/400/250",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
      id: 4,
      title: "10 Ways to Maximize Your Earnings",
      excerpt: "Proven strategies to increase your revenue from the reward system.",
      category: "tips",
      author: "David Kim",
      date: "2024-01-08",
      readTime: "6 min read",
      views: "3.1k",
      likes: 156,
      thumbnail: "/api/placeholder/400/250"
    },
    {
      id: 5,
      title: "Referral Program: Complete Guide",
      excerpt: "Everything you need to know about earning 500 PKR per referral.",
      category: "tutorials",
      author: "Lisa Wang",
      date: "2024-01-05",
      readTime: "7 min read",
      views: "2.8k",
      likes: 134,
      thumbnail: "/api/placeholder/400/250",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
      id: 6,
      title: "Custom Domains: Professional Branding",
      excerpt: "Learn how to set up custom domains for your short links.",
      category: "tutorials",
      author: "Alex Thompson",
      date: "2024-01-03",
      readTime: "4 min read",
      views: "1.5k",
      likes: 89,
      thumbnail: "/api/placeholder/400/250",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    {
      id: 7,
      title: "SEO Tips for Short Links",
      excerpt: "Optimize your short links for better search engine visibility.",
      category: "tips",
      author: "Maria Garcia",
      date: "2024-01-01",
      readTime: "5 min read",
      views: "1.9k",
      likes: 112,
      thumbnail: "/api/placeholder/400/250"
    },
    {
      id: 8,
      title: "New Features: Enhanced Analytics Dashboard",
      excerpt: "Explore the latest updates to our analytics dashboard.",
      category: "news",
      author: "Team Earn Reward",
      date: "2023-12-28",
      readTime: "3 min read",
      views: "4.2k",
      likes: 203,
      thumbnail: "/api/placeholder/400/250"
    }
  ]

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const featuredPost = blogPosts.find(post => post.featured)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Earn Reward
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                Home
              </Link>
              <Link href="/blog" className="text-blue-600 font-medium">
                Blog
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-blue-600 transition-colors duration-200">
                Login
              </Link>
              <Link href="/register" className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Sign Up
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Learn & Grow
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Video tutorials, tips, and insights to help you master URL shortening and maximize your earnings
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tutorials and articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-white/20 rounded-xl bg-white/10 text-white placeholder-blue-200 focus:border-white focus:outline-none transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Featured Tutorial
              </h2>
              <p className="text-gray-600">
                Start here to learn the basics
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-3xl p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </span>
                    <span className="text-gray-500 text-sm">{featuredPost.category}</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    {featuredPost.title}
                  </h3>
                  <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center space-x-6 mb-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{featuredPost.author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(featuredPost.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{featuredPost.readTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button className="group bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2">
                      <Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                      <span>Watch Tutorial</span>
                    </button>
                    <button className="text-gray-600 hover:text-blue-600 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="aspect-video bg-gray-200 rounded-2xl overflow-hidden shadow-xl">
                    <iframe
                      src={featuredPost.videoUrl}
                      title={featuredPost.title}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative">
                  <div className="aspect-video bg-gray-200 rounded-t-2xl overflow-hidden">
                    {post.videoUrl ? (
                      <iframe
                        src={post.videoUrl}
                        title={post.title}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {post.videoUrl && (
                    <div className="absolute top-4 left-4">
                      <div className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                        <Video className="w-3 h-3" />
                        <span>Video</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                    <span className="text-gray-500 text-sm">{post.readTime}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.views}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-red-500 transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                      <span className="text-sm text-gray-500">{post.likes}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button className="group text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2 transition-colors">
                      <span>Read More</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          
          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Get the latest tutorials and tips delivered to your inbox
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="flex space-x-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border-2 border-white/20 bg-white/10 text-white placeholder-blue-200 focus:border-white focus:outline-none transition-all duration-200"
              />
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-6 group">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                  Earn Reward
                </span>
              </Link>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Learn URL shortening, track performance, and maximize your earnings with our comprehensive tutorials and guides.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Categories</h4>
              <ul className="space-y-2">
                <li><Link href="/blog?category=tutorials" className="text-gray-300 hover:text-white transition-colors">Video Tutorials</Link></li>
                <li><Link href="/blog?category=tips" className="text-gray-300 hover:text-white transition-colors">Tips & Tricks</Link></li>
                <li><Link href="/blog?category=news" className="text-gray-300 hover:text-white transition-colors">News & Updates</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-gray-300 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/api" className="text-gray-300 hover:text-white transition-colors">API Documentation</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © {new Date().getFullYear()} Earn Reward. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy-policy" className="text-gray-300 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-gray-300 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 
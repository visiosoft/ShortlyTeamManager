'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Search,
  Users,
  Link as LinkIcon,
  DollarSign,
  ArrowRight,
  ChevronDown,
  UserPlus,
  Share2,
  Gift,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (urlInput.trim()) {
      // Redirect to signup if not logged in, or dashboard if logged in
      if (isLoggedIn) {
        router.push('/dashboard')
      } else {
        router.push('/register')
      }
    }
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const steps = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Join a Team",
      description: "Connect with your team members and start collaborating on link management.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <LinkIcon className="w-8 h-8" />,
      title: "Shorten URL & Share",
      description: "Create short, memorable links and share them across all your platforms.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Earn Rewards",
      description: "Get paid for every click and earn money with our reward system.",
      gradient: "from-blue-600 to-indigo-600"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Earn Reward
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('home')}
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                How it works
              </button>
              <button 
                onClick={() => scrollToSection('referral-program')}
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                Referral Program
              </button>
              <Link 
                href="/blog" 
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                Blog
              </Link>
              <Link 
                href="/login" 
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Sign Up
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <section id="home" className="pt-20 pb-16 relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-green-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-blue-300 rounded-full opacity-20 animate-pulse delay-2000"></div>
          <div className="absolute top-1/2 right-1/4 w-8 h-8 bg-green-300 rounded-full opacity-20 animate-pulse delay-3000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                URL Shortener
              </span>
              <br />
              <span className="text-gray-900">with Rewards</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Shorten URLs, track clicks, and earn money with our innovative reward system. 
              Join thousands of users who are already profiting from their links.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleUrlSubmit} className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Enter URL to shorten"
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 hover:border-gray-300"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
                >
                  Shorten
                </button>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register" 
                className="group bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="group border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-blue-300 hover:text-blue-700 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Learn More</span>
                <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-200" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in just three simple steps and start earning from your links
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className={`w-16 h-16 bg-gradient-to-r ${step.gradient} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-200`}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Monetize Every Audience Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Monetize every audience type
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            No matter what audience and web or mobile traffic you want to monetize, we are ready to meet your expectations for outstanding balance between revenue and experience for your users
          </p>
          <Link href="/register" className="group bg-gradient-to-r from-blue-600 to-green-600 text-white px-10 py-5 rounded-xl text-xl font-semibold hover:from-blue-700 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl inline-flex items-center space-x-2">
            <span>Start Earning</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      </section>

      {/* Referral Program Section */}
      <section id="referral-program" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Refer Friends &
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> Earn More</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Invite your friends and earn 500 PKR for each successful referral
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-3xl p-12 relative overflow-hidden">
            {/* Animated Icons */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold animate-pulse">
                  👤
                </div>
                <div className="absolute -right-4 -bottom-2 w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold animate-pulse delay-500">
                  👤
                </div>
                <div className="absolute top-1/2 right-8 transform -translate-y-1/2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  500 PKR
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Earn 500 PKR Per Referral
              </h3>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Share your referral link with friends and family. When they sign up and create their first link, 
                you'll earn 500 PKR instantly. No limits on referrals!
              </p>
              <button className="group bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-2 mx-auto">
                <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <span>Refer Friends Now</span>
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
                Professional URL shortening service with advanced analytics, 
                team collaboration, and comprehensive reward system.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-300">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>info@zak.com</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>+92 300 1234567</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>Karachi, Pakistan</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy-policy" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-of-service" className="text-gray-300 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/refund-policy" className="text-gray-300 hover:text-white transition-colors">Refund Policy</Link></li>
                <li><Link href="/cookie-policy" className="text-gray-300 hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © {new Date().getFullYear()} ZAK. All rights reserved.
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
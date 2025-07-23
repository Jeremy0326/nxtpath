import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  Brain, 
  GraduationCap, 
  TrendingUp, 
  Users, 
  Building, 
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Shield,
  Star,
  Zap,
  Globe,
  Award,
  Clock,
  ChevronRight
} from 'lucide-react';

export function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const fadeInLeft = {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-x-hidden">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">NxtPath <span className="text-indigo-600">AI</span></span>
            </Link>
      
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="px-6 py-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all transform hover:scale-105 font-medium shadow-lg"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

        {/* Hero Section */}
      <section className="pt-24 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate={isVisible ? "animate" : "initial"}
              className="space-y-8"
            >
              <motion.div variants={fadeInUp} className="space-y-4">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-100 rounded-full text-indigo-700 font-medium">
                  <Sparkles className="h-4 w-4" />
                  <span>AI-Powered Career Platform</span>
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                  Your Career Journey Starts with{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                    AI Intelligence
                  </span>
                  </h1>
                
                <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                  The next-generation AI platform connecting students, universities, and employers 
                  through intelligent career matching, analytics, and personalized guidance.
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
                      <Link
                        to="/register"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 group"
                      >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                
                      <Link
                        to="/login"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-indigo-300 hover:text-indigo-600 transition-all"
                      >
                        Sign In
                      </Link>
              </motion.div>

              {/* Stats */}
              <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">10K+</div>
                  <div className="text-sm text-gray-500">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">500+</div>
                  <div className="text-sm text-gray-500">Universities</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">95%</div>
                  <div className="text-sm text-gray-500">Success Rate</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Visual */}
            <motion.div 
              variants={fadeInLeft}
              initial="initial"
              animate={isVisible ? "animate" : "initial"}
              className="relative"
            >
              <div className="relative z-10">
                <motion.div 
                  animate={floatingAnimation}
                  className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl p-12 shadow-2xl"
                >
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-white rounded-2xl shadow-lg">
                        <Brain className="h-12 w-12 text-indigo-600 mb-2" />
                        <div className="text-sm font-semibold text-gray-800">AI Matching</div>
                        <div className="text-xs text-gray-500">Smart career recommendations</div>
                      </div>
                      <div className="p-4 bg-white rounded-2xl shadow-lg">
                        <BarChart3 className="h-12 w-12 text-purple-600 mb-2" />
                        <div className="text-sm font-semibold text-gray-800">Analytics</div>
                        <div className="text-xs text-gray-500">Talent insights</div>
                      </div>
                    </div>
                    <div className="space-y-4 mt-8">
                      <div className="p-4 bg-white rounded-2xl shadow-lg">
                        <Users className="h-12 w-12 text-green-600 mb-2" />
                        <div className="text-sm font-semibold text-gray-800">Connections</div>
                        <div className="text-xs text-gray-500">Network building</div>
                      </div>
                      <div className="p-4 bg-white rounded-2xl shadow-lg">
                        <Target className="h-12 w-12 text-orange-600 mb-2" />
                        <div className="text-sm font-semibold text-gray-800">Career Focus</div>
                        <div className="text-xs text-gray-500">Personalized guidance</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                </div>

              {/* Floating Elements */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <Star className="h-8 w-8 text-white" />
              </motion.div>
              
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-6 -left-6 w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <Zap className="h-6 w-6 text-white" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

        {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powered by Advanced AI Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how our AI-driven platform transforms career development and talent management
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeInUp} className="group">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8 border border-indigo-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Career Matching</h3>
                <p className="text-gray-600 mb-6">AI-powered recommendations based on your skills, interests, and market trends.</p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Personality analysis
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Skills assessment
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Market insights
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="group">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">University Analytics</h3>
                <p className="text-gray-600 mb-6">Comprehensive analytics for universities to track and improve student outcomes.</p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Employment tracking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Performance metrics
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Success predictions
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="group">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Building className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Employer Connect</h3>
                <p className="text-gray-600 mb-6">Direct connections between talented students and forward-thinking employers.</p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Talent matching
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Skill verification
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Direct recruitment
                  </li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
            </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={fadeInLeft}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose NxtPath AI?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Shield className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Private</h3>
                    <p className="text-gray-600">Your data is protected with enterprise-grade security and privacy controls.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Updates</h3>
                    <p className="text-gray-600">Get instant notifications about new opportunities and career developments.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Award className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Proven Results</h3>
                    <p className="text-gray-600">95% of our users find career opportunities within 3 months of joining.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-6">
                  <Globe className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900">Global Network</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-indigo-50 rounded-2xl">
                    <div className="text-2xl font-bold text-indigo-600">50+</div>
                    <div className="text-sm text-gray-600">Countries</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-2xl">
                    <div className="text-2xl font-bold text-green-600">1M+</div>
                    <div className="text-sm text-gray-600">Job Opportunities</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-2xl">
                    <div className="text-2xl font-bold text-purple-600">24/7</div>
                    <div className="text-sm text-gray-600">AI Support</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-2xl">
                    <div className="text-2xl font-bold text-orange-600">99%</div>
                    <div className="text-sm text-gray-600">Uptime</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800">
        <div className="max-w-4xl mx-auto text-center px-6">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              Ready to Transform Your Career Journey?
            </h2>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              Join thousands of students, universities, and employers who are already using NxtPath AI to accelerate their success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl group"
              >
                Start Your Journey Today
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-all"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-indigo-600 rounded-xl">
                  <Rocket className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">NxtPath AI</span>
              </div>
              <p className="text-gray-400 text-sm">
                Empowering careers with AI-driven insights and intelligent connections.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">For Students</a></li>
                <li><a href="#" className="hover:text-white transition-colors">For Universities</a></li>
                <li><a href="#" className="hover:text-white transition-colors">For Employers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Globe className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Users className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Building className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 NxtPath AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 
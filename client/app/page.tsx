'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  MapPin,
  Heart,
  Share2,
  LogOut,
  User,
  Menu,
  X,
  Utensils,
  Sparkles,
  TrendingUp,
  Users,
  Award,
  ArrowRight,
  Check,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-orange-50 via-yellow-50 to-orange-50">
      {/* Navbar */}
      <Navbar />

      {/* Animated Background Blobs */}
      <motion.div
        className="fixed top-10 left-10 w-72 h-72 bg-orange-400/20 rounded-full mix-blend-multiply filter blur-3xl pointer-events-none"
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="fixed bottom-10 right-10 w-72 h-72 bg-pink-400/20 rounded-full mix-blend-multiply filter blur-3xl pointer-events-none"
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-200 to-red-200 border border-orange-300/40 backdrop-blur-sm shadow-sm">
              <Sparkles size={16} className="text-orange-600" />
              <span className="text-sm font-bold bg-gradient-to-r from-orange-700 to-red-600 bg-clip-text text-transparent">
                🚀 Join 1000+ Food Sharers
              </span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="space-y-4"
          >
            <h1 className="text-5xl md:text-7xl font-black leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-orange-600 to-gray-900 bg-clip-text text-transparent">
                Share Food.
              </span>
              <br />
              <span className="bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                Build Community.
              </span>
              <br />
              <span className="text-gray-700">Change Lives.</span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed"
            >
              Connect with your neighbors, share delicious home-cooked meals, and make a positive impact on your community—all while reducing food waste.
            </motion.p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
          >
            {user ? (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/foods/available"
                    className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white font-bold shadow-xl hover:shadow-2xl transition-all hover:from-orange-600 hover:via-red-600 hover:to-pink-600 group"
                  >
                    🗺️ Find Food Near You
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/foods/add"
                    className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl border-2 border-orange-300 text-orange-700 font-bold bg-gradient-to-r from-orange-50 to-red-50 backdrop-blur-sm hover:bg-gradient-to-r hover:from-orange-100 hover:to-red-100 transition-all shadow-md hover:shadow-lg"
                  >
                    🍽️ Share Your Food
                    <ArrowRight size={20} />
                  </Link>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white font-bold shadow-xl hover:shadow-2xl transition-all hover:from-orange-600 hover:via-red-600 hover:to-pink-600 group"
                  >
                    ✨ Get Started Free
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl border-2 border-orange-300 text-orange-700 font-bold bg-gradient-to-r from-orange-50 to-red-50 backdrop-blur-sm hover:bg-gradient-to-r hover:from-orange-100 hover:to-red-100 transition-all shadow-md hover:shadow-lg"
                  >
                    🔓 Sign In
                    <ArrowRight size={20} />
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-8 pt-12 border-t border-gray-200"
          >
            {[
              { label: 'Food Shared', value: '2,847' },
              { label: 'Active Users', value: '1,023' },
              { label: 'Meals Distributed', value: '5,692' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-semibold mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-yellow-50/50 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Why Choose <span className="bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">ShareBit?</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to share food, connect with neighbors, and make a real difference.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
          >
            {[
              {
                icon: MapPin,
                title: 'Smart Geolocation',
                description: 'Find food within 5km using real-time GPS',
                color: 'from-blue-400 to-blue-600',
              },
              {
                icon: Sparkles,
                title: 'Easy Posting',
                description: 'Share food in seconds with photos',
                color: 'from-purple-400 to-purple-600',
              },
              {
                icon: Users,
                title: 'Community First',
                description: 'Connect with neighbors and help locally',
                color: 'from-pink-400 to-pink-600',
              },
              {
                icon: TrendingUp,
                title: 'Impact Tracking',
                description: 'See how much food you\'ve shared',
                color: 'from-green-400 to-green-600',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  initial="hidden"
                  whileInView="visible"
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -8, boxShadow: '0 24px 48px rgba(0, 0, 0, 0.1)' }}
                  className="group p-8 rounded-2xl bg-gradient-to-br from-white to-orange-50 border border-orange-100 shadow-lg hover:shadow-2xl transition-all"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon size={28} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-black text-center mb-16"
          >
            How It Works
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8 md:gap-4">
            {[
              { step: '01', title: 'Post Your Food', desc: 'Share extra meals with photos and details', icon: '📸' },
              { step: '02', title: 'Get Discovered', desc: 'Neighbors find your post nearby', icon: '🔍' },
              { step: '03', title: 'Make Impact', desc: 'Reduce waste and help your community', icon: '🌱' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.2, duration: 0.5 }}
                className="relative"
              >
                <div className="sticky top-20">
                  {/* Connection Line */}
                  {idx < 2 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-[90%] h-0.5 bg-gradient-to-r from-orange-500 to-transparent" />
                  )}

                  <div className="relative bg-gradient-to-br from-yellow-50 to-orange-100 rounded-2xl p-8 border border-orange-200 shadow-lg hover:shadow-xl transition-all">
                    <div className="text-5xl mb-4">{item.icon}</div>
                    <div className="flex items-center gap-3 mb-3">
                      <motion.div
                        className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-black"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        {item.step}
                      </motion.div>
                      <h3 className="text-2xl font-bold text-gray-900">{item.title}</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-50 via-yellow-50 to-orange-50">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-black text-center mb-16"
          >
            What You'll Get
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {[
                'Access thousands of shared meals',
                'Build real connections with neighbors',
                'Reduce food waste in your area',
                'Save money on groceries',
                'Help fight food insecurity',
                'Join a giving community',
              ].map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                    <Check size={18} className="text-white" />
                  </div>
                  <span className="text-lg font-semibold text-gray-800">{benefit}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-3xl blur-3xl opacity-20" />
              <div className="relative bg-gradient-to-br from-white to-orange-50 rounded-3xl p-8 md:p-12 shadow-2xl border border-orange-100/80">
                <div className="space-y-6">
                  <div className="text-center">
                    <Award size={48} className="mx-auto text-orange-600 mb-4" />
                    <h3 className="text-2xl font-black text-gray-900 mb-2">Join 1000+ Food Sharers</h3>
                    <p className="text-gray-600">Start making a difference today</p>
                  </div>
                  {!user && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href="/auth/register"
                        className="w-full inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-center shadow-lg hover:shadow-xl transition-all"
                      >
                        Get Started Now 🚀
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative mt-auto w-full bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white border-t border-orange-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-black text-lg mb-4 flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                <Utensils size={24} className="text-orange-400" />
                ShareBit
              </h3>
              <p className="text-gray-400 text-sm">Sharing food, building community, changing lives.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">How it Works</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Forum</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Safety</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-orange-500/30 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2026 ShareBit. Built with Dhatchana Dev🚀to share good food and better community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

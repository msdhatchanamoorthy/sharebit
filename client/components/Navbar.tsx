'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, Utensils, LogOut, User, Share2, MapPin, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationBell } from './NotificationBell';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
    setIsMenuOpen(false);
  };

  const menuVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05 },
    }),
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-white via-orange-50 to-amber-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 backdrop-blur-md shadow-lg border-b border-orange-200 dark:border-gray-700/50 transition-colors duration-300 dark:glow-effect">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              className="bg-gradient-to-br from-orange-500 to-red-500 dark:from-blue-500 dark:to-purple-500 w-10 h-10 rounded-lg flex items-center justify-center shadow-lg dark:shadow-blue-500/50 transition-colors duration-300"
              whileHover={{
                rotate: 5,
              }}
            >
              <Utensils size={20} className="text-white" />
            </motion.div>
            <motion.span
              className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
            >
              ShareBit
            </motion.span>
          </Link>
        </motion.div>

        {/* Desktop Menu */}
        <motion.div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                custom={0}
              >
                <Link
                  href="/foods/available"
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-orange-100 dark:hover:bg-gradient-to-r dark:hover:from-blue-500/20 dark:hover:to-purple-500/20 transition-all duration-300 font-medium border border-orange-200 dark:border-gray-700/50 dark:hover:border-blue-500/50"
                >
                  <MapPin size={18} />
                  Find Food
                </Link>
              </motion.div>

              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                custom={2}
              >
                <Link
                  href="/foods/add"
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-green-100 dark:hover:bg-gradient-to-r dark:hover:from-green-500/20 dark:hover:to-emerald-500/20 transition-all duration-300 font-medium border border-orange-200 dark:border-gray-700/50 dark:hover:border-green-500/50"
                >
                  <Share2 size={18} />
                  Share Food
                </Link>
              </motion.div>

              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                custom={3}
              >
                <NotificationBell />
              </motion.div>

              {/* Admin Link - Only for admins */}
              {user?.role === 'admin' && (
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  custom={4}
                >
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-red-100 dark:hover:bg-gradient-to-r dark:hover:from-red-500/20 dark:hover:to-orange-500/20 transition-all duration-300 font-medium border border-orange-200 dark:border-gray-700/50 dark:hover:border-red-500/50"
                  >
                    📊 Admin
                  </Link>
                </motion.div>
              )}

              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                custom={user?.role === 'admin' ? 5 : 4}
              >
                <Link
                  href="/profile/update"
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-purple-100 dark:hover:bg-gradient-to-r dark:hover:from-purple-500/20 dark:hover:to-pink-500/20 transition-all duration-300 font-medium border border-orange-200 dark:border-gray-700/50 dark:hover:border-purple-500/50"
                >
                  <User size={18} />
                  Profile
                </Link>
              </motion.div>

              {/* Theme Toggle Button */}
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.1, rotate: 20 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-200 dark:bg-gray-800 text-orange-600 dark:text-yellow-400 hover:bg-orange-300 dark:hover:bg-gray-700 transition-colors duration-300 border border-orange-300 dark:border-gray-600"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </motion.button>

              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 dark:from-red-500/80 dark:to-red-600/80 text-white hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 font-semibold border border-red-400/50"
              >
                <LogOut size={18} />
                Logout
              </motion.button>
            </>
          ) : (
            <>
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                custom={0}
              >
                <Link
                  href="/auth/login"
                  className="px-6 py-2 rounded-2xl text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-orange-100 dark:hover:bg-gray-800 transition-all duration-300 font-medium"
                >
                  Login
                </Link>
              </motion.div>

              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                custom={1}
              >
                <Link
                  href="/auth/register"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 dark:from-blue-500 dark:to-purple-500 text-white hover:shadow-lg transition-all duration-300 font-semibold shadow-md"
                >
                  Get Started
                </Link>
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Mobile Menu Button */}
        <motion.button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="md:hidden p-2 rounded-lg hover:bg-orange-100 dark:hover:bg-gray-800 transition-all duration-300"
        >
          <AnimatePresence mode="wait">
            {isMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90 }}
                animate={{ rotate: 0 }}
                exit={{ rotate: 90 }}
              >
                <X size={24} className="text-orange-600 dark:text-blue-400" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90 }}
                animate={{ rotate: 0 }}
                exit={{ rotate: -90 }}
              >
                <Menu size={24} className="text-orange-600 dark:text-blue-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b border-orange-200 dark:border-gray-700/50 md:hidden shadow-xl transition-colors duration-300"
            >
              <div className="px-4 py-4 space-y-2">
                {user ? (
                  <>
                    <motion.div
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      custom={0}
                    >
                      <Link
                        href="/foods/available"
                        className="block px-4 py-3 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-orange-100 hover:to-yellow-100 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="flex items-center gap-2">
                          <MapPin size={18} className="text-orange-500 dark:text-blue-400" />
                          Find Food
                        </span>
                      </Link>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      custom={1}
                    >
                      <Link
                        href="/foods/add"
                        className="block px-4 py-3 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-100 hover:to-orange-100 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="flex items-center gap-2">
                          <Share2 size={18} className="text-orange-500 dark:text-blue-400" />
                          Share Food
                        </span>
                      </Link>
                    </motion.div>

                    {/* Admin Link - Mobile */}
                    {user?.role === 'admin' && (
                      <motion.div
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        custom={2}
                      >
                        <Link
                          href="/admin"
                          className="block px-4 py-3 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-100 hover:to-orange-100 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all font-medium"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <span className="flex items-center gap-2">
                            📊 Admin Dashboard
                          </span>
                        </Link>
                      </motion.div>
                    )}

                    <motion.div
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      custom={user?.role === 'admin' ? 3 : 2}
                    >
                      <Link
                        href="/profile/update"
                        className="block px-4 py-3 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="flex items-center gap-2">
                          <User size={18} className="text-orange-500 dark:text-blue-400" />
                          Profile
                        </span>
                      </Link>
                    </motion.div>

                    <motion.button
                      onClick={handleLogout}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      custom={user?.role === 'admin' ? 4 : 3}
                      className="w-full block px-4 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white hover:shadow-lg transition-all font-medium mt-2"
                    >
                      <span className="flex items-center gap-2">
                        <LogOut size={18} />
                        Logout
                      </span>
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.div
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      custom={0}
                    >
                      <Link
                        href="/auth/login"
                        className="block px-4 py-3 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-gray-800 transition-all font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Login
                      </Link>
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      custom={1}
                    >
                      <Link
                        href="/auth/register"
                        className="block px-4 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 dark:from-blue-500 dark:to-purple-500 text-white hover:shadow-lg transition-all font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Get Started
                      </Link>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Navbar;

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Food } from '@/types';
import { FoodCard } from '@/components/FoodCard';
import { Toast } from '@/components/Toast';
import BackButton from '@/components/BackButton';
import { getBookmarkedFoods } from '@/lib/api';
import { Bookmark, Loader, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SavedFoodsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [foods, setFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchSavedFoods();
  }, [user, router]);

  const fetchSavedFoods = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getBookmarkedFoods();
      setFoods(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch saved foods');
      setToastMessage({
        message: err.response?.data?.message || 'Failed to load saved foods',
        type: 'info',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookmarkChange = () => {
    // Refresh the list when bookmark is changed
    fetchSavedFoods();
  };

  const handleRequestSuccess = () => {
    setToastMessage({ message: 'Food requested successfully!', type: 'success' });
  };

  const handleFoodDelete = () => {
    // Refresh the list when a food is deleted
    fetchSavedFoods();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 py-12 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -z-10"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Button */}
        <BackButton />

        {/* Header */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/50 hover:shadow-xl hover:shadow-yellow-500/70 transition-all duration-300 hover:scale-110">
              <Bookmark size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                ❤️ My Saved Posts
              </h1>
              <p className="text-gray-300 text-lg mt-1">
                {!isLoading && foods.length > 0
                  ? `You have bookmarked ${foods.length} delicious food item${foods.length !== 1 ? 's' : ''}`
                  : '⏳ Loading your bookmarks...'}
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="px-6 py-4 rounded-2xl bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/50 flex items-start gap-3 shadow-lg shadow-red-500/20 backdrop-blur">
            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <span className="text-red-300 font-semibold">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-yellow-400 border-t-yellow-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-300 font-medium">Loading your saved posts...</p>
            </div>
          </div>
        )}

        {/* Foods Grid */}
        {!isLoading && foods.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-400 font-medium">Showing {foods.length} saved item(s)</p>
              <button
                onClick={fetchSavedFoods}
                className="px-4 py-2 text-sm font-semibold text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 rounded-lg transition-all border border-yellow-500/30 backdrop-blur"
              >
                🔄 Refresh
              </button>
            </div>
            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05, delayChildren: 0.1 }}
            >
              {foods.map((food, index) => (
                <FoodCard
                  key={food._id}
                  food={food}
                  onRequestSuccess={handleRequestSuccess}
                  onBookmarkChange={handleBookmarkChange}
                  onDelete={handleFoodDelete}
                  index={index}
                  currentUserId={user?.id}
                  currentUserRole={user?.role}
                />
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && foods.length === 0 && !error && (
          <div className="text-center py-16 px-4 glass-effect rounded-3xl border border-gray-700/50 backdrop-blur">
            <div className="text-6xl mb-4">📌</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Saved Posts Yet</h3>
            <p className="text-gray-300 mb-8">
              Start bookmarking your favorite food listings to see them here!
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="/foods/available"
                className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all transform hover:scale-105 border border-blue-400/50"
              >
                Discover Food
              </a>
              <a
                href="/foods/add"
                className="inline-block px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all transform hover:scale-105 border border-green-400/50"
              >
                Share Food
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && <Toast message={toastMessage.message} type={toastMessage.type} />}
    </div>
  );
}

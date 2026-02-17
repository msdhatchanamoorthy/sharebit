'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Food, User } from '@/types';
import { formatDistance, formatDate } from '@/lib/utils';
import { Heart, MapPin, Clock, User as UserIcon, Check, Loader, MessageCircle, Trash2, Bookmark, Navigation2 } from 'lucide-react';
import { 
  likeFood, 
  unlikeFood, 
  addComment, 
  removeComment,
  bookmarkFood,
  removeBookmark,
  deleteFood as deleteFoodAPI,
} from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Toast } from './Toast';

interface FoodCardProps {
  food: Food;
  onRequestSuccess?: () => void;
  index?: number;
  currentUserId?: string;
  currentUserRole?: 'user' | 'admin';
  onBookmarkChange?: () => void;
  onDelete?: () => void;
}

export function FoodCard({ food, onRequestSuccess, index = 0, currentUserId, currentUserRole, onBookmarkChange, onDelete }: FoodCardProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [foodData, setFoodData] = useState(food);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [removingCommentId, setRemovingCommentId] = useState<string | null>(null);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isLiked = foodData.likes?.some(like => like.userId === currentUserId);
  const likeCount = foodData.likeCount || foodData.likes?.length || 0;
  const commentCount = foodData.commentCount || foodData.comments?.length || 0;
  const isBookmarked = foodData.bookmarkedBy?.includes(currentUserId ?? '') ?? false;

  // Check if food is expiring soon
  const isExpiringAlertSoon = () => {
    if (!foodData.expiryTime) return false;
    const now = new Date();
    const expiryDate = new Date(foodData.expiryTime);
    const hoursUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry < 2 && hoursUntilExpiry > 0;
  };

  const handleRequest = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isRequesting || hasRequested) return;

    try {
      setIsRequesting(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setToast({ message: 'Please login to request food', type: 'error' });
        return;
      }

      // Import dynamically to avoid circular imports
      const { requestFood } = await import('@/lib/api');
      
      console.log(`[FoodCard] Requesting food: ${food._id}`);
      
      // Use axios api instance for better error handling
      const data = await requestFood(food._id);
      
      console.log(`[FoodCard] Request successful:`, data);

      if (data.success || data.request) {
        setHasRequested(true);
        setToast({ 
          message: 'Request sent successfully! The food owner will review it soon.', 
          type: 'success' 
        });
        
        // Trigger callback
        setTimeout(() => {
          if (onRequestSuccess) {
            onRequestSuccess();
          }
        }, 1000);
      } else {
        throw new Error(data.message || 'Failed to request food');
      }
    } catch (err: any) {
      console.error('[FoodCard] Request error - Full error:', err);
      
      // Extract detailed error message
      let errorMessage = 'Failed to request food';
      let isDuplicateRequest = false;
      
      if (err.response) {
        console.error('[FoodCard] Response status:', err.response.status);
        console.error('[FoodCard] Response data:', err.response.data);
        errorMessage = err.response.data?.message || errorMessage;
        
        // Check if it's a duplicate request error
        if (errorMessage.toLowerCase().includes('already') && errorMessage.toLowerCase().includes('request')) {
          isDuplicateRequest = true;
          setHasRequested(true);
          setToast({ 
            message: 'You already have a pending request for this food', 
            type: 'error' 
          });
        } else {
          setToast({ message: errorMessage, type: 'error' });
        }
      } else if (err.message) {
        errorMessage = err.message;
        setToast({ message: errorMessage, type: 'error' });
      } else {
        setToast({ message: errorMessage, type: 'error' });
      }
      
      // Don't set error state - use toast instead
      if (!isDuplicateRequest) {
        setError(null);
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUserId) return;
    
    try {
      setIsLiking(true);
      if (isLiked) {
        await unlikeFood(food._id);
      } else {
        await likeFood(food._id);
      }
      
      // Update local state
      setFoodData(prev => {
        const newLikes = isLiked 
          ? prev.likes?.filter(like => like.userId !== currentUserId)
          : [...(prev.likes || []), { userId: currentUserId, createdAt: new Date() }];
        return { ...prev, likes: newLikes };
      });
    } catch (err: any) {
      console.error('Failed to like food:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim() || !currentUserId) return;
    
    try {
      setIsAddingComment(true);
      const response = await addComment(food._id, commentText);
      
      setFoodData(response.data);
      setCommentText('');
    } catch (err: any) {
      console.error('Failed to add comment:', err);
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleRemoveComment = async (commentId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setRemovingCommentId(commentId);
      const response = await removeComment(food._id, commentId);
      setFoodData(response.data);
    } catch (err: any) {
      console.error('Failed to remove comment:', err);
    } finally {
      setRemovingCommentId(null);
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUserId) return;

    try {
      setIsBookmarking(true);
      
      if (isBookmarked) {
        await removeBookmark(food._id);
      } else {
        await bookmarkFood(food._id);
      }

      // Update local state
      setFoodData(prev => {
        const newBookmarkedBy = isBookmarked
          ? prev.bookmarkedBy?.filter(id => id !== currentUserId)
          : [...(prev.bookmarkedBy || []), currentUserId];
        return { ...prev, bookmarkedBy: newBookmarkedBy };
      });

      if (onBookmarkChange) {
        onBookmarkChange(!isBookmarked);
      }
    } catch (err: any) {
      console.error('Failed to bookmark food:', err);
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (food.latitude && food.longitude) {
      const mapsUrl = `https://www.google.com/maps/search/${food.latitude},${food.longitude}`;
      window.open(mapsUrl, '_blank');
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      console.log('[FoodCard] Deleting food:', food._id);
      
      await deleteFoodAPI(food._id);
      
      setToast({
        message: 'Food deleted successfully',
        type: 'success',
      });

      // Close confirmation modal
      setShowDeleteConfirm(false);

      // Call parent callback to refresh the food list
      if (onDelete) {
        setTimeout(() => {
          onDelete();
        }, 1000);
      }
    } catch (err: any) {
      console.error('[FoodCard] Error deleting food:', err);
      setToast({
        message: err.response?.data?.message || 'Failed to delete food',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.08,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <div className="group relative h-full rounded-3xl overflow-hidden bg-white dark:bg-gray-900/80 shadow-lg hover:shadow-2xl hover:shadow-orange-200 dark:hover:shadow-blue-500/20 transition-all duration-300 border border-gray-200 dark:border-gray-700/50 flex flex-col backdrop-blur-md hover:border-orange-300 dark:hover:border-purple-500/50">
        {/* Image Container */}
        <motion.div
          className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          {food.image ? (
            <Image
              src={food.image}
              alt={food.title}
              fill
              className="object-cover transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl">🍲</span>
            </div>
          )}

          {/* Category Badge (Top-Left) */}
          {food.category && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-3 left-3 bg-gradient-to-r from-blue-500/90 to-purple-500/90 backdrop-blur text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-blue-500/50 border border-blue-400/50 flex items-center gap-1.5"
            >
              <span>🏷️</span>
              <span>{food.category}</span>
              {food.price !== undefined && (
                <span className="ml-1">
                  {food.price === 0 ? 'Free' : `₹${food.price}`}
                </span>
              )}
            </motion.div>
          )}

          {/* Status & Expiry Badges (Top-Right) */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
            {/* Request Status Badge */}
            {food.status === 'requested' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-green-500/90 to-emerald-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg shadow-green-500/50 border border-green-400/50"
              >
                ✓ Requested
              </motion.div>
            )}

            {/* User's Pending Request Badge */}
            {hasRequested && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg shadow-amber-500/50 border border-amber-400/50"
              >
                ⏳ Pending Approval
              </motion.div>
            )}

            {/* Expiry Alert Badge */}
            {isExpiringAlertSoon() && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-yellow-400/90 to-orange-400/90 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold shadow-lg shadow-yellow-500/50 flex items-center gap-1 border border-yellow-300/50"
              >
                ⏰ Expiring Soon
              </motion.div>
            )}
          </div>

          {/* Distance Badge (Bottom-Left) */}
          {food.distanceKm !== undefined && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-3 left-3 bg-gray-900/90 backdrop-blur text-blue-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg shadow-blue-500/20 border border-blue-500/30"
            >
              <MapPin size={12} />
              {formatDistance(food.distanceKm)}
            </motion.div>
          )}

          {/* Admin Delete Button (Bottom-Left, above distance if admin) */}
          {currentUserRole === 'admin' && (
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              disabled={isDeleting}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`absolute left-3 ${food.distanceKm !== undefined ? 'bottom-16' : 'bottom-3'} w-10 h-10 rounded-full shadow-lg shadow-red-500/50 flex items-center justify-center transition-all bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:shadow-red-500/70 border border-red-400/50 ${
                isDeleting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Delete food (Admin only)"
            >
              {isDeleting ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Trash2 size={18} />
              )}
            </motion.button>
          )}

          {/* Bookmark Button (Bottom-Right) */}
          <motion.button
            onClick={handleBookmark}
            disabled={isBookmarking || !currentUserId}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`absolute bottom-3 right-3 w-10 h-10 rounded-full shadow-lg shadow-yellow-500/30 flex items-center justify-center transition-all ${
              isBookmarked
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 shadow-yellow-500/60'
                : 'bg-gray-800/80 backdrop-blur text-gray-300 hover:text-yellow-400 hover:border-yellow-400/50 border border-gray-600/50'
            } ${isBookmarking ? 'opacity-50' : ''}`}
          >
            <Bookmark
              size={18}
              fill={isBookmarked ? 'currentColor' : 'none'}
            />
          </motion.button>
        </motion.div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col space-y-3">
          {/* Title */}
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: (index * 0.08) + 0.2 }}
            className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2"
          >
            {food.title}
          </motion.h3>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{food.description}</p>

          {/* Owner Info */}
          <motion.div
            className="flex items-center gap-2 py-2.5 px-3 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm"
            whileHover={{ backgroundColor: 'rgb(31 41 55 / 0.7)' }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-purple-500/50">
              {food.ownerId.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{food.ownerId.name}</p>
              <div className="flex items-center gap-1">
                <span className="text-xs text-yellow-400">⭐</span>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {food.ownerId.rating.toFixed(1)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400 font-medium">
            <motion.div
              className="flex items-center gap-1 bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-700/50 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <Clock size={12} className="text-blue-400" />
              {formatDate(food.createdAt)}
            </motion.div>
            <motion.div
              className="flex items-center gap-1 bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-700/50 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              📦 {food.quantity}
            </motion.div>
          </div>

          {/* Location */}
          <motion.div
            className="flex items-start gap-1 text-xs text-gray-700 dark:text-gray-400 px-2 py-1.5 bg-orange-100 dark:bg-blue-500/10 rounded-xl border border-orange-300 dark:border-blue-500/30 backdrop-blur-sm"
            whileHover={{ borderColor: '#3b82f6' }}
          >
            <MapPin size={12} className="mt-0.5 flex-shrink-0 text-blue-400" />
            <span className="line-clamp-1">{food.locationName}</span>
          </motion.div>

          {/* Like & Comment Stats */}
          <div className="flex gap-4 text-xs font-semibold">
            <motion.button
              onClick={handleLike}
              disabled={isLiking || !currentUserId}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                isLiked
                  ? 'bg-red-500/30 text-red-400 border border-red-500/50'
                  : 'bg-gray-800/50 text-gray-400 hover:text-red-400 hover:bg-red-500/20 hover:border-red-500/50 border border-gray-700/50'
              } ${!currentUserId ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
              {likeCount}
            </motion.button>

            <motion.button
              onClick={() => setShowComments(!showComments)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-400 rounded-full hover:text-orange-500 dark:hover:text-blue-400 hover:bg-orange-100 dark:hover:bg-blue-500/20 hover:border-orange-500 dark:hover:border-blue-500/50 border border-gray-300 dark:border-gray-700/50 transition-all"
            >
              <MessageCircle size={14} />
              {commentCount}
            </motion.button>
          </div>

          {/* Comments Section */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-700/50 pt-3 mt-3 space-y-2.5 bg-gray-800/30 -mx-5 -mb-5 px-5 py-3 rounded-b-2xl backdrop-blur-sm"
              >
                {/* Comments List */}
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {foodData.comments && foodData.comments.length > 0 ? (
                    foodData.comments.map(comment => (
                      <motion.div
                        key={comment._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-700/40 backdrop-blur-sm p-2 rounded-lg text-xs border border-gray-600/50"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{comment.userId.name}</p>
                            <p className="text-gray-700 dark:text-gray-400 mt-0.5">{comment.text}</p>
                          </div>
                          {(currentUserId === comment.userId._id || currentUserId === food.ownerId._id) && (
                            <motion.button
                              onClick={(e) => handleRemoveComment(comment._id, e)}
                              disabled={removingCommentId === comment._id}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="text-gray-500 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors flex-shrink-0"
                            >
                              <Trash2 size={12} />
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-500 py-2">No comments yet</p>
                  )}
                </div>

                {/* Add Comment Form */}
                {currentUserId && (
                  <form onSubmit={handleAddComment} className="flex gap-1.5">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add comment..."
                      disabled={isAddingComment}
                      className="flex-1 px-2 py-1.5 text-xs bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600/50 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-500 rounded-lg focus:outline-none focus:border-orange-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-orange-400/50 dark:focus:ring-blue-400/50 disabled:opacity-50 backdrop-blur-sm"
                    />
                    <motion.button
                      type="submit"
                      disabled={isAddingComment || !commentText.trim()}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-2 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 dark:from-blue-500 dark:to-purple-500 text-white text-xs rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/50 dark:hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-orange-400/50 dark:border-blue-400/50"
                    >
                      {isAddingComment ? 'Posting...' : 'Post'}
                    </motion.button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          {food.status === 'available' ? (
            <div className="flex gap-2">
              {/* Navigate Button */}
              <motion.button
                onClick={handleNavigate}
                disabled={!food.latitude || !food.longitude}
                whileHover={food.latitude && food.longitude ? { scale: 1.02 } : {}}
                whileTap={food.latitude && food.longitude ? { scale: 0.98 } : {}}
                className={`flex-1 py-2.5 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 border ${
                  food.latitude && food.longitude
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/50 border-blue-400/50'
                    : 'bg-gray-800/50 text-gray-600 cursor-not-allowed border-gray-700/50'
                }`}
              >
                <Navigation2 size={16} />
                Map
              </motion.button>

              {/* Request Button */}
              <motion.button
                onClick={handleRequest}
                disabled={isRequesting || hasRequested}
                whileHover={!hasRequested && !isRequesting ? { scale: 1.02 } : {}}
                whileTap={!hasRequested && !isRequesting ? { scale: 0.98 } : {}}
                className={`flex-1 py-2.5 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 border ${
                  hasRequested
                    ? 'bg-gradient-to-r from-green-500/80 to-emerald-500/80 text-white cursor-default border-green-400/50 shadow-lg shadow-green-500/30'
                    : isRequesting
                      ? 'bg-gradient-to-r from-blue-500/80 to-cyan-500/80 text-white border-blue-400/50 shadow-lg shadow-blue-500/30'
                      : 'bg-gradient-to-r from-orange-500/80 to-red-500/80 text-white hover:shadow-lg hover:shadow-orange-500/50 border-orange-400/50'
                }`}
              >
                {hasRequested ? (
                  <>
                    <Check size={16} />
                    Sent
                  </>
                ) : isRequesting ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Requesting...
                  </>
                ) : (
                  <>
                    <Heart size={16} />
                    Request
                  </>
                )}
              </motion.button>
            </div>
          ) : (
            <motion.button
              disabled
              className="w-full py-2.5 rounded-2xl font-bold text-sm bg-gray-200 dark:bg-gray-800/50 text-gray-500 dark:text-gray-500 cursor-not-allowed flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700/50 backdrop-blur"
            >
              <User size={16} />
              No Longer Available
            </motion.button>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            key="delete-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
            onClick={() => !isDeleting && setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-effect rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-red-500/30 bg-white dark:bg-gray-900/90 backdrop-blur"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center border border-red-500/50">
                  <Trash2 size={24} className="text-red-400" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                Delete Food Listing?
              </h2>

              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Are you sure you want to delete this food listing? This action cannot be undone.
              </p>

              <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-3 mb-6 border border-gray-300 dark:border-gray-700/50 backdrop-blur-sm">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">{food.title}</p>
                <p className="text-xs text-gray-400 line-clamp-2">{food.description}</p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  whileHover={{ scale: isDeleting ? 1 : 1.02 }}
                  whileTap={{ scale: isDeleting ? 1 : 0.98 }}
                  className="flex-1 py-2.5 rounded-lg font-semibold text-sm bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white transition-all disabled:opacity-50 border border-gray-600/50 backdrop-blur-sm"
                >
                  Cancel
                </motion.button>

                <motion.button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  whileHover={{ scale: isDeleting ? 1 : 1.02 }}
                  whileTap={{ scale: isDeleting ? 1 : 0.98 }}
                  className="flex-1 py-2.5 rounded-lg font-semibold text-sm bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-red-400/50"
                >
                  {isDeleting ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Toast Notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} duration={3000} />
      )}
    </motion.div>
  );
}

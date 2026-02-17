'use client';

import React, { useState, useEffect } from 'react';
import { getMyRequests, cancelRequest } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  MapPin, 
  User, 
  XCircle, 
  AlertCircle, 
  Loader,
  CheckCircle,
  Ban
} from 'lucide-react';
import Image from 'next/image';

export interface MyRequest {
  _id: string;
  foodId: {
    _id: string;
    title: string;
    image: string;
    description: string;
    category: string;
    price: number;
    status: string;
  };
  owner: {
    _id: string;
    name: string;
    email: string;
    location: string;
    profilePhoto?: string;
    rating: number;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  message: string;
  createdAt: string;
  requestedDate: string;
}

interface MyRequestsProps {
  userId?: string;
  onRequestsLoad?: (requests: MyRequest[]) => void;
  maxItems?: number;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-50 border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  accepted: {
    label: 'Accepted',
    color: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-800',
    icon: Ban,
  },
  completed: {
    label: 'Completed',
    color: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
  },
};

export function MyRequests({ 
  userId, 
  onRequestsLoad, 
  maxItems = 10 
}: MyRequestsProps) {
  const [requests, setRequests] = useState<MyRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  // Fetch requests on mount
  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getMyRequests();

      if (data.success) {
        const limitedRequests = data.requests.slice(0, maxItems);
        setRequests(limitedRequests);

        if (onRequestsLoad) {
          onRequestsLoad(limitedRequests);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch requests');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load requests';
      setError(errorMessage);
      console.error('Fetch my requests error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) {
      return;
    }

    try {
      setCancelingId(requestId);
      const data = await cancelRequest(requestId);

      if (data.success) {
        // Remove the cancelled request from the list
        setRequests(prev => prev.filter(req => req._id !== requestId));
      } else {
        throw new Error(data.message || 'Failed to cancel request');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to cancel request';
      setError(errorMessage);
      console.error('Cancel request error:', err);
    } finally {
      setCancelingId(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader size={32} className="text-orange-500" />
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-200 rounded-xl p-6"
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Requests</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchMyRequests}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  // Empty state
  if (requests.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 px-4"
      >
        <div className="text-5xl mb-4">📋</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Requests Yet</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          You haven't made any food requests yet. Browse available food listings and click the request button to get started!
        </p>
      </motion.div>
    );
  }

  // Requests list
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Requests ({requests.length})</h2>
        <button
          onClick={fetchMyRequests}
          className="px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        {requests.map((request, index) => {
          const config = statusConfig[request.status];
          const StatusIcon = config.icon;

          return (
            <motion.div
              key={request._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className={`border rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all ${config.color}`}
            >
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Food Image & Title */}
                  <div className="md:col-span-2">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-200">
                        {request.foodId.image ? (
                          <Image
                            src={request.foodId.image}
                            alt={request.foodId.title}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">
                            🍲
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                          {request.foodId.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {request.foodId.description}
                        </p>

                        {/* Category & Price */}
                        <div className="flex items-center gap-3 mt-3">
                          <span className="inline-block px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                            {request.foodId.category}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {request.foodId.price === 0 ? 'Free' : `₹${request.foodId.price}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Owner Info */}
                  <div className="bg-white/50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Food Owner</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-600 flex-shrink-0" />
                        <span className="font-semibold text-gray-900 truncate">
                          {request.owner.name}
                        </span>
                      </div>
                      {request.owner.location && (
                        <div className="flex items-start gap-2">
                          <MapPin size={16} className="text-gray-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600 line-clamp-2">
                            {request.owner.location}
                          </span>
                        </div>
                      )}
                      {request.owner.rating && (
                        <div className="flex items-center gap-2">
                          <span className="text-lg">⭐</span>
                          <span className="text-sm font-medium text-gray-900">
                            {request.owner.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="bg-white/50 rounded-lg p-4 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Status</p>
                      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${config.badge}`}>
                        <StatusIcon size={16} />
                        <span className="font-semibold text-sm">{config.label}</span>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Requested</p>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock size={14} />
                        <span className="text-sm font-medium">{request.requestedDate}</span>
                      </div>
                    </div>

                    {/* Cancel Button - Only show for pending requests */}
                    {request.status === 'pending' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCancelRequest(request._id)}
                        disabled={cancelingId === request._id}
                        className="mt-4 w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {cancelingId === request._id ? (
                          <>
                            <Loader size={16} className="animate-spin" />
                            <span>Canceling...</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={16} />
                            <span>Cancel</span>
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Message (if exists) */}
                {request.message && (
                  <div className="mt-4 pt-4 border-t border-gray-300/30">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Message:</span> {request.message}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}

export default MyRequests;

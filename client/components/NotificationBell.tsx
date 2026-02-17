'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Trash2, Loader } from 'lucide-react';
import { getNotifications, getUnreadCount, markNotificationAsRead, deleteNotification } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Notification } from '@/types';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const countRes = await getUnreadCount();
        setUnreadCount(countRes.unreadCount || 0);
      } catch (err) {
        console.error('Failed to fetch notification count:', err);
      }
    };

    // Fetch on mount and every 30 seconds
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotificationsList = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const response = await getNotifications(20, 0);
      setNotifications(response.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen && notifications.length === 0) {
      fetchNotificationsList();
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setIsDeletingId(notificationId);
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <motion.button
        onClick={handleBellClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
      >
        <Bell size={20} className="text-gray-600" />
        
        {/* Unread Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-96 max-h-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white">
              <h3 className="font-bold text-lg">Notifications</h3>
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader size={20} className="animate-spin text-orange-500" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-2 p-2">
                  {notifications.map(notification => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                        !notification.isRead
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-slate-50 hover:bg-slate-100'
                      }`}
                      onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                            <span className="text-base">
                              {notification.type === 'like' ? '❤️' :
                               notification.type === 'comment' ? '💬' :
                               '📦'}
                            </span>
                            {notification.senderId?.name || "Unknown User"}
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                          {notification.foodId && (
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              on "{notification.foodId?.title || "Food"}"
                            </p>
                          )}
                        </div>

                        <motion.button
                          onClick={(e) => handleDelete(notification._id, e)}
                          disabled={isDeletingId === notification._id}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

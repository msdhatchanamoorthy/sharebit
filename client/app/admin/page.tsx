'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import BackButton from '@/components/BackButton';
import { Navbar } from '@/components/Navbar';
import api from '@/lib/api';
import { Users, FileText, TrendingUp, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalFood: number;
  totalRequests: number;
  averageRating: number;
}

interface AdminFoodItem {
  _id: string;
  title: string;
  description: string;
  image?: string;
  ownerName: string;
  location: string;
  status: string;
  createdAt: string;
}

interface AdminUserItem {
  _id: string;
  name: string;
  email: string;
  location: string;
  rating: number;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [foods, setFoods] = useState<AdminFoodItem[]>([]);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'foods'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch admin statistics
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/foods');
      if (response.data.success) {
        setFoods(response.data.foods);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch foods');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'overview' | 'users' | 'foods') => {
    setActiveTab(tab);
    if (tab === 'users') fetchUsers();
    if (tab === 'foods') fetchFoods();
  };

  const handleDeleteFood = async (foodId: string) => {
    if (!confirm('Are you sure you want to delete this food item?')) return;
    try {
      await api.delete(`/admin/foods/${foodId}`);
      setFoods(foods.filter(f => f._id !== foodId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete food');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-black dark:to-gray-800 transition-colors duration-300">
        <Navbar />

        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Back Button */}
          <BackButton />

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">📊 Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Welcome back, {user?.name}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-950 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            <button
              onClick={() => handleTabChange('overview')}
              className={`px-4 py-3 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'text-orange-600 dark:text-blue-400 border-b-2 border-orange-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="inline-block mr-2 h-5 w-5" />
              Overview
            </button>
            <button
              onClick={() => handleTabChange('users')}
              className={`px-4 py-3 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'users'
                  ? 'text-orange-600 dark:text-blue-400 border-b-2 border-orange-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Users className="inline-block mr-2 h-5 w-5" />
              Users
            </button>
            <button
              onClick={() => handleTabChange('foods')}
              className={`px-4 py-3 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'foods'
                  ? 'text-orange-600 dark:text-blue-400 border-b-2 border-orange-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <FileText className="inline-block mr-2 h-5 w-5" />
              Food Posts
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 dark:border-blue-500"></div>
                </div>
              ) : stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Stat Cards */}
                  <StatCard
                    icon={<Users className="h-8 w-8" />}
                    label="Total Users"
                    value={stats.totalUsers}
                    subtext={`${stats.activeUsers} active in 30 days`}
                  />
                  <StatCard
                    icon={<TrendingUp className="h-8 w-8" />}
                    label="Active Users (30d)"
                    value={stats.activeUsers}
                  />
                  <StatCard
                    icon={<FileText className="h-8 w-8" />}
                    label="Food Posts"
                    value={stats.totalFood}
                  />
                  <StatCard
                    icon={<Eye className="h-8 w-8" />}
                    label="Total Requests"
                    value={stats.totalRequests}
                  />

                  {/* Average Rating */}
                  <div className="lg:col-span-4 bg-white dark:bg-gray-900/50 rounded-lg shadow-md dark:shadow-lg dark:shadow-blue-500/20 p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Average User Rating</p>
                        <p className="text-3xl font-bold text-orange-600 dark:text-blue-400">{stats.averageRating.toFixed(2)} / 5.0</p>
                      </div>
                      <div className="text-5xl text-yellow-400">★</div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 dark:border-blue-500"></div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900/50 rounded-lg shadow-md dark:shadow-lg dark:shadow-blue-500/20 overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Name</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Email</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Location</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Rating</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Joined</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map((u) => (
                          <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">{u.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{u.email}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{u.location}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className="text-yellow-500 dark:text-yellow-400">★ {u.rating.toFixed(1)}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <button
                                onClick={() => handleDeleteUser(u._id)}
                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-semibold transition-colors"
                              >
                                <Trash2 className="h-5 w-5 inline" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Foods Tab */}
          {activeTab === 'foods' && (
            <div>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 dark:border-blue-500"></div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900/50 rounded-lg shadow-md dark:shadow-lg dark:shadow-blue-500/20 overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Image</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Title</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Owner</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Location</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Status</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Posted</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {foods.map((food) => (
                          <tr key={food._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="px-6 py-4 text-sm">
                              {food.image ? (
                                <img 
                                  src={`http://localhost:5000/uploads/${food.image}`} 
                                  alt={food.title}
                                  className="h-12 w-12 rounded-lg object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder-food.jpg';
                                  }}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                  <span className="text-gray-400 dark:text-gray-500 text-xs">No img</span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-200">{food.title}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{food.ownerName}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              {food.location?.coordinates ? (
                                `${food.location.coordinates[1]?.toFixed(4) ?? 'N/A'}, ${food.location.coordinates[0]?.toFixed(4) ?? 'N/A'}`
                              ) : (
                                'No location'
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                                food.status === 'available'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300'
                              }`}>
                                {food.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              {new Date(food.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <button
                                onClick={() => handleDeleteFood(food._id)}
                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-semibold transition-colors"
                              >
                                <Trash2 className="h-5 w-5 inline" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  subtext?: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-900/50 rounded-lg shadow-md dark:shadow-lg dark:shadow-blue-500/20 p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg dark:hover:shadow-blue-500/30">
      <div className="flex items-start justify-between mb-4">
        <div className="text-orange-600 dark:text-blue-400">{icon}</div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{label}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</p>
      {subtext && <p className="text-xs text-gray-500 dark:text-gray-500">{subtext}</p>}
    </div>
  );
}

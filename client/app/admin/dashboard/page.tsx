'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Toast } from '@/components/Toast';
import api from '@/lib/api';
import { Trash2, CheckCircle, Users, Share2, TrendingUp, BarChart3 } from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalFood: number;
  totalRequests: number;
  averageRating: number;
}

interface FoodItem {
  _id: string;
  name: string;
  description: string;
  quantity: string;
  category: string;
  donorName: string;
  location: string;
  createdAt: string;
  status: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    // Fetch data
    fetchDashboardData();
  }, [user, router]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch stats
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data.stats);

      // Fetch all food items
      const foodsRes = await api.get('/admin/foods');
      setFoods(foodsRes.data.foods || []);
    } catch (err: any) {
      setToastMessage({
        message: err.response?.data?.message || 'Failed to load dashboard',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFood = async (foodId: string) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) {
      return;
    }

    try {
      setDeletingId(foodId);
      await api.delete(`/admin/foods/${foodId}`);

      // Remove from local state
      setFoods((prev) => prev.filter((f) => f._id !== foodId));

      setToastMessage({
        message: 'Food item deleted successfully',
        type: 'success',
      });
    } catch (err: any) {
      setToastMessage({
        message: err.response?.data?.message || 'Failed to delete food item',
        type: 'error',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleApproveFood = async (foodId: string) => {
    try {
      await api.put(`/admin/foods/${foodId}`, { status: 'approved' });

      // Update local state
      setFoods((prev) =>
        prev.map((f) => (f._id === foodId ? { ...f, status: 'approved' } : f))
      );

      setToastMessage({
        message: 'Food item approved!',
        type: 'success',
      });
    } catch (err: any) {
      setToastMessage({
        message: err.response?.data?.message || 'Failed to approve food item',
        type: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-warm-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-warm-cream py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-600 to-warm-orange bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-smooth"
            >
              Back to Home
            </button>
          </div>
          <p className="text-gray-600">Manage platform and monitor activities</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { icon: Users, label: 'Total Users', value: stats.totalUsers, color: 'blue' },
              {
                icon: Share2,
                label: 'Total Food Shared',
                value: stats.totalFood,
                color: 'orange',
              },
              {
                icon: TrendingUp,
                label: 'Total Requests',
                value: stats.totalRequests,
                color: 'green',
              },
              {
                icon: BarChart3,
                label: 'Avg Rating',
                value: stats.averageRating.toFixed(1),
                color: 'purple',
              },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-brand-200/30 hover:shadow-xl transition-smooth"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                      <Icon size={24} className={`text-${stat.color}-600`} />
                    </div>
                    <p className="text-xs text-gray-500">Live</p>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Food Management Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-brand-200/30 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-brand-50 to-warm-peach/20">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Share2 size={24} className="text-brand-600" />
              Food Management
            </h2>
            <p className="text-sm text-gray-600 mt-1">{foods.length} total items</p>
          </div>

          {foods.length === 0 ? (
            <div className="p-12 text-center">
              <Share2 size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No food items found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Food Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Donor
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {foods.map((food, idx) => (
                    <tr
                      key={food._id}
                      className={`border-b border-gray-200 hover:bg-gray-50 transition-smooth ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="px-6 py-3">
                        <div>
                          <p className="font-semibold text-gray-800">{food.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{food.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-gray-700">{food.donorName}</td>
                      <td className="px-6 py-3">
                        <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold">
                          {food.category}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-700 text-sm">
                        {food.location?.coordinates ? (
                          `${food.location.coordinates[1]?.toFixed(4) ?? 'N/A'}, ${food.location.coordinates[0]?.toFixed(4) ?? 'N/A'}`
                        ) : (
                          'No location'
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            food.status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {food.status === 'approved' ? '✓ Approved' : '⏳ Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex gap-2">
                          {food.status !== 'approved' && (
                            <button
                              onClick={() => handleApproveFood(food._id)}
                              className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-600 transition-smooth"
                              title="Approve"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteFood(food._id)}
                            disabled={deletingId === food._id}
                            className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-smooth disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          duration={3000}
        />
      )}
    </div>
  );
}

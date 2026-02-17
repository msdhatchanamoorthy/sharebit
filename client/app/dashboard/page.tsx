'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import BackButton from '@/components/BackButton';
import { Compass, Heart, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function UserDashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute requiredRole="user">
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
        <Navbar />

        <div className="max-w-7xl mx-auto p-6">
          {/* Back Button */}
          <BackButton />

          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-gray-600">
              Discover amazing food in your area and share your own
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Foods Shared</h3>
                <div className="text-2xl">🥗</div>
              </div>
              <p className="text-3xl font-bold text-orange-600">{user?.foodsShared || 0}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Foods Collected</h3>
                <div className="text-2xl">🛒</div>
              </div>
              <p className="text-3xl font-bold text-green-600">{user?.foodsCollected || 0}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Your Rating</h3>
                <div className="text-2xl">⭐</div>
              </div>
              <p className="text-3xl font-bold text-yellow-600">{user?.rating?.toFixed(1) || '5.0'}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Browse Foods */}
              <Link href="/foods">
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-lg p-8 text-white cursor-pointer hover:shadow-xl transition-all hover:scale-105">
                  <Compass className="h-12 w-12 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Browse Foods</h3>
                  <p className="text-orange-100">Discover food around you</p>
                </div>
              </Link>

              {/* My Requests */}
              <Link href="/requests/my-requests">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-lg p-8 text-white cursor-pointer hover:shadow-xl transition-all hover:scale-105">
                  <Heart className="h-12 w-12 mb-4" />
                  <h3 className="text-xl font-bold mb-2">My Requests</h3>
                  <p className="text-blue-100">Track your food requests</p>
                </div>
              </Link>

              {/* My Profile */}
              <Link href="/profile">
                <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg shadow-lg p-8 text-white cursor-pointer hover:shadow-xl transition-all hover:scale-105">
                  <MapPin className="h-12 w-12 mb-4" />
                  <h3 className="text-xl font-bold mb-2">My Profile</h3>
                  <p className="text-green-100">View and edit your profile</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How ShareBit Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">1️⃣</div>
                <h3 className="font-bold text-gray-900 mb-2">Share Food</h3>
                <p className="text-gray-600">Post food you want to share with the community</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">2️⃣</div>
                <h3 className="font-bold text-gray-900 mb-2">Discover</h3>
                <p className="text-gray-600">Browse and request food from nearby users</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">3️⃣</div>
                <h3 className="font-bold text-gray-900 mb-2">Connect</h3>
                <p className="text-gray-600">Meet others and build your community</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

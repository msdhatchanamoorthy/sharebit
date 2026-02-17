'use client';

import React from 'react';
import { MyRequests } from '@/components/MyRequests';
import { motion } from 'framer-motion';
import BackButton from '@/components/BackButton';

export default function MyRequestsPage() {
  const handleRequestsLoad = (requests: any[]) => {
    console.log('Requests loaded:', requests);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-yellow-50 to-orange-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-white via-orange-50 to-amber-50 backdrop-blur-md shadow-lg border-b border-orange-200 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 bg-clip-text text-transparent">
              My Food Requests
            </h1>
            <p className="text-gray-600 mt-2">Track all your food requests and their status</p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <BackButton />

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-orange-100">
          <MyRequests
            onRequestsLoad={handleRequestsLoad}
            maxItems={50}
          />
        </div>
      </main>
    </div>
  );
}

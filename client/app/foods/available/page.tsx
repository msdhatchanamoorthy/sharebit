'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Food } from '@/types';
import { FoodCard } from '@/components/FoodCard';
import BackButton from '@/components/BackButton';
import { Toast } from '@/components/Toast';
import { getCurrentLocation } from '@/lib/utils';
import api from '@/lib/api';
import { MapPin, Loader, AlertCircle, RefreshCw, Grid, Map as MapIcon } from 'lucide-react';
import { GoogleMapView } from './map/GoogleMapView';
import { motion } from 'framer-motion';

export default function AvailableFoodsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [foods, setFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [radius, setRadius] = useState(5000); // 5km in meters
  const [sortBy, setSortBy] = useState<'distance' | 'recent'>('distance');
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  
  // Advanced Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [priceFilter, setPriceFilter] = useState<string>('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('All');
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  // Default fallback location (New Delhi, India)
  const FALLBACK_LOCATION = { lat: 28.7041, lng: 77.1025, name: 'New Delhi' };

  // Request user location on mount
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchLocation();
  }, [user, router]);

  // Fetch foods when location or filters change
  useEffect(() => {
    if (userLocation) {
      fetchNearbyFoods();
    }
  }, [userLocation, radius, categoryFilter, priceFilter, availabilityFilter, sortBy]);

  const fetchLocation = async () => {
    try {
      setLocationError(null);
      const coords = await getCurrentLocation();
      setUserLocation({
        lat: coords.latitude,
        lng: coords.longitude,
      });
    } catch (err: any) {
      const message = err.message || 'Unable to access your location. Please enable location services.';
      setLocationError(message);
      setToastMessage({ 
        message: `${message} - Using ${FALLBACK_LOCATION.name} as fallback`, 
        type: 'info' 
      });
      // Use fallback location after 2 seconds
      setTimeout(() => {
        setUserLocation({
          lat: FALLBACK_LOCATION.lat,
          lng: FALLBACK_LOCATION.lng,
        });
      }, 1500);
    }
  };

  const handleManualLocationSubmit = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (isNaN(lat) || isNaN(lng)) {
      setToastMessage({ message: 'Please enter valid coordinates', type: 'info' });
      return;
    }
    
    setUserLocation({ lat, lng });
    setShowManualLocation(false);
    setLocationError(null);
    setManualLat('');
    setManualLng('');
    setToastMessage({ message: 'Location set successfully!', type: 'success' });
  };

  const fetchNearbyFoods = async () => {
    if (!userLocation) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log('[AvailableFoods] Fetching nearby foods with params:', {
        lat: userLocation.lat,
        lng: userLocation.lng,
        distance: radius,
        category: categoryFilter,
        priceFilter,
        availabilityFilter,
      });

      const response = await api.get('/foods/nearby/search', {
        params: {
          lat: userLocation.lat,
          lng: userLocation.lng,
          distance: radius,
          category: categoryFilter !== 'All' ? categoryFilter : undefined,
          priceRange: priceFilter !== 'All' ? priceFilter : undefined,
          availability: availabilityFilter !== 'All' ? availabilityFilter : undefined,
        },
      });

      console.log('[AvailableFoods] Full API Response:', response);
      console.log('[AvailableFoods] Response Data:', response.data);
      console.log('[AvailableFoods] Foods Array:', response.data.foods);
      console.log('[AvailableFoods] Foods Count:', response.data.foods?.length || 0);

      let sortedFoods = response.data.foods || [];

      console.log('[AvailableFoods] Foods before sorting:', sortedFoods.length);

      // Sort foods
      if (sortBy === 'distance') {
        sortedFoods.sort((a: Food, b: Food) => (a.distanceKm || 0) - (b.distanceKm || 0));
      } else {
        sortedFoods.sort(
          (a: Food, b: Food) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      console.log('[AvailableFoods] Foods after sorting:', sortedFoods.length);
      console.log('[AvailableFoods] Setting foods state with:', sortedFoods);

      setFoods(sortedFoods);
    } catch (err: any) {
      console.error('[AvailableFoods] Error fetching foods:', err);
      console.error('[AvailableFoods] Error response data:', err.response?.data);
      console.error('[AvailableFoods] Error message:', err.message);
      setError(err.response?.data?.message || 'Failed to fetch foods');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestSuccess = () => {
    setToastMessage({ message: 'Food requested successfully!', type: 'success' });
    // Optionally refresh list
    setTimeout(() => fetchNearbyFoods(), 1500);
  };

  const handleFoodDelete = () => {
    // Refresh the list when a food is deleted
    setToastMessage({ message: 'Food deleted', type: 'success' });
    setTimeout(() => fetchNearbyFoods(), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 py-12 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -z-10"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Button */}
        <BackButton />

        {/* Header */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/70 transition-all duration-300 hover:scale-110">
              <MapPin size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                🗺️ Discover Food Near You
              </h1>
              <p className="text-gray-300 text-lg mt-1">
                {userLocation
                  ? `📍 Showing food within ${radius / 1000}km around your location`
                  : '⏳ Getting your location...'}
              </p>
            </div>
          </div>
        </div>

        {/* Location & Filter Controls */}
        <div className="glass-effect rounded-3xl p-8 space-y-6 border border-gray-700/50">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Location Status */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-200 uppercase tracking-wide">📍 Your Location</label>
              {userLocation ? (
                <div className="px-5 py-4 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 flex items-center gap-3 shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all">
                  <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-sm font-semibold text-green-300">
                    {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                  </span>
                </div>
              ) : (
                <div className="px-5 py-4 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/50 flex items-center gap-3 shadow-lg shadow-blue-500/20">
                  <Loader size={16} className="animate-spin text-blue-400" />
                  <span className="text-sm text-blue-300">Getting your location...</span>
                </div>
              )}
            </div>

            {/* Radius Selector */}
            <div className="space-y-3">
              <label htmlFor="radius" className="block text-sm font-bold text-gray-200 uppercase tracking-wide">
                🎯 Search Radius
              </label>
              <select
                id="radius"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full px-5 py-3 rounded-2xl border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/50 outline-none transition-all bg-gray-800/50 text-gray-200 font-medium hover:bg-gray-800 backdrop-blur"
              >
                <option value={1000}>1 km</option>
                <option value={2000}>2 km</option>
                <option value={5000}>5 km</option>
                <option value={10000}>10 km</option>
                <option value={15000}>15 km</option>
              </select>
            </div>
          </div>

          {/* Sort & Refresh */}
          <div className="flex gap-4 pt-6 border-t border-gray-700/50">
            <div className="flex-1">
              <label htmlFor="sort" className="block text-sm font-bold text-gray-200 uppercase tracking-wide mb-3">
                ⚙️ Sort By
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'distance' | 'recent')}
                className="w-full px-5 py-3 rounded-2xl border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/50 outline-none transition-all bg-gray-800/50 text-gray-200 font-medium hover:bg-gray-800 backdrop-blur"
              >
                <option value="distance">📍 Nearest First</option>
                <option value="recent">🕐 Newest First</option>
              </select>
            </div>

            <button
              onClick={() => fetchLocation()}
              className="self-end px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl hover:shadow-lg hover:shadow-blue-500/50 active:scale-95 transition-all flex items-center gap-2 font-bold uppercase tracking-wide shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>

          {/* Advanced Filters */}
          <div className="grid md:grid-cols-3 gap-4 pt-6 border-t border-gray-700/50">
            {/* Category Filter */}
            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-bold text-gray-200 uppercase tracking-wide">
                🍽️ Category
              </label>
              <select
                id="category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/50 outline-none transition-all bg-gray-800/50 text-gray-200 font-medium hover:bg-gray-800 backdrop-blur"
              >
                <option value="All">All Categories</option>
                <option value="Veg">🥕 Veg</option>
                <option value="Non-Veg">🍗 Non-Veg</option>
                <option value="Snacks">🍿 Snacks</option>
                <option value="Meals">🍲 Meals</option>
                <option value="Desserts">🍰 Desserts</option>
              </select>
            </div>

            {/* Price Filter */}
            <div className="space-y-2">
              <label htmlFor="price" className="block text-sm font-bold text-gray-200 uppercase tracking-wide">
                💰 Price
              </label>
              <select
                id="price"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/50 outline-none transition-all bg-gray-800/50 text-gray-200 font-medium hover:bg-gray-800 backdrop-blur"
              >
                <option value="All">All Prices</option>
                <option value="free">🎁 Free</option>
                <option value="paid">💳 Paid</option>
              </select>
            </div>

            {/* Availability Filter */}
            <div className="space-y-2">
              <label htmlFor="availability" className="block text-sm font-bold text-gray-200 uppercase tracking-wide">
                ⏰ Availability
              </label>
              <select
                id="availability"
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/50 outline-none transition-all bg-gray-800/50 text-gray-200 font-medium hover:bg-gray-800 backdrop-blur"
              >
                <option value="All">All Items</option>
                <option value="expiring">⏰ Expiring Soon</option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 pt-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-3 rounded-2xl border border-gray-700/50 backdrop-blur">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/50 hover:shadow-xl hover:scale-105'
                  : 'bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700 shadow-sm'
              }`}
            >
              <Grid size={18} />
              Grid View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform ${
                viewMode === 'map'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/50 hover:shadow-xl hover:scale-105'
                  : 'bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700 shadow-sm'
              }`}
            >
              <MapIcon size={18} />
              Map View
            </button>
          </div>
        </div>

        {/* Location Error Alert */}
        {locationError && (
          <div className="px-6 py-4 rounded-2xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 flex items-start gap-3 shadow-lg shadow-yellow-500/20 backdrop-blur">
            <AlertCircle className="text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="font-bold text-yellow-300">📍 Location Access Required</p>
              <p className="text-sm text-yellow-300/80 mt-1">{locationError}</p>
              <p className="text-xs text-yellow-300/70 mt-2">ℹ️ Using {FALLBACK_LOCATION.name} as fallback. You can still browse nearby food!</p>
              <div className="flex gap-2 mt-3 flex-wrap">
                <button
                  onClick={fetchLocation}
                  className="text-sm font-semibold text-yellow-300 hover:text-yellow-200 underline transition flex items-center gap-1"
                >
                  <RefreshCw size={14} /> Try Again
                </button>
                <button
                  onClick={() => setShowManualLocation(!showManualLocation)}
                  className="text-sm font-semibold text-blue-300 hover:text-blue-200 underline transition"
                >
                  📝 Enter Location Manually
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manual Location Input */}
        {showManualLocation && (
          <div className="px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/50 shadow-lg shadow-blue-500/20 backdrop-blur">
            <p className="font-bold text-blue-300 mb-3">📍 Enter Your Location</p>
            <div className="flex gap-3 flex-col sm:flex-row">
              <input
                type="number"
                placeholder="Latitude (e.g., 28.7041)"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-900/50 border border-blue-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                step="0.0001"
              />
              <input
                type="number"
                placeholder="Longitude (e.g., 77.1025)"
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-900/50 border border-blue-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                step="0.0001"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleManualLocationSubmit}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition"
                >
                  Set
                </button>
                <button
                  onClick={() => {
                    setShowManualLocation(false);
                    setManualLat('');
                    setManualLng('');
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

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
              <div className="w-12 h-12 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-300 font-medium">Finding delicious food near you...</p>
              <p className="text-gray-500 text-sm">Loading {foods.length} foods...</p>
            </div>
          </div>
        )}

        {/* Foods Map View */}
        {!isLoading && viewMode === 'map' && userLocation && foods.length > 0 && (
          <div>
            <GoogleMapView foods={foods} userLocation={userLocation} isLoading={isLoading} />
          </div>
        )}

        {/* Map View - Location Required */}
        {!isLoading && viewMode === 'map' && !userLocation && locationError && (
          <div className="px-4 py-6 rounded-lg bg-yellow-50 border border-yellow-200 flex items-start gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-yellow-800">Cannot Display Map</p>
              <p className="text-sm text-yellow-700 mt-1">{locationError}</p>
              <button
                onClick={() => {
                  setViewMode('grid');
                  fetchLocation();
                }}
                className="mt-2 text-sm font-semibold text-yellow-700 hover:text-yellow-800 underline"
              >
                Switch to Grid View & Try Again
              </button>
            </div>
          </div>
        )}

        {/* Foods Grid */}
        {!isLoading && viewMode === 'grid' && foods.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm text-gray-400 mb-4 font-medium">Found {foods.length} food listing(s)</p>
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
                  onDelete={handleFoodDelete}
                  index={index}
                  currentUserId={user?.id}
                  currentUserRole={user?.role}
                />
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Empty State for Grid - ONLY show when loading is done + no foods + no error */}
        {!isLoading && viewMode === 'grid' && foods.length === 0 && !error && userLocation && (
          <div className="text-center py-12 px-4 glass-effect rounded-3xl border border-gray-700/50 backdrop-blur">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Food Found in Your Area</h3>
            <p className="text-gray-300 mb-6">
              No food listings are available within {radius / 1000}km of your location yet. 
              <br />
              Be the first to share food in your area!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/foods/add"
                className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition duration-300"
              >
                Share Food Now
              </a>
              <button
                onClick={fetchLocation}
                className="inline-block px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition duration-300 flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                Refresh Location
              </button>
            </div>
          </div>
        )}

        {/* Empty State when no location available */}
        {!isLoading && viewMode === 'grid' && foods.length === 0 && !userLocation && !error && (
          <div className="text-center py-12 px-4 glass-effect rounded-3xl border border-gray-700/50 backdrop-blur">
            <div className="text-5xl mb-4">📍</div>
            <h3 className="text-2xl font-bold text-white mb-2">Location Required</h3>
            <p className="text-gray-300 mb-6">
              We need your location to find food near you. Please enable location services.
            </p>
            <button
              onClick={fetchLocation}
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition duration-300"
            >
              Enable Location Access
            </button>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && <Toast message={toastMessage.message} type={toastMessage.type} />}
    </div>
  );
}

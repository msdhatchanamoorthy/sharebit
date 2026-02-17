'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Toast } from '@/components/Toast';
import BackButton from '@/components/BackButton';
import { FormField, FormWrapper } from '@/components/Form';
import { z } from 'zod';
import api from '@/lib/api';
import { getCurrentLocation } from '@/lib/utils';
import { Share2, Loader, AlertCircle } from 'lucide-react';

// Validation schema
const addFoodSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description cannot exceed 1000 characters'),
  quantity: z
    .string()
    .min(2, 'Please specify the quantity')
    .max(100, 'Quantity description cannot exceed 100 characters'),
  category: z
    .string()
    .min(1, 'Please select a category'),
  locationName: z
    .string()
    .min(3, 'Location name must be at least 3 characters')
    .max(200, 'Location name cannot exceed 200 characters'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

type AddFoodForm = Omit<z.infer<typeof addFoodSchema>, 'latitude' | 'longitude'> & {
  latitude: number | null;
  longitude: number | null;
};

const CATEGORY_OPTIONS = [
  { label: 'Vegetables', value: 'Veg' },
  { label: 'Non-Vegetarian', value: 'Non-Veg' },
  { label: 'Snacks', value: 'Snacks' },
  { label: 'Meals', value: 'Meals' },
  { label: 'Desserts', value: 'Desserts' },
];

export default function AddFoodPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [formData, setFormData] = useState<AddFoodForm>({
    title: '',
    description: '',
    quantity: '',
    category: '',
    locationName: '',
    latitude: null,
    longitude: null,
  });
  const [errors, setErrors] = useState<Partial<AddFoodForm>>({});
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showManualCoordinates, setShowManualCoordinates] = useState(false);

  // Default fallback location (New Delhi, India)
  const FALLBACK_LOCATION = { lat: 28.7041, lng: 77.1025, name: 'New Delhi' };

  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Auto-fetch location on mount
    fetchLocation();
  }, [user, router]);

  const fetchLocation = async () => {
    try {
      setLocationLoading(true);
      setLocationError(null);
      const coords = await getCurrentLocation();
      setFormData((prev) => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));
    } catch (err: any) {
      let errorMsg = 'Unable to get your location';
      
      if (err.code === 1) {
        errorMsg = 'Permission denied. Please enable location access in your browser settings.';
      } else if (err.code === 2) {
        errorMsg = 'Location unavailable. Please check your internet connection.';
      } else if (err.code === 3) {
        errorMsg = 'Location request timed out. Please try again.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setLocationError(errorMsg);
      
      // Use fallback location
      setTimeout(() => {
        setFormData((prev) => ({
          ...prev,
          latitude: FALLBACK_LOCATION.lat,
          longitude: FALLBACK_LOCATION.lng,
        }));
      }, 1500);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleChange = (field: keyof Omit<AddFoodForm, 'latitude' | 'longitude'>, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setToastMessage({ message: 'Image must be less than 5MB', type: 'error' });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // PRE-CHECK: Ensure category is selected
      if (!formData.category || formData.category.trim() === '') {
        console.error('[AddFoodPage] Category is empty/not selected');
        setToastMessage({
          message: 'Please select a category for your food',
          type: 'error',
        });
        setErrors({ ...errors, category: 'Please select a category' });
        return;
      }

      // Validate coordinates
      if (formData.latitude === null || formData.longitude === null) {
        setLocationError('Please enable location access');
        return;
      }

      // Clear previous errors
      setErrors({});
      setLocationError(null);

      // Add detailed console logging
      console.log('[AddFoodPage] Form data before validation:', {
        title: formData.title,
        description: formData.description,
        quantity: formData.quantity,
        category: formData.category,
        locationName: formData.locationName,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });

      // Validate form with coordinates
      const validatedData = addFoodSchema.parse({
        ...formData,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });

      console.log('[AddFoodPage] Validation passed, validated data:', validatedData);

      setIsLoading(true);

      // Create FormData for multipart request
      const formDataToSend = new FormData();
      formDataToSend.append('title', validatedData.title);
      formDataToSend.append('description', validatedData.description);
      formDataToSend.append('quantity', validatedData.quantity);
      formDataToSend.append('category', validatedData.category);
      formDataToSend.append('locationName', validatedData.locationName);
      formDataToSend.append('latitude', String(validatedData.latitude));
      formDataToSend.append('longitude', String(validatedData.longitude));

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      // Log what we're sending to backend
      console.log('[AddFoodPage] FormData entries:', {
        title: formDataToSend.get('title'),
        description: formDataToSend.get('description'),
        quantity: formDataToSend.get('quantity'),
        category: formDataToSend.get('category'),
        locationName: formDataToSend.get('locationName'),
        latitude: formDataToSend.get('latitude'),
        longitude: formDataToSend.get('longitude'),
        hasImage: formDataToSend.has('image'),
      });

      // Send to backend
      console.log('[AddFoodPage] Sending POST request to /foods');
      const response = await api.post('/foods', formDataToSend);

      console.log('[AddFoodPage] Backend response:', response.data);

      if (response.data.success) {
        setToastMessage({
          message: 'Food posted successfully!',
          type: 'success',
        });

        setTimeout(() => {
          router.push('/foods/available');
        }, 2000);
      }
    } catch (err: any) {
      console.error('[AddFoodPage] Error caught:', err);

      if (err instanceof z.ZodError) {
        console.error('[AddFoodPage] Validation errors:', err.errors);
        const newErrors: Partial<AddFoodForm> = {};
        err.errors.forEach((error: any) => {
          if (error.path.length > 0) {
            newErrors[error.path[0] as keyof AddFoodForm] = error.message;
          }
        });
        setErrors(newErrors);
        
        // Show which field failed validation
        const failedField = Object.keys(newErrors)[0];
        setToastMessage({
          message: `Validation error: ${newErrors[failedField as keyof AddFoodForm]}`,
          type: 'error',
        });
      } else {
        console.error('[AddFoodPage] Backend error message:', err.response?.data?.message);
        const errorMsg = err.response?.data?.message || 'Failed to post food';
        setToastMessage({
          message: errorMsg,
          type: 'error',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-warm-cream to-brand-100 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Back Button */}
        <BackButton />

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-brand-200/20">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-500 to-warm-orange flex items-center justify-center shadow-lg">
              <Share2 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Share Your Food</h1>
              <p className="text-sm text-gray-600">Help feed your community</p>
            </div>
          </div>

          {/* Form */}
          <FormWrapper
            title=""
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel={isLoading ? 'Posting...' : 'Post Food'}
            description=""
          >
            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Food Image <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <div className="space-y-3">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-brand-300 rounded-lg hover:bg-brand-50 cursor-pointer transition-smooth">
                      <div className="text-center">
                        <span className="text-3xl">📸</span>
                        <p className="text-sm text-gray-600 mt-1">Click to upload or drag & drop</p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Title Field */}
              <FormField
                label="Food Title"
                name="title"
                type="text"
                placeholder="e.g., Homemade Pizza"
                value={formData.title}
                onChange={(value) => handleChange('title', value)}
                error={errors.title as string}
                required
              />

              {/* Description Field */}
              <FormField
                label="Description"
                name="description"
                type="textarea"
                placeholder="Describe your food, ingredients, preparation time, etc."
                value={formData.description}
                onChange={(value) => handleChange('description', value)}
                error={errors.description as string}
                rows={4}
                required
              />

              {/* Quantity Field */}
              <FormField
                label="Quantity"
                name="quantity"
                type="text"
                placeholder="e.g., 2 servings, 1 box, 500g"
                value={formData.quantity}
                onChange={(value) => handleChange('quantity', value)}
                error={errors.quantity as string}
                required
              />

              {/* Category Field */}
              <FormField
                label="Category"
                name="category"
                type="select"
                value={formData.category}
                onChange={(value) => handleChange('category', value)}
                error={errors.category as string}
                options={CATEGORY_OPTIONS}
                required
              />

              {/* Location Name Field */}
              <FormField
                label="Location/Pickup Point"
                name="locationName"
                type="text"
                placeholder="e.g., Central Park, Main Street"
                value={formData.locationName}
                onChange={(value) => handleChange('locationName', value)}
                error={errors.locationName as string}
                required
              />

              {/* Location Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">GPS Location</label>
                {locationError ? (
                  <div className="px-4 py-3 rounded-lg bg-yellow-50 border border-yellow-200 flex items-start gap-3">
                    <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Location Not Available</p>
                      <p className="text-xs text-yellow-700 mt-1">{locationError}</p>
                      <button
                        type="button"
                        onClick={fetchLocation}
                        className="mt-2 text-xs font-semibold text-yellow-700 hover:text-yellow-800 underline"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                ) : locationLoading ? (
                  <div className="px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-2">
                    <Loader size={16} className="animate-spin text-blue-600" />
                    <span className="text-sm text-blue-700">Getting your location...</span>
                  </div>
                ) : formData.latitude && formData.longitude ? (
                  <div className="px-4 py-3 rounded-lg bg-green-50 border border-green-200 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700">✓ Location Detected</p>
                      <p className="text-xs text-green-600 mt-1">
                        {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={fetchLocation}
                      className="text-xs font-semibold text-green-700 hover:text-green-800 underline"
                    >
                      Update
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Info Box */}
              <div className="p-4 rounded-lg bg-brand-50 border border-brand-200/50">
                <p className="text-sm text-brand-800">
                  <span className="font-semibold">💡 Tip:</span> Make sure to fill in an accurate pickup location
                  so people can find your food easily!
                </p>
              </div>
            </div>
          </FormWrapper>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.back()}
              className="text-sm text-brand-600 hover:text-brand-700 underline transition-smooth"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <Toast message={toastMessage.message} type={toastMessage.type} duration={3000} />
      )}
    </div>
  );
}

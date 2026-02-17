'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Toast } from '@/components/Toast';
import { FormField, FormWrapper } from '@/components/Form';
import BackButton from '@/components/BackButton';
import { z } from 'zod';
import api from '@/lib/api';
import { User } from 'lucide-react';

// Validation schema
const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  location: z
    .string()
    .min(3, 'Location must be at least 3 characters')
    .max(100, 'Location cannot exceed 100 characters'),
  bio: z
    .string()
    .max(500, 'Bio cannot exceed 500 characters')
    .optional()
    .default(''),
});

type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>;

export default function UpdateProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileUpdateForm>({
    name: '',
    location: '',
    bio: '',
  });
  const [errors, setErrors] = useState<Partial<ProfileUpdateForm>>({});
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load user data on mount
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setFormData({
      name: user.name || '',
      location: user.location || '',
      bio: user.bio || '',
    });
  }, [user, router]);

  const handleChange = (field: keyof ProfileUpdateForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate form
      const validatedData = profileUpdateSchema.parse(formData);
      setErrors({});

      setIsLoading(true);

      // Send to backend
      const response = await api.put('/auth/profile', validatedData);

      if (response.data.user) {
        updateUser(response.data.user);
        setToastMessage({
          message: 'Profile updated successfully!',
          type: 'success',
        });

        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        // Zod validation errors
        const newErrors: Partial<ProfileUpdateForm> = {};
        err.errors.forEach((error) => {
          if (error.path.length > 0) {
            newErrors[error.path[0] as keyof ProfileUpdateForm] = error.message as any;
          }
        });
        setErrors(newErrors);
      } else {
        // API error
        setToastMessage({
          message: err.response?.data?.message || 'Failed to update profile',
          type: 'error',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('profilePhoto', file);

    try {
      const response = await api.put('/auth/profile-photo', formData);

      if (response.data.user) {
        updateUser(response.data.user);
        setToastMessage({
          message: 'Profile photo updated successfully!',
          type: 'success',
        });
      }
    } catch (err: any) {
      setToastMessage({
        message: err.response?.data?.message || 'Failed to upload profile photo',
        type: 'error',
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-warm-cream to-brand-100 py-12">
      <div className="max-w-md w-full mx-auto px-4 sm:px-6">
        {/* Back Button */}
        <BackButton />

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-brand-200/20">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-500 to-warm-orange flex items-center justify-center shadow-lg">
              <User size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Update Profile</h1>
              <p className="text-sm text-gray-600">Edit your profile information</p>
            </div>
          </div>

          {/* Profile Photo Display */}
          {user.profilePic && (
            <div className="mb-6 flex justify-center">
              <div className="w-24 h-24 rounded-full overflow-hidden shadow-md border-4 border-brand-200">
                <img
                  src={user.profilePic}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Form */}
          <FormWrapper
            title=""
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel={isLoading ? 'Saving...' : 'Save Changes'}
            description=""
          >
            <div className="space-y-5">
              {/* Name Field */}
              <FormField
                label="Full Name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(value) => handleChange('name', value)}
                error={errors.name as string}
                required
              />

              {/* Location Field */}
              <FormField
                label="Location"
                name="location"
                type="text"
                placeholder="City, Country"
                value={formData.location}
                onChange={(value) => handleChange('location', value)}
                error={errors.location as string}
                required
              />

              {/* Bio Field */}
              <FormField
                label="Bio"
                name="bio"
                type="textarea"
                placeholder="Tell us about yourself... (optional)"
                value={formData.bio}
                onChange={(value) => handleChange('bio', value)}
                error={errors.bio as string}
                rows={4}
              />

              {/* Character Count for Bio */}
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Bio character count:</span>
                <span className={formData.bio.length > 450 ? 'text-orange-500' : ''}>
                  {formData.bio.length} / 500
                </span>
              </div>

              {/* Current Info Display */}
              <div className="space-y-2 pt-4 border-t border-brand-200/20">
                <p className="text-xs font-semibold text-gray-600 uppercase">Account Info</p>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Email:</span> {user.email}
                  </p>
                  <p>
                    <span className="font-medium">Member Since:</span>{' '}
                    {new Date(user.id).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Profile Photo Upload */}
              <div className="space-y-2">
                <label htmlFor="profilePhoto" className="block text-sm font-semibold text-gray-700">
                  Profile Photo
                </label>
                <div className="relative">
                  <input
                    id="profilePhoto"
                    name="profilePhoto"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Validate file size (5MB max)
                        if (file.size > 5 * 1024 * 1024) {
                          setToastMessage({
                            message: 'Image must be less than 5MB',
                            type: 'error',
                          });
                          return;
                        }
                        handlePhotoUpload(file);
                      }
                    }}
                    className="w-full px-4 py-2 rounded-lg border-2 border-brand-200 focus:border-brand-500 focus:outline-none transition-smooth cursor-pointer file:cursor-pointer file:bg-brand-50 file:border-0 file:px-3 file:py-1 file:rounded file:text-sm file:font-medium file:text-brand-600"
                  />
                </div>
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

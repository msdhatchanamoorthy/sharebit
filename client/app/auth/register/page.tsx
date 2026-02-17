'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Toast } from '@/components/Toast';
import { FormField, FormWrapper } from '@/components/Form';
import { z } from 'zod';
import api from '@/lib/api';
import { UserPlus, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Validation schema
const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .min(1, 'Password is required'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
  location: z
    .string()
    .min(3, 'Location must be at least 3 characters')
    .max(100, 'Location cannot exceed 100 characters'),
  role: z
    .enum(['user', 'admin'], { errorMap: () => ({ message: 'Please select a role' }) })
    .default('user'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    role: 'user',
  });
  const [errors, setErrors] = useState<Partial<RegisterForm>>({});
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleChange = (field: keyof RegisterForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value as any }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Check passwords match
      if (formData.password !== formData.confirmPassword) {
        setErrors({ confirmPassword: 'Passwords do not match' } as any);
        return;
      }

      // Validate form
      const validatedData = registerSchema.parse(formData);
      setErrors({});

      setIsLoading(true);

      // Send to backend
      const response = await api.post('/auth/register', {
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password,
        location: validatedData.location,
        role: validatedData.role,
      });

      if (response.data.success) {
        // Store token
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Update auth context
        updateUser(response.data.user);

        setToastMessage({
          message: 'Account created successfully! Redirecting...',
          type: 'success',
        });

        // Redirect based on role
        setTimeout(() => {
          if (response.data.user.role === 'admin') {
            router.push('/admin/dashboard');
          } else {
            router.push('/');
          }
        }, 1500);
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const newErrors: Partial<RegisterForm> = {};
        err.errors.forEach((error) => {
          if (error.path.length > 0) {
            newErrors[error.path[0] as keyof RegisterForm] = error.message as any;
          }
        });
        setErrors(newErrors);
      } else {
        const message = err.response?.data?.message || 'Registration failed. Please try again.';
        setToastMessage({
          message,
          type: 'error',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-100 to-orange-100 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-orange-300/30 rounded-full mix-blend-multiply filter blur-3xl"
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transform: 'translate(-50%, -50%)' }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-pink-300/30 rounded-full mix-blend-multiply filter blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transform: 'translate(50%, 50%)' }}
      />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Card */}
        <motion.div
          className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-orange-200/50"
          whileHover={{ boxShadow: '0 24px 48px rgba(0, 0, 0, 0.12)' }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg mx-auto mb-4"
              whileHover={{ rotate: 5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <UserPlus size={32} className="text-white" />
            </motion.div>
            <motion.h1
              className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Get Started
            </motion.h1>
            <motion.p
              className="text-gray-600 text-sm"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              Join the ShareBit community and start sharing
            </motion.p>
          </div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Full Name */}
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

            {/* Email */}
            <FormField
              label="Email Address"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(value) => handleChange('email', value)}
              error={errors.email as string}
              required
            />

            {/* Location */}
            <FormField
              label="📍 Location"
              name="location"
              type="text"
              placeholder="City, Country"
              value={formData.location}
              onChange={(value) => handleChange('location', value)}
              error={errors.location as string}
              required
            />

            {/* Role Selector */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <label className="block text-sm font-semibold text-gray-700">
                Account Type <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'user', label: '👤 User', desc: 'Share & request' },
                  { value: 'admin', label: '⚙️ Admin', desc: 'Manage platform' },
                ].map((option) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => handleChange('role', option.value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-3 rounded-xl border-2 transition-all text-left font-medium ${
                      formData.role === option.value
                        ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-yellow-100 shadow-md'
                        : 'border-gray-200 bg-gray-50 hover:border-orange-300'
                    }`}
                  >
                    <p className="font-semibold text-sm text-gray-800">{option.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{option.desc}</p>
                  </motion.button>
                ))}
              </div>
              {errors.role && (
                <motion.div
                  className="flex items-start gap-2 text-red-600 text-sm"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span>⚠️</span>
                  <span>{errors.role}</span>
                </motion.div>
              )}
            </motion.div>

            {/* Password */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Password <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <motion.input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  whileFocus={{ scale: 1.02 }}
                  className={`w-full px-4 py-3 rounded-2xl border-2 focus:outline-none transition-all pr-12 ${
                    errors.password
                      ? 'border-red-300 focus:border-red-500 bg-red-50'
                      : 'border-slate-200 focus:border-orange-500 bg-white hover:border-slate-300'
                  }`}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </motion.button>
              </div>
              {errors.password && (
                <motion.div
                  className="flex items-start gap-2 text-red-600 text-sm"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span>⚠️</span>
                  <span>{errors.password}</span>
                </motion.div>
              )}
            </motion.div>

            {/* Confirm Password */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                Confirm Password <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <motion.input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  whileFocus={{ scale: 1.02 }}
                  className={`w-full px-4 py-3 rounded-2xl border-2 focus:outline-none transition-all pr-12 ${
                    errors.confirmPassword
                      ? 'border-red-300 focus:border-red-500 bg-red-50'
                      : 'border-slate-200 focus:border-orange-500 bg-white hover:border-slate-300'
                  }`}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </motion.button>
              </div>
              {errors.confirmPassword && (
                <motion.div
                  className="flex items-start gap-2 text-red-600 text-sm"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span>⚠️</span>
                  <span>{errors.confirmPassword}</span>
                </motion.div>
              )}
            </motion.div>

            {/* Info Box */}
            <motion.div
              className="p-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-start gap-2">
                <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800 font-medium">
                  <span className="font-bold">✓ Secure & Private:</span> Your data is encrypted and protected.
                </p>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 uppercase tracking-wide shadow-lg mt-6"
            >
              {isLoading ? (
                <motion.div className="flex items-center gap-2">
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                  Creating Account...
                </motion.div>
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Account
                </>
              )}
            </motion.button>

            {/* Divider */}
            <motion.div
              className="relative my-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </motion.div>

            {/* Login Link */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link
                href="/auth/login"
                className="w-full py-3 rounded-2xl border-2 border-orange-300 text-orange-600 font-bold hover:bg-orange-50 transition-all text-center block hover:shadow-md\"
              >
                Sign In Instead
              </Link>
            </motion.div>
          </motion.form>

          {/* Footer */}
          <motion.p
            className="text-center text-xs text-gray-500 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
          >
            By creating an account, you agree to our{' '}
            <Link href="#" className="text-brand-600 hover:underline">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="#" className="text-brand-600 hover:underline">
              Privacy Policy
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Toast */}
      {toastMessage && (
        <Toast message={toastMessage.message} type={toastMessage.type} duration={3000} />
      )}
    </div>
  );
}

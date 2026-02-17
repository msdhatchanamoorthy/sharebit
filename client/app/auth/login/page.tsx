'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Toast } from '@/components/Toast';
import { FormField, FormWrapper } from '@/components/Form';
import { z } from 'zod';
import api from '@/lib/api';
import { LogIn, Eye, EyeOff, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginForm>>({});
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleChange = (field: keyof LoginForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate form
      const validatedData = loginSchema.parse(formData);
      setErrors({});

      setIsLoading(true);

      // Send to backend
      const response = await api.post('/auth/login', validatedData);

      if (response.data.success) {
        // Store token
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Update auth context
        updateUser(response.data.user);

        setToastMessage({
          message: 'Login successful! Redirecting...',
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
        // Zod validation errors
        const newErrors: Partial<LoginForm> = {};
        err.errors.forEach((error) => {
          if (error.path.length > 0) {
            newErrors[error.path[0] as keyof LoginForm] = error.message as any;
          }
        });
        setErrors(newErrors);
      } else {
        // API error
        const message = err.response?.data?.message || 'Login failed. Please try again.';
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
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-warm-cream to-brand-100 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-brand-200/30 rounded-full mix-blend-multiply filter blur-3xl"
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transform: 'translate(-50%, -50%)' }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-warm-peach/30 rounded-full mix-blend-multiply filter blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
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
          className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-brand-200/30"
          whileHover={{ boxShadow: '0 24px 48px rgba(0, 0, 0, 0.12)' }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-warm-orange flex items-center justify-center shadow-lg mx-auto mb-4"
              whileHover={{ rotate: 5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogIn size={32} className="text-white" />
            </motion.div>
            <motion.h1
              className="text-3xl font-bold bg-gradient-to-r from-brand-600 to-warm-orange bg-clip-text text-transparent mb-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Welcome Back
            </motion.h1>
            <motion.p
              className="text-gray-600 text-sm"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              Sign in to your ShareBit account
            </motion.p>
          </div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Email Field */}
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

            {/* Password Field */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
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
                      : 'border-slate-200 focus:border-brand-500 bg-white hover:border-slate-300'
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

            {/* Remember Me */}
            <motion.div
              className="flex items-center justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <motion.input
                  type="checkbox"
                  defaultChecked
                  whileHover={{ scale: 1.1 }}
                  className="w-4 h-4 rounded border-brand-300 text-brand-500 cursor-pointer"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link href="#" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                Forgot password?
              </Link>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-brand-500 to-warm-orange text-white font-bold hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 uppercase tracking-wide shadow-lg"
            >
              {isLoading ? (
                <motion.div className="flex items-center gap-2">
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                  Signing in...
                </motion.div>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </motion.button>

            {/* Phone Login Option */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
            >
              <Link
                href="/auth/phone"
                className="w-full py-3 rounded-2xl border-2 border-brand-200 bg-brand-50/50 text-brand-600 font-bold hover:bg-brand-100 transition-all text-center block hover:shadow-md flex items-center justify-center gap-2"
              >
                <Phone size={18} />
                Sign in with Phone
              </Link>
            </motion.div>

            {/* Divider */}
            <motion.div
              className="relative my-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
              </div>
            </motion.div>

            {/* Sign Up Link */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link
                href="/auth/register"
                className="w-full py-3 rounded-2xl border-2 border-brand-300 text-brand-600 font-bold hover:bg-brand-50 transition-all text-center block hover:shadow-md"
              >
                Create New Account
              </Link>
            </motion.div>
          </motion.form>

          {/* Footer */}
          <motion.p
            className="text-center text-xs text-gray-500 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            By signing in, you agree to our{' '}
            <Link href="#" className="text-brand-600 hover:underline">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="#" className="text-brand-600 hover:underline">
              Privacy Policy
            </Link>
          </motion.p>
        </motion.div>

        {/* Support Link */}
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-gray-600 text-sm">
            Having trouble?{' '}
            <Link href="#" className="text-brand-600 hover:text-brand-700 font-semibold">
              Contact Support
            </Link>
          </p>
        </motion.div>
      </motion.div>

      {/* Toast */}
      {toastMessage && (
        <Toast message={toastMessage.message} type={toastMessage.type} duration={3000} />
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Toast } from '@/components/Toast';
import { Phone, ArrowRight, Loader, AlertCircle, Check } from 'lucide-react';
import { motion } from 'framer-motion';

type Step = 'phone' | 'otp' | 'profile';

interface PhoneLoginProps {
  onSuccess?: () => void;
  showBackButton?: boolean;
}

export default function PhoneLogin({ onSuccess, showBackButton = true }: PhoneLoginProps) {
  const router = useRouter();
  const { login, updateUser } = useAuth();
  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    location: '',
  });

  // Format phone number with country code
  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // If doesn't start with 91 (India), add it
    if (!cleaned.startsWith('91')) {
      if (cleaned.startsWith('0')) {
        return '+91' + cleaned.substring(1);
      }
      return '+91' + cleaned;
    }
    
    return '+' + cleaned;
  };

  // Step 1: Send OTP
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const formattedNumber = formatPhoneNumber(phoneNumber);
      console.log('[PhoneLogin] Sending OTP to:', formattedNumber);

      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formattedNumber,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('otp');
        setToastMessage({
          message: `OTP sent to ${formattedNumber}. Valid for 5 minutes.`,
          type: 'success',
        });
        console.log('[PhoneLogin] OTP sent successfully');
      } else {
        throw new Error(data.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      console.error('[PhoneLogin] Error sending OTP:', err);
      const errorMessage = err.message || 'Failed to send OTP. Please try again.';
      setError(errorMessage);
      setToastMessage({ message: errorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const formattedNumber = formatPhoneNumber(phoneNumber);
      console.log('[PhoneLogin] Verifying OTP...');

      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formattedNumber,
          otp: otp,
          name: userData.name,
          email: userData.email,
          location: userData.location,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('[PhoneLogin] OTP verified successfully');
        
        // Store token in localStorage
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        // Update auth context
        if (data.token) {
          login(data.token, data.user);
        }

        setToastMessage({
          message: 'Login successful! Redirecting...',
          type: 'success',
        });

        // Redirect after brief delay
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            router.push('/');
          }
        }, 1500);
      } else {
        throw new Error(data.message || 'OTP verification failed');
      }
    } catch (err: any) {
      console.error('[PhoneLogin] Error verifying OTP:', err);
      
      const errorMessage = err.message || 'OTP verification failed. Please try again.';
      setError(errorMessage);
      setToastMessage({ message: errorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const formattedNumber = formatPhoneNumber(phoneNumber);
      console.log('[PhoneLogin] Resending OTP to:', formattedNumber);

      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formattedNumber,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setToastMessage({
          message: 'OTP resent successfully',
          type: 'success',
        });
        setOtp('');
      } else {
        throw new Error(data.message || 'Failed to resend OTP');
      }
    } catch (err: any) {
      console.error('[PhoneLogin] Error resending OTP:', err);
      const errorMessage = err.message || 'Failed to resend OTP';
      setError(errorMessage);
      setToastMessage({ message: errorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4 py-12">
      {/* Animated Background */}
      <motion.div
        className="fixed top-10 left-10 w-72 h-72 bg-orange-400/20 rounded-full mix-blend-multiply filter blur-3xl pointer-events-none"
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="fixed bottom-10 right-10 w-72 h-72 bg-pink-400/20 rounded-full mix-blend-multiply filter blur-3xl pointer-events-none"
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-orange-100/50">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 px-8 py-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Phone size={32} className="text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Phone Login</h1>
            <p className="text-orange-100 text-sm">
              {step === 'phone' && 'Enter your phone number to get started'}
              {step === 'otp' && 'Enter the OTP sent to your phone'}
            </p>
          </div>

          {/* Body */}
          <div className="px-8 py-8 space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
              >
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Step 1: Phone Number */}
            {step === 'phone' && (
              <motion.form
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handlePhoneSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-600 font-semibold">+91</span>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phoneNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setPhoneNumber(val);
                        setError(null);
                      }}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                      maxLength={10}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Enter a 10-digit number</p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !phoneNumber}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 'otp' && (
              <motion.form
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleOtpSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setOtp(val);
                      setError(null);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition text-center text-2xl tracking-widest font-mono"
                    maxLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-2">Check your SMS for the 6-digit code</p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Login
                      <Check size={18} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                    setError(null);
                  }}
                  className="w-full text-orange-600 hover:text-orange-700 py-2 font-semibold"
                >
                  Change Phone Number
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Didn't receive the code?{' '}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-orange-600 hover:text-orange-700 font-semibold disabled:text-orange-400"
                    >
                      Resend OTP
                    </button>
                  </p>
                </div>
              </motion.form>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => router.push('/auth/register')}
                className="text-orange-600 hover:text-orange-700 font-semibold"
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>

        {/* Back Button */}
        {showBackButton && (
          <button
            onClick={() => router.back()}
            className="mt-4 text-center text-gray-600 hover:text-gray-800 font-semibold"
          >
            ← Back
          </button>
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && <Toast message={toastMessage.message} type={toastMessage.type} />}
    </div>
  );
}

'use client';

import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'user' | 'admin';
  fallbackPath?: string;
}

/**
 * ProtectedRoute Component
 * Protects routes based on authentication and optional role requirements
 * 
 * @param children - Components to render if authorized
 * @param requiredRole - Optional role requirement ('user' or 'admin')
 * @param fallbackPath - Path to redirect to if not authorized (default: '/auth/login')
 * 
 * @example
 * // Protect route for authenticated users
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 * 
 * @example
 * // Protect route for admin only
 * <ProtectedRoute requiredRole="admin" fallbackPath="/dashboard">
 *   <AdminDashboard />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  requiredRole,
  fallbackPath = '/auth/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    React.useEffect(() => {
      router.push(fallbackPath);
    }, [router, fallbackPath]);
    return null;
  }

  // Check role requirement if specified
  if (requiredRole && user.role !== requiredRole) {
    React.useEffect(() => {
      // Redirect admin users trying to access user routes to /admin
      if (user.role === 'admin' && requiredRole === 'user') {
        router.push('/admin');
      } 
      // Redirect regular users trying to access admin routes to /dashboard
      else if (user.role === 'user' && requiredRole === 'admin') {
        router.push('/dashboard');
      }
      // Otherwise redirect to fallback path
      else {
        router.push(fallbackPath);
      }
    }, [router, requiredRole, user.role, fallbackPath]);
    return null;
  }

  return <>{children}</>;
}

export default ProtectedRoute;

'use client';

import React, { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface RoleBasedLayoutProps {
  children: ReactNode;
}

/**
 * RoleBasedLayout Component
 * Automatically redirects users to appropriate dashboard based on role
 * - Admins → /admin
 * - Regular users → /dashboard
 * 
 * @param children - Layout content
 * 
 * @example
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <RoleBasedLayout>
 *           {children}
 *         </RoleBasedLayout>
 *       </body>
 *     </html>
 *   );
 * }
 */
export function RoleBasedLayout({ children }: RoleBasedLayoutProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // Don't redirect if already on auth pages
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath.startsWith('/auth');
      const isProfilePage = currentPath.startsWith('/profile');
      const isSettingsPage = currentPath.startsWith('/settings');
      
      if (isAuthPage || isProfilePage || isSettingsPage) {
        return;
      }

      // Redirect based on role
      if (user && !isAuthPage) {
        if (user.role === 'admin' && !currentPath.startsWith('/admin')) {
          // Admins should go to admin dashboard
          if (currentPath === '/') {
            router.push('/admin');
          }
        } else if (user.role === 'user' && !currentPath.startsWith('/dashboard')) {
          // Regular users should go to user dashboard
          if (currentPath === '/') {
            router.push('/dashboard');
          }
        }
      }
    }
  }, [user, isLoading, router]);

  return <>{children}</>;
}

export default RoleBasedLayout;

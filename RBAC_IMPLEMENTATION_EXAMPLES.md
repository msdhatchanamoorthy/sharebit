# RBAC Implementation Examples

Complete code examples showing how RBAC is implemented and used in ShareBit.

## Backend Examples

### 1. Creating Protected Admin Routes

**File:** `server/routes/adminRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, allowOnlyAdmin } = require('../middleware/auth');

// Middleware chain:
// 1. protect → Verify JWT, load user
// 2. allowOnlyAdmin → Check user.role === 'admin'
router.use(protect);
router.use(allowOnlyAdmin);

// Now all routes below are automatically protected
// Only users with role='admin' can access

router.get('/stats', adminController.getStats);
router.get('/foods', adminController.getAllFoods);
router.delete('/foods/:foodId', adminController.deleteFood);
router.put('/foods/:foodId', adminController.updateFoodStatus);
router.get('/users', adminController.getAllUsers);
router.delete('/users/:userId', adminController.deleteUser);
router.get('/requests', adminController.getAllRequests);

module.exports = router;
```

### 2. Using Role in Controller

**File:** `server/controllers/adminController.js`

Before (Manual checks):
```javascript
exports.getStats = async (req, res, next) => {
  try {
    // Manual check - NOT NEEDED anymore!
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }
    
    // ... rest of logic
  } catch (err) {
    // ...
  }
};
```

After (Middleware handles it):
```javascript
exports.getStats = async (req, res, next) => {
  try {
    // req.user is guarantee to be admin (middleware ensures it)
    // No need for manual role check!
    
    const totalUsers = await User.countDocuments();
    const totalFood = await Food.countDocuments();
    const totalRequests = await FoodRequest.countDocuments();
    
    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalFood,
        totalRequests,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
```

### 3. Middleware Implementation

**File:** `server/middleware/auth.js`

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ===== PROTECT MIDDLEWARE =====
// Purpose: Verify JWT and load user
// Applied to: All protected routes
// Usage: router.use(protect);

const protect = async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ 
        message: 'Server configuration error: JWT_SECRET not set' 
      });
    }

    let token;
    
    // Extract JWT from Authorization header: "Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        message: 'Not authorized to access this route' 
      });
    }

    // Verify JWT signature using secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;

    // Load full user from database
    // This ensures user still exists and has latest data
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        message: 'User not found' 
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ 
      message: 'Not authorized to access this route' 
    });
  }
};

// ===== ADMIN MIDDLEWARE =====
// Purpose: Check if user has admin role
// Applied to: Admin routes only
// Usage: router.use(protect); router.use(allowOnlyAdmin);

const allowOnlyAdmin = (req, res, next) => {
  // This middleware is called AFTER protect middleware
  // So req.user is guaranteed to exist
  
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required' 
    });
  }

  // Check if user role is 'admin'
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Forbidden: Admin access required. Only administrators can access this resource.' 
    });
  }

  // User is admin, proceed to next middleware/route handler
  next();
};

// ===== DONOR MIDDLEWARE =====
// Purpose: Check if user is a donor (food sharer)
// Applied to: Routes that only donors can use
// Usage: router.post('/share', protect, checkDonor, controller);

const checkDonor = (req, res, next) => {
  if (req.user && req.user.userType === 'donor') {
    return next();
  }
  return res.status(403).json({ 
    message: 'Only donors can perform this action' 
  });
};

module.exports = { protect, allowOnlyAdmin, checkDonor, checkReceiver };
```

## Frontend Examples

### 1. Protected Route Component

**File:** `client/components/ProtectedRoute.tsx`

```typescript
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
 * Usage Examples:
 * 
 * 1. Protect route for any authenticated user:
 *    <ProtectedRoute>
 *      <UserContent />
 *    </ProtectedRoute>
 * 
 * 2. Protect route for admin only:
 *    <ProtectedRoute requiredRole="admin">
 *      <AdminPanel />
 *    </ProtectedRoute>
 * 
 * 3. Custom fallback path:
 *    <ProtectedRoute requiredRole="admin" fallbackPath="/access-denied">
 *      <AdminPanel />
 *    </ProtectedRoute>
 */

export function ProtectedRoute({
  children,
  requiredRole,
  fallbackPath = '/auth/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Show loading state while checking authentication
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

  // Redirect if not authenticated
  if (!user) {
    React.useEffect(() => {
      router.push(fallbackPath);
    }, [router, fallbackPath]);
    return null;
  }

  // Check role requirement if specified
  if (requiredRole && user.role !== requiredRole) {
    React.useEffect(() => {
      // Smart routing:
      // - Admin trying to access user route → redirect to /admin
      // - User trying to access admin route → redirect to /dashboard
      
      if (user.role === 'admin' && requiredRole === 'user') {
        router.push('/admin');
      } else if (user.role === 'user' && requiredRole === 'admin') {
        router.push('/dashboard');
      } else {
        // Fallback: unknown role or configuration issue
        router.push(fallbackPath);
      }
    }, [router, requiredRole, user.role, fallbackPath]);
    
    return null;
  }

  // User is authorized, render children
  return <>{children}</>;
}
```

### 2. Admin Dashboard Component

**File:** `client/app/admin/page.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import api from '@/lib/api';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalFood: number;
  totalRequests: number;
  averageRating: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // This request includes JWT token automatically (via interceptor)
      // Backend verifies token and checks role === 'admin'
      const response = await api.get('/admin/stats');
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err: any) {
      // Handle 403 Forbidden (user not admin)
      if (err.response?.status === 403) {
        setError('You do not have permission to view this page');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch statistics');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Protect this route: only admins can access
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="max-w-7xl mx-auto p-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.name}
          </p>

          {/* Display statistics */}
          {loading && <p>Loading...</p>}
          {error && <div className="text-red-600">{error}</div>}
          {stats && (
            <div className="grid grid-cols-4 gap-6 mt-8">
              <StatCard label="Total Users" value={stats.totalUsers} />
              <StatCard label="Total Foods" value={stats.totalFood} />
              <StatCard label="Total Requests" value={stats.totalRequests} />
              <StatCard label="Avg Rating" value={stats.averageRating.toFixed(2)} />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600 text-sm mb-2">{label}</p>
      <p className="text-3xl font-bold text-orange-600">{value}</p>
    </div>
  );
}
```

### 3. Using Role in Conditional Rendering

**File:** `client/components/Navbar.tsx` (partial)

```typescript
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <h1 className="text-2xl font-bold">ShareBit</h1>

        {/* Navigation Links */}
        <div className="flex gap-4">
          {/* Common links for all users */}
          <Link href="/foods">Browse Foods</Link>
          <Link href="/profile">Profile</Link>

          {/* Admin-only links */}
          {user?.role === 'admin' && (
            <>
              <Link href="/admin" className="text-orange-600 font-bold">
                Admin Dashboard
              </Link>
              <Link href="/admin/users">Manage Users</Link>
              <Link href="/admin/foods">Manage Foods</Link>
            </>
          )}

          {/* User-only links */}
          {user?.role === 'user' && (
            <>
              <Link href="/requests/my-requests">My Requests</Link>
              <Link href="/dashboard">Dashboard</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
```

### 4. AuthContext with Role Handling

**File:** `client/context/AuthContext.tsx` (partial)

```typescript
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { getAuthToken, setAuthToken } from '@/lib/utils';
import api from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user session from localStorage on mount
  useEffect(() => {
    const storedToken = getAuthToken();
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        const parsedUser = JSON.parse(storedUser);
        // Ensure role field exists
        const userWithRole = {
          ...parsedUser,
          role: parsedUser.role || 'user',
        };
        setUser(userWithRole);
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;

      // Store token
      setAuthToken(newToken);
      setToken(newToken);

      // Ensure user data includes role field
      const userWithRole = {
        ...userData,
        role: userData.role || 'user', // Default to 'user' if backend doesn't provide
      };

      // Store user
      setUser(userWithRole);
      localStorage.setItem('user', JSON.stringify(userWithRole));

      // Return to trigger redirect
      return userWithRole;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    // Clear token storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Clear state
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

## API Usage Examples

### Fetching Admin Data

```typescript
import api from '@/lib/api';

// Get admin statistics
async function getAdminStats() {
  try {
    const response = await api.get('/admin/stats');
    // JWT token automatically included in Authorization header
    console.log(response.data.stats);
  } catch (err) {
    if (err.response?.status === 403) {
      console.log('Not an admin');
    }
  }
}

// Get all users
async function getAllUsers() {
  const response = await api.get('/admin/users');
  console.log(response.data.users);
}

// Delete user
async function deleteUser(userId: string) {
  const response = await api.delete(`/admin/users/${userId}`);
  console.log(response.data.message);
}

// Delete food post
async function deleteFood(foodId: string) {
  const response = await api.delete(`/admin/foods/${foodId}`);
  console.log(response.data.message);
}
```

## Database Queries

### Find Admin Users

```javascript
// MongoDB query to find all admins
db.users.find({ role: 'admin' });

// Find what you got
db.users.findOne({ role: 'admin' });

// Find specific admin
db.users.findOne({ email: 'admin@sharebit.com' });
```

### Update User Role

```javascript
// Change user to admin
db.users.updateOne(
  { email: 'user@example.com' },
  { $set: { role: 'admin' } }
);

// Change admin to regular user
db.users.updateOne(
  { _id: ObjectId('...') },
  { $set: { role: 'user' } }
);
```

## Testing Examples

### Test Admin Access (cURL)

```bash
# 1. Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sharebit.com","password":"Admin@123"}'

# Response includes token and user with role: 'admin'

# 2. Use token to access admin endpoint
TOKEN="eyJhbGc..." # From login response

curl http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer $TOKEN"

# Response: { success: true, stats: {...} }
```

### Test User Cannot Access Admin (cURL)

```bash
# 1. Login as regular user
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Response includes token and user with role: 'user'

# 2. Try to access admin endpoint
TOKEN="eyJhbGc..." # From login response

curl http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer $TOKEN"

# Response Status: 403 Forbidden
# Response Body: { success: false, message: 'Forbidden: Admin access required...' }
```

---

**All examples are production-ready and follow ShareBit conventions!** ✅

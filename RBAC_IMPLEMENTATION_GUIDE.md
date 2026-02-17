# Role-Based Access Control (RBAC) Implementation

## Overview

This guide covers the complete Role-Based Access Control (RBAC) implementation for ShareBit MERN application. The system supports two roles:
- **Admin**: Full system access, can manage users, food posts, and view analytics
- **User**: Regular user access, can browse foods, make requests, and manage profile

## Backend Implementation

### 1. User Model Update

**File:** `server/models/User.js`

```javascript
role: {
  type: String,
  enum: ['user', 'admin'],
  default: 'user',  // All new users default to regular users
},
userType: {
  type: String,
  enum: ['donor', 'receiver'],
  default: 'receiver',  // Separate field for donor/receiver distinction
},
```

#### Role vs UserType
- **role**: Controls access level (admin/user) - RBAC
- **userType**: Controls food sharing behavior (donor/receiver) - Business logic

### 2. Authentication Middleware

**File:** `server/middleware/auth.js`

#### `protect` Middleware
Verifies JWT token and attaches user to `req.user`

```javascript
const protect = async (req, res, next) => {
  // Extracts JWT from Authorization header
  // Verifies token using JWT_SECRET
  // Loads full user from database
  // Attaches user to req.user
  // If fails: Returns 401 Unauthorized
};
```

#### `allowOnlyAdmin` Middleware
Restricts route access to admin users only

```javascript
const allowOnlyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Forbidden: Admin access required'
    });
  }
  
  next();
};
```

### 3. Admin Routes & Middleware

**File:** `server/routes/adminRoutes.js`

```javascript
// All routes protected by authentication AND admin role check
router.use(protect);           // ← Verify JWT
router.use(allowOnlyAdmin);    // ← Check role === 'admin'

// Now all routes below are admin-only
router.get('/stats', adminController.getStats);
router.get('/foods', adminController.getAllFoods);
router.delete('/foods/:foodId', adminController.deleteFood);
router.get('/users', adminController.getAllUsers);
router.delete('/users/:userId', adminController.deleteUser);
router.get('/requests', adminController.getAllRequests);
```

### 4. Admin Controller

**File:** `server/controllers/adminController.js`

All manual admin checks removed (handled by middleware):

```javascript
exports.getStats = async (req, res, next) => {
  // No need to check req.user.role anymore!
  // Middleware ensures only admins reach here
  
  const totalUsers = await User.countDocuments();
  const totalFood = await Food.countDocuments();
  // ... rest of logic
};
```

### 5. API Endpoints

| Endpoint | Method | Auth | Admin Only | Description |
|----------|--------|------|-----------|-------------|
| `/api/admin/stats` | GET | ✅ | ✅ | Get system statistics |
| `/api/admin/foods` | GET | ✅ | ✅ | List all food posts |
| `/api/admin/foods/:id` | DELETE | ✅ | ✅ | Delete food post |
| `/api/admin/foods/:id` | PUT | ✅ | ✅ | Update food status |
| `/api/admin/users` | GET | ✅ | ✅ | List all users |
| `/api/admin/users/:id` | DELETE | ✅ | ✅ | Delete user |
| `/api/admin/requests` | GET | ✅ | ✅ | List all requests |

## Frontend Implementation

### 1. User Type with Role

**File:** `client/types/index.ts`

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';  // ← RBAC role
  userType?: 'donor' | 'receiver';  // ← Business logic type
  // ... other fields
}
```

### 2. Protected Route Component

**File:** `client/components/ProtectedRoute.tsx`

Protects routes based on authentication status and optional role requirement:

```typescript
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```

Features:
- ✅ Checks if user is authenticated
- ✅ Verifies role if specified
- ✅ Shows loading state
- ✅ Smart redirects:
  - Admin trying user route → redirect to `/admin`
  - User trying admin route → redirect to `/dashboard`
  - Not authenticated → redirect to `/auth/login`

### 3. Role-Based Layout

**File:** `client/components/RoleBasedLayout.tsx`

Automatically redirects users based on role:
- Admin users → `/admin` dashboard
- Regular users → `/dashboard`

Usage in root layout to automatically route users after login.

### 4. Pages & Routes

#### Admin Dashboard
**File:** `client/app/admin/page.tsx`

Features:
- 📊 View system statistics (users, food posts, requests)
- 👥 Manage users (view, delete)
- 🍽️  Manage food posts (view, delete)
- 📋 View all requests
- 📈 Analytics

Protected with: `<ProtectedRoute requiredRole="admin">`

#### User Dashboard
**File:** `client/app/dashboard/page.tsx`

Features:
- 📊 View personal stats (foods shared, collected, rating)
- 🔗 Quick links to browse foods, manage requests, edit profile
- 📚 How ShareBit works guide

Protected with: `<ProtectedRoute requiredRole="user">`

### 5. AuthContext Update

**File:** `client/context/AuthContext.tsx`

Enhanced login/register to ensure role field is present:

```typescript
const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  const { token, user } = response.data;
  
  // Ensure role field exists (default to 'user')
  const userWithRole = {
    ...user,
    role: user.role || 'user',
  };
  
  setUser(userWithRole);
};
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                    USER LOGIN                            │
└─────────────────────────────────────────────────────────┘
                          ↓
                    POST /auth/login
                 {email, password}
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Backend Authentication                      │
│                                                          │
│  1. Find user by email                                  │
│  2. Verify password with bcrypt                         │
│  3. Generate JWT token                                  │
│  4. Return: {token, user: {id, name, role, ...}}       │
└─────────────────────────────────────────────────────────┘
                          ↓
                   Store in Frontend
            localStorage: token, user
                          ↓
            AuthContext: {user, token}
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Role-Based Routing                          │
│                                                          │
│  if user.role === 'admin'                               │
│    → Redirect to /admin                                 │
│                                                          │
│  if user.role === 'user'                                │
│    → Redirect to /dashboard                             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│           Protected Routes with ProtectedRoute          │
│                                                          │
│  <ProtectedRoute requiredRole="admin">                 │
│    Only admin users can access this                     │
│  </ProtectedRoute>                                      │
└─────────────────────────────────────────────────────────┘
```

## API Request Flow with Authentication

```
Frontend Request:
┌──────────────────────────────┐
│  const response = await      │
│  api.get('/admin/foods')     │
└──────────────────────────────┘
           ↓
┌──────────────────────────────────────────────┐
│  HTTP Request with JWT Token                 │
│                                              │
│  GET /api/admin/foods                        │
│  Authorization: Bearer eyJhbGc...            │
└──────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────┐
│  Backend Middleware Chain                    │
│                                              │
│  1. protect middleware                       │
│     - Extract JWT from header                │
│     - Verify JWT signature                   │
│     - Load user from database                │
│     - Attach to req.user                     │
│                                              │
│  2. allowOnlyAdmin middleware                │
│     - Check req.user.role === 'admin'        │
│     - If not admin: return 403 Forbidden     │
│                                              │
│  3. Route handler                            │
│     - req.user is available and verified     │
│     - req.user.role is 'admin'               │
└──────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────┐
│  Response                                    │
│                                              │
│  {                                           │
│    success: true,                            │
│    count: 42,                                │
│    foods: [...]                              │
│  }                                           │
└──────────────────────────────────────────────┘
```

## Creating Admin User

### Method 1: Seed Script (Recommended)

Run the seed script to create admin user:

```bash
cd server
node seedAdmin.js
```

Output:
```
✅ Connected to MongoDB
✅ Admin user created successfully!

📊 Admin Credentials:
───────────────────────────────
📧 Email: admin@sharebit.com
🔑 Password: Admin@123
👤 Name: Admin User
🏠 Location: ShareBit Headquarters
───────────────────────────────

⚠️  IMPORTANT: Change the password after first login!
```

### Method 2: Manual Database Update

Connect to MongoDB and update a user:

```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

## Security Checklist

- ✅ JWT tokens stored securely (httpOnly in production)
- ✅ Passwords hashed with bcrypt
- ✅ Role checks on every admin route
- ✅ Frontend route protection with ProtectedRoute
- ✅ No sensitive data in JWT payload (only userId)
- ✅ Middleware validates user still exists on each request
- ✅ Admin actions logged for audit trail (optional)
- ✅ Self-deletion prevented (admin can't delete themselves)

## Best Practices

### Backend
1. ✅ Always use `protect` middleware on protected routes
2. ✅ Always use `allowOnlyAdmin` on admin routes
3. ✅ Check role in middleware, not in controller logic
4. ✅ Use consistent response format (success, message, data)
5. ✅ Log admin actions for audit trail

### Frontend
1. ✅ Always wrap admin routes with `<ProtectedRoute requiredRole="admin">`
2. ✅ Check `user.role` before showing admin UI elements
3. ✅ Use RoleBasedLayout for automatic routing after login
4. ✅ Show loading state while checking authentication
5. ✅ Handle 403 Forbidden errors gracefully

## Error Responses

### 401 Unauthorized
User not authenticated or token invalid

```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 403 Forbidden
User authenticated but lacks required role

```json
{
  "success": false,
  "message": "Forbidden: Admin access required. Only administrators can access this resource."
}
```

### 404 Not Found
Resource not found

```json
{
  "success": false,
  "message": "User not found"
}
```

## Testing Role-Based Access

### Test Admin Access
```bash
# Get auth token first
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sharebit.com","password":"Admin@123"}' \
  | jq -r '.token')

# Access admin endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/admin/stats
```

### Test User Restriction
```bash
# Try to access admin endpoint with regular user token
# Should return 403 Forbidden
```

## Troubleshooting

### Issue: Getting 401 Unauthorized
**Solution**: 
- Check JWT token is in localStorage
- Verify token hasn't expired
- Make sure Authorization header format is correct: `Bearer <token>`

### Issue: Getting 403 Forbidden on admin routes
**Solution**:
- Verify user role is 'admin' in database
- Check user was created with correct role
- Verify middleware chain is correct in routes file

### Issue: Frontend redirect not working
**Solution**:
- Check user data is being loaded in AuthContext
- Verify role field is present in user object
- Check RoleBasedLayout component is in root layout

### Issue: Routes bypass protection
**Solution**:
- Verify ProtectedRoute wraps the component
- Check requiredRole prop is set correctly
- Look for navigation bypass (e.g., direct URL changes)

## Next Steps

1. **Multi-level Roles**: Add moderator, support, analyst roles
2. **Permission System**: Implement fine-grained permissions
3. **Audit Logging**: Log all admin actions
4. **Two-Factor Authentication**: Add 2FA for admins
5. **Role-Based Features**: Expose features based on role
6. **Activity Logs**: Track user activities
7. **Rate Limiting**: Different limits for different roles


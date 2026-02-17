# API JSON Parsing Error - Complete Fix Guide

**Error:** `Unexpected token '<', '<!DOCTYPE...' is not valid JSON`

This error occurs when the frontend expects JSON but receives HTML (usually an error page from the server).

## ✅ Fixes Applied in This Session

### Backend Improvements

#### 1. **Error Middleware Enhanced** (`server/middleware/error.js`)
- ✅ Added `Content-Type: application/json` header
- ✅ Added detailed error logging with request path, status, and stack trace
- ✅ Proper error formatting for all error types

#### 2. **Server Logging Added** (`server/server.js`)
- ✅ Request logging middleware that logs all incoming requests
- ✅ Response status logging with timestamps
- ✅ Global `Content-Type: application/json` middleware
- ✅ Enhanced 404 handler with better error messages
- ✅ Improved error handler order (404 before error middleware)

#### 3. **Auth Middleware Enhanced** (`server/middleware/auth.js`)
- ✅ Added console logging for token verification
- ✅ Better error responses with `success: false` field
- ✅ Log warnings when no token provided
- ✅ Detailed error messages for debugging

#### 4. **Notification Controller Enhanced** (`server/controllers/notificationController.js`)
- ✅ Added logging for all notification operations
- ✅ Returns `success: true/false` in responses
- ✅ Better error handling

### Frontend Improvements

#### 1. **Fixed Direct Fetch Calls** (`client/components/FoodCard.tsx`)
- ✅ Replaced direct `fetch()` with axios `api` instance
- ✅ Now uses configured API URL with proper headers
- ✅ Added detailed console logging at each step
- ✅ Better error extraction from response

#### 2. **Enhanced API Interceptor** (`client/lib/api.ts`)
- ✅ Added request logging with HTTP method and URL
- ✅ Response logging with status code
- ✅ Detects HTML responses instead of JSON
- ✅ Logs detailed error information
- ✅ Added logging to notification methods
- ✅ Better error messages with full error object

## 🔍 Verification Checklist

Run through these steps to verify everything is working:

### Step 1: Verify Backend is Running

```bash
# In terminal, check if backend is listening on port 5000
# Windows:
netstat -ano | findstr :5000

# Or manually test:
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "message": "Server is running"
}
```

### Step 2: Check Frontend API URL Configuration

In browser console (F12), run:
```javascript
// Check if API URL is configured correctly
console.log(process.env.NEXT_PUBLIC_API_URL);
```

Should output: `http://localhost:5000/api` (or your configured URL)

### Step 3: Monitor Server Logs

**Terminal where backend is running:**
```
[2024-02-14T10:30:15.123Z] GET /api/health - 200
[2024-02-14T10:30:16.456Z] POST /api/foods/123/request - 201
[Auth] Token verified for user: abc123def456
[getNotifications] Fetching notifications for user: abc123def456
```

Look for these log patterns to confirm operations are working.

### Step 4: Monitor Browser Console

**In browser (F12 → Console tab):**

When making a food request, you should see:
```
[API] POST /foods/65a1234abc/request - 201
[FoodCard] Requesting food: 65a1234abc
[FoodCard] Request successful: {success: true, request: {...}, notification: {...}}
[requestFood] Creating request for food: 65a1234abc
```

If you see HTML errors instead, the backend is down or route doesn't exist.

### Step 5: Test Each Endpoint

#### Test Authentication
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456","location":"TestCity"}'
```

Expected: `"success": true` JSON response with status 201

#### Test Notifications (after login)
```bash
curl -X GET http://localhost:5000/api/notifications/unread/count \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected: `{"success": true, "unreadCount": 0}` JSON response with status 200

#### Test Food Request
```bash
curl -X POST http://localhost:5000/api/foods/FOOD_ID/request \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

Expected: `{"success": true, "message": "Food requested successfully", ...}` with status 201

## 🐛 Common Issues and Solutions

### Issue 1: "Unexpected token '<'"

**Cause:** Frontend receiving HTML instead of JSON

**Solution:**
1. Check if backend server is running: `node d:\ShareBit\server\server.js`
2. Check backend logs for errors
3. Verify `NEXT_PUBLIC_API_URL` in browser console
4. Check if route exists in the backend

**Debug Steps:**
```javascript
// In browser console, test direct fetch:
fetch('http://localhost:5000/api/health')
  .then(r => r.text())
  .then(t => console.log('Response:', t))
  .catch(e => console.error('Error:', e))
```

### Issue 2: "401 Unauthorized"

**Cause:** Token missing, invalid, or expired

**Solution:**
1. Check if token is in localStorage:
   ```javascript
   console.log(localStorage.getItem('token'));
   ```
2. Make sure you're logged in
3. Check if JWT_SECRET is set in `.env`
4. Token expires after 7 days (check if valid)

### Issue 3: "404 Route not found"

**Cause:** Backend route doesn't exist or wrong URL

**Solution:**
1. Verify route exists in backend:
   - Check `server/routes/foodRoutes.js` for `/request` endpoint
   - Check `server/routes/notificationRoutes.js` for all endpoints
2. Verify API URL is correct (should end with `/api`)
3. Check if typo in frontend API call

### Issue 4: "400 Bad Request"

**Cause:** Invalid request data or validation error

**Solution:**
1. Check browser console for error message
2. Verify all required fields are provided
3. Check MongoDB connection
4. Review server logs for detailed error

### Issue 5: Backend Running but Frontend Can't Connect

**Possible Causes:**
- CORS not enabled (fixed in backend)
- API URL wrong
- Port mismatch (backend on 5000, but requesting different port)
- Firewalls blocking connection

**Debug:**
```javascript
// Test CORS by checking response headers
fetch('http://localhost:5000/api/health')
  .then(r => {
    console.log('CORS Headers:', {
      'access-control-allow-origin': r.headers.get('access-control-allow-origin'),
      'content-type': r.headers.get('content-type')
    });
    return r.json();
  })
```

## 📋 Response Format Reference

All API responses now follow this pattern:

### Success Response (2xx)
```json
{
  "success": true,
  "data": {...}
}
```

### Error Response (4xx, 5xx)
```json
{
  "success": false,
  "message": "Error description"
}
```

### Status Codes Used
- `200 OK` - Successful read operation
- `201 Created` - Successful creation
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## 🚀 Testing the Complete Flow

### Step-by-Step Test: John Requests Will's Food

1. **Start both servers:**
   ```bash
   # Terminal 1: Backend
   cd d:\ShareBit\server
   node server.js
   
   # Terminal 2: Frontend
   cd d:\ShareBit\client
   npm run dev
   ```

2. **Sign up Will:**
   - Go to `/auth/register`
   - Register as "Will Smith" with email "will@test.com"
   - Note: This creates a new user

3. **Create a Food Post (as Will):**
   - Click "Share Food"
   - Create post "Will's Pizza"
   - Submit POST request to `/api/foods`
   - Copy the `foodId` from response

4. **Logout and Sign up John:**
   - Logout (clear localStorage)
   - Register as "John Doe" with email "john@test.com"

5. **Request Will's Food (as John):**
   - Go to Food Feed
   - Find "Will's Pizza"
   - Click "Request" button
   - **Console should show:** `[FoodCard] Request successful: {success: true, ...}`
   - Food card button should change to "Requested"

6. **Logout and Login as Will:**
   - Logout
   - Login as "will@test.com"
   - Check Notification Bell in navbar
   - **Expected:** Red badge showing "1"
   - Click bell to see "John requested your food: Will's Pizza"

## 📊 Log Output Examples

### Successful Request Flow

**Frontend Console:**
```
[API] POST /foods/65a1234abc/request - 201
[FoodCard] Requesting food: 65a1234abc
[FoodCard] Request successful: {request: {...}, notification: {...}}
```

**Backend Console:**
```
[2024-02-14T10:30:16.456Z] POST /api/foods/65a1234abc/request
[Auth] Token verified for user: john123
[2024-02-14T10:30:16.456Z] POST /api/foods/65a1234abc/request - 201
```

### Failed Request Flow

**Frontend Console:**
```
[API] POST /foods/65a1234abc/request - 400
[FoodCard] Request error - Full error: Error: You already have a pending request for this food
[getNotifications] Error: Failed to fetch notifications
```

**Backend Console:**
```
[2024-02-14T10:30:20.123Z] POST /api/foods/65a1234abc/request
[Auth] Token verified for user: john123
[Error Handler] POST /api/foods/65a1234abc/request
[Error Handler] Status: 400
[Error Handler] Message: You already have a pending request for this food
```

## ✅ Final Verification

After all fixes, you should see:

1. ✅ No "Unexpected token '<'" errors
2. ✅ All API responses are valid JSON
3. ✅ Server logs show request/response with status codes
4. ✅ Browser console shows detailed API operations
5. ✅ Food requests successfully create notifications
6. ✅ Notifications appear in bell for food owner
7. ✅ All error messages are in JSON format
8. ✅ No HTML error pages in API responses

## 🆘 If Issues Persist

1. **Clear All Cache:**
   ```bash
   # Frontend
   rm -r d:\ShareBit\client\.next
   npm run dev
   
   # Backend
   npm install  # Reinstall dependencies
   node server.js
   ```

2. **Check Environment Variables:**
   - Verify `MONGODB_URI` is set in `.env`
   - Verify `JWT_SECRET` is set in `.env`
   - Verify `NEXT_PUBLIC_API_URL` is set in `.env.local`

3. **Check MongoDB:**
   ```bash
   # If using local MongoDB
   mongod
   
   # Test connection
   mongo mongodb://localhost:27017/sharebite
   ```

4. **Enable Full Debug Mode:**
   - Restart both servers with NODE_ENV=development
   - Check all console logs
   - Enable browser DevTools network tab to see all requests

5. **Create a Test Entry:**
   - Using MongoDB directly or backend UI
   - Create a test food entry
   - Manually test all CRUD operations

## 📞 Support Information

All responses now include:
- Proper HTTP status codes
- JSON format (no HTML)
- Clear error messages
- Detailed server logging
- Client-side request/response logging

Check both server console and browser console for detailed debugging information.

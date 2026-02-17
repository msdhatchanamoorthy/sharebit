# API Error Fix - Verification Checklist

**Date:** February 14, 2026
**Status:** ✅ All Fixes Applied

## Quick Start: Test In This Order

### 1. Start Both Servers (2 minutes)

**Terminal 1 - Backend:**
```bash
cd d:\ShareBit\server
node server.js
```

Expected output:
```
✅ MongoDB connected successfully
✅ Server is running on port 5000
```

**Terminal 2 - Frontend:**
```bash
cd d:\ShareBit\client
npm run dev
```

Expected output:
```
✅ > Local: http://localhost:5173
✅ NetWork: [Network URL]
```

**Check Terminal 1 shows:**
```
[TIMESTAMP] GET /api/health - 200
```

---

### 2. Verify Environment Configuration (1 minute)

In browser console (press F12), paste and run:

```javascript
// Check API URL
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

// Should output: http://localhost:5000/api
```

✅ Must show: `http://localhost:5000/api`

❌ If different, check `client/.env.local` file

---

### 3. Test Health Endpoint (1 minute)

Browser console, run:
```javascript
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Health Check:', d))
  .catch(e => console.error('❌ Error:', e))
```

Expected:
```
✅ Health Check: {message: "Server is running"}
```

Server terminal should show:
```
[TIMESTAMP] GET /api/health - 200
```

---

### 4. Test User Registration (2 minutes)

1. Open app at `http://localhost:5173`
2. Go to "Sign Up"
3. Fill form:
   - Name: `Will Smith`
   - Email: `will@test.com`
   - Password: `test123`
   - Location: `New York`
4. Click "Sign Up"

✅ Should see success page with token

❌ If error, check browser console for JSON response

**What's happening:**
- Frontend sends: `POST /api/auth/register` with user data
- Backend creates user and returns token
- Frontend stores token in localStorage

**Server terminal should show:**
```
[TIMESTAMP] POST /api/auth/register - 201
```

**Browser console should show:**
```
[API] POST /auth/register - 201
```

---

### 5. Verify Login (1 minute)

1. Logout (click Profile → Logout)
2. Login with Will's credentials:
   - Email: `will@test.com`
   - Password: `test123`

✅ Should redirect to feed page

Server terminal:
```
[TIMESTAMP] POST /api/auth/login - 200
```

Browser console:
```
[Auth] Token verified for user: [ID]
```

---

### 6. Create a Food Post (2 minutes)

1. Click "Share Food" button
2. Fill form:
   - Title: `Will's Delicious Pizza`
   - Description: `Fresh homemade pizza`
   - Category: Select any
   - Upload image (optional)
3. Click "Post"

✅ Post appears in feed

✅ Server shows:
```
[TIMESTAMP] POST /api/foods - 201
```

**Copy the food ID for next step!**
- Check browser console for: `{success: true, food: {_id: 'COPY_THIS', ...}}`

---

### 7. Logout and Create John Account (2 minutes)

1. Logout
2. Sign up new user:
   - Name: `John Doe`
   - Email: `john@test.com`
   - Password: `test123`
   - Location: `Los Angeles`

✅ Login successful

---

### 8. REQUEST FOOD - Main Test (3 minutes)

**This is the critical test! This triggers the JSON error if something is wrong.**

1. Go to Food Feed (you're logged in as John)
2. Find "Will's Delicious Pizza"
3. Click "Request" button

### ✅ SUCCESS Criteria:

**Browser Console Should Show:**
```
[API] POST /foods/[ID]/request - 201
[FoodCard] Requesting food: [ID]
[FoodCard] Request successful: {
  success: true,
  request: {...},
  notification: {...}
}
```

**Server Terminal Should Show:**
```
[TIMESTAMP] POST /api/foods/[ID]/request
[Auth] Token verified for user: [ID]
[TIMESTAMP] POST /api/foods/[ID]/request - 201
```

**Button Should Change To:**
- ✅ "Requested" (disabled state)
- ✅ Red or neutral color (not clickable)

❌ **If you see HTML error:**
```
Unexpected token '<', '<!DOCTYPE...' is not valid JSON
```

This means:
1. ❌ Backend is NOT running - Start backend server
2. ❌ Backend crashed - Check terminal for errors
3. ❌ Wrong API URL - Check NEXT_PUBLIC_API_URL
4. ❌ Route doesn't exist - Backend missing `/api/foods/:foodId/request`

---

### 9. Verify Notification Created (2 minutes)

1. Logout
2. Login as Will:
   - Email: `will@test.com`
   - Password: `test123`

3. **Look at Navbar - Notification Bell**

✅ **Red badge with number "1"** (one unread notification)

4. Click the bell icon

✅ **Dropdown appears showing:**
```
John Doe
requested your food: Will's Delicious Pizza
[Delete button]
```

**Browser Console Shows:**
```
[getUnreadCount] Fetching unread count for user: [ID]
[getUnreadCount] Unread count: 1
[getNotifications] Fetching notifications for user: [ID]
[getNotifications] Received 1 notifications
```

**Server Terminal Shows:**
```
[TIMESTAMP] GET /api/notifications/unread/count - 200
[TIMESTAMP] GET /api/notifications - 200
[getUnreadCount] Unread count: 1
[getNotifications] Fetching notifications for user: [ID]
```

---

## ✅ Verification Matrix

### Complete Success Example

| # | Operation | Frontend | Backend | Result |
|---|-----------|----------|---------|--------|
| 1 | Health Check | 200 JSON | ✅ Logged | ✅ PASS |
| 2 | Register Will | 201 JSON | ✅ Created user | ✅ PASS |
| 3 | Login Will | 200 JSON | ✅ Token verified | ✅ PASS |
| 4 | Post Food | 201 JSON | ✅ Post created | ✅ PASS |
| 5 | Logout/Login John | 200 JSON | ✅ Token verified | ✅ PASS |
| 6 | **Request Food** | **201 JSON** | **✅ Request + Notification** | **✅ PASS** |
| 7 | Logout/Login Will | 200 JSON | ✅ Token verified | ✅ PASS |
| 8 | Get Notifications | 200 JSON | ✅ Returned list | ✅ PASS |
| 9 | Unread Count | 200 JSON | ✅ Count: 1 | ✅ PASS |

---

## 🐛 Troubleshooting During Verification

### Problem: "Unexpected token '<'"

**Step 1:** Is backend running?
```bash
# Check if port 5000 is listening
netstat -ano | findstr :5000
```

✅ If yes, go to Step 2
❌ If no, start backend: `node d:\ShareBit\server\server.js`

**Step 2:** Check backend logs
- Look at Terminal 1 (backend)
- Should show request logs
- Any errors will be displayed

✅ If errors shown, fix them
❌ If no logs, backend might be down

**Step 3:** Test directly
```bash
curl http://localhost:5000/api/health
```

✅ Should return JSON
❌ If error, backend not responding

### Problem: "401 Unauthorized"

**Always check:**
1. Are you logged in? (Check profile button)
2. Token in localStorage? Run in console:
   ```javascript
   console.log(localStorage.getItem('token'));
   ```
3. JWT_SECRET set? Backend needs this in .env

### Problem: "404 Route not found"

**Check routes exist:**
1. Food request route: `d:\ShareBit\server\routes\foodRoutes.js` line 39
2. Notification routes: `d:\ShareBit\server\routes\notificationRoutes.js` lines 13-16

Should have these lines:
```javascript
router.post('/:foodId/request', protect, requestFood);
router.get('/', protect, getNotifications);
router.get('/unread/count', protect, getUnreadCount);
```

### Problem: "Cannot GET /api/..."

Backend route order or missing import.

**Check:**
1. Route defined in routes file
2. Route imported in server.js
3. app.use() called for that route
4. Clear order: GET / → GET /unread/count → PUT/:id → DELETE/:id

---

## 📊 Log Examples for Reference

### Successful Request (What You Should See)

**Browser Console:**
```
[API] POST /foods/65a1234567890abc123/request - 201
[FoodCard] Requesting food: 65a1234567890abc123
[FoodCard] Request successful: {
  success: true, 
  message: "Food requested successfully",
  request: {_id: "...", status: "pending", ...},
  notification: {_id: "...", message: "..."}
}
```

**Server Console:**
```
[2024-02-14T10:30:16.456Z] POST /api/foods/65a1234567890abc123/request
[Auth] Token verified for user: 64a0989876543210abc
Request Food Created Successfully
[2024-02-14T10:30:16.789Z] POST /api/foods/65a1234567890abc123/request - 201
```

### Failed Request (What NOT to See)

❌ **Browser Console Error 1:**
```
Unexpected token '<', '<!DOCTYPE...' is not valid JSON
```
**Cause:** Backend returning HTML (server down or 404)

❌ **Browser Console Error 2:**
```
[API Error] 401 Unauthorized
```
**Cause:** Token missing or expired

❌ **Browser Console Error 3:**
```
[API Error] 400 You already have a pending request for this food
```
**Cause:** Validation error (expected, not a bug)

---

## 🎯 Final Checklist

- [ ] Backend running (`node server.js` shows "Server is running on port 5000")
- [ ] Frontend running (`npm run dev` shows "Local: http://localhost:5173")
- [ ] API Health check returns JSON (no HTML)
- [ ] Register Will works (page shows success)
- [ ] Can create food post
- [ ] Register John works
- [ ] John can request Will's food WITHOUT JSON error
- [ ] Browser shows `[FoodCard] Request successful` in console
- [ ] Server shows `POST /api/foods/.../request - 201`
- [ ] Logout and login as Will
- [ ] Notification bell shows red badge "1"
- [ ] Click bell shows notification from John
- [ ] No HTML errors in any console logs
- [ ] All API responses are valid JSON

---

## ✅ All Tests Passing?

**CONGRATULATIONS!** Your API is fixed. You can now:

1. ✅ Deploy to production
2. ✅ Test with multiple users
3. ✅ Add more features
4. ✅ Scale the application

**Before Deploying:**
- Create `.env.production` with production values
- Test with real MongoDB (not localhost)
- Update NEXT_PUBLIC_API_URL for production domain
- Enable HTTPS for production

---

## Need Help?

Check these files for configuration:

1. **Frontend API URL:** `client/.env.local` - should have `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
2. **Backend Config:** `server/.env` - should have MongoDB URI and JWT_SECRET
3. **Routes:** `server/routes/notificationRoutes.js` - verify route order
4. **Controllers:** `server/controllers/foodController.js` line 327 - verify requestFood function

All these have been optimized in this session. Everything should work!

---

**Last Updated:** February 14, 2026
**Session:** JSON Error Fix and Complete API Hardening

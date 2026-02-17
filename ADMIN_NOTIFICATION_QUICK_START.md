# Admin & Notification System - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Server running: `node server/server.js`
- Client running: `npm run dev` (in client folder)

---

## Step 1: Create/Access Admin Account (1 min)

### Option A: Using Existing Admin
If a seed script created an admin already:
```email: admin@sharebit.com
password: admin123
```

### Option B: Create New Admin (Manual)
1. Go to `http://localhost:3000/auth/register`
2. Register a new account
3. In MongoDB, find this user and update:
   ```javascript
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```

---

## Step 2: Login as Admin (30 sec)
1. Navigate to `http://localhost:3000/auth/login`
2. Enter admin credentials
3. **Automatic Redirect:** You'll be redirected to `http://localhost:3000/admin`

---

## Step 3: Explore Admin Dashboard (2 min)

### Overview Tab
- ✅ View total users, foods, requests
- ✅ See average rating
- 📊 Statistics display

### Users Tab
- ✅ List of all platform users
- ✅ View name, email, location, rating
- ✅ Delete button (red) for each user

### Foods Tab
- ✅ **NEW:** Food images display as thumbnails
- ✅ List of all food posts
- ✅ View title, owner, location, status
- ✅ Delete button for each post

---

## Step 4: Test Notifications (2 min)

### A. Create a Food Post (as regular user)
1. Logout as admin
2. Login as regular user (or register new account)
3. Go to `/foods/add`
4. Share a food item
5. Note the food ID

### B. Create a Request (as different user)
1. Logout
2. Login as a different user
3. Navigate to `/foods/available`
4. Find the food posted in Step A
5. Click "Request" button

### C. See Notification (as food owner)
1. Logout
2. Login as the food owner (from Step A)
3. **Look at navbar:** Bell icon shows `1` unread notification
4. **Click bell:** Dropdown opens showing notification
5. **Message:** "Someone requested your food: [Food Title]"

### D. Interact with Notification
- **Click notification:** Marked as read (blue highlight disappears)
- **Hover notification:** Delete button appears (red trash icon)
- **Click delete:** Notification removed

---

## 🧪 Test Scenarios

### Scenario 1: Multi-User Notification
1. User A: Share a pizza 🍕
2. User B: Request the pizza
3. User C: Request the same pizza
4. User A should see 2 notifications

### Scenario 2: Admin Management
1. Login as admin
2. Go to Users tab
3. Delete a regular user
4. Deleted user's food posts also removed

### Scenario 3: Notification Cleanup
1. Create 10 food requests (as different users)
2. Go to notification bell
3. Delete notifications one by one
4. At end, notification bell shows no badge

---

## 📍 Key URLs

| Name | URL |
|------|-----|
| Home | `http://localhost:3000/` |
| Admin Dashboard | `http://localhost:3000/admin` |
| Find Food | `http://localhost:3000/foods/available` |
| Share Food | `http://localhost:3000/foods/add` |
| Profile | `http://localhost:3000/profile/update` |
| Login | `http://localhost:3000/auth/login` |
| Register | `http://localhost:3000/auth/register` |

---

## 🔍 What to Look For

### Verification Points ✅

1. **JWT Token Includes Role**
   - Open DevTools → Application → Cookies
   - Look for token or localStorage
   - Token should decode to: `{ id, role }`

2. **Middleware Protection**
   - Try accessing `/admin` as regular user
   - Should redirect to `/dashboard`

3. **Notification Creation**
   - Make a food request
   - Check MongoDB: `db.notifications.find({})`
   - New notification document appears

4. **Image Display**
   - Go to `/admin`
   - Click "Food Posts" tab
   - Food images show as small rectangles

5. **Real-Time Updates**
   - Open notification bell as one user
   - Make request as different user
   - First user's unread count updates in ~5 seconds

---

## 🐛 Troubleshooting

### Issue: Admin page shows 404
**Solution:** 
- Verify user role: Check MongoDB user document has `role: "admin"`
- Verify JWT includes role: Check server logs during login
- Try logout/login again

### Issue: Notification bell not showing
**Solution:**
- Verify you're logged in (check navbar for logout button)
- Clear browser cache: `Ctrl+Shift+Delete`
- Restart client: `npm run dev`

### Issue: Images not showing in admin panel
**Solution:**
- Verify server has `/uploads` folder
- Check server logs for upload errors
- Verify image path: Should be `uploads/filename.jpg`
- Try restarting server and clearing browser cache

### Issue: Notifications not appearing
**Solution:**
- Verify notification API is working:
  ```bash
  curl http://localhost:5000/api/notifications \
    -H "Authorization: Bearer YOUR_JWT_TOKEN"
  ```
- Check MongoDB: `db.notifications.find()`
- Verify Socket.io connection in browser console

### Issue: Can't delete notifications
**Solution:**
- Verify user is logged in
- Check browser console for errors
- Verify API endpoint: `DELETE /api/notifications/{id}`

---

## 📱 Browser DevTools Tests

### Check JWT Token
```javascript
// In browser console
const user = JSON.parse(localStorage.getItem('user'));
console.log(user.role); // Should output 'admin' or 'user'
```

### Monitor Notifications API
1. Open DevTools → Network tab
2. Click on notification bell
3. Watch for: `GET /api/notifications`
4. Response should contain array of notifications

### Check Socket.io Connection
1. Open DevTools → Console
2. Look for: "Socket.io connected" or similar message
3. Verify notification real-time updates

---

## ⚡ Performance Tips

1. **Notification Refresh Rate**
   - Currently: Every 30 seconds
   - More frequent = More battery drain
   - Adjust in `NotificationBell.tsx` line 26

2. **Admin Dashboard Loading**
   - First load fetches all users/foods
   - Subsequent tabs use cache
   - Refresh page to reload data

3. **Image Optimization**
   - Thumbnails are only 12x12px
   - Use WebP format for faster loading
   - Consider compression for production

---

## 🔐 Security Validation

### Admin Route Protection
```bash
# Should return 403 Forbidden
curl http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer USER_TOKEN"

# Should return 200 OK
curl http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Data Visibility
- Users can only see notifications for themselves
- Admin can see all users but can't modify passwords
- Deleted users' data is cleaned up

---

## 📊 Expected Results

### After Following Steps 1-4
- ✅ Can login as admin
- ✅ See admin dashboard with stats
- ✅ View users and foods in tables
- ✅ See food images in admin panel
- ✅ Create notification by requesting food
- ✅ See unread count in navbar bell
- ✅ Open and read notifications
- ✅ Delete notifications

### Time Estimate: **5-10 minutes total**

---

## 🎉 You're Done! 

All admin and notification features are working correctly. The system is ready for:
- Multi-user testing
- Production deployment
- Advanced feature development

---

## 📞 Support

For issues or questions:
1. Check MongoDB connection
2. Verify server is running on port 5000
3. Verify client is running on port 3000
4. Check browser console for errors
5. Review PHASE_5_ADMIN_NOTIFICATION_COMPLETE.md documentation

---

*Last Updated: Today*
*System Version: Phase 5 Complete*

# Cross-User Request & Notification System - Testing Guide

## 🧪 Complete Testing Procedures

Follow this guide to test and verify the entire cross-user request and notification system.

---

## ✅ Pre-Testing Checklist

- [ ] Server is running on port 5000: `node server/server.js`
- [ ] Client is running on port 3000: `npm run dev`
- [ ] MongoDB is connected and accessible
- [ ] Two browser windows/profiles ready (or use incognito)
- [ ] Network tab open in DevTools to monitor API calls

---

## 🎬 End-to-End Test: John Requests Will's Pizza

### Test Duration: ~10 minutes

### Test Setup: Create Two Accounts

#### Step 1A: Create Will's Account
```
Browser/Window 1
1. Navigate to http://localhost:3000/auth/register
2. Fill form:
   - Name: Will
   - Email: will@test.com
   - Password: test123
   - Location: San Francisco (or select from map)
3. Click "Get Started" / "Register"
4. ✓ Should see home page or dashboard
5. ✓ Check localStorage has user data with "will@test.com"
```

**Terminal View:**
```
Server logs should show:
POST /api/auth/register 201
```

#### Step 1B: Create John's Account
```
Browser/Window 2 (or Incognito)
1. Navigate to http://localhost:3000/auth/register
2. Fill form:
   - Name: John
   - Email: john@test.com
   - Password: test123
   - Location: San Francisco (same or nearby)
3. Click "Get Started" / "Register"
4. ✓ Should see home page or dashboard
5. ✓ Check localStorage has user data with "john@test.com"
```

---

### Test Phase 1: Will Creates Food Post

#### Step 2: Will Creates Pizza Post
```
Browser/Window 1 (Will's Account)
1. Click "Share Food" button in navbar
   OR navigate to http://localhost:3000/foods/add
2. Fill the form:
   - Title: "Homemade Pizza"
   - Description: "Fresh cheese pizza, just made today"
   - Upload Image: Select any image file
   - Location: Click map and select location
   - (optional) Category: "Meals"
   - (optional) Quantity: "1 Box"
3. Click "Share" / "Post Food"
4. Wait for upload...
5. ✓ Should be redirected to home or food list
6. ✓ Toast shows "Food shared successfully" or similar
```

**Verify in DevTools:**
```
Network Tab:
- POST /api/foods 201 Created
- Response should have _id, title, location, status: "available"

MongoDB Check:
db.foods.findOne({ title: "Homemade Pizza" })
Should return the food document with ownerId = Will's ID
```

#### Step 3: Find the Food URL
```
Browser/Window 1
1. Go to http://localhost:3000/foods/available
   OR navigate to "Find Food" link
2. Scroll and find "Homemade Pizza"
3. Note the URL or ID (from browser address bar or network tab)
   If card links to /foods/{id}
4. Verify:
   - Food image shows
   - Title: "Homemade Pizza"
   - Owner: "Will"
   - Status badge: "Available" (green)
   - "Request" button is visible
```

---

### Test Phase 2: John Requests Food

#### Step 4: John Navigates to Foods
```
Browser/Window 2 (John's Account)
1. Navigate to http://localhost:3000/foods/available
   OR click "Find Food" in navbar
2. Wait for foods to load
3. Scroll and find "Homemade Pizza" by Will
4. Verify FoodCard shows:
   ✓ Food image
   ✓ Title: "Homemade Pizza"
   ✓ Owner: "Will"
   ✓ Location
   ✓ "Request" button (blue, clickable)
```

**Verify in DevTools:**
```
Network Tab:
- GET /api/foods 200 OK
- Should return array of foods including Will's pizza

Console Check:
Should see no errors
```

#### Step 5: John Clicks Request Button
```
Browser/Window 2 (John's Account)
1. Locate the "Homemade Pizza" card
2. Click "Request" button
3. Watch for:
   ✓ Button becomes disabled or shows loading state
   ✓ Toast notification appears: "Food requested successfully!" (green)
   ✓ Button text changes to "Requested" or becomes disabled
4. Wait 2 seconds
5. Refresh the page (F5)
6. ✓ Button should still show "Requested" (state persisted)
```

**Verify in DevTools:**
```
Network Tab:
- POST /api/foods/{foodId}/request 201 Created
- Response should include:
  {
    "success": true,
    "message": "Food requested successfully",
    "request": {...},
    "notification": {
      "id": "...",
      "message": "Someone requested your food: Homemade Pizza",
      "type": "request"
    }
  }

MongoDB Check:
db.foodrequests.findOne({ requesterId: john_id })
Should return:
{
  foodId: pizza_id,
  requesterId: john_id,
  ownerId: will_id,
  status: "pending"
}

db.notifications.findOne({ recipientId: will_id })
Should return:
{
  recipientId: will_id,
  senderId: john_id,
  foodId: pizza_id,
  type: "request",
  message: "Someone requested your food: Homemade Pizza",
  isRead: false
}
```

---

### Test Phase 3: Will Receives Notification

#### Step 6: Will's Notification Bell Updates
```
Browser/Window 1 (Will's Account)
1. Look at the navbar (top right area)
2. Find the Notification Bell icon (🔔)
3. ✓ Should show red badge with "1" (one unread)

IMPORTANT: If bell doesn't show:
- Refresh page (F5)
- Wait 5 seconds (for 30s poll to complete)
- Check console for errors: F12 → Console
- Verify logged in (token in localStorage)

Expected: Badge appears with red background and "1" inside
```

**Verify in DevTools:**
```
Network Tab (at load):
- GET /api/notifications/unread/count 200 OK
- Response: { "success": true, "unreadCount": 1 }

Application Tab:
- localStorage['user'] should have Will's email
- localStorage['token'] should have JWT token
```

#### Step 7: Will Clicks Notification Bell
```
Browser/Window 1 (Will's Account)
1. Click the Notification Bell icon 🔔
2. Wait for dropdown to appear (smooth animation)
3. ✓ Should see:
   - Header: "Notifications" (orange/red background)
   - Notification item with:
     - Icon: 📦 (package icon for request)
     - Sender: "John"
     - Message: "Someone requested your food: Homemade Pizza"
     - Food title: on "Homemade Pizza"
     - Blue highlight/background (unread)
     - Trash icon (hidden, appears on hover)
```

**Verify in DevTools:**
```
Network Tab:
- GET /api/notifications?limit=20&skip=0 200 OK
- Response should include:
  {
    "success": true,
    "notifications": [
      {
        "_id": "notif_id",
        "message": "Someone requested your food: Homemade Pizza",
        "type": "request",
        "isRead": false,
        "senderId": {
          "name": "John",
          "profilePhoto": "..."
        },
        "foodId": {
          "title": "Homemade Pizza"
        }
      }
    ],
    "total": 1
  }
```

---

### Test Phase 4: Will Marks Notification as Read

#### Step 8: Will Clicks Notification
```
Browser/Window 1 (Will's Account)
1. Dropdown should still be open
2. Click on the notification item
3. Watch for:
   ✓ Blue highlight disappears (changes to normal white/gray)
   ✓ Little blue dot disappears from text
   ✓ Badge on bell changes from "1" to "0"
   ✓ Notification is still visible (not deleted)
```

**Verify in DevTools:**
```
Network Tab:
- PUT /api/notifications/{notif_id}/read 200 OK
- Response: { "success": true, "notification": { "isRead": true } }

After completion:
- Bell badge should show "0" or disappear
- Notification should NOT have blue tint
```

#### Step 9: Verify Read State Persists
```
Browser/Window 1 (Will's Account)
1. Close the notification dropdown (click elsewhere)
2. Click bell again
3. ✓ Notification should still be there
4. ✓ Should NOT have blue highlight (gray background)
5. ✓ Badge should show "0"
```

---

### Test Phase 5: Will Deletes Notification

#### Step 10: Delete Notification
```
Browser/Window 1 (Will's Account)
1. Open notification dropdown again
2. Hover over the notification item
3. ✓ Trash icon should appear (red color)
4. Click trash icon
5. Watch for:
   ✓ Notification disappears from list
   ✓ "No notifications yet" message appears (if only one)
   ✓ Badge updates to "0" or disappears
```

**Verify in DevTools:**
```
Network Tab:
- DELETE /api/notifications/{notif_id} 200 OK
- Response: { "success": true }

MongoDB Check:
db.notifications.find({ recipientId: will_id })
Should return empty array []
```

#### Step 11: Verify Empty State
```
Browser/Window 1 (Will's Account)
1. Notification list should show:
   ✓ Bell icon
   ✓ Text: "No notifications yet"
2. Close dropdown
3. Bell badge should show "0" or be invisible
```

---

## 🔄 Extended Tests

### Test 6: Multiple Requests from Different Users

#### Setup: Create Third Account (Tom)
```
Browser/Window 3
1. Register new account:
   - Name: Tom
   - Email: tom@test.com
   - Password: test123
2. Navigate to /foods/available
3. Find Will's pizza (still available)
4. Click "Request"
5. ✓ Success message
```

#### Will's Notifications Should Update
```
Browser/Window 1 (Will's Account)
1. Bell badge should show "2" (two unread)
2. Click bell
3. ✓ Should see two notifications:
   - From John: "Someone requested your food"
   - From Tom: "Someone requested your food"
4. Mark John's as read
5. ✓ Badge becomes "1"
6. Delete Tom's
7. ✓ Badge becomes "0"
```

---

### Test 7: Own Food Cannot Be Requested

#### Setup: Will Tries to Request Own Pizza
```
Browser/Window 1 (Will's Account)
1. Navigate to /foods/available
2. Find Will's "Homemade Pizza"
3. Check "Request" button
4. ✓ Should be DISABLED or hidden (owner can't request own food)

If button is clickable:
1. Click "Request"
2. ✓ Should see error: "You cannot request your own food"
3. ✓ Network tab should show 400 Bad Request
```

---

### Test 8: Duplicate Requests

#### Setup: John Tries to Request Same Food Again
```
Browser/Window 2 (John's Account)
1. Go to /foods/available
2. Find pizza (should show "Requested" status)
3. Hover/check button state
4. If button still clickable:
   - Click "Request" again
   - ✓ Should see error: "You already have a pending request..."
   - ✓ Network: 400 Bad Request

If button disabled:
- ✓ Good! State properly reflected
```

---

### Test 9: Food Status Changes

#### Verify Food Status After Request
```
Browser/Window 1 (Will's Account)
1. Go to /foods/available
2. Find "Homemade Pizza"
3. ✓ Status badge should change from "Available" to "Requested"
4. FoodCard styling should update

MongoDB Check:
db.foods.findOne({ title: "Homemade Pizza" })
Should show: status: "requested", requestedBy: john_id
```

---

## 🔐 Security Tests

### Test 10: Unauthorized Access

#### Try to Access Notifications Without JWT
```bash
# In terminal, without token
curl http://localhost:5000/api/notifications
# ✓ Should return 401 Unauthorized
# ✓ Message: "Not authorized, token failed"
```

#### Try to Mark Someone Else's Notification as Read
```
Setup:
1. Get notification ID from Will's account
2. In John's browser, open console:
   
   fetch('http://localhost:5000/api/notifications/{will_notif_id}/read', {
     method: 'PUT',
     headers: { 'Authorization': `Bearer ${localStorage.token}` }
   })
   
3. ✓ Should return 403 Forbidden or success only if DB checks owner
```

---

## 📊 All Test Cases Summary

| # | Test | Expected | Status |
|---|------|----------|--------|
| 1 | Create Will's account | ✓ Registered | [ ] Pass |
| 2 | Create John's account | ✓ Registered | [ ] Pass |
| 3 | Will creates food | ✓ Food posted | [ ] Pass |
| 4 | John finds food | ✓ Visible in list | [ ] Pass |
| 5 | John requests food | ✓ 201 Created | [ ] Pass |
| 6 | Will gets badge | ✓ Badge shows "1" | [ ] Pass |
| 7 | Will sees notification | ✓ Dropdown shows message | [ ] Pass |
| 8 | Will marks as read | ✓ Badge → "0" | [ ] Pass |
| 9 | Will deletes notification | ✓ Removed from list | [ ] Pass |
| 10 | Multiple requests | ✓ Badge shows "2" | [ ] Pass |
| 11 | Own food blocked | ✓ Request fails | [ ] Pass |
| 12 | Duplicate blocked | ✓ Request fails | [ ] Pass |
| 13 | Status updates | ✓ "Requested" shown | [ ] Pass |
| 14 | Unauthorized fails | ✓ 401 error | [ ] Pass |

---

## 🐛 Troubleshooting

### Issue: Notification Bell Not Showing

**Causes & Solutions:**

```
❌ Problem: Bell doesn't appear in navbar
✓ Solution 1: Verify you're logged in
  - Check: localStorage.getItem('token')
  - Should return JWT string

✓ Solution 2: Check NotificationBell is imported
  - File: client/components/Navbar.tsx
  - Should have: import { NotificationBell } from './NotificationBell';
  - Should render: <NotificationBell />

✓ Solution 3: Check console for errors
  - F12 → Console
  - Look for red errors
  - Common: "Cannot find module" or React errors

✓ Solution 4: Refresh and wait
  - F5 (hard refresh)
  - Wait 5 seconds for API to load
  - Check Network tab for /notifications/unread/count
```

### Issue: Notification Not Appearing After Request

```
❌ Problem: Request succeeds but no notification in dropdown
✓ Solution 1: Verify request was created
  - MongoDB: db.foodrequests.find()
  - Should show request from John to Will

✓ Solution 2: Verify notification was created
  - MongoDB: db.notifications.find()
  - Should show notification with recipientId = Will's ID

✓ Solution 3: Check recipient ID
  - Will's ID might not be matching
  - Food ownerId should equal notification recipientId

✓ Solution 4: Refresh and wait
  - F5 hard refresh
  - Wait for 30-second poll to complete
  - Or click bell to manually fetch

✓ Solution 5: Check server logs
  - Should show: POST /api/foods/{id}/request 201
  - Should show: GET /api/notifications 200
```

### Issue: Button Not Showing "Requested" State

```
❌ Problem: After clicking Request, button doesn't update
✓ Solution 1: Check request success
  - DevTools → Network tab
  - POST /api/foods/{id}/request
  - Should be 201 Created

✓ Solution 2: Refresh page
  - State might not persist without page refresh
  - F5 to refresh
  - Button should show "Requested"

✓ Solution 3: Check currentUserId
  - Food might have wrong owner ID
  - Causes button to think user owns it
```

### Issue: API Returning 400/500 Error

```
❌ Problem: Request returns error
Common errors:
- 400: "You cannot request your own food"
  → Check food owner vs. logged-in user
  
- 400: "You already have a pending request"
  → Already requested, try different food
  
- 404: "Food not found"
  → Food ID is wrong or food deleted
  
- 500: "Internal server error"
  → Check server logs for details
  → Restart server: node server/server.js
```

---

## ✅ Final Verification Checklist

After testing, verify:

- [ ] John can request Will's food
- [ ] Will receives notification automatically
- [ ] Will can see unread count badge
- [ ] Will can mark notification as read
- [ ] Will can delete notification
- [ ] Multiple users can request same food
- [ ] Own food cannot be requested
- [ ] Duplicate requests are blocked
- [ ] Food status updates to "requested"
- [ ] Unauthorized access is denied
- [ ] All responses are proper JSON
- [ ] Error messages are helpful
- [ ] UI animations work smoothly
- [ ] Badge updates in real-time
- [ ] System handles errors gracefully

---

## 🎉 Test Pass Criteria

**All tests pass if:**
- ✅ John successfully requests Will's food
- ✅ Will sees notification immediately (or within 30 seconds)
- ✅ Will can interact with notification (mark read, delete)
- ✅ System prevents invalid actions (own food, duplicates)
- ✅ No JavaScript errors in console
- ✅ All API responses are 2xx or proper error codes
- ✅ Database contains request and notification documents

---

*Last Updated: February 14, 2026*  
*Test Duration: ~30 minutes for complete coverage*  
*Status: Ready for Testing*

# 🚀 Quick Start Guide - Phase 5 Testing

## Setup Instructions

### 1. Install Dependencies
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Start Services

**Terminal 1 - Backend:**
```bash
cd server
npm start
# Should run on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Should run on http://localhost:3000
```

---

## 📋 Feature Testing Guide

### Feature 1: Advanced Filters

**Location**: `/foods/available`

**Test Steps**:
1. Open browser to `http://localhost:3000/foods/available`
2. Allow location access
3. See filter dropdowns at top:
   - 🍽️ Category
   - 💰 Price
   - ⏰ Availability

**Test Cases**:

✅ **Category Filter**
- Select "🥕 Veg" → Should show only vegetarian foods
- Select "🍗 Non-Veg" → Should show only non-veg foods
- Select "All Categories" → Should show all foods

✅ **Price Filter**
- Select "🎁 Free" → Should show only free foods (price=0)
- Select "💳 Paid" → Should show only paid foods (price>0)
- Select "All Prices" → Should show all foods

✅ **Availability Filter**
- Select "⏰ Expiring Soon" → Shows only foods expiring in <2 hours
- Select "All Items" → Shows all foods regardless of expiry

✅ **Combined Filters** (Most Important!)
- Set Category=Veg AND Price=Free
- Should show only free vegetarian foods
- Try all combinations

---

### Feature 2: Bookmark System

**Location**: `/foods/available` and `/foods/saved`

**Test Steps**:

1. **Add a Bookmark**:
   - Go to `/foods/available`
   - Find any food card
   - Click the **yellow heart button** (bottom-right of image)
   - Button should fill with yellow ✅
   - Can see "Bookmarked!" in toast

2. **View Bookmarks**:
   - Navigate to `/foods/saved`
   - Should see all bookmarked foods in a grid
   - Count should match number of bookmarks

3. **Remove a Bookmark**:
   - On `/foods/saved`, click bookmark button again
   - Heart should unfill
   - Food should disappear from saved list after refresh

4. **Empty State**:
   - Remove all bookmarks
   - `/foods/saved` should show empty state with:
     - "No Saved Posts Yet" message
     - "Discover Food" button (links to /foods/available)
     - "Share Food" button (links to /foods/add)

---

### Feature 3: Category & Price Display

**Location**: All food cards on `/foods/available` and `/foods/saved`

**Test Steps**:

1. **Category Badge** (Top-Left of image):
   - Should show food category: Veg, Non-Veg, Snacks, Meals, Desserts
   - Should show price:
     - "Free" if price=0
     - "₹150" if price=150
     - etc

2. **Visual Check**:
   - Badge should fade-in smoothly
   - Should have good contrast (white background)
   - Price updates when food edited

---

### Feature 4: Expiry Alert Badge

**Location**: Food cards (top-right of image)

**Test Steps**:

1. **Create a Post with Expiry**:
   - Go to `/foods/add`
   - Fill form with food details
   - Set expiry time to 1 hour from now
   - Submit

2. **View Badge**:
   - Go to `/foods/available`
   - Find the food you just created
   - Should see **"⏰ Expiring Soon"** badge (yellow)
   - Badge should appear on top-right corner

3. **Verify Filter**:
   - Use Availability filter: "⏰ Expiring Soon"
   - Only foods expiring in <2 hours should show
   - Should include your test food

4. **Wait for Expiry**:
   - Once food expires, badge should disappear
   - Food should still appear but without badge

---

### Feature 5: Navigate Button

**Location**: Food cards action buttons (bottom of card)

**Test Steps**:

1. **View Buttons**:
   - Open any food card
   - Should see 2 buttons at bottom:
     - 📍 "Map" button (blue)
     - ❤️ "Request" button (orange)

2. **Click Navigate**:
   - Click the blue "Map" button
   - Should open Google Maps in new tab
   - Should show the food location (lat/lng formatted)
   - URL should be: `https://www.google.com/maps/search/{lat},{lng}`

3. **Test on Different Foods**:
   - Try different foods
   - Each should open Google Maps with correct coordinates
   - Should work on mobile too (opens in browser)

---

### Feature 6: Request Status

**Location**: Food cards and request flow

**Test Steps**:

1. **Create Multiple Accounts** (for testing):
   - Account A: "User A" (regular user) 
   - Account B: "User B" (food owner)

2. **Create Food (As User B)**:
   - Login as User B
   - Go to `/foods/add`
   - Create a food post
   - Submit

3. **Request Food (As User A)**:
   - Login as User A
   - Go to `/foods/available`
   - Find User B's food
   - Click orange "Request" button
   - Button should show loading spinner
   - After 1-2 seconds should show "✓ Sent" (green)
   - Should stay disabled/green

4. **See Request on Owner Dashboard** (User B):
   - User B navigates to admin dashboard (or notifications)
   - Should see pending request from User A
   - Can see options: Accept / Reject

5. **Accept Request (As User B)**:
   - Owner clicks "Accept" on request
   - User A's view should update
   - Food card should show **"✓ Requested"** badge (green)
   - All future viewers see this badge

6. **Verify Different Status**:
   - Try "Reject" on another request
   - Should remove the request without changing food status

---

### Feature 7: Combined Features Test

**Most Comprehensive Test**:

1. **Setup**: Create 3-5 food posts with:
   - Different categories (Veg, Non-Veg, Snacks)
   - Mix of Free and Paid
   - Different expiry times (some soon, some far)

2. **Test Flow**:
   ```
   Step 1: Go to /foods/available
   Step 2: Filter Category = "Veg" 
           → Should show only Veg
   Step 3: Add Price = "Free"
           → Should show free Veg only
   Step 4: Add Availability = "Expiring Soon"
           → Should show free Veg expiring <2 hours
   Step 5: See all 3 badges on each card:
           - Category + Price (top-left)
           - Status & Expiry (top-right)
           - Distance (bottom-left)
           - Bookmark (bottom-right)
   Step 6: Click bookmark on one food
           → Yellow filled heart ✅
   Step 7: Go to /foods/saved
           → Should see only the bookmarked food
   Step 8: Try different combinations of filters
           → All should work backward ✅
   ```

---

## 🐛 Troubleshooting

### Issue: Filters Not Working
**Solution**:
- Check browser console for errors (F12 → Console)
- Verify backend is running on port 5000
- Check API endpoint: Should be `/foods/nearby/search?category=Veg&priceRange=free`

### Issue: Bookmark Button Not Responding
**Solution**:
- Ensure user is logged in
- Check authentication token in localStorage
- Open browser DevTools → Application → LocalStorage
- Should see token key

### Issue: Google Maps Not Opening
**Solution**:
- Check browser console for blocked pop-ups
- Verify food has latitude & longitude
- Manual test: Open `https://www.google.com/maps/search/28.123,77.456` (replace with real coords)

### Issue: Category Badge Not Showing
**Solution**:
- Ensure food was created with category
- If old foods exist, they need migration (set default category)
- Edit and resave food to populate category

### Issue: Expiry Badge Always Showing
**Solution**:
- Check food expiry time vs current time
- Verify server timezone matches frontend
- Test by creating new food with expiry in 1 hour

---

## 📊 Expected Results

### API Response Examples

**Nearby Foods with Filters:**
```json
GET /foods/nearby/search?lat=28.123&lng=77.456&category=Veg&priceRange=free

{
  "success": true,
  "foods": [
    {
      "_id": "12345",
      "title": "Vegetable Curry",
      "description": "Fresh made curry",
      "category": "Veg",
      "price": 0,
      "bookmarkedBy": ["user-id-1", "user-id-2"],
      "likeCount": 5,
      "commentCount": 2,
      "distanceKm": 0.5,
      "status": "available",
      "latitude": 28.123,
      "longitude": 77.456
    }
  ]
}
```

**Bookmarked Foods:**
```json
GET /foods/saved/all

{
  "success": true,
  "data": [
    {
      "_id": "12345",
      "title": "Vegetable Curry",
      "description": "Fresh made curry",
      "category": "Veg",
      "price": 0,
      "bookmarkedBy": ["current-user-id"]
    }
  ]
}
```

---

## ✅ Completion Checklist

After testing all features, mark off:

- [ ] Filters work individually
- [ ] Filters work in combination
- [ ] Category badge displays correctly
- [ ] Price shows correctly (Free/₹amount)
- [ ] Bookmark button responds
- [ ] Bookmarks persist in database
- [ ] /foods/saved shows saved items
- [ ] Expiry badge shows for items <2 hours
- [ ] Navigate button opens Google Maps
- [ ] Request status badge shows
- [ ] Request status updates when owner responds
- [ ] Mobile responsive on all features
- [ ] No console errors

---

## 🎯 Performance Notes

- Filters apply instantly (no need to click search)
- Bookmark action shouldbe <500ms
- Page load should be <2 seconds
- All animations smooth (60 FPS)

---

## 📚 Code Reference

### Key Files to Review

1. **Backend Filters**:
   - `server/controllers/foodController.js` - getNearbyFoods()
   - Lines: ~212-300

2. **Frontend Filters**:
   - `client/app/foods/available/page.tsx` - Lines: ~160-200

3. **FoodCard Component**:
   - `client/components/FoodCard.tsx` - Lines: ~200-350 (image section)

4. **Saved Posts**:
   - `client/app/foods/saved/page.tsx` - Complete file

---

## 💡 Tips

- Use Chrome DevTools Network tab to see API calls
- Use Console to check errors in real-time
- Test on mobile Chrome for responsive behavior
- Create test data in `/foods/add` to see all features
- Use different user accounts to test full request flow

---

**Happy Testing! 🎉**

Report any issues and all features should be working perfectly!

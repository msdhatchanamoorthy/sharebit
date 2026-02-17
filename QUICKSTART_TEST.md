# Quick Start Guide - Test Your Food Sharing App

## ⚡ 5-Minute Setup

### Prerequisites
- Node.js 16+ installed
- MongoDB running locally or Docker
- Google Maps API key

### Step 1: Start MongoDB
```bash
# Using Docker (easiest)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# OR if MongoDB is installed locally
mongod
```

### Step 2: Set Up Environment Variables

**Backend (`server/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sharebite
JWT_SECRET=dev_secret_key_change_in_production
CLIENT_URL=http://localhost:5173
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

**Frontend (`client/.env`):**
```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Install & Seed Data

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm run seed
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm install
npm run dev
```

Server: http://localhost:5000  
Client: http://localhost:5173

## 🧪 Test Scenarios

### Scenario 1: Sign Up as New User
1. Go to http://localhost:5173
2. Click "Register"
3. Fill in:
   - Name: Your Name
   - Email: yourname@test.com
   - Password: testpass123
   - Location: Your City
4. Click "Register"
5. You're automatically logged in ✅

### Scenario 2: View Available Foods
1. Click "Find Food" in navbar
2. See 6 sample foods listed
3. Click a food card to see details
4. Notice "Distance" shows km away from you

### Scenario 3: Add Food with Location
1. Click "Share Food"
2. Fill details:
   - Title: "Homemade Pizza"
   - Description: "Fresh from oven"
   - Quantity: "4 slices"
3. Choose location:
   - Option A: Click "Use My Location" (requires permission)
   - Option B: Click on map to set location
4. Upload an image (or click "Skip")
5. Click "Share Food" ✅
6. View in "My Foods"

### Scenario 4: Request a Food
1. Go to "Find Food"
2. Find a food by different owner
3. Click "Request Food" button
4. Food status changes to "Requested"
5. Click "My Requests" to see it

### Scenario 5: Incoming Request (Two Users)
1. **User A**: Log out, register new account (user2@test.com)
2. **User A**: Share a new food
3. **User A**: Go to Desktop/switch browser tab
4. **User B**: Log in to first account
5. **User B**: Find User A's food and click "Request Food"
6. **User A**: Check "Incoming Requests" (top navbar)
7. **User A**: Click "Accept" to mark as collected
8. **User B**: Check "My Requests" - should show "Accepted" ✅
9. Both see real-time notification! 🔔

**But wait!** Notifications appear in the notification bell icon (top right). Click it to see recent notifications.

### Scenario 6: Real-Time Notifications
1. Open 2 browser windows (or windows + private window)
2. Log in as different users in each
3. User A: Share food
4. User B: Request the food
5. User A: Watch navbar notification bell light up (red dot with count)
6. Click notification bell to see notifications

### Scenario 7: User Profile
1. Click "👤 Profile" in navbar
2. See your stats:
   - **Foods Shared**: Count of foods you shared
   - **Foods Collected**: Count of foods accepted from you
   - **Rating**: Community rating
3. Upload a profile photo:
   - Click "Change Profile Photo"
   - Select image from computer
   - Click "Upload"
   - Photo appears ✅

### Scenario 8: View Your Foods
1. Click "My Foods"
2. See all foods you've shared
3. Check their status badges:
   - 🟢 Available: Waiting for requests
   - 🟠 Requested: Someone wants it
   - 🔵 Collected: Food given away
4. Click Delete to remove a food (only available, not requested)

### Scenario 9: Search Nearby
1. Go to "Find Food"
2. Scroll down to see "Nearby Foods" section
3. Foods are automatically sorted by distance
4. Distance shown in kilometers

### Scenario 10: Google Maps View
1. Go to "Share Food"
2. See Google Map embedded in form
3. Click "Use My Location" to auto-detect
4. Click anywhere on map to set location
5. Marker shows on map at selected location
6. Latitude/Longitude auto-fill in form ✅

## 🐛 Troubleshooting

### "Cannot find module 'socket.io'"
```bash
cd server
npm install socket.io
```

### "Google Maps API error"
- Get API key from https://console.cloud.google.com/
- Add it to `.env` file in client folder
- Keys usually take 1-2 minutes to activate

### "Cannot POST /api/foods"
- Ensure backend is running (`npm run dev` in server folder)
- Check port is 5000 in console
- Verify JWT token is in localStorage

### "Map not showing"
- Check browser console for errors (F12)
- Verify `VITE_GOOGLE_MAPS_API_KEY` is valid
- Should show blue Google Maps

### "MongoDB connection failed"
- Ensure MongoDB is running
- Check MongoDB is on port 27017
- For Docker: `docker logs mongodb`

### "Images not uploading"
- Check `/server/uploads` folder exists
- Verify file size < 5MB
- Should show image URL after upload

## 📊 Sample Data

After running `npm run seed`, these foods are available:

| Food | City | Owner |
|------|------|-------|
| Fresh Biryani | Chennai (T Nagar) | owner@sharebite.com |
| Vegetable Curry | Coimbatore | owner@sharebite.com |
| Samosas | Madurai | owner@sharebite.com |
| Chicken Fry | Chennai (Anna Nagar) | owner@sharebite.com |
| Dosa | Chennai (Thiruvanmiyur) | owner@sharebite.com |
| Pasta | Bangalore | owner@sharebite.com |

**Default User:**
- Email: owner@sharebite.com
- Password: password123

## 🔄 Testing Multi-User Features

### Test Real-Time Notifications
1. Terminal: `cd server && npm run dev`
2. Terminal: `cd client && npm run dev`
3. Browser 1: Login as user A
4. Browser 2: Login as user B
5. User A: Share food
6. User B: Request food immediately
7. User A: Notification bell shows red dot with "1"
8. Click notification bell to see details

### Test Food Request Flow
1. User A shares "Pizza"
2. User B requests it
3. Pizza status: "requested" (orange badge)
4. User A sees "Incoming Requests" (1 unread)
5. User A clicks "Accept"
6. Pizza status: "collected" (blue badge)
7. User B's stats updated
8. User A's "Foods Shared" counter increases

## 🎯 Expected Behavior

✅ **Before requesting food:**
- Status: Available (green)
- Button: "Request Food"

✅ **After requesting food:**
- Status: Requested (orange)
- Button: Disabled
- Owner sees notification

✅ **After owner accepts:**
- Status: Collected (blue)
- Requester sees notification
- Stats updated for both users

✅ **Real-time updates:**
- No page refresh needed
- Notifications appear immediately
- Status updates in 1-2 seconds

## 💡 Pro Tips

1. **Use incognito windows** to easily test multi-user scenarios
2. **Check browser console** (F12) for error messages
3. **Mobile test**: Use DevTools mobile view to test responsive design
4. **Network tab**: Monitor API calls in DevTools Network tab
5. **React DevTools**: Install React DevTools browser extension to inspect components

## 🚀 Next Steps

Once everything works:
1. Customize colors in `client/src/styles/styles.css`
2. Add more features (messaging, reviews, etc.)
3. Deploy to production (Heroku, AWS, etc.)
4. Invite real users to share food in your community!

## 📞 Still Need Help?

1. Check [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for detailed docs
2. Review [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
3. Check browser console (F12) for JavaScript errors
4. Check MongoDB logs: `docker logs mongodb`

---

**Happy Testing! 🎉**

# ✅ Complete Setup Checklist

## Pre-Requirements Verification

### System Requirements
- [ ] Node.js 16+ installed (`node --version`)
- [ ] npm 8+ installed (`npm --version`)
- [ ] MongoDB running locally OR Docker available
- [ ] Google Chrome / Firefox / Edge browser
- [ ] Text editor or VS Code

### Verify Node Installation
```bash
node --version  # Should be 16+
npm --version   # Should be 8+
```

---

## ⬇️ Installation Phase

### 1. Backend Setup

- [ ] Navigate to server folder: `cd server`
- [ ] Install dependencies: `npm install`
- [ ] Verify installations:
  ```bash
  npm list express mongoose socket.io bcryptjs jsonwebtoken multer cors
  ```
- [ ] All packages showing with versions ✅

### 2. Frontend Setup

- [ ] Navigate to client folder: `cd client`
- [ ] Install dependencies: `npm install`
- [ ] Verify installations:
  ```bash
  npm list react react-router-dom axios @react-google-maps/api socket.io-client
  ```
- [ ] All packages showing with versions ✅

---

## 🗄️ Database Setup

### Option A: MongoDB Local Installation

- [ ] MongoDB installed on system
- [ ] Start MongoDB:
  ```bash
  mongod
  ```
- [ ] Verify running: `mongo` or `mongosh` connects successfully
- [ ] Stop with `Ctrl+C`

### Option B: MongoDB Docker (Recommended)

- [ ] Docker installed (`docker --version`)
- [ ] Start MongoDB container:
  ```bash
  docker run -d -p 27017:27017 --name mongodb mongo:latest
  ```
- [ ] Verify running:
  ```bash
  docker ps  # Should show mongodb container
  ```

### Verify MongoDB Connection

- [ ] Test connection from app:
  ```bash
  # Server will log "Connected to MongoDB" on startup
  ```

---

## 🔐 Environment Variables

### Backend Configuration

**File: `server/.env`**

Create this file with exact content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/sharebite

# Auth
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Frontend URL
CLIENT_URL=http://localhost:5173

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

- [ ] File created: `server/.env`
- [ ] All variables filled in
- [ ] JWT_SECRET is strong (recommend: generate random 32-char string)

### Frontend Configuration

**File: `client/.env`**

```env
# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here

# Backend API
VITE_API_URL=http://localhost:5000/api
```

- [ ] File created: `client/.env`
- [ ] Google Maps API key obtained from console.cloud.google.com
- [ ] API endpoint is correct

### Get Google Maps API Key

1. [ ] Go to https://console.cloud.google.com/
2. [ ] Create new project
3. [ ] Enable "Maps JavaScript API"
4. [ ] Enable "Geocoding API"
5. [ ] Create API key (type: Browser)
6. [ ] Restrict key to your domain
7. [ ] Copy key to `client/.env`

---

## 📁 Folder Verification

### Backend Folders

- [ ] `/server/uploads/` exists (create if missing)
- [ ] `/server/models/` has 3 files:
  - Food.js
  - User.js
  - FoodRequest.js
- [ ] `/server/controllers/` has 3 files:
  - authController.js
  - foodController.js
  - requestController.js
- [ ] `/server/routes/` has 3 files:
  - authRoutes.js
  - foodRoutes.js
  - requestRoutes.js
- [ ] `/server/middleware/` has 3 files:
  - auth.js
  - error.js
  - upload.js
- [ ] `server/server.js` exists
- [ ] `server/package.json` exists
- [ ] `server/seedFood.js` exists

### Frontend Folders

- [ ] `/client/src/components/` has 3 files:
  - FoodCard.jsx
  - Navbar.jsx
  - Toast.jsx
- [ ] `/client/src/pages/` has 8 files:
  - Home.jsx
  - Login.jsx
  - Register.jsx
  - Dashboard.jsx
  - AddFood.jsx
  - AvailableFood.jsx
  - MyFoods.jsx
  - MyRequests.jsx
  - IncomingRequests.jsx
  - Profile.jsx
- [ ] `/client/src/context/` has 3 files:
  - AuthContext.jsx
  - ToastContext.jsx
  - SocketContext.jsx
- [ ] `/client/src/services/` has 1 file:
  - api.js
- [ ] `/client/src/styles/` has CSS files present
- [ ] `client/index.html` exists

---

## 🎬 Running the Application

### Terminal 1: Start MongoDB (if not running)

```bash
# For Docker:
docker start mongodb

# For local MongoDB:
mongod
```

- [ ] MongoDB running on port 27017

### Terminal 2: Start Backend

```bash
cd server
npm run seed  # Run ONCE to seed sample data
npm run dev   # Start development server
```

Expected output:
```
Server running on port 5000
Connected to MongoDB successfully
Database seeded with sample foods
Socket.io initialized
```

- [ ] Backend running on http://localhost:5000
- [ ] No errors in console

### Terminal 3: Start Frontend

```bash
cd client
npm run dev
```

Expected output:
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

- [ ] Frontend running on http://localhost:5173
- [ ] No errors in console

---

## 🧪 Initial Testing

### Homepage Access
- [ ] Open http://localhost:5173/ in browser
- [ ] See "ShareBite" landing page
- [ ] See "Login" and "Register" buttons

### Test Registration
- [ ] Click "Register"
- [ ] Fill form with:
  - Name: Test User
  - Email: test@example.com
  - Password: testpass123
  - Location: Your City
- [ ] Click "Register"
- [ ] Redirected to Dashboard
- [ ] See "Welcome, Test User"

### Test Sample Data
- [ ] Click "Find Food" in navbar
- [ ] See 6 sample foods listed
- [ ] Each shows:
  - Food image
  - Title and description
  - Quantity
  - Distance in km
  - Owner name (owner@sharebite.com)

### Test Google Maps
- [ ] Click "Share Food" navbar link
- [ ] See Google Maps embedded
- [ ] Click "Use My Location" button
- [ ] Location auto-fills (or grant permission if prompted)
- [ ] Map updates with marker at location
- [ ] Latitude/Longitude fields auto-populate

### Test Food Request
- [ ] Go to "Find Food"
- [ ] Click on a food card
- [ ] Click "Request Food" button
- [ ] Status changes to "Requested" (orange)
- [ ] Go to "My Requests"
- [ ] See food in your requests with "Pending" status

### Test Notifications (2 Users)
- [ ] Open Browser 1: Login as test@example.com
- [ ] Open Browser 2: Login as owner@sharebite.com (password: password123)
- [ ] Browser 2: Go to "Incoming Requests"
- [ ] Browser 1: Go to "Find Food", request a food
- [ ] Browser 2: See notification bell light up (red dot with "1")
- [ ] Click notification bell
- [ ] See "John requested your Biryani"

### Test Food Request Accept
- [ ] Browser 2 (owner): Still on Incoming Requests
- [ ] Click "Accept" button for the request
- [ ] Browser 1 (requester): Go to "My Requests"
- [ ] Status changed to "Accepted" (green)
- [ ] Browser 1: Notification bell shows new notification

### Test Profile
- [ ] Click "👤 Profile" in navbar
- [ ] See user info and stats
- [ ] Click "Change Profile Photo"
- [ ] Select image from computer
- [ ] Click "Upload"
- [ ] Photo appears on profile

---

## 📚 Verification Checklist

### Backend Features Working
- [ ] Registration creates user in MongoDB
- [ ] Login returns JWT token
- [ ] Food creation stores in database
- [ ] Food retrieval shows all foods
- [ ] Nearby foods filtered to 5km
- [ ] Image upload stores files
- [ ] Profile photo upload works
- [ ] Food request changes status
- [ ] Accept request updates stats
- [ ] Socket.io sends notifications

### Frontend Features Working
- [ ] Navigation links work
- [ ] Forms validate input
- [ ] Google Maps displays location
- [ ] Distance calculated correctly
- [ ] Food cards display properly
- [ ] Request button functional
- [ ] Notifications appear
- [ ] Profile photo displays
- [ ] Status badges color-coded
- [ ] Responsive on mobile view

### Database Features Working
- [ ] Sample data seeded
- [ ] Geospatial index created
- [ ] User data persisted
- [ ] Food data persisted
- [ ] Request data persisted
- [ ] OAuth token stored
- [ ] Images stored on disk

---

## 🔍 Debugging Checklist

If something isn't working:

### Check Backend Console
- [ ] No error messages
- [ ] Says "Server running on port 5000"
- [ ] Says "Connected to MongoDB"
- [ ] Socket.io initialized

### Check Frontend Console (F12)
- [ ] No red error messages
- [ ] No network errors (Network tab)
- [ ] Successful API calls showing 200s
- [ ] Socket connection established

### Check MongoDB
- [ ] Container/service running
- [ ] Port 27017 open
- [ ] Database "sharebite" created
- [ ] Collections exist: users, foods, foodrequests

### Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Chrome can't reach localhost:5173 | Frontend not running, check Terminal 3 |
| 404 error on API calls | Backend not running, check Terminal 2 |
| "Cannot find module 'socket.io'" | Run `npm install socket.io` in server folder |
| Google Maps not showing | Check VITE_GOOGLE_MAPS_API_KEY in .env |
| Notifications not working | Check Socket.io connected, refresh browser |
| Images not uploading | Check /uploads folder exists, file size < 5MB |
| MongoDB connection failed | Check MongoDB running, verify MONGODB_URI |

---

## 📦 Production Pre-Deployment

Before going live:

- [ ] Change JWT_SECRET to strong random value
- [ ] Update NODE_ENV to "production"
- [ ] Set proper MONGODB_URI (Atlas or managed service)
- [ ] Enable HTTPS for https:// URLs
- [ ] Update CLIENT_URL to production domain
- [ ] Update VITE_API_URL to production domain
- [ ] Use cloud storage for uploads (AWS S3, etc.)
- [ ] Add rate limiting middleware
- [ ] Add request validation
- [ ] Enable CORS for production domain only
- [ ] Setup error logging service
- [ ] Setup performance monitoring
- [ ] Test with real MongoDB instance
- [ ] Test with real Google Maps API
- [ ] Verify all features work in production

---

## ✅ Final Checklist

### All Systems Go?
- [ ] All dependencies installed
- [ ] All environment variables set
- [ ] MongoDB running
- [ ] Backend running on 5000
- [ ] Frontend running on 5173
- [ ] Sample data seeded
- [ ] All tests passing
- [ ] No console errors
- [ ] Features verified working
- [ ] Ready for development

---

## 🎉 You're All Set!

**Your Food Sharing Platform is Ready to Use!**

- Backend API: http://localhost:5000
- Frontend App: http://localhost:5173
- Documentation: Check IMPLEMENTATION_GUIDE.md
- Test Guide: Check QUICKSTART_TEST.md
- Features: Check FEATURES_SUMMARY.md

**Next Steps:**
1. Customize styling in `client/src/styles/`
2. Add more sample data by editing `server/seedFood.js`
3. Invite users to test the platform
4. Develop additional features
5. Deploy to production

---

## 📞 Support Resources

- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Detailed setup
- [QUICKSTART_TEST.md](./QUICKSTART_TEST.md) - Testing scenarios  
- [FEATURES_SUMMARY.md](./FEATURES_SUMMARY.md) - What to expect
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
- GitHub Issues - Report bugs

---

**Happy Coding! 🚀**

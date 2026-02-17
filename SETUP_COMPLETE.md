# 🚀 Complete Developer Setup Guide - Moodify v2

## ⏱️ Time Required: 30 minutes

---

## 📋 Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] MongoDB running (local or cloud)
- [ ] Two terminal windows
- [ ] Modern web browser
- [ ] Text editor (VS Code recommended)

**Verify Installation:**
```bash
node --version      # Should be v18+
npm --version       # Should be v9+
mongosh --version   # Should work if MongoDB installed
```

---

## 🔧 Step-by-Step Setup

### **Step 1: Clone/Navigate to Project** (1 minute)

```bash
# Navigate to project root (if you haven't already)
cd moodify
ls -la  # Should see: server/, client/, package.json, etc.
```

### **Step 2: Backend Setup** (8 minutes)

```bash
# Terminal 1: Navigate to server
cd server

# Install dependencies
npm install  # Takes 2-3 minutes

# Create .env file with required variables
cat > .env << EOF
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/moodify

# JWT Secret (change this in production!)
JWT_SECRET=moodify-super-secret-key-2024

# Client URL
CLIENT_URL=http://localhost:3000

# Cloudinary (optional, for image uploads)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EOF

# Start the backend server
npm run dev
```

**✅ Expected Output:**
```
Server is running on port 5000
MongoDB connected successfully
```

**If MongoDB Connection Fails:**
```bash
# Make sure MongoDB is running in another terminal:
mongod
# or
brew services start mongodb-community  # Mac
# or
net start MongoDB  # Windows
```

---

### **Step 3: Frontend Setup** (8 minutes)

```bash
# Terminal 2: In the project root, navigate to client
cd client

# Install dependencies
npm install  # Takes 2-3 minutes

# Create .env.local file
cat > .env.local << EOF
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Google Maps (optional for future features)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBxppXa6yMbKcTf9CxjJ-H7_NwwkXREI14
EOF

# Start the frontend development server
npm run dev
```

**✅ Expected Output:**
```
> next dev
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- event compiled (...)
```

**☝️ If Port 3000 is Already in Use:**
```bash
# Kill the process
lsof -ti :3000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :3000    # Windows (then taskkill)
```

---

## ✨ Test the Application (10 minutes)

### **Test 1: Home Page**
1. Open browser: `http://localhost:3000`
2. You should see the Moodify home page
3. Click "Get Started"

### **Test 2: Registration**
1. Fill registration form:
   - **Name:** John Doe
   - **Email:** john@example.com
   - **Password:** test123456
   - **Location:** New York, USA
2. Click "Create Account"
3. ✅ Should redirect to home page (logged in)

### **Test 3: Share Food**
1. Click "Share Food" button
2. Fill form:
   - **Title:** Homemade Pizza
   - **Description:** Fresh homemade pizza with vegetables and cheese
   - **Quantity:** 2 boxes
   - **Location:** Central Park
3. Click "Post Food"
4. ✅ Should see success notification

### **Test 4: Allow Geolocation**
1. Click "Find Food Near You"
2. Browser will ask for location permission
3. Click "Allow"
4. ✅ Should see your posted food with distance

### **Test 5: Request Food**
1. Click "Request Food" button on the food card
2. ✅ Button should change to "Request Sent"
3. See notification popup

### **Test 6: Update Profile**
1. Click "Profile" in header
2. Click "Edit Profile" or update icon
3. Change name/bio/location
4. Click "Save Changes"
5. ✅ Should see success message

---

## 🐛 Troubleshooting

### **Frontend Won't Start**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### **Backend Connection Errors**
```bash
# Check if MongoDB is running
mongosh

# If error, start MongoDB:
mongod
```

### **Geolocation Not Working**
- ✓ Using localhost (works with geolocation)
- ✓ Browser hasn't blocked it
- ✓ Check browser console (F12)
- Try in incognito/private window

### **"Port already in use" Error**

**Port 3000 (Frontend):**
```bash
# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Port 5000 (Backend):**
```bash
# Mac/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### **CORS Errors**
- Verify backend is running (`http://localhost:5000`)
- Check VITE_API_URL in `.env.local`
- Should be exactly: `http://localhost:5000/api`

---

## 🔍 Useful Debugging Commands

### **View Current User Data**
```javascript
// In browser DevTools console (F12):
localStorage.getItem('user')
localStorage.getItem('token')
```

### **Test API Directly**
```bash
# Check backend health
curl http://localhost:5000/api/health

# Get all foods
curl http://localhost:5000/api/foods

# Nearby foods (with your location)
curl "http://localhost:5000/api/foods/nearby/search?lat=40.7128&lng=-74.0060&distance=5000"
```

### **Check Database**
```bash
# Open MongoDB shell
mongosh

# Use moodify database
use moodify

# View collections
show collections

# Count users
db.users.countDocuments()

# View last food item
db.foods.findOne({}, {sort: {createdAt: -1}})
```

---

## 📱 Development Workflow

### **Terminal Layout**
```
┌─────────────────────┬─────────────────────┐
│   Terminal 1        │   Terminal 2        │
│   Backend Server    │   Frontend Server   │
│   npm run dev       │   npm run dev       │
│   Port 5000         │   Port 3000         │
└─────────────────────┴─────────────────────┘
```

### **Code Changes**
- **Backend:** Changes auto-reload with nodemon
- **Frontend:** Changes auto-reload with Next.js HMR
- **No need to restart either server!**

---

## 🚀 Production Checklist Before Deploying

### Backend Preparation
- [ ] Change `JWT_SECRET` to a secure random string
- [ ] Set `NODE_ENV=production`
- [ ] Use cloud MongoDB (Atlas)
- [ ] Add rate limiting middleware
- [ ] Set up proper error logging
- [ ] Enable HTTPS

### Frontend Preparation
- [ ] Build the app: `npm run build`
- [ ] Test production build: `npm start`
- [ ] Set up analytics
- [ ] Enable service worker for offline
- [ ] Optimize images

### Deployment Options
- **Backend:** Railway, Render, Heroku, or AWS
- **Frontend:** Vercel, Netlify, or AWS S3 + CloudFront

---

## 📚 API Quick Reference

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "email": "john@test.com",
    "password": "123456",
    "location": "NYC"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@test.com",
    "password": "123456"
  }'

# Get nearby foods
curl "http://localhost:5000/api/foods/nearby/search?lat=40.7128&lng=-74.0060"
```

See [API_REFERENCE_UPDATED.md](API_REFERENCE_UPDATED.md) for complete API documentation.

---

## ✅ You're Ready!

**Your Moodify development environment is ready to go!**

```
🎉 Frontend:  http://localhost:3000
🎉 Backend:   http://localhost:5000
🎉 Database:  mongodb://localhost:27017/moodify
```

### Next Steps:
1. ✅ Create accounts and test features
2. ✅ Read [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
3. ✅ Check [API_REFERENCE_UPDATED.md](API_REFERENCE_UPDATED.md)
4. ✅ Explore the codebase
5. ✅ Start building new features!

---

## 🆘 Need Help?

1. **Error in console?** Check line number, search in code
2. **Network error?** Verify MongoDB and backend running
3. **Git issues?** Make sure `.env` files are in `.gitignore`
4. **Still stuck?** Check the documentation files

---

**Happy Coding! 🚀**

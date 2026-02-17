# Moodify - Food Sharing Platform

## 🎯 Features Implemented

### 1. **Modern UI with Next.js & Tailwind CSS**
- ✅ Refactored React components to Next.js with TypeScript
- ✅ Beautiful warm food-theme color palette (oranges, peaches, browns)
- ✅ Fully mobile-responsive design
- ✅ Smooth animations and transitions
- ✅ Lucide-react icons throughout the app

### 2. **Nearby Food Display with Geolocation**
- ✅ Browser geolocation API integration
- ✅ MongoDB $near/$geoWithin queries for 5km radius search
- ✅ Distance indicators on each food card (e.g., "1.2 km away")
- ✅ Adjustable search radius (1km, 2km, 5km, 10km, 15km)
- ✅ Sort by distance or recent first
- ✅ Auto-refresh location capability

### 3. **Request Food System**
- ✅ "Request Food" button on each food card
- ✅ Creates document in Requests collection with "Pending" status
- ✅ Links requester ID and food poster ID
- ✅ "Request Sent" button state confirmation
- ✅ Request success notifications

### 4. **Profile Update & Save Feature**
- ✅ Profile update page with form validation (Zod)
- ✅ Edit name, bio, and location
- ✅ MongoDB updates on save
- ✅ Success notifications and redirects
- ✅ Character count for bio (max 500)
- ✅ Current account info display

## 🗂️ File Structure

### Frontend (Next.js + TypeScript)

```
client/
├── app/
│   ├── layout.tsx                 # Root layout with AuthProvider
│   ├── page.tsx                   # Home page with hero section
│   ├── globals.css                # Tailwind + custom styles
│   ├── auth/
│   │   ├── login/page.tsx         # Login page
│   │   └── register/page.tsx      # Registration page
│   ├── foods/
│   │   ├── add/page.tsx           # Add food page with geolocation
│   │   └── available/page.tsx     # Nearby foods with search & filter
│   └── profile/
│       └── update/page.tsx        # Profile update page
├── components/
│   ├── FoodCard.tsx               # Food card with request system
│   ├── Form.tsx                   # Reusable form components
│   └── Toast.tsx                  # Toast notifications
├── context/
│   └── AuthContext.tsx            # Auth state management with useAuth hook
├── lib/
│   ├── api.ts                     # Axios instance with interceptors
│   └── utils.ts                   # Utility functions (geolocation, distance calc)
├── types/
│   └── index.ts                   # TypeScript interface definitions
├── tailwind.config.ts             # Tailwind theme config
└── next.config.ts                 # Next.js config

```

### Backend (Node.js + Express)

Models updated:
- `User.js` - Added `bio` field (max 500 characters)
- `Food.js` - Already has 2dsphere geospatial index
- `FoodRequest.js` - Unchanged

Controllers updated:
- `authController.js` - `updateProfile` now handles bio field

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB running locally or cloud
- Google Maps API Key (for future map features)

### Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/moodify
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:3000

# Start server
npm run dev
```

### Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Create .env file with:
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Start development server
npm run dev
```

Visit `http://localhost:3000`

## 📱 User Flow

### Registration & Login
1. User visits home page
2. Clicks "Get Started" → Registration page
3. Fills name, email, password, location
4. Account created and auto-logged in
5. Redirected to home page

### Finding Food
1. User clicks "Find Food Near You"
2. App requests geolocation access
3. User allows location access
4. Nearby foods displayed with distance
5. Can adjust search radius and sort
6. Click "Request Food" to request

### Sharing Food
1. User clicks "Share Food"
2. Fills food details (title, description, quantity)
3. App auto-detects location (or user can update)
4. Optional: Upload food image
5. Click "Post Food"
6. Food appears in others' nearby searches

### Updating Profile
1. User clicks "Profile" in header
2. Navigated to profile update page
3. Edit name, bio, location
4. Click "Save Changes"
5. Profile updated in database
6. Success notification and redirect

## 🌍 Geolocation & Distance Features

### How It Works
1. **Browser Geolocation API** requests user's coordinates
2. **Backend receives** lat/lng parameters
3. **MongoDB $near query** finds foods within radius
4. **Haversine formula** calculates exact distances
5. **Frontend displays** distance on each card

### Example API Call
```bash
GET /api/foods/nearby/search?lat=40.7128&lng=-74.0060&distance=5000
```

Response includes `distanceKm` for each food card.

## 🔐 Authentication

- **JWT Tokens** stored in localStorage
- **Protected routes** check for token
- **Automatic logout** on 401 response
- **Auto-redirect** to login if needed

## 🎨 Design System

### Color Palette
- **Primary**: Brand Orange (#F08249)
- **Secondary**: Warm Orange (#FF9D3D)
- **Background**: Cream (#FEF5F0)
- **Accent**: Peach (#FFD9B3)

### Typography
- **Headings**: Bold, gradient text
- **Body**: Clean sans-serif
- **Size**: Responsive (mobile-first)

## ✅ Validation

### Forms Use Zod
- Email validation
- Password strength (min 6 chars)
- Name/location length checks
- Bio max 500 characters
- Location coordinate validation

## 🔧 Common Issues & Solutions

### Geolocation Not Working
- Check browser permissions
- Use HTTPS (required for geolocation)
- Allow location access popup

### Foods Not Showing
- Verify MongoDB connection
- Check coordinates are valid
- Ensure distance radius is set correctly

### Login Redirects to Login
- Check JWT_SECRET is same on backend
- Verify token stored in localStorage
- Check API_URL is correct

## 📦 Dependencies

### Frontend
- Next.js 15.1
- React 19
- TypeScript 5.3
- Tailwind CSS 3.4
- Zod 3.23 (validation)
- Axios 1.7 (HTTP)
- Lucide-react 0.408 (icons)

### Backend
- Express 4.18
- MongoDB/Mongoose 7.0
- JWT 9.0
- Bcrypt 2.4

## 🚀 Production Checklist

- [ ] Update MONGODB_URI to production
- [ ] Set secure JWT_SECRET
- [ ] Configure CORS properly
- [ ] Add HTTPS certificates
- [ ] Set up email notifications
- [ ] Enable rate limiting
- [ ] Add request logging
- [ ] Set up error tracking (Sentry)

## 🤝 Contributing

To add new features:
1. Create feature branch
2. Update type definitions
3. Add validation if needed
4. Test with both mobile & desktop
5. Update documentation

## 📝 License

This project is open source and available under the MIT License.

---

**Built with ❤️ for food sharing and community.**

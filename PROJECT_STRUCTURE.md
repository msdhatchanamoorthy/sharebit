# ShareBite - Complete Project Structure & File Guide

## 📁 Project Overview

A complete MERN stack application for local food sharing. Community members can register as donors or receivers, list/request food, and manage transactions.

---

## 🗂️ Complete File Structure

```
moodify/
│
├── README.md                    # Main project documentation
├── QUICK_START.md              # Quick setup and testing guide
├── API_TESTING.md              # API testing with curl examples
├── TROUBLESHOOTING.md          # Solution to common issues
│
├── server/                      # Backend (Node.js + Express)
│   ├── .env.example            # Environment variables template
│   ├── .gitignore              # Git ignore rules
│   ├── package.json            # Dependencies & scripts
│   ├── server.js               # Main server entry point
│   │
│   ├── models/                 # MongoDB Schemas
│   │   ├── User.js             # User schema (name, email, password, role, location, rating)
│   │   ├── Food.js             # Food schema (title, description, quantity, type, expiry, location, donor)
│   │   └── FoodRequest.js      # Request schema (foodId, receiverId, status, createdAt)
│   │
│   ├── controllers/            # Business Logic
│   │   ├── authController.js   # Register, login, profile management
│   │   ├── foodController.js   # CRUD operations for food listings
│   │   └── requestController.js # Request management (create, accept, reject, cancel)
│   │
│   ├── routes/                 # API Routes
│   │   ├── authRoutes.js       # /api/auth/* routes
│   │   ├── foodRoutes.js       # /api/foods/* routes
│   │   └── requestRoutes.js    # /api/requests/* routes
│   │
│   └── middleware/             # Custom Middleware
│       ├── auth.js             # JWT verification, role checking
│       └── error.js            # Error handling
│
├── client/                      # Frontend (React + Vite)
│   ├── .gitignore              # Git ignore rules
│   ├── package.json            # Dependencies & scripts
│   ├── vite.config.js          # Vite configuration
│   ├── index.html              # HTML entry point
│   │
│   └── src/
│       ├── main.jsx            # React entry point
│       ├── App.jsx             # Main app component with routing
│       │
│       ├── pages/              # Page Components
│       │   ├── Home.jsx        # Landing page with features
│       │   ├── Register.jsx    # User registration form
│       │   ├── Login.jsx       # User login form
│       │   ├── Dashboard.jsx   # User dashboard & profile
│       │   ├── AddFood.jsx     # Form to add food (donor only)
│       │   ├── AvailableFood.jsx # Browse & request food (receiver only)
│       │   └── MyRequests.jsx  # View requests (both roles)
│       │
│       ├── components/         # Reusable Components
│       │   └── Navbar.jsx      # Navigation bar
│       │
│       ├── services/           # API Integration
│       │   └── api.js          # Axios instance & API calls
│       │
│       ├── context/            # State Management
│       │   └── AuthContext.jsx # Authentication context provider
│       │
│       └── styles/             # Styling
│           └── styles.css      # Global CSS styles
```

---

## 📋 Server Files Detailed Explanation

### `server.js` - Main Application Entry Point
```javascript
// Initializes Express server
// Connects to MongoDB
// Sets up middleware (CORS, JSON parsing)
// Imports and configures routes
// Implements error handling
// Starts server on PORT
```

### Models - Database Schemas

**User.js**
- Stores user information
- Hash passwords before saving
- Methods: matchPassword (compare hashed passwords)
- Fields: name, email, password, role, location, rating

**Food.js**
- Stores food listings
- References donor through donorId
- Fields: title, description, quantity, vegType, expiryTime, location, status

**FoodRequest.js**
- Tracks requests between receiver and donor
- References both user and food
- Status: pending, accepted, rejected, completed

### Controllers - Business Logic

**authController.js**
- `register()` - Create new user account
- `login()` - Authenticate with email/password
- `getProfile()` - Fetch current user data
- `updateProfile()` - Update user information

**foodController.js**
- `createFood()` - Add new food listing (donor)
- `getAllFood()` - Get all available food
- `getFoodById()` - Get single food details
- `getMyFoods()` - Get current donor's listings
- `updateFood()` - Modify food listing
- `deleteFood()` - Remove food listing
- `updateFoodStatus()` - Change food status

**requestController.js**
- `createRequest()` - Create food request (receiver)
- `getMyRequests()` - Get receiver's requests
- `getDonorRequests()` - Get incoming requests (donor)
- `acceptRequest()` - Accept request (donor)
- `rejectRequest()` - Reject request (donor)
- `cancelRequest()` - Cancel request (receiver)

### Routes - API Endpoints

**authRoutes.js**
- POST /register
- POST /login
- GET /profile (protected)
- PUT /profile (protected)

**foodRoutes.js**
- GET / - Get all foods
- GET /:id - Get food by ID
- POST / - Create food (donor)
- GET /donor/my-foods - Get my listings (donor)
- PUT /:id - Update food (donor)
- DELETE /:id - Delete food (donor)
- PATCH /:id/status - Update status (donor)

**requestRoutes.js**
- POST / - Create request (receiver)
- GET /receiver/my-requests - My requests (receiver)
- PATCH /:id/accept - Accept request (donor)
- PATCH /:id/reject - Reject request (donor)
- DELETE /:id/cancel - Cancel request (receiver)

### Middleware - Custom Handlers

**auth.js**
- `protect()` - Verify JWT token
- `checkDonor()` - Verify user is donor
- `checkReceiver()` - Verify user is receiver

**error.js**
- Centralized error handling
- Formats error responses
- Handles MongoDB and validation errors

---

## 🎨 Client Files Detailed Explanation

### `App.jsx` - Main Application Component
```javascript
// Defines routing structure
// Implements protected routes
// Requires authentication for certain pages
// Enforces role-based access (donor/receiver)
```

### `main.jsx` - React Entry Point
```javascript
// Mounts React app to #root element
// Wraps app with AuthProvider for authentication context
```

### Pages - Route Components

**Home.jsx**
- Landing page displayed to all users
- Shows features and benefits
- Links to register/login or dashboard
- Different CTAs for logged-in users based on role

**Register.jsx**
- User registration form
- Form fields: name, email, password, location, role
- Calls authAPI.register()
- Redirects to dashboard on success

**Login.jsx**
- User login form
- Form fields: email, password
- Calls authAPI.login()
- Stores token in localStorage
- Redirects to dashboard on success

**Dashboard.jsx**
- User profile and overview
- Shows user information
- Quick stats specific to user role
- Next steps recommendations
- Links to role-specific actions

**AddFood.jsx** (Donor Only)
- Form to add food listing
- Fields: title, description, quantity, type, expiry, location
- Calls foodAPI.createFood()
- Redirects to dashboard after success

**AvailableFood.jsx** (Receiver Only)
- Displays all available food listings
- Shows food details and donor information
- Request button for each food
- Calls foodAPI.getAllFoods() and requestAPI.createRequest()

**MyRequests.jsx** (Both Roles)
- Shows requests relevant to user role
- Donors see incoming requests with receiver info
- Receivers see their own requests with food info
- Accept/reject buttons for donors
- Cancel button for receivers

### Components - Reusable Parts

**Navbar.jsx**
- Navigation bar displayed on all pages
- Logo and brand name
- Navigation links based on user role
- User greeting and logout button
- Responsive menu layout

### Services - API Integration

**api.js**
- Axios instance configured with base URL
- Request interceptor to add JWT token
- Export functions for all API calls:
  - `authAPI` - Login, register, profile
  - `foodAPI` - Food CRUD operations
  - `requestAPI` - Request management

### Context - State Management

**AuthContext.jsx**
- Provides authentication state globally
- Functions: login(), register(), logout()
- State: user, token, loading
- Persists token to localStorage
- Fetches user profile on app load

### Styles - Global CSS

**styles.css**
- Global styles for all pages
- Variables for colors and spacing
- Component-specific classes (.btn, .card, .food-card)
- Status badge styling
- Responsive grid layouts
- Utility classes (.mt, .mb, .text-center)
- Animations (spinner)

---

## 🔑 Key Features Implementation

### Authentication Flow
1. User registers with email/password
2. Password hashed with bcrypt
3. JWT token generated on login
4. Token stored in localStorage (frontend)
5. Token included in API requests (Authorization header)
6. Middleware verifies token for protected routes

### Food Sharing Flow
1. Donor logs in and adds food listing
2. Food appears in "Available Food" for receivers
3. Receiver requests food
4. Donor receives request notification
5. Donor accepts/rejects request
6. Food status updates to "donated" or back to "available"
7. Receiver can see request status

### Role-Based Access
- Donors: Add food, manage listings, view/accept requests
- Receivers: Browse food, make requests, view requests
- Guest: Only view home page

---

## 📦 Dependencies

### Backend (server/package.json)
- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **dotenv**: Environment variables
- **cors**: Cross-origin handling

### Frontend (client/package.json)
- **react**: UI library
- **react-dom**: React DOM renderer
- **react-router-dom**: Client-side routing
- **axios**: HTTP client
- **vite**: Build tool

---

## 🚀 Quick Setup Checklist

- [ ] Install Node.js and MongoDB
- [ ] Navigate to `server` folder
- [ ] Run `npm install`
- [ ] Create `.env` file with MongoDB URI and JWT_SECRET
- [ ] Run `npm run dev`
- [ ] In another terminal, navigate to `client`
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Register as donor/receiver
- [ ] Test the complete flow

---

## 📖 Documentation Files

- **README.md** - Main documentation with all features and setup
- **QUICK_START.md** - Fast setup steps and basic testing
- **API_TESTING.md** - All API endpoints with curl examples
- **TROUBLESHOOTING.md** - Solutions for common issues
- **This File** - Complete structure and file explanations

---

## 💡 Code Quality Standards

### Comments
- Each file has comments explaining its purpose
- Complex functions have explanations
- Middleware and routes are well-documented

### Error Handling
- Try-catch blocks in all controllers
- Centralized error middleware
- Meaningful error messages

### Validation
- Input validation in controllers
- Database schema validation
- JWT token validation

### Security
- Passwords hashed with bcrypt
- JWT for authentication
- Role-based access control
- CORS protection

---

## 🎯 Common Development Tasks

### Add New Field to Food Schema
1. Update `server/models/Food.js`
2. Update food controller if needed
3. Update frontend form components

### Add New API Endpoint
1. Create controller function in `server/controllers/`
2. Add route in `server/routes/`
3. Import route in `server/server.js`
4. Add API function in `client/src/services/api.js`

### Add New Page
1. Create component in `client/src/pages/`
2. Add route in `client/src/App.jsx`
3. Add navbar link in `client/src/components/Navbar.jsx`
4. Create form/content as needed

---

**Project created successfully! Happy coding! 🚀**

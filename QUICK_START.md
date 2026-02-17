# Quick Start Guide - ShareBite

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Code Editor (VS Code recommended)

## Step 1: Backend Setup (5 minutes)

```bash
# Navigate to server folder
cd server

# Install dependencies
npm install

# Create .env file with this content:
# MONGODB_URI=mongodb://localhost:27017/sharebite
# JWT_SECRET=sharebite_secret_key_2024
# PORT=5000
# NODE_ENV=development

# Start the server
npm run dev
```

✅ Server should run on http://localhost:5000

## Step 2: Frontend Setup (5 minutes)

```bash
# In a new terminal, navigate to client folder
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```

✅ App should open on http://localhost:3000

## Step 3: Test the Application

### Option 1: Test as Donor
1. Go to http://localhost:3000
2. Click "Get Started" or "Register"
3. Fill in details:
   - Name: John Donor
   - Email: john@example.com
   - Password: password123
   - Role: Food Donor
   - Location: Downtown
4. Click "Register"
5. You'll be redirected to Dashboard
6. Click "Add Food" from navbar
7. Fill in food details and submit
8. View your listings in Dashboard

### Option 2: Test as Receiver
1. Open another browser tab or incognito window
2. Go to http://localhost:3000
3. Register with:
   - Name: Jane Receiver
   - Email: jane@example.com
   - Password: password123
   - Role: Food Receiver
   - Location: Downtown
4. Click "Dashboard"
5. Click "Available Food"
6. You should see the food added by donor
7. Click "Request Food"
8. Go to "My Requests" to see pending request

### Option 3: Accept/Reject Request (as Donor)
1. Login as donor (john@example.com / password123)
2. Go to "My Requests"
3. You should see Jane's request
4. Click "Accept" to accept the request
5. Login as Jane and see the updated status

## Project Structure

```
moodify/
├── server/               # Backend (Node.js + Express)
│   ├── models/          # Database schemas
│   ├── controllers/     # Business logic
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth & error handling
│   └── server.js        # Main file
│
└── client/              # Frontend (React + Vite)
    ├── src/
    │   ├── pages/       # Page components
    │   ├── components/  # Reusable components
    │   ├── services/    # API calls
    │   ├── context/     # Auth context
    │   └── styles/      # CSS
```

## API Endpoints Overview

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Food (Donor)
- `POST /api/foods` - Add new food
- `GET /api/foods/donor/my-foods` - Get my listings
- `PUT /api/foods/:id` - Update food
- `DELETE /api/foods/:id` - Delete food

### Food (Receiver)
- `GET /api/foods` - Get all available food
- `GET /api/foods/:id` - Get food details

### Requests
- `POST /api/requests` - Create request
- `GET /api/requests/receiver/my-requests` - Get my requests (receiver)
- `GET /api/requests/donor/my-requests` - Get incoming requests (donor)
- `PATCH /api/requests/:id/accept` - Accept request (donor)
- `PATCH /api/requests/:id/reject` - Reject request (donor)
- `DELETE /api/requests/:id/cancel` - Cancel request (receiver)

## Troubleshooting

### Port 5000 Already in Use
```bash
# Change port in .env file to 5001 or higher
PORT=5001
```

### MongoDB Connection Error
1. Make sure MongoDB is running
2. Check connection string in .env
3. If using Atlas, add your IP to whitelist

### CORS Error
- Backend is configured for localhost:3000
- If frontend is on different port, update in server.js

### Can't Login/Register
- Check browser console for error messages
- Ensure backend is running (http://localhost:5000/api/health)
- Clear cookies/cache and try again

## File Locations Reference

| Feature | Backend | Frontend |
|---------|---------|----------|
| Authentication | `controllers/authController.js` | `pages/Login.jsx`, `pages/Register.jsx` |
| Food Management | `controllers/foodController.js` | `pages/AddFood.jsx`, `pages/AvailableFood.jsx` |
| Requests | `controllers/requestController.js` | `pages/MyRequests.jsx` |
| Database | `models/` folder | - |
| Validation | `middleware/auth.js` | `context/AuthContext.jsx` |
| Styles | - | `styles/styles.css` |
| API Client | - | `services/api.js` |

## Database Collections

The application will create 3 collections in MongoDB:

1. **users** - User accounts with roles
2. **foods** - Food listings
3. **foodrequests** - Food requests between users

## Next Steps

1. ✅ Both servers are running
2. ✅ Create test accounts
3. ✅ Test the full flow
4. 📖 Read the main README.md for detailed documentation
5. 🚀 Deploy to production (See README.md for deployment guides)

## Quick Commands

```bash
# Development
npm run dev           # Backend
npm run dev          # Frontend (in client folder)

# Build
npm run build        # Frontend (in client folder)

# Restart servers
# Ctrl + C to stop
# npm run dev to restart

# Check if MongoDB is running
mongo
```

## Support

If you encounter any issues:
1. Check the terminal for error messages
2. Ensure all prerequisites are installed
3. Read the main README.md documentation
4. Check browser console (F12) for frontend errors

---

**Enjoy! Happy coding! 🚀**

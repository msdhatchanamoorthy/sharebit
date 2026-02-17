# 🍽️ ShareBite - Local Food Sharing Platform

> A modern, full-stack food sharing platform that connects community members to share excess food and reduce waste.

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node](https://img.shields.io/badge/Node-16%2B-green)
![React](https://img.shields.io/badge/React-18%2B-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Ready-green)

## ✨ Features

### 🗺️ **Geolocation & Discovery**
- Find foods within 5km radius of your location
- Interactive Google Maps integration
- Real-time distance calculation
- Location-based food search

### 📱 **User Management**
- User registration & authentication
- Profile with photo upload
- Community rating system
- User statistics tracking

### 🍚 **Food Sharing**
- Post food items with photos
- Detailed food descriptions
- Quantity and location info
- Track food status (available/requested/collected)

### 📮 **Request System**
- Request foods from other community members
- Accept/reject incoming requests
- Track all requests with status
- View requester information

### 🔔 **Real-Time Notifications**
- Instant Socket.io notifications
- Request status updates
- Notification bell with unread count
- Auto-dismissing alerts

### 🔐 **Security**
- JWT token authentication
- Password hashing with bcrypt
- Protected API endpoints
- Secure file uploads

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB
- Google Maps API Key
- npm or yarn

### Installation

```bash
# 1. Clone repository
git clone <repo-url>
cd moodify

# 2. Setup Backend
cd server
npm install
cp .env.example .env  # Configure your .env

# 3. Setup Database
npm run seed  # Load sample data

# 4. Start Backend
npm run dev  # Runs on :5000

# 5. Setup Frontend (new terminal)
cd ../client
npm install
# Create .env with VITE_GOOGLE_MAPS_API_KEY and VITE_API_URL

# 6. Start Frontend
npm run dev  # Runs on :5173
```

### Quick Test
1. Register a new account
2. Click "Share Food" to post food
3. Open new browser window, register another account
4. One account requests food from the other
5. First account sees notification in navbar
6. Accept request to complete the flow

---

## 📋 Documentation

- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Complete setup and feature documentation
- **[QUICKSTART_TEST.md](./QUICKSTART_TEST.md)** - Testing scenarios and walkthroughs
- **[FEATURES_SUMMARY.md](./FEATURES_SUMMARY.md)** - Detailed feature breakdown
- **[API_REFERENCE.md](./API_REFERENCE.md)** - API endpoints documentation
- **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Installation checklist
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions

---

## 🏗️ Architecture

### Frontend Stack
```
React 18.2.0
├── React Router v6 (Navigation)
├── Axios (HTTP Client)
├── Socket.io-client (Real-time)
├── @react-google-maps/api (Maps)
└── Context API (State Management)
```

### Backend Stack
```
Node.js + Express
├── MongoDB + Mongoose (Database)
├── Socket.io (Real-time)
├── JWT (Authentication)
├── Multer (File Upload)
└── Bcryptjs (Password Hashing)
```

### Database Schema
```
Users
  ├── name, email, password
  ├── location, coordinates
  ├── profilePhoto
  └── Statistics (foodsShared, foodsCollected, rating)

Foods
  ├── title, description, quantity
  ├── image, coordinates
  ├── status (available/requested/collected)
  ├── ownerId, requestedBy
  └── Geospatial Location (2dsphere)

FoodRequests
  ├── foodId, requesterId, ownerId
  ├── status (pending/accepted/rejected)
  └── timestamps
```

---

## 📂 Project Structure

```
moodify/
├── server/
│   ├── models/
│   │   ├── User.js
│   │   ├── Food.js
│   │   └── FoodRequest.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── foodController.js
│   │   └── requestController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── foodRoutes.js
│   │   └── requestRoutes.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── error.js
│   │   └── upload.js
│   ├── uploads/
│   ├── server.js
│   ├── seedFood.js
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env
├── docs/
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
GET    /api/auth/profile           - Get user profile
PUT    /api/auth/profile           - Update profile
PUT    /api/auth/profile-photo     - Upload profile photo
```

### Food Management
```
POST   /api/foods                  - Create food
GET    /api/foods                  - Get all foods
GET    /api/foods/:id              - Get food by ID
PUT    /api/foods/:id              - Update food
DELETE /api/foods/:id              - Delete food
GET    /api/foods/owner/my-foods   - Get user's foods
GET    /api/foods/nearby/search    - Find nearby foods
```

### Food Requests
```
POST   /api/foods/:id/request      - Request food
POST   /api/foods/:id/accept       - Accept request
POST   /api/foods/:id/reject       - Reject request
GET    /api/requests/my-requests   - Get my requests
GET    /api/requests/incoming      - Get incoming requests
```

See [API_REFERENCE.md](./API_REFERENCE.md) for complete documentation.

---

## 🧪 Testing

### Sample Data
After running `npm run seed`, the app includes:
- 6 sample foods in different cities
- Default user: owner@sharebite.com / password123

### Test Scenarios
1. **Registration** - Create new account
2. **Food Posting** - Share a food with location
3. **Food Discovery** - Find nearby foods
4. **Request System** - Request and accept foods
5. **Notifications** - See real-time updates
6. **Profile** - Upload photo and view stats

See [QUICKSTART_TEST.md](./QUICKSTART_TEST.md) for detailed test walkthroughs.

---

## 🛠️ Technology Details

### Geospatial Features
- MongoDB 2dsphere index for location-based queries
- Haversine formula for distance calculation
- GeoJSON format for coordinate storage: [longitude, latitude]

### Real-Time Communication
- Socket.io for WebSocket connections
- Event-based notification system
- User connection tracking
- Auto-cleanup on disconnect

### File Management
- Multer middleware for multipart uploads
- Separate routes for food and profile photos
- Server-side file validation
- Organized upload directory structure

### Authentication
- JWT tokens with 7-day expiry
- Password hashing with bcrypt (10 salt rounds)
- Protected routes with permission checks
- Token injection in Axios interceptor

---

## 🚀 Deployment

### Development
```bash
npm run dev  # Frontend development server
npm run dev  # Backend development server
```

### Production Build
```bash
# Frontend
npm run build
# Output: client/dist/

# Backend
npm start
```

### Environment Variables

**Backend (.env):**
```env
PORT=5000
MONGODB_URI=mongodb://...
JWT_SECRET=<strong-secret>
CLIENT_URL=https://yourdomain.com
NODE_ENV=production
```

**Frontend (.env):**
```env
VITE_API_URL=https://api.yourdomain.com
VITE_GOOGLE_MAPS_API_KEY=<api-key>
```

---

## 📊 Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  location: String,
  profilePhoto: String,
  latitude: Number,
  longitude: Number,
  foodsShared: Number,
  foodsCollected: Number,
  rating: Number,
  createdAt: Date
}
```

### Food
```javascript
{
  title: String,
  description: String,
  quantity: String,
  image: String,
  latitude: Number,
  longitude: Number,
  locationName: String,
  location: { type: Point, coordinates: [lng, lat] },
  status: String (available/requested/collected),
  ownerId: ObjectId,
  requestedBy: ObjectId,
  createdAt: Date
}
```

### FoodRequest
```javascript
{
  foodId: ObjectId,
  requesterId: ObjectId,
  ownerId: ObjectId,
  status: String (pending/accepted/rejected),
  message: String,
  createdAt: Date
}
```

---

## 🔒 Security Considerations

✅ **Implemented:**
- JWT authentication
- Password hashing
- CORS protection
- Input validation
- Protected routes
- File upload validation

⚠️ **Recommended for Production:**
- Rate limiting
- HTTPS only
- Helmet.js headers
- Request size limits
- API key rotation
- Database backup
- Error logging service
- Performance monitoring

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📈 Future Enhancements

- [ ] Messaging system between users
- [ ] Advanced search and filters
- [ ] Food expiry/urgency indicators
- [ ] User reviews and ratings
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Payment integration
- [ ] Community achievements
- [ ] Food type categories
- [ ] Schedule pickup times

---

## 🐛 Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for:
- Common issues and solutions
- Debugging guide
- Error message reference
- Performance optimization tips

---

## 📞 Support

- 📧 Email: support@sharebite.com
- 🐞 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Google Maps API for location services
- Socket.io for real-time communication
- MongoDB for database
- React community for amazing tools
- All contributors and testers

---

## 🎯 Roadmap

**Phase 1 (Current):** ✅ Complete
- Core food sharing functionality
- Geolocation features
- Request system
- Real-time notifications
- User profiles

**Phase 2 (Planned):**
- Advanced search and filters
- Messaging system
- Rating system improvements

**Phase 3 (Future):**
- Mobile app
- Analytics dashboards
- Gamification features

---

## 📊 Stats

- ⚛️ React components: 8
- 🗂️ API endpoints: 18+
- 🔌 Socket events: 3
- 📱 Responsive breakpoints: 3 (mobile, tablet, desktop)
- ✅ Production features: 10+

---

<div align="center">

### 🍽️ Share Food. Save Lives. Build Community.

[Get Started →](./IMPLEMENTATION_GUIDE.md) | [Documentation →](./FEATURES_SUMMARY.md) | [Test Guide →](./QUICKSTART_TEST.md)

Made with ❤️ by the ShareBite Team

</div>

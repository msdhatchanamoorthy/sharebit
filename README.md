# ShareBite - Local Food Sharing Platform

A full-stack MERN application that enables community members to share surplus food with others in their locality. Donors can list available food, while receivers can browse and request items from donors.

## 🎯 Features

### User Authentication & Profiles
- User registration with role-based selection (Donor/Receiver)
- Secure JWT-based authentication
- Password hashing with bcrypt
- User profile management

### For Donors
- Add food listings with details (title, description, quantity, type, expiry, location)
- View all their food listings
- Edit and delete food listings
- Accept or reject food requests
- Track donation history

### For Receivers
- Browse available food in their area
- Filter food by type (vegetarian, non-vegetarian, both)
- Request food from donors
- Track request status
- Cancel pending requests

### General Features
- JWT-based protected routes
- Role-based access control
- Real-time request status updates
- Responsive design
- Clean and intuitive UI

## 📋 Project Structure

```
ShareBite/
├── server/
│   ├── models/
│   │   ├── User.js          # User schema with password hashing
│   │   ├── Food.js          # Food listing schema
│   │   └── FoodRequest.js   # Food request schema
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── foodController.js     # Food CRUD operations
│   │   └── requestController.js  # Food request operations
│   ├── routes/
│   │   ├── authRoutes.js    # Auth endpoints
│   │   ├── foodRoutes.js    # Food endpoints
│   │   └── requestRoutes.js # Request endpoints
│   ├── middleware/
│   │   ├── auth.js          # JWT verification & role checks
│   │   └── error.js         # Error handling
│   ├── server.js            # Main server file
│   ├── package.json
│   └── .env.example
│
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Landing page
│   │   │   ├── Register.jsx          # User registration
│   │   │   ├── Login.jsx             # User login
│   │   │   ├── Dashboard.jsx         # User dashboard
│   │   │   ├── AddFood.jsx           # Add food listing
│   │   │   ├── AvailableFood.jsx     # Browse available food
│   │   │   └── MyRequests.jsx        # View requests
│   │   ├── components/
│   │   │   └── Navbar.jsx            # Navigation bar
│   │   ├── services/
│   │   │   └── api.js                # Axios API client
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Auth context provider
│   │   ├── styles/
│   │   │   └── styles.css            # Global styles
│   │   ├── App.jsx                   # Main app component
│   │   └── main.jsx                  # React entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas)

### Backend Setup

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   copy .env.example .env
   ```
   Update the `.env` file with your configuration:
   ```
   MONGODB_URI=mongodb://localhost:27017/sharebite
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=5000
   NODE_ENV=development
   ```

4. **Start MongoDB**
   - If using local MongoDB:
     ```bash
     mongod
     ```
   - If using MongoDB Atlas, update `MONGODB_URI` in .env with your connection string

5. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Or production mode
   npm start
   ```
   The server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will open on `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

**POST /api/auth/register**
- Register a new user
- Body: `{ name, email, password, role, location }`
- Returns: `{ token, user }`

**POST /api/auth/login**
- Login user
- Body: `{ email, password }`
- Returns: `{ token, user }`

**GET /api/auth/profile**
- Get current user profile
- Requires: JWT token
- Returns: `{ user }`

**PUT /api/auth/profile**
- Update user profile
- Requires: JWT token
- Body: `{ name, location, rating }`

### Food Endpoints

**GET /api/foods**
- Get all available food listings
- Returns: `{ foods, count }`

**GET /api/foods/:id**
- Get single food by ID
- Returns: `{ food }`

**POST /api/foods**
- Create new food listing (Donor only)
- Requires: JWT token, Donor role
- Body: `{ title, description, quantity, vegType, expiryTime, location }`

**GET /api/foods/donor/my-foods**
- Get current donor's food listings
- Requires: JWT token, Donor role

**PUT /api/foods/:id**
- Update food listing
- Requires: JWT token, Donor role

**DELETE /api/foods/:id**
- Delete food listing
- Requires: JWT token, Donor role

**PATCH /api/foods/:id/status**
- Update food status
- Requires: JWT token, Donor role

### Request Endpoints

**POST /api/requests**
- Create food request (Receiver only)
- Requires: JWT token, Receiver role
- Body: `{ foodId }`

**GET /api/requests/receiver/my-requests**
- Get receiver's requests
- Requires: JWT token, Receiver role

**GET /api/requests/donor/my-requests**
- Get donor's incoming requests
- Requires: JWT token, Donor role

**PATCH /api/requests/:id/accept**
- Accept request (Donor only)
- Requires: JWT token, Donor role

**PATCH /api/requests/:id/reject**
- Reject request (Donor only)
- Requires: JWT token, Donor role

**DELETE /api/requests/:id/cancel**
- Cancel request (Receiver only)
- Requires: JWT token, Receiver role

## 🔐 Authentication & Security

- **JWT Tokens**: All protected routes require a valid JWT token in the Authorization header
- **Password Hashing**: Passwords are hashed using bcryptjs before storing
- **Role-Based Access**: Different endpoints are restricted based on user roles (donor/receiver)
- **Token Format**: `Authorization: Bearer <token>`

## 🎨 Frontend Features

### Pages
1. **Home Page**: Landing page with features overview
2. **Register Page**: User registration with role selection
3. **Login Page**: Secure login with JWT authentication
4. **Dashboard**: User profile and quick stats
5. **Add Food Page**: Form to add new food listings (Donors)
6. **Available Food Page**: Browse and request food (Receivers)
7. **My Requests Page**: Manage food requests (Both roles)

### Styling
- Clean, modern UI with CSS
- Responsive design for mobile and desktop
- Color-coded status badges
- Interactive cards and buttons

## 📦 Dependencies

### Backend
- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **dotenv**: Environment variables
- **cors**: Cross-origin resource sharing
- **nodemon**: Development auto-reload

### Frontend
- **react**: UI library
- **react-router-dom**: Routing
- **axios**: HTTP client
- **vite**: Build tool

## 🧪 Testing the Application

### Create Test Account
1. Register as **Donor**:
   - Name: John Doe
   - Email: donor@example.com
   - Password: password123
   - Location: Downtown
   - Role: Food Donor

2. Register as **Receiver**:
   - Name: Jane Smith
   - Email: receiver@example.com
   - Password: password123
   - Location: Downtown
   - Role: Food Receiver

### Test Flow
1. Login as Donor → Add Food → View listings
2. Login as Receiver → Browse available food → Request food
3. Login as Donor → View pending requests → Accept/Reject
4. Check request status as Receiver

## 🔧 Configuration

### MongoDB Connection
- **Local**: `mongodb://localhost:27017/sharebite`
- **Atlas**: Update connection string in .env

### JWT Secret
Change the `JWT_SECRET` in production environment

### Port Configuration
- Backend: `5000` (configurable via PORT in .env)
- Frontend: `3000` (configurable in vite.config.js)

## 📝 Environment Variables

Create a `.env` file in the server directory:

```
# Database
MONGODB_URI=mongodb://localhost:27017/sharebite

# JWT
JWT_SECRET=your_secret_key_minimum_32_characters

# Server
PORT=5000
NODE_ENV=development
```

## 🐛 Common Issues & Solutions

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in .env
- For Atlas, whitelist your IP address

### CORS Error
- Backend CORS is configured for `localhost:3000`
- Update if frontend is on different port

### Port Already in Use
- Change PORT in .env for backend
- Change port in vite.config.js for frontend

### JWT Token Not Working
- Ensure token is sent in Authorization header: `Bearer <token>`
- Check JWT_SECRET matches in .env
- Token expires in 7 days

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the dist folder
```

### Backend (Heroku/Railway)
```bash
# Ensure Procfile exists or configure for Node.js
git push heroku main
```

## 📖 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB/Mongoose Guide](https://mongoosejs.com/)
- [React Documentation](https://react.dev/)
- [JWT Authentication](https://jwt.io/)
- [Vite Documentation](https://vitejs.dev/)

## 💡 Future Enhancements

- User ratings and reviews
- Real-time notifications using WebSockets
- Image upload for food listings
- Map integration for location
- Email notifications
- Advanced filters and search
- User dashboard analytics
- Payment integration (optional)
- Pickup/delivery scheduling

## 📄 License

This project is open source and available under the MIT License.

## 👥 Contributing

Contributions are welcome! Feel free to fork this project and submit pull requests.

## 📧 Contact

For questions or suggestions, feel free to reach out.

---

**Made with ❤️ for the community. ShareBite - Reducing food waste, helping people.**

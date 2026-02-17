# Troubleshooting Guide - ShareBite

## Frontend Issues

### Port 3000 Already in Use
**Error:** `Address already in use :::3000`

**Solutions:**
1. Kill the process using the port:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:3000 | xargs kill -9
   ```

2. Or change the port in `client/vite.config.js`:
   ```javascript
   server: {
     port: 3001,  // Change to different port
     ...
   }
   ```

### White Blank Page
**Possible Causes:**
1. Backend is not running
2. API requests are failing
3. JavaScript error in console

**Solutions:**
1. Check browser console (F12) for errors
2. Ensure backend is running on port 5000
3. Check if API calls are reaching the server
4. Clear browser cache: Ctrl+Shift+Delete, then reload

### CORS Error
**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solutions:**
1. Ensure backend is running
2. Backend has CORS enabled (it should be in server.js)
3. If frontend is on different port, update vite.config.js proxy

### Can't Login/Register
**Possible Causes:**
1. Backend server not running
2. Incorrect email format
3. Password too short (minimum 6 characters)
4. MongoDB connection issue

**Solutions:**
```bash
# Check backend is running
curl http://localhost:5000/api/health

# Should return: {"message":"Server is running"}

# Check credentials
# Email must be valid format: email@domain.com
# Password must be at least 6 characters
```

### Pages Not Rendering
**Check:**
1. Are you logged in? (Protected routes require authentication)
2. Do you have the right role? (Donors can't access receiver pages)
3. Check browser console for errors

**Solution:**
- Login first
- Make sure you're using the correct role account
- Check your role: Dashboard shows your role

## Backend Issues

### Port 5000 Already in Use
**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solutions:**
1. Kill the process:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:5000 | xargs kill -9
   ```

2. Or change port in `server/.env`:
   ```
   PORT=5001
   ```

### MongoDB Connection Error
**Error:** `MongoError: connect ECONNREFUSED 127.0.0.1:27017`

**Solutions:**

1. **For Local MongoDB:**
   ```bash
   # Start MongoDB service
   
   # Windows (via MongoDB installed)
   net start MongoDB
   
   # Or if installed via WSL
   wsl.exe -d Ubuntu mongod
   
   # Mac (via Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

2. **For MongoDB Atlas:**
   - Update `.env` with Atlas connection string:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sharebite?retryWrites=true&w=majority
     ```
   - Make sure your IP is whitelisted in Atlas

3. **Check connection:**
   ```bash
   # Windows PowerShell
   Test-NetConnection localhost -Port 27017
   
   # Terminal
   mongo # or mongosh for newer versions
   ```

### Cannot Find Module Errors
**Error:** `Cannot find module 'express'` or similar

**Solutions:**
```bash
# Navigate to server directory
cd server

# Reinstall dependencies
npm install

# Or if using yarn
yarn install
```

### JWT Token Issues
**Error:** `Not authorized to access this route`

**Possible Causes:**
1. No token provided
2. Token is expired (7 days)
3. Token is malformed
4. Wrong JWT_SECRET in .env

**Solutions:**
```bash
# Check .env file has JWT_SECRET set
# Default: JWT_SECRET=your_super_secret_jwt_key_here

# Login again to get new token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Nodemon Not Working
**Error:** `nodemon is not recognized` or process doesn't auto-reload

**Solutions:**
```bash
# Reinstall nodemon globally
npm install -g nodemon

# Or use npx
npx nodemon server.js

# Or install locally
npm install -D nodemon
npm run dev
```

### "Role-based" Errors
**Error:** `Only donors can perform this action`

**Possible Causes:**
1. Using receiver token for donor-only actions
2. Using donor token for receiver-only actions

**Solutions:**
- Verify your user role in dashboard
- Create a different account with the needed role
- Pass correct token for the action you're doing

### Async/Await Errors
**Error:** `await is only valid in async functions`

**Solution:**
This shouldn't happen in our code, but if it does:
- Check that controller functions have `async` keyword
- Verify all database operations are awaited

## Database Issues

### No Data After Creating
**Problem:** Created food/request but it doesn't appear

**Solutions:**
1. Refresh the page
2. Check MongoDB directly:
   ```bash
   mongo
   use sharebite
   db.foods.find()
   db.users.find()
   ```

3. Check API response status:
   ```bash
   curl -X GET http://localhost:5000/api/foods \
     -H "Authorization: Bearer TOKEN"
   ```

### Duplicate Email/User Error
**Error:** `E11000 duplicate key error collection: sharebite.users`

**Solutions:**
1. Use a different email to register
2. Or reset the database:
   ```bash
   mongo
   use sharebite
   db.users.deleteMany({})
   db.foods.deleteMany({})
   db.foodrequests.deleteMany({})
   ```

### ObjectId Errors
**Error:** `Cast to ObjectId failed for value`

**Possible Causes:**
1. Invalid ID format in URL
2. ID doesn't exist

**Solution:**
- Copy exact ID from database/list response
- Verify ID exists before using it

## Dependencies Issues

### Module Not Found
**Error:** `Cannot find module 'axios'` or similar

**Solutions:**
```bash
# Go to the right directory
cd client    # for frontend
cd server    # for backend

# Reinstall
npm install

# Check package.json has the package listed
cat package.json | grep axios
```

### Version Conflicts
**Error:** `npm ERR! peer dep missing`

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Use different package manager
yarn install
```

## Development Issues

### Hot Reload Not Working
**Frontend:**
```bash
# Restart Vite dev server
# Ctrl + C to stop
# npm run dev to restart

# Or check vite.config.js has correct settings
```

**Backend:**
```bash
# Ensure using npm run dev (which uses nodemon)
# Not npm start

# Check server.js exists and is properly formatted
```

### CORS Errors Still Occurring
**Solution:**
Check `server/server.js` has CORS middleware:
```javascript
app.use(cors());
```

If frontend is on different domain/port, specify:
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### Routes Not Found (404)
**Error:** `Cannot POST /api/foods` or `Cannot GET /api/requests`

**Solutions:**
1. Check route file is imported in server.js
2. Verify controller files exist
3. Check middleware (auth) isn't blocking routes

Example in `server/server.js`:
```javascript
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/requests', requestRoutes);
```

## Network Issues

### Timeout Issues
**Error:** `Timeout of 5000ms exceeded` or `Network Error`

**Possible Causes:**
1. Backend is slow/hanging
2. MongoDB is slow
3. Network connectivity issue

**Solutions:**
```bash
# Check if backend is responding
curl http://localhost:5000/api/health

# Check MongoDB is running
mongo --eval "db.version()"

# Restart servers if needed
```

### Firewall Issues
**Problem:** Can't connect to MongoDB Atlas

**Solutions:**
1. Check firewall allows outbound connections
2. Add your IP to MongoDB Atlas whitelist
3. Use VPN if behind corporate firewall

## General Debugging Tips

### Enable Debug Logging
Add to `server/server.js`:
```javascript
const debug = require('debug')('app');

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

### Check Process on Port
```bash
# Find what's using a port
lsof -i :5000    # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>    # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

### MongoDB Verification
```bash
# Connect to MongoDB
mongo
# or newer versions
mongosh

# Check if running
db.version()

# See all databases
show dbs

# Switch to sharebite
use sharebite

# See collections
show collections

# Check data
db.users.find()
db.foods.find()
db.foodrequests.find()
```

### Clean Start
If everything is broken:
```bash
# Backend
cd server
rm -rf node_modules package-lock.json
npm install
npm run dev

# Frontend (in another terminal)
cd client
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Getting Help

1. **Check error message carefully** - It usually tells you what's wrong
2. **Look at browser console** (F12) for frontend errors
3. **Check terminal output** for backend errors
4. **Check MongoDB documents** to verify data is saved
5. **Try clearing cache** - Ctrl+Shift+Delete in browser
6. **Restart everything** - Kill servers, close MongoDB, start fresh

## Still Stuck?

1. Read the QUICK_START.md for setup steps
2. Read the main README.md for detailed info
3. Check API_TESTING.md for how to test endpoints
4. Check individual file comments for explanations
5. Verify all prerequisites are installed correctly

---

**Remember: Most issues are simple fixes like restarting servers or clearing cache!**

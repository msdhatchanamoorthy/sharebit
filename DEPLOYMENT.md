# ShareBite - Deployment Guide

This guide covers deploying ShareBite to production using popular platforms.

---

## 🚀 Pre-Deployment Checklist

### Code Quality
- [ ] Test all features locally
- [ ] Remove console.log statements in production code
- [ ] Update error messages for production
- [ ] Set NODE_ENV=production
- [ ] Verify all environment variables are correct

### Backend
- [ ] Use strong JWT_SECRET (minimum 32 characters)
- [ ] Set MongoDB connection to production database
- [ ] Enable HTTPS in production
- [ ] Configure CORS for actual frontend domain
- [ ] Set up proper error logging

### Frontend
- [ ] Build optimized production version: `npm run build`
- [ ] Update API base URL to production backend
- [ ] Test in production environment
- [ ] Optimize images
- [ ] Check console for errors

---

## 📱 Frontend Deployment

### Option 1: Vercel (Recommended for Vite)

1. **Build the project**
   ```bash
   cd client
   npm run build
   ```

2. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/sharebite.git
   git push -u origin main
   ```

3. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up and connect GitHub

4. **Deploy**
   - Import your GitHub repository
   - Vercel auto-detects Vite
   - Set environment variables if needed
   - Click Deploy

5. **Configure Environment**
   - In Vercel Project Settings → Environment Variables
   - Add if needed: `VITE_API_URL=https://yourbacked.herokuapp.com/api`

### Option 2: Netlify

1. **Build the project**
   ```bash
   cd client
   npm run build
   ```

2. **Create netlify.toml**
   ```toml
   [build]
   command = "npm run build"
   publish = "dist"

   [[redirects]]
   from = "/*"
   to = "/index.html"
   status = 200
   ```

3. **Deploy**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

4. **Or via Dashboard**
   - Connect GitHub repository
   - Build command: `npm run build`
   - Publish directory: `dist`

### Option 3: GitHub Pages (Static)

1. **Update vite.config.js**
   ```javascript
   export default {
     base: '/sharebite/',  // Your repo name
   }
   ```

2. **Build and deploy**
   ```bash
   npm run build
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

---

## 🔧 Backend Deployment

### Option 1: Heroku (Simple)

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   cd server
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI=mongodb+srv://...
   heroku config:set JWT_SECRET=your_production_secret_key
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **View Logs**
   ```bash
   heroku logs --tail
   ```

### Option 2: Railway

1. **Connect Repository**
   - Go to https://railway.app
   - Connect GitHub

2. **Create New Project**
   - Select your repository
   - Railway auto-detects Node.js

3. **Set Variables**
   - Go to Variables
   - Add MONGODB_URI, JWT_SECRET, NODE_ENV

4. **Deploy**
   - Push to main, Railway auto-deploys

### Option 3: DigitalOcean App Platform

1. **Create App**
   ```bash
   cd server
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Connect to GitHub**
   - Create DigitalOcean account
   - Connect GitHub
   - Select repository

3. **Configure**
   - Set HTTP port to 5000
   - Add environment variables
   - Configure MongoDB connection

4. **Deploy**
   - Click Deploy
   - DigitalOcean builds and runs

### Option 4: AWS/EC2 (Advanced)

1. **Launch EC2 Instance**
   - Ubuntu Server
   - Allow inbound: 22 (SSH), 80 (HTTP), 443 (HTTPS), 5000

2. **Connect via SSH**
   ```bash
   ssh -i key.pem ubuntu@your-ip
   ```

3. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install nodejs npm mongodb
   ```

4. **Clone and Setup**
   ```bash
   git clone your-repo
   cd server
   npm install
   ```

5. **Set Environment Variables**
   ```bash
   nano .env
   # Add: MONGODB_URI, JWT_SECRET, PORT, NODE_ENV
   ```

6. **Setup PM2 (Process Manager)**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "sharebite"
   pm2 startup
   pm2 save
   ```

7. **Setup Nginx Reverse Proxy**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/default
   ```
   
   Configure:
   ```nginx
   upstream app {
     server localhost:5000;
   }

   server {
     listen 80;
     server_name your-domain.com;

     location / {
       proxy_pass http://app;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

8. **Enable HTTPS with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up

2. **Create Cluster**
   - Free tier available
   - Choose region
   - Create cluster

3. **Create Database User**
   - Go to Database Access
   - Add User with password

4. **Whitelist IPs**
   - Go to Network Access
   - Add 0.0.0.0/0 (for development)
   - Or add specific IPs (recommended for production)

5. **Get Connection String**
   - Click Connect
   - Application - Node.js
   - Copy connection string
   - Replace `<username>`, `<password>`, `<cluster>`

6. **Update .env**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster-name.mongodb.net/sharebite?retryWrites=true&w=majority
   ```

### Self-Hosted MongoDB

1. **Install MongoDB**
   ```bash
   # On server
   curl -fsSL https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
   sudo apt-add-repository "deb [arch=amd64] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse"
   sudo apt install -y mongodb-org
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

2. **Create Admin User**
   ```bash
   mongo
   use admin
   db.createUser({user: "admin", pwd: "password", roles: ["root"]})
   ```

3. **Create App Database**
   ```bash
   use sharebite
   db.createCollection("users")
   ```

4. **Connection String**
   ```
   MONGODB_URI=mongodb://username:password@localhost:27017/sharebite
   ```

---

## 🔒 Security Checklist

- [ ] Change JWT_SECRET to strong value (32+ characters)
- [ ] Use HTTPS only in production
- [ ] Set secure cookie flags
- [ ] Enable rate limiting
- [ ] Validate all inputs
- [ ] Use environment variables, not hardcoded secrets
- [ ] Keep dependencies updated
- [ ] Monitor logs for attacks
- [ ] Use firewall to restrict access
- [ ] Enable CORS only for your frontend domain

### Add Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
// In server.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 📊 Monitoring & Logging

### Server Monitoring

```bash
# PM2 Monitoring
pm2 web  # Access http://localhost:9615 for dashboard
pm2 monit
```

### Application Errors

Add error tracking:
```bash
npm install sentry-nodejs
```

```javascript
// In server.js
const Sentry = require("@sentry/node");

Sentry.init({ 
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV 
});

app.use(Sentry.Handlers.errorHandler());
```

### MongoDB Monitoring

- Use MongoDB Atlas monitoring (free tier included)
- Monitor connection count
- Check operation performance
- Review storage usage

---

## 🔄 Continuous Integration/Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: |
          cd server
          npm install
      
      - name: Build frontend
        run: |
          cd client
          npm install
          npm run build
      
      - name: Deploy to Heroku
        env:
          HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
        run: |
          git push https://heroku:$HEROKU_API_KEY@git.heroku.com/your-app.git main
```

---

## 🧪 Production Testing

### Test Backend API
```bash
# Health check
curl https://your-api.herokuapp.com/api/health

# Test auth
curl -X POST https://your-api.herokuapp.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Frontend
- Open in multiple browsers
- Test all features
- Check mobile responsiveness
- Test with different network speeds

---

## 📋 Post-Deployment

### Update Frontend API URL

If not using relative paths, update:
```javascript
// client/src/services/api.js
const API_BASE_URL = 'https://your-api.herokuapp.com/api';
```

### Setup Custom Domain

1. Register domain (GoDaddy, Namecheap, etc.)
2. Update DNS records to point to your server/platform
3. Get SSL certificate (Let's Encrypt free)

### Monitor Production

- Set up alerts for errors
- Monitor server health
- Check database performance
- Review user feedback

---

## 🚨 Troubleshooting Deployment

### CORS Error in Production
```javascript
// server/server.js
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
```

### 502 Bad Gateway
- Backend might be down
- Port misconfiguration
- Reverse proxy issue
- Check server logs

### Database Connection Failed
- Verify MongoDB URI in environment
- Check IP whitelist in MongoDB Atlas
- Verify credentials
- Test connection string locally

### Heroku App Logs
```bash
heroku logs --tail --app your-app-name
```

---

## 💰 Cost Estimation

### Free Tier Services
- **Frontend**: Vercel, Netlify (free tier)
- **Backend**: Heroku (paid, but small apps ~$7/month)
- **Database**: MongoDB Atlas (free tier: 512MB storage)

### Paid Options (Scalable)
- **Frontend**: Vercel ($20+/month)
- **Backend**: AWS/Railway ($10-50+/month)
- **Database**: MongoDB Atlas ($57+/month)

---

## 📚 Additional Resources

- [Heroku Documentation](https://devcenter.heroku.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [AWS Documentation](https://docs.aws.amazon.com/)

---

**Happy deploying! Your ShareBite app is ready for the world! 🚀**

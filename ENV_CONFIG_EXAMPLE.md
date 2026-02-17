# Example Environment Configuration for Phone OTP Login

This is a template for configuring Firebase Phone Authentication.

## Copy to: client/.env.local

```env
# ============================================
# Firebase Configuration for Phone OTP Login
# ============================================

# Get these values from Firebase Console:
# 1. Go to https://console.firebase.google.com
# 2. Select your project
# 3. Click Settings (gear icon) → Project Settings
# 4. Copy values from Web API Key section

NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# Optional: Cloud Storage configuration (if using file uploads)
# NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_URL=https://storage.googleapis.com/your-project.appspot.com
```

## How to Find Your Values

### Step 1: Go to Firebase Console
```
https://console.firebase.google.com
```

### Step 2: Select Your Project
- Click on your project name

### Step 3: Get Web Config
- Click the Settings icon (⚙️) → Project Settings
- Scroll to "Your apps" section
- Look for your Web app
- Click "Config" button
- Copy all the values

### Step 4: Paste Into .env.local
- Create file: `client/.env.local`
- Copy the template above
- Replace with your actual values from Firebase

## Where to Find Each Value

```
Firebase Config          → Environment Variable
===========================→=====================================
apiKey                   → NEXT_PUBLIC_FIREBASE_API_KEY
authDomain               → NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
projectId                → NEXT_PUBLIC_FIREBASE_PROJECT_ID
storageBucket            → NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
messagingSenderId        → NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
appId                    → NEXT_PUBLIC_FIREBASE_APP_ID
```

## Example with Real Values

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDk1yMQjH8M9pQ7rT3vW4x5yZ9aBcDeF1GhI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sharebit-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sharebit-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sharebit-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

## Important Notes

⚠️ **Security Considerations:**

1. **These values are PUBLIC** - It's normal and expected to see them in client-side code
   - Firebase is designed this way
   - The API Key alone cannot compromise your database
   - Security comes from Firebase Rules and Authentication

2. **Never share your complete Firebase config** with others
   - But these public values are OK to commit to Git
   - The NEXT_PUBLIC_ prefix means they're public

3. **Never expose:**
   - Private keys from service account JSON
   - Firebase Admin SDK credentials
   - Database credentials

4. **Add to .gitignore:**
   - Private service account keys
   - Admin credentials
   - Database connection strings (server only)

## Verification Checklist

After setting up .env.local:

- [ ] File created at `client/.env.local`
- [ ] All 6 Firebase values filled in
- [ ] Values have no extra spaces or quotes
- [ ] Dev server restarted after creating .env.local
- [ ] Can access `/auth/phone` page
- [ ] Phone login page loads without errors
- [ ] Check browser console (F12) for Firebase initialization messages

## Testing Your Configuration

### Method 1: Browser Console Check

1. Open http://localhost:3003/auth/phone
2. Press F12 (Open DevTools)
3. Go to Console tab
4. Look for messages:
   ```
   [Firebase] Firebase initialized successfully
   [PhoneLogin] reCAPTCHA initialized
   ```

### Method 2: Test Phone Login

1. Visit http://localhost:3003/auth/phone
2. Enter test phone: `9876543210` (automatically adds +91)
3. Click "Send OTP"
4. You should see success message
5. Enter test OTP: `123456`
6. Should verify successfully

## Troubleshooting Missing Config

### Issue: "Firebase not initialized"

**Check:**
1. Is .env.local file created? ✓
2. Are all 6 variables present? ✓
3. Did you restart `npm run dev`? ✓

**Solution:**
```bash
# In client directory
npm run dev   # Restart server
# Ctrl+C to stop, then npm run dev
```

### Issue: "Invalid API Key"

**Check:**
- Copy from Firebase Console again
- No extra spaces or quotes
- For API Key specifically - it's an alphanumeric string starting with "AIza"

### Issue: "reCAPTCHA container not found"

**Check:**
1. Firebase config is present (see above)
2. DOM is ready before Firebase init
3. Clear browser cache and reload

## Multiple Environments

### Development (.env.local)
```env
# Development Firebase project
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...dev...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sharebit-dev
```

### Staging (.env.staging)
```env
# Staging Firebase project
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...staging...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sharebit-staging
```

### Production (.env.production)
```env
# Production Firebase project
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...prod...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sharebit-production
```

## Server-Side Configuration

If needed for backend verification (optional):

```env
# server/.env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
# OR
FIREBASE_ADMIN_SDK_PATH=/path/to/serviceAccountKey.json
```

## Git Management

### .gitignore entries

```gitignore
# Environment files (can contain sensitive info)
.env
.env.local
.env.*.local

# BUT DO commit these:
# .env.example (template for team)
# Docs about setup

# Never commit:
# firebasePrivateKey.json
# serviceAccountKey.json
# firebase-adminsdk-*.json
```

## Sharing Configuration with Team

### Safe Way to Share

1. **Create .env.example** with placeholder values:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=our-project.firebaseapp.com
   # ... etc
   ```

2. **Commit .env.example** to Git

3. **Share actual .env.local values** via:
   - Email (encrypted)
   - Slack (private message)
   - Password manager
   - Firebase Console (collaborator access)

4. **Team members:**
   - Clone repo
   - Copy .env.example to .env.local
   - Fill in values from `.env.example`

## Quick Setup Script

If you'd like to automate setup:

```bash
#!/bin/bash
# setup-firebase.sh

echo "Setting up Firebase configuration..."

read -p "Enter Firebase API Key: " API_KEY
read -p "Enter Firebase Auth Domain: " AUTH_DOMAIN
read -p "Enter Firebase Project ID: " PROJECT_ID
read -p "Enter Firebase Storage Bucket: " STORAGE_BUCKET
read -p "Enter Firebase Messaging Sender ID: " SENDER_ID
read -p "Enter Firebase App ID: " APP_ID

cat > client/.env.local << EOF
NEXT_PUBLIC_FIREBASE_API_KEY=$API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=$PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=$APP_ID
EOF

echo "✅ .env.local created successfully!"
echo "🚀 Ready to run: npm run dev"
```

## Support

- **Firebase Console**: https://console.firebase.google.com
- **Firebase Docs**: https://firebase.google.com/docs
- **Project Settings**: https://console.firebase.google.com/project/[your-project-id]/settings/general

## Next Steps

1. ✅ Create client/.env.local with values
2. ✅ Restart dev server
3. ✅ Visit /auth/phone
4. ✅ Test phone login
5. ✅ Set up test numbers in Firebase for testing
6. ✅ Configure reCAPTCHA if needed
7. ✅ Deploy to production with production Firebase project

---

**Need help?** Check [FIREBASE_PHONE_AUTH_SETUP.md](../FIREBASE_PHONE_AUTH_SETUP.md) for complete setup guide.

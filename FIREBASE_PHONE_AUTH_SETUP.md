# Firebase Phone OTP Authentication Setup Guide

This guide will help you set up Firebase Phone Authentication for the ShareBit application.

## Prerequisites

- Firebase account (create at https://firebase.google.com)
- GCP (Google Cloud Platform) project associated with your Firebase project
- Phone numbers for testing (optional but recommended)

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter your project name (e.g., "sharebit-phase6")
4. Accept the terms and click "Create project"
5. Wait for the project to be created

## Step 2: Register Your Web App

1. In Firebase Console, click the web icon (`</>`)`
2. Enter your app name (e.g., "ShareBit Web")
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. Firebase will provide your config object - **SAVE THIS**

Your config will look like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

## Step 3: Enable Phone Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click **Phone** from the provider list
3. Toggle it **ON**
4. Click **Save**

### Enable Phone Testing (Development Only)

1. In **Authentication** → **Sign-in method** → **Phone**
2. Scroll down to "Phone numbers for testing"
3. Add test numbers with OTP codes:
   - Phone: `+919876543210` (example India number)
   - OTP: `123456` (any 6-digit code)
4. Click **Save** (You can now test without sending real SMS)

## Step 4: Set up reCAPTCHA

### For Firebase Phone Authentication

1. Go to **Authentication** → **Settings**
2. Click **Web API setup** under "reCAPTCHA"
3. Enable "Enterprise" or "Score-based"
4. Create or select a reCAPTCHA key
5. Copy the site key and secret key

### Add reCAPTCHA to HTML (if needed)

Add to your `public/index.html` or `app/layout.tsx`:
```html
<script src="https://www.google.com/recaptcha/api.js" async defer></script>
```

## Step 5: Configure Environment Variables

Create or update `.env.local` in the client directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

⚠️ **Important**: Use `NEXT_PUBLIC_` prefix - these values are visible in client-side code (this is normal and expected for Firebase)

## Step 6: Backend Configuration

Update your `.env` file in the server directory if needed:

```env
# Firebase Service Account (optional, for server-side verification)
# Get this from Firebase Console → Project Settings → Service Accounts
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

## Step 7: Test the Implementation

### Test Phone Login

1. Go to `http://localhost:3003/auth/phone`
2. Enter a test phone number with `+91` prefix
3. Use the test OTP provided in Firebase console

### Test with Real Numbers

To test with real phone numbers (costs money):

1. Go to Firebase Console → **Billing**
2. Ensure billing is enabled in GCP
3. Phone authentication will send real SMS

### Frontend Testing

```bash
# In your project
cd client
npm run dev

# Visit http://localhost:3003/auth/phone
```

## Step 8: Security Rules & Best Practices

### Set Authentication Rules (Optional)

1. Go to **Authentication** → **Settings**
2. Configure:
   - Maximum SMS per phone: 5 (default)
   - Maximum SMS per IP: 100 (default)
   - Session expiration: 10 minutes (default)

### Production Checklist

- [ ] Add your domain to Firebase Console → Authentication → Settings → Authorized domains
- [ ] Enable reCAPTCHA (v3 recommended)
- [ ] Set up email notifications for suspicious activity
- [ ] Configure backup phone numbers for admins
- [ ] Enable Cloud Audit Logs
- [ ] Create App Check rules for API security

## Troubleshooting

### Issue: "reCAPTCHA not initialized"

**Solution:** Make sure the container div is rendered before Firebase initialization:
```tsx
<div ref={recaptchaContainerRef}></div>
```

### Issue: "Invalid phone number format"

**Solution:** Ensure using full international format:
```
✅ +919876543210 (correct)
❌ 9876543210 (missing country code)
❌ 01234567890 (wrong format)
```

### Issue: "Too many login attempts"

**Solution:** Wait for the cooldown period or change IP address

### Issue: "OTP expired"

**Solution:** OTP valid for 10 minutes. Request a new one if expired.

### Issue: "Firebase not initialized"

**Solution:** Check that NEXT_PUBLIC_* environment variables are set correctly

## Testing with Different Countries

Phone numbers must include country code:
- India: `+91` followed by 10 digits
- US: `+1` followed by 10 digits
- UK: `+44` followed by 10 digits

## API Endpoints

### Frontend
- `GET /auth/phone` - Phone login page
- `POST /auth/sign-with-phone-number(auth, phone, recaptchaVerifier)` - Send OTP
- `POST /confirmationResult.confirm(otp)` - Verify OTP

### Backend
- `POST /api/auth/phone-login` - Create/login user with phone
  ```json
  {
    "firebaseUid": "user_uid",
    "phoneNumber": "+919876543210",
    "name": "John Doe",
    "email": "john@example.com",
    "location": "Delhi"
  }
  ```

## Database Schema Updates

The User model now includes:
- `phoneNumber`: String (unique, optional)
- `firebaseUid`: String (unique, optional)
- `password`: Now optional (null for phone auth users)
- `email`: Now optional (auto-generated if not provided)

## File Structure

```
client/
├── lib/
│   └── firebase.ts (Firebase config & exports)
├── components/
│   └── PhoneLogin.tsx (Phone login component)
├── app/auth/
│   └── phone/
│       └── page.tsx (Phone login page)
├── .env.local (Firebase credentials)

server/
├── models/
│   └── User.js (Updated with phone fields)
├── routes/
│   └── authRoutes.js (Added /phone-login endpoint)
└── controllers/
    └── authController.js (Added phoneLogin function)
```

## Security Considerations

1. **Never expose service account keys** in client-side code
2. **Use reCAPTCHA** to prevent abuse
3. **Enable rate limiting** on backend API
4. **Validate phone format** on both client and server
5. **Store Firebase UID** securely in database
6. **Use HTTPS only** in production
7. **Enable two-factor authentication** for Firebase Console

## Support & Resources

- [Firebase Phone Authentication Docs](https://firebase.google.com/docs/auth/web/phone-auth)
- [Firebase Console](https://console.firebase.google.com)
- [reCAPTCHA Documentation](https://www.google.com/recaptcha/admin)
- [GCP Billing Setup](https://cloud.google.com/billing/docs)

## Next Steps

After setup, you can:
1. Test phone login at `/auth/phone`
2. Monitor usage in Firebase Console → Analytics
3. Set up SMS templates if using custom sender ID
4. Implement phone verification flow
5. Add two-factor authentication
6. Create backup login methods

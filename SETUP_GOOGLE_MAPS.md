# Google Maps Integration Setup Guide

## Overview
ShareBite's AvailableFood page now features real-time location mapping using Google Maps API. This guide will help you set up the required API key.

## Prerequisites
- Active Google Account with billing enabled
- Access to [Google Cloud Console](https://console.cloud.google.com/)

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top (next to "Google Cloud")
3. Click **"NEW PROJECT"**
4. Enter project name: `ShareBite` (or your preference)
5. Click **"CREATE"**
6. Wait for the project to be created (may take a minute)
7. Select your new project from the dropdown

### 2. Enable Maps JavaScript API

1. In the Cloud Console, go to **APIs & Services** > **Library**
2. Search for **"Maps JavaScript API"**
3. Click on it
4. Click the **"ENABLE"** button
5. Wait for it to be enabled (progress indicator at the top)

### 3. Create an API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **"+ CREATE CREDENTIALS"** > **"API key"**
3. A pop-up will show your new API key
4. Click **"COPY"** to copy the key (or come back later via Credentials page)
5. Click **"RESTRICT KEY"** to configure restrictions (optional but recommended)

### 4. Optional: Restrict Your API Key

For security, restrict your key to web applications only:

1. In the Credentials page, click your API key
2. Under **"Application restrictions"**, select **"HTTP referrers (websites)"**
3. Add your domain(s):
   - For development: `http://localhost:5173/*` (or your dev port)
   - For production: `https://yourdomain.com/*`
4. Under **"API restrictions"**, select **"Maps JavaScript API"**
5. Click **"SAVE"**

### 5. Add API Key to ShareBite

#### Option A: Using Environment File (Recommended)

1. In your `client/` directory, create a `.env.local` file:

```bash
cp client/.env.example client/.env.local
```

2. Edit `client/.env.local` and replace:

```
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

3. Restart your development server:

```bash
npm run dev
```

#### Option B: Direct Configuration

Edit `client/src/pages/AvailableFood.jsx` line 8:

```javascript
const GOOGLE_MAPS_API_KEY = 'your_actual_api_key_here';
```

⚠️ **Note:** Option B is not recommended for production as it exposes your API key in source code.

### 6. Test the Setup

1. Start your development server:
```bash
npm run dev
```

2. Navigate to the **"Find Food Near You"** page
3. You should see:
   - A Google Map displaying your location (blue dot)
   - Food markers (orange dots) for nearby listings
   - Food cards on the right side
   - Distance calculations in kilometers

4. Test the features:
   - Change the search radius dropdown (2km, 5km, 10km, 20km)
   - Click markers on the map
   - Click cards to highlight on map
   - Request food

## Features Enabled by Maps Integration

✅ **Real-time Location Display**
- Shows your current location with a blue marker
- Auto-centers map on startup

✅ **Geospatial Search**
- Finds food within configurable radius (2-20km)
- Calculates accurate distance using Haversine formula

✅ **Interactive Map Markers**
- Click markers to view food details
- Orange markers indicate food locations
- Marker color changes on selection

✅ **Synchronized Map-Card UI**
- Click map marker → highlights food card
- Click food card → centers map on location
- Visual feedback for user interactions

✅ **Distance Display**
- Shows distance in kilometers
- Calculated from your location to food location
- Updated in real-time based on search radius

## Troubleshooting

### "Google Maps API Key Required" Message on Page
**Solution:** 
- Ensure `VITE_GOOGLE_MAPS_API_KEY` is set in `.env.local`
- Check that the key is valid and contains no extra spaces
- Restart your development server after updating `.env.local`

### Map Not Loading
**Possible causes:**
- API key is invalid or expired
- Maps JavaScript API not enabled in Google Cloud Console
- API key hasn't been created yet
**Solution:** Verify steps 2-3 above

### "Geolocation not supported" Error
**Possible causes:**
- Not using HTTPS in production
- Browser geolocation disabled
- Location permission denied
**Solution:** 
- Allow location access when browser prompts
- For production, ensure HTTPS is enabled
- Check browser geolocation settings

### High API Costs
**Note:** Google Maps API usage may incur charges based on your quota. 
- Monitor usage in **APIs & Services** > **Quotas**
- Set billing alerts in **Billing** > **Budget alerts**
- Consider setting API quotas to limit requests
- Free tier includes up to 28,000 map loads per month

## API Quota and Limits

Free tier (first 28,000 map loads/month):
- Maps JavaScript API: $0.007 per map load (after free tier)
- Geolocation: Included in browser, no API charges

Monitor your usage:
1. Go to **APIs & Services** > **Quotas**
2. Check **Maps JavaScript API** quota
3. Set up billing alerts to avoid surprises

## Security Best Practices

1. ✅ Always use `.env.local` file (not `.env` which is version controlled)
2. ✅ Restrict API key to website HTTP referrers
3. ✅ Enable only required APIs (Maps JavaScript API)
4. ✅ Monitor API usage regularly
5. ✅ Rotate keys periodically in production
6. ✅ Never commit raw API keys to version control

## Disabling Maps (Optional)

If you want to use the old list view without maps:

1. Change `client/src/App.jsx` route for AvailableFood to use an older version
2. The backend geospatial search (`/foods/nearby/search`) remains functional
3. Fallback to `foodAPI.getAllFoods()` for list-only view

## Next Steps

1. ✅ Complete the API key setup above
2. ✅ Test the map features on the AvailableFood page
3. ✅ Configure API restrictions for production
4. ✅ Monitor API usage and costs

## Support

For issues with:
- **Google Maps API:** See [Google Maps Documentation](https://developers.google.com/maps/documentation/javascript)
- **ShareBite Integration:** Check the application logs and browser console
- **Geolocation:** Verify browser permissions and HTTPS usage

## File References

- Configuration: `client/.env.local`
- Frontend Component: `client/src/pages/AvailableFood.jsx`
- Backend Endpoint: `server/routes/foodRoutes.js` (GET /foods/nearby/search)
- API Service: `client/src/services/api.js` (foodAPI.getNearbyFoods)

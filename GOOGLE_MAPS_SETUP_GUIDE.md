# Google Maps Setup Guide for ShareBit

## Overview
ShareBit now includes an interactive Google Map view for visualizing food locations. Follow these steps to set up Google Maps API.

## Step 1: Get Your Google Maps API Key

### Option A: If you already have a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Click **+ Create Credentials** → **API Key**
5. Copy your API key

### Option B: Create a new Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project selector and create a new project
3. Name it "ShareBit" (or your preferred name)
4. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
5. Go to **APIs & Services** → **Credentials**
6. Click **+ Create Credentials** → **API Key**
7. Copy your API key

## Step 2: Enable Required APIs

In the Google Cloud Console, make sure these APIs are enabled:
- ✅ Maps JavaScript API
- ✅ Places API (optional, for advanced features)

## Step 3: Set Up Restrictions (Recommended for Production)

### Application Restrictions
1. In Credentials, click on your API Key
2. Set **Application restrictions** to:
   - **HTTP referrers (web sites)**
   - Add your domain(s):
     - `localhost:3000` (development)
     - `yourdomain.com` (production)
     - `www.yourdomain.com` (production)

### API Restrictions
Select only:
- ✅ Maps JavaScript API
- ✅ Geocoding API (if needed)

## Step 4: Configure Environment Variables

### Create `.env.local` in the `/client` directory

```bash
# /client/.env.local

# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

**Important**: 
- Replace `YOUR_API_KEY_HERE` with your actual API key
- The `NEXT_PUBLIC_` prefix makes it available to the browser
- This variable is required for the map to work

## Step 5: Restart Your Development Server

```bash
cd client
npm run dev
```

## Testing the Map

1. Navigate to `/foods/available` page
2. You should see a **Grid View** and **Map View** toggle
3. Click **Map View** to display the interactive Google Map
4. Your location should appear as a **blue circle**
5. Food locations appear as **orange circles** (available) or **red circles** (requested)

## Troubleshooting

### "Google Maps API Key Missing"
- Ensure `.env.local` exists in the `/client` directory
- Check that `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set correctly
- Restart the development server after changing `.env.local`

### Map not rendering / blank map
- Check browser console for errors (F12 → Console)
- Verify:
  - ✅ API key is valid
  - ✅ Maps JavaScript API is enabled in Google Cloud Console
  - ✅ Food items have valid latitude/longitude coordinates
  - ✅ Map div has proper height (500px)

### "Oops! Something went wrong"
- Google API quota exceeded - check Google Cloud Console usage
- API key restrictions might be blocking your domain
- Verify the API key has Maps JavaScript API enabled

### Coordinates not showing on map
- Ensure food items have valid:
  - Latitude: between -90 and 90
  - Longitude: between -180 and 180
- Check server is returning latitude/longitude with food data

## Production Deployment

### Before going live:
1. ✅ Set API key restrictions to your production domain
2. ✅ Remove localhost from referrer restrictions
3. ✅ Enable HTTPS only
4. ✅ Set appropriate API quotas in Google Cloud Console
5. ✅ Monitor usage to avoid unexpected charges

### Environment Setup
```bash
# In production server environment
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-production-api-key
```

## API Cost Considerations

Free tier includes:
- Maps JavaScript API: First 25,000 requests/day free
- Geocoding API: First 25,000 requests/day free

For higher usage, set up billing and quotas in Google Cloud Console.

## Additional Features You Can Add

1. **Geocoding**: Convert addresses to coordinates
2. **Places API**: Search for nearby places
3. **Distance Matrix**: Calculate distances between points
4. **Directions**: Show routes between locations

See the GoogleMapView component in `/app/foods/available/map/GoogleMapView.tsx` for the current implementation.

## Contact & Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all steps above
3. Ensure your API key is active in Google Cloud Console

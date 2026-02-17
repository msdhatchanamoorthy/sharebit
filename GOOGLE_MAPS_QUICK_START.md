# 🗺️ Google Maps Integration Quick Start

## What's New in ShareBite?

The **AvailableFood** page now features an interactive Google Maps interface with real-time location-based food discovery!

## ⚡ Quick Setup (5 minutes)

### 1. Get a Google Maps API Key
- Go to: https://console.cloud.google.com/
- Create a new project
- Enable "Maps JavaScript API"
- Create an API key

### 2. Configure ShareBite
```bash
# In client/ directory
cp .env.example .env.local
```

Edit `.env.local` and add your API key:
```
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

### 3. Restart Frontend
```bash
npm run dev
```

## 🎯 Features

**For Receivers (Food Seekers):**
- 📍 See your location on the map
- 🍎 Find food nearby (2-20km radius)
- 🗺️ Interactive markers show food locations
- 📊 Distance calculated in real-time
- 🔄 Sync between map markers and food cards

**Backend Capability:**
- ⚙️ New endpoint: `GET /foods/nearby/search?lat=X&lng=Y&distance=D`
- 🗄️ MongoDB geospatial indexing (2dsphere)
- 📏 Haversine distance calculation

## 🔧 Configuration

### Environment Variables (client/.env.local)
```env
# Required: Your Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...

# Optional: Backend API URL (defaults to http://localhost:5000)
VITE_API_BASE_URL=http://localhost:5000
```

### API Endpoint Behavior
```javascript
// Get foods near user location
GET /foods/nearby/search?lat=40.7128&lng=-74.0060&distance=5000

// Response includes distance calculation
{
  foods: [
    {
      _id: "...",
      title: "Pizza Slices",
      location: { coordinates: [lng, lat] },
      distanceKm: 2.3,  // ← NEW: Distance in km
      ...
    }
  ]
}
```

## 📝 File Structure

```
moodify/
├── client/
│   ├── src/
│   │   └── pages/
│   │       └── AvailableFood.jsx          ✨ Updated with Google Maps UI
│   ├── .env.local                         ← Create this file
│   └── .env.example                       ← Reference (added)
│
├── server/
│   ├── models/
│   │   └── Food.js                        ✨ Updated with GeoJSON location
│   ├── controllers/
│   │   └── foodController.js              ✨ Added getNearbyFoods function
│   └── routes/
│       └── foodRoutes.js                  ✨ Added /nearby/search endpoint
│
└── SETUP_GOOGLE_MAPS.md                   ← Detailed setup guide
```

## 🧪 Testing

### Test Geolocation
1. Open DevTools (F12)
2. Go to Sensors tab > Location
3. Select or customize a location
4. Refresh the page

### Test Without Maps API Key
1. Page will show setup instructions
2. Provides link to Google Cloud Console
3. Shows required configuration steps

### Test Distance Filter
1. Use the dropdown to change radius (2km, 5km, 10km, 20km)
2. Food list updates automatically
3. Distances recalculate based on new files

## ⚠️ Important Notes

### Billing
- Free tier: 28,000 map loads/month
- After free tier: ~$0.007 per map load
- Set billing alerts in Google Cloud Console

### Security
- API key restricted to website domains only (recommended)
- Don't commit `.env.local` to git
- Use `.env.example` for team reference
- Rotate keys periodically in production

### Browser Compatibility
- Works on all modern browsers (Chrome, Firefox, Safari, Edge)
- Requires geolocation permission (users can deny)
- Falls back gracefully if location unavailable

## 🚀 Production Deployment

### Before Going Live:
1. ✅ Get production domain API key from Google
2. ✅ Add domain to API key restrictions
3. ✅ Enable HTTPS (required for geolocation)
4. ✅ Set up billing alerts
5. ✅ Test geolocation on production domain
6. ✅ Configure `.env` files on server

### Environment Setup:
```env
# Production .env.local
VITE_GOOGLE_MAPS_API_KEY=AIzaSy... (production key)
VITE_API_BASE_URL=https://yourdomain.com/api
```

## 📚 Documentation

For more detailed information, see:
- [SETUP_GOOGLE_MAPS.md](./SETUP_GOOGLE_MAPS.md) - Complete setup guide
- [Google Maps Docs](https://developers.google.com/maps/documentation/javascript)
- AvailableFood.jsx source code for implementation details

## 💡 Tips

1. **Slow Map Loading?** Check API quota in Google Cloud Console
2. **No Foods Showing?** Try increasing search radius
3. **Location Wrong?** Check browser geolocation permissions
4. **Map Bugs?** Clear cache and restart dev server
5. **Cost Too High?** Set API quota limits in Google Cloud

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Map shows "API Key Required" | Add VITE_GOOGLE_MAPS_API_KEY to .env.local |
| "Geolocation not supported" | Allow location access or use test location in DevTools |
| Map blank/gray | Check Maps JavaScript API is enabled in Google Cloud |
| No foods appearing | Increase search radius or add test food data |
| High API costs | Set quota limits and monitor usage |

## ✨ Next Steps

1. Complete Step 2 of Quick Setup above
2. Visit the "Find Food Near You" page to test
3. For detailed setup, read [SETUP_GOOGLE_MAPS.md](./SETUP_GOOGLE_MAPS.md)
4. For production, follow the "Production Deployment" section above

---

**Questions?** Check the detailed [SETUP_GOOGLE_MAPS.md](./SETUP_GOOGLE_MAPS.md) guide or the troubleshooting section above.

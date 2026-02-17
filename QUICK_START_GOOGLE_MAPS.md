# ⚡ Google Maps - QUICK START (2 Minutes)

## 🎯 Do This Now

### 1️⃣ Install Package
```bash
cd client
npm install
```

### 2️⃣ Create Env File
```bash
# Go to /client directory and create .env.local:
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE
```

### 3️⃣ Get Your Key
Need a Google Maps API key? [Click here for 5-min setup](./GOOGLE_MAPS_SETUP_GUIDE.md)

### 4️⃣ Test It
```bash
npm run dev
# Go to http://localhost:3000/foods/available
# Click "Map View" button
# Allow location access
# 🗺️ Done!
```

---

## ✅ What You'll See

- Grid View (original) ✓
- **Map View (new)** with:
  - 🔵 Your location (blue)
  - 🟠 Nearby food (orange/red)
  - Click markers to see details
  - Zoom/pan/fullscreen controls

---

## 🆘 Not Working?

### Check These:
1. ✅ `npm install` completed?
2. ✅ `.env.local` file exists?
3. ✅ API key is in `.env.local`?
4. ✅ Restarted `npm run dev`?
5. ✅ Allowed browser location access?

### Still stuck?
- Check browser console (F12) for error messages
- See full guide in `GOOGLE_MAPS_SETUP_GUIDE.md`

---

That's it! Your map should be working. 🎉

# FolioCraft Backend — Complete Setup Guide

## 📁 Folder Structure

```
foliocraft-backend/
├── server.js              ← Main server file
├── package.json           ← Dependencies
├── vercel.json            ← Vercel config
├── .env.example           ← Environment variables template
├── config/
│   └── database.js        ← MongoDB connection
├── models/
│   ├── User.js            ← User schema
│   └── Portfolio.js       ← Portfolio schema
├── middleware/
│   └── auth.js            ← JWT verification
├── routes/
│   ├── auth.js            ← Register, Login, Profile
│   ├── portfolio.js       ← Save, Load, Publish
│   ├── public.js          ← Share link view
│   └── analytics.js       ← Views & stats
└── frontend-integration/
    ├── api.js             ← Frontend mein add karo
    └── auth-modal.html    ← Login/Register UI
```

---

## 🚀 STEP BY STEP SETUP

### Step 1: MongoDB Atlas Setup (Free Database)

1. **https://mongodb.com/atlas** pe jao
2. **"Try Free"** click karo → Account banao
3. **"Create a New Cluster"** → **M0 (Free Forever)** select karo
4. Region: **Singapore ya Mumbai** (Pakistan ke liye nearest)
5. Cluster banao (2-3 min lagti hai)

#### Database User banao:
- Left panel → **Database Access** → **Add New Database User**
- Username: `foliocraft_user`
- Password: koi strong password
- Role: **Read and write to any database**
- **Add User** click karo

#### Network Access:
- Left panel → **Network Access** → **Add IP Address**
- **"Allow Access From Anywhere"** (0.0.0.0/0) → Confirm
  > ⚠️ Production mein specific IPs allow karo

#### Connection String lo:
- **Database** → **Connect** → **Connect your application**
- Driver: **Node.js** → Version: **4.1 or later**
- Connection string copy karo:
  ```
  mongodb+srv://foliocraft_user:<password>@cluster0.xxxxx.mongodb.net/foliocraft
  ```
- `<password>` ki jagah apna actual password dalo

---

### Step 2: Backend Deploy to Vercel

1. **GitHub account** banao (agar nahi hai)
2. Backend folder ko GitHub repo mein push karo:
   ```bash
   cd foliocraft-backend
   git init
   git add .
   git commit -m "Initial backend setup"
   # GitHub pe new repo banao, phir:
   git remote add origin https://github.com/YOUR_USERNAME/foliocraft-backend.git
   git push -u origin main
   ```

3. **https://vercel.com** jao → **Continue with GitHub**
4. **"New Project"** → Apna repo import karo
5. **Environment Variables** add karo (Vercel dashboard mein):

   ```
   MONGODB_URI    = mongodb+srv://...your connection string...
   JWT_SECRET     = a-very-long-random-secret-string-at-least-32-chars
   JWT_EXPIRES_IN = 30d
   FRONTEND_URL   = https://your-frontend-url.vercel.app
   APP_BASE_URL   = https://your-backend.vercel.app
   NODE_ENV       = production
   ```

6. **Deploy** click karo!
7. Vercel aapko ek URL dega: `https://foliocraft-backend-xxx.vercel.app`

---

### Step 3: Frontend Mein Backend Connect Karo

#### 3a. `api.js` add karo:
- `frontend-integration/api.js` file copy karo
- Apne frontend folder mein rakho
- **Line 7** update karo:
  ```javascript
  const API_URL = 'https://your-actual-backend.vercel.app/api';
  ```

#### 3b. `index.html` update karo:
```html
<!-- </body> se pehle add karo -->
<script src="api.js"></script>

<!-- Nav mein theme-btn se pehle add karo: -->
<div class="nav-user" id="navUser">
  <button class="nav-login-btn" id="navLoginBtn">Login / Register</button>
  <div class="nav-user-info" id="navUserInfo" style="display:none">
    <span class="nav-user-name" id="navUserName">User</span>
    <button class="nav-logout-btn" id="navLogoutBtn">Logout</button>
  </div>
</div>
```

#### 3c. Auth modal add karo:
- `auth-modal.html` ka content copy karo
- `index.html` ke `</body>` se pehle paste karo

#### 3d. `wizard.js` mein save function update karo:
Wizard ke **Finish button** ke paas jahan `localStorage.setItem('portfolioData', ...)` hai, wahan ke baad yeh add karo:
```javascript
// Server pe bhi save karo
if (window.FolioAPI && window.FolioAPI.isLoggedIn()) {
  try {
    await window.FolioAPI.savePortfolio(portfolioData);
    toast('Portfolio cloud mein save ho gaya! ☁️', 'success');
  } catch(err) {
    console.warn('Cloud save failed:', err.message);
    // Local save hoga, koi baat nahi
  }
}
```

#### 3e. `wizard.html` mein bhi add karo:
```html
<script src="api.js"></script>
```

---

### Step 4: Test Karo

1. Browser mein `index.html` kholo
2. **"Login / Register"** click karo
3. Register karo
4. Wizard fill karo
5. **Test API**: Browser console mein:
   ```javascript
   fetch('https://your-backend.vercel.app/api/health')
     .then(r => r.json()).then(console.log)
   ```
   Response: `{ status: "ok", message: "FolioCraft Backend chal raha hai!" }`

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| GET | `/api/auth/me` | My profile | ✅ |
| PUT | `/api/auth/change-password` | Password change | ✅ |
| GET | `/api/portfolio` | Portfolio load | ✅ |
| PUT | `/api/portfolio` | Portfolio save | ✅ |
| POST | `/api/portfolio/publish` | Publish karo | ✅ |
| GET | `/api/portfolio/share-link` | Share link | ✅ |
| GET | `/api/public/p/:shareId` | Public view | ❌ |
| GET | `/api/analytics/overview` | Stats | ✅ |
| GET | `/api/health` | Health check | ❌ |

---

## ❓ Common Problems & Fixes

### "MongoDB connection failed"
→ Check karo: MONGODB_URI sahi hai? Password mein `@` ya `#` hain to URL encode karo.
→ Network Access mein `0.0.0.0/0` allow hai?

### "CORS error in browser"
→ Vercel mein `FRONTEND_URL` environment variable mein apna frontend URL sahi daalo.

### "JWT_SECRET not set"
→ Vercel dashboard → Project → Settings → Environment Variables check karo.

### "404 on Vercel"
→ `vercel.json` file project root mein hai? Sahi content hai?

---

## 🔒 Security Notes (Production ke liye)

1. `JWT_SECRET` minimum 64 random characters ka hona chahiye
2. MongoDB Network Access mein specific IPs allow karo
3. Rate limiting already set hai (100 req/15min)
4. Passwords bcrypt se hash hote hain (12 rounds)

---

## 📊 Database Collections

MongoDB mein yeh collections ban jaenge automatically:
- `users` - User accounts
- `portfolios` - Portfolio data + analytics

---

Good luck! Koi bhi problem ho to API documentation check karo ya console errors dekho. 🚀

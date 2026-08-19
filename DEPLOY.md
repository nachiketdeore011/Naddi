# Deploy NADI.AI to Vercel (Frontend) + Railway (Backend)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Vercel (Frontend)                                      │
│  https://nadi.vercel.app                                │
│  React + Vite + Tailwind + Three.js                     │
│                                                         │
│  /api/* ──────────────────────────────────┐             │
└───────────────────────────────────────────┼─────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────┐
│  Railway (Backend)                                      │
│  https://nadi-backend-production.up.railway.app         │
│  FastAPI + SQLite/PostgreSQL                            │
│                                                         │
│  POST /api/patients/          Create patient            │
│  POST /api/pulse/session      Create pulse session      │
│  POST /api/pulse/analyze/:id  Run analysis              │
│  POST /api/pulse/save-analysis Save results             │
│  GET  /api/health             Health check              │
└─────────────────────────────────────────────────────────┘
```

---

## Step 1: Deploy Backend to Railway

### 1.1 Push to GitHub
```bash
cd Nadii
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/nadii.git
git push -u origin main
```

### 1.2 Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click **New Project** → **Deploy from GitHub repo**
4. Select your `nadii` repository
5. Railway will auto-detect the Python backend

### 1.3 Configure Railway
1. In Railway dashboard, go to **Settings**
2. Set **Root Directory** to `backend`
3. Set **Build Command**: `pip install -r requirements.txt`
4. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 1.4 Add Environment Variables
In Railway dashboard → **Variables**:
```
DATABASE_URL=sqlite:///./nadi.db
ML_SERVICE_URL=http://localhost:8001
```

### 1.5 Get Your Backend URL
After deployment, Railway gives you a URL like:
`https://nadi-backend-xxxx.up.railway.app`

Test it:
```bash
curl https://nadi-backend-xxxx.up.railway.app/api/health
```

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Update API URL
Edit `frontend/.env` (or set in Vercel dashboard):
```
VITE_API_URL=https://nadi-backend-xxxx.up.railway.app
```

### 2.2 Update vercel.json
Edit `frontend/vercel.json` and replace the backend URL:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://nadi-backend-xxxx.up.railway.app/api/:path*"
    }
  ]
}
```

### 2.3 Deploy to Vercel
```bash
cd frontend

# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### 2.4 Or Connect via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **Import Project** → Select `nadii` repo
4. Set **Root Directory** to `frontend`
5. Set **Framework Preset** to `Vite`
6. Add Environment Variable: `VITE_API_URL` = your Railway backend URL
7. Click **Deploy**

---

## Step 3: Verify Deployment

### Frontend (Vercel)
- Visit: `https://nadi.vercel.app`
- Check landing page loads with 3D visualization
- Navigate to Nadi Analysis → fill form → test capture

### Backend (Railway)
- Health check: `https://nadi-backend-xxxx.up.railway.app/api/health`
- Patients API: `https://nadi-backend-xxxx.up.railway.app/api/patients/`

---

## Step 4: Custom Domain (Optional)

### Vercel
1. Go to Project Settings → **Domains**
2. Add your custom domain (e.g., `nadi.ai`)
3. Update DNS records as instructed by Vercel

### Railway
1. Go to Project Settings → **Networking**
2. Add custom domain
3. Update DNS CNAME record

---

## Environment Variables Reference

### Frontend (Vercel)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://nadi-backend-xxxx.up.railway.app` |

### Backend (Railway)
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `sqlite:///./nadi.db` |
| `ML_SERVICE_URL` | ML service URL (if separate) | `http://localhost:8001` |

---

## Troubleshooting

### CORS Errors
- Backend CORS is configured for `localhost:3000` and `localhost:5173`
- For production, update `backend/app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://nadi.vercel.app",  # Add your Vercel URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### API Proxy Not Working
- Check `vercel.json` rewrites point to correct backend URL
- Ensure backend is running and healthy

### Build Failures
- Run `npm run build` locally first
- Check TypeScript errors: `npx tsc --noEmit`

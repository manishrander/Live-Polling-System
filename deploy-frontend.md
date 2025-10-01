# Frontend Deployment - Quick Guide

## Option 1: Deploy via Vercel CLI (Fastest)

### Install Vercel CLI
```bash
npm install -g vercel
```

### Deploy Frontend
```bash
cd frontend
vercel login
vercel --prod
```

When prompted:
- **Set up and deploy**: Yes
- **Which scope**: Select your account
- **Link to existing project**: No (first time) / Yes (subsequent deploys)
- **Project name**: livepolling-frontend
- **Directory**: ./
- **Override settings**: No

### Set Environment Variable
```bash
vercel env add VITE_SOCKET_URL production
```
Enter your Render backend URL when prompted (e.g., `https://livepolling-backend.onrender.com`)

---

## Option 2: Deploy via Vercel Dashboard (Manual)

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework**: Vite (auto-detected)
4. Add Environment Variable:
   - `VITE_SOCKET_URL` = Your Render backend URL
5. Click **Deploy**

---

## After Deployment

Copy your Vercel URL and update the backend's `FRONTEND_URL` environment variable on Render.

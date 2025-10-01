# Backend Deployment - Quick Guide

## Option 1: Deploy via Render Dashboard (Recommended)

### Step 1: Connect GitHub
1. Go to https://dashboard.render.com/
2. Click **New +** → **Web Service**
3. Connect your GitHub account if not already connected
4. Select your repository

### Step 2: Configure Service
- **Name**: `livepolling-backend`
- **Region**: Choose closest region
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free

### Step 3: Add Environment Variables
Click **Advanced** → Add these variables:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/livepolling?retryWrites=true&w=majority
PORT=4970
FRONTEND_URL=*
```

### Step 4: Deploy
- Click **Create Web Service**
- Wait 5-10 minutes for deployment
- Copy your backend URL (e.g., `https://livepolling-backend.onrender.com`)

### Step 5: Update FRONTEND_URL (After Frontend Deploys)
1. Go to your service → **Environment** tab
2. Update `FRONTEND_URL` to your Vercel URL
3. Save (auto-redeploys)

---

## Option 2: Deploy via Render CLI (Advanced)

### Install Render CLI
```bash
# Install via npm
npm install -g @render/cli

# Or download from https://render.com/docs/cli
```

### Login and Deploy
```bash
render login
cd backend
render deploy
```

Follow the prompts to configure your service.

---

## Verify Deployment

Visit your backend URL - you should see:
```
Live Polling Socket Server running with MongoDB
```

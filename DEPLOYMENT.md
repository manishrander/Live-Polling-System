# Deployment Guide

This guide will help you deploy the Live Polling System with the **frontend on Vercel** and the **backend on Render**.

---

## Prerequisites

1. **GitHub Account** - Your code should be pushed to a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Render Account** - Sign up at [render.com](https://render.com)
4. **MongoDB Atlas** - Set up a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)

---

## Part 1: Deploy Backend to Render

### Step 1: Prepare Your MongoDB Atlas Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster (if you haven't already)
3. Create a database user with username and password
4. Whitelist all IP addresses (0.0.0.0/0) for Render access:
   - Go to **Network Access** → **Add IP Address** → **Allow Access from Anywhere**
5. Get your connection string:
   - Go to **Database** → **Connect** → **Connect your application**
   - Copy the connection string (looks like: `mongodb+srv://<username>:<password>@cluster.mongodb.net/`)

### Step 2: Deploy Backend on Render

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. **Go to [Render Dashboard](https://dashboard.render.com/)**

3. **Create a New Web Service**:
   - Click **New +** → **Web Service**
   - Connect your GitHub repository
   - Select the repository containing your project

4. **Configure the Web Service**:
   - **Name**: `livepolling-backend` (or any name you prefer)
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. **Add Environment Variables**:
   Click **Advanced** → **Add Environment Variable**:
   
   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | Your MongoDB Atlas connection string |
   | `PORT` | `4970` (or leave empty, Render auto-assigns) |
   | `FRONTEND_URL` | `*` (we'll update this after deploying frontend) |

6. **Deploy**:
   - Click **Create Web Service**
   - Wait for deployment to complete (5-10 minutes)
   - Copy your backend URL (e.g., `https://livepolling-backend.onrender.com`)

### Step 3: Test Backend

Visit your backend URL in a browser. You should see:
```
Live Polling Socket Server running with MongoDB
```

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Update Frontend Environment Variable

1. Create a production environment file or note down your backend URL from Render
2. You'll add this as an environment variable in Vercel

### Step 2: Deploy Frontend on Vercel

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

2. **Import Project**:
   - Click **Add New** → **Project**
   - Import your GitHub repository
   - Select the repository

3. **Configure Project**:
   - **Framework Preset**: Vite (should auto-detect)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Add Environment Variables**:
   Click **Environment Variables** and add:
   
   | Name | Value |
   |------|-------|
   | `VITE_SOCKET_URL` | Your Render backend URL (e.g., `https://livepolling-backend.onrender.com`) |

5. **Deploy**:
   - Click **Deploy**
   - Wait for deployment to complete (2-5 minutes)
   - Copy your frontend URL (e.g., `https://livepolling.vercel.app`)

---

## Part 3: Update CORS Configuration

### Update Backend Environment Variable on Render

1. Go back to your **Render Dashboard**
2. Select your backend service
3. Go to **Environment** tab
4. Update the `FRONTEND_URL` variable:
   - Change from `*` to your Vercel URL (e.g., `https://livepolling.vercel.app`)
5. Click **Save Changes**
6. Render will automatically redeploy your backend

---

## Part 4: Verify Deployment

1. **Open your Vercel frontend URL** in a browser
2. **Test the application**:
   - Select Teacher or Student role
   - Try sending chat messages
   - Create polls (as teacher) and answer them (as student)
3. **Check for errors** in the browser console

---

## Troubleshooting

### Backend Issues

**Problem**: Backend shows "Cannot connect to MongoDB"
- **Solution**: Check your MongoDB Atlas connection string and ensure IP whitelist includes `0.0.0.0/0`

**Problem**: Backend deployment fails
- **Solution**: Check Render logs for specific errors. Ensure all dependencies are in `package.json`

### Frontend Issues

**Problem**: Frontend can't connect to backend
- **Solution**: 
  1. Verify `VITE_SOCKET_URL` environment variable in Vercel is correct
  2. Ensure it includes `https://` and no trailing slash
  3. Redeploy frontend after changing environment variables

**Problem**: CORS errors in browser console
- **Solution**: 
  1. Update `FRONTEND_URL` in Render to match your Vercel URL exactly
  2. Wait for Render to redeploy automatically

### Socket.IO Connection Issues

**Problem**: Real-time features not working
- **Solution**:
  1. Check browser console for WebSocket errors
  2. Ensure Render backend is running (free tier may sleep after inactivity)
  3. Visit backend URL to wake it up
  4. Refresh frontend

---

## Free Tier Limitations

### Render Free Tier
- Backend will **sleep after 15 minutes of inactivity**
- First request after sleep takes 30-60 seconds to wake up
- 750 hours/month of runtime

### Vercel Free Tier
- Unlimited deployments
- 100 GB bandwidth/month
- Automatic HTTPS

### MongoDB Atlas Free Tier
- 512 MB storage
- Shared CPU
- Sufficient for small applications

---

## Updating Your Deployment

### Update Backend
1. Push changes to GitHub
2. Render will automatically redeploy

### Update Frontend
1. Push changes to GitHub
2. Vercel will automatically redeploy

### Manual Redeploy
- **Render**: Go to service → Click **Manual Deploy** → **Deploy latest commit**
- **Vercel**: Go to project → **Deployments** → Click **Redeploy**

---

## Environment Variables Reference

### Backend (Render)
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/livepolling?retryWrites=true&w=majority
PORT=4970
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (Vercel)
```env
VITE_SOCKET_URL=https://your-backend.onrender.com
```

---

## Custom Domain (Optional)

### Add Custom Domain to Vercel
1. Go to your project in Vercel
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Update DNS records as instructed

### Add Custom Domain to Render
1. Go to your service in Render
2. Click **Settings** → **Custom Domain**
3. Add your custom domain
4. Update DNS records as instructed

---

## Security Best Practices

1. **Never commit `.env` files** to Git
2. **Use specific CORS origins** in production (not `*`)
3. **Keep MongoDB credentials secure**
4. **Regularly update dependencies**
5. **Monitor usage** to stay within free tier limits

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/

---

## Quick Deployment Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Backend deployed to Render
- [ ] Backend environment variables set (MONGODB_URI, FRONTEND_URL)
- [ ] Backend URL copied
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variable set (VITE_SOCKET_URL)
- [ ] Frontend URL copied
- [ ] CORS updated on backend with frontend URL
- [ ] Application tested and working

---

**Congratulations! Your Live Polling System is now deployed! 🎉**

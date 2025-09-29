# AviFlux Render Deployment Guide

## 🚀 Deploy to Render

This guide will help you deploy AviFlux to Render with both backend and frontend services.

### Prerequisites
- GitHub repository (already done: https://github.com/utkarshhzz/AviFlux)
- Render account (free tier available)

### Step-by-Step Deployment

#### 1. **Backend Deployment**

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Sign up/login with your GitHub account

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `utkarshhzz/AviFlux`
   - Configure the service:

   ```
   Name: aviflux-backend
   Root Directory: backend
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: python dynamic_route_backend.py
   ```

3. **Environment Variables**
   Set these in the Render dashboard:
   ```
   PORT: 10000 (Render auto-assigns)
   ENVIRONMENT: production
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note the backend URL: `https://aviflux-backend.onrender.com`

#### 2. **Frontend Deployment**

1. **Create Static Site**
   - Click "New +" → "Static Site"
   - Use same repository: `utkarshhzz/AviFlux`
   - Configure:

   ```
   Name: aviflux-frontend
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

2. **Environment Variables**
   ```
   VITE_API_URL: https://aviflux-backend.onrender.com
   VITE_APP_NAME: AviFlux
   VITE_ENVIRONMENT: production
   ```

3. **Deploy**
   - Click "Create Static Site"
   - Wait for deployment (3-5 minutes)
   - Your app will be available at: `https://aviflux-frontend.onrender.com`

### 3. **One-Click Deployment (Alternative)**

You can also use the render.yaml file for automatic deployment:

1. **Fork the repository** to your GitHub account
2. **Connect to Render** using the "Deploy to Render" button
3. **Or manually import** the repository and Render will detect the `render.yaml` configuration

### 4. **Post-Deployment Configuration**

1. **Update CORS Origins** (if needed)
   - Backend automatically configures CORS for the frontend URL

2. **Custom Domain** (optional)
   - In Render dashboard, go to your static site
   - Add custom domain in settings

3. **SSL Certificate**
   - Render provides free SSL certificates automatically

### 5. **Monitoring & Logs**

- **Backend Logs**: Available in Render dashboard under "Logs" tab
- **Frontend Builds**: Check "Events" tab for build status
- **Health Check**: Backend includes `/health` endpoint

### 6. **Cost**

- **Free Tier**: Both services can run on Render's free tier
- **Backend**: Free tier includes 750 hours/month
- **Frontend**: Static sites are free with unlimited bandwidth

### 7. **Troubleshooting**

**Common Issues:**

1. **Build Fails**:
   - Check build logs in Render dashboard
   - Verify all dependencies in requirements.txt/package.json

2. **Backend Not Responding**:
   - Check if PORT environment variable is set correctly
   - Verify health check endpoint: `/health`

3. **Frontend Can't Reach Backend**:
   - Verify VITE_API_URL in frontend environment variables
   - Check CORS configuration in backend

4. **Slow Cold Starts**:
   - Free tier services sleep after inactivity
   - Consider upgrading to paid tier for production

### 8. **Environment URLs**

After deployment:
- **Backend**: `https://aviflux-backend.onrender.com`
- **Frontend**: `https://aviflux-frontend.onrender.com`
- **Health Check**: `https://aviflux-backend.onrender.com/health`
- **API Endpoint**: `https://aviflux-backend.onrender.com/api/flight-briefing`

### 9. **Testing Deployment**

Test your deployed application:

```bash
# Test backend health
curl https://aviflux-backend.onrender.com/health

# Test flight briefing API  
curl -X POST https://aviflux-backend.onrender.com/api/flight-briefing \
  -H "Content-Type: application/json" \
  -d '{"departure":"KORD","arrival":"KDEN"}'
```

### 10. **Updates & Redeployment**

- **Automatic**: Push to main branch triggers auto-deployment
- **Manual**: Use "Manual Deploy" button in Render dashboard
- **Rollback**: Available in deployment history

---

## 🎉 Your AviFlux app is now live on Render!

Visit your deployed application and test the dynamic route weather briefing system with any airport pair.
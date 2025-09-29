# 🚀 AviFlux Deployment Guide for Render

This guide will walk you through deploying AviFlux to Render, a modern cloud platform that makes deployment simple and scalable.

## 📋 Prerequisites

- GitHub account
- Render account (free at [render.com](https://render.com))
- Your AviFlux project pushed to GitHub

## 🎯 Deployment Strategy

We'll deploy two services:
1. **Backend Service** (Python FastAPI) - Web Service
2. **Frontend Service** (React/Vite) - Static Site

## 🛠️ Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Push your project to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Verify file structure**
   ```
   AviFlux/
   ├── backend/
   │   ├── main_production.py
   │   ├── requirements.txt
   │   └── ... (other backend files)
   ├── frontend/
   │   ├── package.json
   │   ├── dist/ (created during build)
   │   └── ... (other frontend files)
   ├── render.yaml
   └── README.md
   ```

### Step 2: Deploy Backend Service

1. **Create Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Backend Service**
   ```
   Name: aviflux-backend
   Environment: Python 3
   Build Command: cd backend && pip install -r requirements.txt
   Start Command: cd backend && python main_production.py
   Plan: Free (or Starter for better performance)
   ```

3. **Set Environment Variables**
   ```
   PORT=8003
   ENVIRONMENT=production
   LOG_LEVEL=INFO
   CORS_ORIGINS=https://aviflux-frontend.onrender.com
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note the service URL (e.g., `https://aviflux-backend.onrender.com`)

### Step 3: Deploy Frontend Service

1. **Create Static Site**
   - Click "New" → "Static Site"
   - Connect the same GitHub repository

2. **Configure Frontend Service**
   ```
   Name: aviflux-frontend
   Build Command: cd frontend && npm install && npm run build
   Publish Directory: frontend/dist
   ```

3. **Set Environment Variables**
   ```
   VITE_API_URL=https://aviflux-backend.onrender.com
   VITE_ENVIRONMENT=production
   ```

4. **Deploy**
   - Click "Create Static Site"
   - Wait for deployment (3-5 minutes)
   - Your app will be live at `https://aviflux-frontend.onrender.com`

### Step 4: Update CORS Configuration

1. **Go to Backend Service Settings**
2. **Update Environment Variables**
   ```
   CORS_ORIGINS=https://aviflux-frontend.onrender.com
   ```
3. **Redeploy Backend Service**

## 🔧 Configuration Details

### Backend Configuration

**File**: `backend/main_production.py`
- Optimized for production
- Health check endpoint at `/health`
- Proper CORS configuration
- Error handling and logging

**Environment Variables**:
```env
PORT=8003                                    # Render assigns port
ENVIRONMENT=production                       # Production mode
LOG_LEVEL=INFO                              # Logging level
CORS_ORIGINS=https://your-frontend-url.com  # Frontend URL
```

### Frontend Configuration

**Build Process**:
1. `npm install` - Install dependencies
2. `npm run build` - Build production assets
3. Static files served from `dist/` directory

**Environment Variables**:
```env
VITE_API_URL=https://your-backend-url.com  # Backend API URL
VITE_ENVIRONMENT=production                # Production mode
```

## 🎯 Advanced Deployment Options

### Option 1: One-Click Deploy

Use the render.yaml file for automated deployment:

```yaml
services:
  - type: web
    name: aviflux-backend
    env: python
    buildCommand: "cd backend && pip install -r requirements.txt"
    startCommand: "cd backend && python main_production.py"
    
  - type: web
    name: aviflux-frontend
    env: static
    buildCommand: "cd frontend && npm install && npm run build"
    staticPublishPath: frontend/dist
```

### Option 2: Custom Domain

1. **Purchase a domain** (e.g., aviflux.com)
2. **Add Custom Domain in Render**
   - Go to Service Settings
   - Add Custom Domain
   - Update DNS records
3. **SSL Certificate** (automatically provided by Render)

### Option 3: Database Integration

For production with database:
```yaml
- type: pserv
  name: aviflux-postgres
  env: postgresql
  plan: starter
  databases:
    - name: aviflux
      user: aviflux
```

## 🔍 Monitoring & Debugging

### Health Checks

Backend includes health check endpoint:
```http
GET https://aviflux-backend.onrender.com/health

Response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "ml_system": "loaded",
  "services": {
    "api": "operational",
    "ml_models": "ready"
  }
}
```

### Logs Access

1. **Backend Logs**
   - Go to Service → Logs
   - Real-time log streaming
   - Filter by log level

2. **Frontend Logs**
   - Build logs during deployment
   - Browser developer tools for runtime

### Common Issues & Solutions

**Issue**: Backend not connecting to frontend
```
Solution: Check CORS_ORIGINS environment variable
Verify: https://aviflux-backend.onrender.com/health
```

**Issue**: Frontend not loading
```
Solution: Check build logs for errors
Verify: Build command includes npm run build
```

**Issue**: ML models not loading
```
Solution: Check Python dependencies in requirements.txt
Verify: Sufficient memory allocation (upgrade plan)
```

## 📈 Performance Optimization

### Backend Optimization
- **Plan**: Starter plan recommended (512MB RAM)
- **Auto-scaling**: Enabled by default
- **Health checks**: 30-second intervals

### Frontend Optimization
- **CDN**: Automatic via Render
- **Compression**: Gzip enabled
- **Caching**: Static assets cached for 1 year

## 🔒 Security Configuration

### Environment Variables
- Never commit secrets to GitHub
- Use Render's environment variable system
- Rotate API keys regularly

### CORS Configuration
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://aviflux-frontend.onrender.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

### HTTPS
- Automatic SSL certificates
- HTTPS redirect enabled
- HSTS headers configured

## 🎉 Post-Deployment

### Testing Checklist
- [ ] Frontend loads successfully
- [ ] Backend health check passes
- [ ] API endpoints respond correctly
- [ ] Live flight tracking works
- [ ] Weather data loads
- [ ] ML predictions generate

### Monitoring Setup
- [ ] Enable Render monitoring
- [ ] Set up uptime alerts
- [ ] Monitor API response times
- [ ] Track error rates

## 🆘 Troubleshooting

### Build Failures

**Python Dependencies**
```bash
# Check requirements.txt
pip install -r requirements.txt --dry-run
```

**Node.js Build Issues**
```bash
# Check package.json scripts
npm run build --verbose
```

### Runtime Errors

**Memory Issues**
- Upgrade to Starter plan (512MB → 1GB)
- Optimize ML model loading
- Implement model caching

**API Connection Issues**
- Verify environment variables
- Check CORS configuration
- Test endpoints manually

### Support Resources

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **Community Support**: [community.render.com](https://community.render.com)
- **Status Page**: [status.render.com](https://status.render.com)

---

## 🚀 Quick Deploy Commands

```bash
# 1. Prepare repository
git add .
git commit -m "Deploy to Render"
git push origin main

# 2. Create services on Render Dashboard
# 3. Set environment variables
# 4. Deploy!
```

Your AviFlux platform will be live and ready for aviation professionals worldwide! ✈️
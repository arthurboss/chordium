# Deployment Guide

This guide covers deployment for both the frontend (Vercel) and backend (Render) components of Chordium.

## Architecture Overview

```
Frontend (Vercel)
├── React App
├── PWA Support
└── Calls Backend API

Backend (Render)
├── Express Server
├── Puppeteer Scraping
├── Supabase Database
└── AWS S3 Caching

Database (Supabase)
├── Artist Data
├── Song Data
└── User Data

Storage (AWS S3)
├── Cached Chord Sheets
└── Scraped Data
```

## Frontend Deployment (Vercel)

### Prerequisites
1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Backend API**: Your backend should be deployed and accessible

### Environment Variables to Set in Vercel

```
VITE_API_URL=https://your-backend-api-url.com
VERCEL=1
NODE_ENV=production
```

**Important**: Replace `https://your-backend-api-url.com` with your actual backend API URL.

### Deployment Steps

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Import your GitHub repository
   - Select the repository containing your project

2. **Configure Project Settings**
   - **Framework Preset**: Select "Vite"
   - **Root Directory**: `frontend` (since we restructured the project)
   - **Build Command**: `npm run build` (should be auto-detected)
   - **Output Directory**: `dist` (should be auto-detected)
   - **Install Command**: `npm install` (should be auto-detected)

3. **Set Environment Variables**
   - Add all environment variables listed above in your Vercel project settings

4. **Deploy**
   - Click "Deploy" in Vercel
   - Vercel will automatically build and deploy your frontend
   - You'll get a URL like `https://your-project.vercel.app`

### Configuration Files

The `frontend/vercel.json` file is already configured with:

- **SPA Routing**: All routes redirect to `index.html` for client-side routing
- **Caching**: Static assets are cached for 1 year
- **Security Headers**: Basic security headers are added
- **Build Optimization**: Configured for Vite builds

### Development vs Production

#### Local Development
```bash
# From the root directory
npm run dev:fe

# Or from the frontend directory
cd frontend
npm run dev
```

#### Production Build
```bash
# From the root directory
npm run build:fe

# Or from the frontend directory
cd frontend
npm run build
```

### Troubleshooting Frontend

#### Common Issues
1. **Build Failures**: Check that all dependencies are installed
2. **API Connection**: Ensure `VITE_API_URL` is set correctly
3. **Routing Issues**: The `vercel.json` should handle SPA routing
4. **Environment Variables**: Make sure all required env vars are set in Vercel

#### Debugging
1. Check Vercel build logs for errors
2. Verify environment variables are set correctly
3. Test API connectivity from the deployed frontend
4. Check browser console for client-side errors

## Backend Deployment (Render)

### Prerequisites
- GitHub repository connected to Render
- Supabase project with database
- AWS S3 bucket for caching

### Environment Variables to Set in Render

1. **Server Configuration**
   - `NODE_ENV`: `production`
   - `PORT`: `10000`

2. **Supabase Configuration**
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

3. **AWS S3 Configuration**
   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
   - `AWS_REGION`: Your AWS region (e.g., `us-east-1`)
   - `AWS_S3_BUCKET`: Your S3 bucket name

4. **Frontend Configuration**
   - `FRONTEND_URL`: Your Vercel frontend URL

### Deployment Steps

1. **Connect Repository to Render**
   - Go to [render.com](https://render.com)
   - Connect your GitHub repository
   - Select "Web Service"

2. **Configure Service**
   - **Name**: `chordium-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`

3. **Set Environment Variables**
   - Add all environment variables listed above

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy your backend

### Health Check
- Endpoint: `/health`
- Expected response: `{"status":"ok","timestamp":"..."}`

### Cold Start Mitigation

**Problem**: Render's free tier puts services to sleep after 15 minutes of inactivity, causing "cold starts" when users visit your app.

**Solution**: Chordium uses UptimeRobot for both monitoring and keep-alive functionality, ensuring the backend stays warm and providing public status transparency.

#### How It Works

**UptimeRobot Monitoring**:
- Continuously monitors the backend `/health` endpoint
- Pings every 5 minutes to keep the backend warm
- Provides public status page for transparency
- Sends alerts when the backend is down
- Prevents cold starts automatically without any frontend code

#### Benefits

- **Faster User Experience**: Backend is pre-warmed by UptimeRobot monitoring
- **Public Transparency**: Status page shows real-time backend health
- **Cost Effective**: UptimeRobot free tier provides monitoring and keep-alive
- **Zero Frontend Code**: No additional JavaScript or app complexity
- **Reliable**: External service ensures consistent monitoring
- **Simple**: Single solution for both monitoring and keep-alive

#### Configuration

UptimeRobot is configured independently of the application:

- **Backend URL**: Configured directly in UptimeRobot dashboard
- **Monitoring Frequency**: Set to 5-minute intervals (free tier)
- **Alert Settings**: Email/SMS notifications when backend is down

#### UptimeRobot Configuration

UptimeRobot provides both monitoring and keep-alive functionality:

- **Monitoring Frequency**: Every 5 minutes (free tier)
- **Public Status Page**: [Backend Status](https://stats.uptimerobot.com/sIX45GbfwC)
- **Alert Notifications**: Email/SMS when backend is down
- **Cost**: Free tier covers basic monitoring needs
- **Coverage**: 24/7 monitoring with public transparency

#### Render Usage for Alpha Version

| Component | Monthly Hours | Details |
|-----------|---------------|---------|
| **UptimeRobot Keep-Alive** | ~223 hours | 5-minute intervals, 24/7 monitoring |
| **Alpha Users** (~10) | ~15-30 hours | Light testing usage |
| **Total Usage** | **~238-253 hours** | **32-34% of free tier** ✅ |

**UptimeRobot Strategy**:

- **Monitoring**: Every 5 minutes, 24/7 coverage
- **Keep-Alive**: Prevents cold starts automatically
- **Public Status**: Real-time transparency for users
- **Cost**: Free tier provides sufficient monitoring
- **Total Pings**: ~8,640 per month (5-minute intervals)

#### Usage Progression for Planning

| Phase | Users | Monthly Hours | Free Tier % | Recommendation |
|-------|-------|---------------|-------------|----------------|
| **Alpha** | ~10 | ~238-253 hours | 32-34% | ✅ Perfect on free tier |
| **Beta** | ~100 | ~300-350 hours | 40-47% | ✅ Still good on free tier |
| **Production** | ~500+ | ~500-800+ hours | 67-107% | ⚠️ Consider paid tier ($7/month) |

- **UptimeRobot**: Provides both monitoring and keep-alive functionality
- **Render Paid Tier**: Eliminates cold starts entirely ($7/month)

### Troubleshooting Backend

- Check Render logs for build errors
- Verify environment variables are set correctly
- Ensure Supabase and AWS credentials are valid

## Testing the Complete Deployment

### 1. Test Backend Health
```bash
curl https://your-backend.onrender.com/health
```

### 2. Test API Endpoints
```bash
curl https://your-backend.onrender.com/api/artists
```

### 3. Test Frontend
- Visit your Vercel URL
- Try searching for artists
- Verify API calls work

## Performance Optimization

The frontend Vite configuration includes:

- **Tree Shaking**: Unused code is removed
- **Code Splitting**: Large bundles are split into smaller chunks
- **Compression**: Assets are compressed with Brotli
- **Caching**: Static assets are cached aggressively

## Monitoring

After deployment:

1. Monitor build times in Vercel dashboard
2. Check performance metrics
3. Monitor API calls and errors
4. Set up alerts for build failures
5. **Backend Status**: [UptimeRobot Status Page](https://stats.uptimerobot.com/sIX45GbfwC)

## Custom Domain (Optional)

### Frontend (Vercel)
1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS settings as instructed

## Continuous Deployment

### Vercel (Frontend)
Vercel automatically deploys when you push to:
- `main` branch → Production
- Other branches → Preview deployments

### Render (Backend)
Render automatically deploys when you push to:
- `main` branch → Production

Each push creates a new deployment with a unique URL for testing.

## Cost Breakdown

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **Frontend (Vercel)** | Free forever | Free forever |
| **Backend (Render)** | 750 hours/month | $7/month |
| **Database (Supabase)** | Free tier | $25/month |
| **Storage (AWS S3)** | Free tier | ~$1-5/month |

**Total monthly cost when scaling: ~$32-36** 
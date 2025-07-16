# Deployment Guide

## Render Backend Deployment

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

### Troubleshooting
- Check Render logs for build errors
- Verify environment variables are set correctly
- Ensure Supabase and AWS credentials are valid

## Vercel Frontend Deployment

### Prerequisites
- GitHub repository connected to Vercel
- Backend URL from Render deployment

### Environment Variables to Set in Vercel

1. **Backend API URL**
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://chordium-backend.onrender.com`)

### Deployment Steps

1. **Connect Repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Vercel will auto-detect it's a React app

2. **Set Environment Variables**
   - Add `VITE_API_URL` with your Render backend URL

3. **Deploy**
   - Vercel will automatically deploy your frontend

### Testing the Connection

1. **Test Backend Health**
   ```bash
   curl https://your-backend.onrender.com/health
   ```

2. **Test API Endpoints**
   ```bash
   curl https://your-backend.onrender.com/api/artists
   ```

3. **Test Frontend**
   - Visit your Vercel URL
   - Try searching for artists
   - Verify API calls work

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

## Cost Breakdown

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **Frontend (Vercel)** | Free forever | Free forever |
| **Backend (Render)** | 750 hours/month | $7/month |
| **Database (Supabase)** | Free tier | $25/month |
| **Storage (AWS S3)** | Free tier | ~$1-5/month |

**Total monthly cost when scaling: ~$32-36** 
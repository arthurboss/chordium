# Frontend Deployment Guide - Vercel

This guide explains how to deploy the Chordium frontend to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Backend API**: Your backend should be deployed and accessible

## Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository containing your project

### 2. Configure Project Settings

When setting up the project in Vercel:

- **Framework Preset**: Select "Vite"
- **Root Directory**: `frontend` (since we restructured the project)
- **Build Command**: `npm run build` (should be auto-detected)
- **Output Directory**: `dist` (should be auto-detected)
- **Install Command**: `npm install` (should be auto-detected)

### 3. Environment Variables

Add these environment variables in your Vercel project settings:

```
VITE_API_URL=https://your-backend-api-url.com
VERCEL=1
NODE_ENV=production
```

**Important**: Replace `https://your-backend-api-url.com` with your actual backend API URL.

### 4. Deploy

1. Click "Deploy" in Vercel
2. Vercel will automatically build and deploy your frontend
3. You'll get a URL like `https://your-project.vercel.app`

## Configuration Files

### vercel.json

The `vercel.json` file is already configured with:

- **SPA Routing**: All routes redirect to `index.html` for client-side routing
- **Caching**: Static assets are cached for 1 year
- **Security Headers**: Basic security headers are added
- **Build Optimization**: Configured for Vite builds

### Environment Variables

The frontend uses these environment variables:

- `VITE_API_URL`: Your backend API URL
- `VERCEL`: Set to `1` when deployed on Vercel
- `NODE_ENV`: Set to `production` for production builds

## Development vs Production

### Local Development

```bash
# From the root directory
npm run dev:fe

# Or from the frontend directory
cd frontend
npm run dev
```

### Production Build

```bash
# From the root directory
npm run build:fe

# Or from the frontend directory
cd frontend
npm run build
```

## Troubleshooting

### Common Issues

1. **Build Failures**: Check that all dependencies are installed
2. **API Connection**: Ensure `VITE_API_URL` is set correctly
3. **Routing Issues**: The `vercel.json` should handle SPA routing
4. **Environment Variables**: Make sure all required env vars are set in Vercel

### Debugging

1. Check Vercel build logs for errors
2. Verify environment variables are set correctly
3. Test API connectivity from the deployed frontend
4. Check browser console for client-side errors

## Performance Optimization

The Vite configuration includes:

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

## Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS settings as instructed

## Continuous Deployment

Vercel automatically deploys when you push to:

- `main` branch → Production
- Other branches → Preview deployments

Each push creates a new deployment with a unique URL for testing. 
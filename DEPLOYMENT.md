# Deploying Resume Builder to Vercel

This guide will help you deploy the Resume Builder application to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. [Vercel CLI](https://vercel.com/docs/cli) installed (optional, for CLI deployment)
3. Git repository (GitHub, GitLab, or Bitbucket)

## Project Structure

The project is set up as a monorepo with:
- **Client**: React/Vite app in `client/` directory
- **API**: Serverless functions in `api/` directory
- **Vercel Config**: `vercel.json` at the root

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to Git**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import Project to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your Git repository
   - Vercel will auto-detect the project settings from `vercel.json`

3. **Configure Build Settings** (if needed)
   - Root Directory: Leave as root (`.`)
   - Build Command: `cd client && npm install && npm run build`
   - Output Directory: `client/dist`
   - Install Command: `npm install` (runs in root, then installs client and api deps)

4. **Environment Variables** (Optional)
   - If you need any environment variables, add them in Vercel dashboard:
     - Go to Project Settings → Environment Variables
     - Add any required variables

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - For production: `vercel --prod`

## API Endpoints

After deployment, your API endpoints will be available at:
- `https://your-project.vercel.app/api/export/pdf` (POST)
- `https://your-project.vercel.app/api/export/docx` (POST)
- `https://your-project.vercel.app/api/health` (GET)

## Important Notes

### PDF Export on Vercel

- PDF export uses `@sparticuz/chromium` which is optimized for serverless environments
- The function timeout is set to 30 seconds (configurable in `vercel.json`)
- Large HTML files may take longer to process

### Function Size Limits

- Vercel has a 50MB limit for serverless functions
- The Chromium binary is included, so the function size is larger
- If you hit size limits, consider:
  - Using Vercel Pro plan (higher limits)
  - Optimizing dependencies
  - Using external PDF service

### Local Development

For local development, you can still use the Express server:

```bash
# Terminal 1: Start server
cd server
npm install
npm run dev

# Terminal 2: Start client
cd client
npm install
npm run dev
```

The client will automatically use `http://localhost:4000` in development and `/api` in production.

## Troubleshooting

### Python/requirements.txt Error

If you see errors about `requirements.txt` or Python dependencies:

1. **Clear Vercel Build Cache**
   - Go to Project Settings → General
   - Scroll to "Clear Build Cache" and click it
   - Redeploy

2. **Verify vercel.json**
   - Ensure `vercel.json` has `"framework": null` to prevent auto-detection
   - Check that `installCommand` explicitly installs Node.js dependencies

3. **Check for Python Files**
   - Ensure no `requirements.txt` exists in the project
   - Remove any `.py` files if not needed
   - Check `.vercelignore` includes Python-related patterns

4. **Force Node.js Runtime**
   - In Vercel dashboard: Settings → General → Node.js Version (set to 18.x or 20.x)
   - Or add `"runtime": "nodejs18.x"` to functions in `vercel.json`

### Build Fails

1. Check that all dependencies are listed in `package.json` files
2. Ensure Node.js version is compatible (Vercel uses Node 18.x by default)
3. Check build logs in Vercel dashboard
4. Try clearing build cache and redeploying

### API Functions Not Working

1. Verify `api/` directory structure is correct
2. Check function logs in Vercel dashboard
3. Ensure all dependencies in `api/package.json` are installed

### PDF Export Timeout

1. Increase `maxDuration` in `vercel.json` (up to 60s on Pro plan)
2. Optimize HTML size before sending to API
3. Consider using a queue system for large exports

## Updating Deployment

After making changes:

1. **Via Git** (Automatic)
   - Push changes to your repository
   - Vercel will automatically redeploy

2. **Via CLI**
   ```bash
   vercel --prod
   ```

## Custom Domain

To add a custom domain:

1. Go to Project Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions

## Support

For Vercel-specific issues:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)


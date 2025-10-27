# Deployment Guide 🚀

This guide will help you deploy this E-commerce Website to GitHub and Vercel.

## Step 1: Push to GitHub

### Option A: Using GitHub CLI (Recommended)

```bash
# Install GitHub CLI if not installed
# Visit: https://cli.github.com/

# Create a new repository on GitHub
gh repo create ecommerce-admin-roles --public --source=. --remote=origin --push
```

### Option B: Using GitHub Web Interface

1. Go to [github.com](https://github.com) and sign in
2. Click the "+" icon → "New repository"
3. Name it: `ecommerce-admin-roles`
4. Choose "Public" or "Private"
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

Then run these commands:

```bash
# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/ecommerce-admin-roles.git

# Rename branch to main (if needed)
git branch -M main

# Push code to GitHub
git push -u origin main
```

### Option C: Manual Commands

```bash
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/ecommerce-admin-roles.git

# Verify remote
git remote -v

# Push to GitHub
git push -u origin main
```

---

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Easiest)

1. **Sign up/Login** to [Vercel](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect:
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `build`
5. Click **"Deploy"**
6. Wait for deployment (takes ~2-3 minutes)
7. Get your live URL! 🎉

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd "D:\FigmaProjects\E-commerce Website with Admin Roles"
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: ecommerce-admin-roles
# - Directory: .
# - Override settings? No
```

---

## Step 3: Configure Environment Variables (If Needed)

Currently, the project uses Supabase KV Store which is already configured. If you need to add environment variables:

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add any required variables:
   - `VITE_SUPABASE_URL` (if custom)
   - `VITE_SUPABASE_ANON_KEY` (if custom)

---

## Step 4: Verify Deployment

After deployment:

1. Visit your Vercel URL (e.g., `https://your-project.vercel.app`)
2. Test the application:
   - Login with demo credentials
   - Check all three roles
   - Verify mobile responsive design

---

## Future Updates

To deploy updates:

```bash
# Make your changes
git add .
git commit -m "Your commit message"
git push
```

Vercel will automatically:
- Detect the push
- Rebuild your project
- Deploy the updates

---

## Troubleshooting

### Build Fails

Check Vercel build logs for errors:
1. Go to Vercel Dashboard
2. Click your project
3. Go to **Deployments** tab
4. Click on failed deployment
5. Check **Build Logs**

### Common Issues

**Error: "Module not found"**
```bash
# Make sure dependencies are in package.json
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

**Error: "Build directory not found"**
- Verify `vercel.json` has correct `outputDirectory: "build"`
- Verify `vite.config.ts` has `outDir: 'build'`

**Error: "Supabase connection failed"**
- Backend is already deployed on Supabase Functions
- No additional configuration needed

---

## Repository Status

Current Git Status:
- ✅ Repository initialized
- ✅ Files committed
- ✅ Ready for push to GitHub
- ✅ Vercel ready

**Next Step**: Push to GitHub and deploy to Vercel!

---

**Questions?** Check the [Vercel Documentation](https://vercel.com/docs) for more help.


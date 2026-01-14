# 🚀 Cloudflare Pages Deployment Guide

## Prerequisites
- A Cloudflare account (free) - [Sign up here](https://dash.cloudflare.com/sign-up)
- Your code on GitHub (public or private repository)
- Google Sheets with published CSV URLs

---

## 📋 Quick Summary
Your website is a **static site** that fetches data from Google Sheets CSV URLs at **build time**. This means:
- ✅ No server required
- ✅ Fast global CDN delivery
- ✅ Free hosting on Cloudflare Pages
- ✅ Automatic HTTPS
- ✅ Unlimited bandwidth

---

## 🔧 Step 1: Prepare Your Repository

### Option A: Using Git (Recommended)

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Cloudflare Pages"
   ```

2. **Create a GitHub repository**:
   - Go to [github.com/new](https://github.com/new)
   - Name it (e.g., `my-astro-website`)
   - Don't initialize with README (we already have code)
   - Click "Create repository"

3. **Push your code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

### Option B: Direct Upload (Alternative)
You can also manually upload your code to GitHub using their web interface.

---

## ☁️ Step 2: Deploy to Cloudflare Pages

### 2.1 Connect Your Repository

1. **Login to Cloudflare**: Go to [dash.cloudflare.com](https://dash.cloudflare.com)

2. **Navigate to Pages**:
   - Click "Workers & Pages" in the left sidebar
   - Click "Create application"
   - Select "Pages" tab
   - Click "Connect to Git"

3. **Authorize GitHub**:
   - Select GitHub
   - Authorize Cloudflare to access your repositories
   - Select the repository you just created

### 2.2 Configure Build Settings

When prompted, use these settings:

| Setting | Value |
|---------|-------|
| **Project name** | `my-website` (or your choice) |
| **Production branch** | `main` |
| **Framework preset** | `Astro` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` |
| **Node version** | `18` or higher |

### 2.3 Environment Variables

**IMPORTANT**: Add these environment variables in Cloudflare Pages:

Click "Add environment variable" and add each one:

```bash
PUBLIC_SHEET_CSV_URL=https://docs.google.com/spreadsheets/d/e/YOUR_SHEET_ID/pub?gid=1019090751&single=true&output=csv

PUBLIC_SERVICES_CSV_URL=https://docs.google.com/spreadsheets/d/e/YOUR_SHEET_ID/pub?gid=1977015750&single=true&output=csv

PUBLIC_PORTFOLIO_CSV_URL=https://docs.google.com/spreadsheets/d/e/YOUR_SHEET_ID/pub?gid=1914747142&single=true&output=csv

PUBLIC_TESTIMONIALS_CSV_URL=https://docs.google.com/spreadsheets/d/e/YOUR_SHEET_ID/pub?gid=1186111304&single=true&output=csv

PUBLIC_CLOUDINARY_CLOUD_NAME=djpfyrqbn

PUBLIC_WHATSAPP_NUMBER=+94771234567

PUBLIC_WHATSAPP_MESSAGE=Hello! I'm interested in your products.

PUBLIC_BUSINESS_NAME=Premium Sri Lankan Business
```

**Note**: Copy these from your `.env` file (don't upload `.env` to GitHub!)

### 2.4 Deploy

1. Click "Save and Deploy"
2. Cloudflare will:
   - Clone your repository
   - Install dependencies (`npm install`)
   - Build your site (`npm run build`)
   - Deploy to their global CDN

⏱️ First deployment takes 2-5 minutes.

---

## 🌐 Step 3: Access Your Website

After deployment completes:

1. You'll get a URL like: `https://my-website.pages.dev`
2. Click it to see your live website! 🎉

---

## 🔄 Updating Your Website

### Method 1: Push to GitHub (Automated)
```bash
# Make changes to your code
git add .
git commit -m "Updated homepage"
git push
```
Cloudflare will **automatically rebuild and deploy** your site!

### Method 2: Update Google Sheets
Just update your Google Sheets data. Then trigger a rebuild in Cloudflare:
- Go to Cloudflare Pages dashboard
- Click your project
- Click "Deployments" tab
- Click "Retry deployment" or wait for next code push

---

## 🎨 Custom Domain (Optional)

To use your own domain (e.g., `www.yourbusiness.com`):

1. Go to your Cloudflare Pages project
2. Click "Custom domains" tab
3. Click "Set up a custom domain"
4. Follow the instructions to:
   - Add your domain to Cloudflare
   - Update your DNS records

**Cloudflare automatically provides**:
- ✅ Free SSL certificate (HTTPS)
- ✅ DDoS protection
- ✅ Global CDN caching

---

## 🐛 Troubleshooting

### Build Failed?

**Check Node version**:
- In Cloudflare Pages settings, ensure Node.js version is `18` or higher
- Add environment variable: `NODE_VERSION=18`

**Dependencies error**:
- Ensure `package.json` and `package-lock.json` are committed to Git

**Environment variables missing**:
- Double-check all `PUBLIC_*` variables are set in Cloudflare Pages settings

### Site looks broken?

**Images not loading**:
- Verify `PUBLIC_CLOUDINARY_CLOUD_NAME` is correct
- Check Google Sheets CSV URLs have valid image URLs

**No products showing**:
- Check the build logs in Cloudflare (look for "Fetched X products")
- Verify CSV URLs are published and accessible
- Test CSV URLs in browser (they should download)

### View Build Logs

1. Go to Cloudflare Pages dashboard
2. Click your project
3. Click latest deployment
4. Click "View build logs"
5. Look for errors in red

---

## 📊 Performance Tips

### Caching Strategy

Cloudflare automatically caches your site, but for fresh Google Sheets data:

**Option 1**: Manual rebuild after updating sheets
- Go to Cloudflare Pages → Deployments
- Click "Retry deployment"

**Option 2**: Set up a scheduled rebuild
- Use GitHub Actions to trigger daily rebuilds
- See [Cloudflare Pages Build Hooks](https://developers.cloudflare.com/pages/platform/deploy-hooks/)

**Option 3**: Webhook from Google Sheets
- Advanced: Use Google Apps Script to trigger rebuild on sheet changes

---

## 💰 Cost

**Cloudflare Pages is FREE for**:
- ✅ Unlimited requests
- ✅ Unlimited bandwidth
- ✅ 500 builds per month
- ✅ 1 build at a time

**Paid plan ($20/month) adds**:
- Concurrent builds
- More build minutes
- Advanced features

For most small businesses, **free plan is more than enough**!

---

## 🔐 Security Notes

### DO NOT commit these files to Git:
- `.env` (contains your credentials)
- `node_modules/` (too large, auto-generated)

Your `.gitignore` should include:
```
node_modules/
.env
dist/
.astro/
```

### Environment Variables Security:
- Use Cloudflare's environment variables feature (encrypted)
- Never hardcode sensitive data in your code
- Your `PUBLIC_*` variables are safe to expose (they're public by design)

---

## 📚 Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Astro Documentation](https://docs.astro.build/)
- [Deploy Astro to Cloudflare Pages](https://docs.astro.build/en/guides/deploy/cloudflare/)

---

## ✅ Deployment Checklist

- [ ] Code is in a GitHub repository
- [ ] `.env` file is in `.gitignore` (not committed)
- [ ] Google Sheets are published as CSV
- [ ] Cloudflare Pages project is created
- [ ] All environment variables are set in Cloudflare
- [ ] Build completed successfully
- [ ] Website is accessible at `.pages.dev` URL
- [ ] Test all pages: Home, Services, Portfolio, Products
- [ ] Test WhatsApp contact links
- [ ] Images are loading correctly
- [ ] (Optional) Custom domain is configured

---

## 🎉 You're Live!

Your website is now:
- ✅ Hosted globally with 200+ data centers
- ✅ Automatically HTTPS secured
- ✅ Auto-deployed on every Git push
- ✅ Free forever (within limits)

**Pro tip**: Share your `.pages.dev` URL on social media, business cards, and WhatsApp! 🚀

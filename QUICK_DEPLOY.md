# 🚀 Quick Deployment Steps

## 1️⃣ Push to GitHub (One Time)

```bash
# Initialize Git (if not done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit for Cloudflare Pages"

# Create GitHub repo at: https://github.com/new
# Then connect it:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## 2️⃣ Deploy on Cloudflare Pages

1. Go to **[Cloudflare Dashboard](https://dash.cloudflare.com)**
2. Click **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. Select your GitHub repository
4. Configure:
   - **Build command**: `npm run build`
   - **Build output**: `dist`
   - **Framework**: Astro

5. **Add Environment Variables** (copy from your `.env` file):
   ```
   PUBLIC_SHEET_CSV_URL=your_products_csv_url
   PUBLIC_SERVICES_CSV_URL=your_services_csv_url
   PUBLIC_PORTFOLIO_CSV_URL=your_portfolio_csv_url
   PUBLIC_TESTIMONIALS_CSV_URL=your_testimonials_csv_url
   PUBLIC_CLOUDINARY_CLOUD_NAME=djpfyrqbn
   PUBLIC_WHATSAPP_NUMBER=+94771234567
   PUBLIC_WHATSAPP_MESSAGE=Hello! I'm interested in your products.
   PUBLIC_BUSINESS_NAME=Premium Sri Lankan Business
   ```

6. Click **Save and Deploy** ✅

---

## 3️⃣ Update Site Later

```bash
# Make changes to your code
git add .
git commit -m "Your update message"
git push
```

**That's it!** Cloudflare automatically rebuilds and deploys. 🎉

---

## 🔗 Your Site URLs

- **Live Site**: `https://YOUR-PROJECT.pages.dev`
- **Cloudflare Dashboard**: [dash.cloudflare.com](https://dash.cloudflare.com)
- **GitHub Repo**: `https://github.com/YOUR_USERNAME/YOUR_REPO`

---

## 📝 Update Google Sheets Content

1. Edit your Google Sheets
2. Changes are **NOT automatic** (site is static)
3. To see updates, trigger rebuild:
   - Push any code change to GitHub, OR
   - In Cloudflare Pages → Deployments → "Retry deployment"

---

## ⚡ Build Time: ~2-3 minutes
## 💰 Cost: FREE (unlimited bandwidth)
## 🌍 Global CDN: 200+ locations worldwide

---

**Need help?** Check `CLOUDFLARE_DEPLOYMENT.md` for detailed guide!

<!-- @format -->

# Deployment Setup Guide

## Environment Variables Required

For the site to work properly in deployment, you need to set these environment variables in your deployment platform:

### Required Variables

1. **PUBLIC_SUPABASE_URL**

   - Your Supabase project URL
   - Format: `https://xxxxx.supabase.co`
   - Get it from: Supabase Dashboard → Settings → API → Project URL

2. **PUBLIC_SUPABASE_ANON_KEY**
   - Your Supabase anonymous/public key
   - Get it from: Supabase Dashboard → Settings → API → Project API keys → `anon` `public`

### Optional Variables

3. **PUBLIC_WHATSAPP_NUMBER**

   - Default: `+94771234567`
   - Your WhatsApp business number

4. **PUBLIC_WHATSAPP_MESSAGE**

   - Default: `Hello! I'm interested in your properties.`
   - Custom message for WhatsApp links

5. **PUBLIC_BUSINESS_NAME**
   - Default: `Premium Sri Lankan Business`
   - Your business name

## Platform-Specific Instructions

### Cloudflare Pages

1. Go to your Cloudflare Pages project
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - Variable name: `PUBLIC_SUPABASE_URL`
   - Value: Your Supabase URL
   - Environment: Production (and Preview if needed)
4. Repeat for all variables
5. Redeploy your site

#### Important: Property Detail Pages Routing

The property detail pages use a catch-all route (`/property/[...id]`) that works client-side.

**Cloudflare Pages Function**: A `functions/[[path]].js` file has been created to handle routing. This function automatically rewrites all `/property/*` requests (except `/property/index`) to serve the `/property/index.html` page, which then uses client-side JavaScript to load the correct property data.

If you still see 404 errors for property detail pages after deployment:

1. **Check the build output**: Ensure `dist/property/index.html` exists after build
2. **Verify Functions are deployed**: Check Cloudflare Pages dashboard → Functions tab to see if `[[path]].js` is listed
3. **Check function logs**: Go to Cloudflare Pages dashboard → Logs to see if the function is executing
4. **Test locally**: Run `npm run build` and verify the structure in `dist` folder

### Vercel

1. Go to your Vercel project
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - Key: `PUBLIC_SUPABASE_URL`
   - Value: Your Supabase URL
   - Environment: Production, Preview, Development
4. Repeat for all variables
5. Redeploy your site

### Netlify

1. Go to your Netlify site
2. Navigate to **Site settings** → **Environment variables**
3. Add each variable:
   - Key: `PUBLIC_SUPABASE_URL`
   - Value: Your Supabase URL
   - Scopes: All scopes (or specific ones)
4. Repeat for all variables
5. Trigger a new deploy

### GitHub Pages / Static Hosting

For static hosting without environment variable support:

1. You'll need to hardcode the values in the code (not recommended for production)
2. Or use a build script that injects them at build time

## Troubleshooting

### Property Detail Pages Show 404

If property detail pages (e.g., `/property/ca19f44f-9726-4dc2-932d-06c480d2e819`) show 404:

1. **Check the `_redirects` file**: Ensure it exists in `public/_redirects` and is copied to build output
2. **Verify build output**: Check that `dist/property/index.html` exists after build
3. **Test locally**: Run `npm run build` and check the `dist` folder structure
4. **Cloudflare Pages specific**:
   - Go to Cloudflare Pages dashboard → Your project → Settings → Functions
   - Check if redirects are configured
   - You may need to add a custom `functions/[[path]].js` file for catch-all routing

### Properties Not Loading

If properties don't load on the deployed site:

1. **Check environment variables**: Ensure `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` are set
2. **Check browser console**: Look for errors related to Supabase configuration
3. **Verify Supabase RLS policies**: Ensure your database allows public read access for properties
4. **Check network tab**: Verify that API calls to Supabase are successful

### Build Errors

If you encounter build errors:

1. **Check Astro version**: Ensure you're using a compatible version
2. **Verify static output**: Ensure `output: 'static'` is set in `astro.config.mjs`
3. **Check for SSR code**: Remove any server-side only code if using static output

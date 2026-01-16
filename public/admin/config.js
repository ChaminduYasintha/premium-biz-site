// ============================================
// SUPABASE CONFIGURATION
// ============================================
// Get these values from: https://supabase.com/dashboard
// Settings → API → Project URL and Project API keys (anon/public)

const SUPABASE_CONFIG = {
    // Your Supabase Project URL (looks like: https://xxxxxxxxxxxxx.supabase.co)
    url: 'https://eajauzeclxsyqdxutilb.supabase.co',

    // Your Supabase Anon/Public Key (safe to use in client-side code)
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhamF1emVjbHhzeXFkeHV0aWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MDY3NDQsImV4cCI6MjA4NDA4Mjc0NH0.xqQzeibNLGAjIJxFtzSV2v3SLxPtEwuKK6vLCyzAYA8'
}

// ============================================
// DATABASE & STORAGE CONFIGURATION
// ============================================

const DATABASE_CONFIG = {
    // Table name in your Supabase database
    tableName: 'properties',

    // Storage bucket name for property images
    bucketName: 'property-images'
}

// ============================================
// VALIDATION
// ============================================

function validateConfig() {
    if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL' ||
        SUPABASE_CONFIG.anonKey === 'YOUR_SUPABASE_ANON_KEY') {
        console.error('❌ Supabase configuration not set up!')
        return false
    }

    if (!DATABASE_CONFIG.tableName || DATABASE_CONFIG.tableName === 'YOUR_TABLE_NAME') {
        console.error('❌ Database table name not configured!')
        return false
    }

    if (!DATABASE_CONFIG.bucketName || DATABASE_CONFIG.bucketName === 'YOUR_BUCKET_NAME') {
        console.error('❌ Storage bucket name not configured!')
        return false
    }

    return true
}

// Export for use in app.js
window.SUPABASE_CONFIG = SUPABASE_CONFIG
window.DATABASE_CONFIG = DATABASE_CONFIG
window.validateConfig = validateConfig

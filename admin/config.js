// ============================================
// SUPABASE CONFIGURATION
// ============================================
// Get these values from: https://supabase.com/dashboard
// Settings → API → Project URL and Project API keys (anon/public)

const SUPABASE_CONFIG = {
    // Your Supabase Project URL
    // Get from: Dashboard → Settings → API → Project URL
    url: 'https://eajauzeclxsyqdxutilb.supabase.co',

    // Your Supabase Anon/Public Key (this is a LONG JWT token starting with "eyJ...")
    // Get from: Dashboard → Settings → API → Project API keys → anon/public
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
    if (!SUPABASE_CONFIG.url ||
        !SUPABASE_CONFIG.anonKey ||
        SUPABASE_CONFIG.anonKey === 'YOUR_SUPABASE_ANON_KEY_HERE' ||
        SUPABASE_CONFIG.url.includes('xxxxx')) {
        console.error('❌ Please configure your Supabase credentials in config.js')
        console.error('Get them from: https://supabase.com/dashboard → Settings → API')
        return false
    }
    return true
}

// Export for use in app.js
window.SUPABASE_CONFIG = SUPABASE_CONFIG
window.DATABASE_CONFIG = DATABASE_CONFIG
window.validateConfig = validateConfig

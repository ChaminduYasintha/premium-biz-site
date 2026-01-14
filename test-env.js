// Quick test to verify Google Sheets API credentials are loaded
import 'dotenv/config';

console.log('='.repeat(50));
console.log('🔍 Environment Variables Check');
console.log('='.repeat(50));

console.log('\n📋 Checking Google Sheets API Configuration:\n');

const hasClientEmail = !!process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const hasPrivateKey = !!process.env.GOOGLE_SHEETS_PRIVATE_KEY;
const hasSheetId = !!process.env.GOOGLE_SHEET_ID;
const hasAdminPassword = !!process.env.ADMIN_PASSWORD;

console.log(`✓ GOOGLE_SHEETS_CLIENT_EMAIL: ${hasClientEmail ? '✅ Found' : '❌ Missing'}`);
if (hasClientEmail) {
    console.log(`  Value: ${process.env.GOOGLE_SHEETS_CLIENT_EMAIL?.substring(0, 20)}...`);
}

console.log(`✓ GOOGLE_SHEETS_PRIVATE_KEY: ${hasPrivateKey ? '✅ Found' : '❌ Missing'}`);
if (hasPrivateKey) {
    console.log(`  Length: ${process.env.GOOGLE_SHEETS_PRIVATE_KEY?.length} characters`);
    console.log(`  Starts with: ${process.env.GOOGLE_SHEETS_PRIVATE_KEY?.substring(0, 30)}...`);
}

console.log(`✓ GOOGLE_SHEET_ID: ${hasSheetId ? '✅ Found' : '❌ Missing'}`);
if (hasSheetId) {
    console.log(`  Value: ${process.env.GOOGLE_SHEET_ID}`);
}

console.log(`✓ ADMIN_PASSWORD: ${hasAdminPassword ? '✅ Found' : '❌ Missing'}`);

console.log('\n' + '='.repeat(50));

if (hasClientEmail && hasPrivateKey && hasSheetId) {
    console.log('✅ All Google Sheets credentials are configured!');
} else {
    console.log('❌ Some credentials are missing. Check your .env file.');
    console.log('\n💡 Make sure:');
    console.log('   1. .env file exists in project root');
    console.log('   2. Server was restarted after adding credentials');
    console.log('   3. No syntax errors in .env file');
}

console.log('='.repeat(50) + '\n');

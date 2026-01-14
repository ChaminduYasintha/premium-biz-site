// Quick test script to verify CSV URL works
// Usage: node test-csv-url.js "YOUR_CSV_URL_HERE"

const url = process.argv[2];

if (!url) {
    console.log('❌ Please provide a CSV URL to test');
    console.log('Usage: node test-csv-url.js "https://docs.google.com/spreadsheets/..."');
    process.exit(1);
}

console.log('🧪 Testing CSV URL...');
console.log('📍 URL:', url);
console.log('');

fetch(url)
    .then(response => {
        console.log('📊 Status:', response.status, response.statusText);

        if (!response.ok) {
            console.log('❌ ERROR: URL returned', response.status);
            console.log('');
            console.log('💡 Troubleshooting:');
            console.log('1. Make sure the sheet is published (File → Share → Publish to web)');
            console.log('2. Select the specific tab you want');
            console.log('3. Choose "Comma-separated values (.csv)"');
            console.log('4. Click Publish and copy the NEW URL');
            return;
        }

        return response.text();
    })
    .then(csvText => {
        if (!csvText) return;

        console.log('✅ SUCCESS! CSV data received');
        console.log('');
        console.log('📏 Data size:', csvText.length, 'characters');
        console.log('');
        console.log('📄 First 300 characters:');
        console.log('─'.repeat(60));
        console.log(csvText.substring(0, 300));
        console.log('─'.repeat(60));
        console.log('');
        console.log('✅ This URL works! You can use it in your .env file');
    })
    .catch(error => {
        console.log('❌ ERROR:', error.message);
        console.log('');
        console.log('💡 Make sure:');
        console.log('- The Google Sheet is published to web');
        console.log('- The URL ends with "output=csv"');
        console.log('- You have internet connection');
    });

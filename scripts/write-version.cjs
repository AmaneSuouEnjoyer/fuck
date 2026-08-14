const fs = require('fs');
const path = require('path');

// Write version.json into the public/ folder
const versionFile = path.join(__dirname, '..', 'public', 'version.json');
fs.writeFileSync(versionFile, JSON.stringify({ version: Date.now() }));
console.log('✅ version.json written to public/');
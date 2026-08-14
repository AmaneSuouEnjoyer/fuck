const fs = require('fs');

// Read the HTML file (the one with electionData)
const html = fs.readFileSync('map.html', 'utf8');

// Extract the electionData object using regex
const match = html.match(/const electionData = ({[\s\S]*?});\s*\/\//);
if (!match) {
    console.error('Could not find electionData in map.html');
    process.exit(1);
}

// The matched string is the JavaScript object literal
let objString = match[1];

// Clean up: remove trailing commas (a common issue)
// Remove commas before closing braces and brackets
objString = objString.replace(/,(\s*[}\]])/g, '$1');

// Now evaluate it as a JavaScript object
const electionData = eval('(' + objString + ')');

// Write as valid JSON with indentation
fs.writeFileSync('election2023.json', JSON.stringify(electionData, null, 2), 'utf8');
console.log('✅ Valid election2023.json created!');
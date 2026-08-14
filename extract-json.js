const fs = require('fs');

const html = fs.readFileSync('map.html', 'utf8');

// Locate "const electionData = "
const startMarker = 'const electionData = ';
const startPos = html.indexOf(startMarker);
if (startPos === -1) {
    console.error('❌ Could not find const electionData');
    process.exit(1);
}

// Find the opening brace
let braceStart = startPos + startMarker.length;
if (html[braceStart] !== '{') {
    console.error('❌ Expected opening brace');
    process.exit(1);
}

// Count braces to find the matching closing brace
let braceCount = 0;
let endPos = -1;
for (let i = braceStart; i < html.length; i++) {
    if (html[i] === '{') braceCount++;
    else if (html[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
            endPos = i;
            break;
        }
    }
}
if (endPos === -1) {
    console.error('❌ Could not find closing brace');
    process.exit(1);
}

// Extract the object literal
let objString = html.substring(braceStart, endPos + 1);

// Remove trailing commas (before } and ])
objString = objString.replace(/,(\s*[}\]])/g, '$1');

// Remove comments (// ...) inside the object
objString = objString.replace(/\/\/.*$/gm, '');

// Evaluate as a JavaScript object
const data = eval('(' + objString + ')');

// Clean votes: remove dots and convert to integers
function cleanVotes(obj) {
    for (const key in obj) {
        const district = obj[key];
        if (district && typeof district === 'object') {
            ['rte', 'kk', 'so', 'mi'].forEach(cand => {
                if (district[cand] && district[cand].votes) {
                    const clean = parseInt(district[cand].votes.replace(/\./g, ''), 10);
                    if (!isNaN(clean)) {
                        district[cand].votes = clean;
                    }
                }
            });
        }
    }
}
cleanVotes(data);

// Write valid JSON
fs.writeFileSync('election2023.json', JSON.stringify(data, null, 2), 'utf8');
console.log('✅ Valid election2023.json created successfully!');
const fs = require('fs');
const vm = require('vm');

// Read the HTML file
const html = fs.readFileSync('map.html', 'utf8');

// Find the electionData object in the script
// We'll use a regex to extract the part after "const electionData = " and before the next "// "
const regex = /const electionData = ({[\s\S]*?});\s*\/\/ /;
const match = html.match(regex);
if (!match) {
  console.error('Could not find electionData in the HTML.');
  process.exit(1);
}

// The matched group is the object literal
const dataString = match[1];

// Create a sandbox and evaluate the object
const sandbox = {};
const script = new vm.Script(`electionData = ${dataString}`);
script.runInNewContext(sandbox);
const electionData = sandbox.electionData;

// Function to clean up vote strings: remove dots and convert to integer
function cleanVotes(obj) {
  for (const key in obj) {
    const district = obj[key];
    if (district && typeof district === 'object') {
      // Clean votes for each candidate
      ['rte', 'kk', 'so', 'mi'].forEach(cand => {
        if (district[cand] && district[cand].votes) {
          // Remove dots and convert to integer
          const clean = parseInt(district[cand].votes.replace(/\./g, ''), 10);
          if (!isNaN(clean)) {
            district[cand].votes = clean;
          }
        }
      });
      // Ensure winner is a string
      if (district.winner) district.winner = district.winner;
    }
  }
}

cleanVotes(electionData);

// Now stringify with indentation for readability
const json = JSON.stringify(electionData, null, 2);

// Write to file
fs.writeFileSync('election2023.json', json, 'utf8');
console.log('✅ election2023.json created successfully!');
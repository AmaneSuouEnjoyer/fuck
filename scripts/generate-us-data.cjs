const fs = require('fs');

// PASTE YOUR FULL LIST OF COUNTY IDs HERE (from the text file you shared)
const countyIds = [
  "KS_Morris",
  "AL_Houston",
  // ... paste ALL the IDs from your text file here
];

const candidates = ["sanders", "lbj", "bryant", "morse"];
const data = {};

for (const id of countyIds) {
  // Generate random percentages that sum to 100
  const pcts = [];
  let remaining = 100;
  for (let i = 0; i < candidates.length - 1; i++) {
    const pct = Math.round(Math.random() * remaining / 2);
    pcts.push(pct);
    remaining -= pct;
  }
  pcts.push(remaining);

  const districtData = {};
  let winner = "";
  let maxPct = 0;
  for (let i = 0; i < candidates.length; i++) {
    const pct = pcts[i];
    const votes = Math.round(pct * 1000);
    districtData[candidates[i]] = { pct: pct, votes: votes.toString() };
    if (pct > maxPct) {
      maxPct = pct;
      winner = candidates[i];
    }
  }
  districtData.winner = winner;
  data[id] = districtData;
}

fs.writeFileSync('public/data/us1968.json', JSON.stringify(data, null, 2));
console.log('✅ us1968.json generated with', countyIds.length, 'counties');
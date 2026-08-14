const fs = require('fs');

// Read your existing JSON
const data = JSON.parse(fs.readFileSync('election2023.json', 'utf8'));

const newData = {};

for (const [key, district] of Object.entries(data)) {
    const kk = parseInt(district.kk.votes.replace(/\./g, ''));
    const rte = parseInt(district.rte.votes.replace(/\./g, ''));

    // Derive new candidates from KK and RTE
    // MY = 30% of KK (same as KK's base)
    // SD = 20% of KK (same as KK's base)
    // FE = 25% of RTE (same as RTE's base)
    const myVotes = Math.round(kk * 0.3);
    const sdVotes = Math.round(kk * 0.2);
    const feVotes = Math.round(rte * 0.25);

    // Add new candidates with same structure
    district.my = { pct: 0, votes: myVotes.toLocaleString('tr-TR') };
    district.sd = { pct: 0, votes: sdVotes.toLocaleString('tr-TR') };
    district.fe = { pct: 0, votes: feVotes.toLocaleString('tr-TR') };

    // Keep the existing data
    newData[key] = district;
}

fs.writeFileSync('election2023.json', JSON.stringify(newData, null, 2), 'utf8');
console.log('✅ New candidates MY, SD, FE added to election2023.json');
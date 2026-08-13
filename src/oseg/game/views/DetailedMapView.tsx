import React, { useEffect, useRef, useState } from 'react';
import { Engine } from '../../engine/Engine';
import { ThemeModel } from '../../engine/models/ThemeModel';
import * as d3 from 'd3';

interface DetailedMapViewProps {
  engine: Engine;
  theme: ThemeModel;
}

// Helper: normalize Turkish characters
function normalizeName(name: string): string {
  return name
    .toLocaleLowerCase('tr')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/i̇/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .trim();
}

// Mapping from province plate to name (from your cityNameMap)
const cityNameMap: Record<string, string> = {
  "01": "ADANA",
  "02": "ADIYAMAN",
  // ... paste the entire cityNameMap from your HTML here
};

// Reverse mapping: normalized name -> plate
const cityNameToPlate: Record<string, string> = {};
Object.entries(cityNameMap).forEach(([plate, name]) => {
  cityNameToPlate[normalizeName(name)] = plate;
});

// Candidate name mapping (game full name -> map short key)
const GAME_NAME_TO_MAP_KEY: Record<string, string> = {
  "Recep Tayyip Erdoğan": "rte",
  "Kemal Kılıçdaroğlu": "kk",
  "Sinan Oğan": "so",
  "Muharrem İnce": "mi",
};
const MAP_KEY_TO_GAME_NAME: Record<string, string> = {
  "rte": "Recep Tayyip Erdoğan",
  "kk": "Kemal Kılıçdaroğlu",
  "so": "Sinan Oğan",
  "mi": "Muharrem İnce",
};

// Color scales (same as in HTML)
const scales = {
  rte: d3.scaleLinear().domain([40, 80]).range(["#fef08a", "#a16207"]),
  kk: d3.scaleLinear().domain([40, 80]).range(["#fca5a5", "#991b1b"]),
  so: d3.scaleLinear().domain([1, 20]).range(["#93c5fd", "#1d4ed8"]),
  mi: d3.scaleLinear().domain([0.1, 5]).range(["#86efac", "#15803d"]),
};

export default function DetailedMapView({ engine, theme }: DetailedMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAndRender() {
      try {
        // 1. Fetch district data
        const response = await fetch('/data/election2023.json');
        if (!response.ok) throw new Error('Failed to load district data');
        const electionData = await response.json();

        // 2. Extract game province results
        const gameResults: Record<string, Record<string, number>> = {};
        const stateControllers = engine.scenarioController.stateControllers;
        const candidates = engine.scenarioController.getCandidates();

        stateControllers.forEach((state) => {
          const stateName = state.model.name;
          const votes: Record<string, number> = {};
          candidates.forEach((candidate) => {
            const fullName = candidate.model.firstName + " " + candidate.model.lastName;
            votes[fullName] = state.getPvsForCandidate(candidate);
          });
          gameResults[stateName] = votes;
        });

        // 3. Apply scaling (copy the function from the previous message)
        const adjustedData = applyProvinceResults(electionData, gameResults, cityNameToPlate);

        // 4. Render D3 map using adjustedData
        renderMap(containerRef.current!, adjustedData, theme);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load map data.');
        setLoading(false);
      }
    }

    loadAndRender();
  }, [engine, theme]);

  if (loading) return <div style={{ color: theme.primaryGameWindowTextColor }}>Loading detailed map...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '80vh', background: '#e9ecf2', position: 'relative' }}
    />
  );
}

// --- Scaling function (same as previous) ---
function applyProvinceResults(
  electionData: any,
  gameResults: Record<string, Record<string, number>>,
  cityNameToPlate: Record<string, string>
) {
  const adjustedData = JSON.parse(JSON.stringify(electionData));
  const candidates = ['rte', 'kk', 'so', 'mi'];

  Object.entries(gameResults).forEach(([provinceName, gameVotes]) => {
    const normalizedProvince = normalizeName(provinceName);
    const plate = cityNameToPlate[normalizedProvince];
    if (!plate) {
      console.warn(`Unknown province: ${provinceName}`);
      return;
    }

    // Sum base totals for this province
    const baseTotals = { rte: 0, kk: 0, so: 0, mi: 0 };
    Object.entries(electionData).forEach(([key, d]: [string, any]) => {
      if (key.startsWith(plate + '-')) {
        candidates.forEach(c => {
          baseTotals[c] += parseInt(d[c].votes.replace(/\./g, '')) || 0;
        });
      }
    });

    // Compute scaling factors
    const factors: Record<string, number> = {};
    candidates.forEach(c => {
      const gameVote = gameVotes[MAP_KEY_TO_GAME_NAME[c]] ?? 0;
      const baseVote = baseTotals[c];
      factors[c] = baseVote > 0 ? gameVote / baseVote : 0;
    });

    // Apply to each district
    Object.keys(adjustedData).forEach(key => {
      if (!key.startsWith(plate + '-')) return;
      const d = adjustedData[key];
      candidates.forEach(c => {
        const baseVotes = parseInt(d[c].votes.replace(/\./g, '')) || 0;
        const scaled = Math.round(baseVotes * factors[c]);
        d[c].votes = scaled.toLocaleString('tr-TR');
      });

      // Recalculate percentages and winner
      const total = candidates.reduce((sum, c) => sum + parseInt(d[c].votes.replace(/\./g, '')) || 0, 0);
      if (total > 0) {
        candidates.forEach(c => {
          const v = parseInt(d[c].votes.replace(/\./g, '')) || 0;
          d[c].pct = ((v / total) * 100).toFixed(2);
        });
        let winner = 'rte';
        let maxPct = parseFloat(d.rte.pct);
        ['kk', 'so', 'mi'].forEach(c => {
          if (parseFloat(d[c].pct) > maxPct) { winner = c; maxPct = parseFloat(d[c].pct); }
        });
        d.winner = winner;
      }
    });
  });

  return adjustedData;
}

// --- D3 render function ---
function renderMap(container: HTMLDivElement, data: any, theme: ThemeModel) {
  // Clear previous content
  d3.select(container).selectAll('*').remove();

  const width = container.clientWidth;
  const height = container.clientHeight;

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const g = svg.append('g');

  const zoom = d3.zoom()
    .scaleExtent([0.3, 20])
    .on('zoom', (event) => g.attr('transform', event.transform));

  svg.call(zoom);

  // Load SVG
  d3.xml('/turkey-map.svg').then((response) => {
    const importedSvg = response.documentElement;
    while (importedSvg.children.length > 0) {
      g.node().appendChild(importedSvg.children[0]);
    }

    // Color all districts
    d3.selectAll('#features > g').each(function() {
      const group = d3.select(this);
      const idKey = group.attr('id') || '';
      const districtData = data[idKey];
      if (districtData && districtData.winner) {
        const color = scales[districtData.winner](districtData[districtData.winner].pct);
        group.selectAll('path')
          .style('fill', color)
          .style('stroke', '#ffffff')
          .style('stroke-width', '0.5px');
      } else {
        group.selectAll('path').style('fill', '#cbd5e1');
      }
    });

    // Center and zoom
    const bbox = g.node().getBBox();
    if (bbox.width > 0 && bbox.height > 0) {
      const scale = Math.min(width / bbox.width, height / bbox.height) * 0.92;
      const centerX = width / 2 - (bbox.x + bbox.width / 2) * scale;
      const centerY = height / 2 - (bbox.y + bbox.height / 2) * scale;
      const initialTransform = d3.zoomIdentity.translate(centerX, centerY).scale(scale);
      g.attr('transform', initialTransform);
      svg.call(zoom.transform, initialTransform);
    }

    // Optional: add tooltips (you can expand later)
  }).catch(err => {
    console.error('Error loading SVG:', err);
  });
}
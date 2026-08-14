import { useEffect, useState, useRef } from "react";
import { Engine } from "../../engine/Engine";
import { ThemeModel } from "../../engine/models/ThemeModel";
import { convertHistoricalResultsToFinalResults } from "../../utils/FinalResultsAdapter";
import EndingSlides from "../components/EndingSlides";
import FinalResults from "../components/FinalResults";
import ResultsByState from "../components/ResultsByState";
import "./EndingView.css";
import MapView from "./MapView";
import FurtherReading from "../components/FurtherReading";
import * as d3 from "d3";

interface EndingViewProps {
  engine: Engine;
  theme: ThemeModel;
  mapSvg: string;
}

enum EndingTab {
  EndingSlides,
  ResultsByState,
  OverallResultsDetailed,
  Map,
  FurtherReading,
  DetailedMap,
}

// ============================================================
// DETAILED MAP VIEW – loads district data, scales, renders D3 map
// ============================================================

// Helper: normalize Turkish characters
function normalizeName(name: string): string {
  return name
    .toLocaleLowerCase("tr")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/i̇/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .trim();
}

// Province plate → name mapping (from election2023.json)
const cityNameMap: Record<string, string> = {
  "01": "ADANA",
  "02": "ADIYAMAN",
  "03": "AFYONKARAHİSAR",
  "04": "AĞRI",
  "05": "AMASYA",
  "06": "ANKARA",
  "07": "ANTALYA",
  "08": "ARTVİN",
  "09": "AYDIN",
  "10": "BALIKESİR",
  "11": "BİLECİK",
  "12": "BİNGÖL",
  "13": "BİTLİS",
  "14": "BOLU",
  "15": "BURDUR",
  "16": "BURSA",
  "17": "ÇANAKKALE",
  "18": "ÇANKIRI",
  "19": "ÇORUM",
  "20": "DENİZLİ",
  "21": "DİYARBAKIR",
  "22": "EDİRNE",
  "23": "ELAZIĞ",
  "24": "ERZİNCAN",
  "25": "ERZURUM",
  "26": "ESKİŞEHİR",
  "27": "GAZİANTEP",
  "28": "GİRESUN",
  "29": "GÜMÜŞHANE",
  "30": "HAKKARİ",
  "31": "HATAY",
  "32": "ISPARTA",
  "33": "MERSİN",
  "34": "İSTANBUL",
  "35": "İZMİR",
  "36": "KARS",
  "37": "KASTAMONU",
  "38": "KAYSERİ",
  "39": "KIRKLARELİ",
  "40": "KIRŞEHİR",
  "41": "KOCAELİ",
  "42": "KONYA",
  "43": "KÜTAHYA",
  "44": "MALATYA",
  "45": "MANİSA",
  "46": "KAHRAMANMARAŞ",
  "47": "MARDİN",
  "48": "MUĞLA",
  "49": "MUŞ",
  "50": "NEVŞEHİR",
  "51": "NİĞDE",
  "52": "ORDU",
  "53": "RİZE",
  "54": "SAKARYA",
  "55": "SAMSUN",
  "56": "SİİRT",
  "57": "SİNOP",
  "58": "SİVAS",
  "59": "TEKİRDAĞ",
  "60": "TOKAT",
  "61": "TRABZON",
  "62": "TUNCELİ",
  "63": "ŞANLIURFA",
  "64": "UŞAK",
  "65": "VAN",
  "66": "YOZGAT",
  "67": "ZONGULDAK",
  "68": "AKSARAY",
  "69": "BAYBURT",
  "70": "KARAMAN",
  "71": "KIRIKKALE",
  "72": "BATMAN",
  "73": "ŞIRNAK",
  "74": "BARTIN",
  "75": "ARDAHAN",
  "76": "IĞDIR",
  "77": "YALOVA",
  "78": "KARABÜK",
  "79": "KİLİS",
  "80": "OSMANİYE",
  "81": "DÜZCE",
};

// Reverse mapping: normalized province name → plate
const cityNameToPlate: Record<string, string> = {};
Object.entries(cityNameMap).forEach(([plate, name]) => {
  cityNameToPlate[normalizeName(name)] = plate;
});

// Candidate name mapping (map short key → game full name)
const MAP_KEY_TO_GAME_NAME: Record<string, string> = {
  rte: "Recep Tayyip Erdoğan",
  kk: "Kemal Kılıçdaroğlu",
  so: "Sinan Oğan",
  mi: "Muharrem İnce",
};

// Color scales
const scales = {
  rte: d3.scaleLinear<string, string>().domain([40, 80]).range(["#fef08a", "#a16207"]),
  kk: d3.scaleLinear<string, string>().domain([40, 80]).range(["#fca5a5", "#991b1b"]),
  so: d3.scaleLinear<string, string>().domain([1, 20]).range(["#93c5fd", "#1d4ed8"]),
  mi: d3.scaleLinear<string, string>().domain([0.1, 5]).range(["#86efac", "#15803d"]),
};

// --- Scaling function ---
function applyProvinceResults(
  electionData: any,
  gameResults: Record<string, Record<string, number>>
) {
  const adjustedData = JSON.parse(JSON.stringify(electionData));
  const candidates = ["rte", "kk", "so", "mi"];

  Object.entries(gameResults).forEach(([provinceName, gameVotes]) => {
    const normalizedProvince = normalizeName(provinceName);
    const plate = cityNameToPlate[normalizedProvince];
    if (!plate) {
      console.warn(`Unknown province: ${provinceName}`);
      return;
    }

    // Sum base totals for this province
    const baseTotals: Record<string, number> = { rte: 0, kk: 0, so: 0, mi: 0 };
    Object.entries(electionData).forEach(([key, d]: [string, any]) => {
      if (key.startsWith(plate + "-")) {
        candidates.forEach((c) => {
          baseTotals[c] += parseInt(d[c].votes.replace(/\./g, "")) || 0;
        });
      }
    });

    // Compute scaling factors
    const factors: Record<string, number> = {};
    candidates.forEach((c) => {
      const gameVote = gameVotes[MAP_KEY_TO_GAME_NAME[c]] ?? 0;
      const baseVote = baseTotals[c];
      factors[c] = baseVote > 0 ? gameVote / baseVote : 0;
    });

    // Apply to each district
    Object.keys(adjustedData).forEach((key) => {
      if (!key.startsWith(plate + "-")) return;
      const d = adjustedData[key];
      candidates.forEach((c) => {
        const baseVotes = parseInt(d[c].votes.replace(/\./g, "")) || 0;
        const scaled = Math.round(baseVotes * factors[c]);
        d[c].votes = scaled.toLocaleString("tr-TR");
      });

      // Recalculate percentages and winner (normalize to 100%)
      const total = candidates.reduce(
        (sum, c) => sum + parseInt(d[c].votes.replace(/\./g, "")) || 0,
        0
      );
      if (total > 0) {
        candidates.forEach((c) => {
          const v = parseInt(d[c].votes.replace(/\./g, "")) || 0;
          d[c].pct = ((v / total) * 100).toFixed(2);
        });
        let winner = "rte";
        let maxPct = parseFloat(d.rte.pct);
        ["kk", "so", "mi"].forEach((c) => {
          if (parseFloat(d[c].pct) > maxPct) {
            winner = c;
            maxPct = parseFloat(d[c].pct);
          }
        });
        d.winner = winner;
      }
    });
  });

  return adjustedData;
}

// --- D3 render function ---
function renderMap(container: HTMLDivElement, data: any) {
  // Clear previous content
  d3.select(container).selectAll("*").remove();

  const width = container.clientWidth;
  const height = container.clientHeight;

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g");

  const zoom = d3
    .zoom()
    .scaleExtent([0.3, 20])
    .on("zoom", (event) => g.attr("transform", event.transform));

  (svg as any).call(zoom);

  // Load SVG
  d3.xml("/fuck/turkey-map.svg")
    .then((response) => {
      const importedSvg = response.documentElement;
      while (importedSvg.children.length > 0) {
        g.node()!.appendChild(importedSvg.children[0]);
      }

      // Color all districts
      d3.selectAll("#features > g").each(function () {
        const group = d3.select(this);
        const idKey = normalizeName(group.attr("id") || "");
        const districtData = data[idKey];
        if (districtData && districtData.winner) {
          const color = scales[districtData.winner as keyof typeof scales](
            districtData[districtData.winner].pct
          );
          group
            .selectAll("path")
            .style("fill", color)
            .style("stroke", "#ffffff")
            .style("stroke-width", "0.5px");
        } else {
          group.selectAll("path").style("fill", "#cbd5e1");
        }
      });

      // Center and zoom
      const bbox = g.node()!.getBBox();
      if (bbox.width > 0 && bbox.height > 0) {
        const scale = Math.min(width / bbox.width, height / bbox.height) * 0.92;
        const centerX = width / 2 - (bbox.x + bbox.width / 2) * scale;
        const centerY = height / 2 - (bbox.y + bbox.height / 2) * scale;
        const initialTransform = d3.zoomIdentity
          .translate(centerX, centerY)
          .scale(scale);
        g.attr("transform", initialTransform.toString());
        (svg as any).call(zoom.transform, initialTransform);
      }
    })
    .catch((err) => {
      console.error("Error loading SVG:", err);
    });
}

// --- DetailedMapView component (FIXED: container always mounted) ---
function DetailedMapView({ engine, theme }: { engine: Engine; theme: ThemeModel }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adjustedData, setAdjustedData] = useState<any>(null);

  // Load data and scale it
  useEffect(() => {
    async function loadAndRender() {
      try {
        const response = await fetch("/fuck/data/election2023.json");
        if (!response.ok) throw new Error("Failed to load district data");
        const electionData = await response.json();

        const gameResults: Record<string, Record<string, number>> = {};
        const stateControllers = engine.scenarioController.stateControllers;
        const candidates = engine.scenarioController.getCandidates();

        stateControllers.forEach((state) => {
          const stateName = state.model.name;
          const votes: Record<string, number> = {};
          candidates.forEach((candidate) => {
            const fullName =
              candidate.model.firstName + " " + candidate.model.lastName;
            votes[fullName] = state.getPvsForCandidate(candidate);
          });
          gameResults[stateName] = votes;
        });

        const adjusted = applyProvinceResults(electionData, gameResults);
        setAdjustedData(adjusted);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load map data.");
        setLoading(false);
      }
    }

    loadAndRender();
  }, [engine]);

  // Render the map once loading is finished and the container is visible
  useEffect(() => {
    if (!loading && !error && adjustedData && containerRef.current) {
      // Use requestAnimationFrame to ensure the container has been re-rendered with display:block
      requestAnimationFrame(() => {
        if (containerRef.current) {
          renderMap(containerRef.current, adjustedData);
        }
      });
    }
  }, [loading, error, adjustedData]);

  return (
    <div style={{ position: "relative" }}>
      {loading && (
        <div style={{ color: theme.primaryGameWindowTextColor }}>
          Loading detailed map...
        </div>
      )}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "80vh",
          background: "#e9ecf2",
          position: "relative",
          display: loading || error ? "none" : "block",
        }}
      />
    </div>
  );  

// ============================================================
// ENDING VIEW
// ============================================================

function EndingView(props: EndingViewProps) {
  const [currentTab, setCurrentTab] = useState<EndingTab>(EndingTab.EndingSlides);
  const { engine, theme, mapSvg } = props;

  const [finalResults, setFinalResults] = useState(() => engine.getFinalResults());
  const [historicalResults, setHistoricalResults] = useState(() =>
    engine.getHistoricalResults()
  );

  useEffect(() => {
    const newFinalResults = engine.getFinalResults();
    setFinalResults(newFinalResults);
    setHistoricalResults(engine.getHistoricalResults());
  }, [engine, engine.scenarioController.model]);

  if (engine == null) {
    return <div>ERROR ENGINE NULL</div>;
  }

  function getTab() {
    if (currentTab == EndingTab.EndingSlides) {
      return (
        <>
          <EndingSlides theme={theme} ending={engine.getEnding()} />
          <FinalResults engine={engine} theme={theme} results={finalResults} />
        </>
      );
    } else if (currentTab == EndingTab.Map) {
      return (
        <MapView
          fullyColored={true}
          theme={theme}
          onStateClicked={null}
          engine={engine}
          mapSvg={mapSvg}
        />
      );
    } else if (currentTab == EndingTab.OverallResultsDetailed) {
      return (
        <div style={{ color: theme.primaryGameWindowTextColor }}>
          <h2>Results - This Game</h2>
          <FinalResults engine={engine} theme={theme} results={finalResults} />
          {historicalResults && (
            <>
              <h2>Results - Historical</h2>
              <FinalResults
                engine={engine}
                theme={theme}
                results={convertHistoricalResultsToFinalResults(
                  historicalResults,
                  engine.scenarioController.getCandidates()
                )}
              />
            </>
          )}
        </div>
      );
    } else if (currentTab == EndingTab.ResultsByState) {
      return <ResultsByState engine={engine} theme={theme} />;
    } else if (currentTab == EndingTab.FurtherReading) {
      return <FurtherReading engine={engine} theme={theme} />;
    } else if (currentTab == EndingTab.DetailedMap) {
      return <DetailedMapView engine={engine} theme={theme} />;
    }
  }

  return (
    <div className="EndingView">
      {getTab()}
      <div>
        <button
          disabled={currentTab == EndingTab.EndingSlides}
          onClick={() => setCurrentTab(EndingTab.EndingSlides)}
        >
          {engine.getLocalization("Slides")}
        </button>
        <button
          disabled={currentTab == EndingTab.Map}
          onClick={() => setCurrentTab(EndingTab.Map)}
        >
          {engine.getLocalization("Map")}
        </button>
        <button
          disabled={currentTab == EndingTab.ResultsByState}
          onClick={() => setCurrentTab(EndingTab.ResultsByState)}
        >
          {engine.getLocalization("Results By State")}
        </button>
        <button
          disabled={currentTab == EndingTab.FurtherReading}
          onClick={() => setCurrentTab(EndingTab.FurtherReading)}
        >
          {engine.getLocalization("Further Reading")}
        </button>
        <button
          disabled={currentTab == EndingTab.OverallResultsDetailed}
          onClick={() => setCurrentTab(EndingTab.OverallResultsDetailed)}
        >
          {engine.getLocalization("Overall Results Detailed")}
        </button>
        <button
          disabled={currentTab == EndingTab.DetailedMap}
          onClick={() => setCurrentTab(EndingTab.DetailedMap)}
        >
          Detailed Map
        </button>
      </div>
    </div>
  );
}

export default EndingView;
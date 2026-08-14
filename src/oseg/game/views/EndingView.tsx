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
// DETAILED MAP VIEW
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

// Province plate → name mapping
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

// Reverse mapping
const cityNameToPlate: Record<string, string> = {};
Object.entries(cityNameMap).forEach(([plate, name]) => {
  cityNameToPlate[normalizeName(name)] = plate;
});

// Candidate name mapping (short key → game full name)
const MAP_KEY_TO_GAME_NAME: Record<string, string> = {
  rte: "Recep Tayyip Erdoğan",
  kk: "Kemal Kılıçdaroğlu",
  so: "Sinan Oğan",
  mi: "Muharrem İnce",
  my: "Mansur Yavaş",
  sd: "Selahattin Demirtaş",
  fe: "Fatih Erbakan",
};

// All 7 candidates (order matters for sidebar)
const ALL_CANDIDATES = ["rte", "kk", "so", "mi", "my", "sd", "fe"];

// Color scales – ALL use domain [40, 80] for consistent intensity
const scales = {
  rte: d3.scaleLinear<string, string>().domain([40, 80]).range(["#fef08a", "#a16207"]),
  kk: d3.scaleLinear<string, string>().domain([40, 80]).range(["#fca5a5", "#991b1b"]),
  so: d3.scaleLinear<string, string>().domain([40, 80]).range(["#93c5fd", "#1d4ed8"]),
  mi: d3.scaleLinear<string, string>().domain([40, 80]).range(["#86efac", "#15803d"]),
  my: d3.scaleLinear<string, string>().domain([40, 80]).range(["#fca5a5", "#991b1b"]), // Same as KK
  sd: d3.scaleLinear<string, string>().domain([40, 80]).range(["#c084fc", "#7c3aed"]),
  fe: d3.scaleLinear<string, string>().domain([40, 80]).range(["#fdba74", "#c2410c"]),
};

// --- Aggregator: compute city (province) totals from district data ---
function computeCityData(districtData: any) {
  const cityTotals: Record<string, any> = {};
  const candidates = ALL_CANDIDATES;

  for (const [key, district] of Object.entries(districtData)) {
    const plate = key.split('-')[0];
    if (!cityTotals[plate]) {
      cityTotals[plate] = {};
      candidates.forEach(c => cityTotals[plate][c] = { votes: 0, pct: 0 });
    }
    // district is any, but we know its structure
    const d = district as any;
    candidates.forEach(c => {
      const v = parseInt(d[c].votes.replace(/\./g, '')) || 0;
      cityTotals[plate][c].votes += v;
    });
  }

  // Recalculate percentages and winner per province
  for (const totals of Object.values(cityTotals)) {
    const total = candidates.reduce((sum, c) => sum + totals[c].votes, 0);
    if (total > 0) {
      candidates.forEach(c => {
        totals[c].pct = ((totals[c].votes / total) * 100).toFixed(2);
        totals[c].votes = totals[c].votes.toLocaleString('tr-TR');
      });
      let winner = candidates[0];
      let maxPct = parseFloat(totals[winner].pct);
      candidates.forEach(c => {
        if (parseFloat(totals[c].pct) > maxPct) {
          winner = c;
          maxPct = parseFloat(totals[c].pct);
        }
      });
      totals.winner = winner;
    }
  }

  return cityTotals;
}

// --- Scaling function (unchanged) ---
function applyProvinceResults(
  electionData: any,
  gameResults: Record<string, Record<string, number>>
) {
  const adjustedData = JSON.parse(JSON.stringify(electionData));

  Object.entries(gameResults).forEach(([provinceName, gameVotes]) => {
    const normalizedProvince = normalizeName(provinceName);
    const plate = cityNameToPlate[normalizedProvince];
    if (!plate) {
      console.warn(`Unknown province: ${provinceName}`);
      return;
    }

    // Normalize gameVotes keys so we can match regardless of spacing/diacritics
    const normalizedGameVotes: Record<string, number> = {};
    for (const [gameName, votes] of Object.entries(gameVotes)) {
      normalizedGameVotes[normalizeName(gameName)] = votes;
    }

    // Sum base totals for this province
    const baseTotals: Record<string, number> = {};
    ALL_CANDIDATES.forEach((c) => { baseTotals[c] = 0; });
    Object.entries(electionData).forEach(([key, d]: [string, any]) => {
      if (key.startsWith(plate + "-")) {
        ALL_CANDIDATES.forEach((c) => {
          baseTotals[c] += parseInt(d[c].votes.replace(/\./g, "")) || 0;
        });
      }
    });

    // Compute scaling factors using normalized lookup
    const factors: Record<string, number> = {};
    ALL_CANDIDATES.forEach((c) => {
      const expectedName = MAP_KEY_TO_GAME_NAME[c];
      const normalizedExpected = normalizeName(expectedName);
      const gameVote = normalizedGameVotes[normalizedExpected] ?? 0;
      const baseVote = baseTotals[c];
      factors[c] = baseVote > 0 ? gameVote / baseVote : 0;
    });

    // Apply to each district (same as before) ...
    Object.keys(adjustedData).forEach((key) => {
      if (!key.startsWith(plate + "-")) return;
      const d = adjustedData[key];
      ALL_CANDIDATES.forEach((c) => {
        const baseVotes = parseInt(d[c].votes.replace(/\./g, "")) || 0;
        const scaled = Math.round(baseVotes * factors[c]);
        d[c].votes = scaled.toLocaleString("tr-TR");
      });

      // Recalculate percentages and winner (same as before) ...
      const total = ALL_CANDIDATES.reduce(
        (sum, c) => sum + parseInt(d[c].votes.replace(/\./g, "")) || 0,
        0
      );
      if (total > 0) {
        ALL_CANDIDATES.forEach((c) => {
          const v = parseInt(d[c].votes.replace(/\./g, "")) || 0;
          d[c].pct = ((v / total) * 100).toFixed(2);
        });
        let winner = ALL_CANDIDATES[0];
        let maxPct = parseFloat(d[winner].pct);
        ALL_CANDIDATES.forEach((c) => {
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

// --- D3 render function (now only takes 4 args, cityData removed) ---
function renderMap(
  container: HTMLDivElement,
  data: any,          // district-level data when mode='district', province-level when mode='city'
  onHover: (name: string, districtData: any) => void,
  mode: "district" | "city"
) {
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
        let districtData;
        let name;

        if (mode === "district") {
          districtData = data[idKey];
          name = group.attr("title") || idKey.replace(/^[0-9]+-/, "").replace(/-/g, " ");
        } else {
          // city mode: get plate from idKey (first two digits)
          const plate = idKey.split('-')[0];
          districtData = data[plate]; // data is cityData indexed by plate
          name = cityNameMap[plate] || plate;
        }

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

        // Hover events
        group
          .on("mouseover", function () {
            group.selectAll("path")
              .style("opacity", 0.8)
              .style("stroke", "#0f172a")
              .style("stroke-width", "1.5px");
            if (districtData) {
              onHover(name, districtData);
            } else {
              onHover(name, null);
            }
          })
          .on("mouseout", function () {
            group.selectAll("path")
              .style("opacity", 1)
              .style("stroke", "#ffffff")
              .style("stroke-width", "0.5px");
            onHover("", null);
          });
      });

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

// --- DetailedMapView component (with mode toggle) ---
function DetailedMapView({ engine, theme }: { engine: Engine; theme: ThemeModel }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adjustedData, setAdjustedData] = useState<any>(null);
  const [cityData, setCityData] = useState<any>(null);
  const [mode, setMode] = useState<"district" | "city">("district");
  const [hoveredDistrict, setHoveredDistrict] = useState<{
    name: string;
    data: any;
  } | null>(null);

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
        const cityAgg = computeCityData(adjusted);
        setAdjustedData(adjusted);
        setCityData(cityAgg);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load map data.");
        setLoading(false);
      }
    }

    loadAndRender();
  }, [engine]);

  // Render the map when data or mode changes
  useEffect(() => {
    if (!loading && !error && adjustedData && containerRef.current) {
      requestAnimationFrame(() => {
        if (containerRef.current) {
          const dataToRender = mode === "district" ? adjustedData : cityData;
          if (dataToRender) {
            renderMap(
              containerRef.current,
              dataToRender,
              (name, data) => {
                setHoveredDistrict(data ? { name, data } : null);
              },
              mode
            );
          }
        }
      });
    }
  }, [loading, error, adjustedData, cityData, mode]);

  const candidateColors: Record<string, string> = {
    rte: "#eab308",
    kk: "#ef4444",
    so: "#3b82f6",
    mi: "#22c55e",
    my: "#ef4444",   // Same as KK
    sd: "#8b5cf6",
    fe: "#ea580c",
  };

  const candidateLabels: Record<string, string> = {
    rte: "RTE",
    kk: "KK",
    so: "S. Oğan",
    mi: "M. İnce",
    my: "M. Yavaş",
    sd: "S. Demirtaş",
    fe: "F. Erbakan",
  };

  return (
    <div style={{ display: "flex", height: "80vh", gap: "0", background: "#e9ecf2" }}>
      <div style={{ flex: 3, position: "relative" }}>
        {loading && (
          <div style={{ color: theme.primaryGameWindowTextColor, padding: "20px" }}>
            Loading detailed map...
          </div>
        )}
        {error && <div style={{ color: "red", padding: "20px" }}>{error}</div>}
        <div
          ref={containerRef}
          style={{
            width: "100%",
            height: "100%",
            background: "#e9ecf2",
            position: "relative",
            display: loading || error ? "none" : "block",
          }}
        />
      </div>

      <div
        style={{
          flex: 1,
          minWidth: "250px",
          background: "white",
          borderLeft: "2px solid #d1d9e6",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        <h2 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#1e293b", borderBottom: "2px solid #3b82f6", paddingBottom: "8px", marginBottom: "15px" }}>
          📍 {mode === "district" ? "İlçe" : "İl"} Info
        </h2>

        {/* Mode toggle buttons */}
        <div style={{ display: "flex", background: "#e2e8f0", borderRadius: "8px", padding: "4px", marginBottom: "15px" }}>
          <button
            style={{
              flex: 1,
              padding: "8px 10px",
              border: "none",
              borderRadius: "6px",
              background: mode === "district" ? "white" : "transparent",
              fontWeight: 600,
              cursor: "pointer",
              color: mode === "district" ? "#0f172a" : "#64748b",
              boxShadow: mode === "district" ? "0 1px 3px rgba(0,0,0,0.12)" : "none"
            }}
            onClick={() => setMode("district")}
          >
            İlçe Modu
          </button>
          <button
            style={{
              flex: 1,
              padding: "8px 10px",
              border: "none",
              borderRadius: "6px",
              background: mode === "city" ? "white" : "transparent",
              fontWeight: 600,
              cursor: "pointer",
              color: mode === "city" ? "#0f172a" : "#64748b",
              boxShadow: mode === "city" ? "0 1px 3px rgba(0,0,0,0.12)" : "none"
            }}
            onClick={() => setMode("city")}
          >
            İl Modu
          </button>
        </div>

        {hoveredDistrict ? (
          <>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#0f172a", wordBreak: "break-word", textTransform: "capitalize" }}>
              {hoveredDistrict.name}
            </div>
            <div style={{ marginTop: "15px", fontSize: "1rem", color: "#334155", lineHeight: "1.8" }}>
              {ALL_CANDIDATES.map((key) => {
                const data = hoveredDistrict.data[key];
                if (!data) return null;
                const isWinner = hoveredDistrict.data.winner === key;
                return (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 10px",
                      marginBottom: "6px",
                      borderRadius: "6px",
                      background: "#f8fafc",
                      fontWeight: isWinner ? "bold" : "normal",
                      border: isWinner ? "1px solid #cbd5e1" : "none",
                    }}
                  >
                    <span>
                      <span
                        style={{
                          display: "inline-block",
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background: candidateColors[key],
                          marginRight: "6px",
                        }}
                      />
                      <strong>{candidateLabels[key]}</strong>
                    </span>
                    <span>
                      %{data.pct} ({data.votes} Oy)
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div style={{ color: "#94a3b8", fontSize: "1.2rem", marginTop: "20px" }}>
            {mode === "district" ? "Hover over a district" : "Hover over a province"}
          </div>
        )}

        <div style={{ marginTop: "auto", paddingTop: "20px", borderTop: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.85rem" }}>
          <p>🖱️ Scroll to zoom · Drag to pan</p>
        </div>
      </div>
    </div>
  );
}

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
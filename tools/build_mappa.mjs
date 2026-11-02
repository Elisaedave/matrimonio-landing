// Genera js/map-data.js (terre, reticolo, tappe e tratte già proiettate) — eseguire con: node tools/build_mappa.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { geoNaturalEarth1, geoPath, geoGraticule10 } from "d3-geo";
import { feature } from "topojson-client";

const W = 1000;
const H = 540;

const land = feature(
  JSON.parse(readFileSync(new URL("./node_modules/world-atlas/land-110m.json", import.meta.url))),
  "land",
);

// Tappe nell'ordine del viaggio [nome, paese, lon, lat]
const tappe = [
  ["Milano", "Italia", 9.19, 45.46],
  ["Singapore", "Singapore", 103.82, 1.35],
  ["Christchurch", "Nuova Zelanda", 172.64, -43.53],
  ["Auckland", "Nuova Zelanda", 174.76, -36.85],
  ["Bora Bora", "Polinesia Francese", -151.74, -16.5],
  ["Sydney", "Australia", 151.21, -33.87],
  ["Milano", "Italia", 9.19, 45.46],
];

const projection = geoNaturalEarth1().rotate([-105, 0]).fitExtent(
  [
    [10, 10],
    [W - 10, H - 10],
  ],
  { type: "Sphere" },
);
const path = geoPath(projection).digits(1);

const sphere = path({ type: "Sphere" });
const terre = path(land);
const reticolo = path(geoGraticule10());

const citta = tappe.map(([nome, paese, lon, lat]) => {
  const [x, y] = projection([lon, lat]);
  return { nome, paese, x: +x.toFixed(1), y: +y.toFixed(1) };
});

const tratte = [];
for (let i = 0; i < tappe.length - 1; i++) {
  const d = path({ type: "LineString", coordinates: [tappe[i].slice(2), tappe[i + 1].slice(2)] });
  tratte.push(d);
}

const out =
  "// File generato da tools/build_mappa.mjs — non modificare a mano.\n" +
  "window.MAPPA = " +
  JSON.stringify({ w: W, h: H, sphere, terre, reticolo, citta, tratte }) +
  ";\n";
writeFileSync(new URL("../js/map-data.js", import.meta.url), out);
console.log("map-data.js", Math.round(out.length / 1024), "KB; tratte:", tratte.map((t) => t.split("M").length - 1));

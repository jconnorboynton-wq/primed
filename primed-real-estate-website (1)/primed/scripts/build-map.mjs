// Builds src/data/us-map.json from us-atlas (US Census Bureau cartographic boundaries, ISC license).
// states-albers-10m is pre-projected (Albers USA, 975x610) with Alaska and Hawaii insets.
import { readFileSync, writeFileSync } from "node:fs";
import { feature, mesh } from "topojson-client";
import { geoPath } from "d3-geo";
import { presimplify, simplify } from "topojson-simplify";

import STATES from "../src/data/states.json" with { type: "json" };
const ABBR = Object.fromEntries(STATES.map((s) => [s.name, s.abbr]));
const raw = JSON.parse(readFileSync("node_modules/us-atlas/states-albers-10m.json", "utf8"));
// Light simplification (planar area threshold in projected pixels) keeps shapes accurate at web sizes.
const topo = simplify(presimplify(raw), 1.2);
const path = geoPath(); // identity: data already projected
const states = feature(topo, topo.objects.states).features.map((f) => {
  const d = path(f);
  const [cx, cy] = path.centroid(f);
  return { fips: f.id, abbr: ABBR[f.properties.name], name: f.properties.name, d: d.replace(/(\d+\.\d)\d+/g, "$1"), cx: Math.round(cx), cy: Math.round(cy) };
});
const borders = path(mesh(topo, topo.objects.states, (a, b) => a !== b)).replace(/(\d+\.\d)\d+/g, "$1");
writeFileSync("src/data/us-map.json", JSON.stringify({ width: 975, height: 610, states, borders }));
console.log(states.length, "shapes written");

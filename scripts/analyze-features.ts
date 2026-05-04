#!/usr/bin/env bun
export {};

import { readdirSync } from "node:fs";

// Build a case-insensitive lookup from the canonical feature names
const knownFeatures: { name: string }[] = await Bun.file("data/features.json").json();
const canonicalNames = new Map<string, string>();
for (const f of knownFeatures) {
  canonicalNames.set(f.name.split(":")[0].toLowerCase(), f.name.split(":")[0]);
}

const dir = ".local/research";
const files = readdirSync(dir).filter((f) => f.endsWith(".json"));

const featureCounts = new Map<string, number>();
let totalFiles = 0;
let filesWithFeatures = 0;

for (const file of files) {
  try {
    const content = await Bun.file(`${dir}/${file}`).json();
    totalFiles++;

    const raw = content.features;
    const features: string[] = Array.isArray(raw) ? raw : typeof raw === "string" ? [raw] : [];
    if (features.length > 0) filesWithFeatures++;

    for (const feature of features) {
      const key = feature.split(":")[0];
      const canonical = canonicalNames.get(key.toLowerCase()) ?? key;
      featureCounts.set(canonical, (featureCounts.get(canonical) ?? 0) + 1);
    }
  } catch {
    // skip invalid JSON
  }
}

const sorted = [...featureCounts.entries()].sort((a, b) => b[1] - a[1]);

console.log(`Analyzed ${totalFiles} files (${filesWithFeatures} with features)\n`);
console.log("Feature".padEnd(50) + "Count".padStart(6));
console.log("-".repeat(56));
for (const [feature, count] of sorted) {
  console.log(feature.padEnd(50) + String(count).padStart(6));
}

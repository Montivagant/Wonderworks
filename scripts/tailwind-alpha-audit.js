#!/usr/bin/env node
/**
 * Quick Tailwind v4 compatibility audit
 * -------------------------------------
 * Tailwind CSS v4 eliminated the separate `*-opacity-{n}` utilities.
 * Instead of:
 *   bg-black bg-opacity-10
 * you now write:
 *   bg-black/10
 *
 * This script scans the project (defaults to ./src) for grayscale
 * patterns that still use the old opacity utilities and prints them
 * with file path + line number so you can migrate them quickly.
 *
 * Run with:  node scripts/tailwind-alpha-audit.js [optional:dir]
 */

const fs = require('fs');
const path = require('path');

// Regexes for the deprecated opacity utility classes
const PATTERNS = [
  /bg-opacity-\d{1,3}/g,
  /text-opacity-\d{1,3}/g,
  /border-opacity-\d{1,3}/g,
  /fill-opacity-\d{1,3}/g,
  /stroke-opacity-\d{1,3}/g,
  /divide-opacity-\d{1,3}/g,
  /placeholder-opacity-\d{1,3}/g,
];

const rootDir = path.resolve(process.cwd(), process.argv[2] || 'src');
let totalHits = 0;

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  content.forEach((line, idx) => {
    PATTERNS.forEach((re) => {
      if (re.test(line)) {
        totalHits += 1;
        console.log(`${filePath}:${idx + 1}`);
        console.log(`  > ${line.trim()}`);
      }
    });
  });
}

function walk(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const res = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      walk(res);
    } else if (/\.(tsx?|jsx?|css|html)$/i.test(entry.name)) {
      scanFile(res);
    }
  });
}

if (!fs.existsSync(rootDir)) {
  console.error(`Directory not found: ${rootDir}`);
  process.exit(1);
}

console.log(`Scanning ${rootDir} for deprecated Tailwind opacity utilities...`);
walk(rootDir);

if (totalHits === 0) {
  console.log('✅ No deprecated opacity utilities found.');
} else {
  console.log(`\n⚠️  Found ${totalHits} occurrence(s). Please migrate them to the new "color/opacity" syntax.`);
} 
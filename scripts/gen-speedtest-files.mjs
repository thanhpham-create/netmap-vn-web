#!/usr/bin/env node
// Pre-generate random binary files cho speed test download phase.
// Output: /public/speedtest-{1,5,10}mb.bin
//
// Tại sao: tải file từ Vercel CDN (có POP gần VN) nhanh hơn nhiều so với
// Railway Singapore. Reduce ~30s download → ~1-2s cho fast connection.
//
// Run trong prebuild hook (package.json) → Vercel auto-gen mỗi deploy.
// Files trong .gitignore vì large (16MB total) + reproducible.

import { randomBytes } from 'node:crypto';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

const SIZES_MB = [1, 5, 10];

for (const mb of SIZES_MB) {
  const filename = `speedtest-${mb}mb.bin`;
  const path = join(publicDir, filename);
  if (existsSync(path)) {
    console.log(`✓ ${filename} (already exists)`);
    continue;
  }
  console.log(`Generating ${filename} (${mb} MB random bytes)...`);
  const buf = randomBytes(mb * 1024 * 1024);
  writeFileSync(path, buf);
  console.log(`✓ ${filename}`);
}

console.log('Done — speedtest binaries ready in /public');

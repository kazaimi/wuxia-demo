import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const content = fs.readFileSync(path.join(__dirname, '..', 'server', 'index.js'), 'utf-8');
const lines = content.split('\n');

console.log("=== Matching socket.on ===");
lines.forEach((line, idx) => {
  if (line.includes('socket.on(')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});

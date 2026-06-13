import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'server', 'db.json');

if (fs.existsSync(dbPath)) {
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const alex = data.find(p => p.name === 'ALEX');
    if (alex) {
        console.log("ALEX password:", alex.password);
    } else {
        console.log("ALEX not found");
    }
} else {
    console.log("db.json not found");
}

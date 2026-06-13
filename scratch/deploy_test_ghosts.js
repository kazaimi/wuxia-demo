import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ghostsPath = path.join(__dirname, '..', 'server', 'ghosts.json');

const testGhosts = [
  {
     id: "ghost_level43_alex",
     creatorName: "ALEX",
     layerIndex: 2,
     attributes: { con: 3, str: 1, int: 76, agi: 1, luk: 66 },
     skills: ["s1"],
     equippedSkills: { active1: "s1" },
     equippedTreasure: "t14",
     equippedTreasureAttrs: {
       extraAtk: 19,
       extraDef: 50,
       extraHp: 0,
       extraDodge: 15,
       extraCrit: 16,
       stunRate: 5,
       poisonRate: 5,
       bossDamageBoost: 0
     },
     level: 43,
     message: "来决一死战吧，同道！",
     createdAt: Date.now()
  },
  {
     id: "ghost_level1_dummy",
     creatorName: "Level1Dummy",
     layerIndex: 1,
     attributes: { con: 10, str: 10, int: 10, agi: 10, luk: 10 },
     skills: ["s1"],
     equippedSkills: { active1: "s1" },
     equippedTreasure: "t3",
     equippedTreasureAttrs: {
       extraAtk: 0,
       extraDef: 0,
       extraHp: 0,
       extraDodge: 0,
       extraCrit: 0,
       stunRate: 0,
       poisonRate: 0,
       bossDamageBoost: 0
     },
     level: 1,
     message: "萌新路过，请多指教！",
     createdAt: Date.now()
  }
];

fs.writeFileSync(ghostsPath, JSON.stringify(testGhosts, null, 2), 'utf8');
console.log("Successfully wrote 2 test ghosts to ghosts.json");

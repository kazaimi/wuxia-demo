const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/components/EncounterArena.jsx');
if (!fs.existsSync(filePath)) {
   console.error("EncounterArena.jsx not found at:", filePath);
   process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings to LF
content = content.replace(/\r\n/g, '\n');

function replaceMultiLineBlock(fileContent, targetStr, replaceStr) {
  const fileLines = fileContent.split('\n');
  const targetLines = targetStr.trim().split('\n').map(l => l.trim());
  const replaceLines = replaceStr.split('\n');

  for (let i = 0; i <= fileLines.length - targetLines.length; i++) {
    let match = true;
    for (let j = 0; j < targetLines.length; j++) {
      if (fileLines[i + j].trim() !== targetLines[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      const targetIndent = fileLines[i].match(/^\s*/)[0];
      
      // Determine the base indentation of replaceStr (minimum indentation of non-empty lines)
      const nonCentredLines = replaceLines.filter(l => l.trim().length > 0);
      let minIndent = Infinity;
      nonCentredLines.forEach(l => {
        const indent = l.match(/^\s*/)[0].length;
        if (indent < minIndent) minIndent = indent;
      });
      if (minIndent === Infinity) minIndent = 0;

      // Rebuild replacement lines relative to targetIndent
      const alignedReplaceLines = replaceLines.map(l => {
        if (l.trim().length === 0) return '';
        const currentIndent = l.match(/^\s*/)[0].length;
        const extraIndent = currentIndent - minIndent;
        return targetIndent + ' '.repeat(extraIndent) + l.trim();
      });

      fileLines.splice(i, targetLines.length, ...alignedReplaceLines);
      console.log("Successfully replaced block starting with:", targetLines[0]);
      return fileLines.join('\n');
    }
  }
  console.warn("WARNING: Target block not found starting with:", targetLines[0]);
  return fileContent;
}

// Block 3: Fast-forward loop initialization
const target3 = `const tempP1Agi = (tempP1.attributes.agi || 0) + (tempP1.equippedTreasureAttrs?.extraAgi || 0);
const tempP2Agi = (tempP2.attributes.agi || 0) + (tempP2.equippedTreasureAttrs?.extraAgi || 0);
const isP1Turn = Math.random() < (tempP1Agi / (tempP1Agi + tempP2Agi + 1));

let attacker = { ... (isP1Turn ? tempP1 : tempP2) };
let defender = { ... (isP1Turn ? tempP2 : tempP1) };

// 临时深克隆 attributes 字典
attacker.attributes = { ...attacker.attributes };
defender.attributes = { ...defender.attributes };

const aAttrs = attacker.equippedTreasureAttrs || {};
const dAttrs = defender.equippedTreasureAttrs || {};

attacker.attributes.str = (attacker.attributes.str || 0) + (aAttrs.extraStr || 0);
attacker.attributes.con = (attacker.attributes.con || 0) + (aAttrs.extraCon || 0);
attacker.attributes.agi = (attacker.attributes.agi || 0) + (aAttrs.extraAgi || 0);
attacker.attributes.int = (attacker.attributes.int || 0) + (aAttrs.extraInt || 0);
attacker.attributes.luk = (attacker.attributes.luk || 0) + (aAttrs.extraLuk || 0);

defender.attributes.str = (defender.attributes.str || 0) + (dAttrs.extraStr || 0);
defender.attributes.con = (defender.attributes.con || 0) + (dAttrs.extraCon || 0);
defender.attributes.agi = (defender.attributes.agi || 0) + (dAttrs.extraAgi || 0);
defender.attributes.int = (defender.attributes.int || 0) + (dAttrs.extraInt || 0);
defender.attributes.luk = (defender.attributes.luk || 0) + (dAttrs.extraLuk || 0);`;

const replace3 = `const p1Treasure = getTreasure(tempP1.equippedTreasure);
const p2Treasure = getTreasure(tempP2.equippedTreasure);
const p1Attrs = tempP1.equippedTreasureAttrs || {};
const p2Attrs = tempP2.equippedTreasureAttrs || {};

const p1Speed = (tempP1.attributes.agi || 0) + (p1Treasure?.attrs?.dodge || 0) * 0.5 + (p1Attrs.extraDodge || 0) * 0.5;
const p2Speed = (tempP2.attributes.agi || 0) + (p2Treasure?.attrs?.dodge || 0) * 0.5 + (p2Attrs.extraDodge || 0) * 0.5;
const isP1Turn = Math.random() < (p1Speed / (p1Speed + p2Speed + 1));

let attacker = { ... (isP1Turn ? tempP1 : tempP2) };
let defender = { ... (isP1Turn ? tempP2 : tempP1) };

attacker.attributes = { ...attacker.attributes };
defender.attributes = { ...defender.attributes };

const aTreasure = getTreasure(attacker.equippedTreasure);
const dTreasure = getTreasure(defender.equippedTreasure);
const aAttrs = attacker.equippedTreasureAttrs || {};
const dAttrs = defender.equippedTreasureAttrs || {};

if (loopCount === 1) {
   attacker.maxHp += (aTreasure?.attrs?.hp || 0) + (aAttrs.extraHp || 0);
   attacker.hp = attacker.maxHp;
   defender.maxHp += (dTreasure?.attrs?.hp || 0) + (dAttrs.extraHp || 0);
   defender.hp = defender.maxHp;
}`;

content = replaceMultiLineBlock(content, target3, replace3);

// Convert line endings back to CRLF
content = content.replace(/\n/g, '\r\n');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Finished robust replacements!');

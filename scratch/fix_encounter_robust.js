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

// 1. Recursive combat loop initialization
const target1 = `      const p1Agi = (p1.attributes.agi || 0) + (p1.equippedTreasureAttrs?.extraAgi || 0);
      const p2Agi = (p2.attributes.agi || 0) + (p2.equippedTreasureAttrs?.extraAgi || 0);
      const isP1Turn = Math.random() < (p1Agi / (p1Agi + p2Agi + 1));

      let attacker = { ... (isP1Turn ? p1 : p2) };
      let defender = { ... (isP1Turn ? p2 : p1) };

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
      defender.attributes.luk = (defender.attributes.luk || 0) + (dAttrs.extraLuk || 0);

      const getTreasure = (id) => TREASURES_DB?.find(t=>t.id===id);
      const aTreasure = getTreasure(attacker.equippedTreasure);
      const dTreasure = getTreasure(defender.equippedTreasure);`;

const replace1 = `      const getTreasure = (id) => TREASURES_DB?.find(t=>t.id===id);
      const p1Treasure = getTreasure(p1.equippedTreasure);
      const p2Treasure = getTreasure(p2.equippedTreasure);
      const p1Attrs = p1.equippedTreasureAttrs || {};
      const p2Attrs = p2.equippedTreasureAttrs || {};

      const p1Speed = (p1.attributes.agi || 0) + (p1Treasure?.attrs?.dodge || 0) * 0.5 + (p1Attrs.extraDodge || 0) * 0.5;
      const p2Speed = (p2.attributes.agi || 0) + (p2Treasure?.attrs?.dodge || 0) * 0.5 + (p2Attrs.extraDodge || 0) * 0.5;
      const isP1Turn = Math.random() < (p1Speed / (p1Speed + p2Speed + 1));

      let attacker = { ... (isP1Turn ? p1 : p2) };
      let defender = { ... (isP1Turn ? p2 : p1) };

      attacker.attributes = { ...attacker.attributes };
      defender.attributes = { ...defender.attributes };

      const aTreasure = getTreasure(attacker.equippedTreasure);
      const dTreasure = getTreasure(defender.equippedTreasure);
      const aAttrs = attacker.equippedTreasureAttrs || {};
      const dAttrs = defender.equippedTreasureAttrs || {};

      // 首次出手时将生命加上宝具及器灵的血量增幅
      if (logs.length === 1) {
         attacker.maxHp += (aTreasure?.attrs?.hp || 0) + (aAttrs.extraHp || 0);
         attacker.hp = attacker.maxHp;
         defender.maxHp += (dTreasure?.attrs?.hp || 0) + (dAttrs.extraHp || 0);
         defender.hp = defender.maxHp;
      }`;

if (!content.includes(target1)) {
   console.warn("WARNING: target1 code block not found exactly in file content.");
} else {
   content = content.replace(target1, replace1);
   console.log("Successfully replaced block 1.");
}

// 2. Recursive combat loop formulas
const target2 = `             const pAtk = attacker.attributes.str * 2 + attacker.level * 5;
             const dDefBase = defender.attributes.con * 2 + defender.level * 2 + (dAttrs.extraDef || 0);`;
const replace2 = `             const pAtk = attacker.attributes.str * 2 + attacker.level * 5 + (aTreasure?.attrs?.atk || 0) + (aAttrs.extraAtk || 0);
             const dDefBase = defender.attributes.con * 2 + defender.level * 2 + (dTreasure?.attrs?.def || 0) + (dAttrs.extraDef || 0);`;

if (!content.includes(target2)) {
   console.warn("WARNING: target2 code block not found exactly in file content.");
} else {
   content = content.replace(target2, replace2);
   console.log("Successfully replaced block 2.");
}

const target2b = `const baseDodgeChance = ((defender.attributes.agi / (defender.attributes.agi + 120)) * 0.75) + (dAttrs.extraDodge || 0) * 0.01;`;
const replace2b = `const defenderDodge = (dTreasure?.attrs?.dodge || 0) + (dAttrs.extraDodge || 0);
                const baseDodgeChance = ((defender.attributes.agi / (defender.attributes.agi + 120)) * 0.75) + defenderDodge * 0.01;`;

if (!content.includes(target2b)) {
   console.warn("WARNING: target2b code block not found exactly in file content.");
} else {
   content = content.replace(target2b, replace2b);
   console.log("Successfully replaced block 2b.");
}

// 3. Fast-forward loop initialization
const target3 = `          const tempP1Agi = (tempP1.attributes.agi || 0) + (tempP1.equippedTreasureAttrs?.extraAgi || 0);
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

const replace3 = `          const p1Treasure = getTreasure(tempP1.equippedTreasure);
          const p2Treasure = getTreasure(tempP2.equippedTreasure);
          const p1Attrs = tempP1.equippedTreasureAttrs || {};
          const p2Attrs = tempP2.equippedTreasureAttrs || {};

          const p1Speed = (tempP1.attributes.agi || 0) + (p1Treasure?.attrs?.dodge || 0) * 0.5 + (p1Attrs.extraDodge || 0) * 0.5;
          const p2Speed = (tempP2.attributes.agi || 0) + (p2Treasure?.attrs?.dodge || 0) * 0.5 + (p2Attrs.extraDodge || 0) * 0.5;
          const isP1Turn = Math.random() < (p1Speed / (p1Speed + p2Speed + 1));
          
          let attacker = { ... (isP1Turn ? tempP1 : tempP2) };
          let defender = { ... (isP1Turn ? tempP2 : tempP1) };

          // 临时深克隆 attributes 字典
          attacker.attributes = { ...attacker.attributes };
          defender.attributes = { ...defender.attributes };

          const aTreasure = getTreasure(attacker.equippedTreasure);
          const dTreasure = getTreasure(defender.equippedTreasure);
          const aAttrs = attacker.equippedTreasureAttrs || {};
          const dAttrs = defender.equippedTreasureAttrs || {};

          // 首次出手时将生命加上宝具及器灵的血量增幅
          if (loopCount === 1) {
             attacker.maxHp += (aTreasure?.attrs?.hp || 0) + (aAttrs.extraHp || 0);
             attacker.hp = attacker.maxHp;
             defender.maxHp += (dTreasure?.attrs?.hp || 0) + (dAttrs.extraHp || 0);
             defender.hp = defender.maxHp;
          }`;

if (!content.includes(target3)) {
   console.warn("WARNING: target3 code block not found exactly in file content.");
} else {
   content = content.replace(target3, replace3);
   console.log("Successfully replaced block 3.");
}

// 4. Fast-forward loop formulas
const target4 = `               const pAtk = attacker.attributes.str * 2 + attacker.level * 5;
               const dDefBase = defender.attributes.con * 2 + defender.level * 2 + (dAttrs.extraDef || 0);`;
const replace4 = `               const pAtk = attacker.attributes.str * 2 + attacker.level * 5 + (aTreasure?.attrs?.atk || 0) + (aAttrs.extraAtk || 0);
               const dDefBase = defender.attributes.con * 2 + defender.level * 2 + (dTreasure?.attrs?.def || 0) + (dAttrs.extraDef || 0);`;

if (!content.includes(target4)) {
   console.warn("WARNING: target4 code block not found exactly in file content.");
} else {
   content = content.replace(target4, replace4);
   console.log("Successfully replaced block 4.");
}

const target4b = `const baseDodgeChance = ((defender.attributes.agi / (defender.attributes.agi + 120)) * 0.75) + (dAttrs.extraDodge || 0) * 0.01;`;
const replace4b = `const defenderDodge = (dTreasure?.attrs?.dodge || 0) + (dAttrs.extraDodge || 0);
                  const baseDodgeChance = ((defender.attributes.agi / (defender.attributes.agi + 120)) * 0.75) + defenderDodge * 0.01;`;

if (!content.includes(target4b)) {
   console.warn("WARNING: target4b code block not found exactly in file content.");
} else {
   content = content.replace(target4b, replace4b);
   console.log("Successfully replaced block 4b.");
}

// 5. Add crit calculation and log formatting in fast-forward loop
const target5 = `                     let dmg = Math.floor(pAtk + adjustedSkillPwr - finalDef);`;
const replace5 = `                     let dmg = Math.floor(pAtk + adjustedSkillPwr - finalDef);
                     const attackerCrit = (aTreasure?.attrs?.crit || 0) + (aAttrs.extraCrit || 0);
                     const baseCritChance = ((attacker.attributes.luk / (attacker.attributes.luk + 150)) * 0.2) + attackerCrit * 0.01;
                     const isCrit = Math.random() < baseCritChance;
                     if (isCrit) {
                        dmg = Math.floor(dmg * 1.5);
                     }`;

if (!content.includes(target5)) {
   console.warn("WARNING: target5 code block not found exactly in file content.");
} else {
   content = content.replace(target5, replace5);
   console.log("Successfully replaced block 5.");
}

const target5b = `                     if (!actionLog.includes('[寂灭]')) {
                        actionLog = \`\${attacker.name} 使出【\${skill.name}】，对 \${defender.name} 造成了 \${dmg} 点伤害！\`;
                     }`;
const replace5b = `                     if (!actionLog.includes('[寂灭]')) {
                        actionLog = isCrit 
                           ? \`[暴击] \${attacker.name} 使出【\${skill.name}】重创对手，对 \${defender.name} 造成了 \${dmg} 点伤害！\`
                           : \`\${attacker.name} 使出【\${skill.name}】，对 \${defender.name} 造成了 \${dmg} 点伤害！\`;
                     }`;

if (!content.includes(target5b)) {
   console.warn("WARNING: target5b code block not found exactly in file content.");
} else {
   content = content.replace(target5b, replace5b);
   console.log("Successfully replaced block 5b.");
}

// Convert line endings back to CRLF
content = content.replace(/\n/g, '\r\n');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done!');

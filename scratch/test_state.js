// Simple node script to trace HP values across state transitions in EncounterArena.jsx
const TREASURES_DB = [
  { id: 't14', name: '绝世好剑', rarity: '神话', attrs: { hp: 150, atk: 45, def: 30, dodge: 10, crit: 10 }, effect: 'jiMie' }
];

const player = {
  name: "ALEX",
  equippedTreasure: null,
  equippedTreasureAttrs: {}
};

// Initial state simulator
let p1 = null;
let defeatedCount = 0;
let rogueBuffs = {
  str: 0, con: 0, int: 0, agi: 0, luk: 0,
  defUpEffect: 0, defUpDuration: 0,
  dodgeEffect: 0, dodgeDuration: 0,
  poisonDmgPct: 0, poisonDuration: 0,
  stunDuration: 0, stunChance: 0,
  silenceDuration: 0, silenceDamageAmp: 0,
  treasureBoostLevel: 0,
  heal60Count: 0,
};

const getTreasure = (id) => TREASURES_DB.find(t => t.id === id);

function startEncounter() {
  const myTreasure = getTreasure(player.equippedTreasure);
  const myAttrs = player.equippedTreasureAttrs || {};
  const initialMaxHp = 500 + (myTreasure?.attrs?.hp || 0) + (myAttrs.extraHp || 0);
  p1 = { 
      ...player, 
      level: 5,
      attributes: { con: 20, str: 12, int: 6, agi: 18, luk: 6 },
      hp: initialMaxHp, maxHp: initialMaxHp,
      buffs: { dodge: 0, defUp: 0, shield: 0, revive: 0 },
      debuffs: { stun: 0, poison: 0, silence: 0, internalWound: 0, poisonPercent: 0.03 }
  };
  console.log(`[startEncounter] Initial P1 HP: ${p1.hp}/${p1.maxHp}`);
}

function simulateVictory(damageTaken) {
  // Simulate damage taken during the battle
  p1.hp = Math.max(0, p1.hp - damageTaken);
  console.log(`[Battle End] P1 HP before level up: ${p1.hp}/${p1.maxHp} (Took ${damageTaken} damage)`);

  const nextDefeatedCount = defeatedCount + 1;
  defeatedCount = nextDefeatedCount;

  // Level up P1 logic from EncounterArena.jsx
  const newLevel = 5 + nextDefeatedCount * 0.9;
  const oldMaxHp = p1.maxHp;
  const progress = Math.min(nextDefeatedCount / 60, 1);
  const myTreasureLocal = getTreasure(player.equippedTreasure);
  const myAttrsLocal = player.equippedTreasureAttrs || {};
  const newMaxHp = Math.floor(500 + 1500 * Math.sqrt(progress) + (p1.attributes.con - 20) * 5) + (myTreasureLocal?.attrs?.hp || 0) + (myAttrsLocal.extraHp || 0);
  p1.level = newLevel;
  p1.maxHp = newMaxHp;
  p1.hp = Math.min(newMaxHp, p1.hp); // REMOVED level up heal: finalP1.hp = Math.min(newMaxHp, finalP1.hp + (newMaxHp - oldMaxHp));
  console.log(`[Victory ${defeatedCount}] Level up to ${newLevel.toFixed(1)}. New P1 HP: ${p1.hp}/${p1.maxHp}`);
}

function applyRogueBuffEffect(choice, updatedP1) {
  if (choice.id === 'str') updatedP1.attributes.str += choice.val;
  else if (choice.id === 'con') {
     updatedP1.attributes.con += choice.val;
     updatedP1.maxHp += choice.val * 5;
     updatedP1.hp += choice.val * 5;
  }
  else if (choice.id === 'int') updatedP1.attributes.int += choice.val;
  else if (choice.id === 'agi') updatedP1.attributes.agi += choice.val;
  else if (choice.id === 'luk') updatedP1.attributes.luk += choice.val;
  else if (choice.id === 'heal60') {
     updatedP1.hp = Math.min(updatedP1.maxHp, updatedP1.hp + Math.floor(updatedP1.maxHp * choice.val));
  }
}

function confirmRogueBuffs(selectedChoices) {
  console.log(`[confirmRogueBuffs] Before buff confirmation. P1 HP: ${p1.hp}/${p1.maxHp}`);
  let updatedP1 = { 
     ...p1, 
     attributes: { ...p1.attributes } 
   };

  selectedChoices.forEach(choice => {
     applyRogueBuffEffect(choice, updatedP1);
  });

  // Wave end 20% max HP heal
  const healVal = Math.floor(updatedP1.maxHp * 0.20);
  const oldHp = updatedP1.hp;
  updatedP1.hp = Math.min(updatedP1.maxHp, updatedP1.hp + healVal);
  console.log(`[confirmRogueBuffs] Applied 20% heal (+${healVal}). P1 HP: ${updatedP1.hp}/${updatedP1.maxHp} (was ${oldHp})`);

  p1 = updatedP1;
}


// Run simulation
startEncounter();
simulateVictory(100); // Wave 1 (Defeated 1)
simulateVictory(80);  // Wave 2 (Defeated 2)
simulateVictory(120); // Wave 3 (Defeated 3) - entering buff selection

// Confirming buffs at wave 3 (selecting non-con buffs)
confirmRogueBuffs([
  { id: 'str', val: 15 },
  { id: 'agi', val: 15 },
  { id: 'int', val: 15 }
]);

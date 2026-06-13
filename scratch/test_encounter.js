const initialBaseHp = 500;
let hp = initialBaseHp;
let maxHp = initialBaseHp;

console.log(`Initial: HP=${hp}/${maxHp}`);

// Simulate 3 waves
for (let wave = 1; wave <= 3; wave++) {
  // Combat: say the player loses 50 HP in this battle
  const dmg = 50;
  hp = Math.max(0, hp - dmg);
  console.log(`Wave ${wave} combat end: HP=${hp}/${maxHp}`);
  
  // Victory level up
  const nextDefeatedCount = wave;
  const progress = Math.min(nextDefeatedCount / 60, 1);
  const newMaxHp = Math.floor(500 + 1500 * Math.sqrt(progress));
  const oldMaxHp = maxHp;
  
  maxHp = newMaxHp;
  hp = Math.min(newMaxHp, hp + (newMaxHp - oldMaxHp));
  console.log(`Wave ${wave} victory level-up: HP=${hp}/${maxHp} (healed by ${newMaxHp - oldMaxHp})`);
}

// Now selection screen (wave 3 ended, defeatedCount = 3)
console.log(`\nEntering buff selection screen with HP=${hp}/${maxHp}`);

// Choose buffs and confirm
const healVal = Math.floor(maxHp * 0.20);
hp = Math.min(maxHp, hp + healVal);
console.log(`After selecting buff (confirmed): HP=${hp}/${maxHp} (healed by 20% maxHp = ${healVal})`);

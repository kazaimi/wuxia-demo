import React, { useEffect, useRef } from 'react';
import { useGameStore, SKILLS_DB, TREASURES_DB } from '../store/gameState';
import { Swords } from 'lucide-react';

// 武侠角色形象组件
const WarriorAvatar = ({ player, isLeft }) => {
  if (!player) return null;

  // 根据属性计算外观特征
  const strRatio = (player.attributes?.str || 0) / 100;
  const agiRatio = (player.attributes?.agi || 0) / 100;
  const conRatio = (player.attributes?.con || 0) / 100;
  const intRatio = (player.attributes?.int || 0) / 100;

  // 根据装备的宝物决定武器样式
  const treasure = TREASURES_DB?.find(t => t.id === player.equippedTreasure);
  const treasureEffect = treasure?.effect || '';

  // 武器样式映射
  const getWeaponStyle = () => {
    if (treasureEffect === 'yiTian') return { type: 'sword', color: '#d4af37', name: '倚天剑' };
    if (treasureEffect === 'tuLong') return { type: 'blade', color: '#dc143c', name: '屠龙刀' };
    if (treasureEffect === 'xuanTie') return { type: 'heavySword', color: '#4a5568', name: '玄铁重剑' };
    if (treasureEffect === 'jinShe') return { type: 'snakeSword', color: '#fbbf24', name: '金蛇剑' };
    if (treasureEffect === 'daGou') return { type: 'staff', color: '#a0522d', name: '打狗棒' };
    if (treasureEffect === 'dianXue') return { type: 'pen', color: '#6b7280', name: '判官笔' };
    if (treasureEffect === 'shengHuo') return { type: 'token', color: '#ef4444', name: '圣火令' };
    if (treasureEffect === 'jiMie') return { type: 'darkSword', color: '#1f2937', name: '绝世好剑' };
    // 默认武器
    return { type: 'fist', color: '#d4af37', name: '拳脚' };
  };

  const weapon = getWeaponStyle();

  // 根据等级决定服装颜色深浅
  const levelHue = Math.min(60, player.level || 1);

  // 根据装备的内功决定气场颜色
  const innerSkill = player.equippedSkills?.inner;
  let auraColor = 'rgba(212, 175, 55, 0.3)';
  if (innerSkill === 's_yijin') auraColor = 'rgba(139, 92, 246, 0.4)';
  else if (innerSkill === 's5') auraColor = 'rgba(251, 191, 36, 0.4)';
  else if (innerSkill === 's_xixing') auraColor = 'rgba(139, 0, 0, 0.4)';
  else if (innerSkill === 's_shihou') auraColor = 'rgba(220, 38, 38, 0.4)';

  // 体型：力量影响肩宽，体质影响身宽
  const shoulderWidth = 35 + strRatio * 15;
  const bodyWidth = 25 + conRatio * 8;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      transform: isLeft ? 'scaleX(1)' : 'scaleX(-1)',
    }}>
      {/* 气场光晕 */}
      <div style={{
        position: 'absolute',
        width: '120px',
        height: '150px',
        background: `radial-gradient(ellipse at center, ${auraColor}, transparent 70%)`,
        filter: 'blur(20px)',
        animation: 'pulse 2s ease-in-out infinite',
      }} />

      {/* 角色SVG */}
      <svg width="100" height="130" viewBox="0 0 100 130" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}>
        {/* 定义渐变 */}
        <defs>
          <linearGradient id="robeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={`hsl(${levelHue}, 30%, 25%)`} />
            <stop offset="100%" stopColor={`hsl(${levelHue}, 30%, 15%)`} />
          </linearGradient>
          <linearGradient id="skinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e8d4b8" />
            <stop offset="100%" stopColor="#d4c4a8" />
          </linearGradient>
          <linearGradient id="hairGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="100%" stopColor="#0a0a14" />
          </linearGradient>
        </defs>

        {/* 身体/长袍 */}
        <path
          d={`M50 45 L${50 - shoulderWidth/2} 50 L${50 - bodyWidth} 110 L${50 + bodyWidth} 110 L${50 + shoulderWidth/2} 50 Z`}
          fill="url(#robeGradient)"
          stroke="#d4af37"
          strokeWidth="0.5"
          opacity="0.9"
        />

        {/* 腰带 */}
        <rect x={50 - bodyWidth + 5} y="75" width={bodyWidth * 2 - 10} height="6" fill="#d4af37" opacity="0.8" />

        {/* 头部 */}
        <ellipse cx="50" cy="30" rx="18" ry="20" fill="url(#skinGradient)" />

        {/* 头发/发髻 */}
        <ellipse cx="50" cy="18" rx="16" ry="12" fill="url(#hairGradient)" />
        <ellipse cx="50" cy="10" rx="6" ry="6" fill="url(#hairGradient)" />

        {/* 眼睛 */}
        <ellipse cx="44" cy="28" rx="3" ry="2" fill="#1a1a2e" />
        <ellipse cx="56" cy="28" rx="3" ry="2" fill="#1a1a2e" />

        {/* 眉毛 */}
        <path d="M40 24 Q44 22 48 24" stroke="#1a1a2e" strokeWidth="1.5" fill="none" />
        <path d="M52 24 Q56 22 60 24" stroke="#1a1a2e" strokeWidth="1.5" fill="none" />

        {/* 武器 - 根据类型绘制 */}
        {weapon.type === 'sword' && (
          <g transform="translate(75, 50) rotate(30)">
            <rect x="0" y="0" width="4" height="60" fill={weapon.color} />
            <rect x="-3" y="55" width="10" height="8" fill="#d4af37" rx="2" />
            <path d="M0 0 L2 -15 L4 0" fill={weapon.color} opacity="0.8" />
          </g>
        )}
        {weapon.type === 'blade' && (
          <g transform="translate(72, 45) rotate(25)">
            <path d="M0 0 Q8 30 6 70 L2 70 Q0 30 0 0" fill={weapon.color} />
            <rect x="-2" y="68" width="12" height="10" fill="#d4af37" rx="2" />
          </g>
        )}
        {weapon.type === 'heavySword' && (
          <g transform="translate(70, 40) rotate(20)">
            <rect x="0" y="0" width="12" height="70" fill={weapon.color} rx="2" />
            <rect x="-2" y="68" width="16" height="12" fill="#4a5568" rx="2" />
          </g>
        )}
        {weapon.type === 'staff' && (
          <g transform="translate(78, 30) rotate(15)">
            <rect x="0" y="0" width="5" height="80" fill={weapon.color} rx="2" />
            <circle cx="2.5" cy="5" r="4" fill="#22c55e" />
          </g>
        )}
        {weapon.type === 'fist' && (
          <g>
            <ellipse cx="30" cy="65" rx="8" ry="6" fill="url(#skinGradient)" stroke="#d4af37" strokeWidth="0.5" />
            <ellipse cx="70" cy="65" rx="8" ry="6" fill="url(#skinGradient)" stroke="#d4af37" strokeWidth="0.5" />
          </g>
        )}
        {weapon.type === 'pen' && (
          <g transform="translate(75, 55) rotate(40)">
            <rect x="0" y="0" width="3" height="40" fill={weapon.color} />
            <polygon points="0,0 1.5,-8 3,0" fill="#1a1a2e" />
          </g>
        )}
        {weapon.type === 'token' && (
          <g transform="translate(75, 60)">
            <ellipse cx="0" cy="0" rx="12" ry="8" fill={weapon.color} />
            <text x="0" y="3" textAnchor="middle" fontSize="8" fill="#d4af37">火</text>
          </g>
        )}
        {weapon.type === 'snakeSword' && (
          <g transform="translate(75, 50) rotate(30)">
            <path d="M0 0 Q10 20 0 40 Q-10 60 0 80" stroke={weapon.color} strokeWidth="4" fill="none" />
            <rect x="-3" y="78" width="10" height="8" fill="#d4af37" rx="2" />
          </g>
        )}
        {weapon.type === 'darkSword' && (
          <g transform="translate(75, 45) rotate(30)">
            <rect x="0" y="0" width="5" height="65" fill={weapon.color} />
            <rect x="0" y="0" width="5" height="65" fill="url(#darkAura)" opacity="0.5" />
            <rect x="-4" y="60" width="13" height="10" fill="#1f2937" rx="2" />
            {/* 剑身黑芒 */}
            <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
          </g>
        )}

        {/* 手臂 */}
        <path d={`M${50 - shoulderWidth/2} 50 Q${50 - shoulderWidth/2 - 10} 60 ${50 - shoulderWidth/2 - 5} 70`}
              stroke="url(#skinGradient)" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d={`M${50 + shoulderWidth/2} 50 Q${50 + shoulderWidth/2 + 10} 60 ${50 + shoulderWidth/2 + 5} 70`}
              stroke="url(#skinGradient)" strokeWidth="8" fill="none" strokeLinecap="round" />
      </svg>

      {/* 名字标签（不受翻转影响） */}
      <div style={{
        transform: isLeft ? 'scaleX(1)' : 'scaleX(-1)',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '0.9rem',
          color: 'var(--gold)',
          fontFamily: '"Ma Shan Zheng", cursive',
          letterSpacing: '2px',
          textShadow: '0 0 10px rgba(212, 175, 55, 0.5)',
        }}>
          {player.name}
        </div>
        <div style={{
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
        }}>
          Lv.{player.level} | {weapon.name}
        </div>
      </div>
    </div>
  );
};

export default function BattleArena() {
  const player = useGameStore(state => state.player);
  const battleState = useGameStore(state => state.battleState);
  const { inBattle, p1, p2, logs, winner, roomId } = battleState;
  const sendBattleAction = useGameStore(state => state.sendBattleAction);
  const exitBattle = useGameStore(state => state.exitBattle);
  
  // Auto-scroll removed as requested


  useEffect(() => {
    if (!inBattle || winner || !p1 || !p2) return;
    if (p1.name !== player.name) return;

    const timer = setTimeout(() => {
      const isP1Turn = Math.random() < (p1.attributes.agi / (p1.attributes.agi + p2.attributes.agi + 1));
      let actionData = {};

      let attacker = { ... (isP1Turn ? p1 : p2) };
      let defender = { ... (isP1Turn ? p2 : p1) };
      const attackerKey = isP1Turn ? 'p1' : 'p2';
      const defenderKey = isP1Turn ? 'p2' : 'p1';

      if (!attacker.buffs) attacker.buffs = { dodge: 0, defUp: 0, shield: 0, revive: 0 };
      if (!defender.buffs) defender.buffs = { dodge: 0, defUp: 0, shield: 0, revive: 0 };
      if (!attacker.debuffs) attacker.debuffs = { stun: 0, poison: 0, silence: 0, internalWound: 0, poisonPercent: 0.03 };
      if (!defender.debuffs) defender.debuffs = { stun: 0, poison: 0, silence: 0, internalWound: 0, poisonPercent: 0.03 };

      const getTreasure = (id) => typeof TREASURES_DB !== 'undefined' ? TREASURES_DB.find(t=>t.id===id) : null;
      const aTreasure = getTreasure(attacker.equippedTreasure);
      const dTreasure = getTreasure(defender.equippedTreasure);

      const checkImmune = (playerObj, tObj, debuffType) => {
         if (tObj?.effect === 'jiMie') return true; // 绝世好剑全免疫
         if (tObj?.effect === 'ruanWei' && (debuffType==='stun'||debuffType==='poison')) return true;
         if (tObj?.effect === 'jinShe' && debuffType==='poison') return true;
         return false;
      };

      let logCount = logs.length;
      let logPrefix = "";

      // 开局特效判定 (木质佛珠, 圣火令)
      if (logCount === 1) { 
         if (aTreasure?.effect === 'ningShen') {
             attacker.buffs.shield += Math.floor(attacker.maxHp * 0.05);
             logPrefix += `[开局] ${attacker.name} 的【木质佛珠】泛起佛光，获得了护盾！\n`;
         }
         if (dTreasure?.effect === 'ningShen') {
             defender.buffs.shield += Math.floor(defender.maxHp * 0.05);
             logPrefix += `[开局] ${defender.name} 的【木质佛珠】泛起佛光，获得了护盾！\n`;
         }
         if (aTreasure?.effect === 'shengHuo' && !checkImmune(defender, dTreasure, 'silence')) {
             defender.debuffs.silence = 2;
             logPrefix += `[开局] ${attacker.name} 亮出【圣火令】，发出无上威压，封锁了 ${defender.name}！\n`;
         }
         if (dTreasure?.effect === 'shengHuo' && !checkImmune(attacker, aTreasure, 'silence')) {
             attacker.debuffs.silence = 2;
             logPrefix += `[开局] ${defender.name} 亮出【圣火令】，发出无上威压，封锁了 ${attacker.name}！\n`;
         }
      }

      // 中毒结算
      if (attacker.debuffs.poison > 0) {
         const poisonPct = attacker.debuffs.poisonPercent || 0.03;
         const pDmg = Math.max(1, Math.floor(attacker.maxHp * poisonPct));
         attacker.hp = Math.max(0, attacker.hp - pDmg);
         attacker.debuffs.poison--;
         if (attacker.debuffs.poison === 0) {
             attacker.debuffs.poisonPercent = 0.03;
         }
         logPrefix += `[中毒] ${attacker.name} 毒发，丧失了 ${pDmg} 气血！\n`;
      }

      let actionLog = "";
      if (attacker.debuffs.stun > 0) {
         attacker.debuffs.stun--;
         actionLog = `${attacker.name} 处于【晕眩】中，只能呆立当场，无法动弹！`;
      } else if (attacker.dailyDebuffs?.includes('心魔劫') && Math.random() < 0.15) {
         actionLog = `[心魔发作] ${attacker.name} 突然心神失守，招式走形破绽大开，错失了良机！`;
      } else {
         // 选择技能
         const eq = attacker.equippedSkills || {};
         let skillIds = [eq.inner, eq.outer, eq.motion, eq.ultimate].filter(Boolean);
         if (attacker.debuffs.silence > 0) {
             skillIds = ['s1']; // 被封穴或威压，只能平A基本拳脚
             attacker.debuffs.silence--;
         } else if (attacker.debuffs.internalWound > 0) {
             skillIds = [eq.outer].filter(Boolean); // 内伤只能外功
             if (skillIds.length===0) skillIds = ['s1'];
             attacker.debuffs.internalWound--;
         }

         const pickSkill = () => {
            if (skillIds.length === 0) return SKILLS_DB[0];
            let totalWeight = 0;
            const weighted = skillIds.map(sId => {
               const sk = SKILLS_DB.find(s=>s.id===sId) || SKILLS_DB[0];
               const weight = 100 + (sk.power / 10) * (attacker.attributes.int || 0) * 1.5;
               totalWeight += weight;
               return { skill: sk, weight };
            });
            let rand = Math.random() * totalWeight;
            for (const item of weighted) {
               if (rand < item.weight) return item.skill;
               rand -= item.weight;
            }
            return weighted[weighted.length - 1].skill;
         };
         const skill = pickSkill();
         
         const aStr = attacker.dailyDebuffs?.includes('散功劫') ? Math.max(0, attacker.attributes.str - 5) : attacker.attributes.str;
         const dCon = defender.dailyDebuffs?.includes('散功劫') ? Math.max(0, defender.attributes.con - 5) : defender.attributes.con;

         const pAtk = aStr * 2 + attacker.level * 5;
         const dDefBase = dCon * 2 + defender.level * 2;
         const aMod = 1 + attacker.level * 0.05;
         const adjustedSkillPwr = skill.power * aMod;

         if (skill.id === 's5' || skill.id === 's_yijin') {
            attacker.buffs.defUp = 3;
            actionLog = `${attacker.name} 催动【${skill.name}】，真气护体，防御力大增！`;
            if (skill.id === 's_yijin' && attacker.debuffs.poison > 0) {
                attacker.debuffs.poison = 0;
                actionLog += ` 易筋经内力激荡，体内剧毒被猛然逼出！`;
            }
         } else if (skill.id === 's4' || skill.id === 's_tiyun') { 
            attacker.buffs.dodge = 3;
            actionLog = `${attacker.name} 施展【${skill.name}】，身形变幻莫测，闪避率大幅提升！`;
         } else if (skill.id === 's_shenxing') {
            attacker.buffs.dodge = 99;
            actionLog = `${attacker.name} 施展出【${skill.name}】，犹如鬼魅不可捉摸，难以命中！`;
         } else if (skill.id === 's_shengxin') {
            attacker.buffs.revive = 1;
            actionLog = `${attacker.name} 运转【${skill.name}】，生死二气护住心脉（获得涅槃重生状态）！`;
         } else if (skill.type === 'heal') {
            const healAmt = Math.floor(adjustedSkillPwr + attacker.attributes.int * 2 + 30);
            attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmt);
            actionLog = `${attacker.name} 运转内力使出【${skill.name}】，恢复了 ${healAmt} 点气血！`;
         } else if (skill.type === 'buff' || skill.type === 'motion' || skill.power === 0) {
            attacker.buffs.dodge = 2;
            actionLog = `${attacker.name} 施展【${skill.name}】，气势如虹！`;
         } else {
            // 判定闪避（眩晕时无法闪避）
            let canDodge = aTreasure?.effect !== 'xuanTie' && defender.debuffs.stun === 0;
            let isDodge = false;
            if (canDodge) {
               isDodge = Math.random() < (defender.attributes.agi * 0.005);
               if (defender.buffs.dodge > 0) isDodge = Math.random() < 0.45;
            }
            
            if (isDodge) {
               actionLog = `${attacker.name} 施展【${skill.name}】，却被 ${defender.name} 巧妙躲开！`;
            } else {
               let finalDef = dDefBase * 1;
               if (defender.buffs.defUp > 0) finalDef *= 3;
               
               let dmg = Math.floor(pAtk + adjustedSkillPwr - finalDef);
               
               // 攻击者宝具特化加成
               if (aTreasure?.effect === 'poShang') dmg += 50; 
               if (aTreasure?.effect === 'yiTian') dmg = Math.floor(dmg * 1.2);
               if (aTreasure?.effect === 'tuLong' && (attacker.hp / attacker.maxHp) < 0.4) dmg = Math.floor(dmg * 1.5);
               if (aTreasure?.effect === 'shengHuo') dmg += Math.floor(defender.hp * 0.05);

               // 防御者宝具特化减伤
               if (dTreasure?.effect === 'qingQiao') dmg -= 30;
               if (dTreasure?.effect === 'tuLong' && (defender.hp / defender.maxHp) < 0.4) dmg = Math.floor(dmg * 0.8);
               
               dmg = Math.max(1, dmg);

               // 绝世好剑判定
               if (aTreasure?.effect === 'jiMie' && Math.random() < 0.05) {
                   dmg = Math.floor(defender.hp * 0.5);
                   actionLog = `[寂灭] ${attacker.name} 的【绝世好剑】闪烁黑芒，直接斩去 ${defender.name} ${dmg} 气血！ `;
               }

               // 扣盾
               if (defender.buffs.shield > 0) {
                   if (defender.buffs.shield >= dmg) {
                      defender.buffs.shield -= dmg;
                      dmg = 0;
                   } else {
                      dmg -= defender.buffs.shield;
                      defender.buffs.shield = 0;
                   }
               }
               defender.hp = Math.max(0, defender.hp - dmg);
               
               // 吸血/回春判定
               if (dmg > 0 && aTreasure?.effect === 'huiChun') {
                   attacker.hp = Math.min(attacker.maxHp, attacker.hp + Math.floor(attacker.maxHp * 0.02));
               }
               if (dmg > 0 && aTreasure?.effect === 'yiTian') {
                   attacker.hp = Math.min(attacker.maxHp, Math.floor(attacker.hp + dmg * 0.15));
               }

               if (!actionLog.includes('[寂灭]')) {
                  const actStr = isP1Turn ? '施展绝技' : '使出';
                  actionLog = `${attacker.name} ${actStr}【${skill.name}】，对 ${defender.name} 造成了 ${dmg} 点伤害！`;
               }

               if (dmg > 0 && dTreasure?.effect === 'ruanWei') {
                  const rDmg = Math.floor(dmg * 0.15);
                  attacker.hp -= rDmg;
                  actionLog += `\n[软猬荆棘] 尖刺反伤，${attacker.name} 受到了 ${rDmg} 点伤害！`;
               }

               // 连击判定
               if (aTreasure?.effect === 'jinShe' && defender.hp > 0 && Math.random() <= 0.20) {
                   const comboDmg = Math.max(1, Math.floor(dmg * 0.5));
                   defender.hp = Math.max(0, defender.hp - comboDmg);
                   actionLog += `\n[金蛇出洞] ${attacker.name} 挥出虚影追加一击，造成 ${comboDmg} 伤害！`;
               }

               if (dmg > 0 && skill.id === 's_xixing') {
                   const drainAmt = Math.floor(dmg * 0.8);
                   attacker.hp = Math.min(attacker.maxHp, attacker.hp + drainAmt);
                   actionLog += ` \n[吸星大法] 夺取了 ${drainAmt} 点气血化为己用！`;
               }

               // 特效施加判定
               if (defender.hp > 0) {
                  if (skill.id === 's_du' && !checkImmune(defender, dTreasure, 'poison')) {
                      defender.debuffs.poison = 999;
                      defender.debuffs.poisonPercent = 0.07;
                      actionLog += ` \n[万毒] ${defender.name} 身中奇毒，骨髓俱损！`;
                  }
                  if (skill.id === 's_shihou' && Math.random() <= 0.6 && !checkImmune(defender, dTreasure, 'stun')) {
                      defender.debuffs.stun = 1;
                      actionLog += ` \n[狮吼] 震耳欲聋，${defender.name} 被当场震晕！`;
                  }
                  if (skill.id === 's_dianxue' && Math.random() <= 0.8 && !checkImmune(defender, dTreasure, 'silence')) {
                      defender.debuffs.silence = 2;
                      actionLog += ` \n[点穴] ${defender.name} 要穴被封，无法动用武学！`;
                  }
                  if (skill.id === 's_liumai' && Math.random() <= 0.5 && !checkImmune(defender, dTreasure, 'internalWound')) {
                      defender.debuffs.internalWound = 2;
                      actionLog += ` \n[六脉] 无形剑气震伤内腑，${defender.name} 经脉受损，难以催动内力！`;
                  }

                  if (aTreasure?.effect === 'dianXue' && Math.random() <= 0.10 && !checkImmune(defender, dTreasure, 'silence')) {
                     defender.debuffs.silence = 1;
                     actionLog += ` \n[宝具] ${defender.name} 被判官笔点中要穴，下回合被封印！`;
                  }
                  if (aTreasure?.effect === 'juDu' && Math.random() <= 0.15 && !checkImmune(defender, dTreasure, 'poison')) {
                     defender.debuffs.poison = 3;
                     actionLog += ` \n[宝具] 冰魄银针刺入，${defender.name} 身中剧毒！`;
                  }
                  if (aTreasure?.effect === 'daGou' && Math.random() <= 0.15 && !checkImmune(defender, dTreasure, 'stun')) {
                     defender.debuffs.stun = 1;
                     actionLog += ` \n[宝具] 打狗棒击中后脑，${defender.name} 当场晕眩！`;
                  }
                  if (aTreasure?.effect === 'xuanTie' && Math.random() <= 0.20 && !checkImmune(defender, dTreasure, 'internalWound')) {
                     defender.debuffs.internalWound = 2;
                     actionLog += ` \n[宝具] 玄铁重剑霸道无比，震得 ${defender.name} 吐血内伤！`;
                  }
               }
            }
         }
      }

      if (attacker.buffs.dodge > 0) attacker.buffs.dodge--;
      if (attacker.buffs.defUp > 0) attacker.buffs.defUp--;

      // 达摩舍利与圣心诀复活判定
      if (attacker.hp <= 0 && aTreasure?.effect === 'niePan' && !attacker.hasRevived) {
          attacker.hp = Math.floor(attacker.maxHp * 0.5);
          attacker.debuffs = { stun: 0, poison: 0, silence: 0, internalWound: 0, poisonPercent: 0.03 };
          attacker.hasRevived = true;
          actionLog += `\n[涅槃] ${attacker.name} 达摩舍利碎裂，原地满血复活！`;
      } else if (attacker.hp <= 0 && attacker.buffs.revive > 0) {
          attacker.hp = Math.floor(attacker.maxHp * 0.5);
          attacker.debuffs = { stun: 0, poison: 0, silence: 0, internalWound: 0, poisonPercent: 0.03 };
          attacker.buffs.revive--;
          actionLog += `\n[圣心涅槃] ${attacker.name} 凭借圣心诀真气，强行起死回生！`;
      }

      if (defender.hp <= 0 && dTreasure?.effect === 'niePan' && !defender.hasRevived) {
          defender.hp = Math.floor(defender.maxHp * 0.5);
          defender.debuffs = { stun: 0, poison: 0, silence: 0, internalWound: 0, poisonPercent: 0.03 };
          defender.hasRevived = true;
          actionLog += `\n[涅槃] ${defender.name} 达摩舍利碎裂，奇迹般续命！`;
      } else if (defender.hp <= 0 && defender.buffs.revive > 0) {
          defender.hp = Math.floor(defender.maxHp * 0.5);
          defender.debuffs = { stun: 0, poison: 0, silence: 0, internalWound: 0, poisonPercent: 0.03 };
          defender.buffs.revive--;
          actionLog += `\n[圣心涅槃] ${defender.name} 凭借圣心诀真气，强行起死回生！`;
      }

      const finalLog = logPrefix + actionLog;
      actionData = { log: finalLog };
      actionData[attackerKey] = attacker;
      actionData[defenderKey] = defender;

      if (attacker.hp <= 0) {
        actionData.winner = defenderKey; 
        actionData.log += `\n[系统] 决斗结束！大侠 ${defender.name} 绝地反击，赢得了胜利！`;
      } else if (defender.hp <= 0) { 
        actionData.winner = attackerKey; 
        actionData.log += isP1Turn 
          ? `\n[系统] 决斗结束！大侠 ${attacker.name} 击落苍穹，取得了胜利！`
          : `\n[系统] 决斗结束！很遗憾，${defender.name} 血战不敌，含恨败北！`;
      }
      
      sendBattleAction(roomId, actionData);
    }, 1500);

    return () => clearTimeout(timer);
  }, [inBattle, p1, p2, winner, player.name, roomId, sendBattleAction]);

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
       {/* 顶部装饰 */}
       <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: 'linear-gradient(90deg, transparent, var(--crimson), transparent)', opacity: 0.5 }} />

       <h2 style={{ fontSize: '1.8rem', color: 'var(--crimson)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '3px' }}>
        <Swords /> ✦ 竞技对决 ✦
      </h2>
      
      {!inBattle ? (
         <div style={{ textAlign: 'center', marginTop: '4rem' }}>
         <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.8' }}>当前并未在切磋回合中。<br/>请前往【风云榜】中向真实的在线高手下发战书！</p>
       </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* 战斗角色形象区域 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            background: 'rgba(0,0,0,0.4)',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* 背景装饰 */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(ellipse at 25% 50%, rgba(0, 168, 107, 0.1), transparent 50%), radial-gradient(ellipse at 75% 50%, rgba(220, 20, 60, 0.1), transparent 50%)',
              pointerEvents: 'none',
            }} />

            {/* 玩家1区域 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 1 }}>
              <WarriorAvatar player={p1} isLeft={true} />
              <div style={{ width: '140px' }}>
                <div className="wuxia-progress">
                  <div className="wuxia-progress-bar" style={{ width: `${(p1?.hp / p1?.maxHp) * 100}%`, background: 'linear-gradient(90deg, var(--jade), #22c55e)' }} />
                </div>
                <div style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: '4px', color: 'var(--text-muted)' }}>
                  {Math.floor(p1?.hp || 0)} / {Math.floor(p1?.maxHp || 7000)}
                </div>
              </div>
            </div>

            {/* VS标志 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 1,
            }}>
              <h3 style={{
                color: 'var(--crimson)',
                filter: 'drop-shadow(0 0 8px var(--crimson))',
                fontFamily: '"Ma Shan Zheng", cursive',
                fontSize: '1.8rem',
                letterSpacing: '4px',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}>
                ⚔ VS ⚔
              </h3>
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                marginTop: '0.5rem',
              }}>
                第 {logs?.length || 1} 回合
              </div>
            </div>

            {/* 玩家2区域 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 1 }}>
              <WarriorAvatar player={p2} isLeft={false} />
              <div style={{ width: '140px' }}>
                <div className="wuxia-progress" style={{ transform: 'rotate(180deg)' }}>
                  <div className="wuxia-progress-bar" style={{ width: `${(p2?.hp / p2?.maxHp) * 100}%`, background: 'linear-gradient(90deg, var(--crimson), #ef4444)' }} />
                </div>
                <div style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: '4px', color: 'var(--text-muted)' }}>
                  {Math.floor(p2?.hp || 0)} / {Math.floor(p2?.maxHp || 7000)}
                </div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, background: 'var(--bg-color)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: '"Courier New", monospace', fontSize: '1rem' }}>
            {logs.map((log, i) => (
              <div key={i} style={{
                color: log.includes('系统') ? 'var(--gold)' : log.includes(player.name) ? 'var(--text-main)' : 'var(--crimson)',
                fontWeight: log.includes('系统') ? 'bold' : 'normal',
                whiteSpace: 'pre-line',
                animation: 'slideUp 0.3s',
                padding: log.includes('系统') ? '8px' : '0',
                background: log.includes('系统') ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                borderRadius: '4px'
              }}>
                {log}
              </div>
            ))}
          </div>

          {winner && (
            <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={exitBattle}>退下调息 (返回)</button>
          )}
        </div>
      )}
    </div>
  );
}

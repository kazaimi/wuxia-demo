import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useGameStore, SKILLS_DB, TREASURES_DB } from '../store/gameState';
import { Swords } from 'lucide-react';
import { useCleanImage } from '../utils/imageProcess';
import DynamicPortrait from './DynamicPortrait';
import BattleEffects, { DamageFloatNumber } from './BattleEffects';
import { TreasureIcon } from './WuxiaIcon';

// 根据名字判断性别
const guessGenderByName = (name) => {
  const femaleEndings = ['月', '雪', '霜', '云', '霞', '玉', '珠', '翠', '红', '燕', '莺', '凤', '鸾', '娟', '婷', '婉', '柔', '嫣', '瑶', '薇', '蕾', '露', '涵', '晴', '雨', '烟', '琳', '瑾', '颖', '萱', '蕊', '黛', '芷', '芸', '梦', '舞', '琴', '仙', '姬', '娘', '姑', '妹', '姐', '女', '芳', '莲', '梅', '兰', '竹', '菊'];
  const lastChar = name?.slice(-1) || '';
  if (femaleEndings.includes(lastChar)) return 'female';

  const femaleKeywords = ['邀月', '灭绝', '童姥', '小龙女', '黄蓉', '赵敏', '周芷若', '王语嫣', '阿朱', '阿紫', '任盈盈', '岳灵珊', '李莫愁', '郭芙', '郭襄', '穆念慈'];
  for (const keyword of femaleKeywords) {
    if (name?.includes(keyword)) return 'female';
  }
  return 'male';
};

// 获取武器类型
const getWeaponType = (player) => {
  const treasure = TREASURES_DB?.find(t => t.id === player?.equippedTreasure);
  const effect = treasure?.effect || '';
  const weaponMap = {
    'yiTian': 'sword', 'tuLong': 'blade', 'xuanTie': 'sword', 'jinShe': 'sword',
    'daGou': 'fist', 'dianXue': 'fist', 'shengHuo': 'blade', 'jiMie': 'sword',
  };
  return weaponMap[effect] || 'sword';
};

// 获取气劲颜色
const getAuraColor = (player) => {
  const innerSkill = player?.equippedSkills?.inner;
  const colorMap = {
    's_yijin': '#8b5cf6', // 易筋经 - 紫色
    's5': '#fbbf24',      // 九阳 - 金色
    's_xixing': '#ef4444', // 吸星 - 红色
    's_shihou': '#f97316', // 狮吼 - 橙色
  };
  return colorMap[innerSkill] || '#4facfe';
};

// 战斗角色卡片（使用动态立绘）
const BattleCharacter = ({ player, isLeft, battleState }) => {
  if (!player) return null;

  const gender = useMemo(() => guessGenderByName(player.name), [player.name]);
  const weaponType = getWeaponType(player);
  const auraColor = getAuraColor(player);

  // 根据战斗状态决定立绘状态
  const getPortraitState = () => {
    if (!battleState) return 'idle';
    if (player.hp <= 0) return 'critical';
    if (battleState.lastHit === player.name) return 'hit';
    if (battleState.attacker === player.name) return 'attacking';
    return 'idle';
  };

  // 等级决定边框颜色
  const getLevelStyle = () => {
    const level = player.level || 1;
    if (level >= 90) return { border: '#ffd700', rank: '神话' };
    if (level >= 70) return { border: '#a855f7', rank: '传说' };
    if (level >= 50) return { border: '#f97316', rank: '史诗' };
    if (level >= 30) return { border: '#3b82f6', rank: '稀有' };
    if (level >= 15) return { border: '#22c55e', rank: '优秀' };
    return { border: '#6b7280', rank: '普通' };
  };

  const levelStyle = getLevelStyle();
  const hpRatio = (player.hp || 0) / (player.maxHp || 7000);

  // 武器信息
  const treasure = TREASURES_DB?.find(t => t.id === player.equippedTreasure);
  const treasureEffect = treasure?.effect || '';
  const getWeaponInfo = () => {
    const weapons = {
      'yiTian': { name: '倚天剑', icon: '🗡️' },
      'tuLong': { name: '屠龙刀', icon: '⚔️' },
      'xuanTie': { name: '玄铁重剑', icon: '🗡️' },
      'jinShe': { name: '金蛇剑', icon: '🐍' },
      'daGou': { name: '打狗棒', icon: '🪄' },
      'dianXue': { name: '判官笔', icon: '✒️' },
      'shengHuo': { name: '圣火令', icon: '🔥' },
      'jiMie': { name: '绝世好剑', icon: '⚔️' },
      'niePan': { name: '达摩舍利', icon: '📿' },
      'ruanWei': { name: '软猬甲', icon: '🛡️' },
    };
    return weapons[treasureEffect] || { name: '拳脚', icon: '👊' };
  };
  const weapon = getWeaponInfo();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
    }}>
      {/* 角色卡片 */}
      <div style={{
        position: 'relative',
        padding: '15px',
        background: 'linear-gradient(180deg, rgba(20,15,25,0.95), rgba(10,5,15,0.98))',
        borderRadius: '12px',
        border: `2px solid ${levelStyle.border}`,
        boxShadow: `0 0 20px ${levelStyle.border}40`,
      }}>
        {/* 等级和名字 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
          padding: '0 5px',
        }}>
          <span style={{
            fontSize: '1rem',
            color: '#f0f0f0',
            fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif',
            letterSpacing: '2px',
          }}>
            {player.name}
          </span>
          <span style={{
            fontSize: '0.8rem',
            color: levelStyle.border,
            background: 'rgba(0,0,0,0.5)',
            padding: '2px 8px',
            borderRadius: '4px',
          }}>
            Lv.{player.level}
          </span>
        </div>

        {/* 动态立绘 */}
        <div style={{
          position: 'relative',
          transform: isLeft ? 'scaleX(1)' : 'scaleX(-1)',
        }}>
          <DynamicPortrait
            gender={gender}
            state={getPortraitState()}
            silhouette={false}
            weaponType={weaponType}
            auraColor={auraColor}
            size={120}
          />
        </div>

        {/* 武器 */}
        <div style={{
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--gold)',
          marginTop: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}>
          {player.equippedTreasure ? (
            <TreasureIcon id={player.equippedTreasure} size={22} />
          ) : (
            <span style={{ fontSize: '1.1rem' }}>👊</span>
          )}
          <span style={{ fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '1px' }}>{weapon.name}</span>
        </div>

        {/* 气血条 */}
        <div style={{
          marginTop: '8px',
          width: '100%',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#888',
            marginBottom: '4px',
          }}>
            <span>气血</span>
            <span>{Math.floor(player.hp)} / {Math.floor(player.maxHp)}</span>
          </div>
          <div style={{
            height: '8px',
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${hpRatio * 100}%`,
              height: '100%',
              background: hpRatio > 0.5 ? 'linear-gradient(90deg, #22c55e, #10b981)'
                         : hpRatio > 0.25 ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                         : 'linear-gradient(90deg, #ef4444, #dc2626)',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* 状态效果 */}
        {player.buffs?.shield > 0 && (
          <div style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            background: '#3b82f6',
            color: '#fff',
            fontSize: '0.7rem',
            padding: '2px 6px',
            borderRadius: '10px',
          }}>
            🛡️ {player.buffs.shield}
          </div>
        )}
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

  const cleanIcon = useCleanImage('/wuxia_battle_icon.png');

  // 战斗动效状态
  const [effects, setEffects] = useState([]);
  const [damageNumbers, setDamageNumbers] = useState([]);
  const [currentBattleState, setCurrentBattleState] = useState({});

  // 添加动效
  const addEffect = (type, position, intensity = 1) => {
    const id = Date.now() + Math.random();
    setEffects(prev => [...prev, { id, type, position, intensity }]);
  };

  // 添加伤害数字
  const addDamageNumber = (damage, position, isHeal = false) => {
    const id = Date.now() + Math.random();
    setDamageNumbers(prev => [...prev, { id, damage, position, isHeal }]);
  };

  // 移除动效
  const removeEffect = (id) => {
    setEffects(prev => prev.filter(e => e.id !== id));
  };

  // 移除伤害数字
  const removeDamageNumber = (id) => {
    setDamageNumbers(prev => prev.filter(d => d.id !== id));
  };

  // 解析战斗日志，触发动效
  useEffect(() => {
    if (!logs || logs.length === 0) return;
    const lastLog = logs[logs.length - 1];

    // 检测攻击
    if (lastLog.includes('造成了') || lastLog.includes('斩去')) {
      const damageMatch = lastLog.match(/(\d+)\s*点/);
      if (damageMatch) {
        const damage = parseInt(damageMatch[1]);
        addEffect('swordSlash', 'center', damage > 100 ? 2 : 1);
        addDamageNumber(damage, p1?.name === player.name ? 'right' : 'left');
        setCurrentBattleState({ attacker: p1?.name === player.name ? p1?.name : p2?.name });
      }
    }

    // 检测闪避
    if (lastLog.includes('躲开') || lastLog.includes('闪避')) {
      addEffect('dodge', 'center');
    }

    // 检测治疗
    if (lastLog.includes('恢复了') || lastLog.includes('回春')) {
      const healMatch = lastLog.match(/恢复了?\s*(\d+)/);
      if (healMatch) {
        addEffect('heal', 'center');
        addDamageNumber(parseInt(healMatch[1]), p1?.name === player.name ? 'left' : 'right', true);
      }
    }

    // 检测暴击/重击
    if (lastLog.includes('暴击') || lastLog.includes('重创')) {
      addEffect('criticalHit', 'center', 2);
    }

    // 检测中毒
    if (lastLog.includes('毒') || lastLog.includes('中毒')) {
      addEffect('poison', 'center');
    }

    // 检测晕眩
    if (lastLog.includes('晕') || lastLog.includes('震晕')) {
      addEffect('stun', 'center');
    }

    // 检测复活
    if (lastLog.includes('复活') || lastLog.includes('涅槃')) {
      addEffect('revive', 'center');
    }

    // 清除战斗状态
    const timer = setTimeout(() => {
      setCurrentBattleState({});
    }, 800);
    return () => clearTimeout(timer);
  }, [logs]);

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
         if (tObj?.effect === 'jiMie') return true;
         if (tObj?.effect === 'ruanWei' && (debuffType==='stun'||debuffType==='poison')) return true;
         if (tObj?.effect === 'jinShe' && debuffType==='poison') return true;
         return false;
      };

      let logCount = logs.length;
      let logPrefix = "";

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
         const eq = attacker.equippedSkills || {};
         let skillIds = [eq.inner, eq.outer, eq.motion, eq.ultimate].filter(Boolean);
         if (attacker.debuffs.silence > 0) {
             skillIds = ['s1'];
             attacker.debuffs.silence--;
         } else if (attacker.debuffs.internalWound > 0) {
             skillIds = [eq.outer].filter(Boolean);
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
            actionLog = `${attacker.name} 运转【${skill.name}】，生死二气护住心脉！`;
         } else if (skill.type === 'heal') {
            const healAmt = Math.floor(adjustedSkillPwr + attacker.attributes.int * 2 + 30);
            attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmt);
            actionLog = `${attacker.name} 运转内力使出【${skill.name}】，恢复了 ${healAmt} 点气血！`;
         } else if (skill.type === 'buff' || skill.type === 'motion' || skill.power === 0) {
            attacker.buffs.dodge = 2;
            actionLog = `${attacker.name} 施展【${skill.name}】，气势如虹！`;
         } else {
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

               if (aTreasure?.effect === 'poShang') dmg += 50;
               if (aTreasure?.effect === 'yiTian') dmg = Math.floor(dmg * 1.2);
               if (aTreasure?.effect === 'tuLong' && (attacker.hp / attacker.maxHp) < 0.4) dmg = Math.floor(dmg * 1.5);
               if (aTreasure?.effect === 'shengHuo') dmg += Math.floor(defender.hp * 0.05);

               if (dTreasure?.effect === 'qingQiao') dmg -= 30;
               if (dTreasure?.effect === 'tuLong' && (defender.hp / defender.maxHp) < 0.4) dmg = Math.floor(dmg * 0.8);

               dmg = Math.max(1, dmg);

               if (aTreasure?.effect === 'jiMie' && Math.random() < 0.05) {
                   dmg = Math.floor(defender.hp * 0.5);
                   actionLog = `[寂灭] ${attacker.name} 的【绝世好剑】闪烁黑芒，直接斩去 ${defender.name} ${dmg} 气血！ `;
               }

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
                      actionLog += ` \n[六脉] 无形剑气震伤内腑，${defender.name} 经脉受损！`;
                  }

                  if (aTreasure?.effect === 'dianXue' && Math.random() <= 0.10 && !checkImmune(defender, dTreasure, 'silence')) {
                     defender.debuffs.silence = 1;
                     actionLog += ` \n[宝具] ${defender.name} 被判官笔点中要穴！`;
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
       <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: 'linear-gradient(90deg, transparent, var(--crimson), transparent)', opacity: 0.5 }} />

       {/* 居中大标题排版 */}
       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '0.5rem', marginBottom: '1rem' }}>
         <img
           src={cleanIcon}
           alt="竞技对决"
           style={{
             width: '130px',
             height: '130px',
             objectFit: 'contain',
             filter: 'drop-shadow(0 0 12px rgba(220, 20, 60, 0.5))',
             transition: 'transform 0.3s ease',
           }}
           onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
           onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
         />
          <h2 style={{ fontSize: '2rem', color: 'var(--crimson)', fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '4px', marginTop: '0.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
            竞技对决
          </h2>
         <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '600px', textAlign: 'center', margin: '0' }}>
           以武会友，切磋招式，问道武林之巅
         </p>
       </div>

       {/* 渐变暗红分割线 */}
       <div style={{ width: '80%', height: '1px', background: 'linear-gradient(90deg, transparent, var(--crimson), transparent)', margin: '0.5rem auto 1.5rem', opacity: 0.3 }} />

      {!inBattle ? (
         <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.7' }}>当前并未在切磋回合中。<br/>请前往【风云榜】中向真实的在线高手下发战书！</p>
       </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* 战斗角色区域 */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '60px',
            marginBottom: '1rem',
            padding: '1.5rem',
            position: 'relative',
          }}>
            {/* 玩家1 */}
            <BattleCharacter player={p1} isLeft={true} battleState={currentBattleState} />

            {/* VS标志 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
            }}>
              <div style={{
                fontSize: '2.5rem',
                color: 'var(--crimson)',
                fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif',
                textShadow: '0 0 20px rgba(220, 20, 60, 0.6)',
                letterSpacing: '8px',
              }}>
                VS
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: 'var(--gold)',
                fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif',
                background: 'rgba(0,0,0,0.6)',
                padding: '4px 16px',
                borderRadius: '4px',
                border: '1px solid rgba(212, 175, 55, 0.3)',
              }}>
                第 {logs?.length || 1} 回合
              </div>
            </div>

            {/* 玩家2 */}
            <BattleCharacter player={p2} isLeft={false} battleState={currentBattleState} />

            {/* 战斗动效层 */}
            {effects.map(effect => (
              <BattleEffects
                key={effect.id}
                effectType={effect.type}
                intensity={effect.intensity}
                position={effect.position}
                onComplete={() => removeEffect(effect.id)}
              />
            ))}

            {/* 伤害数字 */}
            {damageNumbers.map(d => (
              <DamageFloatNumber
                key={d.id}
                damage={d.damage}
                position={d.position}
                isHeal={d.isHeal}
                onComplete={() => removeDamageNumber(d.id)}
              />
            ))}
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

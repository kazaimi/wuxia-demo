import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useGameStore, SKILLS_DB, TREASURES_DB } from '../store/gameState';
import { Swords } from 'lucide-react';
import { useCleanImage } from '../utils/imageProcess';
import EnhancedWarriorAvatar from './EnhancedWarriorAvatar';
import BattleEffects, { DamageFloatNumber, MangaSkillPop, ClashParticles } from './BattleEffects';
import { TreasureIcon } from './WuxiaIcon';
import { SoundManager } from '../utils/SoundManager';

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

// 战斗角色卡片（使用新版水墨卡牌）
const BattleCharacter = ({ player, isLeft, battleState, damageNumbers }) => {
  if (!player) return null;

  const isAttacking = battleState?.attacker === player.name;
  const isHit = battleState?.lastHit === player.name;
  const isDodging = battleState?.dodger === player.name;
  const isHealing = battleState?.healer === player.name;
  const isDead = player.hp <= 0;

  // 获取该角色的伤害/治疗飘字数值
  const curDamage = damageNumbers?.find(d => d.position === (isLeft ? 'left' : 'right') && !d.isHeal);
  const curHeal = damageNumbers?.find(d => d.position === (isLeft ? 'left' : 'right') && d.isHeal);

  return (
    <EnhancedWarriorAvatar
      player={player}
      isLeft={isLeft}
      isAttacking={isAttacking}
      isHit={isHit}
      isDodging={isDodging}
      isHealing={isHealing}
      isDead={isDead}
      damageAmount={curDamage?.damage}
      healAmount={curHeal?.damage}
      effectType={battleState?.effectType} // 传递当前招式动效类型以同步受击反应
    />
  );
};

export default function BattleArena() {
  const player = useGameStore(state => state.player);
  const battleState = useGameStore(state => state.battleState);
  const { inBattle, p1, p2, logs, winner, roomId } = battleState;
  const sendBattleAction = useGameStore(state => state.sendBattleAction);
  const exitBattle = useGameStore(state => state.exitBattle);

  const cleanIcon = useCleanImage('/wuxia_battle_icon.webp');

  // 监听进入战斗状态，自动播放战曲 bgm_battle
  useEffect(() => {
    if (inBattle) {
      SoundManager.playMusic('bgm_battle');
    }
  }, [inBattle]);

  // 监听决斗胜负，播放成功/失败结算音效
  useEffect(() => {
    if (winner && p1) {
      if (winner === 'aborted') {
         alert("【比武告示】大侠的对手由于身有急事离奇退场（断开连接），切磋就此取消！");
         return;
      }
      const isPlayerWinner = (winner === 'p1' && p1.name === player.name) || (winner === 'p2' && p2.name === player.name);
      if (isPlayerWinner) {
        SoundManager.play('sfx_success');
      } else {
        SoundManager.play('sfx_fail');
      }
    }
  }, [winner, p1, player.name]);

  // 战斗动效状态
  const [effects, setEffects] = useState([]);
  const [damageNumbers, setDamageNumbers] = useState([]);
  const [currentBattleState, setCurrentBattleState] = useState({});
  const [skillCast, setSkillCast] = useState(null);

  // 添加动效
  const addEffect = (type, position, intensity = 1, skillName = '', skillId = '') => {
    const id = Date.now() + Math.random();
    setEffects(prev => [...prev, { id, type, position, intensity, skillName, skillId }]);
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

    let attacker = null;
    let lastHit = null;
    let dodger = null;
    let healer = null;
    let effectType = null;
    let matchedSkillName = '';
    let matchedSkillId = '';

    if (p1 && p2) {
      const p1Name = p1.name;
      const p2Name = p2.name;

      // 拦截特写招式
      const cleanLog = lastLog.replace(/^\[[^\]]+\]\s*/, '');
      const skillMatch = cleanLog.match(/([^\s\n]+)\s+[^【\n]*【([^】]+)】/);
      if (skillMatch) {
        const charName = skillMatch[1];
        const skillName = skillMatch[2];
        const skill = SKILLS_DB.find(s => s.name === skillName);
        if (skill && skill.id !== 's1') {
          setSkillCast({
            characterName: charName,
            skillName: skillName,
            skillId: skill.id,
            skillDesc: skill.desc,
            position: charName === p1Name ? 'left' : 'right'
          });
        }
      }

      // 1. 检测受击 & 攻击
      if (lastLog.includes('造成了') || lastLog.includes('斩去') || lastLog.includes('伤害') || lastLog.includes('反伤') || lastLog.includes('损失') || lastLog.includes('造成') || lastLog.includes('追击') || lastLog.includes('削去') || lastLog.includes('丧失') || lastLog.includes('毒发')) {
        const damageMatch = lastLog.match(/(\d+)\s*(点|点伤害|气血|伤害)?/);
        if (damageMatch) {
          const damage = parseInt(damageMatch[1]);
          // 智能检测招式类型
          const cleanLog = lastLog.replace(/^\[[^\]]+\]\s*/, '');
          const skillNameMatch = cleanLog.match(/【([^】]+)】/);
          effectType = 'swordSlash';
          if (skillNameMatch) {
            matchedSkillName = skillNameMatch[1];
            const skill = SKILLS_DB.find(s => s.name === matchedSkillName);
            if (skill) {
              matchedSkillId = skill.id;
              if (skill.type === 'ultimate') {
                effectType = 'ultimateBurst';
              } else if (
                skill.id !== 's1' && (
                  skill.name.includes('拳') ||
                  skill.name.includes('掌') ||
                  skill.name.includes('脚') ||
                  skill.name.includes('指') ||
                  skill.name.includes('手')
                )
              ) {
                effectType = 'fistPunch';
              }
            }
          } else {
            // 普通物理攻击/反伤等物理撞击，还原原版直接进行刀剑斩击 (即不显示飞行气团弹道，打击感爽快直接)
            effectType = 'swordSlash';
          }

          // 根据不同动效的弹道飞行时长计算伤害数值飘字的生成延迟
          let delay = 0;
          if (effectType === 'ultimateBurst') {
            delay = 580;
          } else if (effectType === 'fistPunch') {
            delay = 400;
          }

          const triggerDamage = (pos) => {
            addDamageNumber(damage, pos);
          };

          // 播放动作打击音效
          if (effectType === 'ultimateBurst') {
            SoundManager.play('sfx_magic');
          } else if (effectType === 'fistPunch') {
            SoundManager.play('sfx_fist');
          } else {
            if (lastLog.includes('刀') || lastLog.includes('劈') || lastLog.includes('斩') || lastLog.includes('劈砍')) {
              SoundManager.play('sfx_blade');
            } else {
              SoundManager.play('sfx_sword');
            }
          }

          if (lastLog.includes('对 ' + p1Name) || lastLog.includes('受到了 ' + p1Name) || lastLog.includes('反伤，' + p1Name) || lastLog.includes(p1Name + ' 损失') || lastLog.includes(p1Name + ' 丧失') || lastLog.includes(p1Name + ' 毒发') || lastLog.includes('反伤] ' + p1Name) || lastLog.includes('追击] ' + p1Name) || lastLog.includes('削去 ' + p1Name)) {
            lastHit = p1Name;
            attacker = p2Name;
            addEffect(effectType, 'left', damage > 100 ? 2 : 1, matchedSkillName, matchedSkillId);
            if (delay > 0) {
              setTimeout(() => triggerDamage('left'), delay);
            } else {
              triggerDamage('left');
            }
          } else if (lastLog.includes('对 ' + p2Name) || lastLog.includes('受到了 ' + p2Name) || lastLog.includes('反伤，' + p2Name) || lastLog.includes(p2Name + ' 损失') || lastLog.includes(p2Name + ' 丧失') || lastLog.includes(p2Name + ' 毒发') || lastLog.includes('反伤] ' + p2Name) || lastLog.includes('追击] ' + p2Name) || lastLog.includes('削去 ' + p2Name)) {
            lastHit = p2Name;
            attacker = p1Name;
            addEffect(effectType, 'right', damage > 100 ? 2 : 1, matchedSkillName, matchedSkillId);
            if (delay > 0) {
              setTimeout(() => triggerDamage('right'), delay);
            } else {
              triggerDamage('right');
            }
          } else {
            const isP1Attacking = p1Name === player.name; // 默认为玩家回合
            attacker = isP1Attacking ? p1Name : p2Name;
            lastHit = isP1Attacking ? p2Name : p1Name;
            addEffect(effectType, 'center', damage > 100 ? 2 : 1, matchedSkillName, matchedSkillId);
            const targetPos = isP1Attacking ? 'right' : 'left';
            if (delay > 0) {
              setTimeout(() => triggerDamage(targetPos), delay);
            } else {
              triggerDamage(targetPos);
            }
          }
        }
      }

      const getTargetPos = (logText, keywords = null) => {
        const lines = logText.split('\n');
        
        // 1. 如果指定了关键字，优先在包含任意一个关键字的行里找名字
        if (keywords) {
          const kwList = Array.isArray(keywords) ? keywords : [keywords];
          for (let i = lines.length - 1; i >= 0; i--) {
            const hasKeyword = kwList.some(kw => lines[i].includes(kw));
            if (hasKeyword) {
              if (p1Name && lines[i].includes(p1Name)) return 'left';
              if (p2Name && lines[i].includes(p2Name)) return 'right';
            }
          }
        }
        
        // 2. 如果没指定关键字或者对应行没名字，从最后一行往前找名字
        for (let i = lines.length - 1; i >= 0; i--) {
          if (p1Name && lines[i].includes(p1Name)) return 'left';
          if (p2Name && lines[i].includes(p2Name)) return 'right';
        }
        
        // 3. 兜底策略：全文匹配
        if (p1Name && logText.includes(p1Name)) return 'left';
        if (p2Name && logText.includes(p2Name)) return 'right';
        return 'center';
      };

      // 2. 检测闪避
      if (lastLog.includes('躲开') || lastLog.includes('闪避') || lastLog.includes('闪开')) {
        let pos = 'center';
        if (lastLog.includes('被 ' + p1Name) || lastLog.includes(p1Name)) {
          pos = 'left';
          dodger = p1Name;
          attacker = p2Name;
        } else if (lastLog.includes('被 ' + p2Name) || lastLog.includes(p2Name)) {
          pos = 'right';
          dodger = p2Name;
          attacker = p1Name;
        }
        addEffect('dodge', pos);
        SoundManager.play('sfx_dodge');
      }

      // 3. 检测治疗与恢复
      if (lastLog.includes('恢复了') || lastLog.includes('回春') || lastLog.includes('复活') || lastLog.includes('涅槃') || lastLog.includes('夺取了') || lastLog.includes('恢复')) {
        const healMatch = lastLog.match(/(?:恢复了|夺取了|恢复|回春)?\s*\+?(\d+)/);
        const healAmt = healMatch ? parseInt(healMatch[1]) : 150;
        const healPos = getTargetPos(lastLog, ['恢复', '回春', '复活', '涅槃', '夺取']);
        addEffect('heal', healPos);
        SoundManager.play('sfx_heal');
        if (healPos === 'left') {
          healer = p1Name;
          addDamageNumber(healAmt, 'left', true);
        } else if (healPos === 'right') {
          healer = p2Name;
          addDamageNumber(healAmt, 'right', true);
        }
      }

      // 4. 检测其他特殊控制与增益
      if (lastLog.includes('暴击') || lastLog.includes('重创')) {
        const critPos = lastHit ? (lastHit === p1Name ? 'left' : 'right') : getTargetPos(lastLog, ['暴击', '重创']);
        addEffect('criticalHit', critPos, 2);
      }
      if (lastLog.includes('毒') || lastLog.includes('中毒')) {
        addEffect('poison', getTargetPos(lastLog, ['毒', '中毒']));
        SoundManager.play('sfx_poison');
      }
      if (lastLog.includes('力激荡') && lastLog.includes('逼出')) {
        addEffect('heal', getTargetPos(lastLog, ['力激荡', '逼出']));
        SoundManager.play('sfx_heal');
      }
      if (lastLog.includes('晕') || lastLog.includes('震晕') || lastLog.includes('眩晕')) {
        addEffect('stun', getTargetPos(lastLog, ['晕', '震晕', '眩晕']));
        SoundManager.play('sfx_stun');
      }
      if (lastLog.includes('点穴') || lastLog.includes('封锁') || lastLog.includes('被判官笔点中')) {
        SoundManager.play('sfx_silence');
      }
      if (lastLog.includes('内伤') || lastLog.includes('经脉受损')) {
        addEffect('internalWound', getTargetPos(lastLog, ['内伤', '经脉受损']));
        SoundManager.play('sfx_internal');
      }
      if (lastLog.includes('护盾') || lastLog.includes('佛光')) {
        SoundManager.play('sfx_shield');
      }
      if (lastLog.includes('复活') || lastLog.includes('涅槃')) {
        addEffect('revive', getTargetPos(lastLog, ['复活', '涅槃']));
        SoundManager.play('sfx_revive');
      }

      setCurrentBattleState({ attacker, lastHit, dodger, healer, effectType });
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
      const getTreasure = (id) => typeof TREASURES_DB !== 'undefined' ? TREASURES_DB.find(t=>t.id===id) : null;
      const p1Treasure = getTreasure(p1.equippedTreasure);
      const p2Treasure = getTreasure(p2.equippedTreasure);
      const p1Attrs = p1.equippedTreasureAttrs || {};
      const p2Attrs = p2.equippedTreasureAttrs || {};

      const p1Speed = (p1.attributes.agi || 0) + (p1Treasure?.attrs?.dodge || 0) * 0.5 + (p1Attrs.extraDodge || 0) * 0.5;
      const p2Speed = (p2.attributes.agi || 0) + (p2Treasure?.attrs?.dodge || 0) * 0.5 + (p2Attrs.extraDodge || 0) * 0.5;
      const isP1Turn = Math.random() < (p1Speed / (p1Speed + p2Speed + 1));
      let actionData = {};

      let attacker = { ... (isP1Turn ? p1 : p2) };
      let defender = { ... (isP1Turn ? p2 : p1) };
      const attackerKey = isP1Turn ? 'p1' : 'p2';
      const defenderKey = isP1Turn ? 'p2' : 'p1';

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
      }

      if (!attacker.buffs) attacker.buffs = { dodge: 0, defUp: 0, shield: 0, revive: 0 };
      if (!defender.buffs) defender.buffs = { dodge: 0, defUp: 0, shield: 0, revive: 0 };
      if (!attacker.debuffs) attacker.debuffs = { stun: 0, poison: 0, silence: 0, internalWound: 0, poisonPercent: 0.03 };
      if (!defender.debuffs) defender.debuffs = { stun: 0, poison: 0, silence: 0, internalWound: 0, poisonPercent: 0.03 };



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

         const pAtk = aStr * 2 + attacker.level * 5 + (aTreasure?.attrs?.atk || 0) + (aAttrs.extraAtk || 0);
         const dDefBase = dCon * 2 + defender.level * 2 + (dTreasure?.attrs?.def || 0) + (dAttrs.extraDef || 0);
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
                const defenderDodge = (dTreasure?.attrs?.dodge || 0) + (dAttrs.extraDodge || 0);
                const baseDodgeChance = ((defender.attributes.agi / (defender.attributes.agi + 120)) * 0.75) + defenderDodge * 0.01;
                isDodge = Math.random() < baseDodgeChance || (defender.buffs.dodge > 0 ? Math.random() < 0.45 : false);
             }

            if (isDodge) {
               actionLog = `${attacker.name} 施展【${skill.name}】，却被 ${defender.name} 巧妙躲开！`;
            } else {
               let finalDef = dDefBase * 1;
               if (defender.buffs.defUp > 0) finalDef *= 3;

               let dmg = Math.floor(pAtk + adjustedSkillPwr - finalDef);

               // PVP 暴击判定
               const attackerCrit = (aTreasure?.attrs?.crit || 0) + (aAttrs.extraCrit || 0);
               const baseCritChance = ((attacker.attributes.luk / (attacker.attributes.luk + 150)) * 0.2) + attackerCrit * 0.01;
               const isCrit = Math.random() < baseCritChance;
               if (isCrit) {
                  dmg = Math.floor(dmg * 1.5);
               }

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
                   actionLog += ` \n[吸星大法] ${attacker.name} 夺取了 ${drainAmt} 点气血化为己用！`;
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

                  // 额外判定洗炼的中毒率和击晕率词条
                  if (aAttrs.poisonRate > 0 && Math.random() <= (aAttrs.poisonRate * 0.01) && !checkImmune(defender, dTreasure, 'poison')) {
                     if (defender.debuffs.poison < 3) {
                        defender.debuffs.poison = 3;
                        actionLog += ` \n[注灵剧毒] 附魔剧毒生效，${defender.name} 陷入毒发！`;
                     }
                  }
                  if (aAttrs.stunRate > 0 && Math.random() <= (aAttrs.stunRate * 0.01) && !checkImmune(defender, dTreasure, 'stun')) {
                     if (defender.debuffs.stun < 1) {
                        defender.debuffs.stun = 1;
                        actionLog += ` \n[注灵震慑] 附魔晕眩生效，${defender.name} 被震慑防守！`;
                     }
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
    <div className="glass-panel animate-slide-up" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
       <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: 'linear-gradient(90deg, transparent, var(--crimson), transparent)', opacity: 0.5 }} />

       {/* 居中大标题排版 */}
       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginTop: '0.2rem', marginBottom: '0.8rem' }}>
         <img
           src={cleanIcon}
           alt="竞技对决"
           style={{
             width: '50px',
             height: '50px',
             objectFit: 'contain',
             filter: 'drop-shadow(0 0 8px rgba(220, 20, 60, 0.5))',
             transition: 'transform 0.3s ease',
           }}
           onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
           onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
         />
         <div>
           <h2 style={{ fontSize: '1.5rem', color: 'var(--crimson)', fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '2px', margin: '0', textAlign: 'left' }}>
             竞技对决
           </h2>
           <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0' }}>
             以武会友，切磋招式，问道武林之巅
           </p>
         </div>
       </div>

       {/* 渐变暗红分割线 */}
       <div style={{ width: '80%', height: '1px', background: 'linear-gradient(90deg, transparent, var(--crimson), transparent)', margin: '0.2rem auto 0.8rem', opacity: 0.3 }} />

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
            gap: '40px',
            marginBottom: '0.8rem',
            padding: '0.5rem 1rem',
            position: 'relative',
          }}>
            {/* 玩家1 */}
            <BattleCharacter player={p1} isLeft={true} battleState={currentBattleState} damageNumbers={damageNumbers} />

            {/* VS标志 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}>
              <div style={{
                fontSize: '2rem',
                color: 'var(--crimson)',
                fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif',
                textShadow: '0 0 15px rgba(220, 20, 60, 0.6)',
                letterSpacing: '6px',
              }}>
                VS
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--gold)',
                fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif',
                background: 'rgba(0,0,0,0.6)',
                padding: '2px 10px',
                borderRadius: '4px',
                border: '1px solid rgba(212, 175, 55, 0.3)',
              }}>
                第 {logs?.length || 1} 回合
              </div>
            </div>

            {/* 玩家2 */}
            <BattleCharacter player={p2} isLeft={false} battleState={currentBattleState} damageNumbers={damageNumbers} />

            {/* 战斗动效层 */}
            {effects.map(effect => (
              <BattleEffects
                key={effect.id}
                effectType={effect.type}
                intensity={effect.intensity}
                position={effect.position}
                skillName={effect.skillName}
                skillId={effect.skillId}
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

            {/* 物理碰撞碎屑粒子层 */}
            <ClashParticles
              active={!!currentBattleState.lastHit}
              position={currentBattleState.lastHit === p1?.name ? 'left' : 'right'}
              effectType={currentBattleState?.effectType}
            />

            {/* 漫画大招特写层 */}
            {skillCast && (
              <MangaSkillPop
                characterName={skillCast.characterName}
                skillName={skillCast.skillName}
                skillId={skillCast.skillId}
                skillDesc={skillCast.skillDesc}
                position={skillCast.position}
                onComplete={() => setSkillCast(null)}
              />
            )}
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
            <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => { SoundManager.play('sfx_click'); SoundManager.playMusic('bgm_menu'); exitBattle(); }}>退下调息 (返回)</button>
          )}
        </div>
      )}
    </div>
  );
}

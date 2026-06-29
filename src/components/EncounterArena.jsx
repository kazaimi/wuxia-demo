import React, { useState, useEffect, useRef } from 'react';
import { useGameStore, SKILLS_DB, TREASURES_DB, getSkillMastery } from '../store/gameState';
import { useCleanImage } from '../utils/imageProcess';
import EnhancedWarriorAvatar from './EnhancedWarriorAvatar';
import BattleEffects, { DamageFloatNumber, MangaSkillPop, ClashParticles } from './BattleEffects';
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

// 战斗角色卡牌（使用新版水墨卡牌）
const EncounterCharacter = ({ player, isLeft, battleState, damageNumbers }) => {
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

// Roguelike 奇遇 Buff 选项定义
const BUFF_POOL = [
  { id: 'str', type: 'attr' },
  { id: 'con', type: 'attr' },
  { id: 'int', type: 'attr' },
  { id: 'agi', type: 'attr' },
  { id: 'luk', type: 'attr' },
  { id: 'defUpEffect', type: 'def' },
  { id: 'defUpDuration', type: 'def' },
  { id: 'dodgeEffect', type: 'dodge' },
  { id: 'dodgeDuration', type: 'dodge' },
  { id: 'poisonDmgPct', type: 'poison' },
  { id: 'poisonDuration', type: 'poison' },
  { id: 'stunDuration', type: 'stun' },
  { id: 'silenceDuration', type: 'silence' },
  { id: 'treasureBoost', type: 'treasure' }
];

// 获取携带秘宝的特定强化描述
const getTreasureBuffInfo = (treasureId) => {
  const t = TREASURES_DB?.find(x => x.id === treasureId);
  if (!t) {
    return { name: '强身健体', desc: '身怀利刃：最终伤害提升 +10%' };
  }
  switch (treasureId) {
    case 't1': return { name: `【${t.name}·佛光】`, desc: '【宁神】开局护盾比例额外 +5% 最大生命值' };
    case 't2': return { name: `【${t.name}·厚重】`, desc: '【轻巧】受到伤害减少数值额外 +20 点' };
    case 't3': return { name: `【${t.name}·锋利】`, desc: '【破伤】普攻额外真实伤害额外 +40 点' };
    case 't4': return { name: `【${t.name}·生机】`, desc: '【回春】造成伤害时恢复生命值比例额外 +1.5%' };
    case 't5': return { name: `【${t.name}·精准】`, desc: '【点穴】攻击触发封穴概率额外 +8%' };
    case 't6': return { name: `【${t.name}·毒刺】`, desc: '【剧毒】攻击触发中毒概率额外 +10%' };
    case 't7': return { name: `【${t.name}·击顶】`, desc: '【打狗】攻击触发击晕概率额外 +10%' };
    case 't8': return { name: `【${t.name}·影袭】`, desc: '【金蛇】触发额外连击概率额外 +10%' };
    case 't9': return { name: `【${t.name}·反伤】`, desc: '【软猬】受击反弹伤害比例额外 +10%' };
    case 't10': return { name: `【${t.name}·圣力】`, desc: '【倚天】最终伤害额外 +5%，且吸血比例额外 +10%' };
    case 't11': return { name: `【${t.name}·狂战】`, desc: '【破釜沉舟】低血量（低于40%）时伤害提升额外 +15%' };
    case 't12': return { name: `【${t.name}·重锋】`, desc: '【重剑】攻击触发内伤概率额外 +10%' };
    case 't13': return { name: `【${t.name}·法言】`, desc: '【威压】沉默时长 +1 回合且攻击额外附带 2% 最大生命伤害' };
    case 't14': return { name: `【${t.name}·死境】`, desc: '【寂灭】触发斩杀（直接削减目标50%HP）的概率额外 +2%' };
    case 't15': return { name: `【${t.name}·舍利】`, desc: '【涅槃】复活时恢复的生命比例额外 +15% HP' };
    default: return { name: '强身健体', desc: '身怀利刃：最终伤害提升 +10%' };
  }
};

// 动态拼装具有不同品质等级的 Buff 详细属性和文案
const buildBuffChoice = (id, quality, treasureId) => {
   const qLabel = quality === 'epic' ? '【绝世】' : quality === 'rare' ? '【精妙】' : '【粗浅】';
   const qColor = quality === 'epic' ? 'var(--danger)' : quality === 'rare' ? 'var(--gold)' : 'var(--text-muted)';
   
   let choice = { id, quality, qLabel, qColor };
   
   switch(id) {
      case 'str':
         choice.val = quality === 'epic' ? 25 : quality === 'rare' ? 15 : 8;
         choice.name = `${qLabel}力量之源`;
         choice.desc = `力量属性增加 ${choice.val} 点`;
         choice.type = 'attr';
         break;
      case 'con':
         choice.val = quality === 'epic' ? 25 : quality === 'rare' ? 15 : 8;
         choice.name = `${qLabel}体质之源`;
         choice.desc = `体质增加 ${choice.val} 点 (最大生命增加 ${choice.val * 5}，并恢复等量生命)`;
         choice.type = 'attr';
         break;
      case 'int':
         choice.val = quality === 'epic' ? 25 : quality === 'rare' ? 15 : 8;
         choice.name = `${qLabel}智慧之源`;
         choice.desc = `智慧属性增加 ${choice.val} 点`;
         choice.type = 'attr';
         break;
      case 'agi':
         choice.val = quality === 'epic' ? 25 : quality === 'rare' ? 15 : 8;
         choice.name = `${qLabel}敏捷之源`;
         choice.desc = `敏捷属性增加 ${choice.val} 点`;
         choice.type = 'attr';
         break;
      case 'luk':
         choice.val = quality === 'epic' ? 25 : quality === 'rare' ? 15 : 8;
         choice.name = `${qLabel}幸运之源`;
         choice.desc = `幸运属性增加 ${choice.val} 点`;
         choice.type = 'attr';
         break;
      case 'defUpEffect':
         choice.val = quality === 'epic' ? 0.60 : quality === 'rare' ? 0.30 : 0.15;
         choice.name = `${qLabel}防御加固`;
         choice.desc = `防御 Buff (defUp) 的效果比例提升 ${Math.floor(choice.val * 100)}%`;
         choice.type = 'def';
         break;
      case 'defUpDuration':
         choice.val = quality === 'epic' ? 3 : quality === 'rare' ? 2 : 1;
         choice.name = `${qLabel}坚毅不拔`;
         choice.desc = `防御 Buff (defUp) 的持续时间延长 ${choice.val} 回合`;
         choice.type = 'def';
         break;
      case 'dodgeEffect':
         choice.val = quality === 'epic' ? 0.35 : quality === 'rare' ? 0.20 : 0.10;
         choice.name = `${qLabel}身法幻影`;
         choice.desc = `身法闪避 Buff (dodge) 期间闪避成功率提升 ${Math.floor(choice.val * 100)}%`;
         choice.type = 'dodge';
         break;
      case 'dodgeDuration':
         choice.val = quality === 'epic' ? 3 : quality === 'rare' ? 2 : 1;
         choice.name = `${qLabel}轻功延续`;
         choice.desc = `身法闪避 Buff (dodge) 的持续时间延长 ${choice.val} 回合`;
         choice.type = 'dodge';
         break;
      case 'poisonDmgPct':
         choice.val = quality === 'epic' ? 0.04 : quality === 'rare' ? 0.02 : 0.01;
         choice.name = `${qLabel}见血封喉`;
         choice.desc = `中毒伤害比例每回合增加 ${Math.floor(choice.val * 100)}% MaxHP`;
         choice.type = 'poison';
         break;
      case 'poisonDuration':
         choice.val = quality === 'epic' ? 3 : quality === 'rare' ? 2 : 1;
         choice.name = `${qLabel}蚀骨剧毒`;
         choice.desc = `中毒状态持续时间延长 ${choice.val} 回合`;
         choice.type = 'poison';
         break;
      case 'stunDuration':
         choice.val = quality === 'epic' ? 2 : quality === 'rare' ? 1 : 1;
         choice.chance = quality === 'epic' ? 0.25 : quality === 'rare' ? 0.15 : 0.05;
         choice.name = `${qLabel}夺魂摄魄`;
         choice.desc = `眩晕延长 ${choice.val} 回合，且眩晕概率额外增加 ${Math.floor(choice.chance * 100)}%`;
         choice.type = 'stun';
         break;
      case 'silenceDuration':
         choice.val = quality === 'epic' ? 2 : quality === 'rare' ? 1 : 1;
         choice.amp = quality === 'epic' ? 0.30 : quality === 'rare' ? 0.15 : 0.05;
         choice.name = `${qLabel}指点江山`;
         choice.desc = `封穴延长 ${choice.val} 回合，且封穴期间目标受伤提升 ${Math.floor(choice.amp * 100)}%`;
         choice.type = 'silence';
         break;
      case 'treasureBoost':
         if (quality === 'common') {
            choice.name = `【粗浅】强身健体`;
            choice.desc = `身怀利刃：最终伤害额外提升 5%`;
            choice.val = 1; 
            choice.type = 'normal';
         } else {
            const info = getTreasureBuffInfo(treasureId);
            const levelAdd = quality === 'epic' ? 2 : 1;
            choice.name = `${qLabel}${info.name}`;
            choice.desc = `增强特效：${info.desc} 且层级 +${levelAdd}`;
            choice.val = levelAdd;
            choice.type = 'treasure';
         }
         break;
      default:
         choice.name = `【粗浅】强身健体`;
         choice.desc = `身怀利刃：最终伤害提升 5%`;
         choice.val = 5;
         choice.type = 'normal';
   }
   
   return choice;
};

// 随机生成不同品质的奇遇增益选项 (前期 5 张，后期 3 张)
const generateBuffChoices = (treasureId, isEarly) => {
   const count = isEarly ? 5 : 3;
   const shuffled = [...BUFF_POOL].sort(() => 0.5 - Math.random());
   const selected = shuffled.slice(0, count);
   
   // 随机生成独立品质，降低绝世概率至 2%，精妙概率至 13%
   const list = selected.map(b => {
      const rand = Math.random();
      let quality = 'common'; 
      if (rand < 0.02) {
         quality = 'epic';
      } else if (rand < 0.15) {
         quality = 'rare';
      }
      return buildBuffChoice(b.id, quality, treasureId);
   });

   // 每一波次抉择固定在卡牌最右端追加 60% 恢复大还丹选项
   list.push({
      id: 'heal60',
      quality: 'rare',
      qLabel: '【济世】',
      qColor: 'var(--warn)',
      name: '【济世】气血大还丹',
      desc: '立即恢复当前气血 60% 最大生命值',
      type: 'heal',
      val: 0.60
   });

   return list;
};

export default function EncounterArena() {
  const player = useGameStore(state => state.player);
  const onlinePlayers = useGameStore(state => state.onlinePlayers);
  const gainExp = useGameStore(state => state.gainExp);
  const incrementEncounterCount = useGameStore(state => state.incrementEncounterCount);
  const gainTreasure = useGameStore(state => state.gainTreasure);
  const addActivity = useGameStore(state => state.addActivity);
  const addSilver = useGameStore(state => state.addSilver);
  const gainEncounterRewards = useGameStore(state => state.gainEncounterRewards);
  const incrementSkillMastery = useGameStore(state => state.incrementSkillMastery);

  const cleanIcon = useCleanImage('/wuxia_encounter_icon.webp');

  // Roguelike 核心状态
  const [encounterState, setEncounterState] = useState('idle'); // idle, battling, transitioning, buffSelection, settlement, lose_settling
  const [leaderboardTeam, setLeaderboardTeam] = useState([]);
  const [defeatedCount, setDefeatedCount] = useState(0);
  const [waveIndex, setWaveIndex] = useState(0);
  const [buffChoices, setBuffChoices] = useState([]);
  const [settlementInfo, setSettlementInfo] = useState(null);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [rerollsLeft, setRerollsLeft] = useState(4);
  const [milestonePopup, setMilestonePopup] = useState(null);

  // 可叠加的 Roguelike Buff 状态
  const [rogueBuffs, setRogueBuffs] = useState({
    str: 0, con: 0, int: 0, agi: 0, luk: 0,
    defUpEffect: 0, defUpDuration: 0,
    dodgeEffect: 0, dodgeDuration: 0,
    poisonDmgPct: 0, poisonDuration: 0,
    stunDuration: 0, stunChance: 0,
    silenceDuration: 0, silenceDamageAmp: 0,
    treasureBoostLevel: 0,
    heal60Count: 0,
  });
  
  const [p1, setP1] = useState(null);
  const [p2, setP2] = useState(null);
  const [logs, setLogs] = useState([]);

  const getMilestoneDesc = (m) => {
     switch (m) {
        case 6: return "战胜 6 人：修为 +500，银两 +1";
        case 12: return "战胜 12 人：修为 +1000，银两 +1，并有概率缴获普通秘宝";
        case 30: return "战胜 30 人：修为 +2500，银两 +1，并有概率缴获普通/稀有秘宝";
        case 42: return "战胜 42 人：修为 +2500，银两 +2，并有概率缴获稀有/史诗秘宝";
        case 48: return "战胜 48 人：修为 +2500，银两 +2，并有概率缴获史诗秘宝";
        case 51: return "战胜 51 人：修为 +2500，银两 +2，并有概率缴获史诗/传说秘宝";
        case 54: return "战胜 54 人：修为 +2500，银两 +3，并有概率缴获传说秘宝";
        case 57: return "战胜 57 人：修为 +2500，银两 +3，并有概率缴获传说/神话秘宝";
        case 60: return "通关大捷！修为 +3000，银两 +5，并有概率缴获神话秘宝，荣升【鸣剑宗主】名望！";
        default: return "";
     }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('mock_encounter=1') && encounterState === 'idle') {
      const timer = setTimeout(() => {
        startEncounter();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

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
  const addDamageNumber = (damage, position, isHeal = false, type = 'damage') => {
    const id = Date.now() + Math.random();
    setDamageNumbers(prev => [...prev, { id, damage, position, isHeal, type }]);
  };

  // 移除动效
  const removeEffect = (id) => {
    setEffects(prev => prev.filter(e => e.id !== id));
  };

  // 移除伤害数字
  const removeDamageNumber = (id) => {
    setDamageNumbers(prev => prev.filter(d => d.id !== id));
  };

  // 开启肉鸽奇遇挑战
  const startEncounter = () => {
     if ((player.encountersToday || 0) >= 5) {
         alert("今日奇遇次数已达上限，大侠请明日再来！");
         return;
     }

     // 风云榜降序排列（席位从大到小，即从底部倒序挑战）
     const sortedLeaderboard = onlinePlayers
       .filter(u => u.name !== '清风')
       .sort((a, b) => (b.rankIndex || 9999) - (a.rankIndex || 9999));
     if (sortedLeaderboard.length < 3) {
         alert("江湖风云榜高手尚且不足，无法开启挑战。");
         return;
     }
     
     // 触发奇遇并切换为激昂战斗BGM
     SoundManager.play('sfx_encounter_trigger');
     SoundManager.playMusic('bgm_battle');
     
     incrementEncounterCount();
     const upgradedTitle = addActivity(10);
     if (upgradedTitle) {
         setTimeout(() => {
             alert(`随着你在武林中不断游历，近日活跃度居高不下，名望已晋升为【${upgradedTitle}】！`);
         }, 500);
     }

     // 重置肉鸽闯关状态
     setDefeatedCount(0);
     setWaveIndex(0);
     setLeaderboardTeam(sortedLeaderboard);
     setSettlementInfo(null);
     setSelectedIndices([]);
     setRerollsLeft(4);
     setMilestonePopup(null);
     
     setRogueBuffs({
       str: 0, con: 0, int: 0, agi: 0, luk: 0,
       defUpEffect: 0, defUpDuration: 0,
       dodgeEffect: 0, dodgeDuration: 0,
       poisonDmgPct: 0, poisonDuration: 0,
       stunDuration: 0, stunChance: 0,
       silenceDuration: 0, silenceDamageAmp: 0,
       treasureBoostLevel: 0,
       heal60Count: 0,
     });

     // 初始化强制统一的 P1 属性 (5级起步)
     const myPlayer = { 
         ...player, 
          level: 5,
          attributes: { con: 20, str: 12, int: 6, agi: 18, luk: 6 },
          hp: 500 + (TREASURES_DB?.find(t => t.id === player.equippedTreasure)?.attrs?.hp || 0) + (player.equippedTreasureAttrs?.extraHp || 0),
          maxHp: 500 + (TREASURES_DB?.find(t => t.id === player.equippedTreasure)?.attrs?.hp || 0) + (player.equippedTreasureAttrs?.extraHp || 0),
         buffs: { dodge: 0, defUp: 0, shield: 0, revive: 0 },
         debuffs: { stun: 0, poison: 0, silence: 0, internalWound: 0, poisonPercent: 0.03 }
     };
     
     setP1(myPlayer);
     setEffects([]);
     setDamageNumbers([]);
     setCurrentBattleState({});
     setupNextEnemy(myPlayer, sortedLeaderboard, 0);
  };

  // 设置下一位挑战对手
  const setupNextEnemy = (currentP1, currentLeaderboard, totalDefeated) => {
     // 过滤出所有系统内置 NPC，并按照 NPC 等级升序排列，使挑战顺序严格从低等级到高等级递进
     const mockNPCs = currentLeaderboard.filter(p => p.isMock).sort((a, b) => (a.level || 0) - (b.level || 0));
     let rawEnemy = mockNPCs[totalDefeated];
     
     if (!rawEnemy) {
        // 缺少足够在线/真实玩家时，从底层倒序生成经典的强力武侠NPC
        const npcLevel = Math.min(100, 5 + totalDefeated * 1.6);
        const conVal = Math.floor(10 + totalDefeated * 1.5);
        const strVal = Math.floor(8 + totalDefeated * 1.2);
        const intVal = Math.floor(5 + totalDefeated * 0.8);
        const agiVal = Math.floor(12 + totalDefeated * 1.4);
        const lukVal = Math.floor(5 + totalDefeated * 0.5);
        const npcNames = [
          '独孤求败', '扫地僧', '张三丰', '东方不败', '王重阳', '风清扬', '无崖子', '天山童姥', '李秋水', '黄药师',
          '欧阳锋', '段智兴', '洪七公', '周伯通', '郭靖', '黄蓉', '杨过', '小龙女', '张无忌', '令狐冲',
          '任我行', '岳不群', '左冷禅', '林平之', '向问天', '谢逊', '殷天正', '韦一笑', '黛绮丝', '宋远桥',
          '俞莲舟', '俞岱岩', '张松溪', '张翠山', '殷梨亭', '莫声谷', '成昆', '段延庆', '叶二娘', '岳老三',
          '云中鹤', '慕容复', '鸠摩智', '游坦之', '丁春秋', '阿朱', '阿紫', '木婉清', '钟灵', '段誉',
          '虚竹', '乔峰', '慕容博', '萧远山', '枯荣大师', '本因', '本观', '本参', '本相', '江南七怪'
        ];
        const npcName = npcNames[npcNames.length - 1 - (totalDefeated % npcNames.length)] || `江湖神秘人 #${totalDefeated + 1}`;
        rawEnemy = {
           name: npcName,
           title: totalDefeated >= 50 ? '👑一代宗师' : totalDefeated >= 30 ? '⚔️名震江湖' : '🐎初出茅庐',
           level: Math.floor(npcLevel),
           hp: Math.floor(1000 + totalDefeated * 80),
           maxHp: Math.floor(1000 + totalDefeated * 80),
           attributes: { con: conVal, str: strVal, int: intVal, agi: agiVal, luk: lukVal },
           equippedSkills: {
              inner: 's5',
              outer: 's1',
              motion: 's4',
              ultimate: totalDefeated >= 30 ? 's_dianxue' : null
           },
           equippedTreasure: null
        };
     } else {
        // 确保对阵已注册玩家时，随着关卡数提升有最低限度的难度成长，防止瞬间秒杀
        const minLevel = Math.max(rawEnemy.level || 1, Math.floor(5 + totalDefeated * 1.5));
        const scaleFactor = minLevel / (rawEnemy.level || 1);
        if (scaleFactor > 1) {
           rawEnemy = {
              ...rawEnemy,
              level: minLevel,
              maxHp: Math.max(rawEnemy.maxHp || 100, Math.floor((rawEnemy.maxHp || 100) * scaleFactor)),
              attributes: {
                 con: Math.max(rawEnemy.attributes?.con || 10, Math.floor((rawEnemy.attributes?.con || 10) * scaleFactor)),
                 str: Math.max(rawEnemy.attributes?.str || 10, Math.floor((rawEnemy.attributes?.str || 10) * scaleFactor)),
                 int: Math.max(rawEnemy.attributes?.int || 10, Math.floor((rawEnemy.attributes?.int || 10) * scaleFactor)),
                 agi: Math.max(rawEnemy.attributes?.agi || 10, Math.floor((rawEnemy.attributes?.agi || 10) * scaleFactor)),
                 luk: Math.max(rawEnemy.attributes?.luk || 10, Math.floor((rawEnemy.attributes?.luk || 10) * scaleFactor))
              }
           };
        }
     }
     
     const enemy = { 
         ...rawEnemy,
         buffs: { dodge: 0, defUp: 0, shield: 0, revive: 0 },
         debuffs: { stun: 0, poison: 0, silence: 0, internalWound: 0, poisonPercent: 0.03 }
     };
     enemy.hp = enemy.maxHp;

     setP2(enemy);
     setP1(currentP1);
     setEffects([]);
     setDamageNumbers([]);
     setCurrentBattleState({});
     setEncounterState('battling');
     setLogs([`\n=== 第 ${totalDefeated + 1} 战：对阵 ${enemy.name} ===`]);
  };

  // 战斗回合主时钟循环 (1.2s 一回合)
  useEffect(() => {
    if (encounterState !== 'battling' || !p1 || !p2) return;
    if (p2.hp <= 0) return;

    // 防止回合死循环的力竭天劫强制结算保护
    if (logs.length >= 100) {
       const p1Pct = p1.hp / p1.maxHp;
       const p2Pct = p2.hp / p2.maxHp;
       if (p1Pct >= p2Pct) {
          const updatedP2 = { ...p2, hp: 0 };
          setP2(updatedP2);
          setLogs(prev => [...prev, `[力竭天劫] 激战过百回合不分胜负，进入天劫比拼内力！${p1.name} 气血占比更高，强行震碎了 ${p2.name} 的心脉！`]);
       } else {
          const updatedP1 = { ...p1, hp: 0 };
          setP1(updatedP1);
          setLogs(prev => [...prev, `[力竭天劫] 激战过百回合不分胜负，进入天劫比拼内力！${p2.name} 气血占比更高，一掌震碎了 ${p1.name} 的心脉！`]);
       }
       return;
    }

    const timer = setTimeout(() => {
      const p1Agi = (p1.attributes.agi || 0) + (p1.equippedTreasureAttrs?.extraAgi || 0);
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
      const dTreasure = getTreasure(defender.equippedTreasure);

      const checkImmune = (playerObj, tObj, debuffType) => {
         if (tObj?.effect === 'jiMie') return true; 
         if (tObj?.effect === 'ruanWei' && (debuffType==='stun'||debuffType==='poison')) return true;
         if (tObj?.effect === 'jinShe' && debuffType==='poison') return true;
         return false;
      };

      let logPrefix = "";
      if (logs.length === 1) { 
         const p1IsAttacker = isP1Turn;
         const tBoostAttacker = p1IsAttacker ? rogueBuffs.treasureBoostLevel : 0;
         const tBoostDefender = p1IsAttacker ? 0 : rogueBuffs.treasureBoostLevel;

         if (aTreasure?.effect === 'ningShen') {
             const shieldVal = Math.floor(attacker.maxHp * (0.05 + 0.05 * tBoostAttacker));
             attacker.buffs.shield += shieldVal;
             logPrefix += `[开局] ${attacker.name} 的【木质佛珠】泛起佛光，获得了 ${shieldVal} 点护盾！\n`;
         }
         if (dTreasure?.effect === 'ningShen') {
             const shieldVal = Math.floor(defender.maxHp * (0.05 + 0.05 * tBoostDefender));
             defender.buffs.shield += shieldVal;
             logPrefix += `[开局] ${defender.name} 的【木质佛珠】泛起佛光，获得了 ${shieldVal} 点护盾！\n`;
         }
         if (aTreasure?.effect === 'shengHuo' && !checkImmune(defender, dTreasure, 'silence')) {
             const silDur = 2 + (p1IsAttacker ? rogueBuffs.silenceDuration : 0);
             defender.debuffs.silence = silDur;
             logPrefix += `[开局] ${attacker.name} 亮出【圣火令】，发出无上威压，封锁了 ${defender.name} ${silDur} 回合！\n`;
         }
         if (dTreasure?.effect === 'shengHuo' && !checkImmune(attacker, aTreasure, 'silence')) {
             const silDur = 2 + (p1IsAttacker ? 0 : rogueBuffs.silenceDuration);
             attacker.debuffs.silence = silDur;
             logPrefix += `[开局] ${defender.name} 亮出【圣火令】，发出无上威压，封锁了 ${attacker.name} ${silDur} 回合！\n`;
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
      if (attacker.hp > 0) {
         if (attacker.debuffs.stun > 0) {
            attacker.debuffs.stun--;
            actionLog = `[系统] ${attacker.name} 处于【晕眩】中，只能呆立当场，无法动弹！`;
         } else if (attacker.dailyDebuffs?.includes('心魔劫') && Math.random() < 0.15) {
            actionLog = `[心魔发作] ${attacker.name} 突然心神失守，招式走形破绽大开，错失了良机！`;
         } else {
            const eq = attacker.equippedSkills || {};
            let skillIds = [eq.inner, eq.outer, eq.motion, eq.ultimate].filter(Boolean);
            if (attacker.debuffs.silence > 0) {
                skillIds = ['s1']; attacker.debuffs.silence--;
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
            
            const pAtk = attacker.attributes.str * 2 + attacker.level * 5;
            const dDefBase = defender.attributes.con * 2 + defender.level * 2 + (dAttrs.extraDef || 0);
            const aMod = 1 + attacker.level * 0.05;
            const mastery = getSkillMastery(skill.id, attacker.skillMastery || {});
            const adjustedSkillPwr = skill.power * aMod * (1 + mastery.bonus);

            if (skill.id === 's5' || skill.id === 's_yijin') {
               attacker.buffs.defUp = 3 + (isP1Turn ? rogueBuffs.defUpDuration : 0);
               actionLog = `${attacker.name} 催动【${skill.name}】，真气护体，防御力大增！`;
               if (skill.id === 's_yijin' && attacker.debuffs.poison > 0) {
                   attacker.debuffs.poison = 0;
                   actionLog += ` 易筋经内力激荡，体内剧毒被猛然逼出！`;
               }
            } else if (skill.id === 's4' || skill.id === 's_tiyun') { 
               attacker.buffs.dodge = 3 + (isP1Turn ? rogueBuffs.dodgeDuration : 0);
               actionLog = `${attacker.name} 施展【${skill.name}】，身形变幻莫测，闪避率大幅提升！`;
            } else if (skill.id === 's_shenxing') {
               attacker.buffs.dodge = 99;
               actionLog = `${attacker.name} 施展出【${skill.name}】，犹如鬼魅不可捉摸，难以命中！`;
            } else if (skill.id === 's_shengxin') {
               attacker.buffs.revive = 1; actionLog = `${attacker.name} 运转【${skill.name}】，生死二气护住心脉！`;
            } else if (skill.type === 'heal') {
               const healAmt = Math.floor(adjustedSkillPwr + attacker.attributes.int * 2 + 30);
               attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmt);
               actionLog = `${attacker.name} 运转内力使出【${skill.name}】，恢复了 ${healAmt} 点气血！`;
            } else if (skill.type === 'buff' || skill.type === 'motion' || skill.power === 0) {
               attacker.buffs.dodge = 2; actionLog = `${attacker.name} 施展【${skill.name}】，气势如虹！`;
            } else {
               const defDodgeBoost = (!isP1Turn) ? rogueBuffs.dodgeEffect : 0;
               const defenderDodge = (dTreasure?.attrs?.dodge || 0) + (dAttrs.extraDodge || 0);
                const baseDodgeChance = ((defender.attributes.agi / (defender.attributes.agi + 120)) * 0.75) + defenderDodge * 0.01;
            let isDodge = aTreasure?.effect !== 'xuanTie' && defender.debuffs.stun === 0 && (Math.random() < baseDodgeChance || (defender.buffs.dodge > 0 ? Math.random() < (defender.buffs.dodge === 99 ? 0.90 : 0.45 + defDodgeBoost) : false));
               
               if (isDodge) {
                  actionLog = `${attacker.name} 施展【${skill.name}】，却被 ${defender.name} 巧妙躲开！`;
                  if (!isP1Turn && rogueBuffs.dodgeDuration > 0 && Math.random() < 0.20) {
                     const counterDmg = Math.max(1, Math.floor((p1.attributes.str * 2 + p1.level * 5) * 0.5));
                     attacker.hp = Math.max(0, attacker.hp - counterDmg);
                     actionLog += `\n[神行反击] ${p1.name} 乘虚而入反击一招，对 ${attacker.name} 造成了 ${counterDmg} 点伤害！`;
                  }
               } else {
                  const defMultiplier = (!isP1Turn && defender.buffs.defUp > 0) ? (2 + rogueBuffs.defUpEffect) : (defender.buffs.defUp > 0 ? 2 : 1);
                  let finalDef = dDefBase * 1 * defMultiplier;
                  let dmg = Math.floor(pAtk + adjustedSkillPwr - finalDef);
                  
                  const tBoostA = isP1Turn ? rogueBuffs.treasureBoostLevel : 0;
                  const tBoostD = isP1Turn ? 0 : rogueBuffs.treasureBoostLevel;

                  if (aTreasure?.effect === 'poShang') dmg += (50 + 40 * tBoostA); 
                  if (aTreasure?.effect === 'yiTian') dmg = Math.floor(dmg * (1.20 + 0.05 * tBoostA));
                  if (aTreasure?.effect === 'tuLong' && (attacker.hp / attacker.maxHp) < 0.4) dmg = Math.floor(dmg * (1.50 + 0.15 * tBoostA));
                  if (aTreasure?.effect === 'shengHuo') dmg += Math.floor(defender.hp * (0.05 + 0.02 * tBoostA));
                  if (!aTreasure && isP1Turn) dmg = Math.floor(dmg * (1.0 + 0.10 * tBoostA));

                  if (dTreasure?.effect === 'qingQiao') dmg -= (30 + 20 * tBoostD);
                  if (dTreasure?.effect === 'tuLong' && (defender.hp / defender.maxHp) < 0.4) dmg = Math.floor(dmg * 0.8);
                  dmg = Math.max(1, dmg);

                  if (aTreasure?.effect === 'jiMie' && Math.random() < (0.05 + 0.02 * tBoostA)) {
                      dmg = Math.floor(defender.hp * 0.5);
                      actionLog = `[寂灭] ${attacker.name} 的【绝世好剑】闪烁黑芒，直接斩去 ${defender.name} ${dmg} 气血！ `;
                  }

                  if (defender.buffs.shield > 0) {
                      if (defender.buffs.shield >= dmg) { defender.buffs.shield -= dmg; dmg = 0; } 
                      else { dmg -= defender.buffs.shield; defender.buffs.shield = 0; }
                  }
                  defender.hp = Math.max(0, defender.hp - dmg);
                  
                  if (dmg > 0 && aTreasure?.effect === 'huiChun') attacker.hp = Math.min(attacker.maxHp, attacker.hp + Math.floor(attacker.maxHp * (0.02 + 0.015 * tBoostA)));
                  if (dmg > 0 && aTreasure?.effect === 'yiTian') attacker.hp = Math.min(attacker.maxHp, Math.floor(attacker.hp + dmg * (0.15 + 0.10 * tBoostA)));

                  if (!actionLog.includes('[寂灭]')) {
                     actionLog = `${attacker.name} 使出【${skill.name}】，对 ${defender.name} 造成了 ${dmg} 点伤害！`;
                  }

                  if (defender.debuffs.silence > 0 && !isP1Turn && rogueBuffs.silenceDamageAmp > 0) {
                     const ampDmg = Math.floor(dmg * rogueBuffs.silenceDamageAmp);
                     defender.hp = Math.max(0, defender.hp - ampDmg);
                     actionLog += ` (封印易伤 +${ampDmg})`;
                  }

                  if (dmg > 0 && dTreasure?.effect === 'ruanWei') {
                     const rRatio = 0.15 + 0.10 * tBoostD;
                     const rDmg = Math.floor(dmg * rRatio); attacker.hp -= rDmg;
                     actionLog += `\n[软猬荆棘] 尖刺反伤，${attacker.name} 受到了 ${rDmg} 点伤害！`;
                  }
                  if (aTreasure?.effect === 'jinShe' && defender.hp > 0 && Math.random() <= (0.20 + 0.10 * tBoostA)) {
                      const comboDmg = Math.max(1, Math.floor(dmg * 0.5)); defender.hp = Math.max(0, defender.hp - comboDmg);
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
                         defender.debuffs.poisonPercent = 0.07 + (isP1Turn ? rogueBuffs.poisonDmgPct : 0);
                         actionLog += ` \n[万毒] ${defender.name} 身中奇毒，骨髓俱损！`;
                     }
                     if (skill.id === 's_shihou' && !checkImmune(defender, dTreasure, 'stun')) {
                         const stunChanceVal = 0.6 + (isP1Turn ? rogueBuffs.stunChance : 0);
                         if (Math.random() <= stunChanceVal) {
                            defender.debuffs.stun = 1 + (isP1Turn ? rogueBuffs.stunDuration : 0);
                            actionLog += ` \n[狮吼] 震耳欲聋，${defender.name} 被当场震晕 ${defender.debuffs.stun} 回合！`;
                         }
                     }
                     if (skill.id === 's_dianxue' && !checkImmune(defender, dTreasure, 'silence')) {
                         if (Math.random() <= 0.8) {
                            defender.debuffs.silence = 2 + (isP1Turn ? rogueBuffs.silenceDuration : 0);
                            actionLog += ` \n[点穴] ${defender.name} 要穴被封，无法动用武学 ${defender.debuffs.silence} 回合！`;
                         }
                     }
                     if (skill.id === 's_liumai' && Math.random() <= 0.5 && !checkImmune(defender, dTreasure, 'internalWound')) {
                         defender.debuffs.internalWound = 2; actionLog += ` \n[六脉] 无形剑气震伤内腑，${defender.name} 经脉受损！`;
                     }

                     if (aTreasure?.effect === 'dianXue' && !checkImmune(defender, dTreasure, 'silence')) {
                        const silenceChance = 0.10 + 0.08 * tBoostA;
                        if (Math.random() <= silenceChance) {
                           defender.debuffs.silence = 1 + (isP1Turn ? rogueBuffs.silenceDuration : 0);
                           actionLog += ` \n[宝具] ${defender.name} 被判官笔点中要穴 ${defender.debuffs.silence} 回合！`;
                        }
                     }
                      if (aTreasure?.effect === 'juDu' && !checkImmune(defender, dTreasure, 'poison')) {
                        const poisonChance = 0.15 + 0.10 * tBoostA;
                        if (Math.random() <= poisonChance) {
                           defender.debuffs.poison = 3 + (isP1Turn ? rogueBuffs.poisonDuration : 0);
                           defender.debuffs.poisonPercent = 0.03 + (isP1Turn ? rogueBuffs.poisonDmgPct : 0);
                           actionLog += ` \n[宝具] 冰魄银针刺入，${defender.name} 身中剧毒！`;
                        }
                     }
                     if (aTreasure?.effect === 'daGou' && !checkImmune(defender, dTreasure, 'stun')) {
                        const stunChance = (0.15 + 0.10 * tBoostA) + (isP1Turn ? rogueBuffs.stunChance : 0);
                        if (Math.random() <= stunChance) {
                           defender.debuffs.stun = 1 + (isP1Turn ? rogueBuffs.stunDuration : 0);
                           actionLog += ` \n[宝具] 打狗棒击中后脑，${defender.name} 当场晕眩 ${defender.debuffs.stun} 回合！`;
                        }
                     }
                     if (aTreasure?.effect === 'xuanTie' && Math.random() <= (0.20 + 0.10 * tBoostA) && !checkImmune(defender, dTreasure, 'internalWound')) {
                         defender.debuffs.internalWound = 2;
                         actionLog += ` \n[宝具] 玄铁重剑霸道无比，震得 ${defender.name} 吐血内伤！`;
                     }

                     // 额外判定洗炼的中毒率和击晕率词条
                     if (aAttrs.poisonRate > 0 && Math.random() <= (aAttrs.poisonRate * 0.01) && !checkImmune(defender, dTreasure, 'poison')) {
                        if (defender.debuffs.poison < 3) {
                           defender.debuffs.poison = 3 + (isP1Turn ? rogueBuffs.poisonDuration : 0);
                           defender.debuffs.poisonPercent = 0.03 + (isP1Turn ? rogueBuffs.poisonDmgPct : 0);
                           actionLog += ` \n[注灵剧毒] 附魔剧毒生效，${defender.name} 陷入毒发！`;
                        }
                     }
                     if (aAttrs.stunRate > 0 && Math.random() <= (aAttrs.stunRate * 0.01) && !checkImmune(defender, dTreasure, 'stun')) {
                        if (defender.debuffs.stun < 1) {
                           defender.debuffs.stun = 1 + (isP1Turn ? rogueBuffs.stunDuration : 0);
                           actionLog += ` \n[注灵震慑] 附魔晕慑生效，${defender.name} 被震慑防守！`;
                        }
                     }
                  }
               }
            }
         }
      }

      if (attacker.buffs.dodge > 0) attacker.buffs.dodge--;
      if (attacker.buffs.defUp > 0) attacker.buffs.defUp--;

      if (attacker.hp <= 0 && aTreasure?.effect === 'niePan' && !attacker.hasRevived) {
          attacker.hp = Math.floor(attacker.maxHp * (0.50 + 0.15 * tBoostA));
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
          defender.hp = Math.floor(defender.maxHp * (0.50 + 0.15 * tBoostD));
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
      setLogs(prev => [...prev, finalLog]);

      if (isP1Turn) {
         setP1(attacker);
         setP2(defender);
      } else {
         setP1(defender);
         setP2(attacker);
      }

      if (attacker.hp <= 0 || defender.hp <= 0) {
            const p1Won = isP1Turn ? defender.hp <= 0 : attacker.hp <= 0;
            let finalP1 = isP1Turn ? attacker : defender;

            if (p1Won) {
               const nextDefeatedCount = defeatedCount + 1;
               setDefeatedCount(nextDefeatedCount);
               const equippedSkillIds = Object.values(player.equippedSkills || {}).filter(Boolean);
               if (equippedSkillIds.length > 0) {
                  incrementSkillMastery(equippedSkillIds);
               }

               // 升级玩家等级 (+0.9 级/关) 并等额提升生命上限及当前气血（递减增长曲线）
               const newLevel = 5 + nextDefeatedCount * 0.9;
               const oldMaxHp = finalP1.maxHp;
               const progress = Math.min(nextDefeatedCount / 60, 1);
               const tObj = TREASURES_DB?.find(t => t.id === player.equippedTreasure);
               const extraHpFromTreasure = (tObj?.attrs?.hp || 0) + (player.equippedTreasureAttrs?.extraHp || 0);
               const newMaxHp = Math.floor(500 + 1500 * Math.sqrt(progress) + (finalP1.attributes.con - 20) * 5 + extraHpFromTreasure);
               finalP1.level = newLevel;
               finalP1.maxHp = newMaxHp;
               finalP1.hp = Math.min(newMaxHp, finalP1.hp);
               setP1(finalP1);

               if ([6, 12, 30, 42, 48, 51, 54, 57, 60].includes(nextDefeatedCount)) {
                  setMilestonePopup(nextDefeatedCount);
                  setTimeout(() => setMilestonePopup(null), 3000);
               }

               if (nextDefeatedCount >= 60) {
                  handleRogueSettlement(nextDefeatedCount);
               } else if (nextDefeatedCount % 3 === 0) {
                  setEncounterState('buffSelection');
                  const choices = generateBuffChoices(player.equippedTreasure, nextDefeatedCount <= 9);
                  setSelectedIndices([]);
                  setBuffChoices(choices);
                  setLogs(prev => [...prev, `\n战胜了 ${defender.name}！通关本波次挑战！`]);
                  SoundManager.play('sfx_success');
               } else {
                  setEncounterState('transitioning');
                  setLogs(prev => [...prev, `\n战胜了 ${defender.name}！进入下一战...`]);
                  SoundManager.play('sfx_success');
                  setTimeout(() => setupNextEnemy(finalP1, leaderboardTeam, nextDefeatedCount), 2000);
               }
            } else {
               setLogs(prev => [...prev, `\n====== 战败 ====== \n不敌对手，挑战结束。一共击败了 ${defeatedCount} 位对手。`]);
               setEncounterState('lose_settling');
               SoundManager.play('sfx_fail');
            }
         }

    }, 1200);
    return () => clearTimeout(timer);
  }, [encounterState, p1, p2, logs.length, defeatedCount, leaderboardTeam, rogueBuffs]);

  // 解析日志触发打击音效与动画
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

      if (lastLog.includes('造成了') || lastLog.includes('斩去') || lastLog.includes('伤害') || lastLog.includes('反伤') || lastLog.includes('损失') || lastLog.includes('造成') || lastLog.includes('追击') || lastLog.includes('削去') || lastLog.includes('丧失') || lastLog.includes('毒发')) {
        const damageMatch = lastLog.match(/(\d+)\s*(点|点伤害|气血|伤害)?/);
        if (damageMatch) {
          const damage = parseInt(damageMatch[1]);
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
          }

          let delay = 0;
          if (effectType === 'ultimateBurst') {
            delay = 580;
          } else if (effectType === 'fistPunch') {
            delay = 400;
          }

          const triggerDamage = (pos) => {
            const isCritLog = lastLog.includes('暴击') || lastLog.includes('重创');
            const isPoisonLog = lastLog.includes('毒发') || lastLog.includes('身中奇毒') || lastLog.includes('剧毒生效');
            const type = isCritLog ? 'critical' : (isPoisonLog ? 'poison' : 'damage');
            addDamageNumber(damage, pos, false, type);
          };

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
            if (lastLog.startsWith(p1Name) || lastLog.includes(p1Name + ' 使出') || lastLog.includes(p1Name + ' 施展')) {
              attacker = p1Name;
              lastHit = p2Name;
              addEffect(effectType, 'right', damage > 100 ? 2 : 1, matchedSkillName, matchedSkillId);
              if (delay > 0) {
                setTimeout(() => triggerDamage('right'), delay);
              } else {
                triggerDamage('right');
              }
            } else if (lastLog.startsWith(p2Name) || lastLog.includes(p2Name + ' 使出') || lastLog.includes(p2Name + ' 施展')) {
              attacker = p2Name;
              lastHit = p1Name;
              addEffect(effectType, 'left', damage > 100 ? 2 : 1, matchedSkillName, matchedSkillId);
              if (delay > 0) {
                setTimeout(() => triggerDamage('left'), delay);
              } else {
                triggerDamage('left');
              }
            }
          }
        }
      }

      const getTargetPos = (logText, keywords = null) => {
        const lines = logText.split('\n');
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
        for (let i = lines.length - 1; i >= 0; i--) {
          if (p1Name && lines[i].includes(p1Name)) return 'left';
          if (p2Name && lines[i].includes(p2Name)) return 'right';
        }
        if (p1Name && logText.includes(p1Name)) return 'left';
        if (p2Name && logText.includes(p2Name)) return 'right';
        return 'center';
      };

      if (lastLog.includes('躲开') || lastLog.includes('闪避') || lastLog.includes('闪开') || lastLog.includes('被闪开')) {
        let pos = 'center';
        if (lastLog.includes('被 ' + p1Name) || lastLog.includes('被' + p1Name + '闪开') || (lastLog.includes(p1Name + ' 的【') && lastLog.includes('被闪开'))) {
          dodger = p1Name;
          attacker = p2Name;
          pos = 'left';
        } else {
          dodger = p2Name;
          attacker = p1Name;
          pos = 'right';
        }
        addEffect('dodge', pos);
        SoundManager.play('sfx_dodge');
      }

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
      if (lastLog.includes('伤功') || lastLog.includes('晕') || lastLog.includes('震晕') || lastLog.includes('眩晕')) {
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

    const timer = setTimeout(() => {
      setCurrentBattleState({});
    }, 800);
    return () => clearTimeout(timer);
  }, [logs]);

  // 同步计算模拟剩余战斗
  const simulateRestOfBattle = (startP1, startP2, startLogs) => {
     let tempP1 = { ...startP1, attributes: { ...startP1.attributes }, buffs: { ...startP1.buffs }, debuffs: { ...startP1.debuffs } };
     let tempP2 = { ...startP2, attributes: { ...startP2.attributes }, buffs: { ...startP2.buffs }, debuffs: { ...startP2.debuffs } };
     let tempLogs = [...startLogs];

     const getTreasure = (id) => TREASURES_DB?.find(t => t.id === id);

     const checkImmune = (playerObj, tObj, debuffType) => {
        if (tObj?.effect === 'jiMie') return true; 
        if (tObj?.effect === 'ruanWei' && (debuffType === 'stun' || debuffType === 'poison')) return true;
        if (tObj?.effect === 'jinShe' && debuffType === 'poison') return true;
        return false;
     };

     let loopCount = 0;
     while (tempP1.hp > 0 && tempP2.hp > 0) {
        loopCount++;
        if (loopCount >= 100) {
           const p1Pct = tempP1.hp / tempP1.maxHp;
           const p2Pct = tempP2.hp / tempP2.maxHp;
           if (p1Pct >= p2Pct) {
              tempP2.hp = 0;
              tempLogs.push(`[力竭天劫] 激战过百回合不分胜负，进入天劫比拼内力！${tempP1.name} 气血占比更高，强行震碎了 ${tempP2.name} 的心脉！`);
           } else {
              tempP1.hp = 0;
              tempLogs.push(`[力竭天劫] 激战过百回合不分胜负，进入天劫比拼内力！${tempP2.name} 气血占比更高，一掌震碎了 ${tempP1.name} 的心脉！`);
           }
           break;
        }
         const tempP1Agi = (tempP1.attributes.agi || 0) + (tempP1.equippedTreasureAttrs?.extraAgi || 0);
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
         defender.attributes.luk = (defender.attributes.luk || 0) + (dAttrs.extraLuk || 0);

        const aTreasure = getTreasure(attacker.equippedTreasure);
        const dTreasure = getTreasure(defender.equippedTreasure);

        let logPrefix = "";
        if (tempLogs.length === 1) { 
           const p1IsAttacker = isP1Turn;
           const tBoostAttacker = p1IsAttacker ? rogueBuffs.treasureBoostLevel : 0;
           const tBoostDefender = p1IsAttacker ? 0 : rogueBuffs.treasureBoostLevel;
           
           if (aTreasure?.effect === 'ningShen') {
               const shieldVal = Math.floor(attacker.maxHp * (0.05 + 0.05 * tBoostAttacker));
               attacker.buffs.shield += shieldVal;
               logPrefix += `[开局] ${attacker.name} 的【木质佛珠】泛起佛光，获得了 ${shieldVal} 点护盾！\n`;
           }
           if (dTreasure?.effect === 'ningShen') {
               const shieldVal = Math.floor(defender.maxHp * (0.05 + 0.05 * tBoostDefender));
               defender.buffs.shield += shieldVal;
               logPrefix += `[开局] ${defender.name} 的【木质佛珠】泛起佛光，获得了 ${shieldVal} 点护盾！\n`;
           }
           if (aTreasure?.effect === 'shengHuo' && !checkImmune(defender, dTreasure, 'silence')) {
               const silDur = 2 + (p1IsAttacker ? rogueBuffs.silenceDuration : 0);
               defender.debuffs.silence = silDur;
               logPrefix += `[开局] ${attacker.name} 亮出【圣火令】，发出无上威压，封锁了 ${defender.name} ${silDur} 回合！\n`;
           }
           if (dTreasure?.effect === 'shengHuo' && !checkImmune(attacker, aTreasure, 'silence')) {
               const silDur = 2 + (p1IsAttacker ? 0 : rogueBuffs.silenceDuration);
               attacker.debuffs.silence = silDur;
               logPrefix += `[开局] ${defender.name} 亮出【圣火令】，发出无上威压，封锁了 ${attacker.name} ${silDur} 回合！\n`;
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
        if (attacker.hp > 0) {
           if (attacker.debuffs.stun > 0) {
              attacker.debuffs.stun--;
              actionLog = `[系统] ${attacker.name} 处于【晕眩】中，只能呆立当场，无法动弹！`;
           } else {
              const eq = attacker.equippedSkills || {};
              let skillIds = [eq.inner, eq.outer, eq.motion, eq.ultimate].filter(Boolean);
              if (attacker.debuffs.silence > 0) {
                  skillIds = ['s1']; attacker.debuffs.silence--;
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
              
              const pAtk = attacker.attributes.str * 2 + attacker.level * 5;
              const dDefBase = defender.attributes.con * 2 + defender.level * 2 + (dAttrs.extraDef || 0);
              const aMod = 1 + attacker.level * 0.05;
              const mastery = getSkillMastery(skill.id, attacker.skillMastery || {});
              const adjustedSkillPwr = skill.power * aMod * (1 + mastery.bonus);

              if (skill.id === 's5' || skill.id === 's_yijin') {
                 attacker.buffs.defUp = 3 + (isP1Turn ? rogueBuffs.defUpDuration : 0);
                 actionLog = `${attacker.name} 催动【${skill.name}】，真气护体，防御力大增！`;
                 if (skill.id === 's_yijin' && attacker.debuffs.poison > 0) {
                     attacker.debuffs.poison = 0;
                     actionLog += ` 易筋经内力激荡，体内剧毒被猛然逼出！`;
                 }
              } else if (skill.id === 's4' || skill.id === 's_tiyun') { 
                 attacker.buffs.dodge = 3 + (isP1Turn ? rogueBuffs.dodgeDuration : 0);
                 actionLog = `${attacker.name} 施展【${skill.name}】，身形变幻莫测，闪避率大幅提升！`;
              } else if (skill.id === 's_shenxing') {
                 attacker.buffs.dodge = 99;
                 actionLog = `${attacker.name} 施展出【${skill.name}】，犹如鬼魅不可捉摸，难以命中！`;
              } else if (skill.id === 's_shengxin') {
                 attacker.buffs.revive = 1; actionLog = `${attacker.name} 运转【${skill.name}】，生死二气护住心脉！`;
              } else if (skill.type === 'heal') {
                 const healAmt = Math.floor(adjustedSkillPwr + attacker.attributes.int * 2 + 30);
                 attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmt);
                 actionLog = `${attacker.name} 运转内力使出【${skill.name}】，恢复了 ${healAmt} 点气血！`;
              } else if (skill.type === 'buff' || skill.type === 'motion' || skill.power === 0) {
                 attacker.buffs.dodge = 2; actionLog = `${attacker.name} 施展【${skill.name}】，气势如虹！`;
              } else {
                 const defDodgeBoost = (!isP1Turn) ? rogueBuffs.dodgeEffect : 0;
                 const defenderDodge = (dTreasure?.attrs?.dodge || 0) + (dAttrs.extraDodge || 0);
                  const baseDodgeChance = ((defender.attributes.agi / (defender.attributes.agi + 120)) * 0.75) + defenderDodge * 0.01;
                 let isDodge = aTreasure?.effect !== 'xuanTie' && aTreasure?.effect !== 'xuanTieAwaked' && defender.debuffs.stun === 0 && (Math.random() < baseDodgeChance || (defender.buffs.dodge > 0 ? Math.random() < (defender.buffs.dodge === 99 ? 0.90 : 0.45 + defDodgeBoost) : false));
                 
                 if (isDodge) {
                    actionLog = `${attacker.name} 施展【${skill.name}】，却被 ${defender.name} 巧妙躲开！`;
                    if (dTreasure?.effect === 'yuXiao' && Math.random() <= 0.40 && attacker.debuffs.silence <= 0) {
                       attacker.debuffs.silence = 1;
                       actionLog += ` \n[玉箫封穴] ${defender.name} 身形闪过顺势横箫，箫音回荡，封印了 ${attacker.name} 的气血经脉！`;
                    }
                    if (!isP1Turn && rogueBuffs.dodgeDuration > 0 && Math.random() < 0.20) {
                       const counterDmg = Math.max(1, Math.floor((tempP1.attributes.str * 2 + tempP1.level * 5) * 0.5));
                       tempP2.hp = Math.max(0, tempP2.hp - counterDmg);
                       actionLog += `\n[神行反击] ${tempP1.name} 乘虚而入反击一招，对 ${tempP2.name} 造成了 ${counterDmg} 点伤害！`;
                    }
                 } else {
                    const defMultiplier = defender.buffs.defUp > 0
                       ? (!isP1Turn ? (1.0 + rogueBuffs.defUpEffect) : 1.0)
                       : 0.5;
                    let finalDef = dDefBase * defMultiplier;
                    let dmg = Math.floor(pAtk + adjustedSkillPwr - finalDef);
                    
                    // PVE 暴击判定
                    let critText = '';
                    const attackerCrit = (aTreasure?.attrs?.crit || 0) + (aAttrs.extraCrit || 0);
                    const baseCritChance = ((attacker.attributes.luk / (attacker.attributes.luk + 150)) * 0.2) + attackerCrit * 0.01;
                    const isCrit = Math.random() < baseCritChance;
                    if (isCrit) {
                       dmg = Math.floor(dmg * 1.5);
                       critText = '（暴击）';
                    }
                    
                    const tBoostA = isP1Turn ? rogueBuffs.treasureBoostLevel : 0;
                    const tBoostD = isP1Turn ? 0 : rogueBuffs.treasureBoostLevel;

                    if (aTreasure?.effect === 'poShang') dmg += (50 + 40 * tBoostA); 
                    if (aTreasure?.effect === 'yiTian') dmg = Math.floor(dmg * (1.20 + 0.05 * tBoostA));
                    if (aTreasure?.effect === 'tuLong' && (attacker.hp / attacker.maxHp) < 0.4) dmg = Math.floor(dmg * (1.50 + 0.15 * tBoostA));
                    if (aTreasure?.effect === 'shengHuo') dmg += Math.floor(defender.hp * (0.05 + 0.02 * tBoostA));
                    if (aTreasure?.effect === 'daGouAwaked' && (attacker.hp / attacker.maxHp) < 0.35) dmg = Math.floor(dmg * 1.5);
                    if (!aTreasure && isP1Turn) dmg = Math.floor(dmg * (1.0 + 0.10 * tBoostA));

                    if (dTreasure?.effect === 'qingQiao') dmg -= (30 + 20 * tBoostD);
                    if (dTreasure?.effect === 'tuLong' && (defender.hp / defender.maxHp) < 0.4) dmg = Math.floor(dmg * 0.8);
                    dmg = Math.max(1, dmg);

                    if (aTreasure?.effect === 'jiMie' && Math.random() < (0.05 + 0.02 * tBoostA)) {
                        dmg = Math.floor(defender.hp * 0.5);
                        actionLog = `[寂灭] ${attacker.name} 的【绝世好剑】闪烁黑芒，直接斩去 ${defender.name} ${dmg} 气血！ `;
                    }
                    
                    if (aTreasure?.effect === 'xuanTie' && Math.random() <= (0.20 + 0.10 * tBoostA) && !checkImmune(defender, dTreasure, 'internalWound')) {
                        defender.debuffs.internalWound = 2;
                        actionLog += ` \n[宝具] 玄铁重剑霸道无比，震得 ${defender.name} 吐血内伤！`;
                    }

                    // 额外判定洗炼的中毒率和击晕率词条
                    if (aAttrs.poisonRate > 0 && Math.random() <= (aAttrs.poisonRate * 0.01) && !checkImmune(defender, dTreasure, 'poison')) {
                       if (defender.debuffs.poison < 3) {
                          defender.debuffs.poison = 3 + (isP1Turn ? rogueBuffs.poisonDuration : 0);
                          defender.debuffs.poisonPercent = 0.03 + (isP1Turn ? rogueBuffs.poisonDmgPct : 0);
                          actionLog += ` \n[注灵剧毒] 附魔剧毒生效，${defender.name} 陷入毒发！`;
                       }
                    }
                    if (aAttrs.stunRate > 0 && Math.random() <= (aAttrs.stunRate * 0.01) && !checkImmune(defender, dTreasure, 'stun')) {
                       if (defender.debuffs.stun < 1) {
                          defender.debuffs.stun = 1 + (isP1Turn ? rogueBuffs.stunDuration : 0);
                          actionLog += ` \n[注灵震慑] 附魔晕慑生效，${defender.name} 被震慑防守！`;
                       }
                    }

                     if (defender.buffs.shield > 0 && aTreasure?.effect !== 'xuanTieAwaked') {
                        if (defender.buffs.shield >= dmg) { defender.buffs.shield -= dmg; dmg = 0; } 
                        else { dmg -= defender.buffs.shield; defender.buffs.shield = 0; }
                    }
                    defender.hp = Math.max(0, defender.hp - dmg);
                    
                    if (dmg > 0 && aTreasure?.effect === 'huiChun') attacker.hp = Math.min(attacker.maxHp, attacker.hp + Math.floor(attacker.maxHp * (0.02 + 0.015 * tBoostA)));
                    if (dmg > 0 && aTreasure?.effect === 'yiTian') attacker.hp = Math.min(attacker.maxHp, Math.floor(attacker.hp + dmg * (0.15 + 0.10 * tBoostA)));

                    if (!actionLog.includes('[寂灭]')) {
                        actionLog = `${attacker.name} 使出【${skill.name}】，对 ${defender.name} 造成了 ${dmg} 点伤害！${critText}`;
                    }

                    if (defender.debuffs.silence > 0 && !isP1Turn && rogueBuffs.silenceDamageAmp > 0) {
                       const ampDmg = Math.floor(dmg * rogueBuffs.silenceDamageAmp);
                       defender.hp = Math.max(0, defender.hp - ampDmg);
                       actionLog += ` (封印易伤 +${ampDmg})`;
                    }

                    if (dmg > 0 && dTreasure?.effect === 'ruanWei') {
                       const rRatio = 0.15 + 0.10 * tBoostD;
                       const rDmg = Math.floor(dmg * rRatio); attacker.hp -= rDmg;
                       actionLog += `\n[软猬荆棘] 尖刺反伤，${attacker.name} 受到了 ${rDmg} 点伤害！`;
                    }
                    if (aTreasure?.effect === 'jinShe' && defender.hp > 0 && Math.random() <= (0.20 + 0.10 * tBoostA)) {
                        const comboDmg = Math.max(1, Math.floor(dmg * 0.5)); defender.hp = Math.max(0, defender.hp - comboDmg);
                        actionLog += `\n[金蛇出洞] ${attacker.name} 挥出虚影追加一击，造成 ${comboDmg} 伤害！`;
                    }

                    if (dmg > 0 && skill.id === 's_xixing') {
                         const drainAmt = Math.floor(dmg * 0.8);
                         attacker.hp = Math.min(attacker.maxHp, attacker.hp + drainAmt);
                        actionLog += ` \n[吸星大法] ${attacker.name} 夺取了 ${drainAmt} 点气血化为己用！`;
                    }

                     // === 荒古传承神兵 PVE 特性触发 ===
                     if (dmg > 0 && aTreasure?.effect === 'xiuHua' && defender.hp > 0) {
                         const extraTrueDmg = Math.min(400, Math.floor(defender.hp * 0.10));
                         defender.hp = Math.max(0, defender.hp - extraTrueDmg);
                         actionLog += ` \n[金针真伤] 【乾坤绣花针】透甲见血，额外对 ${defender.name} 造成了 ${extraTrueDmg} 点穿透伤害！`;
                     }

                     if (dmg > 0 && dTreasure?.effect === 'zhenWu' && defender.hp > 0 && Math.random() <= 0.25) {
                         const recoverAmt = Math.floor(defender.maxHp * 0.08);
                         defender.hp = Math.min(defender.maxHp, defender.hp + recoverAmt);
                         actionLog += ` \n[真武护体] 【真武圣剑】太极灵光逆转伤势，为 ${defender.name} 恢复了 ${recoverAmt} 点气血！`;
                     }

                     if (defender.hp > 0) {
                        if (aTreasure?.effect === 'yuXiao' && Math.random() <= 0.40 && !checkImmune(defender, dTreasure, 'silence')) {
                            defender.debuffs.silence = 1;
                            actionLog += ` \n[玉箫封穴] 【玉箫神剑】剑影如流光拂过，封印了 ${defender.name} 的经脉穴位！`;
                        }
                        if (aTreasure?.effect === 'zhenWu' && Math.random() <= 0.25 && !checkImmune(defender, dTreasure, 'silence')) {
                            defender.debuffs.silence = 2;
                            actionLog += ` \n[圣剑封脉] 【真武圣剑】浩然剑气拂穴，封印了 ${defender.name} 的技能！`;
                        }
                        if (aTreasure?.effect === 'daGouAwaked' && Math.random() <= 0.30 && !checkImmune(defender, dTreasure, 'stun')) {
                            defender.debuffs.stun = 1;
                            actionLog += ` \n[神棒重击] 【打狗神棒】当头砸下，震得 ${defender.name} 眩晕跌倒！`;
                        }
                        if (aTreasure?.effect === 'xuanTieAwaked' && Math.random() <= 0.25 && !checkImmune(defender, dTreasure, 'internalWound')) {
                            defender.debuffs.internalWound = 2;
                            actionLog += ` \n[重剑内伤] 【玄铁重剑·传承】万钧力道，震得 ${defender.name} 五脏剧烈内伤！`;
                        }
                       if (skill.id === 's_du' && !checkImmune(defender, dTreasure, 'poison')) {
                           defender.debuffs.poison = 999;
                           defender.debuffs.poisonPercent = 0.07 + (isP1Turn ? rogueBuffs.poisonDmgPct : 0);
                           actionLog += ` \n[万毒] ${defender.name} 身中奇毒，骨髓俱损！`;
                       }
                       if (skill.id === 's_shihou' && !checkImmune(defender, dTreasure, 'stun')) {
                           const stunChanceVal = 0.6 + (isP1Turn ? rogueBuffs.stunChance : 0);
                           if (Math.random() <= stunChanceVal) {
                              defender.debuffs.stun = 1 + (isP1Turn ? rogueBuffs.stunDuration : 0);
                              actionLog += ` \n[狮吼] 震耳欲聋，${defender.name} 被当场震晕 ${defender.debuffs.stun} 回合！`;
                           }
                       }
                       if (skill.id === 's_dianxue' && !checkImmune(defender, dTreasure, 'silence')) {
                           if (Math.random() <= 0.8) {
                              defender.debuffs.silence = 2 + (isP1Turn ? rogueBuffs.silenceDuration : 0);
                              actionLog += ` \n[点穴] ${defender.name} 要穴被封，无法动用武学 ${defender.debuffs.silence} 回合！`;
                           }
                       }
                       if (skill.id === 's_liumai' && Math.random() <= 0.5 && !checkImmune(defender, dTreasure, 'internalWound')) {
                           defender.debuffs.internalWound = 2; actionLog += ` \n[六脉] 无形剑气震伤内腑，${defender.name} 经脉受损！`;
                       }

                       if (aTreasure?.effect === 'dianXue' && !checkImmune(defender, dTreasure, 'silence')) {
                          const silenceChance = 0.10 + 0.08 * tBoostA;
                          if (Math.random() <= silenceChance) {
                             defender.debuffs.silence = 1 + (isP1Turn ? rogueBuffs.silenceDuration : 0);
                             actionLog += ` \n[宝具] ${defender.name} 被判官笔点中要穴 ${defender.debuffs.silence} 回合！`;
                          }
                       }
                      if (aTreasure?.effect === 'juDu' && !checkImmune(defender, dTreasure, 'poison')) {
                          const poisonChance = 0.15 + 0.10 * tBoostA;
                          if (Math.random() <= poisonChance) {
                             defender.debuffs.poison = 3 + (isP1Turn ? rogueBuffs.poisonDuration : 0);
                             defender.debuffs.poisonPercent = 0.03 + (isP1Turn ? rogueBuffs.poisonDmgPct : 0);
                             actionLog += ` \n[宝具] 冰魄银针刺入，${defender.name} 身中剧毒！`;
                          }
                       }
                       if (aTreasure?.effect === 'daGou' && !checkImmune(defender, dTreasure, 'stun')) {
                          const stunChance = (0.15 + 0.10 * tBoostA) + (isP1Turn ? rogueBuffs.stunChance : 0);
                          if (Math.random() <= stunChance) {
                             defender.debuffs.stun = 1 + (isP1Turn ? rogueBuffs.stunDuration : 0);
                             actionLog += ` \n[宝具] 打狗棒击中后脑，${defender.name} 当场晕眩 ${defender.debuffs.stun} 回合！`;
                          }
                       }
                       if (aTreasure?.effect === 'xuanTie' && Math.random() <= (0.20 + 0.10 * tBoostA) && !checkImmune(defender, dTreasure, 'internalWound')) {
                           defender.debuffs.internalWound = 2;
                           actionLog += ` \n[宝具] 玄铁重剑霸道无比，震得 ${defender.name} 吐血内伤！`;
                       }
                    }
                 }
              }
           }
        }

        if (attacker.buffs.dodge > 0) attacker.buffs.dodge--;
        if (attacker.buffs.defUp > 0) attacker.buffs.defUp--;

        if (attacker.hp <= 0 && aTreasure?.effect === 'niePan' && !attacker.hasRevived) {
            attacker.hp = Math.floor(attacker.maxHp * (0.50 + 0.15 * tBoostA));
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
            defender.hp = Math.floor(defender.maxHp * (0.50 + 0.15 * tBoostD));
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
        tempLogs.push(finalLog);

        if (isP1Turn) {
           tempP1 = attacker;
           tempP2 = defender;
        } else {
           tempP1 = defender;
           tempP2 = attacker;
        }
     }

     return { p1: tempP1, p2: tempP2, logs: tempLogs };
  };

  // “直接结算”一键跳过当前单场战斗
  const skipBattle = () => {
     if (encounterState !== 'battling' || !p1 || !p2) return;
     SoundManager.play('sfx_click');
     
     const result = simulateRestOfBattle(p1, p2, logs);
     
     setP1(result.p1);
     setP2(result.p2);
     
     const p1Won = result.p1.hp > 0;
     const nextDefeatedCount = defeatedCount + 1;
     
     let finalLogs = [...result.logs];
     if (p1Won) {
        finalLogs.push(`\n战胜了 ${result.p2.name}！`);
     } else {
        finalLogs.push(`\n====== 战败 ====== \n不敌 ${result.p2.name}，挑战结束。一共击败了 ${defeatedCount} 位对手。`);
     }
     setLogs(finalLogs);
     
     if (p1Won) {
         setDefeatedCount(nextDefeatedCount);
         const equippedSkillIds = Object.values(player.equippedSkills || {}).filter(Boolean);
         if (equippedSkillIds.length > 0) {
            incrementSkillMastery(equippedSkillIds);
         }
         
         // 升级玩家等级 (+0.9 级/关) 并等额提升生命上限及当前气血（递减增长曲线，与正常战斗一致）
         const newLevel = 5 + nextDefeatedCount * 0.9;
         const oldMaxHp = result.p1.maxHp;
         const progress = Math.min(nextDefeatedCount / 60, 1);
          const tObj = TREASURES_DB?.find(t => t.id === player.equippedTreasure);
          const extraHpFromTreasure = (tObj?.attrs?.hp || 0) + (player.equippedTreasureAttrs?.extraHp || 0);
          const newMaxHp = Math.floor(500 + 1500 * Math.sqrt(progress) + (result.p1.attributes.con - 20) * 5 + extraHpFromTreasure);
         result.p1.level = newLevel;
         result.p1.maxHp = newMaxHp;
         result.p1.hp = Math.min(newMaxHp, result.p1.hp);
         setP1(result.p1);
         
        if (nextDefeatedCount >= 60) {
           handleRogueSettlement(nextDefeatedCount);
        } else if (nextDefeatedCount % 3 === 0) {
           setEncounterState('buffSelection');
           const choices = generateBuffChoices(player.equippedTreasure, nextDefeatedCount <= 9);
           setSelectedIndices([]);
           setBuffChoices(choices);
           SoundManager.play('sfx_success');
        } else {
           setEncounterState('transitioning');
           SoundManager.play('sfx_success');
           setTimeout(() => {
              setupNextEnemy(result.p1, leaderboardTeam, nextDefeatedCount);
           }, 2000);
        }
     } else {
        setEncounterState('lose_settling');
        SoundManager.play('sfx_fail');
     }
  };

  // 累积计算阶段奖励，并写入主 Store
  const handleRogueSettlement = (finalDefeatedCount) => {
     let totalExp = 0;
     let totalSilver = 0;
     let rewardsList = [];
     let droppedTreasures = [];

     // 胜场奖励阶梯：6, 12, 30, 42, 48, 51, 54, 57, 60
     if (finalDefeatedCount >= 6) {
         totalExp += 500;
         totalSilver += 1;
         rewardsList.push("战胜 6 人：修为 +500，银两 +1");
     }
     if (finalDefeatedCount >= 12) {
         totalExp += 1000;
         totalSilver += 1;
         rewardsList.push("战胜 12 人：修为 +1000，银两 +1");
        if (Math.random() < 0.10) {
           const common = TREASURES_DB.filter(t => t.rarity === '普通');
           const tr = common[Math.floor(Math.random() * common.length)];
           if (tr) droppedTreasures.push(tr);
        }
     }
     if (finalDefeatedCount >= 30) {
         totalExp += 2500;
         totalSilver += 1;
         rewardsList.push("战胜 30 人：修为 +2500，银两 +1");
        if (Math.random() < 0.50) {
           const common = TREASURES_DB.filter(t => t.rarity === '普通');
           const tr1 = common[Math.floor(Math.random() * common.length)];
           if (tr1) droppedTreasures.push(tr1);
        }
        if (Math.random() < 0.10) {
           const rare = TREASURES_DB.filter(t => t.rarity === '稀有');
           const tr2 = rare[Math.floor(Math.random() * rare.length)];
           if (tr2) droppedTreasures.push(tr2);
        }
     }
     if (finalDefeatedCount >= 42) {
         totalExp += 2500;
         totalSilver += 2;
         rewardsList.push("战胜 42 人：修为 +2500，银两 +2");
        if (Math.random() < 0.60) {
           const rare = TREASURES_DB.filter(t => t.rarity === '稀有');
           const tr1 = rare[Math.floor(Math.random() * rare.length)];
           if (tr1) droppedTreasures.push(tr1);
        }
        if (Math.random() < 0.10) {
           const epic = TREASURES_DB.filter(t => t.rarity === '史诗');
           const tr2 = epic[Math.floor(Math.random() * epic.length)];
           if (tr2) droppedTreasures.push(tr2);
        }
     }
     if (finalDefeatedCount >= 48) {
         totalExp += 2500;
         totalSilver += 2;
         rewardsList.push("战胜 48 人：修为 +2500，银两 +2");
        if (Math.random() < 0.50) {
           const epic = TREASURES_DB.filter(t => t.rarity === '史诗');
           const tr = epic[Math.floor(Math.random() * epic.length)];
           if (tr) droppedTreasures.push(tr);
        }
     }
     if (finalDefeatedCount >= 51) {
         totalExp += 2500;
         totalSilver += 2;
         rewardsList.push("战胜 51 人：修为 +2500，银两 +2");
        if (Math.random() < 0.50) {
           const epic = TREASURES_DB.filter(t => t.rarity === '史诗');
           const tr1 = epic[Math.floor(Math.random() * epic.length)];
           if (tr1) droppedTreasures.push(tr1);
        }
        if (Math.random() < 0.05) {
           const legend = TREASURES_DB.filter(t => t.rarity === '传说');
           const tr2 = legend[Math.floor(Math.random() * legend.length)];
           if (tr2) droppedTreasures.push(tr2);
        }
     }
     if (finalDefeatedCount >= 54) {
         totalExp += 2500;
         totalSilver += 3;
         rewardsList.push("战胜 54 人：修为 +2500，银两 +3");
        if (Math.random() < 0.30) {
           const legend = TREASURES_DB.filter(t => t.rarity === '传说');
           const tr = legend[Math.floor(Math.random() * legend.length)];
           if (tr) droppedTreasures.push(tr);
        }
     }
     if (finalDefeatedCount >= 57) {
         totalExp += 2500;
         totalSilver += 3;
         rewardsList.push("战胜 57 人：修为 +2500，银两 +3");
        if (Math.random() < 0.40) {
           const legend = TREASURES_DB.filter(t => t.rarity === '传说');
           const tr1 = legend[Math.floor(Math.random() * legend.length)];
           if (tr1) droppedTreasures.push(tr1);
        }
        if (Math.random() < 0.02) {
           const mythic = TREASURES_DB.filter(t => t.rarity === '神话');
           const tr2 = mythic[Math.floor(Math.random() * mythic.length)];
           if (tr2) droppedTreasures.push(tr2);
        }
     }
     if (finalDefeatedCount >= 60) {
         totalExp += 3000;
         totalSilver += 5;
         rewardsList.push("通关奇迹！胜 60 人：修为 +3000，银两 +5");
        if (Math.random() < 0.15) {
           const mythic = TREASURES_DB.filter(t => t.rarity === '神话');
           const tr = mythic[Math.floor(Math.random() * mythic.length)];
           if (tr) droppedTreasures.push(tr);
        }
     }

     // 对随机判断掉落的秘宝按稀有度降序排序，并截取前 2 个
     const rarityWeight = { '普通': 1, '稀有': 2, '史诗': 3, '传说': 4, '神话': 5 };
     droppedTreasures.sort((a, b) => (rarityWeight[b.rarity] || 0) - (rarityWeight[a.rarity] || 0));
     droppedTreasures = droppedTreasures.slice(0, 2);

     // 结算派发奖励到主状态机
     gainEncounterRewards(totalExp, totalSilver, droppedTreasures.map(t => t.id));
     // 银两与秘宝已合并发放


     // 若战胜 60 位通关，授予特别名望并获得绝世功法
      let rewardedSkill = null;
      if (finalDefeatedCount >= 60) {
         useGameStore.getState().setTitle("鸣剑宗主");
         
         const allRewardSkills = ['s_kuihua', 's_xianglong', 's_dugu', 's_liumai', 's_shengxin', 's_yijin', 's_xixing', 's_taiji', 's_anran'];
         const playerSkills = useGameStore.getState().player.skills || [];
         const unlearned = allRewardSkills.filter(sk => !playerSkills.includes(sk));
         
         const skillId = unlearned.length > 0
            ? unlearned[Math.floor(Math.random() * unlearned.length)]
            : allRewardSkills[Math.floor(Math.random() * allRewardSkills.length)];
            
         if (skillId) {
            useGameStore.getState().learnSkill(skillId);
            rewardedSkill = SKILLS_DB.find(s => s.id === skillId);
         }
      }

      setSettlementInfo({
         defeatedCount: finalDefeatedCount,
         exp: totalExp,
         silver: totalSilver,
         treasures: droppedTreasures,
         milestones: rewardsList,
         titleUnlocked: finalDefeatedCount >= 60 ? "鸣剑宗主" : null,
         skillUnlocked: rewardedSkill
      });

     setEncounterState('settlement');
     SoundManager.play('sfx_success');
     if (totalSilver > 0) {
        setTimeout(() => { SoundManager.play('sfx_coin'); }, 400);
     }
  };

  // 精确应用单张奇遇卡牌的增益效果到局部副本与 rogueBuffs 状态中
  const applyRogueBuffEffect = (choice, updatedP1) => {
      setRogueBuffs(prev => {
         const next = { ...prev };
         if (choice.id === 'str') next.str += choice.val;
         else if (choice.id === 'con') next.con += choice.val;
         else if (choice.id === 'int') next.int += choice.val;
         else if (choice.id === 'agi') next.agi += choice.val;
         else if (choice.id === 'luk') next.luk += choice.val;
         else if (choice.id === 'defUpEffect') next.defUpEffect += choice.val;
         else if (choice.id === 'defUpDuration') next.defUpDuration += choice.val;
         else if (choice.id === 'dodgeEffect') next.dodgeEffect += choice.val;
         else if (choice.id === 'dodgeDuration') next.dodgeDuration += choice.val;
         else if (choice.id === 'poisonDmgPct') next.poisonDmgPct += choice.val;
         else if (choice.id === 'poisonDuration') next.poisonDuration += choice.val;
         else if (choice.id === 'stunDuration') {
            next.stunDuration += choice.val;
            next.stunChance += choice.chance;
         }
         else if (choice.id === 'silenceDuration') {
            next.silenceDuration += choice.val;
            next.silenceDamageAmp += choice.amp;
         }
         else if (choice.id === 'treasureBoost') {
            next.treasureBoostLevel += choice.val;
         }
         else if (choice.id === 'heal60') {
            next.heal60Count += 1;
         }
         return next;
      });

      // 修改 P1 属性与 HP 上限
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
  };

  // 确认并批量注入所有已选中的奇遇加持，并恢复生命值与流转状态
  const confirmRogueBuffs = () => {
      const maxChoices = defeatedCount <= 9 ? 3 : 1;
      if (selectedIndices.length !== maxChoices) {
         alert(`请选满 ${maxChoices} 个奇遇增益后再确认注入！`);
         return;
      }
      
      SoundManager.play('sfx_success');
      
      let updatedP1 = { 
         ...p1, 
         attributes: { ...p1.attributes } 
      };

      // 依次注入
      selectedIndices.forEach(idx => {
         const choice = buffChoices[idx];
         applyRogueBuffEffect(choice, updatedP1);
      });

      // 通关波次额外获得 20% 生命值恢复
      const healVal = Math.floor(updatedP1.maxHp * 0.20);
      updatedP1.hp = Math.min(updatedP1.maxHp, updatedP1.hp + healVal);

      setP1(updatedP1);
      setWaveIndex(prev => prev + 1);
      setSelectedIndices([]); // 重置选择索引

      // 切入下一个对手战斗
      setEncounterState('transitioning');
      setTimeout(() => {
         setupNextEnemy(updatedP1, leaderboardTeam, defeatedCount);
      }, 1000);
  };

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* 居中大标题排版 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginTop: '0.2rem', marginBottom: '0.8rem' }}>
        <img
          src={cleanIcon}
          alt="江湖奇遇"
          style={{
            width: '50px',
            height: '50px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 8px rgba(185, 28, 28, 0.5))',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        />
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--warn)', fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '2px', margin: '0', textAlign: 'left' }}>
            江湖奇遇
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            逆袭破劫战群雄，肉鸽抉择成宗师 <span style={{ fontSize: '0.8rem', color: 'var(--warn)', fontWeight: 'bold' }}>(今日剩余: {5 - (player.encountersToday || 0)} 次)</span>
          </p>
        </div>
      </div>

      {/* 渐变分割线 */}
      <div style={{ width: '80%', height: '1px', background: 'linear-gradient(90deg, transparent, var(--warn), transparent)', margin: '0.2rem auto 0.8rem', opacity: 0.3 }} />
      
      {/* 奇遇属性与增益看板 */}
      {encounterState !== 'idle' && encounterState !== 'settlement' && p1 && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.45)',
          border: '1px solid var(--glass-border)',
          borderRadius: '10px',
          padding: '0.8rem 1.2rem',
          marginBottom: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {/* 第一行：基础属性 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--gold)', fontWeight: 'bold', fontSize: '0.9rem' }}>👤 侠客状态:</span>
              <span className="wuxia-tag" style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold)', fontSize: '0.8rem', padding: '2px 6px', borderRadius: '4px' }}>
                等阶: {p1.level.toFixed(2)} 级
              </span>
              <span className="wuxia-tag" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', fontSize: '0.8rem', padding: '2px 6px', borderRadius: '4px' }}>
                气血: {p1.hp} / {p1.maxHp}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '4px' }}>
                (体质: <span style={{ color: 'var(--text-main)' }}>{p1.attributes.con}</span> | 
                力量: <span style={{ color: 'var(--text-main)' }}>{p1.attributes.str}</span> | 
                智慧: <span style={{ color: 'var(--text-main)' }}>{p1.attributes.int}</span> | 
                敏捷: <span style={{ color: 'var(--text-main)' }}>{p1.attributes.agi}</span> | 
                幸运: <span style={{ color: 'var(--text-main)' }}>{p1.attributes.luk}</span>)
              </span>
            </div>
            
            {/* 里程碑进度提示 */}
            <div style={{ fontSize: '0.85rem', color: 'var(--warn)', fontWeight: 'bold' }}>
              {(() => {
                const milestones = [6, 12, 30, 42, 48, 51, 54, 57, 60];
                const nextM = milestones.find(m => m > defeatedCount);
                if (nextM) {
                  return `🎯 距下个里程碑奖励还剩 ${nextM - defeatedCount} 关 (第 ${nextM} 关)`;
                }
                return `🏆 已达成所有里程碑奖项`;
              })()}
            </div>
          </div>
          
          {/* 第二行：累计奇遇增益 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '8px', 
            borderTop: '1px dashed rgba(255,255,255,0.1)', 
            paddingTop: '6px',
            fontSize: '0.8rem'
          }}>
            <span style={{ color: 'var(--jade)', fontWeight: 'bold', whiteSpace: 'nowrap' }}>✨ 奇遇加持:</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              {(() => {
                const buffTags = [];
                if (rogueBuffs.con > 0) buffTags.push({ label: `体质 +${rogueBuffs.con}`, type: 'attr' });
                if (rogueBuffs.str > 0) buffTags.push({ label: `力量 +${rogueBuffs.str}`, type: 'attr' });
                if (rogueBuffs.int > 0) buffTags.push({ label: `智慧 +${rogueBuffs.int}`, type: 'attr' });
                if (rogueBuffs.agi > 0) buffTags.push({ label: `敏捷 +${rogueBuffs.agi}`, type: 'attr' });
                if (rogueBuffs.luk > 0) buffTags.push({ label: `幸运 +${rogueBuffs.luk}`, type: 'attr' });
                if (rogueBuffs.defUpEffect > 0) buffTags.push({ label: `防御效果 +${Math.floor(rogueBuffs.defUpEffect * 100)}%`, type: 'special' });
                if (rogueBuffs.defUpDuration > 0) buffTags.push({ label: `防御时间 +${rogueBuffs.defUpDuration}回`, type: 'special' });
                if (rogueBuffs.dodgeEffect > 0) buffTags.push({ label: `闪避率 +${Math.floor(rogueBuffs.dodgeEffect * 100)}%`, type: 'special' });
                if (rogueBuffs.dodgeDuration > 0) buffTags.push({ label: `闪避时间 +${rogueBuffs.dodgeDuration}回`, type: 'special' });
                if (rogueBuffs.poisonDmgPct > 0) buffTags.push({ label: `毒害 +${Math.floor(rogueBuffs.poisonDmgPct * 100)}%`, type: 'special' });
                if (rogueBuffs.poisonDuration > 0) buffTags.push({ label: `毒害时间 +${rogueBuffs.poisonDuration}回`, type: 'special' });
                if (rogueBuffs.stunDuration > 0) buffTags.push({ label: `眩晕 +${rogueBuffs.stunDuration}回(概率+${Math.floor(rogueBuffs.stunChance * 100)}%)`, type: 'special' });
                if (rogueBuffs.silenceDuration > 0) buffTags.push({ label: `封穴 +${rogueBuffs.silenceDuration}回(易伤+${Math.floor(rogueBuffs.silenceDamageAmp * 100)}%)`, type: 'special' });
                if (rogueBuffs.treasureBoostLevel > 0) buffTags.push({ label: `秘宝层级 +${rogueBuffs.treasureBoostLevel}`, type: 'special' });
                if (rogueBuffs.heal60Count > 0) buffTags.push({ label: `气血大还丹 x${rogueBuffs.heal60Count}`, type: 'heal' });
                
                if (buffTags.length === 0) {
                  return <span style={{ color: 'var(--text-muted)' }}>暂无奇遇加持 (通关 3 关后可选择增益)</span>;
                }
                
                return buffTags.map((tag, i) => {
                  let bg = 'rgba(16,185,129,0.1)';
                  let color = 'var(--jade)';
                  if (tag.type === 'special') {
                    bg = 'rgba(245,158,11,0.1)';
                    color = 'var(--warn)';
                  } else if (tag.type === 'heal') {
                    bg = 'rgba(239,68,68,0.1)';
                    color = 'var(--danger)';
                  }
                  return (
                    <span key={i} style={{
                      background: bg,
                      color: color,
                      padding: '1px 6px',
                      borderRadius: '3px',
                      fontSize: '0.75rem',
                      border: `1px solid ${color}33`,
                    }}>
                      {tag.label}
                    </span>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {encounterState === 'idle' ? (
         <div style={{ textAlign: 'center', marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', border: '1px solid var(--glass-border)', maxWidth: '680px', margin: '1.5rem auto' }}>
           <h3 style={{ color: 'var(--gold)', fontFamily: '"Ma Shan Zheng", cursive', fontSize: '1.35rem', marginBottom: '1.2rem', letterSpacing: '1px' }}>
             【鸣剑破劫】Roguelike 闯关模式说明
           </h3>
           <ul style={{ color: 'var(--text-main)', textAlign: 'left', fontSize: '0.9rem', lineHeight: '1.8', listStyleType: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
             <li>⚔️ <b>初始统一</b>：等级强制重置为 <b>5 级</b>，初始气血 <b>500 HP (加成装备与器灵属性后生效)</b>，属性重置为 <b>体质:20, 力量:12, 智慧:6, 敏捷:18, 幸运:6</b>。保留装备的功法与秘宝。</li>
             <li>🏆 <b>逆袭风云榜</b>：从风云榜的最底端席位依次向上挑战，单场战斗结束后的剩余气血<b>不会自动恢复</b>。</li>
             <li>✨ <b>奇遇加持</b>：每击败 3 名对手通关一个波次，气血恢复 <b>20%</b> 并获得自选奇遇增益与大还丹（大还丹可恢复 60% 最大生命值），增益可叠加！</li>
             <li>🎁 <b>里程碑大奖</b>：击败人数达 <b>6、12、30、42、48、51、54、57、60</b> 时派发大奖，中央弹窗提示。通关 60 关将晋升限定名望【<b>鸣剑宗主</b>】！</li>
           </ul>
           <button className="btn-primary" onClick={startEncounter} style={{ marginTop: '2rem', padding: '1rem 3.5rem', fontSize: '1.2rem', background: 'var(--warn)', color: '#000', fontWeight: 'bold' }}>
             开启奇遇闯关
           </button>
         </div>
      ) : encounterState === 'buffSelection' ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--gold)', fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '2px', marginBottom: '0.5rem', textShadow: '0 0 10px rgba(212, 175, 55, 0.5)' }}>
              奇遇抉择
            </h2>
            <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '2rem', maxWidth: '700px', lineHeight: '1.6' }}>
              战绩斐然！大侠请注意：当前处于{defeatedCount <= 9 ? <span style={{ color: 'var(--warn)', fontWeight: 'bold' }}>【前期发育阶段，可自选 3 项】</span> : <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>【中后期突围阶段，仅能精选 1 项】</span>}奇遇加持注入（增益可叠加，注入后获得 20% 气血恢复）：
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', width: '100%', maxWidth: '1000px', marginBottom: '2rem' }}>
              {buffChoices.map((choice, idx) => {
                const isSelected = selectedIndices.includes(idx);
                const maxChoices = defeatedCount <= 9 ? 3 : 1;
                return (
                  <div 
                    key={idx}
                    onClick={() => {
                       setSelectedIndices(prev => {
                          if (prev.includes(idx)) {
                             return prev.filter(i => i !== idx);
                          }
                          if (prev.length < maxChoices) {
                             return [...prev, idx];
                          }
                          if (maxChoices === 1) {
                             return [idx];
                          }
                          return prev;
                       });
                    }}
                    style={{
                      flex: '1 1 170px',
                      maxWidth: '190px',
                      background: isSelected ? 'rgba(212, 175, 55, 0.12)' : 'rgba(0, 0, 0, 0.45)',
                      border: isSelected ? '2px solid var(--gold)' : `1px solid ${choice.qColor || 'rgba(212, 175, 55, 0.25)'}`,
                      boxShadow: isSelected ? '0 0 15px rgba(212, 175, 55, 0.4)' : '0 4px 10px rgba(0,0,0,0.5)',
                      borderRadius: '12px',
                      padding: '2rem 1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '15px',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      if (!isSelected) {
                         e.currentTarget.style.borderColor = 'var(--gold)';
                         e.currentTarget.style.background = 'rgba(212, 175, 55, 0.06)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      if (!isSelected) {
                         e.currentTarget.style.borderColor = choice.qColor || 'rgba(212, 175, 55, 0.25)';
                         e.currentTarget.style.background = 'rgba(0, 0, 0, 0.45)';
                      }
                    }}
                  >
                    {/* 选中的对勾标识 */}
                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        background: 'var(--gold)',
                        color: '#000',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        border: '2px solid #000',
                        boxShadow: '0 0 8px rgba(212, 175, 55, 0.8)'
                      }}>
                        ✓
                      </div>
                    )}

                    <div style={{ fontSize: '2.4rem', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.1))' }}>
                      {choice.type === 'attr' ? '🧬' : choice.type === 'def' ? '🛡️' : choice.type === 'dodge' ? '💨' : choice.type === 'poison' ? '🧪' : choice.type === 'stun' ? '🌀' : choice.type === 'silence' ? '🔇' : '🗡️'}
                    </div>
                    
                    <h3 style={{ 
                      color: choice.quality === 'epic' ? 'var(--danger)' : choice.quality === 'rare' ? 'var(--gold)' : 'var(--text-main)', 
                      fontSize: '1.2rem', 
                      fontFamily: '"Ma Shan Zheng", cursive', 
                      margin: '0', 
                      textShadow: choice.quality === 'epic' ? '0 0 8px rgba(239, 68, 68, 0.4)' : 'none'
                    }}>
                      {choice.name}
                    </h3>
                    
                    <p style={{ color: '#d1d5db', fontSize: '0.85rem', lineHeight: '1.5', margin: 0, flex: 1, display: 'flex', alignItems: 'center', textAlign: 'center' }}>
                      {choice.desc}
                    </p>
                    
                    <div style={{ 
                      fontSize: '0.72rem', 
                      color: isSelected ? '#000' : 'var(--gold)', 
                      background: isSelected ? 'var(--gold)' : 'rgba(212, 175, 55, 0.1)', 
                      padding: '3px 12px', 
                      borderRadius: '4px', 
                      border: isSelected ? 'none' : '1px solid rgba(212, 175, 55, 0.2)', 
                      marginTop: '5px',
                      fontWeight: isSelected ? 'bold' : 'normal'
                    }}>
                      {isSelected ? '已选中加持' : '点击选择'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 操作控制面板 */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '800px' }}>
              <button
                className="btn-secondary"
                disabled={rerollsLeft <= 0}
                onClick={() => {
                   if (rerollsLeft <= 0) return;
                   SoundManager.play('sfx_click');
                   setRerollsLeft(prev => prev - 1);
                   const choices = generateBuffChoices(player.equippedTreasure, defeatedCount <= 9);
                   setSelectedIndices([]);
                   setBuffChoices(choices);
                }}
                style={{
                  padding: '0.8rem 2.5rem',
                  fontSize: '1.1rem',
                  background: rerollsLeft > 0 ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  color: rerollsLeft > 0 ? 'var(--gold)' : 'rgba(255, 255, 255, 0.2)',
                  border: `1px solid ${rerollsLeft > 0 ? 'var(--gold)' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '6px',
                  cursor: rerollsLeft > 0 ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold',
                }}
              >
                🔄 刷新选项 (剩 {rerollsLeft} 次)
              </button>

              <button
                className="btn-primary glow-effect"
                onClick={confirmRogueBuffs}
                disabled={selectedIndices.length !== (defeatedCount <= 9 ? 3 : 1)}
                style={{
                  padding: '0.8rem 3.5rem',
                  fontSize: '1.1rem',
                  background: selectedIndices.length === (defeatedCount <= 9 ? 3 : 1) ? 'var(--gold)' : 'rgba(255,255,255,0.08)',
                  color: selectedIndices.length === (defeatedCount <= 9 ? 3 : 1) ? '#000' : 'rgba(255,255,255,0.3)',
                  fontWeight: 'bold',
                  cursor: selectedIndices.length === (defeatedCount <= 9 ? 3 : 1) ? 'pointer' : 'not-allowed',
                  border: selectedIndices.length === (defeatedCount <= 9 ? 3 : 1) ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  filter: selectedIndices.length === (defeatedCount <= 9 ? 3 : 1) ? 'none' : 'grayscale(100%)',
                  boxShadow: selectedIndices.length === (defeatedCount <= 9 ? 3 : 1) ? '0 0 15px rgba(212, 175, 55, 0.3)' : 'none'
                }}
              >
                {selectedIndices.length === (defeatedCount <= 9 ? 3 : 1) 
                  ? '确立根基，注入奇遇加持' 
                  : `请选择增益（已选 ${selectedIndices.length} / ${defeatedCount <= 9 ? 3 : 1}）`}
              </button>
            </div>
          </div>
       ) : encounterState === 'settlement' ? (
         <div style={{ textAlign: 'center', padding: '1rem', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
           <div style={{ fontSize: '4.5rem', marginBottom: '0.5rem' }}>
             {settlementInfo?.defeatedCount >= 60 ? '🥇' : '💀'}
           </div>
           
           <h2 style={{ fontSize: '2.2rem', color: 'var(--gold)', fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '4px', margin: '0 0 10px 0' }}>
             {settlementInfo?.defeatedCount >= 60 ? '通关大捷！' : '挑战终结'}
           </h2>
           
           <p style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
             大侠本次一共击破了风云榜中的 <span style={{ color: 'var(--warn)', fontWeight: 'bold', fontSize: '1.5rem' }}>{settlementInfo?.defeatedCount}</span> 席对手！
           </p>

           <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '1.5rem', maxWidth: '500px', width: '100%', textAlign: 'left', marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
             <h4 style={{ color: 'var(--gold)', margin: '0 0 8px 0', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '6px', fontSize: '1rem' }}>🎁 获得结算奖励总览：</h4>
             <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-main)', fontSize: '0.95rem' }}>
               <span>获得修为：</span>
               <span style={{ color: 'var(--jade)', fontWeight: 'bold' }}>+{settlementInfo?.exp} EXP</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-main)', fontSize: '0.95rem' }}>
               <span>获得银两：</span>
               <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>+{settlementInfo?.silver} 银两</span>
             </div>
             
             {settlementInfo?.treasures && settlementInfo.treasures.length > 0 && (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                 <span style={{ fontSize: '0.95rem' }}>缴获神兵秘宝：</span>
                 <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                   {settlementInfo.treasures.map((tr, i) => (
                     <span key={i} className="wuxia-tag" style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                       📦 {tr.name} ({tr.rarity})
                     </span>
                   ))}
                 </div>
               </div>
             )}

             {settlementInfo?.titleUnlocked && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px 12px', borderRadius: '6px', marginTop: '8px' }}>
                  <span style={{ color: 'var(--danger)', fontWeight: 'bold', fontSize: '0.9rem' }}>🎉 荣升专属称号：</span>
                  <span className="wuxia-tag" style={{ background: 'var(--warn)', color: '#000', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {settlementInfo.titleUnlocked}
                  </span>
                </div>
              )}

              {settlementInfo?.skillUnlocked && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '8px 12px', borderRadius: '6px', marginTop: '8px' }}>
                  <span style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '0.9rem' }}>📖 领悟绝世功法：</span>
                  <span className="wuxia-tag" style={{ background: '#3b82f6', color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {settlementInfo.skillUnlocked.name}
                  </span>
                </div>
              )}

             {settlementInfo?.milestones && settlementInfo.milestones.length > 0 && (
               <div style={{ marginTop: '10px' }}>
                 <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>已解锁里程碑节点：</span>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                   {settlementInfo.milestones.map((ms, idx) => (
                     <div key={idx}>✓ {ms}</div>
                   ))}
                 </div>
               </div>
             )}
           </div>

           <button 
             className="btn-primary" 
             onClick={() => {
               SoundManager.play('sfx_click'); 
               SoundManager.playMusic('bgm_menu'); 
               setEncounterState('idle'); 
               setLogs([]);
               setSettlementInfo(null);
             }}
             style={{ padding: '0.8rem 2.5rem', fontSize: '1rem', background: 'var(--gold)', color: '#000', fontWeight: 'bold' }}
           >
             退下调息 (返回江湖)
           </button>
         </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* 角色立绘区域 */}
          <div className="encounter-vs-container" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '40px',
            marginBottom: '0.8rem',
            padding: '0.5rem 1rem',
            position: 'relative',
          }}>
            {/* 玩家1 */}
            <EncounterCharacter key={p1?.name || 'player'} player={p1} isLeft={true} battleState={currentBattleState} damageNumbers={damageNumbers} />

            {/* VS标志 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}>
              <div className="encounter-vs-text" style={{
                fontSize: '2rem',
                color: 'var(--warn)',
                fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif',
                textShadow: '0 0 15px rgba(245, 158, 11, 0.6)',
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
                第 {defeatedCount + 1} / 60 关
              </div>
            </div>

            {/* 玩家2 */}
            <EncounterCharacter key={p2?.name || 'enemy'} player={p2} isLeft={false} battleState={currentBattleState} damageNumbers={damageNumbers} />

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
                type={d.type}
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
                color: log.includes('大捷') || log.includes('宝物') || log.includes('奖励') ? '#facc15' : log.includes('===') ? 'var(--primary)' : log.includes(player.name) ? 'var(--text-main)' : 'var(--danger)', 
                fontWeight: log.includes('大捷') || log.includes('宝物') || log.includes('===') || log.includes('奖励') ? 'bold' : 'normal',
                whiteSpace: 'pre-line',
                animation: 'slideUp 0.3s',
                padding: log.includes('===') || log.includes('大捷') ? '8px' : '0',
                background: log.includes('===') || log.includes('大捷') ? 'rgba(212, 175, 55, 0.05)' : 'transparent',
                borderRadius: '4px'
              }}>
                {log}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '1rem' }}>
            {encounterState === 'battling' && (
              <button 
                className="btn-primary" 
                onClick={skipBattle} 
                style={{ flex: 1, background: 'var(--gold)', color: '#000', fontWeight: 'bold' }}
              >
                直接结算 (跳过战斗)
              </button>
            )}
            {encounterState === 'lose_settling' && (
              <button 
                className="btn-primary" 
                onClick={() => handleRogueSettlement(defeatedCount)} 
                style={{ flex: 1, background: 'var(--warn)', color: '#000', fontWeight: 'bold' }}
              >
                结算并领取奖励
              </button>
            )}
            {(encounterState === 'win' || encounterState === 'lose') && (
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => { SoundManager.play('sfx_click'); SoundManager.playMusic('bgm_menu'); setEncounterState('idle'); setLogs([]); }}>退下调息 (返回)</button>
            )}
          </div>
        </div>
      )}

      {/* 里程碑奖励获得弹窗 */}
      {milestonePopup !== null && (
         <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
         }}>
            <div className="glass-panel" style={{
               padding: '2.5rem',
               maxWidth: '480px',
               textAlign: 'center',
               border: '2px solid var(--gold)',
               boxShadow: '0 0 30px rgba(212, 175, 55, 0.6)',
               background: 'rgba(15, 10, 5, 0.95)',
               borderRadius: '16px',
            }}>
               <div style={{ fontSize: '4rem', marginBottom: '1rem', filter: 'drop-shadow(0 0 12px rgba(212, 175, 55, 0.6))' }}>🎁</div>
               <h2 style={{
                  color: 'var(--gold)',
                  fontFamily: '"Ma Shan Zheng", cursive',
                  fontSize: '2rem',
                  margin: '0 0 1rem 0',
                  letterSpacing: '2px',
                  textShadow: '0 0 10px rgba(212,175,55,0.8)'
               }}>
                  【斩获里程碑奖励！】
               </h2>
               <div style={{
                  width: '60%',
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
                  margin: '0 auto 1.5rem',
               }} />
               <p style={{ color: 'var(--text-main)', fontSize: '1.1rem', lineHeight: '1.6', margin: '0 0 1.5rem 0' }}>
                  恭喜大侠战胜了第 <span style={{ color: 'var(--warn)', fontWeight: 'bold', fontSize: '1.4rem' }}>{milestonePopup}</span> 位对手，特派发如下里程碑大奖：
               </p>
               <div style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  padding: '1rem',
                  borderRadius: '8px',
                  color: 'var(--warn)',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  marginBottom: '1.5rem'
               }}>
                  {getMilestoneDesc(milestonePopup)}
               </div>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  (本窗口将在 3 秒后自动关闭，奖励已发放至包裹)
               </p>
            </div>
         </div>
      )}
    </div>
  );
}

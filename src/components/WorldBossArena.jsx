import React, { useState, useEffect, useRef } from 'react';
import { useGameStore, getSocket, SKILLS_DB, TREASURES_DB, getSkillInfo } from '../store/gameState';
import { Sword, Users, ShieldAlert, Award, Play, Shield, FlaskConical } from 'lucide-react';
import { SoundManager } from '../utils/SoundManager';
import EnhancedWarriorAvatar from './EnhancedWarriorAvatar';
import BattleEffects, { DamageFloatNumber, MangaSkillPop, ClashParticles } from './BattleEffects';
import { useCleanImage } from '../utils/imageProcess';

export default function WorldBossArena() {
  const player = useGameStore(state => state.player);
  const worldBossState = useGameStore(state => state.worldBossState);
  const bossPicSrc = 
    worldBossState.stance === 'weakened' ? '/boss_mola_weakened.png' :
    worldBossState.stance === 'frenzied' ? '/boss_mola_frenzied.png' :
    worldBossState.stance === 'shielded' ? '/boss_mola_shielded.png' :
    '/boss_mola_portrait.png';
  const cleanBossPic = useCleanImage(bossPicSrc, 20, 20);
  const cleanBossHeaderPic = cleanBossPic;
  const cleanDemonSword = useCleanImage('/demon_sword.png', 20, 20);
  const fetchWorldBossState = useGameStore(state => state.fetchWorldBossState);
  const signupWorldBoss = useGameStore(state => state.signupWorldBoss);
  const challengeWorldBoss = useGameStore(state => state.challengeWorldBoss);
  const bidWorldBossAuction = useGameStore(state => state.bidWorldBossAuction);
  const devControlWorldBoss = useGameStore(state => state.devControlWorldBoss);
  const onlinePlayers = useGameStore(state => state.onlinePlayers);

  // 战斗状态
  const [battleLogs, setBattleLogs] = useState([]);
  const [inBattle, setInBattle] = useState(false);
  const [curBossHp, setCurBossHp] = useState(0);
  const [curUserHp, setCurUserHp] = useState(0);
  const [battleDmg, setBattleDmg] = useState(0);
  const [battleState, setBattleState] = useState('idle'); // idle, fighting, finished
  
  // 拍卖出价
  const [bidPrice, setBidPrice] = useState(0);
  
  // 滚动日志和 Toast
  const [strikeToast, setStrikeToast] = useState(null);
  const logsContainerRef = useRef(null);

  // New visual and animation state variables
  const [activeVfx, setActiveVfx] = useState('none'); // 'none', 'chaos', 'shadow', 'roar', 'extinction'
  const [isBossHit, setIsBossHit] = useState(false);
  const [isPlayerHit, setIsPlayerHit] = useState(false);
  const [isBossAttacking, setIsBossAttacking] = useState(false);
  const [isPlayerAttacking, setIsPlayerAttacking] = useState(false);
  const [activeSkillName, setActiveSkillName] = useState('');
  const [skillCaster, setSkillCaster] = useState(''); // 'player', 'boss'
  const [isScreenShaking, setIsScreenShaking] = useState(false);

  // 复用遭遇战核心特效数据源
  const [effects, setEffects] = useState([]);
  const [damageNumbers, setDamageNumbers] = useState([]);
  const [currentBattleState, setCurrentBattleState] = useState({});
  const [skillCast, setSkillCast] = useState(null);

  // 本地战斗状态(Buffs/Debuffs)
  const [playerBuffs, setPlayerBuffs] = useState({ dodge: 0, defUp: 0, shield: 0, revive: 0 });
  const [playerDebuffs, setPlayerDebuffs] = useState({ stun: 0, poison: 0, silence: 0, internalWound: 0 });

  const addEffect = (type, position, intensity = 1, skillName = '', skillId = '') => {
    const id = Date.now() + Math.random();
    setEffects(prev => [...prev, { id, type, position, intensity, skillName, skillId }]);
  };
  const removeEffect = (id) => {
    setEffects(prev => prev.filter(e => e.id !== id));
  };
  const addDamageNumber = (damage, position, isHeal = false) => {
    const id = Date.now() + Math.random();
    setDamageNumbers(prev => [...prev, { id, damage, position, isHeal }]);
  };
  const removeDamageNumber = (id) => {
    setDamageNumbers(prev => prev.filter(d => d.id !== id));
  };

  useEffect(() => {
    fetchWorldBossState();
    
    // 监听高光事件
    const socket = getSocket();
    if (socket) {
       socket.on('boss_fighter_strike', (data) => {
          setStrikeToast(data);
          // 2秒后自动消失
          setTimeout(() => {
             setStrikeToast(null);
          }, 2000);
       });
    }

    return () => {
       if (socket) socket.off('boss_fighter_strike');
    };
  }, [fetchWorldBossState]);

  useEffect(() => {
     if (logsContainerRef.current) {
        logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
     }
  }, [battleLogs]);

  // 30 回合 Boss 战模拟器
  const startBossFight = () => {
     if (player.essence < 10) {
        alert("你的武道精魂不足 10 点，无法挑战大魔罗！");
        return;
     }
     SoundManager.play('sfx_task_accept');
     
     setInBattle(true);
     setBattleState('fighting');
     setCurBossHp(worldBossState.hp);
     setCurUserHp(player.maxHp);
     setBattleDmg(0);
     setActiveVfx('none');
     setIsBossHit(false);
     setIsPlayerHit(false);
     setIsBossAttacking(false);
     setIsPlayerAttacking(false);
     setIsScreenShaking(false);
     
     // 遭遇战特效状态重置
     setEffects([]);
     setDamageNumbers([]);
     setCurrentBattleState({});
     setSkillCast(null);
     setPlayerBuffs({ dodge: 0, defUp: 0, shield: 0, revive: 0 });
     setPlayerDebuffs({ stun: 0, poison: 0, silence: 0, internalWound: 0 });
     
     // 锁死本场战斗的 Stance 状态
     const activeStance = worldBossState.stance || 'normal';
     let maxSingleHit = 0;
     let totalHeal = 0;
     let isCritOccurred = false;
     const castSkillsList = [];

     // 检测玩家是否洗练出词条
     const attrs = player.equippedTreasureAttrs || {};
     const playerTreasure = TREASURES_DB?.find(t => t.id === player.equippedTreasure);
     const hasPo破魔 = (attrs.bossDamageBoost > 0) || (attrs.extraHp >= 120) || (player.treasures.some(t => ['t13', 't14'].includes(t))); // 包含破魔词条或特定神兵
     const hasPoison = attrs.poisonRate > 0;
     const hasStun = attrs.stunRate > 0;
     const hasAntiStun = attrs.extraCrit >= 5; // 暴击率达标作为防晕 (对应旧幸运词条)

     const stanceIntro = 
       activeStance === 'weakened' ? '👹 大魔罗当前正处于【虚弱状态】（封印溃散），承受伤害加倍，输出减半！' :
       activeStance === 'frenzied' ? '👹 大魔罗当前正处于【混沌狂魔】（怒火中烧），输出提升50%，承伤增加30%！' :
       activeStance === 'shielded' ? '👹 大魔罗当前正处于【幽冥法盾】（魔殿法阵），免伤提升40%，反弹20%受创！' :
       '你深吸一口气，踏入大殿，直面浮空狂笑的太古噬魂魔罗！';

     let logs = [`====== 挑战开始：御敌太古魔殿 ======`, stanceIntro];
     setBattleLogs(logs);

     let turn = 1;
     let userHp = player.maxHp;
     let bossHp = worldBossState.hp;
     let accumulatedDmg = 0;

     const interval = setInterval(() => {
        if (turn > 30 || userHp <= 0 || bossHp <= 0) {
           clearInterval(interval);
           setBattleState('finished');
           // 上传伤害与战斗指标
           challengeWorldBoss({
              damage: accumulatedDmg,
              maxSingleHit,
              totalHeal,
              equippedTreasure: player.equippedTreasure,
              isCrit: isCritOccurred,
              castSkills: castSkillsList,
              skillName: activeSkillName
           });
           SoundManager.play('sfx_success');
           setBattleLogs(prev => [...prev, `\n>> 挑战结束！共对魔罗造成了 ${accumulatedDmg} 点伤害。`, `你精疲力竭，在漫天飞灰中退回大殿。`]);
           setActiveVfx('none');
           setIsBossHit(false);
           setIsPlayerHit(false);
           setIsBossAttacking(false);
           setIsPlayerAttacking(false);
           setIsScreenShaking(false);

           setEffects([]);
           setDamageNumbers([]);
           setCurrentBattleState({});
           setSkillCast(null);
           setPlayerBuffs({ dodge: 0, defUp: 0, shield: 0, revive: 0 });
           setPlayerDebuffs({ stun: 0, poison: 0, silence: 0, internalWound: 0 });
           return;
        }

        let turnLog = `【第 ${turn} 回合】\n`;
        
        // 玩家受到的负面影响判定
        let isStunned = false;
        let playerDodgeTurn = false;
        let bossDmgMultiplier = 1.0;

        // 重置瞬时动作状态，但不重置长效全屏特效
        setIsBossHit(false);
        setIsPlayerHit(false);
        setIsBossAttacking(false);
        setIsPlayerAttacking(false);
        setCurrentBattleState({});

        // 递减玩家Buff and Debuff状态持续回合
        setPlayerBuffs(prev => ({
           dodge: Math.max(0, prev.dodge - 1),
           defUp: Math.max(0, prev.defUp - 1),
           shield: Math.max(0, prev.shield - 1),
           revive: prev.revive
        }));
        setPlayerDebuffs(prev => ({
           stun: Math.max(0, prev.stun - 1),
           poison: Math.max(0, prev.poison - 1),
           silence: Math.max(0, prev.silence - 1),
           internalWound: Math.max(0, prev.internalWound - 1)
        }));

        // 1. Boss 攻击前戏与技能施放轴
        if (turn === 3 || turn === 8) {
           if (activeStance === 'weakened') {
              turnLog += `👹 魔罗魔眼暗淡，本欲施展功法，奈何因【封印虚弱】真气难提，此招直接落空！你毫发无损。\n`;
           } else if (activeStance === 'frenzied') {
              turnLog += `👹 魔罗双眼怒绽血光，在狂暴下施展了【混沌魔蚀】重创于你！`;
              const dot = Math.floor(player.maxHp * 0.05);
              userHp = Math.max(0, userHp - dot);
              turnLog += `你受到了 ${dot} 点心魔伤害，且运转周天的功法几率下降 30%。\n`;
              setActiveVfx('chaos');
              SoundManager.play('sfx_silence', 0.65);
              setIsBossAttacking(true);
              setPlayerDebuffs(prev => ({ ...prev, silence: 2 }));
              setTimeout(() => setIsBossAttacking(false), 500);
              setTimeout(() => setActiveVfx('none'), 1200);

              setSkillCast({ characterName: '太古魔罗', skillName: '混沌魔蚀', skillId: 'boss_chaos', skillDesc: '混沌狂怒下的魔气腐蚀，封印心神并造成气血流失。', position: 'right' });
              setTimeout(() => {
                 addEffect('ultimateBurst', 'left', 1.8, '混沌魔蚀', 'boss_chaos');
                 addEffect('debuff', 'left', 1.0);
                 addDamageNumber(dot, 'left');
              }, 500);
           } else if (activeStance === 'shielded') {
              turnLog += `👹 魔罗紫甲大盛，施展了【幽冥法盾】！魔尊吸纳四周幽冥煞气，张开了强力的反伤盾防！\n`;
              setActiveVfx('shadow');
              SoundManager.play('sfx_shield', 0.65);
              setIsBossAttacking(true);
              setTimeout(() => setIsBossAttacking(false), 500);
              setTimeout(() => setActiveVfx('none'), 1200);

              setSkillCast({ characterName: '太古魔罗', skillName: '幽冥法盾', skillId: 'boss_shadow', skillDesc: '幽冥邪铠加身，凝聚高额本源护盾，反弹一切攻击。', position: 'right' });
              setTimeout(() => {
                 addEffect('buff', 'right', 1.5);
              }, 500);
           } else {
              turnLog += `👹 魔罗魔眼怒张，施展了【魔罗乱神】！心魔干扰袭来，你运转周天的功法几率下降 30%。\n`;
              setActiveVfx('chaos');
              SoundManager.play('sfx_silence', 0.65);
              setIsBossAttacking(true);
              setPlayerDebuffs(prev => ({ ...prev, silence: 2 }));
              setTimeout(() => setIsBossAttacking(false), 500);
              setTimeout(() => setActiveVfx('none'), 1200);

              setSkillCast({ characterName: '太古魔罗', skillName: '魔罗乱神', skillId: 'boss_chaos', skillDesc: '太古怨魂直透识海，心魔纷扰导致施法几率大幅下降。', position: 'right' });
              setTimeout(() => {
                 addEffect('ultimateBurst', 'left', 1.5, '魔罗乱神', 'boss_chaos');
                 addEffect('debuff', 'left', 1.0);
              }, 500);
           }
        }
        else if (turn === 5 || turn === 12) {
           if (activeStance === 'weakened') {
              turnLog += `👹 魔罗浑身煞气溃散，施展了虚弱的【残喘挣扎】！`;
              const dot = Math.floor(player.maxHp * 0.03);
              userHp = Math.max(0, userHp - dot);
              turnLog += `你仅损失了极少气血 ${dot} 点。\n`;
              setActiveVfx('shadow');
              SoundManager.play('sfx_poison', 0.40);
              setIsBossAttacking(true);
              setPlayerDebuffs(prev => ({ ...prev, poison: 1 }));
              setTimeout(() => setIsBossAttacking(false), 500);
              setTimeout(() => setActiveVfx('none'), 1200);

              setSkillCast({ characterName: '太古魔罗', skillName: '残喘挣扎', skillId: 'boss_shadow', skillDesc: '无力之下的勉强反击，仅造成轻微毒素腐蚀。', position: 'right' });
              setTimeout(() => {
                 addEffect('ultimateBurst', 'left', 1.0, '残喘挣扎', 'boss_shadow');
                 addDamageNumber(dot, 'left');
              }, 500);
           } else if (activeStance === 'frenzied') {
              turnLog += `👹 魔罗暴怒嘶吼，施展了狂暴的【狂煞血爪】重创于你！`;
              const dot = Math.floor(player.maxHp * 0.12);
              userHp = Math.max(0, userHp - dot);
              turnLog += `你染上了狂暴血毒，大量出血损失了 ${dot} 点气血！\n`;
              setActiveVfx('shadow');
              SoundManager.play('sfx_poison', 0.65);
              setIsBossAttacking(true);
              setPlayerDebuffs(prev => ({ ...prev, poison: 3 }));
              setTimeout(() => setIsBossAttacking(false), 500);
              setTimeout(() => setActiveVfx('none'), 1200);

              setSkillCast({ characterName: '太古魔罗', skillName: '狂煞血爪', skillId: 'boss_shadow', skillDesc: '狂怒下的魔爪挥击，撕开血肉防线造成持续毒害。', position: 'right' });
              setTimeout(() => {
                 addEffect('ultimateBurst', 'left', 2.5, '狂煞血爪', 'boss_shadow');
                 addDamageNumber(dot, 'left');
              }, 500);
           } else if (activeStance === 'shielded') {
              turnLog += `👹 魔罗贪婪一笑，施展了【吸星噬灵】掠夺你的生机！`;
              const dot = Math.floor(player.maxHp * 0.08);
              userHp = Math.max(0, userHp - dot);
              bossHp = Math.min(worldBossState.maxHp, bossHp + dot);
              turnLog += `你损失了 ${dot} 点气血，魔罗吸噬生机使其自身当场恢复了 ${dot} 点 HP！\n`;
              setActiveVfx('shadow');
              SoundManager.play('sfx_poison', 0.50);
              setIsBossAttacking(true);
              setPlayerDebuffs(prev => ({ ...prev, poison: 2 }));
              setTimeout(() => setIsBossAttacking(false), 500);
              setTimeout(() => setActiveVfx('none'), 1200);

              setSkillCast({ characterName: '太古魔罗', skillName: '吸星噬灵', skillId: 'boss_shadow', skillDesc: '吞噬敌手真元气血，化为黑气回复自身伤势。', position: 'right' });
              setTimeout(() => {
                 addEffect('ultimateBurst', 'left', 2.0, '吸星噬灵', 'boss_shadow');
                 addEffect('heal', 'right', 1.5);
                 addDamageNumber(dot, 'left');
                 addDamageNumber(dot, 'right', true);
              }, 500);
           } else {
              turnLog += `👹 魔罗周身煞气暴涨，施展了【邪煞夺魄】重创于你！`;
              const dot = Math.floor(player.maxHp * 0.08);
              userHp = Math.max(0, userHp - dot);
              turnLog += `你染上了魔毒，损失 ${dot} 点气血。魔罗张开了【血魂护盾】！\n`;
              setActiveVfx('shadow');
              SoundManager.play('sfx_poison', 0.50);
              setIsBossAttacking(true);
              setPlayerDebuffs(prev => ({ ...prev, poison: 3 }));
              setTimeout(() => setIsBossAttacking(false), 500);
              setTimeout(() => setActiveVfx('none'), 1200);

              setSkillCast({ characterName: '太古魔罗', skillName: '邪煞夺魄', skillId: 'boss_shadow', skillDesc: '周身煞气暴涨，掠夺气血！染上腐骨魔毒，并张开本命血盾', position: 'right' });
              setTimeout(() => {
                 addEffect('ultimateBurst', 'left', 2.0, '邪煞夺魄', 'boss_shadow');
                 addEffect('buff', 'right', 1.5);
                 addDamageNumber(dot, 'left');
              }, 500);
           }
        }
        else if (turn === 7 || turn === 14) {
           if (activeStance === 'weakened') {
              turnLog += `👹 魔罗发出了虚无苍白的【残喘咆哮】，根本无法震慑你的心神，你气势如虹！\n`;
              setSkillCast({ characterName: '太古魔罗', skillName: '残喘咆哮', skillId: 'boss_roar', skillDesc: '虚弱衰退下的嘶吼，音波孱弱。', position: 'right' });
              setTimeout(() => {
                 addEffect('ultimateBurst', 'left', 1.0, '残喘咆哮', 'boss_roar');
              }, 500);
           } else if (activeStance === 'frenzied') {
              turnLog += `👹 魔尊彻底爆发，咆哮出劫焰滔天的【劫火灭世】！`;
              const dot = Math.floor(player.maxHp * 0.06);
              userHp = Math.max(0, userHp - dot);
              turnLog += `余波袭来令你损失 ${dot} 点气血，并掀起魔意风暴！`;
              setActiveVfx('roar');
              setIsScreenShaking(true);
              SoundManager.play('sfx_stun', 0.50);
              setIsBossAttacking(true);
              setTimeout(() => setIsBossAttacking(false), 500);
              setTimeout(() => setActiveVfx('none'), 1200);
              setTimeout(() => setIsScreenShaking(false), 1000);

              if (hasAntiStun) {
                 turnLog += `幸而你身怀【防晕免控】秘法，免疫了火焰震慑！\n`;
              } else if (Math.random() <= 0.50) {
                 turnLog += `狂暴劫火直冲百会，你被强行震入【眩晕】状态，本回合无法出手！\n`;
                 isStunned = true;
                 setPlayerDebuffs(prev => ({ ...prev, stun: 1 }));
              } else {
                 turnLog += `你气定神闲，在风暴中站稳脚跟！\n`;
              }

              setSkillCast({ characterName: '太古魔罗', skillName: '劫火灭世', skillId: 'boss_roar', skillDesc: '混沌魔火漫天爆发，震慑神识魂海使其眩晕难支。', position: 'right' });
              setTimeout(() => {
                 addEffect('ultimateBurst', 'left', 2.5, '劫火灭世', 'boss_roar');
                 addDamageNumber(dot, 'left');
                 if (isStunned) {
                    addEffect('debuff', 'left', 1.0);
                 }
              }, 500);
           } else if (activeStance === 'shielded') {
              turnLog += `👹 魔罗震动丹田，催动【幽冥气墙】推卷四方阻挡攻势！`;
              setActiveVfx('roar');
              setIsScreenShaking(true);
              SoundManager.play('sfx_stun', 0.40);
              setIsBossAttacking(true);
              setTimeout(() => setIsBossAttacking(false), 500);
              setTimeout(() => setActiveVfx('none'), 1200);
              setTimeout(() => setIsScreenShaking(false), 1000);

              if (hasAntiStun) {
                 turnLog += `幸而你身怀【防晕免控】秘法，未受退斥干扰！\n`;
              } else if (Math.random() <= 0.20) {
                 turnLog += `气浪拍面，你陷入了短暂的【眩晕】迟滞状态！\n`;
                 isStunned = true;
                 setPlayerDebuffs(prev => ({ ...prev, stun: 1 }));
              } else {
                 turnLog += `你沉腰下马，未被气浪退斥半分！\n`;
              }

              setSkillCast({ characterName: '太古魔罗', skillName: '幽冥气墙', skillId: 'boss_roar', skillDesc: '气劲汇聚化为幽冥厚阻气墙，阻断一切身法。', position: 'right' });
              setTimeout(() => {
                 addEffect('ultimateBurst', 'left', 1.5, '幽冥气墙', 'boss_roar');
                 if (isStunned) {
                    addEffect('debuff', 'left', 1.0);
                 }
              }, 500);
           } else {
              turnLog += `👹 魔罗爆发大范围太古魔啸！`;
              setActiveVfx('roar');
              setIsScreenShaking(true);
              SoundManager.play('sfx_stun', 0.45);
              setIsBossAttacking(true);
              setTimeout(() => setIsBossAttacking(false), 500);
              setTimeout(() => setActiveVfx('none'), 1200);
              setTimeout(() => setIsScreenShaking(false), 1000);

              if (hasAntiStun) {
                 turnLog += `幸而你身怀【防晕免控】秘法，稳住身形，免疫了咆哮震慑！\n`;
              } else if (Math.random() <= 0.35) {
                 turnLog += `你心神被魔啸震慑，陷入了【眩晕】状态，本回合无法出手！\n`;
                 isStunned = true;
                 setPlayerDebuffs(prev => ({ ...prev, stun: 1 }));
              } else {
                 turnLog += `你咬紧牙关，在风暴中立住了脚步！\n`;
              }

              setSkillCast({ characterName: '太古魔罗', skillName: '太古魔啸', skillId: 'boss_roar', skillDesc: '魔心力啸震天，撕裂气脉！狂暴邪声震耳，令敌眩晕失守', position: 'right' });
              setTimeout(() => {
                 addEffect('ultimateBurst', 'left', 2.0, '太古魔啸', 'boss_roar');
                 if (isStunned) {
                    addEffect('debuff', 'left', 1.0);
                 }
              }, 500);
           }
        }
        else if (turn === 30) {
           turnLog += `👹 【诸神寂灭】！！魔罗在第 30 回合爆发灭世神雷，对你造成 99,999 点真实伤害，你瞬间失去知觉！\n`;
           userHp = 0;
           setActiveVfx('extinction');
           SoundManager.play('sfx_magic', 0.35);
           setIsBossAttacking(true);
           setTimeout(() => setIsBossAttacking(false), 500);
           setTimeout(() => setActiveVfx('none'), 1200);

           // 大招特写与致死雷轰
           setSkillCast({ characterName: '太古魔罗', skillName: '诸神寂灭', skillId: 'boss_extinction', skillDesc: '太古灭世神雷，摧枯拉朽！万法寂灭，对敌造成致死性真实重击', position: 'right' });
           setTimeout(() => {
              addEffect('ultimateBurst', 'left', 3.0, '诸神寂灭', 'boss_extinction');
              addDamageNumber(99999, 'left');
           }, 580);
        }

         // 2. 玩家出手
         if (!isStunned && userHp > 0) {
            // 挑技能逻辑（与 EncounterArena/BattleArena 完全对齐）
            const eq = player.equippedSkills || {};
            // 过滤空值，若为空默认为普通攻击
            let skillIds = [eq.inner, eq.outer, eq.motion, eq.ultimate].filter(Boolean);
            
            const playerInt = player.attributes.int || 0;
            
            const pickSkill = () => {
               if (skillIds.length === 0) return { id: 's1', name: '基本拳脚', type: 'outer', power: 10, desc: '入门招式。外功。' };
               let totalWeight = 0;
               const weighted = skillIds.map(sId => {
                  const sk = SKILLS_DB.find(s => s.id === sId) || SKILLS_DB[0];
                  // 威力越大的技能在智慧高的玩家身上更容易催动
                  const weight = 100 + (sk.power / 10) * playerInt * 1.5;
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

            // 区分技能类型执行不同的效果
            if (skill.type === 'inner' && skill.id !== 's_shihou' && skill.id !== 's_xixing') {
               // 内功/防御
               setIsPlayerAttacking(true);
               setTimeout(() => setIsPlayerAttacking(false), 500);
               if (!castSkillsList.includes('inner')) castSkillsList.push('inner');

               if (skill.id === 's_yijin') {
                  const healAmt = Math.floor(player.maxHp * 0.15);
                  userHp = Math.min(player.maxHp, userHp + healAmt);
                  totalHeal += healAmt;
                  turnLog += `你 运转【易筋经】神功，浑身经脉贯通！体内腐骨魔毒被瞬间逼出，并恢复了 ${healAmt} 点气血！\n`;
                  SoundManager.play('sfx_heal');
                  addEffect('heal', 'left', 1.5);
                  addDamageNumber(healAmt, 'left', true);
                  setPlayerDebuffs({ stun: 0, poison: 0, silence: 0, internalWound: 0 });
               } else if (skill.id === 's5') {
                  turnLog += `你 催动【九阳神功】，周身隐现烈日金轮！九阳真气护体，防御力巨幅提升！\n`;
                  SoundManager.play('sfx_shield');
                  addEffect('buff', 'left', 1.5);
                  setPlayerBuffs(prev => ({ ...prev, defUp: 3 }));
               } else if (skill.id === 's_shengxin') {
                  turnLog += `你 催动【圣心诀】，祥云缭绕，生死二气运转护体，伤势大幅好转！\n`;
                  SoundManager.play('sfx_revive');
                  const healAmt = Math.floor(player.maxHp * 0.1);
                  userHp = Math.min(player.maxHp, userHp + healAmt);
                  totalHeal += healAmt;
                  addEffect('revive', 'left', 1.5);
                  addDamageNumber(healAmt, 'left', true);
                  setPlayerBuffs(prev => ({ ...prev, revive: 1 }));
               } else {
                  const healAmt = 150 + playerInt * 3;
                  userHp = Math.min(player.maxHp, userHp + healAmt);
                  totalHeal += healAmt;
                  turnLog += `你 运转【${skill.name}】进行呼吸调理，气息顺畅，恢复了 ${healAmt} 点气血。\n`;
                  SoundManager.play('sfx_heal');
                  addEffect('heal', 'left', 1.0);
                  addDamageNumber(healAmt, 'left', true);
               }
               setCurrentBattleState({ attacker: player.name, lastHit: null, effectType: 'heal' });

            } else if (skill.type === 'motion') {
               // 身法
               setIsPlayerAttacking(true);
               setTimeout(() => setIsPlayerAttacking(false), 500);
               if (!castSkillsList.includes('motion')) castSkillsList.push('motion');

               turnLog += `你 施展起【${skill.name}】，身姿如风似幻，留下一道道虚影！\n`;
               SoundManager.play('sfx_dodge');
               addEffect('dodge', 'left', 1.2);
               playerDodgeTurn = true;
               setCurrentBattleState({ attacker: player.name, lastHit: null, effectType: 'dodge' });
               setPlayerBuffs(prev => ({ ...prev, dodge: 3 }));

            } else {
               // 伤害性技能 (外功 & 绝招)
               const playerAtk = (player.attributes.str || 0) * 2 + player.level * 5 + (playerTreasure?.attrs?.atk || 0) + (attrs.extraAtk || 0);
               const aMod = 1 + player.level * 0.05;
               const adjustedSkillPwr = skill.power * aMod;
               let baseDmg = playerAtk * 2 + adjustedSkillPwr + Math.random() * 100;
               
               const playerCrit = (playerTreasure?.attrs?.crit || 0) + (attrs.extraCrit || 0);
               const baseCritChance = ((player.attributes.luk / (player.attributes.luk + 150)) * 0.2) + playerCrit * 0.01;
               let isCrit = Math.random() < Math.max(0.05, baseCritChance);
               if (isCrit) baseDmg *= 1.8;
               let damageToBoss = Math.floor(baseDmg);
               
               // 根据相态修正玩家造成的伤害
               if (activeStance === 'weakened') {
                  damageToBoss = damageToBoss * 2;
               } else if (activeStance === 'frenzied') {
                  damageToBoss = Math.floor(damageToBoss * 1.3);
               } else if (activeStance === 'shielded') {
                  damageToBoss = Math.floor(damageToBoss * 0.6);
               }

               if (isCrit) isCritOccurred = true;
               if (damageToBoss > maxSingleHit) maxSingleHit = damageToBoss;
               if (skill.type === 'ultimate') {
                  if (!castSkillsList.includes('ultimate')) castSkillsList.push('ultimate');
               } else {
                  if (!castSkillsList.includes('outer')) castSkillsList.push('outer');
               }

               // 破魔判定与相态文案
               const isPoMa = hasPo破魔;
               let stanceLabel = '';
               if (activeStance === 'weakened') stanceLabel = '(虚弱重创 x2.0)';
               else if (activeStance === 'frenzied') stanceLabel = '(狂暴加成 x1.3)';
               else if (activeStance === 'shielded') stanceLabel = '(法盾免伤 x0.6)';

               if (!isPoMa) {
                  damageToBoss = Math.floor(damageToBoss * 0.2);
                  turnLog += `你 施展【${skill.name}】狂轰而去，但魔罗周身【九重邪光】闪烁，抵消了80%受创，造成了 ${damageToBoss} 点伤害。${isCrit ? '(暴击!)' : ''} ${stanceLabel}\n`;
               } else {
                  turnLog += `你 激发【破魔】威能催动【${skill.name}】，无视防御重创魔罗，造成了 ${damageToBoss} 点伤害！${isCrit ? '(暴击!)' : ''} ${stanceLabel}\n`;
               }

               setIsBossHit(true);
               setTimeout(() => setIsBossHit(false), 200);
               
               setIsPlayerAttacking(true);
               setTimeout(() => setIsPlayerAttacking(false), 500);

               // 击晕抵抗转破招判定
               const stunProc = Math.random() * 100 <= (attrs.stunRate || 0);
               const isShihouStun = skill.id === 's_shihou' && Math.random() <= 0.6;
               if (stunProc || isShihouStun) {
                  bossDmgMultiplier = 0.5;
                  if (isShihouStun) {
                     turnLog += `✦ 运转【狮吼功】狂吼狂鸣！魔罗受音波震荡无法眩晕，但被震慑破招，本回合输出降低 50% ! \n`;
                  } else {
                     turnLog += `✦ 你的器灵触发【击晕】威能！魔罗受威压震慑无法眩晕，但进入了“破招威压”状态，本回合输出降低 50% ! \n`;
                  }
                  setTimeout(() => {
                     addEffect('debuff', 'right', 1.0);
                  }, 200);
               }

               // 吸星大法吸血判定
               if (skill.id === 's_xixing') {
                  const drainAmt = Math.floor(damageToBoss * 0.8);
                  userHp = Math.min(player.maxHp, userHp + drainAmt);
                  totalHeal += drainAmt;
                  turnLog += `✦ 【吸星大法】吸噬元气！你夺取了魔罗 ${drainAmt} 点气血化为己用！\n`;
                  setTimeout(() => {
                     addEffect('heal', 'left', 1.0);
                     addDamageNumber(drainAmt, 'left', true);
                  }, 300);
               }

               // 判定招式特效类型
               let effectType = 'swordSlash';
               if (skill.type === 'ultimate') {
                  effectType = 'ultimateBurst';
               } else if (
                  skill.name.includes('拳') ||
                  skill.name.includes('掌') ||
                  skill.name.includes('脚') ||
                  skill.name.includes('指') ||
                  skill.name.includes('手')
               ) {
                  effectType = 'fistPunch';
               }

               // 播放动作打击音效
               if (effectType === 'ultimateBurst') {
                  SoundManager.play('sfx_magic', 1.1);
               } else if (effectType === 'fistPunch') {
                  SoundManager.play('sfx_fist', 1.0);
               } else {
                  if (skill.name.includes('刀') || skill.name.includes('斩') || skill.name.includes('劈')) {
                     SoundManager.play('sfx_blade', 1.0);
                  } else {
                     SoundManager.play('sfx_sword', 1.0);
                  }
               }

               // 特效与伤害显示
               if (effectType === 'ultimateBurst') {
                  setSkillCast({ characterName: player.name, skillName: skill.name, skillId: skill.id, skillDesc: skill.desc || '招式神妙，威力骇人', position: 'left' });
                  setTimeout(() => {
                     addEffect('ultimateBurst', 'right', isCrit ? 2.5 : 1.5, skill.name, skill.id);
                     addDamageNumber(damageToBoss, 'right');
                  }, 580);
               } else {
                  let delay = 0;
                  if (effectType === 'fistPunch') delay = 400;

                  addEffect(effectType, 'right', isCrit ? 2 : 1, skill.name, skill.id);
                  if (delay > 0) {
                     setTimeout(() => {
                        addDamageNumber(damageToBoss, 'right');
                     }, delay);
                  } else {
                     addDamageNumber(damageToBoss, 'right');
                  }
               }

               setCurrentBattleState({ attacker: player.name, lastHit: '太古噬魂魔罗', effectType });

               // 反伤护盾 (幽冥法盾 / 本地回合反弹)
               if (activeStance === 'shielded') {
                  const reflect = Math.max(1, Math.floor(damageToBoss * 0.2));
                  userHp = Math.max(0, userHp - reflect);
                  turnLog += `✦ 幽冥法盾反震！你受到了 ${reflect} 点反噬伤害！\n`;
                  setIsPlayerHit(true);
                  setTimeout(() => setIsPlayerHit(false), 200);

                  setTimeout(() => {
                     addEffect('heavyHit', 'left', 1.0);
                     addDamageNumber(reflect, 'left');
                  }, 150);
               } else if (turn === 5 || turn === 12) {
                  const reflect = Math.floor(damageToBoss * 0.2);
                  userHp = Math.max(0, userHp - reflect);
                  turnLog += `你被魔罗的【血魂护盾】反弹了 ${reflect} 点伤害！\n`;
                  setIsPlayerHit(true);
                  setTimeout(() => setIsPlayerHit(false), 200);

                  setTimeout(() => {
                     addEffect('heavyHit', 'left', 1.0);
                     addDamageNumber(reflect, 'left');
                  }, 150);
               }

   

               // 中毒流血判定
               if (hasPoison || player.equippedTreasure === 't6') {
                  const poisonDmg = playerInt * 3 * 15;
                  bossHp = Math.max(0, bossHp - poisonDmg);
                  accumulatedDmg += poisonDmg;
                  turnLog += `✦ 毒素蚀骨！魔罗每回合流血，受到了 ${poisonDmg} 点固定中毒伤害。\n`;

                  setTimeout(() => {
                     addEffect('poison', 'right', 1.0);
                     addDamageNumber(poisonDmg, 'right');
                  }, 300);
               }

               bossHp = Math.max(0, bossHp - damageToBoss);
               accumulatedDmg += damageToBoss;
            }
         }

         // 3. Boss 普通反击 (非30回合秒杀且未死)
         if (bossHp > 0 && userHp > 0 && turn < 30) {
            const playerDef = (player.attributes.con || 0) * 2 + player.level * 2 + (playerTreasure?.attrs?.def || 0) + (attrs.extraDef || 0);
            let bossBaseDmg = 120 + turn * 20 - playerDef * 0.8;
            bossBaseDmg = Math.max(40, Math.floor(bossBaseDmg));

            // 相态修正 Boss 输出伤害
            if (activeStance === 'weakened') {
               bossBaseDmg = Math.floor(bossBaseDmg * 0.5);
            } else if (activeStance === 'frenzied') {
               bossBaseDmg = Math.floor(bossBaseDmg * 1.5);
            } else if (activeStance === 'shielded') {
               bossBaseDmg = Math.floor(bossBaseDmg * 0.85);
            }
            bossBaseDmg = Math.floor(bossBaseDmg * bossDmgMultiplier);
            bossBaseDmg = Math.max(10, bossBaseDmg);

            if (playerDodgeTurn) {
               turnLog += `魔罗 紧接着对你轰出一记邪灵煞气，但你运转闪避身法，身轻如燕巧妙躲开！`;
               SoundManager.play('sfx_dodge');
               addEffect('dodge', 'left', 1.0);
               setCurrentBattleState({ attacker: '太古噬魂魔罗', lastHit: null, dodger: player.name, effectType: 'dodge' });
            } else {
               userHp = Math.max(0, userHp - bossBaseDmg);
               turnLog += `魔罗 对你发出一记邪灵煞气，造成了 ${bossBaseDmg} 点反伤创击。(剩余HP: ${userHp}/${player.maxHp})`;
               
               setIsPlayerHit(true);
               setTimeout(() => setIsPlayerHit(false), 200);
               SoundManager.play('sfx_fist', 0.60);

               setIsBossAttacking(true);
               setTimeout(() => setIsBossAttacking(false), 500);

               addEffect('heavyHit', 'left', 1.2);
               addDamageNumber(bossBaseDmg, 'left');
               setCurrentBattleState({ attacker: '太古噬魂魔罗', lastHit: player.name, effectType: 'heavyHit' });
            }
         }
        setCurBossHp(bossHp);
        setCurUserHp(userHp);
        setBattleDmg(accumulatedDmg);
        setBattleLogs(prev => [...prev, turnLog]);
        turn++;
     }, 1200);
  };

  // 出价处理
  const handleBid = () => {
     if (bidPrice <= worldBossState.highestBid) {
        alert("出价必须高于当前最高竞拍价格！");
        return;
     }
     if (player.silver < bidPrice) {
        alert("你的银两不足！");
        return;
     }
     SoundManager.play('sfx_click');
     bidWorldBossAuction(bidPrice);
  };

  // 请战帖登记
  const handleSignup = () => {
     SoundManager.play('sfx_success');
     signupWorldBoss();
  };

  // 格式化倒计时
  const formatTime = (timeMs) => {
     const diff = timeMs - Date.now();
     if (diff <= 0) return "00:00";
     const min = Math.floor(diff / 60000);
     const sec = Math.floor((diff % 60000) / 1000);
     return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // 战友模拟数据以供并肩作战感
  const renderFightersList = () => {
     const fighters = worldBossState.fighters || {};
     const allFighters = Object.entries(fighters).map(([name, data]) => ({
        name,
        damage: data.damage,
        count: data.count
     })).sort((a,b) => b.damage - a.damage);

     return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
           {allFighters.slice(0, 5).map((f, i) => (
              <div key={f.name} style={{
                 padding: '0.6rem 0.8rem',
                 background: 'rgba(239, 68, 68, 0.05)',
                 borderLeft: `3px solid ${i === 0 ? 'var(--gold)' : 'var(--crimson)'}`,
                 borderRadius: '0 6px 6px 0',
                 display: 'flex',
                 justifyContent: 'space-between',
                 alignItems: 'center',
                 fontSize: '0.9rem'
              }}>
                 <div>
                    <span style={{ color: i === 0 ? 'var(--gold)' : '#fff', fontWeight: 'bold' }}>#{i+1} {f.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '6px' }}>({f.count}次挑战)</span>
                 </div>
                 <div style={{ color: 'var(--crimson)', fontFamily: 'Outfit' }}>
                    {f.damage.toLocaleString()} 伤
                 </div>
              </div>
           ))}
           {allFighters.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.85rem' }}>暂无讨伐记录，速速出战！</p>
           )}
           {allFighters.length > 5 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.8rem', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '6px' }}>
                 其余 {allFighters.length - 5} 名同道正合围御敌...
              </p>
           )}
        </div>
     );
  };

  return (
    <div className={`glass-panel boss-arena-main-panel animate-slide-up ${isScreenShaking ? 'arena-shake' : ''}`} style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #09090b 0%, #030303 100%)', color: '#eaeaea', border: '1px solid rgba(239, 68, 68, 0.25)', position: 'relative', overflow: 'hidden' }}>

      {/* 水墨刀光特效层 */}
      <div className="water-ink-bg" style={{
         position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
         background: 'radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.08), transparent 50%)',
         opacity: 0.8, pointerEvents: 'none', zIndex: 0
      }} />

      {/* 战友暴击飘字 Toast */}
      {strikeToast && (
         <div className="animate-fade-in-out" style={{
            position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
            background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.95), rgba(153, 27, 27, 0.95))',
            color: '#fff', padding: '0.6rem 2rem', borderRadius: '50px',
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.6)', zIndex: 100,
            fontSize: '1rem', fontWeight: 'bold', fontFamily: '"Ma Shan Zheng", cursive',
            display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--gold)'
         }}>
            <span>✦ 同道【{strikeToast.playerName}】大展神威，施展【{strikeToast.skillName}】暴击狂轰魔罗 {strikeToast.damage.toLocaleString()} 创伤！</span>
         </div>
      )}

      {/* 顶部标题 */}
      <div className="boss-arena-title-row" style={{ 
         display: 'flex', 
         justifyContent: 'space-between', 
         alignItems: 'center', 
         borderBottom: '1px solid rgba(255,255,255,0.1)', 
         paddingBottom: '1rem', 
         zIndex: 1,
         position: 'relative'
      }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {cleanBossHeaderPic && (
               <div style={{ position: 'relative', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* 背景邪煞紫气波动效果 */}
                  <div style={{
                     position: 'absolute', width: '60px', height: '60px', borderRadius: '50%',
                     background: 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 70%)',
                     animation: 'auraPulse 2s ease-in-out infinite'
                  }} />
                  <img 
                     src={cleanBossHeaderPic} 
                     alt="魔罗特写" 
                     style={{ 
                        height: '75px', 
                        objectFit: 'contain', 
                        filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.6))',
                        animation: 'bossFloat 4s ease-in-out infinite'
                     }} 
                  />
               </div>
            )}
            <div>
               <h2 style={{ 
                  fontSize: '2.4rem', 
                  color: 'var(--crimson)', 
                  fontFamily: '"Ma Shan Zheng", cursive', 
                  letterSpacing: '4px', 
                  textShadow: '0 0 12px rgba(239,68,68,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
               }}>
                  魔罗降世大殿
               </h2>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                  每周五晚上 19:00 - 24:00 诛杀怨气之源
               </p>
            </div>
         </div>
          <div className="boss-arena-title-indicators" style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', zIndex: 2 }}>
            <span style={{ fontSize: '0.95rem', color: '#fbbf24', background: 'rgba(251, 191, 36, 0.1)', padding: '0.4rem 1rem', borderRadius: '4px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
               武道精魂: <strong>{player.essence || 0} / 500</strong>
            </span>
            <span style={{ fontSize: '0.95rem', color: 'var(--jade)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.4rem 1rem', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
               银两: <strong>{player.silver || 0} 两</strong>
            </span>
         </div>
      </div>

      {/* 战斗内遮罩 */}
      {inBattle ? (
         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '1.5rem', zIndex: 1, overflow: 'hidden' }}>
            
            {/* 双方血量槽 */}
            <div className="boss-battle-health-row" style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
               <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                     <span>你的气血: {curUserHp} / {player.maxHp}</span>
                     <span>{(curUserHp / player.maxHp * 100).toFixed(0)}%</span>
                  </div>
                  <div style={{ height: '10px', background: '#333', borderRadius: '50px', overflow: 'hidden' }}>
                     <div style={{ height: '100%', width: `${curUserHp / player.maxHp * 100}%`, background: 'linear-gradient(90deg, #10b981, #059669)', transition: 'width 0.3s' }} />
                  </div>
               </div>
               <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem', color: 'var(--crimson)' }}>
                      <span>
                         魔罗邪魂 HP: {curBossHp.toLocaleString()} / {worldBossState.maxHp.toLocaleString()}
                         {worldBossState.stance && worldBossState.stance !== 'normal' && (
                            <span style={{
                               marginLeft: '8px',
                               padding: '1px 6px',
                               borderRadius: '3px',
                               fontSize: '0.75rem',
                               background: worldBossState.stance === 'weakened' ? 'rgba(16, 185, 129, 0.25)' :
                                           worldBossState.stance === 'frenzied' ? 'rgba(239, 68, 68, 0.25)' :
                                           'rgba(147, 51, 234, 0.25)',
                               border: worldBossState.stance === 'weakened' ? '1px solid var(--jade)' :
                                       worldBossState.stance === 'frenzied' ? '1px solid var(--crimson)' :
                                       '1px solid #c084fc',
                               color: worldBossState.stance === 'weakened' ? 'var(--jade)' :
                                      worldBossState.stance === 'frenzied' ? 'var(--crimson)' :
                                      '#c084fc',
                               fontWeight: 'bold'
                            }}>
                               {worldBossState.stance === 'weakened' ? '虚弱' :
                                worldBossState.stance === 'frenzied' ? '狂暴' :
                                '法盾'}
                            </span>
                         )}
                      </span>
                     <span>{(curBossHp / worldBossState.maxHp * 100).toFixed(1)}%</span>
                  </div>
                  <div style={{ height: '10px', background: '#333', borderRadius: '50px', overflow: 'hidden' }}>
                     <div style={{ height: '100%', width: `${curBossHp / worldBossState.maxHp * 100}%`, background: 'linear-gradient(90deg, #ef4444, #991b1b)', transition: 'width 0.3s' }} />
                  </div>
               </div>
            </div>

            {/* 双雄对局立绘展示区 */}
            <div className="boss-battle-vs-row" style={{
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'center',
               height: '260px',
               marginBottom: '1.5rem',
               padding: '0 2rem',
               background: 'radial-gradient(ellipse at center, rgba(15, 10, 10, 0.9) 0%, rgba(3, 3, 3, 0.98) 100%)',
               border: '1px solid rgba(239, 68, 68, 0.12)',
               borderRadius: '8px',
               position: 'relative'
            }}>
               {/* 背景水墨纹理 */}
               <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.04), transparent 70%)',
                  pointerEvents: 'none'
               }} />

               {/* 左侧：玩家卡片 */}
               <div 
                  className={`duel-card ${isPlayerHit ? 'hit-player' : ''} ${isPlayerAttacking ? 'player-attack' : ''}`}
                  style={{
                     width: '130px',
                     height: '180px',
                     position: 'relative',
                     transition: 'all 0.15s ease',
                     transform: 'scale(1.1)',
                     zIndex: 2
                  }}
               >
                  <EnhancedWarriorAvatar 
                     player={{
                        ...player,
                        hp: curUserHp,
                        buffs: playerBuffs,
                        debuffs: playerDebuffs
                     }}
                     isLeft={true}
                     isAttacking={isPlayerAttacking}
                     isHit={isPlayerHit}
                     isDead={curUserHp <= 0}
                  />
               </div>

               {/* 中间：VS 特效 */}
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                  <div style={{
                     fontFamily: '"Ma Shan Zheng", cursive',
                     fontSize: '3rem',
                     fontWeight: 'bold',
                     fontStyle: 'italic',
                     color: '#ef4444',
                     textShadow: '0 0 15px rgba(239, 68, 68, 0.8)',
                     animation: 'pulse 1.5s infinite',
                     letterSpacing: '2px'
                  }}>
                     VS
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', letterSpacing: '1px' }}>
                     御敌魔殿
                  </div>
               </div>

               {/* 右侧：世界 Boss 抠图立绘 */}
               <div 
                  className={`duel-card ${isBossHit ? 'hit-boss' : ''} ${isBossAttacking ? 'boss-attack' : ''}`}
                  style={{
                     width: '280px',
                     height: '240px',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     position: 'relative',
                     zIndex: 2,
                     transition: 'all 0.15s ease'
                  }}
               >
                  {/* 魔罗背后威压重力波涟漪 */}
                  <div style={{
                     position: 'absolute', width: '220px', height: '220px', borderRadius: '50%',
                     background: 'radial-gradient(circle, rgba(162, 28, 175, 0.25) 0%, transparent 70%)',
                     zIndex: 0,
                     animation: 'auraPulse 2s ease-in-out infinite'
                  }} />
                  <div style={{
                     position: 'absolute', width: '260px', height: '260px', borderRadius: '50%',
                     border: '1px solid rgba(239, 68, 68, 0.1)',
                     zIndex: 0,
                     animation: 'auraPulse 3s ease-in-out infinite',
                     animationDelay: '0.5s'
                  }} />

                  {/* 魔罗立绘 (物理抠图透明化，完美融入背景) */}
                  <img 
                     src={cleanBossPic} 
                     alt="太古噬魂魔罗"
                     style={{
                        height: '260px',
                        objectFit: 'contain',
                        zIndex: 1,
                        filter: isBossHit 
                           ? 'brightness(1.8) sepia(1) saturate(8) hue-rotate(-50deg) drop-shadow(0 0 25px red)' 
                           : 'drop-shadow(0 0 15px rgba(162, 28, 175, 0.7))',
                        animation: 'bossFloat 4s ease-in-out infinite',
                        transition: 'filter 0.15s ease'
                     }}
                  />
               </div>

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
                  position={currentBattleState.lastHit === player.name ? 'left' : 'right'}
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

            {/* 对决滚屏日志 */}
            <div ref={logsContainerRef} style={{ flex: 1, background: 'rgba(5, 5, 5, 0.95)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px', padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: '"Courier New", monospace', fontSize: '1rem', lineHeight: '1.7', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.9)' }}>
               {battleLogs.map((log, i) => (
                  <div key={i} style={{
                     color: log.startsWith('==') ? 'var(--gold)' : log.startsWith('👹') ? 'var(--crimson)' : log.includes('暴击!') ? '#fbbf24' : log.startsWith('✦') ? '#c084fc' : '#ccc',
                     whiteSpace: 'pre-line',
                     animation: 'fadeIn 0.3s'
                  }}>
                     {log}
                  </div>
               ))}
            </div>

            {/* 底部按钮 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem', alignItems: 'center' }}>
               <span style={{ fontSize: '1.1rem', color: 'var(--crimson)' }}>
                  当前累计输出创伤：<strong>{battleDmg.toLocaleString()}</strong> 
               </span>
               {battleState === 'finished' && (
                  <button className="btn-primary" style={{ padding: '0.8rem 2.5rem', background: 'linear-gradient(135deg, var(--gold), #b45309)' }} onClick={() => {
                     setInBattle(false);
                     fetchWorldBossState();
                  }}>
                     退回魔殿大厅
                  </button>
               )}
               {battleState === 'fighting' && (
                  <span style={{ color: 'var(--gold)', fontFamily: '"Ma Shan Zheng", cursive', animation: 'pulse 1s infinite' }}>
                     天昏地暗 激斗中...
                  </span>
               )}
            </div>
         </div>
      ) : (
         /* 大厅普通展示 */
          <div className="boss-lobby-main-row" style={{ flex: 1, display: 'flex', gap: '2rem', marginTop: '1.5rem', zIndex: 1, overflow: 'hidden' }}>
            
            {/* 左侧 Boss 状态面板 */}
             <div className="boss-lobby-left" style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '8px' }}>
               
               {/* Boss 状态卡 */}
               <div className="wuxia-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', position: 'relative' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                     <div style={{ 
                        position: 'relative', 
                        width: '160px', 
                        height: '160px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        background: 'radial-gradient(circle, rgba(220, 20, 60, 0.18) 0%, transparent 75%)',
                        borderRadius: '50%',
                        border: '1px dashed rgba(220, 20, 60, 0.35)',
                        boxShadow: '0 0 30px rgba(220, 20, 60, 0.1)'
                     }}>
                        <img 
                           src={cleanDemonSword} 
                           alt="魔罗宝剑" 
                           style={{ 
                              width: '110px', 
                              height: '110px', 
                              objectFit: 'contain', 
                              display: 'block', 
                              filter: 'drop-shadow(0 0 10px rgba(220, 20, 60, 0.8))',
                              animation: 'wuxia-float 4s ease-in-out infinite'
                           }} 
                        />
                     </div>
                  </div>
                  
                  <h3 style={{ fontSize: '1.8rem', fontFamily: '"Ma Shan Zheng", cursive', color: 'var(--crimson)' }}>
                     太古噬魂魔罗
                  </h3>
                  
                  {/* 状态徽章 */}
                  {worldBossState.active && worldBossState.stance && worldBossState.stance !== 'normal' && (
                     <div style={{
                        marginTop: '0.5rem',
                        display: 'inline-block',
                        padding: '0.3rem 1.2rem',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        background: worldBossState.stance === 'weakened' ? 'rgba(16, 185, 129, 0.15)' :
                                    worldBossState.stance === 'frenzied' ? 'rgba(239, 68, 68, 0.15)' :
                                    'rgba(147, 51, 234, 0.15)',
                        border: worldBossState.stance === 'weakened' ? '1px solid var(--jade)' :
                                worldBossState.stance === 'frenzied' ? '1px solid var(--crimson)' :
                                '1px solid #c084fc',
                        color: worldBossState.stance === 'weakened' ? 'var(--jade)' :
                               worldBossState.stance === 'frenzied' ? 'var(--crimson)' :
                               '#c084fc',
                        boxShadow: worldBossState.stance === 'weakened' ? '0 0 10px rgba(16, 185, 129, 0.2)' :
                                   worldBossState.stance === 'frenzied' ? '0 0 10px rgba(239, 68, 68, 0.2)' :
                                   '0 0 10px rgba(147, 51, 234, 0.2)',
                        animation: 'pulse 1.5s infinite'
                     }}>
                        ⚠️ {
                           worldBossState.stance === 'weakened' ? '封印虚弱' :
                           worldBossState.stance === 'frenzied' ? '混沌狂魔' :
                           '幽冥法盾'
                        }相态 (尚余 {worldBossState.stanceRemainingHp?.toLocaleString()} 承伤后恢复常态)
                     </div>
                  )}
                  
                  {/* 状态判定与进度展示 */}
                  {worldBossState.active ? (
                     <div style={{ marginTop: '1rem' }}>
                        <p style={{ color: 'var(--gold)', fontSize: '1.1rem', fontWeight: 'bold' }}>
                           💀 怨灵魔尊已然显化降世！
                        </p>
                        <div style={{ marginTop: '1rem' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                              <span>全服共享血量: {worldBossState.hp.toLocaleString()} / {worldBossState.maxHp.toLocaleString()}</span>
                              <span>{(worldBossState.hp / worldBossState.maxHp * 100).toFixed(2)}%</span>
                           </div>
                           <div style={{ height: '14px', background: '#222', borderRadius: '50px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                              <div style={{ height: '100%', width: `${worldBossState.hp / worldBossState.maxHp * 100}%`, background: 'linear-gradient(90deg, #dc2626, #7f1d1d)', transition: 'width 0.4s' }} />
                           </div>
                        </div>
                        {worldBossState.hp > 0 ? (
                           <button className="btn-primary animate-pulse" onClick={startBossFight} style={{ marginTop: '1.5rem', padding: '1rem 3.5rem', fontSize: '1.2rem', background: 'linear-gradient(135deg, #dc2626, #7f1d1d)', color: '#fff', boxShadow: '0 0 20px rgba(220, 38, 38, 0.4)' }}>
                              <Play size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} /> 消耗 10 精魂，进殿降魔
                           </button>
                        ) : (
                           <div style={{ marginTop: '1.5rem', color: 'var(--jade)', fontSize: '1.2rem', fontFamily: '"Ma Shan Zheng", cursive' }}>
                              🎉 魔尊已被诸位大侠剿灭！最后一击由 【{worldBossState.lastHitBy}】 完成！
                           </div>
                        )}
                     </div>
                  ) : worldBossState.signupOpen ? (
                     <div style={{ marginTop: '1rem' }}>
                        <p style={{ color: 'var(--gold)', fontSize: '1.1rem' }}>
                           📢 请战帖投递中 (降临倒计时)
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                           已有 {worldBossState.signups.length} 名大侠投递请战帖登记参战。
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                           {worldBossState.signups.includes(player.name) ? (
                              <span style={{ color: 'var(--jade)', padding: '0.6rem 2rem', background: 'rgba(16,185,129,0.1)', border: '1px dashed var(--jade)', borderRadius: '4px' }}>
                                 ✓ 大侠已递交请战帖
                              </span>
                           ) : (
                              <button className="btn-primary" onClick={handleSignup} style={{ padding: '0.8rem 2.5rem', background: 'linear-gradient(135deg, var(--gold), #b45309)' }}>
                                 投递请战帖 (登记意向)
                              </button>
                           )}
                        </div>
                     </div>
                  ) : worldBossState.auctionActive ? (
                     <div style={{ marginTop: '1rem' }}>
                        <p style={{ color: '#c084fc', fontSize: '1.2rem', fontFamily: '"Ma Shan Zheng", cursive' }}>
                           ⚖ 神话秘宝限时竞拍中！
                        </p>
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(192, 132, 252, 0.3)', borderRadius: '8px', marginTop: '1rem', display: 'inline-block', minWidth: '300px' }}>
                           <h4 style={{ color: 'var(--gold)', fontSize: '1.2rem' }}>【{worldBossState.auctionItem?.name}】</h4>
                           <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>物品等阶: 神话本命宝物</p>
                           <p style={{ fontSize: '1.1rem', marginTop: '8px' }}>
                              当前最高出价: <strong style={{ color: 'var(--gold)' }}>{worldBossState.highestBid || 100}</strong> 银两
                           </p>
                           <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                              最高出价者: {worldBossState.highestBidder || '黑市商会 (系统保底回购)'}
                           </p>
                           <p style={{ fontSize: '0.85rem', color: 'var(--crimson)', marginTop: '6px' }}>
                              倒计时: {formatTime(worldBossState.auctionEndTime)}
                           </p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1.5rem' }}>
                           <input 
                              type="number" 
                              value={bidPrice}
                              onChange={(e) => setBidPrice(parseInt(e.target.value) || 0)}
                              placeholder={`起拍价 > ${worldBossState.highestBid}`}
                              style={{ width: '130px', padding: '0.5rem', background: '#111', border: '1px solid #c084fc', borderRadius: '4px', color: '#fff', textAlign: 'center' }}
                           />
                           <button className="btn-primary" onClick={handleBid} style={{ padding: '0.5rem 2rem', background: 'linear-gradient(135deg, #c084fc, #7c3aed)' }}>
                              加价出资
                           </button>
                        </div>
                     </div>
                  ) : (
                     <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
                        大魔罗尚未显化，虚空风暴积蓄中。请诸位大侠关注周五限时开启公告！
                     </p>
                  )}
               </div>

               {/* 玩法说明 */}
               <div className="wuxia-card" style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.85rem', lineHeight: '1.7' }}>
                  <h4 style={{ color: 'var(--gold)', marginBottom: '6px', fontSize: '0.95rem' }}>讨伐魔尊战纪规诫</h4>
                  <p>1. **请战登记**：周五中午 12:00 至晚上 19:00。Boss HP 以实际登记人数为准（平滑公式，杜绝死号撑血）。中途参战亦可但血上限不再增加。</p>
                  <p>2. **克制克制**：Boss 默认拥有 80% 的受创减免，宝物上的【破魔】词条可以直接刺破该护体！</p>
                  <p>3. **击晕特化**：Boss 免疫眩晕，但受击晕影响时触发“破招威压”，其本回合反噬攻击降低 50%。</p>
                  <p>4. **分红机制**：剿灭魔罗后，爆出的神物将在 23:00 公开竞拍。流拍则由商会以 100 银两强行回收。除去 10% 税收，所得 90% 银两全员按输出百分比派发大分红！</p>
               </div>
            </div>

            {/* 右侧 并肩作战/输出排行 看板 */}
             <div className="boss-lobby-right" style={{ flex: 1.2, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
               <h3 style={{ fontSize: '1.2rem', fontFamily: '"Ma Shan Zheng", cursive', color: 'var(--crimson)', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={18} /> 并肩御敌榜
               </h3>
               <div style={{ flex: 1, overflowY: 'auto' }}>
                  {renderFightersList()}
               </div>
            </div>

         </div>
      )}

      {/* 底部开发者调试控制面板 */}
      {typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
         <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', zIndex: 1, background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '6px' }}>
            <h5 style={{ color: 'var(--gold)', fontSize: '0.8rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
               <ShieldAlert size={12} /> 【开发调试控制台】（仅用于本功能联调测试）：
            </h5>
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
               <button className="btn-secondary" onClick={() => devControlWorldBoss('open_signup')} style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>开启请战帖登记</button>
               <button className="btn-secondary" onClick={() => devControlWorldBoss('spawn_boss')} style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>强制Boss显化降世</button>
               <button className="btn-secondary" onClick={() => devControlWorldBoss('trigger_auction')} style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>强制开启爆装竞拍</button>
               <button className="btn-secondary" onClick={() => devControlWorldBoss('force_auction_end')} style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>强制竞拍截止(分红/发放)</button>
               <button className="btn-secondary" onClick={() => devControlWorldBoss('set_stance_weakened')} style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem', borderColor: 'var(--jade)', color: 'var(--jade)' }}>强制设为虚弱相态</button>
               <button className="btn-secondary" onClick={() => devControlWorldBoss('set_stance_frenzied')} style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem', borderColor: 'var(--crimson)', color: 'var(--crimson)' }}>强制设为狂暴相态</button>
               <button className="btn-secondary" onClick={() => devControlWorldBoss('set_stance_shielded')} style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem', borderColor: '#c084fc', color: '#c084fc' }}>强制设为法盾相态</button>
               <button className="btn-secondary" onClick={() => devControlWorldBoss('set_stance_normal')} style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>重置为常态</button>
               <button className="btn-secondary" onClick={() => devControlWorldBoss('reset')} style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem', borderColor: 'var(--danger)' }}>重置清空状态</button>
            </div>
         </div>
      )}

      <style>{`
        @keyframes arena-shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(0px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(2px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(2px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }

        .arena-shake {
          animation: arena-shake 0.15s infinite;
        }

        @keyframes bossFloat {
          0%, 100% { transform: translateY(0px) scale(1.0); }
          50% { transform: translateY(-8px) scale(1.03); }
        }

        @keyframes auraPulse {
          0%, 100% { transform: scale(0.9); opacity: 0.15; }
          50% { transform: scale(1.3); opacity: 0.4; }
        }

        @keyframes bossHitShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-10px); }
          40%, 80% { transform: translateX(10px); }
        }

        @keyframes playerHitShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateY(-6px) translateX(-6px); }
          75% { transform: translateY(6px) translateX(6px); }
        }

        /* 全屏特效 */
        .vfx-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: 9999;
          transition: all 0.3s ease;
        }

        /* 魔罗乱神：幽紫色心魔力场 */
        .vfx-chaos {
          background: radial-gradient(circle, rgba(147, 51, 234, 0.55) 0%, rgba(88, 28, 135, 0.75) 75%, rgba(10, 5, 15, 0.9) 100%);
          animation: vfxChaosPulse 1.2s ease-in-out infinite alternate;
        }
        @keyframes vfxChaosPulse {
          0% { opacity: 0.6; filter: hue-rotate(0deg) blur(3px); }
          100% { opacity: 0.95; filter: hue-rotate(30deg) blur(6px); }
        }

        /* 邪煞夺魄：暗红魔影撕咬 */
        .vfx-shadow {
          background: radial-gradient(circle, rgba(220, 38, 38, 0.85) 10%, rgba(127, 29, 29, 0.9) 65%, rgba(10, 2, 2, 0.95) 100%);
          animation: vfxShadowFade 1.2s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }
        @keyframes vfxShadowFade {
          0% { transform: scale(0.7); opacity: 0; }
          20% { transform: scale(1.15); opacity: 1; filter: brightness(1.6); }
          100% { transform: scale(1.0); opacity: 0; }
        }

        /* 太古魔啸：震荡与音波 */
        .vfx-roar {
          background: repeating-linear-gradient(90deg, rgba(220, 38, 38, 0.25), rgba(220, 38, 38, 0.35) 20px, rgba(15, 5, 5, 0.5) 40px);
          animation: vfxRoarWave 0.2s linear infinite;
          opacity: 0.9;
        }
        @keyframes vfxRoarWave {
          0% { background-position: 0px 0; }
          100% { background-position: 80px 0; }
        }

        /* 诸神寂灭：灭世雷电 */
        .vfx-extinction {
          background: #000;
          animation: vfxExtinctionLightning 1.2s ease-in-out forwards;
        }
        @keyframes vfxExtinctionLightning {
          0% { background: #000; opacity: 1; }
          15% { background: #fff; opacity: 1; }
          20% { background: #120024; opacity: 1; }
          35% { background: #fff; opacity: 1; }
          40% { background: #000; opacity: 1; }
          45% { background: #a855f7; opacity: 1; }
          100% { background: #000; opacity: 0; }
        }

        /* 对决卡片样式 */
        .duel-card {
          transition: all 0.2s ease;
        }
        .duel-card.hit-boss {
          animation: bossHitShake 0.2s ease-in-out;
        }
        .duel-card.hit-player {
          animation: playerHitShake 0.2s ease-in-out;
        }
        @keyframes playerAttack {
          0% { transform: scale(1) translate(0, 0); }
          15% { transform: scale(0.96) translate(-30px, 8px) rotate(-5deg); }
          35% { transform: scale(1.1) translate(120px, -20px) rotate(8deg); filter: brightness(1.3) drop-shadow(0 0 15px var(--gold)); }
          60% { transform: scale(1.02) translate(20px, -5px) rotate(3deg); }
          100% { transform: scale(1) translate(0, 0); }
        }
        .duel-card.player-attack {
          animation: playerAttack 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        @keyframes bossAttack {
          0% { transform: translateX(0) scale(1.0); }
          25% { transform: translateX(-120px) translateY(5px) scale(1.05); }
          50% { transform: translateX(15px) translateY(-2px) scale(0.98); }
          100% { transform: translateX(0) scale(1.0); }
        }
        .duel-card.boss-attack {
          animation: bossAttack 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
      `}</style>

      {/* 全屏功法特效层 */}
      {activeVfx !== 'none' && (
         <div className={`vfx-overlay vfx-${activeVfx}`} style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            pointerEvents: 'none', zIndex: 9999
         }} />
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useGameStore, SKILLS_DB, TREASURES_DB } from '../store/gameState';
import { Skull, Swords, Gift } from 'lucide-react';

export default function EncounterArena() {
  const player = useGameStore(state => state.player);
  const onlinePlayers = useGameStore(state => state.onlinePlayers);
  const gainExp = useGameStore(state => state.gainExp);
  const incrementEncounterCount = useGameStore(state => state.incrementEncounterCount);
  const gainTreasure = useGameStore(state => state.gainTreasure);

  const [encounterState, setEncounterState] = useState('idle'); // idle, battling, win, lose
  const [team, setTeam] = useState([]);
  const [currentEnemyIndex, setCurrentEnemyIndex] = useState(0);
  
  const [p1, setP1] = useState(null);
  const [p2, setP2] = useState(null);
  const [logs, setLogs] = useState([]);

  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const startEncounter = () => {
     if ((player.encountersToday || 0) >= 5) {
         alert("今日奇遇次数已达上限，大侠请明日再来！");
         return;
     }
     const bots = onlinePlayers.filter(p => p.isMock);
     if (bots.length < 3) {
         alert("江湖尚未完全成型，凑不齐三位高手。");
         return;
     }
     
     incrementEncounterCount();

     const bossCands = bots.filter(b => b.rankIndex <= 10);
     const boss = bossCands[Math.floor(Math.random() * bossCands.length)] || bots[0];

     const remainingBots = bots.filter(b => b.id !== boss.id);
     
     let lowerBots = remainingBots.filter(b => b.level < player.level);
     if (lowerBots.length === 0) lowerBots = remainingBots;
     const enemy1 = lowerBots[Math.floor(Math.random() * lowerBots.length)];

     const r2 = remainingBots.filter(b => b.id !== enemy1.id);
     let higherBots = r2.filter(b => b.level >= player.level && b.level <= player.level + 5);
     if (higherBots.length === 0) higherBots = r2;
     const enemy2 = higherBots[Math.floor(Math.random() * higherBots.length)];

     const selectedTeam = [enemy1, enemy2, boss];
     
     setTeam(selectedTeam);
     setCurrentEnemyIndex(0);
     
     const myPlayer = { 
         ...player, 
         hp: player.maxHp * 2, maxHp: player.maxHp * 2,
         buffs: { dodge: 0, defUp: 0, shield: 0, revive: 0 },
         debuffs: { stun: 0, poison: 0, silence: 0, internalWound: 0 }
     };
     
     setP1(myPlayer);
     setupNextEnemy(myPlayer, selectedTeam, 0);
  };

  const setupNextEnemy = (currentP1, currentTeam, idx) => {
     const enemy = { 
         ...currentTeam[idx],
         buffs: { dodge: 0, defUp: 0, shield: 0, revive: 0 },
         debuffs: { stun: 0, poison: 0, silence: 0, internalWound: 0 }
     };
     setP2(enemy);
     setP1(currentP1);
     setEncounterState('battling');
     setLogs([`\n=== 第 ${idx+1} 战：对阵 ${enemy.name} ===`]);
  };

  useEffect(() => {
    if (encounterState !== 'battling' || !p1 || !p2) return;

    const timer = setTimeout(() => {
      const isP1Turn = Math.random() < (p1.attributes.agi / (p1.attributes.agi + p2.attributes.agi + 1));

      let attacker = { ... (isP1Turn ? p1 : p2) };
      let defender = { ... (isP1Turn ? p2 : p1) };

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
         if (aTreasure?.effect === 'ningShen') {
             attacker.buffs.shield += Math.floor(attacker.maxHp * 0.05);
             logPrefix += `[开局] ${attacker.name} 获得护盾！\n`;
         }
         if (dTreasure?.effect === 'ningShen') {
             defender.buffs.shield += Math.floor(defender.maxHp * 0.05);
             logPrefix += `[开局] ${defender.name} 获得护盾！\n`;
         }
         if (aTreasure?.effect === 'shengHuo' && !checkImmune(defender, dTreasure, 'silence')) defender.debuffs.silence = 2;
         if (dTreasure?.effect === 'shengHuo' && !checkImmune(attacker, aTreasure, 'silence')) attacker.debuffs.silence = 2;
      }

      if (attacker.debuffs.poison > 0) {
         const pDmg = Math.max(1, Math.floor(attacker.maxHp * 0.03));
         attacker.hp = Math.max(1, attacker.hp - pDmg);
         attacker.debuffs.poison--;
         logPrefix += `[中毒] ${attacker.name} 损失 ${pDmg} 气血！\n`;
      }

      let actionLog = "";
      if (attacker.debuffs.stun > 0) {
         attacker.debuffs.stun--;
         actionLog = `${attacker.name} 晕眩无法动弹！`;
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
         const dDefBase = defender.attributes.con * 2 + defender.level * 2;
         const aMod = 1 + attacker.level * 0.05;
         const adjustedSkillPwr = skill.power * aMod;

         if (skill.type === 'heal') {
            const healAmt = Math.floor(adjustedSkillPwr + attacker.attributes.int * 2 + 30);
            attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmt);
            actionLog = `${attacker.name} 使出【${skill.name}】，恢复了 ${healAmt} 点气血！`;
         } else if (skill.type === 'buff' || skill.type === 'motion' || skill.power === 0) {
            if (skill.id === 's4' || skill.id === 's_tiyun') { 
              attacker.buffs.dodge = 3; actionLog = `${attacker.name} 【${skill.name}】闪避大增！`;
            } else if (skill.id === 's_shenxing') {
              attacker.buffs.dodge = 99; actionLog = `${attacker.name} 施出【${skill.name}】身法鬼魅！`;
            } else if (skill.id === 's5' || skill.id === 's_yijin') { 
              attacker.buffs.defUp = 3; actionLog = `${attacker.name} 【${skill.name}】真气护体防御大增！`;
              if (skill.id === 's_yijin' && attacker.debuffs.poison > 0) {
                  attacker.debuffs.poison = 0; actionLog += ` 猛然逼出全部毒素！`;
              }
            } else if (skill.id === 's_shengxin') {
              attacker.buffs.revive = 1; actionLog = `${attacker.name} 运转【${skill.name}】获得涅槃重生状态！`;
            } else {
              attacker.buffs.dodge = 2; actionLog = `${attacker.name} 施展【${skill.name}】！`;
            }
         } else {
            let isDodge = aTreasure?.effect !== 'xuanTie' && (Math.random() < (defender.attributes.agi * 0.005) || (defender.buffs.dodge > 0 ? Math.random() < 0.45 : false));
            
            if (isDodge) {
               actionLog = `${attacker.name} 的【${skill.name}】被闪开！`;
            } else {
               let finalDef = dDefBase * 0.5 * (defender.buffs.defUp > 0 ? 2 : 1);
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
                   actionLog = `[寂灭] ${attacker.name} 的【绝世好剑】削去 ${defender.name} 半数气血！ `;
               }

               if (defender.buffs.shield > 0) {
                   if (defender.buffs.shield >= dmg) { defender.buffs.shield -= dmg; dmg = 0; } 
                   else { dmg -= defender.buffs.shield; defender.buffs.shield = 0; }
               }
               defender.hp = Math.max(0, defender.hp - dmg);
               
               if (dmg > 0 && aTreasure?.effect === 'huiChun') attacker.hp = Math.min(attacker.maxHp, attacker.hp + Math.floor(attacker.maxHp * 0.02));
               if (dmg > 0 && aTreasure?.effect === 'yiTian') attacker.hp = Math.min(attacker.maxHp, Math.floor(attacker.hp + dmg * 0.15));

               if (!actionLog.includes('[寂灭]')) {
                  actionLog = `${attacker.name} 使出【${skill.name}】，造成 ${dmg} 伤害！`;
               }

               if (dmg > 0 && dTreasure?.effect === 'ruanWei') {
                  const rDmg = Math.floor(dmg * 0.15); attacker.hp -= rDmg;
                  actionLog += ` [反伤] ${rDmg}！`;
               }
               if (aTreasure?.effect === 'jinShe' && defender.hp > 0 && Math.random() <= 0.20) {
                   const comboDmg = Math.max(1, Math.floor(dmg * 0.5)); defender.hp = Math.max(0, defender.hp - comboDmg);
                   actionLog += ` [追击] ${comboDmg}！`;
               }

               if (dmg > 0 && skill.id === 's_xixing') {
                   const drainAmt = Math.floor(dmg * 0.8);
                   attacker.hp = Math.min(attacker.maxHp, attacker.hp + drainAmt);
                   actionLog += ` [吸星大法]恢复 +${drainAmt}！`;
               }

               // 特效施加判定 
               if (defender.hp > 0) {
                  if (skill.id === 's_du' && !checkImmune(defender, dTreasure, 'poison')) {
                      defender.debuffs.poison = 999; actionLog += ` [万毒] 永久中毒！`;
                  }
                  if (skill.id === 's_shihou' && Math.random() <= 0.6 && !checkImmune(defender, dTreasure, 'stun')) {
                      defender.debuffs.stun = 1; actionLog += ` [狮吼] 眩晕！`;
                  }
                  if (skill.id === 's_dianxue' && Math.random() <= 0.8 && !checkImmune(defender, dTreasure, 'silence')) {
                      defender.debuffs.silence = 2; actionLog += ` [点穴] 封印定身！`;
                  }

                  if (aTreasure?.effect === 'dianXue' && Math.random() <= 0.10 && !checkImmune(defender, dTreasure, 'silence')) defender.debuffs.silence = 1;
                  if (aTreasure?.effect === 'juDu' && Math.random() <= 0.15 && !checkImmune(defender, dTreasure, 'poison')) defender.debuffs.poison = 3;
                  if (aTreasure?.effect === 'daGou' && Math.random() <= 0.15 && !checkImmune(defender, dTreasure, 'stun')) defender.debuffs.stun = 1;
                  if (aTreasure?.effect === 'xuanTie' && Math.random() <= 0.20 && !checkImmune(defender, dTreasure, 'internalWound')) defender.debuffs.internalWound = 2;
               }
            }
         }
      }

      if (attacker.buffs.dodge > 0) attacker.buffs.dodge--;
      if (attacker.buffs.defUp > 0) attacker.buffs.defUp--;

      if (attacker.hp <= 0 && aTreasure?.effect === 'niePan' && !attacker.hasRevived) {
          attacker.hp = Math.floor(attacker.maxHp * 0.5);
          attacker.debuffs = { stun: 0, poison: 0, silence: 0, internalWound: 0 };
          attacker.hasRevived = true;
          actionLog += `\n[涅槃] ${attacker.name} 复活！`;
      } else if (attacker.hp <= 0 && attacker.buffs.revive > 0) {
          attacker.hp = Math.floor(attacker.maxHp * 0.5);
          attacker.debuffs = { stun: 0, poison: 0, silence: 0, internalWound: 0 };
          attacker.buffs.revive--;
          actionLog += `\n[圣心涅槃] ${attacker.name} 凭借圣心诀真气，起死回生！`;
      }
      if (defender.hp <= 0 && dTreasure?.effect === 'niePan' && !defender.hasRevived) {
          defender.hp = Math.floor(defender.maxHp * 0.5);
          defender.debuffs = { stun: 0, poison: 0, silence: 0, internalWound: 0 };
          defender.hasRevived = true;
          actionLog += `\n[涅槃] ${defender.name} 复活！`;
      } else if (defender.hp <= 0 && defender.buffs.revive > 0) {
          defender.hp = Math.floor(defender.maxHp * 0.5);
          defender.debuffs = { stun: 0, poison: 0, silence: 0, internalWound: 0 };
          defender.buffs.revive--;
          actionLog += `\n[圣心涅槃] ${defender.name} 凭借圣心诀真气，起死回生！`;
      }

      const finalLog = logPrefix + actionLog;
      setLogs(prev => [...prev, finalLog]);

      if (attacker.hp <= 0 || defender.hp <= 0) {
         const p1Won = isP1Turn ? defender.hp <= 0 : attacker.hp <= 0;
         const finalP1 = isP1Turn ? attacker : defender;

         if (p1Won) {
            if (currentEnemyIndex >= 2) {
               // 连胜3人，胜利结算
               let expReward = 0;
               let droppedTreasure = null;
               team.forEach(t => {
                   expReward += Math.floor((100 - t.rankIndex) * 20 + t.level * 10);
                   if (t.equippedTreasure) {
                       const dropChance = 0.05 + Math.min(0.2, player.attributes.luk * 0.01);
                       if (Math.random() < dropChance) droppedTreasure = t.equippedTreasure;
                   }
               });
               gainExp(expReward);
               if (droppedTreasure) gainTreasure(droppedTreasure);

               setLogs(prev => [...prev, `\n====== 奇遇大捷！======\n连破三敌，威震江湖！\n获得修为：${expReward}` + (droppedTreasure ? `\n🎁 获得绝世宝物：[${TREASURES_DB.find(t=>t.id===droppedTreasure)?.name}]` : '')]);
               setEncounterState('win');
            } else {
               setLogs(prev => [...prev, `\n战胜 ${defender.name}！进入下一战...`]);
               setTimeout(() => setupNextEnemy(finalP1, team, currentEnemyIndex + 1), 2000);
               setCurrentEnemyIndex(currentEnemyIndex + 1);
            }
         } else {
            setLogs(prev => [...prev, `\n====== 战败 ====== \n不敌对手，大侠请重新来过...`]);
            setEncounterState('lose');
         }
      } else {
         if (isP1Turn) { setP1(attacker); setP2(defender); } else { setP1(defender); setP2(attacker); }
      }

    }, 1000);
    return () => clearTimeout(timer);
  }, [encounterState, p1, p2, logs.length]);

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
       <h2 style={{ fontSize: '1.8rem', color: 'var(--warn)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Skull /> 江湖奇遇 <span style={{fontSize: '1rem', color: 'var(--text-muted)'}}>今日剩余：{5 - (player.encountersToday || 0)} 次</span>
      </h2>
      
      {encounterState === 'idle' ? (
         <div style={{ textAlign: 'center', marginTop: '4rem' }}>
         <p style={{ color: 'var(--text-main)', marginBottom: '2rem', fontSize: '1.1rem' }}>你将连续挑战来自《江湖风云榜》的三人小队。<br/>血气虽会翻倍但在车轮战中绝不恢复！<br/>若能连胜，将有机会缴获敌方宝具。</p>
         <button className="btn-primary" onClick={startEncounter} style={{ padding: '1rem 3rem', fontSize: '1.2rem', background: 'var(--warn)', color: '#000' }}>开启奇遇连战</button>
       </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px' }}>
            <div style={{ width: '42%' }}>
              <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{p1?.name} (双倍气血)</h4>
              <div style={{ height: '12px', background: 'var(--glass-border)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(p1?.hp / p1?.maxHp) * 100}%`, background: 'var(--success)', transition: 'width 0.3s' }}></div>
              </div>
              <div style={{ fontSize: '0.8rem', textAlign: 'right', marginTop: '4px' }}>{Math.floor(p1?.hp || 0)} / {Math.floor(p1?.maxHp || 0)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
               <h3 style={{ color: 'var(--danger)', filter: 'drop-shadow(0 0 5px var(--danger))' }}>VS</h3>
               <span style={{ fontSize: '0.8rem', color: 'var(--warn)' }}>{currentEnemyIndex + 1} / 3</span>
            </div>
            <div style={{ width: '42%' }}>
               <h4 style={{ color: 'var(--warn)', marginBottom: '0.5rem', textAlign: 'right' }}>{p2?.name}</h4>
               <div style={{ height: '12px', background: 'var(--glass-border)', borderRadius: '6px', overflow: 'hidden', transform: 'rotate(180deg)' }}>
                <div style={{ height: '100%', width: `${(p2?.hp / p2?.maxHp) * 100}%`, background: 'var(--danger)', transition: 'width 0.3s' }}></div>
              </div>
              <div style={{ fontSize: '0.8rem', textAlign: 'left', marginTop: '4px' }}>{Math.floor(p2?.hp || 0)} / {Math.floor(p2?.maxHp || 0)}</div>
            </div>
          </div>

          <div style={{ flex: 1, background: 'var(--bg-color)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'monospace', fontSize: '1rem' }}>
            {logs.map((log, i) => (
              <div key={i} style={{ 
                color: log.includes('宝物') ? '#facc15' : log.includes('===') ? 'var(--primary)' : log.includes(player.name) ? 'var(--text-main)' : 'var(--danger)', 
                fontWeight: log.includes('宝物') || log.includes('===') ? 'bold' : 'normal',
                whiteSpace: 'pre-line',
                animation: 'slideUp 0.3s' 
              }}>
                {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>

          {(encounterState === 'win' || encounterState === 'lose') && (
            <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => { setEncounterState('idle'); setLogs([]); }}>退下调息 (返回)</button>
          )}
        </div>
      )}
    </div>
  );
}

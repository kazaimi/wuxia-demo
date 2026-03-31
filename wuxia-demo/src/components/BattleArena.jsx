import React, { useEffect, useRef } from 'react';
import { useGameStore, SKILLS_DB } from '../store/gameState';
import { Swords } from 'lucide-react';

export default function BattleArena() {
  const player = useGameStore(state => state.player);
  const battleState = useGameStore(state => state.battleState);
  const { inBattle, p1, p2, logs, winner, roomId } = battleState;
  const sendBattleAction = useGameStore(state => state.sendBattleAction);
  const exitBattle = useGameStore(state => state.exitBattle);
  
  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (!inBattle || winner || !p1 || !p2) return;
    if (p1.name !== player.name) return;

    const timer = setTimeout(() => {
      const isP1Turn = Math.random() < (p1.attributes.agi / (p1.attributes.agi + p2.attributes.agi + 1));
      let actionData = {};

      const p1Atk = p1.attributes.str * 2 + p1.level * 5;
      const p1Def = p1.attributes.con * 2 + p1.level * 2;
      const p2Atk = p2.attributes.str * 2 + p2.level * 5;
      const p2Def = p2.attributes.con * 2 + p2.level * 2;

      // 动态权重释放：智慧(int)与技能威力(power)产生连携，高智慧极大增加无上绝学的使用概率
      const pickSkill = (playerObj) => {
         if (!playerObj.equippedSkills || playerObj.equippedSkills.length === 0) return SKILLS_DB[0];
         let totalWeight = 0;
         const weightedSkills = playerObj.equippedSkills.map(skillId => {
             const skill = SKILLS_DB.find(s => s.id === skillId) || SKILLS_DB[0];
             const weight = 100 + (skill.power / 10) * (playerObj.attributes.int || 0) * 1.5;
             totalWeight += weight;
             return { skill, weight };
         });
         let rand = Math.random() * totalWeight;
         for (const item of weightedSkills) {
             if (rand < item.weight) return item.skill;
             rand -= item.weight;
         }
         return weightedSkills[weightedSkills.length - 1].skill;
      };

      const skill1 = pickSkill(p1);
      const skill2 = pickSkill(p2);
      
      const attackerKey = isP1Turn ? 'p1' : 'p2';
      const defenderKey = isP1Turn ? 'p2' : 'p1';
      const attacker = isP1Turn ? p1 : p2;
      const defender = isP1Turn ? p2 : p1;
      const skill = isP1Turn ? skill1 : skill2;
      
      const aAtk = isP1Turn ? p1Atk : p2Atk;
      const aDef = isP1Turn ? p1Def : p2Def;
      const dDef = isP1Turn ? p2Def : p1Def;
      
      const aMod = 1 + attacker.level * 0.05;
      const adjustedSkillPwr = skill.power * aMod;

      let aBuffs = attacker.buffs || { dodge: 0, defUp: 0 };
      let dBuffs = defender.buffs || { dodge: 0, defUp: 0 };
      
      let nextAttacker = { ...attacker, buffs: { ...aBuffs } };
      let nextDefender = { ...defender, buffs: { ...dBuffs } };
      let log = "";

      if (skill.type === 'heal') {
        const healAmt = Math.floor(adjustedSkillPwr + attacker.attributes.int * 2 + 30);
        nextAttacker.hp = Math.min(nextAttacker.maxHp, nextAttacker.hp + healAmt);
        log = `${attacker.name} 运转内力使出【${skill.name}】，恢复了 ${healAmt} 点气血！`;
      } else if (skill.type === 'buff') {
        if (skill.id === 's4') { 
          nextAttacker.buffs.dodge = 3;
          log = `${attacker.name} 施展【${skill.name}】，身形变幻莫测，闪避率大幅提升！`;
        } else if (skill.id === 's5') { 
          nextAttacker.buffs.defUp = 3;
          log = `${attacker.name} 催动【${skill.name}】，真气护体，防御力大增！`;
        } else {
          nextAttacker.buffs.dodge = 2;
          log = `${attacker.name} 施展【${skill.name}】，气势如虹！`;
        }
      } else {
        let isDodge = Math.random() < (defender.attributes.agi * 0.005);
        if (nextDefender.buffs.dodge > 0) isDodge = Math.random() < 0.45;
        
        if (isDodge) {
          log = `${attacker.name} 施展【${skill.name}】，却被 ${defender.name} 巧妙地闪身躲开了！`;
        } else {
          let finalDef = dDef * 0.5;
          if (nextDefender.buffs.defUp > 0) finalDef *= 2;
          
          const dmg = Math.max(1, Math.floor(aAtk + adjustedSkillPwr - finalDef));
          nextDefender.hp = Math.max(0, nextDefender.hp - dmg);
          
          if (skill.id === 's_dugu') {
             log = `${attacker.name} 剑出无我！【${skill.name}】看破破绽，对 ${defender.name} 造成了惊人的 ${dmg} 点伤害！`;
          } else if (skill.id === 's_xianglong') {
             log = `${attacker.name} 掌风呼啸，【${skill.name}】犹如隐龙咆哮，狂轰 ${defender.name} ${dmg} 点伤害！`;
          } else {
             const actionStr = isP1Turn ? '施展出绝技' : '阴险地使出';
             log = `${attacker.name} ${actionStr}【${skill.name}】，对 ${defender.name} 造成了 ${dmg} 点伤害！`;
          }
        }
      }

      if (nextAttacker.buffs.dodge > 0) nextAttacker.buffs.dodge--;
      if (nextAttacker.buffs.defUp > 0) nextAttacker.buffs.defUp--;

      actionData = { log };
      actionData[attackerKey] = nextAttacker;
      actionData[defenderKey] = nextDefender;

      if (nextDefender.hp <= 0) { 
        actionData.winner = attackerKey; 
        const winLog = isP1Turn 
          ? `\n[系统] 决斗结束！大侠 ${attacker.name} 击落苍穹，取得了胜利！`
          : `\n[系统] 决斗结束！很遗憾，${defender.name} 血战不敌，含恨败北！`;
        actionData.log += winLog; 
      }
      sendBattleAction(roomId, actionData);
    }, 1500);

    return () => clearTimeout(timer);
  }, [inBattle, p1, p2, winner, player.name, roomId, sendBattleAction]);

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
       <h2 style={{ fontSize: '1.8rem', color: 'var(--danger)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Swords /> 竞技对决
      </h2>
      
      {!inBattle ? (
         <div style={{ textAlign: 'center', marginTop: '4rem' }}>
         <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>当前并未在切磋回合中。<br/>请前往【风云榜】中向真实的在线高手下发战书！</p>
       </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px' }}>
            <div style={{ width: '42%' }}>
              <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{p1?.name}</h4>
              <div style={{ height: '12px', background: 'var(--glass-border)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(p1?.hp / p1?.maxHp) * 100}%`, background: 'var(--success)', transition: 'width 0.3s' }}></div>
              </div>
              <div style={{ fontSize: '0.8rem', textAlign: 'right', marginTop: '4px' }}>{Math.floor(p1?.hp || 0)} / {Math.floor(p1?.maxHp || 7000)}</div>
            </div>
            <h3 style={{ color: 'var(--danger)', alignSelf: 'center', filter: 'drop-shadow(0 0 5px var(--danger))' }}>VS</h3>
            <div style={{ width: '42%' }}>
               <h4 style={{ color: 'var(--warn)', marginBottom: '0.5rem', textAlign: 'right' }}>{p2?.name}</h4>
               <div style={{ height: '12px', background: 'var(--glass-border)', borderRadius: '6px', overflow: 'hidden', transform: 'rotate(180deg)' }}>
                <div style={{ height: '100%', width: `${(p2?.hp / p2?.maxHp) * 100}%`, background: 'var(--danger)', transition: 'width 0.3s' }}></div>
              </div>
              <div style={{ fontSize: '0.8rem', textAlign: 'left', marginTop: '4px' }}>{Math.floor(p2?.hp || 0)} / {Math.floor(p2?.maxHp || 7000)}</div>
            </div>
          </div>

          <div style={{ flex: 1, background: 'var(--bg-color)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: 'monospace', fontSize: '1.1rem' }}>
            {logs.map((log, i) => (
              <div key={i} style={{ 
                color: log.includes('系统') ? 'var(--warn)' : log.includes(player.name) ? 'var(--text-main)' : 'var(--danger)', 
                fontWeight: log.includes('系统') ? 'bold' : 'normal',
                whiteSpace: 'pre-line',
                animation: 'slideUp 0.3s' 
              }}>
                {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>

          {winner && (
            <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={exitBattle}>退下调息 (返回)</button>
          )}
        </div>
      )}
    </div>
  );
}

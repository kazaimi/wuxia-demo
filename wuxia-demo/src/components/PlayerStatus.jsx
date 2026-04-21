import React from 'react';
import { useGameStore, SKILLS_DB, TREASURES_DB, getSkillMastery, getSkillInfo, MASTERY_TIERS } from '../store/gameState';
import { User, Star, AlertCircle } from 'lucide-react';
import AttributeRadar from './AttributeRadar';

export default function PlayerStatus() {
  const player = useGameStore(state => state.player);
  const setAttribute = useGameStore(state => state.setAttribute);
  const equipSkill = useGameStore(state => state.equipSkill);
  const equipTreasure = useGameStore(state => state.equipTreasure);
  const inBattle = useGameStore(state => state.battleState.inBattle);
  const { name, title, level, exp, maxExp, freePoints, attributes, permanentAttributes, skills, hp, maxHp, treasures, equippedSkills, equippedTreasure } = player;

  const bgStyle = {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    position: 'relative'
  };

  return (
    <div style={bgStyle} className="glass-panel">
      {/* 顶部金线装饰 */}
      <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', opacity: 0.5 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold)', fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '2px' }}>
            <User size={24} /> {name}
          </h3>
          {title && <span className="wuxia-tag" style={{ marginTop: '6px' }}>{title}</span>}
        </div>
        <div style={{ fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
             <Star size={18} color="var(--gold)" /> <span style={{ color: 'var(--gold)', fontFamily: '"Ma Shan Zheng", cursive' }}>Lv.{level}</span>
          </div>
          <span className="glow-effect" style={{ fontSize: '0.8rem', color: freePoints > 0 ? 'var(--danger)' : 'var(--text-muted)', background: freePoints > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)', padding:'2px 4px', borderRadius: '4px' }}>
            {freePoints > 0 ? `可用潜能: ${freePoints}` : freePoints < 0 ? `超支: ${-freePoints}` : '潜能已分配完毕'}
          </span>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--text-muted)' }}>
          <span>❖ 状态生命</span>
          <span>{hp} / {maxHp}</span>
        </div>
        <div className="wuxia-progress" style={{ marginBottom: '0.5rem' }}>
          <div className="wuxia-progress-bar" style={{ width: `${(hp / maxHp) * 100}%`, background: 'linear-gradient(90deg, var(--crimson), #ff6b6b)' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--text-muted)' }}>
          <span>❖ 修为阅历</span>
          <span>{Math.floor(exp)} / {maxExp}</span>
        </div>
        <div className="wuxia-progress">
          <div className="wuxia-progress-bar" style={{ width: `${Math.min(100, (exp / maxExp) * 100)}%` }} />
        </div>
      </div>

      {/* 属性雷达图 */}
      <div style={{ marginTop: '0.5rem' }}>
        <AttributeRadar
          attributes={attributes}
          permanentAttributes={permanentAttributes}
          freePoints={freePoints}
          inBattle={inBattle}
          onSetAttribute={setAttribute}
        />
      </div>
      
      {inBattle && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid var(--danger)',
          padding: '0.5rem',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: 'var(--danger)',
          textAlign: 'center'
        }}>
          激战中，属性点已锁定
        </div>
      )}

      {player.dailyDebuffs && player.dailyDebuffs.length > 0 && (
         <div style={{ marginTop: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', padding: '0.8rem', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '1rem', color: 'var(--danger)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <AlertCircle size={16} /> 恶兆缠身 <span style={{fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-muted)'}}>(今日拂晓消散)</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
               {player.dailyDebuffs.map((db, i) => {
                  let desc = "";
                  if (db === '血枯劫') desc = "最大气血上限被强行压制衰减 20%";
                  else if (db === '散功劫') desc = "力量与体质的基础属性各自衰减 5 点，破防抗压剧烈下降";
                  else if (db === '心魔劫') desc = "心神失守走火入魔，任何战斗中每回合遭遇 15% 几率强制空过";
                  return (
                     <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: 'var(--warn)', fontWeight: 'bold' }}>【{db}】</span>
                        <span style={{ color: 'var(--text-muted)' }}>- {desc}</span>
                     </div>
                  );
               })}
            </div>
         </div>
      )}

      <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
        <h4 style={{ fontSize: '1rem', marginBottom: '0.8rem', color: 'var(--gold)', fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '2px' }}>✦ 武学与宝具羁绊 ✦</h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
          {['inner', 'outer', 'motion', 'ultimate'].map(type => {
            const typeName = type === 'inner' ? '内功' : type === 'outer' ? '外功' : type === 'motion' ? '轻功' : '绝学';
            const typeIcon = type === 'inner' ? '☯' : type === 'outer' ? '⚔' : type === 'motion' ? '💨' : '⚡';
            const typeColor = type === 'inner' ? 'var(--jade)' : type === 'outer' ? 'var(--crimson)' : type === 'motion' ? 'var(--primary)' : 'var(--gold)';
            const available = skills.filter(sId => SKILLS_DB.find(s => s.id === sId)?.type === type);
            const equippedId = equippedSkills[type];
            const masteryInfo = equippedId ? getSkillMastery(equippedId, player.skillMastery) : null;
            const nextTier = masteryInfo ? MASTERY_TIERS.find(t => t.minWins > masteryInfo.wins) : null;
            const equippedSkill = equippedId ? getSkillInfo(equippedId) : null;
            return (
               <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', border: equippedId ? `1px solid ${typeColor}` : '1px solid transparent' }}>
                 <span style={{ color: typeColor, minWidth: '65px', fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                   <span style={{ fontSize: '1rem' }}>{typeIcon}</span> {typeName}
                 </span>
                 <select
                    value={equippedSkills[type] || ''}
                    onChange={e => equipSkill(type, e.target.value || null)}
                    className="wuxia-select"
                    style={{ flex: 1, minWidth: 0, fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '1px' }}
                 >
                   <option value="">── 空缺 ──</option>
                   {available.map(sId => {
                     const sk = getSkillInfo(sId);
                     const { wins, label } = getSkillMastery(sId, player.skillMastery);
                     const suffix = label ? `「${label}」` : wins > 0 ? `(${wins}胜)` : '';
                     return <option key={sId} value={sId}>{sk?.name} {suffix}</option>;
                   })}
                 </select>
                 {equippedSkill && (
                   <span style={{
                     fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', whiteSpace: 'nowrap',
                     background: `${typeColor}20`,
                     color: typeColor,
                     border: `1px solid ${typeColor}50`,
                     fontFamily: '"Ma Shan Zheng", cursive'
                   }}>
                     {masteryInfo?.wins || 0}胜
                   </span>
                 )}
               </div>
            );
          })}
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
           <span style={{ color: 'var(--gold)', fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
             <span style={{ fontSize: '1.1rem' }}>💎</span> ✦ 本命宝具 ✦
           </span>
           <select
              value={equippedTreasure || ''}
              onChange={e => equipTreasure(e.target.value || null)}
              className="wuxia-select"
              style={{ border: '1px solid var(--gold)', fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '1px', padding: '10px 12px' }}
           >
              <option value="">── 无羁绊 ──</option>
              {(treasures || []).map(tId => {
                 const t = TREASURES_DB?.find(tr => tr.id === tId);
                 const rarityIcon = t?.rarity === '神话' ? '🌟' : t?.rarity === '传说' ? '✨' : t?.rarity === '史诗' ? '💜' : t?.rarity === '稀有' ? '💙' : '🤍';
                 return <option key={tId} value={tId}>{t ? `${rarityIcon} ${t.name}` : tId}</option>;
              })}
           </select>
           {equippedTreasure && (() => {
              const t = TREASURES_DB?.find(tr => tr.id === equippedTreasure);
              if (!t) return null;
              const rarityColors = { '神话': '#fbbf24', '传说': '#a855f7', '史诗': '#7c3aed', '稀有': '#3b82f6', '普通': '#9ca3af' };
              return (
                <div style={{ marginTop: '4px', padding: '8px 12px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '6px', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                  <span style={{ fontSize: '0.8rem', color: rarityColors[t.rarity] || 'var(--text-muted)', fontFamily: '"Ma Shan Zheng", cursive' }}>
                    「{t.rarity}」{t.name}
                  </span>
                </div>
              );
           })()}
        </div>
      </div>
    </div>
  );
}

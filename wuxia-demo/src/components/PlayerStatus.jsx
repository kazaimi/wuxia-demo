import React from 'react';
import { useGameStore, SKILLS_DB, TREASURES_DB } from '../store/gameState';
import { Shield, Swords, Brain, Zap, Clover, User, Star, PlusCircle, RefreshCcw, Heart } from 'lucide-react';

export default function PlayerStatus() {
  const player = useGameStore(state => state.player);
  const allocatePoints = useGameStore(state => state.allocatePoints);
  const resetPoints = useGameStore(state => state.resetPoints);
  const equipSkill = useGameStore(state => state.equipSkill);
  const equipTreasure = useGameStore(state => state.equipTreasure);
  const { name, title, level, exp, maxExp, freePoints, attributes, skills, hp, maxHp, treasures, equippedSkills, equippedTreasure } = player;

  const bgStyle = {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  };

  return (
    <div style={bgStyle} className="glass-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
            <User size={24} /> {name}
          </h3>
          {title && <span style={{ fontSize: '0.8rem', color: 'var(--warn)', border: '1px solid var(--warn)', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>{title}</span>}
        </div>
        <div style={{ fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
             <Star size={18} color="var(--warn)" /> Lv.{level}
          </div>
          {freePoints > 0 && (
             <span className="glow-effect" style={{ fontSize: '0.8rem', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.2)', padding:'2px 4px', borderRadius: '4px' }}>可用潜能: {freePoints}</span>
          )}
        </div>
      </div>
      
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--text-muted)' }}>
          <span>状态生命</span>
          <span>{hp} / {maxHp}</span>
        </div>
        <div style={{ height: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' }}>
          <div style={{ height: '100%', width: `${(hp / maxHp) * 100}%`, background: 'var(--success)' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--text-muted)' }}>
          <span>修为阅历</span>
          <span>{Math.floor(exp)} / {maxExp}</span>
        </div>
        <div style={{ height: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(100, (exp / maxExp) * 100)}%`, background: 'linear-gradient(90deg, var(--primary), var(--secondary))', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
        { [
            { k: 'con', i: <Shield size={16} color="var(--success)" />, n: '体质' },
            { k: 'str', i: <Swords size={16} color="var(--danger)" />, n: '力量' },
            { k: 'int', i: <Brain size={16} color="var(--primary)" />, n: '智慧' },
            { k: 'agi', i: <Zap size={16} color="var(--warn)" />, n: '敏捷' },
            { k: 'luk', i: <Clover size={16} color="#10b981" />, n: '幸运' },
          ].map(attr => (
            <div key={attr.k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {attr.i} {attr.n}: {attributes[attr.k]}
              </div>
              {freePoints > 0 && (
                <button 
                   onClick={() => {
                      const amountStr = window.prompt(`请输入为【${attr.n}】分配的点数（最多还能分配 ${freePoints} 点）：`, '1');
                      if (amountStr) {
                         const amount = parseInt(amountStr, 10);
                         if (!isNaN(amount) && amount > 0) {
                            allocatePoints(attr.k, amount);
                         }
                      }
                   }} 
                   style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 0 }}
                   title="分配点数"
                >
                  <PlusCircle size={16} />
                </button>
              )}
            </div>
        ))}
      </div>
      
      {player.level > 1 && (
        <button 
           onClick={() => { if(window.confirm('洗髓重铸将清空加点并返还所有潜能点数，是否继续？')) resetPoints() }} 
           style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.3s' }}
           onMouseEnter={(e)=>e.target.style.background='rgba(239, 68, 68, 0.3)'}
           onMouseLeave={(e)=>e.target.style.background='rgba(239, 68, 68, 0.1)'}
        >
          <RefreshCcw size={16} /> 洗髓重铸 (耗费修为修整)
        </button>
      )}

      <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
        <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>武学与宝具羁绊</h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
          {['inner', 'outer', 'motion', 'ultimate'].map(type => {
            const typeName = type === 'inner' ? '内功' : type === 'outer' ? '外功' : type === 'motion' ? '轻功' : '绝学';
            const available = skills.filter(sId => SKILLS_DB.find(s => s.id === sId)?.type === type);
            return (
               <div key={type} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                 <span style={{ color: 'var(--text-muted)' }}>{typeName}槽位</span>
                 <select 
                    value={equippedSkills[type] || ''} 
                    onChange={e => equipSkill(type, e.target.value || null)}
                    style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid var(--glass-border)', borderRadius: '4px', padding: '4px' }}
                 >
                   <option value="">--空--</option>
                   {available.map(sId => <option key={sId} value={sId}>{SKILLS_DB.find(s => s.id === sId)?.name}</option>)}
                 </select>
               </div>
            );
          })}
        </div>
        
        <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
           <span style={{ color: 'var(--warn)' }}>本命宝具</span>
           <select 
              value={equippedTreasure || ''} 
              onChange={e => equipTreasure(e.target.value || null)}
              style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid var(--warn)', borderRadius: '4px', padding: '4px' }}
           >
              <option value="">--无羁绊--</option>
              {(treasures || []).map(tId => {
                 const t = TREASURES_DB?.find(tr => tr.id === tId);
                 return <option key={tId} value={tId}>{t ? `[${t.rarity}] ${t.name}` : tId}</option>;
              })}
           </select>
        </div>
      </div>
    </div>
  );
}

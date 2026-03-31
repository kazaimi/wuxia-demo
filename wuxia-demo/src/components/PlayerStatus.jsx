import React from 'react';
import { useGameStore, SKILLS_DB } from '../store/gameState';
import { Shield, Swords, Brain, Zap, Clover, User, Star, PlusCircle, RefreshCcw, Heart } from 'lucide-react';

export default function PlayerStatus() {
  const player = useGameStore(state => state.player);
  const allocatePoint = useGameStore(state => state.allocatePoint);
  const resetPoints = useGameStore(state => state.resetPoints);
  const { name, title, level, exp, maxExp, freePoints, attributes, skills, hp, maxHp } = player;

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
                   onClick={() => allocatePoint(attr.k)} 
                   style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 0 }}
                   title="分配1点"
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
        <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>已掌握绝学</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {skills.map(skillId => {
            const skillInfo = SKILLS_DB.find(s => s.id === skillId);
            return (
              <span key={skillId} title={skillInfo?.desc} style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', background: 'var(--glass-bg)', borderRadius: '12px', border: '1px solid var(--primary-glow)', cursor: 'help' }}>
                {skillInfo?.name}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

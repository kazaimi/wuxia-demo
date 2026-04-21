import React, { useState } from 'react';
import { useGameStore, INITIAL_POINTS } from '../store/gameState';
import { Shield, Swords, Brain, Zap, Clover } from 'lucide-react';

const ATTRIBUTE_CONFIG = [
  { key: 'con', name: '体质', icon: <Shield size={18} color="var(--jade)" />, desc: '增加肉度与防守' },
  { key: 'str', name: '力量', icon: <Swords size={18} color="var(--crimson)" />, desc: '影响基础物理杀伤' },
  { key: 'int', name: '智慧', icon: <Brain size={18} color="var(--primary)" />, desc: '提升绝学威力与内防' },
  { key: 'agi', name: '敏捷', icon: <Zap size={18} color="var(--gold)" />, desc: '决定出手几率与闪避' },
  { key: 'luk', name: '幸运', icon: <Clover size={18} color="#10b981" />, desc: '影响玄学与掉宝概率' }
];

export default function CreateRole({ initialName }) {
  const createRole = useGameStore(state => state.createRole);
  
  const [points, setPoints] = useState(INITIAL_POINTS);
  const [attributes, setAttributes] = useState({ con: 0, str: 0, int: 0, agi: 0, luk: 0 });

  const handleAllocate = (key, val) => {
    if (val > 0 && points > 0) {
      setAttributes(prev => ({ ...prev, [key]: prev[key] + 1 }));
      setPoints(p => p - 1);
    } else if (val < 0 && attributes[key] > 0) {
      setAttributes(prev => ({ ...prev, [key]: prev[key] - 1 }));
      setPoints(p => p + 1);
    }
  };

  const handleStart = () => {
    if (points === 0) {
      createRole(initialName, attributes);
    } else {
      alert('请将潜能点分配完毕再踏入江湖！');
    }
  };

  return (
    <div className="glass-panel animate-slide-up" style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', position: 'relative' }}>
      {/* 角落装饰 */}
      <div className="corner-decoration top-left" />
      <div className="corner-decoration top-right" />
      <div className="corner-decoration bottom-left" />
      <div className="corner-decoration bottom-right" />

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--gold)', marginBottom: '0.5rem', fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '4px' }}>欢迎，{initialName}！</h2>
        <div style={{ width: '80px', height: '2px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', margin: '0 auto 0.8rem' }} />
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>经查阅，名册中尚无您的威名。请分配您与生俱来的先天根骨：</p>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
        <span style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontFamily: '"Ma Shan Zheng", cursive' }}>剩余潜能点：</span>
        <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: points > 0 ? 'var(--crimson)' : 'var(--jade)', textShadow: `0 0 10px ${points > 0 ? 'rgba(220, 20, 60, 0.5)' : 'rgba(0, 168, 107, 0.5)'}`, fontFamily: '"Ma Shan Zheng", cursive' }}>
          {points}
        </span>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {ATTRIBUTE_CONFIG.map(({ key, name, icon, desc }) => (
          <div key={key} className="wuxia-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--glass-bg)', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.08)', padding: '0.6rem', borderRadius: '50%', border: '1px solid rgba(212, 175, 55, 0.2)' }}>{icon}</div>
              <div>
                <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem', fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '2px' }}>{name}</h4>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{desc}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => handleAllocate(key, -1)}
                disabled={attributes[key] === 0}
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'var(--crimson)', color: 'white', cursor: attributes[key] === 0 ? 'not-allowed' : 'pointer', opacity: attributes[key] === 0 ? 0.4 : 1, fontSize: '1.2rem', fontWeight: 'bold' }}
              >-</button>

              <span style={{ fontSize: '1.4rem', fontWeight: 'bold', width: '24px', textAlign: 'center', color: 'var(--gold)', fontFamily: '"Ma Shan Zheng", cursive' }}>{attributes[key]}</span>

              <button
                onClick={() => handleAllocate(key, 1)}
                disabled={points === 0}
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'var(--jade)', color: 'white', cursor: points === 0 ? 'not-allowed' : 'pointer', opacity: points === 0 ? 0.4 : 1, fontSize: '1.2rem', fontWeight: 'bold' }}
              >+</button>
            </div>
          </div>
        ))}
      </div>

      <button
        className="btn-primary glow-effect"
        onClick={handleStart}
        disabled={points > 0}
        style={{ width: '100%', padding: '1rem', marginTop: '2rem', fontSize: '1.2rem', filter: points > 0 ? 'grayscale(100%)' : 'none' }}
      >
        {points > 0 ? '点数未尽，不可草率' : '✦ 凝聚根骨，创立角色 ✦'}
      </button>
    </div>
  );
}

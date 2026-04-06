import React from 'react';
import { useGameStore, TREASURES_DB } from '../store/gameState';
import { Trophy, Medal, Star, Swords, Gift } from 'lucide-react';

export default function Leaderboard() {
  const onlinePlayers = useGameStore(state => state.onlinePlayers);
  const player = useGameStore(state => state.player);
  const challengePlayer = useGameStore(state => state.challengePlayer);
  const inBattle = useGameStore(state => state.battleState.inBattle);
  
  // 按照服务器指定的 rankIndex 升序排序
  const fullBoard = [...onlinePlayers].sort((a, b) => (a.rankIndex || 9999) - (b.rankIndex || 9999));

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: '1.8rem', color: 'var(--warn)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Trophy /> 全网风云榜 (在线)
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', overflowY: 'auto' }}>
        {fullBoard.length === 0 && <p style={{color: 'var(--text-muted)'}}>当前无大侠连入江湖...</p>}
        {fullBoard.map((u, i) => {
          const isMe = u.name === player.name; 
          const tName = u.equippedTreasure ? TREASURES_DB?.find(t => t.id === u.equippedTreasure)?.name : null;
          return (
          <div key={u.id} style={{ 
            display: 'flex', justifyContent: 'space-between', padding: '1rem', 
            background: 'var(--glass-bg)', borderRadius: '8px',
            border: isMe ? '1px solid var(--primary)' : '1px solid var(--glass-border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <strong style={{ minWidth: '30px', color: i < 3 ? 'var(--warn)' : 'var(--text-muted)' }}>#{i + 1}</strong>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                 <div style={{ fontSize: '1.2rem', fontWeight: isMe ? 'bold' : 'normal', color: u.isBattling ? 'var(--text-muted)' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                   <span>{u.name} {isMe && '(您)'} {u.isBattling && '[激战中]'}</span>
                   {u.title && <span style={{ fontSize: '0.8rem', color: '#fbbf24', border: '1px solid #fbbf24', padding: '1px 4px', borderRadius: '4px' }}>{u.title}</span>}
                   {u.dailyDebuffs && u.dailyDebuffs.length > 0 && <span style={{ fontSize: '0.8rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: '1px 4px', borderRadius: '4px' }}>[{u.dailyDebuffs.join(' / ')}]</span>}
                 </div>
                 {tName && <span style={{ fontSize: '0.8rem', color: 'var(--warn)', marginTop: '2px' }}><Gift size={12} style={{marginRight: '2px', verticalAlign: 'text-top'}} /> {tName}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', color: 'var(--text-muted)' }}>
              <span><Star size={16} color="var(--primary)" style={{verticalAlign:'text-bottom'}}/> Lv.{u.level}</span>
              {!isMe && !u.isBattling && !inBattle && (
                <button onClick={() => challengePlayer(u.id)} className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
                  <Swords size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }}/>
                  挑战
                </button>
              )}
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}

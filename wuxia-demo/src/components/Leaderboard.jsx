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
    <div className="glass-panel animate-slide-up" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* 顶部装饰 */}
      <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', opacity: 0.5 }} />

      <h2 style={{ fontSize: '1.8rem', color: 'var(--gold)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '3px' }}>
        <Trophy /> ✦ 全网风云榜 ✦ <span style={{fontSize: '0.9rem', color: 'var(--text-muted)', letterSpacing: '1px'}}>(在线)</span>
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', overflowY: 'auto' }}>
        {fullBoard.length === 0 && <p style={{color: 'var(--text-muted)'}}>当前无大侠连入江湖...</p>}
        {fullBoard.map((u, i) => {
          const isMe = u.name === player.name;
          const tName = u.equippedTreasure ? TREASURES_DB?.find(t => t.id === u.equippedTreasure)?.name : null;
          const rankColors = ['var(--gold)', '#c0c0c0', '#cd7f32']; // 金银铜
          return (
          <div key={u.id} className="wuxia-card" style={{
            display: 'flex', justifyContent: 'space-between', padding: '1rem',
            background: 'var(--glass-bg)', borderRadius: '8px',
            border: isMe ? '1px solid var(--gold)' : '1px solid var(--glass-border)',
            position: 'relative'
          }}>
            {/* 排名装饰 */}
            {i < 3 && (
              <div style={{ position: 'absolute', top: '-6px', left: '10px', fontSize: '1.2rem', filter: 'drop-shadow(0 0 4px ' + rankColors[i] + ')' }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <strong style={{ minWidth: '30px', color: i < 3 ? rankColors[i] : 'var(--text-muted)', fontFamily: '"Ma Shan Zheng", cursive', fontSize: '1.2rem' }}>#{i + 1}</strong>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                 <div style={{ fontSize: '1.2rem', fontWeight: isMe ? 'bold' : 'normal', color: u.isBattling ? 'var(--text-muted)' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                   <span style={{ fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '1px' }}>{u.name}</span>
                   {isMe && <span style={{ color: 'var(--gold)' }}>(您)</span>}
                   {u.isBattling && <span style={{ color: 'var(--crimson)' }}>[激战中]</span>}
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                   {u.title && <span className="wuxia-tag">{u.title}</span>}
                   {u.dailyDebuffs && u.dailyDebuffs.length > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--crimson)', background: 'rgba(220, 20, 60, 0.1)', border: '1px solid var(--crimson)', padding: '1px 6px', borderRadius: '3px' }}>[{u.dailyDebuffs.join(' / ')}]</span>}
                 </div>
                 {tName && <span style={{ fontSize: '0.8rem', color: 'var(--gold)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Gift size={12} /> {tName}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={16} color="var(--gold)" /> <span style={{ color: 'var(--gold)', fontFamily: '"Ma Shan Zheng", cursive' }}>Lv.{u.level}</span></span>
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

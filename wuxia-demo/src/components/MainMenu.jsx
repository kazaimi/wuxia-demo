import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameState';
import PlayerStatus from './PlayerStatus';
import TaskHall from './TaskHall';
import BattleArena from './BattleArena';
import Leaderboard from './Leaderboard';
import EncounterArena from './EncounterArena';
import SecretRealm from './SecretRealm';
import AuctionHouse from './AuctionHouse';
import BlackMarket from './BlackMarket';
import { ShoppingBag } from 'lucide-react';

export default function MainMenu() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [showBlackMarket, setShowBlackMarket] = useState(false);
  const inBattle = useGameStore(state => state.battleState.inBattle);

  useEffect(() => {
    if (inBattle) setActiveTab('battle');
  }, [inBattle]);

  const btnStyle = (isActive, specialColor) => {
    if (isActive) {
      return specialColor ? {
        background: specialColor,
        color: '#1a1a2e',
        boxShadow: `0 0 20px ${specialColor === '#c084fc' ? 'rgba(192, 132, 252, 0.5)' : 'rgba(212, 175, 55, 0.5)'}`
      } : {};
    }
    return {
      background: 'transparent',
      border: `1px solid ${specialColor || 'rgba(212, 175, 55, 0.4)'}`,
      boxShadow: 'none',
      color: specialColor || 'var(--gold)'
    };
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 300px) 1fr', gap: '2rem', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <PlayerStatus />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          marginTop: '1.5rem',
          background: 'var(--glass-bg)',
          padding: '1.2rem',
          borderRadius: '12px',
          border: '1px solid var(--glass-border)',
          position: 'relative'
        }}>
          {/* 装饰性标题 */}
          <div style={{
            position: 'absolute',
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--bg-color)',
            padding: '0 12px',
            color: 'var(--gold)',
            fontFamily: '"Ma Shan Zheng", cursive',
            fontSize: '1rem',
            letterSpacing: '2px'
          }}>
            ✦ 江湖入口 ✦
          </div>

          <button
            className="btn-primary"
            onClick={() => setActiveTab('tasks')}
            style={btnStyle(activeTab === 'tasks')}>
            任务大厅
          </button>
          <button
            className="btn-primary"
            onClick={() => setActiveTab('battle')}
            style={btnStyle(activeTab === 'battle')}>
            竞技对战
          </button>
          <button
            className="btn-primary"
            onClick={() => setActiveTab('leader')}
            style={btnStyle(activeTab === 'leader')}>
            风云榜
          </button>
          <button
            className="btn-primary"
            onClick={() => setActiveTab('encounter')}
            style={btnStyle(activeTab === 'encounter')}>
            江湖奇遇
          </button>
          <button
            className="btn-primary"
            onClick={() => setActiveTab('realm')}
            style={btnStyle(activeTab === 'realm', '#c084fc')}>
            秘境寻宝
          </button>
          <button
            className="btn-primary"
            onClick={() => setActiveTab('auction')}
            style={btnStyle(activeTab === 'auction', '#d4af37')}>
            拍卖风云
          </button>
        </div>
      </div>
      <div>
        {activeTab === 'tasks' && <TaskHall />}
        {activeTab === 'battle' && <BattleArena />}
        {activeTab === 'leader' && <Leaderboard />}
        {activeTab === 'encounter' && <EncounterArena />}
        {activeTab === 'realm' && <SecretRealm />}
        {activeTab === 'auction' && <AuctionHouse />}
      </div>

      {showBlackMarket && <BlackMarket onClose={() => setShowBlackMarket(false)} />}

      {/* 黑市按钮 - 武侠风 */}
      <button onClick={() => setShowBlackMarket(true)} style={{
          position: 'fixed', bottom: '30px', right: '30px', zIndex: 8000,
          background: 'linear-gradient(135deg, #7f1d1d, #b91c1c)', color: '#fff',
          border: '2px solid var(--gold)', borderRadius: '50%', width: '64px', height: '64px',
          display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer',
          boxShadow: '0 0 25px rgba(185, 28, 28, 0.6), 0 0 40px rgba(212, 175, 55, 0.3)',
          animation: 'pulse 2s infinite',
          transition: 'transform 0.3s ease'
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
          <ShoppingBag size={28} />
      </button>
    </div>
  );
}

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
import { ShoppingBag, Target, Swords, Trophy, Skull, Map, Gavel } from 'lucide-react';

export default function MainMenu() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [showBlackMarket, setShowBlackMarket] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const inBattle = useGameStore(state => state.battleState.inBattle);

  useEffect(() => {
    if (inBattle) setActiveTab('battle');
  }, [inBattle]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const tabs = [
    { id: 'tasks', label: '任务大厅', icon: <Target size={16} /> },
    { id: 'battle', label: '竞技对战', icon: <Swords size={16} /> },
    { id: 'leader', label: '风云榜', icon: <Trophy size={16} /> },
    { id: 'encounter', label: '江湖奇遇', icon: <Skull size={16} /> },
    { id: 'realm', label: '秘境寻宝', icon: <Map size={16} />, color: '#c084fc' },
    { id: 'auction', label: '拍卖风云', icon: <Gavel size={16} />, color: '#d4af37' },
  ];

  // 移动端布局
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
        {/* 顶部Tab导航 */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className="btn-primary"
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...btnStyle(activeTab === tab.id, tab.color),
                padding: '0.5rem 0.8rem',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* 玩家状态卡片 - 可折叠 */}
        <details style={{ background: 'var(--glass-bg)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
          <summary style={{ padding: '0.8rem 1rem', cursor: 'pointer', color: 'var(--gold)', fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} /> 个人信息
          </summary>
          <div style={{ padding: '0 1rem 1rem' }}>
            <PlayerStatus />
          </div>
        </details>

        {/* 内容区域 */}
        <div style={{ flex: 1 }}>
          {activeTab === 'tasks' && <TaskHall />}
          {activeTab === 'battle' && <BattleArena />}
          {activeTab === 'leader' && <Leaderboard />}
          {activeTab === 'encounter' && <EncounterArena />}
          {activeTab === 'realm' && <SecretRealm />}
          {activeTab === 'auction' && <AuctionHouse />}
        </div>

        {showBlackMarket && <BlackMarket onClose={() => setShowBlackMarket(false)} />}

        {/* 黑市按钮 */}
        <button onClick={() => setShowBlackMarket(true)} style={{
          position: 'fixed', bottom: '20px', right: '20px', zIndex: 8000,
          background: 'linear-gradient(135deg, #7f1d1d, #b91c1c)', color: '#fff',
          border: '2px solid var(--gold)', borderRadius: '50%', width: '56px', height: '56px',
          display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer',
          boxShadow: '0 0 20px rgba(185, 28, 28, 0.6), 0 0 30px rgba(212, 175, 55, 0.3)'
        }}>
          <ShoppingBag size={24} />
        </button>
      </div>
    );
  }

  // PC端布局
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

          {tabs.map(tab => (
            <button
              key={tab.id}
              className="btn-primary"
              onClick={() => setActiveTab(tab.id)}
              style={btnStyle(activeTab === tab.id, tab.color)}
            >
              {tab.label}
            </button>
          ))}
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

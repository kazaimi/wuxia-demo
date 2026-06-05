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
import WorldBossArena from './WorldBossArena';
import AlchemyFurnace from './AlchemyFurnace';
import { ShoppingBag, Target, Swords, Trophy, Skull, Map, Gavel } from 'lucide-react';

const tokenStyles = `
  .black-market-token-alien-img-btn {
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    animation: tokenAlienFloat 4s infinite ease-in-out;
    background: none;
    border: none;
    outline: none;
    padding: 0;
  }
  .token-image-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    /* 使用深色径向渐变底座，防止后面文本穿透，且边缘柔和羽化 */
    background: radial-gradient(circle, rgba(12, 4, 4, 0.96) 0%, rgba(10, 3, 3, 0.82) 45%, rgba(0, 0, 0, 0) 70%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .token-image-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    mix-blend-mode: screen; /* 核心：过滤掉纯黑背景 */
    -webkit-mask-image: radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 48%, rgba(0,0,0,0) 65%);
    mask-image: radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 48%, rgba(0,0,0,0) 65%);
    filter: contrast(1.25) brightness(0.95);
    transition: all 0.4s ease;
  }
  
  /* 呼吸浮起的暗红熔岩光晕层 */
  .token-glow-overlay {
    position: absolute;
    top: 20%;
    left: 20%;
    width: 60%;
    height: 60%;
    background: radial-gradient(circle, rgba(239, 68, 68, 0.65) 0%, rgba(0, 0, 0, 0) 70%);
    mix-blend-mode: color-dodge;
    pointer-events: none;
    opacity: 0.35;
    animation: pulseGlow 3.5s infinite ease-in-out;
  }
  
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.3; transform: scale(0.85); }
    50% { opacity: 0.7; transform: scale(1.15); }
  }

  /* 悬停动作：上浮、略微旋转、亮度和细节增强，散发炽烈红光 */
  .black-market-token-alien-img-btn:hover {
    transform: translateY(-8px) scale(1.15) rotate(2deg) !important;
  }
  .black-market-token-alien-img-btn:hover .token-image-wrapper img {
    filter: contrast(1.3) brightness(1.25) drop-shadow(0 0 10px rgba(239, 68, 68, 0.9));
  }
  .black-market-token-alien-img-btn:hover .token-image-wrapper {
    background: radial-gradient(circle, rgba(35, 12, 12, 0.95) 0%, rgba(20, 5, 5, 0.9) 45%, rgba(184, 134, 11, 0.25) 75%);
  }

  /* 点击时的强力剧烈抖动 */
  .black-market-token-alien-img-btn:active {
    animation: tokenActiveShake 0.15s ease-in-out infinite;
  }

  @keyframes tokenActiveShake {
    0%, 100% { transform: translateY(-8px) scale(1.1) rotate(2deg); }
    25% { transform: translateY(-6px) scale(1.1) rotate(0deg); }
    75% { transform: translateY(-10px) scale(1.1) rotate(4deg); }
  }

  /* 慢速呼吸和浮动（熔岩红与古铜金双色交替发光） */
  @keyframes tokenAlienFloat {
    0%, 100% {
      transform: translateY(0) scale(1) rotate(0deg);
      filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 6px rgba(220, 38, 38, 0.45));
    }
    50% {
      transform: translateY(-8px) scale(1.05) rotate(-1.5deg);
      filter: drop-shadow(0 15px 26px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 20px rgba(245, 158, 11, 0.7));
    }
  }
`;

const RealIcon = ({ src, alt, size = 20, isActive }) => {
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px',
      overflow: 'hidden',
      background: isActive ? 'radial-gradient(circle, rgba(249, 115, 22, 0.3) 0%, transparent 70%)' : 'transparent',
      transition: 'all 0.3s ease',
      verticalAlign: 'middle',
    }}>
      <img 
        src={src} 
        alt={alt} 
        style={{
          width: '120%',
          height: '120%',
          objectFit: 'contain',
          mixBlendMode: 'screen',
          WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 48%, rgba(0,0,0,0) 65%)',
          maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 48%, rgba(0,0,0,0) 65%)',
          filter: isActive ? 'contrast(1.3) brightness(1.25) drop-shadow(0 0 6px rgba(249, 115, 22, 0.8))' : 'contrast(1.1) brightness(0.8) grayscale(0.2)',
          transition: 'all 0.3s ease',
        }}
      />
    </div>
  );
};

export default function MainMenu() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      if (window.location.search.includes('mock_encounter=1')) return 'encounter';
      if (window.location.search.includes('mock_battle=1') || window.location.search.includes('mock=1')) return 'battle';
    }
    return 'tasks';
  });
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
        color: '#110505',
        boxShadow: `0 0 20px ${specialColor === '#f97316' ? 'rgba(249, 115, 22, 0.5)' : 'rgba(194, 157, 56, 0.5)'}`
      } : {};
    }
    return {
      background: 'transparent',
      border: `1px solid ${specialColor || 'rgba(194, 157, 56, 0.4)'}`,
      boxShadow: 'none',
      color: specialColor || 'var(--gold)'
    };
  };

  const tabs = [
    { id: 'tasks', label: '任务大厅', img: '/wuxia_tasks_icon.webp' },
    { id: 'battle', label: '竞技对战', img: '/wuxia_battle_icon.webp' },
    { id: 'leader', label: '风云榜', img: '/wuxia_leader_icon.webp' },
    { id: 'encounter', label: '江湖奇遇', img: '/wuxia_encounter_icon.webp' },
    { id: 'realm', label: '秘境寻宝', img: '/wuxia_realm_icon.webp', color: '#f97316' },
    { id: 'auction', label: '拍卖风云', img: '/wuxia_auction_icon.webp', color: '#c29d38' },
    { id: 'boss', label: '世界Boss', img: '/wuxia_battle_icon.webp', color: '#ef4444' },
    { id: 'furnace', label: '太上神炉', img: '/wuxia_realm_icon.webp', color: '#10b981' },
  ];

  // 移动端布局
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
        <style>{tokenStyles}</style>
        {/* 顶部Tab导航 */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
        }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className="btn-primary"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...btnStyle(isActive, tab.color),
                  padding: '0.5rem 0.8rem',
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RealIcon src={tab.img} alt={tab.label} size={18} isActive={isActive} />
                <span>{tab.label}</span>
              </button>
            );
          })}
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
          {activeTab === 'boss' && <WorldBossArena />}
          {activeTab === 'furnace' && <AlchemyFurnace />}
        </div>

        {showBlackMarket && <BlackMarket onClose={() => setShowBlackMarket(false)} />}

        {/* 黑市按钮 - 极致暗黑异形纹理令牌 */}
        <button 
          onClick={() => setShowBlackMarket(true)} 
          className="black-market-token-alien-img-btn" 
          style={{
            position: 'fixed', bottom: '20px', right: '20px', zIndex: 8000,
            width: '110px', height: '110px'
          }}
          title="进入黑市"
        >
          <div className="token-image-wrapper">
            <img src="/dark_wuxia_token.webp" alt="黑市密令" />
            <div className="token-glow-overlay"></div>
          </div>
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
            江湖入口
          </div>

          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className="btn-primary"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...btnStyle(isActive, tab.color),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '0.8rem 1.2rem',
                }}
              >
                <RealIcon src={tab.img} alt={tab.label} size={24} isActive={isActive} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        {activeTab === 'tasks' && <TaskHall />}
        {activeTab === 'battle' && <BattleArena />}
        {activeTab === 'leader' && <Leaderboard />}
        {activeTab === 'encounter' && <EncounterArena />}
        {activeTab === 'realm' && <SecretRealm />}
        {activeTab === 'auction' && <AuctionHouse />}
        {activeTab === 'boss' && <WorldBossArena />}
        {activeTab === 'furnace' && <AlchemyFurnace />}
      </div>

      {showBlackMarket && <BlackMarket onClose={() => setShowBlackMarket(false)} />}

      {/* 确保PC端也加载相同的样式 */}
      <style>{tokenStyles}</style>
      {/* 黑市按钮 - 极致暗黑异形纹理令牌 */}
      <button 
        onClick={() => setShowBlackMarket(true)} 
        className="black-market-token-alien-img-btn" 
        style={{
          position: 'fixed', bottom: '30px', right: '30px', zIndex: 8000,
          width: '160px', height: '160px'
        }}
        title="进入黑市"
      >
        <div className="token-image-wrapper">
          <img src="/dark_wuxia_token.webp" alt="黑市密令" />
          <div className="token-glow-overlay"></div>
        </div>
      </button>
    </div>
  );
}

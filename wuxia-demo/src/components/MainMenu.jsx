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
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 300px) 1fr', gap: '2rem', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <PlayerStatus />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1.5rem', background: 'var(--glass-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <button 
            className="btn-primary" 
            onClick={() => setActiveTab('tasks')} 
            style={activeTab !== 'tasks' ? {background: 'transparent', border: '1px solid var(--primary-glow)', boxShadow: 'none'} : {}}>
            任务大厅
          </button>
          <button 
            className="btn-primary" 
            onClick={() => setActiveTab('battle')} 
            style={activeTab !== 'battle' ? {background: 'transparent', border: '1px solid var(--primary-glow)', boxShadow: 'none'} : {}}>
            竞技对战
          </button>
          <button 
            className="btn-primary" 
            onClick={() => setActiveTab('leader')} 
            style={activeTab !== 'leader' ? {background: 'transparent', border: '1px solid var(--primary-glow)', boxShadow: 'none'} : {}}>
            风云榜
          </button>
          <button 
            className="btn-primary" 
            onClick={() => setActiveTab('encounter')} 
            style={activeTab !== 'encounter' ? {background: 'transparent', border: '1px solid var(--primary-glow)', boxShadow: 'none'} : {}}>
            江湖奇遇
          </button>
          <button 
            className="btn-primary" 
            onClick={() => setActiveTab('realm')} 
            style={activeTab !== 'realm' ? {background: 'transparent', border: '1px dashed #c084fc', boxShadow: 'none', color: '#c084fc'} : {background: '#c084fc', color: '#000'}}>
            秘境寻宝
          </button>
          <button 
            className="btn-primary" 
            onClick={() => setActiveTab('auction')} 
            style={activeTab !== 'auction' ? {background: 'transparent', border: '1px solid #facc15', boxShadow: 'none', color: '#facc15'} : {background: '#facc15', color: '#000'}}>
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
      
      <button onClick={() => setShowBlackMarket(true)} style={{
          position: 'fixed', bottom: '30px', right: '30px', zIndex: 8000,
          background: 'linear-gradient(45deg, #7f1d1d, #b91c1c)', color: '#fff',
          border: '2px solid #facc15', borderRadius: '50%', width: '60px', height: '60px',
          display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer',
          boxShadow: '0 0 20px rgba(185, 28, 28, 0.8)', animation: 'pulse 2s infinite'
      }}>
          <ShoppingBag size={28} />
      </button>
    </div>
  );
}

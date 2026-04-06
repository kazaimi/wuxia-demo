import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameState';
import PlayerStatus from './PlayerStatus';
import TaskHall from './TaskHall';
import BattleArena from './BattleArena';
import Leaderboard from './Leaderboard';
import EncounterArena from './EncounterArena';
import SecretRealm from './SecretRealm';

export default function MainMenu() {
  const [activeTab, setActiveTab] = useState('tasks');
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
        </div>
      </div>
      <div>
        {activeTab === 'tasks' && <TaskHall />}
        {activeTab === 'battle' && <BattleArena />}
        {activeTab === 'leader' && <Leaderboard />}
        {activeTab === 'encounter' && <EncounterArena />}
        {activeTab === 'realm' && <SecretRealm />}
      </div>
    </div>
  );
}

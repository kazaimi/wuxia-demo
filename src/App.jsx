import React, { useEffect, useState } from 'react';
import { useGameStore } from './store/gameState';
import CreateRole from './components/CreateRole';
import MainMenu from './components/MainMenu';
import BroadcastMarquee from './components/BroadcastMarquee';
import { Target } from 'lucide-react';

function App() {
  const initSocket = useGameStore(state => state.initSocket);
  const hasCreatedRole = useGameStore(state => state.hasCreatedRole);
  const loginChecked = useGameStore(state => state.loginChecked);
  const manualLogin = useGameStore(state => state.manualLogin);
  
  const [inputName, setInputName] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    initSocket();
  }, [initSocket]);

  if (!loginChecked) {
     return <div className="app-container" style={{ display:'flex', justifyContent:'center', alignItems:'center' }}><h2 className="glow-effect">正在查验江湖户籍...</h2></div>;
  }

  const handleLogin = (e) => {
     e.preventDefault();
     if(inputName.trim()){
        // 尝试向服务器查询是否存在此账号
        manualLogin(inputName.trim());
        // 给一定时间让 websocket 通信返回是否成功
        setTimeout(() => {
           const state = useGameStore.getState();
           if (!state.hasCreatedRole) {
              // 服务器找不到或没有旧档，显示捏人页面
              setShowCreate(true);
           }
        }, 500);
     }
  };

  return (
    <div className="app-container">
      {/* 顶部装饰线 */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />

      <BroadcastMarquee />

      {/* 武侠风标题 */}
      <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative' }}>
        <div style={{
          fontFamily: '"Ma Shan Zheng", "Zhi Mang Xing", cursive',
          fontSize: 'clamp(1.8rem, 5vw, 3.2rem)',
          letterSpacing: 'clamp(4px, 2vw, 12px)',
          background: 'linear-gradient(135deg, #d4af37 0%, #fff5d4 50%, #d4af37 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.5))',
          marginBottom: '0.5rem'
        }}>
          大乱斗武侠
        </div>
        <div style={{
          fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
          letterSpacing: 'clamp(2px, 1vw, 4px)',
          color: '#d4af37',
          fontFamily: '"Ma Shan Zheng", cursive',
          opacity: 0.8
        }}>
          ═══ v1.5 一掷千金 ═══
        </div>
        {/* 装饰性剑纹 - 仅PC端显示 */}
        <div className="sword-decoration-left" style={{
          position: 'absolute',
          top: '50%',
          left: '10%',
          transform: 'translateY(-50%)',
          width: '60px',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--gold))',
          opacity: 0.5,
          display: 'none'
        }} />
        <div className="sword-decoration-right" style={{
          position: 'absolute',
          top: '50%',
          right: '10%',
          transform: 'translateY(-50%)',
          width: '60px',
          height: '2px',
          background: 'linear-gradient(90deg, var(--gold), transparent)',
          opacity: 0.5,
          display: 'none'
        }} />
      </div>

      {!hasCreatedRole ? (
        showCreate ? (
           <CreateRole initialName={inputName.trim()} />
        ) : (
           <div className="glass-panel animate-slide-up" style={{ maxWidth: '420px', margin: '4rem auto', padding: '2.5rem', textAlign: 'center', position: 'relative' }}>
              {/* 角落装饰 */}
              <div className="corner-decoration top-left" />
              <div className="corner-decoration top-right" />
              <div className="corner-decoration bottom-left" />
              <div className="corner-decoration bottom-right" />

              <div style={{ marginBottom: '1.5rem' }}>
                <Target size={56} color="var(--gold)" style={{ filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.5))' }} />
              </div>
              <h2 style={{
                marginBottom: '1rem',
                color: 'var(--gold)',
                fontSize: '1.8rem',
                fontFamily: '"Ma Shan Zheng", cursive',
                letterSpacing: '4px'
              }}>武林户籍管属</h2>
              <div style={{ width: '60px', height: '2px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                输入尊姓大名，若您是隐世高手将自动读取您的深厚修为；若是新星即可入世扬名。
              </p>
              <form onSubmit={handleLogin}>
                 <input
                   type="text"
                   value={inputName}
                   onChange={e => setInputName(e.target.value)}
                   placeholder="请输入江湖名号..."
                   maxLength={12}
                   className="wuxia-input"
                   style={{ width: '100%', marginBottom: '1rem', textAlign: 'center', fontSize: '1.1rem' }}
                 />
                 <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.9rem', fontSize: '1.2rem' }}>
                   踏入江湖
                 </button>
              </form>
           </div>
        )
      ) : (
        <MainMenu />
      )}
    </div>
  );
}

export default App;

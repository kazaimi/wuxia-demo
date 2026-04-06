import React, { useEffect, useState } from 'react';
import { useGameStore } from './store/gameState';
import CreateRole from './components/CreateRole';
import MainMenu from './components/MainMenu';
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
      <h1 className="wuxia-title glow-effect" style={{ fontFamily: '"STKaiti", "KaiTi", serif', fontSize: '2.5rem', letterSpacing: '4px' }}>
         大乱斗武侠 <span style={{ fontSize: '1.4rem', color: '#c084fc', opacity: 0.9, marginLeft: '15px', verticalAlign: 'middle', letterSpacing: '2px', textShadow: '0 0 10px rgba(192, 132, 252, 0.4)' }}>v1.5 琅嬛福地</span>
      </h1>
      {!hasCreatedRole ? (
        showCreate ? (
           <CreateRole initialName={inputName.trim()} />
        ) : (
           <div className="glass-panel animate-slide-up" style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
              <Target size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1.6rem' }}>武林户籍管属</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>输入尊姓大名。若您是隐世高手将自动读取您的深厚修为；若是新星即可入世扬名。</p>
              <form onSubmit={handleLogin}>
                 <input 
                   type="text" 
                   value={inputName}
                   onChange={e => setInputName(e.target.value)}
                   placeholder="输入江湖名号..." 
                   maxLength={12}
                   style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '1.1rem', marginBottom: '1rem', textAlign: 'center' }}
                 />
                 <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.8rem', fontSize: '1.1rem' }}>踏入江湖 (Login / Join)</button>
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

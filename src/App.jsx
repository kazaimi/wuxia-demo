import React, { useEffect, useState } from 'react';
import { useGameStore } from './store/gameState';
import CreateRole from './components/CreateRole';
import MainMenu from './components/MainMenu';
import BroadcastMarquee from './components/BroadcastMarquee';
import { Target } from 'lucide-react';
import { SoundManager } from './utils/SoundManager';
import AudioController from './components/AudioController';

function App() {
  const initSocket = useGameStore(state => state.initSocket);
  const hasCreatedRole = useGameStore(state => state.hasCreatedRole);
  const loginChecked = useGameStore(state => state.loginChecked);
  const manualLogin = useGameStore(state => state.manualLogin);
  const loginError = useGameStore(state => state.loginError);
  
  const [inputName, setInputName] = useState(localStorage.getItem('wuxia_username') || '');
  const [inputPassword, setInputPassword] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginTimer, setLoginTimer] = useState(null);

  useEffect(() => {
    initSocket();
  }, [initSocket]);

  // 监听登录的异步反馈
  useEffect(() => {
    if (isLoggingIn) {
      if (hasCreatedRole) {
        setIsLoggingIn(false);
        if (loginTimer) {
          clearTimeout(loginTimer);
          setLoginTimer(null);
        }
      } else if (loginError) {
        setIsLoggingIn(false);
        if (loginTimer) {
          clearTimeout(loginTimer);
          setLoginTimer(null);
        }
        
        const trimmedName = inputName.trim();
        if (loginError === '户籍未登入') {
           const MOCK_NAMES = [
             '扫地僧', '东方不败', '乔峰', '虚竹', '段誉', '无崖子', '张三丰', '张无忌', '独孤求败', '王重阳', 
             '周伯通', '洪七公', '金轮法王', '郭靖', '黄药师', '欧阳锋', '令狐冲', '风清扬', '任我行', '邀月', 
             '燕南天', '西门吹雪', '叶孤城', '绝无神', '雄霸', '步惊云', '聂风', '天山童姥', '李寻欢', '阿飞', 
             '左冷禅', '岳不群', '丁春秋', '鸠摩智', '游坦之', '慕容复', '段延庆', '天机老人', '楚留香', '陆小凤', 
             '胡铁花', '花无缺', '小鱼儿', '成昆', '谢逊', '灭绝师太', '林平之', '陈家洛', '袁承志', '狄云', 
             '石破天', '丁典', '白自在', '胡一刀', '玄慈大师', '神雕大侠', '玉面飞龙', '血刀老祖', '苗人凤', '四大恶人'
           ];
           if (MOCK_NAMES.includes(trimmedName)) {
              alert('此名号为武林名宿专属，新入世大侠不可冒用，请换个名号！');
              localStorage.removeItem('wuxia_username');
              localStorage.removeItem('wuxia_password');
              useGameStore.setState({ loginError: null });
              return;
           }
           setShowCreate(true);
        } else {
           alert(loginError);
        }
      }
    }
  }, [hasCreatedRole, loginError, isLoggingIn, loginTimer, inputName]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (loginTimer) {
        clearTimeout(loginTimer);
      }
    };
  }, [loginTimer]);

  // 全局用户交互以解锁浏览器自动播放机制，确保声音系统完全激活
  useEffect(() => {
    const handleGlobalUnlock = () => {
      SoundManager.unlock();
      if (SoundManager.unlocked) {
        if (hasCreatedRole) {
          SoundManager.playMusic('bgm_menu');
        }
        // 成功解锁后，立即移除全局交互解锁监听器，防止后续任意点击强制覆盖当前播放的 BGM
        window.removeEventListener('click', handleGlobalUnlock);
        window.removeEventListener('touchstart', handleGlobalUnlock);
      }
    };

    if (!SoundManager.unlocked) {
      window.addEventListener('click', handleGlobalUnlock);
      window.addEventListener('touchstart', handleGlobalUnlock);
    }

    return () => {
      window.removeEventListener('click', handleGlobalUnlock);
      window.removeEventListener('touchstart', handleGlobalUnlock);
    };
  }, [hasCreatedRole]);

  // 监听角色登录加载状态，如果已登录且音频已解锁，自动播放主背景音乐
  useEffect(() => {
    if (hasCreatedRole && SoundManager.unlocked) {
      SoundManager.playMusic('bgm_menu');
    }
  }, [hasCreatedRole]);

  if (!loginChecked) {
     return <div className="app-container" style={{ display:'flex', justifyContent:'center', alignItems:'center' }}><h2 className="glow-effect">正在查验江湖户籍...</h2></div>;
  }

  const handleLogin = (e) => {
     e.preventDefault();
     const trimmedName = inputName.trim();
     const trimmedPassword = inputPassword.trim();
     if(trimmedName){
        setIsLoggingIn(true);
        if (loginTimer) clearTimeout(loginTimer);
        
        // 尝试向服务器查询是否存在此账号
        manualLogin(trimmedName, trimmedPassword);
        
        // 5秒宽容度连接超时
        const timer = setTimeout(() => {
           const state = useGameStore.getState();
           if (!state.hasCreatedRole) {
              setIsLoggingIn(false);
              alert('与信使局连接超时，请检查网络或确认服务器已开启！');
           }
        }, 5000);
        setLoginTimer(timer);
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
          ═══ v2.7 魔罗降世 ═══
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
           <CreateRole initialName={inputName.trim()} initialPassword={inputPassword.trim()} />
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
                   disabled={isLoggingIn}
                   className="wuxia-input"
                   style={{ width: '100%', marginBottom: '1rem', textAlign: 'center', fontSize: '1.1rem', opacity: isLoggingIn ? 0.6 : 1 }}
                 />
                 <input
                   type="password"
                   value={inputPassword}
                   onChange={e => setInputPassword(e.target.value)}
                   placeholder="请输入暗号/密码(老账号首次输入即绑定)..."
                   maxLength={20}
                   disabled={isLoggingIn}
                   className="wuxia-input"
                   style={{ width: '100%', marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.1rem', opacity: isLoggingIn ? 0.6 : 1 }}
                 />
                 <button type="submit" disabled={isLoggingIn} className="btn-primary" style={{ width: '100%', padding: '0.9rem', fontSize: '1.2rem', opacity: isLoggingIn ? 0.6 : 1 }}>
                   {isLoggingIn ? '正在登入江湖...' : '踏入江湖'}
                 </button>
              </form>
           </div>
        )
      ) : (
        <MainMenu />
      )}

      {/* 全局音频控制器悬浮组件 */}
      <AudioController />
    </div>
  );
}

export default App;

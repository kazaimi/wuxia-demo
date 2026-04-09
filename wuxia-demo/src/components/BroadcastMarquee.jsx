import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameState';
import { Megaphone } from 'lucide-react';

export default function BroadcastMarquee() {
  const broadcastQueue = useGameStore(state => state.broadcastQueue);
  const removeBroadcast = useGameStore(state => state.removeBroadcast);

  useEffect(() => {
     if (broadcastQueue.length > 0) {
        const topBroadcast = broadcastQueue[0];
        const timer = setTimeout(() => {
           removeBroadcast(topBroadcast.id);
        }, 15000); // 15秒后移除弹幕
        return () => clearTimeout(timer);
     }
  }, [broadcastQueue, removeBroadcast]);

  if (broadcastQueue.length === 0) return null;

  return (
    <div style={{
       position: 'fixed',
       top: '10px',
       left: '50%',
       transform: 'translateX(-50%)',
       width: '80%',
       maxWidth: '800px',
       background: 'rgba(0,0,0,0.85)',
       color: 'var(--warn)',
       border: '2px solid var(--primary-glow)',
       borderRadius: '20px',
       padding: '8px 16px',
       display: 'flex',
       alignItems: 'center',
       gap: '10px',
       boxShadow: '0 0 15px rgba(255,215,0,0.5)',
       zIndex: 9999,
       pointerEvents: 'none',
       overflow: 'hidden'
    }}>
      <Megaphone size={20} color="var(--warn)" style={{ flexShrink: 0, animation: 'pulse 1s infinite' }} />
      <div style={{ width: '100%', overflow: 'hidden', whiteSpace: 'nowrap' }}>
         <div style={{
            display: 'inline-block',
            animation: 'marquee 12s linear forwards',
            fontSize: '1rem',
            fontWeight: 'bold',
            textShadow: '0 0 5px rgba(255,215,0,0.6)'
         }}>
             {broadcastQueue[0].msg}
         </div>
      </div>
      <style>{`
        @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-150%); }
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

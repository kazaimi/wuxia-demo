import React, { useState } from 'react';
import { useAudioStore } from '../store/useAudioStore';
import { Volume2, VolumeX, Music, Swords, Settings } from 'lucide-react';

export default function AudioController() {
  const isMuted = useAudioStore(state => state.isMuted);
  const musicVolume = useAudioStore(state => state.musicVolume);
  const sfxVolume = useAudioStore(state => state.sfxVolume);
  const toggleMute = useAudioStore(state => state.toggleMute);
  const setMusicVolume = useAudioStore(state => state.setMusicVolume);
  const setSfxVolume = useAudioStore(state => state.setSfxVolume);

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '0.5rem',
      fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif'
    }}>
      {/* 悬浮音量微调滑块面板 */}
      {isOpen && (
        <div className="glass-panel" style={{
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.8rem',
          minWidth: '180px',
          background: 'rgba(10, 5, 5, 0.95)',
          border: '1px solid var(--gold)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8), 0 0 10px rgba(212, 175, 55, 0.15)',
          borderRadius: '8px',
          animation: 'slideUp 0.2s ease-out'
        }}>
          {/* 四角铜饰 */}
          <div className="corner-decoration top-left" style={{ width: '4px', height: '4px', borderColor: 'var(--gold)' }} />
          <div className="corner-decoration top-right" style={{ width: '4px', height: '4px', borderColor: 'var(--gold)' }} />
          <div className="corner-decoration bottom-left" style={{ width: '4px', height: '4px', borderColor: 'var(--gold)' }} />
          <div className="corner-decoration bottom-right" style={{ width: '4px', height: '4px', borderColor: 'var(--gold)' }} />

          <h4 style={{ color: 'var(--gold)', fontSize: '0.9rem', margin: 0, borderBottom: '1px dashed rgba(212, 175, 55, 0.25)', paddingBottom: '0.3rem', letterSpacing: '1px', fontFamily: '"Ma Shan Zheng", cursive' }}>
            音律调节
          </h4>

          {/* BGM 音量 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Music size={12}/> 背景琴音</span>
              <span>{Math.round(musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={musicVolume}
              onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--gold)',
                background: 'rgba(255,255,255,0.1)',
                height: '4px',
                borderRadius: '2px',
                cursor: 'pointer'
              }}
            />
          </div>

          {/* SFX 音量 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Swords size={12}/> 动作余音</span>
              <span>{Math.round(sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfxVolume}
              onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--gold)',
                background: 'rgba(255,255,255,0.1)',
                height: '4px',
                borderRadius: '2px',
                cursor: 'pointer'
              }}
            />
          </div>
        </div>
      )}

      {/* 按钮控制条（一键静音 + 调律滑块折叠） */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {/* 滑块面板折叠按钮 */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: isOpen ? 'var(--gold)' : 'rgba(0, 0, 0, 0.75)',
            border: '1px solid var(--gold)',
            color: isOpen ? '#000' : 'var(--gold)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
          }}
          title="音律微调"
        >
          <Settings size={16} className={isOpen ? 'spin' : ''} />
        </button>

        {/* 静音/音量开关主按钮 */}
        <button
          onClick={toggleMute}
          style={{
            background: isMuted ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 0, 0, 0.75)',
            border: `1px solid ${isMuted ? 'var(--danger)' : 'var(--gold)'}`,
            color: isMuted ? 'var(--danger)' : 'var(--gold)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
          }}
          title={isMuted ? "开启声音" : "一键静音"}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
    </div>
  );
}

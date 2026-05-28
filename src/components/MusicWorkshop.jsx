import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Music, Settings, X, Disc, Sparkles, Key, Landmark } from 'lucide-react';
import { SoundManager } from '../utils/SoundManager';

export default function MusicWorkshop({ isOpen, onClose }) {
  const [token, setToken] = useState('');
  const [musicId, setMusicId] = useState('bgm_menu');
  const [prompt, setPrompt] = useState('peaceful zen ambient traditional chinese music, guzheng and xiao flute, slow tempo, mist and mountains');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateTime, setGenerateTime] = useState(0);
  const [tempAudioUrl, setTempAudioUrl] = useState('');
  const [isPlayingTemp, setIsPlayingTemp] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showKeySetting, setShowKeySetting] = useState(false);
  const [modelSource, setModelSource] = useState('replicate');

  const audioRef = useRef(null);
  const timerRef = useRef(null);

  // 预设意境
  const presetIntents = [
    {
      name: '天机主城 (竹影清流)',
      prompt: 'peaceful zen ambient traditional chinese music, guzheng and xiao flute, slow tempo, mist and mountains'
    },
    {
      name: '铁血沙场 (铁骑踏歌)',
      prompt: 'intense martial arts traditional chinese music, war drums, fast paced pipas and erhu, epic cinematic battle'
    },
    {
      name: '琅嬛幽谷 (空灵诡秘)',
      prompt: 'mysterious spooky ancient chinese background music, slow flute, dark ambient, fog, suspenseful'
    },
    {
      name: '黑市市井 (清雨小调)',
      prompt: 'cheerful lively traditional chinese market music, pipa, sheng, lighthearted and festive atmosphere'
    }
  ];

  // 从本地加载密钥
  useEffect(() => {
    const savedToken = localStorage.getItem('replicate_api_token') || '';
    setToken(savedToken);
  }, []);

  // 密钥更改保存
  const handleTokenChange = (val) => {
    setToken(val);
    localStorage.setItem('replicate_api_token', val);
  };

  // 计时器逻辑
  useEffect(() => {
    if (isGenerating) {
      timerRef.current = setInterval(() => {
        setGenerateTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setGenerateTime(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGenerating]);

  // 关闭时重置试听与状态
  const handleClose = () => {
    stopTempAudio();
    setErrorMsg('');
    setSuccessMsg('');
    setIsGenerating(false);
    onClose();
  };

  // 播放临时生成的音乐
  const togglePlayTemp = () => {
    if (!tempAudioUrl) return;

    if (isPlayingTemp) {
      stopTempAudio();
    } else {
      // 播放前静音当前游戏的背景音乐，避免重叠
      SoundManager.bgmChannels.forEach(audio => {
        if (audio && !audio.paused) {
          try { audio.volume = 0; } catch (e) {}
        }
      });
      // 静音网页实时合成背景音乐
      try {
        const synth = window.WebAudioSynthesizer || SoundManager.fallbackToSynth;
        if (synth && typeof synth.stopBgm === 'function') {
          synth.stopBgm();
        }
      } catch (e) {}

      if (!audioRef.current) {
        audioRef.current = new Audio(tempAudioUrl);
        audioRef.current.loop = true;
        audioRef.current.onended = () => setIsPlayingTemp(false);
      } else {
        audioRef.current.src = tempAudioUrl;
      }

      audioRef.current.volume = SoundManager.musicVolume;
      audioRef.current.muted = SoundManager.isMuted;
      audioRef.current.play()
        .then(() => setIsPlayingTemp(true))
        .catch(err => {
          setErrorMsg('播放试听音轨失败，浏览器策略限制，请在页面交互后再试。');
        });
    }
  };

  const stopTempAudio = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (e) {}
    }
    setIsPlayingTemp(false);
    // 恢复游戏背景音乐音量
    SoundManager.syncVolumes();
  };

  // 调用大模型炼乐
  const handleGenerate = async () => {
    if (modelSource === 'replicate' && !token.trim()) {
      setErrorMsg('请先配置 Replicate API 密钥 (Token)，琴坊才可开启大模型炼乐之门。');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setTempAudioUrl('');
    stopTempAudio();
    setIsGenerating(true);

    try {
      // 向后端信使局发起大模型请求
      const response = await fetch('http://localhost:3000/api/generate-music', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          musicId,
          customToken: modelSource === 'replicate' ? token : '',
          modelSource
        })
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || '大模型创作失败，请检查密钥是否正确或网络是否畅通。');
      }

      // 获取临时音乐外链地址，并附带时间戳破除缓存
      setTempAudioUrl(`http://localhost:3000${resData.url}`);
      setSuccessMsg('仙音炼制成功！请于下方开启“试听”，感受大模型创作的华美乐章。');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // 确认拓印收录
  const handleConfirm = async () => {
    if (!tempAudioUrl) return;

    setErrorMsg('');
    setSuccessMsg('');
    setIsConfirming(true);

    try {
      const response = await fetch('http://localhost:3000/api/confirm-music', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ musicId })
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || '拓印入库失败。');
      }

      stopTempAudio();
      setSuccessMsg('拓印成功！新生成的 AI 大模型背景乐已入库并覆盖本地。');
      
      // 现场触发播放器更新，强制重播当前音乐
      setTimeout(() => {
        // 先停掉可能存在的合成背景音
        try {
          if (SoundManager.fallbackToSynth[musicId]) {
            SoundManager.fallbackToSynth[musicId] = false; // 清除降级标志，优先尝试加载我们生成的真实本地音频
          }
        } catch(e) {}
        
        // 重新点播，强制重播
        SoundManager.playMusic(musicId);
        handleClose();
      }, 1000);

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsConfirming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif',
      backdropFilter: 'blur(8px)'
    }}>
      <div className="glass-panel" style={{
        position: 'relative',
        width: '90%',
        maxWidth: '520px',
        background: 'rgba(15, 8, 8, 0.96)',
        border: '2px solid var(--gold)',
        borderRadius: '12px',
        padding: '2rem 1.5rem 1.5rem 1.5rem',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.95), 0 0 15px rgba(212, 175, 55, 0.25)',
        color: '#f0f0f0',
        animation: 'scaleIn 0.25s ease-out'
      }}>
        {/* 四角铜饰 */}
        <div className="corner-decoration top-left" style={{ width: '12px', height: '12px', borderColor: 'var(--gold)' }} />
        <div className="corner-decoration top-right" style={{ width: '12px', height: '12px', borderColor: 'var(--gold)' }} />
        <div className="corner-decoration bottom-left" style={{ width: '12px', height: '12px', borderColor: 'var(--gold)' }} />
        <div className="corner-decoration bottom-right" style={{ width: '12px', height: '12px', borderColor: 'var(--gold)' }} />

        {/* 顶部关闭按钮 */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: 'var(--gold)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            transition: 'background-color 0.2s'
          }}
          title="关闭"
        >
          <X size={20} />
        </button>

        {/* 主标题 */}
        <h2 style={{
          fontFamily: '"Ma Shan Zheng", cursive',
          color: 'var(--gold)',
          textAlign: 'center',
          fontSize: '2rem',
          margin: '0 0 1rem 0',
          letterSpacing: '3px',
          textShadow: '0 0 8px rgba(212, 175, 55, 0.4)'
        }}>
          天机琴坊
        </h2>
        <p style={{
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          marginTop: '-0.5rem',
          marginBottom: '1.5rem'
        }}>
          —— 汇聚云端乐律大模型，炼制您独一无二的江湖背景琴音 ——
        </p>

        {/* 密钥配置折叠条 (仅在 Replicate 模式下需要) */}
        {modelSource === 'replicate' && (
          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={() => setShowKeySetting(!showKeySetting)}
              style={{
                width: '100%',
                background: 'rgba(212, 175, 55, 0.05)',
                border: '1px dashed rgba(212, 175, 55, 0.3)',
                color: 'var(--gold)',
                padding: '0.5rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              <Key size={14} />
              {showKeySetting ? '隐藏大模型密钥配置' : '配置大模型 API 密钥'}
            </button>
            
            {showKeySetting && (
              <div style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(212, 175, 55, 0.15)',
                borderTop: 'none',
                padding: '0.8rem',
                borderRadius: '0 0 4px 4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                animation: 'fadeIn 0.2s'
              }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Replicate API Token (仅保存在您的浏览器本地缓存中)：
                </label>
                <input
                  type="password"
                  placeholder="r8_..."
                  value={token}
                  onChange={(e) => handleTokenChange(e.target.value)}
                  style={{
                    background: 'rgba(10, 5, 5, 0.95)',
                    border: '1px solid var(--gold)',
                    color: '#fff',
                    padding: '0.4rem 0.6rem',
                    fontSize: '0.8rem',
                    borderRadius: '4px',
                    outline: 'none'
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Suno 模式下的 Docker 启动提示 */}
        {modelSource === 'suno' && (
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            background: 'rgba(212, 175, 55, 0.05)',
            border: '1px dashed rgba(212, 175, 55, 0.25)',
            padding: '0.6rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            lineHeight: '1.4'
          }}>
            已启用 Suno 桥接网关。请确保您已在本地终端运行了 Docker 容器 (suno-api) 并在其中正确注入了您 Pro 账号的 Session Cookie 环境变量。
          </div>
        )}

        {/* 表单区域 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
          {/* 大模型源选择 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Settings size={14} /> 感应乐理天机 (大模型源)
            </span>
            <div style={{ display: 'flex', gap: '1.5rem', margin: '4px 0', fontSize: '0.8rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="modelSource"
                  value="replicate"
                  checked={modelSource === 'replicate'}
                  onChange={() => setModelSource('replicate')}
                  disabled={isGenerating}
                  style={{ accentColor: 'var(--gold)', cursor: 'pointer' }}
                />
                <span>Replicate (轻量快炼)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="modelSource"
                  value="suno"
                  checked={modelSource === 'suno'}
                  onChange={() => setModelSource('suno')}
                  disabled={isGenerating}
                  style={{ accentColor: 'var(--gold)', cursor: 'pointer' }}
                />
                <span>Suno (Pro 会员深炼)</span>
              </label>
            </div>
          </div>

          {/* 目标音乐 ID 选择 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Music size={14} /> 选定炼制目标
            </span>
            <select
              value={musicId}
              onChange={(e) => setMusicId(e.target.value)}
              disabled={isGenerating}
              style={{
                background: 'rgba(10, 5, 5, 0.95)',
                border: '1px solid var(--gold)',
                color: '#fff',
                padding: '0.5rem',
                borderRadius: '4px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="bgm_menu">主城悬赏大厅 (bgm_menu.wav)</option>
              <option value="bgm_battle">江湖风云对决 (bgm_battle.wav)</option>
              <option value="bgm_realm">琅嬛福地探索 (bgm_realm.wav)</option>
              <option value="bgm_market">幽冥黑市贸易 (bgm_market.wav)</option>
            </select>
          </div>

          {/* 预设标签 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ color: 'var(--gold)' }}>
              快捷意境感悟
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {presetIntents.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(p.prompt)}
                  disabled={isGenerating}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'var(--text-muted)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = 'var(--gold)';
                    e.target.style.color = 'var(--gold)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.color = 'var(--text-muted)';
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* 描述词 Prompt */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={14} /> 填入琴曲意境 (支持英文提示词以匹配大模型)
            </span>
            <textarea
              rows="3"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              style={{
                background: 'rgba(10, 5, 5, 0.95)',
                border: '1px solid var(--gold)',
                color: '#fff',
                padding: '0.5rem',
                borderRadius: '4px',
                outline: 'none',
                resize: 'none',
                fontSize: '0.8rem',
                lineHeight: '1.4'
              }}
              placeholder="请输入意境描述，如：classic guqin, peaceful bamboos..."
            />
          </div>
        </div>

        {/* 错误或成功提示 */}
        {errorMsg && (
          <div style={{
            marginTop: '1rem',
            padding: '0.6rem 0.8rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            fontSize: '0.8rem',
            borderRadius: '4px'
          }}>
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{
            marginTop: '1rem',
            padding: '0.6rem 0.8rem',
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid #22c55e',
            color: '#22c55e',
            fontSize: '0.8rem',
            borderRadius: '4px'
          }}>
            {successMsg}
          </div>
        )}

        {/* 炼制进度显示 */}
        {isGenerating && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'rgba(212, 175, 55, 0.05)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Disc size={28} className="spin" style={{ color: 'var(--gold)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--gold)', letterSpacing: '1px' }}>
              正在召感天机炼乐大模型中...
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              云端 GPU 计算已耗时 {generateTime} 秒 (通常需要约 15-30 秒)
            </span>
          </div>
        )}

        {/* 试听与收录区域 */}
        {tempAudioUrl && (
          <div style={{
            marginTop: '1rem',
            padding: '0.8rem',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <button
              onClick={togglePlayTemp}
              style={{
                background: isPlayingTemp ? 'rgba(212, 175, 55, 0.15)' : 'rgba(0,0,0,0.6)',
                border: '1px solid var(--gold)',
                color: 'var(--gold)',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {isPlayingTemp ? <Pause size={14} /> : <Play size={14} />}
              {isPlayingTemp ? '暂停试听' : '播放试听'}
            </button>

            <button
              onClick={handleConfirm}
              disabled={isConfirming}
              style={{
                background: 'var(--gold)',
                border: '1px solid var(--gold)',
                color: '#000',
                fontWeight: 'bold',
                padding: '0.4rem 1rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: isConfirming ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 0 8px rgba(212, 175, 55, 0.2)'
              }}
            >
              <Landmark size={14} />
              {isConfirming ? '收录中...' : '拓印收录，存入江湖'}
            </button>
          </div>
        )}

        {/* 底部生成按钮 */}
        {!tempAudioUrl && !isGenerating && (
          <button
            onClick={handleGenerate}
            style={{
              width: '100%',
              background: 'none',
              border: '1px solid var(--gold)',
              color: 'var(--gold)',
              padding: '0.7rem',
              borderRadius: '4px',
              fontSize: '0.95rem',
              fontWeight: 'bold',
              fontFamily: '"Ma Shan Zheng", cursive',
              letterSpacing: '2px',
              marginTop: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 10px rgba(0,0,0,0.4)'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--gold)';
              e.target.style.color = '#000';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none';
              e.target.style.color = 'var(--gold)';
            }}
          >
            开启大模型炼乐
          </button>
        )}
      </div>
    </div>
  );
}

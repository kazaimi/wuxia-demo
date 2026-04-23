import { useState, useEffect } from 'react';

/**
 * 动态立绘组件 (Live2D Lite)
 * 支持：呼吸动画、状态差分、水墨剪影模式
 */
const DynamicPortrait = ({
  gender = 'male',        // 性别: male / female
  state = 'idle',         // 状态: idle / attacking / hit / critical
  silhouette = false,     // 水墨剪影模式
  weaponType = 'sword',   // 武器类型: sword / blade / spear / fist
  auraColor = '#4facfe',  // 气劲颜色
  size = 200,             // 尺寸
}) => {
  const [breathPhase, setBreathPhase] = useState(0);
  const [shakeOffset, setShakeOffset] = useState(0);

  // 呼吸动画
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathPhase(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // 受击震动
  useEffect(() => {
    if (state === 'hit') {
      const shakeInterval = setInterval(() => {
        setShakeOffset(Math.random() * 6 - 3);
      }, 50);
      setTimeout(() => {
        clearInterval(shakeInterval);
        setShakeOffset(0);
      }, 300);
      return () => clearInterval(shakeInterval);
    }
  }, [state]);

  // 计算呼吸偏移
  const breathOffset = Math.sin(breathPhase * Math.PI / 180) * 2;
  const hairSwing = Math.sin(breathPhase * Math.PI / 180 + 0.5) * 3;
  const clothSwing = Math.sin(breathPhase * Math.PI / 180 + 1) * 4;

  // 状态样式
  const stateStyles = {
    idle: { filter: 'none', opacity: 1 },
    attacking: { filter: `drop-shadow(0 0 15px ${auraColor})`, opacity: 1 },
    hit: { filter: 'brightness(1.5) saturate(1.5)', opacity: 1 },
    critical: { filter: 'grayscale(0.7) brightness(0.6)', opacity: 0.8 },
  };

  const currentStateStyle = stateStyles[state] || stateStyles.idle;

  // 水墨剪影颜色
  const silhouetteColors = {
    body: '#0a0a0a',
    cloth: '#1a1a1a',
    hair: '#0a0a0a',
    weapon: auraColor,
    eye: auraColor,
  };

  // 正常模式颜色
  const normalColors = gender === 'female' ? {
    skin: '#f5e6d3',
    hair: '#1a1a1a',
    cloth: '#8b2942',
    clothInner: '#d4a574',
    belt: '#c9a227',
    weapon: '#4a4a4a',
    eye: '#2a2a2a',
  } : {
    skin: '#e8d4b8',
    hair: '#1a1a1a',
    cloth: '#2a3a4a',
    clothInner: '#1a2a3a',
    belt: '#c9a227',
    weapon: '#4a4a4a',
    eye: '#2a2a2a',
  };

  const colors = silhouette ? silhouetteColors : normalColors;

  // 武器路径
  const weaponPaths = {
    sword: (
      <g>
        {/* 剑身 */}
        <rect x="85" y="20" width="8" height="70" fill={colors.weapon} rx="2">
          {state === 'attacking' && (
            <animate attributeName="fill" values={`${colors.weapon};${auraColor};${colors.weapon}`} dur="0.5s" repeatCount="indefinite" />
          )}
        </rect>
        {/* 剑光 */}
        <rect x="87" y="22" width="2" height="65" fill={silhouette ? auraColor : '#fff'} opacity="0.3" />
        {/* 剑柄 */}
        <rect x="82" y="88" width="14" height="8" fill="#4a3020" rx="1" />
        <circle cx="89" cy="98" r="4" fill="#c9a227" />
      </g>
    ),
    blade: (
      <g>
        {/* 刀身 */}
        <path d="M80 25 Q95 40 90 90 L75 90 Z" fill={colors.weapon}>
          {state === 'attacking' && (
            <animate attributeName="fill" values={`${colors.weapon};${auraColor};${colors.weapon}`} dur="0.5s" repeatCount="indefinite" />
          )}
        </path>
        {/* 刀光 */}
        <path d="M82 30 Q90 42 87 85" stroke={silhouette ? auraColor : '#fff'} strokeWidth="2" fill="none" opacity="0.4" />
        {/* 刀柄 */}
        <rect x="78" y="88" width="12" height="15" fill="#4a3020" rx="1" />
      </g>
    ),
    spear: (
      <g>
        {/* 枪杆 */}
        <rect x="87" y="10" width="6" height="100" fill="#5a4030" rx="1" />
        {/* 枪头 */}
        <path d="M85 10 L90 0 L95 10 Z" fill={colors.weapon}>
          {state === 'attacking' && (
            <animate attributeName="fill" values={`${colors.weapon};${auraColor};${colors.weapon}`} dur="0.5s" repeatCount="indefinite" />
          )}
        </path>
        {/* 红缨 */}
        <ellipse cx="90" cy="15" rx="8" ry="5" fill="#8b2942">
          <animate attributeName="rx" values="8;10;8" dur="1s" repeatCount="indefinite" />
        </ellipse>
      </g>
    ),
    fist: (
      <g>
        {/* 拳套 */}
        <ellipse cx="85" cy="70" rx="12" ry="10" fill="#4a4a4a" stroke="#c9a227" strokeWidth="2">
          {state === 'attacking' && (
            <animate attributeName="stroke" values="#c9a227;#fff;#c9a227" dur="0.3s" repeatCount="indefinite" />
          )}
        </ellipse>
        {/* 气劲 */}
        {state === 'attacking' && (
          <circle cx="85" cy="70" r="20" fill="none" stroke={auraColor} strokeWidth="2" opacity="0.5">
            <animate attributeName="r" values="15;25;15" dur="0.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0.2;0.5" dur="0.5s" repeatCount="indefinite" />
          </circle>
        )}
      </g>
    ),
  };

  return (
    <div
      style={{
        width: size,
        height: size * 1.5,
        position: 'relative',
        transform: `translateX(${shakeOffset}px)`,
        ...currentStateStyle,
      }}
    >
      <svg
        viewBox="0 0 180 270"
        width={size}
        height={size * 1.5}
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* 水墨渐变 */}
          <linearGradient id="inkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={silhouette ? '#1a1a1a' : colors.cloth} />
            <stop offset="100%" stopColor={silhouette ? '#0a0a0a' : colors.clothInner} />
          </linearGradient>

          {/* 气劲发光 */}
          <filter id="auraGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* 剪影发光 */}
          {silhouette && (
            <filter id="silhouetteGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feFlood floodColor={auraColor} floodOpacity="0.5" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>

        {/* 后摆衣袖 - 呼吸动画 */}
        <g style={{ transform: `translateY(${breathOffset}px) rotate(${clothSwing}deg)`, transformOrigin: '60px 140px' }}>
          <path
            d="M40 120 Q20 160 30 200 Q40 220 50 200 Q55 170 60 150"
            fill="url(#inkGrad)"
            opacity="0.9"
          />
        </g>

        {/* 后摆衣袖 - 右侧 */}
        <g style={{ transform: `translateY(${breathOffset}px) rotate(${-clothSwing}deg)`, transformOrigin: '120px 140px' }}>
          <path
            d="M140 120 Q160 160 150 200 Q140 220 130 200 Q125 170 120 150"
            fill="url(#inkGrad)"
            opacity="0.9"
          />
        </g>

        {/* 身体/躯干 */}
        <g style={{ transform: `translateY(${breathOffset * 0.5}px)` }}>
          {/* 内衬 */}
          <path
            d="M70 100 L65 180 L115 180 L110 100 Z"
            fill={colors.clothInner}
          />
          {/* 外袍 */}
          <path
            d="M60 95 L55 185 L90 190 L125 185 L120 95 Q90 100 60 95"
            fill="url(#inkGrad)"
          />
          {/* 腰带 */}
          <rect x="55" y="155" width="70" height="12" fill={colors.belt} rx="2" />
          <circle cx="90" cy="161" r="5" fill="#fff" opacity="0.8" />
        </g>

        {/* 领口 */}
        <path
          d="M75 95 L90 110 L105 95"
          fill="none"
          stroke={silhouette ? '#2a2a2a' : colors.clothInner}
          strokeWidth="3"
        />

        {/* 脖子 */}
        <rect x="82" y="75" width="16" height="20" fill={colors.skin} rx="3" />

        {/* 头部 */}
        <g style={{ transform: `translateY(${breathOffset * 0.3}px)` }}>
          {/* 脸 */}
          <ellipse cx="90" cy="55" rx="28" ry="32" fill={colors.skin} />

          {/* 发型 - 呼吸摆动 */}
          <g style={{ transform: `rotate(${hairSwing * 0.5}deg)`, transformOrigin: '90px 30px' }}>
            {gender === 'female' ? (
              <>
                {/* 女性长发 */}
                <path
                  d="M62 45 Q55 30 60 15 Q75 5 90 8 Q105 5 120 15 Q125 30 118 45"
                  fill={colors.hair}
                />
                <path
                  d="M62 45 Q50 70 55 100 Q58 110 65 105 Q70 80 72 60"
                  fill={colors.hair}
                />
                <path
                  d="M118 45 Q130 70 125 100 Q122 110 115 105 Q110 80 108 60"
                  fill={colors.hair}
                />
                {/* 发饰 */}
                <circle cx="65" cy="25" r="4" fill="#c9a227" />
                <circle cx="115" cy="25" r="4" fill="#c9a227" />
              </>
            ) : (
              <>
                {/* 男性束发 */}
                <path
                  d="M65 40 Q60 25 70 15 Q85 5 100 10 Q115 15 118 30 Q120 40 115 45"
                  fill={colors.hair}
                />
                {/* 发髻 */}
                <ellipse cx="90" cy="12" rx="12" ry="8" fill={colors.hair} />
                <circle cx="90" cy="8" r="4" fill="#c9a227" />
                {/* 鬓角 */}
                <path d="M65 40 Q60 55 65 65" fill={colors.hair} />
                <path d="M115 40 Q120 55 115 65" fill={colors.hair} />
              </>
            )}
          </g>

          {/* 眉毛 */}
          <path
            d={state === 'attacking' ? "M75 45 Q82 42 88 45" : "M75 46 Q82 45 88 46"}
            stroke={silhouette ? auraColor : '#1a1a1a'}
            strokeWidth="2"
            fill="none"
          />
          <path
            d={state === 'attacking' ? "M92 45 Q98 42 105 45" : "M92 46 Q98 45 105 46"}
            stroke={silhouette ? auraColor : '#1a1a1a'}
            strokeWidth="2"
            fill="none"
          />

          {/* 眼睛 */}
          <g filter={silhouette ? 'url(#silhouetteGlow)' : 'none'}>
            <ellipse
              cx="81"
              cy="52"
              rx={state === 'attacking' ? 4 : 3}
              ry={state === 'critical' ? 1 : 3}
              fill={silhouette ? auraColor : colors.eye}
            />
            <ellipse
              cx="99"
              cy="52"
              rx={state === 'attacking' ? 4 : 3}
              ry={state === 'critical' ? 1 : 3}
              fill={silhouette ? auraColor : colors.eye}
            />
            {/* 眼睛高光 */}
            {!silhouette && (
              <>
                <circle cx="80" cy="51" r="1" fill="#fff" />
                <circle cx="98" cy="51" r="1" fill="#fff" />
              </>
            )}
          </g>

          {/* 鼻子 */}
          <path d="M90 55 L88 62 L92 62" stroke={silhouette ? '#2a2a2a' : '#c4a882'} strokeWidth="1" fill="none" />

          {/* 嘴巴 */}
          <path
            d={state === 'attacking' ? "M85 70 Q90 73 95 70" : state === 'critical' ? "M85 70 L95 70" : "M86 70 Q90 72 94 70"}
            stroke={silhouette ? '#2a2a2a' : '#b88a7a'}
            strokeWidth="1.5"
            fill="none"
          />
        </g>

        {/* 武器 */}
        <g style={{ transform: `translateY(${breathOffset * 0.3}px)` }}>
          {weaponPaths[weaponType] || weaponPaths.sword}
        </g>

        {/* 前摆衣袖 - 左侧 */}
        <g style={{ transform: `translateY(${breathOffset}px) rotate(${clothSwing * 0.5}deg)`, transformOrigin: '55px 130px' }}>
          <path
            d="M50 110 Q35 140 40 170 Q45 185 55 175 Q60 150 65 130"
            fill="url(#inkGrad)"
          />
        </g>

        {/* 前摆衣袖 - 右侧 */}
        <g style={{ transform: `translateY(${breathOffset}px) rotate(${-clothSwing * 0.5}deg)`, transformOrigin: '125px 130px' }}>
          <path
            d="M130 110 Q145 140 140 170 Q135 185 125 175 Q120 150 115 130"
            fill="url(#inkGrad)"
          />
        </g>

        {/* 出招态气劲效果 */}
        {state === 'attacking' && (
          <g filter="url(#auraGlow)">
            <circle cx="90" cy="100" r="60" fill="none" stroke={auraColor} strokeWidth="1" opacity="0.3">
              <animate attributeName="r" values="50;70;50" dur="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.1;0.3" dur="1s" repeatCount="indefinite" />
            </circle>
            <circle cx="90" cy="100" r="40" fill="none" stroke={auraColor} strokeWidth="2" opacity="0.5">
              <animate attributeName="r" values="35;50;35" dur="0.8s" repeatCount="indefinite" />
            </circle>
          </g>
        )}

        {/* 受击态红光 */}
        {state === 'hit' && (
          <rect x="0" y="0" width="180" height="270" fill="#ff0000" opacity="0.3">
            <animate attributeName="opacity" values="0.3;0;0.3" dur="0.1s" repeatCount="3" />
          </rect>
        )}

        {/* 重伤态裂纹效果 */}
        {state === 'critical' && (
          <g opacity="0.5">
            <line x1="50" y1="50" x2="80" y2="90" stroke="#333" strokeWidth="1" />
            <line x1="80" y1="90" x2="60" y2="130" stroke="#333" strokeWidth="1" />
            <line x1="100" y1="60" x2="130" y2="100" stroke="#333" strokeWidth="1" />
          </g>
        )}
      </svg>

      {/* 状态文字 */}
      {state !== 'idle' && (
        <div style={{
          position: 'absolute',
          bottom: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '4px 12px',
          background: state === 'attacking' ? auraColor : state === 'hit' ? '#ef4444' : '#666',
          color: '#fff',
          fontSize: '12px',
          borderRadius: '4px',
          fontFamily: '"Ma Shan Zheng", cursive',
        }}>
          {state === 'attacking' ? '出招' : state === 'hit' ? '受击' : '重伤'}
        </div>
      )}
    </div>
  );
};

export default DynamicPortrait;

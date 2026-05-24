import React from 'react';
import { TREASURES_DB } from '../store/gameState';

// ==================== 图标专属动效与隐藏滤镜盘注入 ====================
export const WuxiaIconStyles = () => (
  <>
    <style>{`
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes floatUpDown {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
      @keyframes thunderStrike {
        0%, 100% { opacity: 1; transform: scale(1); }
        25% { opacity: 0.3; transform: scale(0.96) translate(-1px, 2px); }
        50% { opacity: 0.8; transform: scale(1.02) translate(1px, -1px); }
        75% { opacity: 0.2; transform: scale(0.94) translate(2px, 1px); }
      }
      @keyframes ping {
        0% { transform: scale(0.85); opacity: 0.75; }
        100% { transform: scale(1.35); opacity: 0; }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.9; }
        50% { transform: scale(1.04); opacity: 1; }
      }
      @keyframes fireFlicker {
        0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.85; }
        50% { transform: scaleY(1.08) scaleX(0.96); opacity: 1; }
      }
      @keyframes shakeMicro {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        20% { transform: translate(-0.4px, 0.4px) rotate(-0.4deg); }
        40% { transform: translate(0.4px, -0.4px) rotate(0.4deg); }
        60% { transform: translate(-0.4px, -0.4px) rotate(0deg); }
        80% { transform: translate(0.4px, 0.4px) rotate(0.4deg); }
      }
      @keyframes mistDrift {
        0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
        50% { transform: translate(2px, -3px) scale(1.06); opacity: 0.7; }
      }
    `}</style>
    <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
      <defs>
        {/* 隐藏大滤镜与渐变盘 */}
        {/* 1. 深度阴影与浮雕 */}
        <filter id="wuxia-emboss-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1.5" dy="3" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.85" />
        </filter>
        
        {/* 2. 金光发光滤镜 */}
        <filter id="wuxia-gold-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feColorMatrix type="matrix" values="
            1 0 0 0 0.76
            0 1 0 0 0.62
            0 0 1 0 0.22
            0 0 0 1 0" in="blur" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 3. 熔岩红发光滤镜 */}
        <filter id="wuxia-lava-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feColorMatrix type="matrix" values="
            1 0 0 0 0.88
            0 1 0 0 0.12
            0 0 1 0 0.12
            0 0 0 1 0" in="blur" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 4. 碧落青翠发光滤镜 */}
        <filter id="wuxia-jade-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.8" result="blur" />
          <feColorMatrix type="matrix" values="
            0.12 0 0 0 0.12
            0 1 0 0 0.72
            0 0 0.48 0 0.38
            0 0 0 1 0" in="blur" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 5. 紫冥魔光滤镜 */}
        <filter id="wuxia-purple-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.8" result="blur" />
          <feColorMatrix type="matrix" values="
            0.52 0 0 0 0.58
            0 0.22 0 0 0.12
            0 0 1 0 0.88
            0 0 0 1 0" in="blur" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 6. 寒冰蓝光滤镜 */}
        <filter id="wuxia-ice-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.8" result="blur" />
          <feColorMatrix type="matrix" values="
            0.18 0 0 0 0.18
            0 0.58 0 0 0.68
            0 0 1 0 0.95
            0 0 0 1 0" in="blur" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* 渐变色定义 */}
        {/* 1. 卡牌背景：熔岩黑曜石 */}
        <linearGradient id="card-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#120808" />
          <stop offset="50%" stopColor="#080404" />
          <stop offset="100%" stopColor="#180808" />
        </linearGradient>

        {/* 2. 神话流光背景 */}
        <radialGradient id="mythic-glow-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd700" />
          <stop offset="50%" stopColor="#c29d38" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>

        {/* 3. 传说流光背景 */}
        <radialGradient id="legend-glow-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="60%" stopColor="#7e22ce" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>

        {/* 4. 古铜金渐变 */}
        <linearGradient id="gold-metal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="35%" stopColor="#ca8a04" />
          <stop offset="70%" stopColor="#854d0e" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
        
        {/* 5. 羊脂白玉渐变 */}
        <linearGradient id="jade-white-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#f5f5f4" />
          <stop offset="100%" stopColor="#d6d3d1" />
        </linearGradient>

        {/* 6. 翡翠绿玉石渐变 */}
        <linearGradient id="jade-green-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>

        {/* 7. 劫火红渐变 */}
        <linearGradient id="fire-red-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="50%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>

        {/* 8. 玄铁黑渐变 */}
        <linearGradient id="iron-black-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="50%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* 9. 紫冥魔焰渐变 */}
        <linearGradient id="purple-magic-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#4c1d95" />
        </linearGradient>
        
        {/* 10. 陨铁微孔图案 */}
        <pattern id="iron-pores" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="none" />
          <circle cx="2" cy="2" r="0.8" fill="#000000" opacity="0.65" />
          <circle cx="1" cy="3" r="0.5" fill="#ffffff" opacity="0.12" />
        </pattern>
      </defs>
    </svg>
  </>
);

// ==================== 功法底托 (GongfaBase) ====================
const GongfaBase = ({ children, colorTheme }) => {
  return (
    <g>
      {/* 底部黑褐圆盘背景 */}
      <circle cx="50" cy="50" r="46" fill="#0c0606" stroke="#1c0f0f" strokeWidth="2.5" />
      {/* 浮雕古铜圆环 */}
      <circle cx="50" cy="50" r="42" fill="none" stroke="url(#gold-metal-grad)" strokeWidth="3" opacity="0.75" filter="url(#wuxia-emboss-shadow)" />
      {/* 装饰八角框线 */}
      <polygon points="50,11 77.5,22.5 89,50 77.5,77.5 50,89 22.5,77.5 11,50 22.5,22.5" fill="none" stroke="url(#gold-metal-grad)" strokeWidth="0.8" opacity="0.35" />
      {/* 稀有度或流派主题发光晕 */}
      <circle cx="50" cy="50" r="34" fill={colorTheme} opacity="0.08" />
      {children}
    </g>
  );
};

// ==================== 功法流派图标 (GongfaIcon) ====================
export const GongfaIcon = ({ type, size = 32 }) => {
  const getGongfaSvg = () => {
    switch (type) {
      case 'inner': // 内功 - 太极八卦玉衡盘
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <GongfaBase colorTheme="rgba(16, 185, 129, 0.4)">
              {/* 环绕的干坤爻线轨 */}
              <g style={{ transformOrigin: 'center', animation: 'spin 22s linear infinite reverse' }}>
                <circle cx="50" cy="50" r="38" fill="none" stroke="url(#jade-green-grad)" strokeWidth="1" strokeDasharray="4 2 8 2 12 3 8 2" opacity="0.5" />
                <path d="M 50,16 L 50,18 M 74,26 L 72.5,27.5 M 84,50 L 82,50 M 74,74 L 72.5,72.5 M 50,84 L 50,82 M 26,74 L 27.5,72.5 M 16,50 L 18,50 M 26,26 L 27.5,27.5" stroke="url(#gold-metal-grad)" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />
              </g>
              {/* 中心太极浑天仪 */}
              <g style={{ transformOrigin: 'center', animation: 'spin 12s linear infinite' }} filter="url(#wuxia-jade-glow)">
                <circle cx="50" cy="50" r="26" fill="#07110c" stroke="url(#jade-green-grad)" strokeWidth="2" />
                {/* 阴阳鱼 */}
                <path d="M 50,24 A 13 13 0 0 0 50,50 A 13 13 0 0 1 50,76 A 26 26 0 0 0 50,24 Z" fill="url(#jade-green-grad)" />
                {/* 双鱼眼 */}
                <circle cx="50" cy="37" r="4.5" fill="#07110c" />
                <circle cx="50" cy="37" r="1.5" fill="#a7f3d0" />
                <circle cx="50" cy="63" r="4.5" fill="#a7f3d0" />
                <circle cx="50" cy="63" r="1.5" fill="#07110c" />
                {/* 粒子点缀 */}
                <circle cx="42" cy="45" r="1" fill="#fff" opacity="0.8" />
                <circle cx="58" cy="55" r="1" fill="#fff" opacity="0.8" />
              </g>
            </GongfaBase>
          </svg>
        );
      case 'outer': // 外功 - 双刃金错交锋盾
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <GongfaBase colorTheme="rgba(220, 38, 38, 0.4)">
              {/* 饕餮面纹背景圆盘 */}
              <circle cx="50" cy="50" r="32" fill="url(#iron-black-grad)" stroke="#3f1c1c" strokeWidth="1.5" />
              <path d="M 38,40 Q 50,30 62,40 Q 50,45 38,40 M 34,44 Q 50,34 66,44 Q 50,52 34,44 M 42,52 L 40,56 L 44,55 L 46,52 M 58,52 L 60,56 L 56,55 L 54,52" fill="#2d1515" stroke="url(#gold-metal-grad)" strokeWidth="0.8" opacity="0.6" />
              {/* 交叉重剑 */}
              <g style={{ transformOrigin: 'center', animation: 'pulse 2.2s infinite ease-in-out' }} filter="url(#wuxia-lava-glow)">
                {/* 左斜剑 */}
                <g style={{ transform: 'rotate(-45deg)', transformOrigin: 'center' }}>
                  <path d="M 42,65 Q 50,60 58,65 L 50,72 Z" fill="url(#gold-metal-grad)" />
                  <rect x="48" y="72" width="4" height="15" fill="#2c0a0a" stroke="url(#gold-metal-grad)" strokeWidth="0.5" />
                  <circle cx="50" cy="87" r="2" fill="url(#gold-metal-grad)" />
                  <path d="M 45,20 L 55,20 L 53,60 L 47,60 Z" fill="url(#fire-red-grad)" stroke="#1e0505" strokeWidth="1" />
                  <line x1="50" y1="20" x2="50" y2="60" stroke="#f87171" strokeWidth="0.8" />
                  <path d="M 45,35 L 48,37 L 45,39 M 55,45 L 52,47 L 55,49" stroke="#1e0505" strokeWidth="0.8" />
                </g>
                {/* 右斜剑 */}
                <g style={{ transform: 'rotate(45deg)', transformOrigin: 'center' }}>
                  <path d="M 42,65 Q 50,60 58,65 L 50,72 Z" fill="url(#gold-metal-grad)" />
                  <rect x="48" y="72" width="4" height="15" fill="#2c0a0a" stroke="url(#gold-metal-grad)" strokeWidth="0.5" />
                  <circle cx="50" cy="87" r="2" fill="url(#gold-metal-grad)" />
                  <path d="M 45,20 L 55,20 L 53,60 L 47,60 Z" fill="url(#fire-red-grad)" stroke="#1e0505" strokeWidth="1" />
                  <line x1="50" y1="20" x2="50" y2="60" stroke="#f87171" strokeWidth="0.8" />
                  <path d="M 45,45 L 48,47 L 45,49 M 55,35 L 52,37 L 55,39" stroke="#1e0505" strokeWidth="0.8" />
                </g>
              </g>
              <circle cx="50" cy="50" r="5" fill="#b91c1c" stroke="#fef08a" strokeWidth="1" />
            </GongfaBase>
          </svg>
        );
      case 'motion': // 轻功 - 踏雪流云双飞羽
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <GongfaBase colorTheme="rgba(156, 163, 175, 0.3)">
              {/* 风洞气旋 */}
              <g style={{ transformOrigin: 'center', animation: 'spin 14s linear infinite reverse' }} opacity="0.6">
                <path d="M 22,50 Q 30,30 50,30 T 78,50 T 50,70 Z" fill="none" stroke="#e2e8f0" strokeWidth="1.2" strokeDasharray="6 12 18 6" />
                <path d="M 30,50 Q 40,36 50,36 T 70,50 T 50,64 Z" fill="none" stroke="url(#gold-metal-grad)" strokeWidth="0.6" opacity="0.5" />
              </g>
              {/* 青鸾飞羽核心 */}
              <g style={{ transformOrigin: 'center', animation: 'floatUpDown 2.8s infinite ease-in-out' }}>
                {/* 左羽 */}
                <g style={{ transform: 'translate(4px, 4px) rotate(-15deg)', transformOrigin: '50% 50%' }}>
                  <path d="M 45,30 C 35,30 20,45 38,60 C 46,50 48,40 45,30 Z" fill="#334155" opacity="0.4" />
                  <path d="M 43,33 C 33,35 22,48 38,58 C 44,50 46,42 43,33 Z" fill="url(#iron-black-grad)" />
                  <path d="M 41,35 C 33,38 25,50 38,56 C 42,49 44,43 41,35 Z" fill="url(#jade-white-grad)" opacity="0.95" />
                  <path d="M 38,56 Q 32,45 41,35" fill="none" stroke="#ca8a04" strokeWidth="1" strokeLinecap="round" />
                </g>
                {/* 右羽 */}
                <g style={{ transform: 'translate(-4px, 4px) rotate(15deg) scaleX(-1)', transformOrigin: '50% 50%' }}>
                  <path d="M 45,30 C 35,30 20,45 38,60 C 46,50 48,40 45,30 Z" fill="#334155" opacity="0.4" />
                  <path d="M 43,33 C 33,35 22,48 38,58 C 44,50 46,42 43,33 Z" fill="url(#iron-black-grad)" />
                  <path d="M 41,35 C 33,38 25,50 38,56 C 42,49 44,43 41,35 Z" fill="url(#jade-white-grad)" opacity="0.95" />
                  <path d="M 38,56 Q 32,45 41,35" fill="none" stroke="#ca8a04" strokeWidth="1" strokeLinecap="round" />
                </g>
                <circle cx="50" cy="46" r="4.5" fill="#f5f5f4" stroke="url(#gold-metal-grad)" strokeWidth="1" filter="url(#wuxia-emboss-shadow)" />
                <path d="M 48,46 C 48,42 52,42 52,46 C 52,50 48,50 48,46 Z" fill="none" stroke="#b91c1c" strokeWidth="0.8" />
              </g>
            </GongfaBase>
          </svg>
        );
      case 'ultimate': // 绝学 - 九天降魔金雷引
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <GongfaBase colorTheme="rgba(249, 115, 22, 0.4)">
              {/* 雷符万象法阵盘 */}
              <g style={{ transformOrigin: 'center', animation: 'spin 30s linear infinite' }} opacity="0.8">
                <rect x="25" y="25" width="50" height="50" rx="4" fill="none" stroke="url(#gold-metal-grad)" strokeWidth="1.2" strokeDasharray="10 6 20 6" />
                <polygon points="50,18 82,50 50,82 18,50" fill="none" stroke="#ea580c" strokeWidth="0.8" opacity="0.6" />
                <path d="M 45,21 H 55 M 21,45 V 55 M 45,79 H 55 M 79,45 V 55" stroke="url(#gold-metal-grad)" strokeWidth="1" />
              </g>
              {/* 狂暴撕裂闪电 */}
              <g style={{ transformOrigin: 'center', animation: 'shakeMicro 0.4s infinite, thunderStrike 1.3s infinite steps(2)' }} filter="url(#wuxia-gold-glow)">
                <path d="M 50,15 L 64,44 L 41,44 L 60,85 L 36,49 L 55,49 Z" fill="url(#gold-metal-grad)" stroke="#78350f" strokeWidth="1" />
                <path d="M 50,17 L 62,43 L 43,43 L 59,81" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 42,44 L 32,58 M 58,44 L 68,30 M 52,60 L 62,70" stroke="#fef08a" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
                <circle cx="60" cy="83" r="3.5" fill="#ffffff" />
              </g>
            </GongfaBase>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ width: size, height: size, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {getGongfaSvg()}
    </div>
  );
};

// ==================== 宝具写实卡牌底盘 (CardBase) ====================
const CardBase = ({ rarity }) => {
  const glowColor = rarity === '神话' ? 'url(#mythic-glow-grad)' : (rarity === '传说' ? 'url(#legend-glow-grad)' : 'rgba(255,255,255,0.05)');
  const borderColor = rarity === '神话' ? '#c29d38' : (rarity === '传说' ? '#8b5cf6' : '#4b5563');
  
  return (
    <g>
      {/* 底部深邃熔岩黑曜石背景 */}
      <rect x="2" y="2" width="96" height="96" rx="14" fill="url(#card-bg-grad)" stroke="#1a0f0f" strokeWidth="2.2" />
      {/* 熔岩裂纹底纹 */}
      <path d="M 10,80 Q 25,60 40,85 T 75,70 T 90,90" fill="none" stroke="#b91c1c" strokeWidth="1" opacity="0.25" />
      <path d="M 20,20 Q 40,35 60,15 T 85,30" fill="none" stroke="#b91c1c" strokeWidth="0.8" opacity="0.2" />
      {/* 稀有度专属流光 */}
      <rect x="6" y="6" width="88" height="88" rx="10" fill={glowColor} opacity="0.12" />
      {/* 回角框饰 */}
      <rect x="6" y="6" width="88" height="88" rx="10" fill="none" stroke={borderColor} strokeWidth="1" strokeDasharray="30 14 30 14" opacity="0.6" />
      <path d="M 6,18 L 18,6 M 82,6 L 94,18 M 94,82 L 82,94 M 18,94 L 6,82" stroke={borderColor} strokeWidth="1" opacity="0.55" />
    </g>
  );
};

// ==================== 本命宝具精细图标 (TreasureIcon) ====================
export const TreasureIcon = ({ id, size = 64 }) => {
  const getTreasureInfo = () => {
    return TREASURES_DB?.find(tr => tr.id === id) || { rarity: '普通' };
  };
  
  const { rarity } = getTreasureInfo();

  const renderIconSvg = () => {
    switch (id) {
      case 't1': // 木质佛珠 - ningShen
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <CardBase rarity={rarity} />
            <g style={{ transformOrigin: 'center', animation: 'spin 40s linear infinite' }} opacity="0.3">
              <circle cx="50" cy="50" r="32" fill="none" stroke="url(#gold-metal-grad)" strokeWidth="1" strokeDasharray="3 6" />
              <path d="M 50,22 L 50,78 M 22,50 L 78,50" stroke="url(#gold-metal-grad)" strokeWidth="0.5" />
            </g>
            <circle cx="50" cy="50" r="16" fill="none" stroke="url(#gold-metal-grad)" strokeWidth="1" opacity="0.5" />
            <path d="M44 44 H56 V50 H50 V56 H44 V50 H44 Z M50 44 V38 H56 M50 56 V62 H44 M44 44 V38 H38 M56 56 V62 H62" 
                  fill="none" stroke="url(#gold-metal-grad)" strokeWidth="2.2" filter="url(#wuxia-gold-glow)" 
                  style={{ transformOrigin: 'center', animation: 'pulse 3s infinite' }} />
            <g style={{ transformOrigin: 'center', animation: 'spin 60s linear infinite' }}>
              {[...Array(12)].map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const cx = 50 + Math.cos(angle) * 26;
                const cy = 50 + Math.sin(angle) * 26;
                return (
                  <g key={i} filter="url(#wuxia-emboss-shadow)">
                    <circle cx={cx} cy={cy} r="5" fill="url(#gold-metal-grad)" />
                    <circle cx={cx - 1.5} cy={cy - 1.5} r="1.5" fill="#fff" opacity="0.35" />
                  </g>
                );
              })}
            </g>
          </svg>
        );
      case 't2': // 粗布披风 - qingQiao
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <CardBase rarity={rarity} />
            <g opacity="0.4">
              <path d="M 12,30 Q 30,15 55,25 T 88,18" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5 5" />
              <path d="M 10,75 Q 35,68 65,75 T 90,65" fill="none" stroke="#e2e8f0" strokeWidth="0.8" opacity="0.5" />
              <circle cx="25" cy="45" r="1" fill="url(#gold-metal-grad)" />
              <circle cx="75" cy="55" r="0.8" fill="url(#gold-metal-grad)" />
            </g>
            <g style={{ transformOrigin: 'center', animation: 'floatUpDown 3s infinite ease-in-out' }} filter="url(#wuxia-emboss-shadow)">
              <path d="M50 20 C68 20 78 35 74 78 C60 70 50 72 26 78 C22 35 32 20 50 20 Z" fill="#1e293b" opacity="0.5" />
              <path d="M50 22 C66 22 75 35 71 74 L 66,70 L 61,73 L 56,69 L 50,72 L 44,69 L 39,73 L 34,70 L 29,74 C25 35 34 22 50 22 Z" 
                    fill="url(#iron-black-grad)" stroke="#94a3b8" strokeWidth="1.2" />
              <circle cx="50" cy="28" r="3.5" fill="url(#gold-metal-grad)" filter="url(#wuxia-gold-glow)" />
              <path d="M 44,28 Q 50,38 56,28" fill="none" stroke="url(#gold-metal-grad)" strokeWidth="1.5" />
              <path d="M 46,32 Q 38,55 35,70 M 54,32 Q 62,55 65,70 M 50,34 V 68" fill="none" stroke="#334155" strokeWidth="1" opacity="0.6" />
            </g>
          </svg>
        );
      case 't3': // 生锈铁剑 - poShang
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <CardBase rarity={rarity} />
            <g filter="url(#wuxia-emboss-shadow)">
              <path d="M 15,82 L 32,70 L 50,75 L 70,68 L 85,82 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
              <path d="M 30,73 L 38,65 L 48,74 Z" fill="#334155" stroke="#0f172a" strokeWidth="1" />
              <path d="M 52,74 L 62,64 L 72,70 Z" fill="#0f172a" opacity="0.6" />
              <path d="M 28,78 Q 38,72 45,77 M 55,73 Q 65,70 72,75" fill="none" stroke="#ef4444" strokeWidth="0.8" opacity="0.7" />
            </g>
            <g style={{ transform: 'rotate(-28deg) translate(-14px, 12px)', transformOrigin: '40% 70%' }} filter="url(#wuxia-emboss-shadow)">
              <path d="M 46,18 L 54,18 L 56,65 L 44,65 Z" fill="url(#iron-black-grad)" stroke="#334155" strokeWidth="1.2" />
              <path d="M 46,30 L 49,32 L 46,34 M 54,42 L 51,45 L 54,48 M 46,54 L 49,56 L 46,58" fill="none" stroke="#78350f" strokeWidth="1.2" />
              <path d="M 47,20 L 53,20 L 50,65" fill="none" stroke="#b45309" strokeWidth="1" opacity="0.7" />
              <rect x="36" y="65" width="28" height="6" rx="1.5" fill="#78350f" stroke="#451a03" strokeWidth="1" />
              <rect x="47" y="71" width="6" height="15" fill="#451a03" />
              <line x1="47" y1="74" x2="53" y2="76" stroke="#b45309" strokeWidth="1" />
              <line x1="47" y1="79" x2="53" y2="81" stroke="#b45309" strokeWidth="1" />
              <circle cx="50" cy="88" r="4.5" fill="#78350f" stroke="#451a03" strokeWidth="1" />
            </g>
          </svg>
        );
      case 't4': // 白玉短笛 - huiChun
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <CardBase rarity={rarity} />
            <g style={{ transformOrigin: 'center', animation: 'ping 2.5s infinite' }} opacity="0.6" filter="url(#wuxia-jade-glow)">
              <circle cx="50" cy="50" r="28" fill="none" stroke="url(#jade-green-grad)" strokeWidth="1.2" />
              <circle cx="50" cy="50" r="38" fill="none" stroke="url(#jade-green-grad)" strokeWidth="0.8" strokeDasharray="8 6" />
            </g>
            <g style={{ transform: 'rotate(42deg) translate(0px, -6px)', transformOrigin: 'center', animation: 'floatUpDown 3.2s infinite ease-in-out' }} filter="url(#wuxia-emboss-shadow)">
              <rect x="18" y="45" width="64" height="10" rx="3" fill="url(#jade-white-grad)" stroke="#047857" strokeWidth="1.5" />
              <rect x="18" y="45" width="8" height="10" fill="url(#jade-green-grad)" opacity="0.4" />
              <rect x="74" y="45" width="8" height="10" fill="url(#jade-green-grad)" opacity="0.4" />
              {[...Array(6)].map((_, i) => (
                <circle key={i} cx={34 + i * 7} cy="50" r="1.8" fill="#064e3b" />
              ))}
              <g style={{ transformOrigin: '76px 50px' }}>
                <path d="M 76,50 Q 82,53 84,62 M 76,50 Q 80,48 84,54" fill="none" stroke="#dc2626" strokeWidth="1.2" />
                <circle cx="84" cy="62" r="2.5" fill="#dc2626" />
                <path d="M 81.5,62 Q 84,59 86.5,62 T 84,65 Z" fill="#fef08a" stroke="#dc2626" strokeWidth="0.8" />
                <path d="M 84,65 L 82,85 M 84,65 L 84,87 M 84,65 L 86,84" stroke="#dc2626" strokeWidth="1" strokeLinecap="round" opacity="0.9" />
              </g>
            </g>
          </svg>
        );
      case 't5': // 判官双笔 - dianXue
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <CardBase rarity={rarity} />
            <path d="M 25,45 C 18,30 35,22 50,30 C 65,18 78,35 70,55 C 80,70 60,82 45,72 C 30,82 18,65 25,45 Z" 
                  fill="#000000" opacity="0.4" filter="url(#wuxia-emboss-shadow)" />
            <path d="M 32,50 Q 50,35 68,50 T 50,65 Z" fill="none" stroke="url(#gold-metal-grad)" strokeWidth="0.8" opacity="0.2" />
            <g style={{ transformOrigin: 'center', animation: 'pulse 3.5s infinite ease-in-out' }}>
              <g style={{ transform: 'rotate(-24deg)', transformOrigin: '50% 50%' }} filter="url(#wuxia-emboss-shadow)">
                <rect x="47" y="16" width="6" height="52" rx="1.5" fill="url(#iron-black-grad)" stroke="url(#gold-metal-grad)" strokeWidth="0.8" />
                <rect x="47" y="62" width="6" height="5" fill="url(#gold-metal-grad)" />
                <path d="M 47,67 C 46,74 50,85 50,85 C 50,85 54,74 53,67 Z" fill="url(#jade-white-grad)" stroke="#475569" strokeWidth="0.8" />
                <path d="M 48.5,75 C 48,79 50,85 50,85 C 50,85 52,79 51.5,75 Z" fill="#000000" />
              </g>
              <g style={{ transform: 'rotate(24deg)', transformOrigin: '50% 50%' }} filter="url(#wuxia-emboss-shadow)">
                <rect x="47" y="16" width="6" height="52" rx="1.5" fill="url(#iron-black-grad)" stroke="url(#gold-metal-grad)" strokeWidth="0.8" />
                <rect x="47" y="62" width="6" height="5" fill="url(#gold-metal-grad)" />
                <path d="M 47,67 C 46,74 50,85 50,85 C 50,85 54,74 53,67 Z" fill="url(#jade-white-grad)" stroke="#475569" strokeWidth="0.8" />
                <path d="M 48.5,75 C 48,79 50,85 50,85 C 50,85 52,79 51.5,75 Z" fill="#000000" />
              </g>
            </g>
          </svg>
        );
      case 't6': // 冰魄银针 - juDu
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <CardBase rarity={rarity} />
            <g style={{ transformOrigin: 'center', animation: 'spin 18s linear infinite reverse' }} opacity="0.3">
              <circle cx="50" cy="50" r="35" fill="none" stroke="#93c5fd" strokeWidth="1" strokeDasharray="8 12 4 8" />
              <path d="M 20,20 L 80,80 M 80,20 L 20,80" stroke="#60a5fa" strokeWidth="0.5" />
            </g>
            <g opacity="0.6">
              <path d="M 25,32 L 29,32 M 27,30 V 34 M 25,30 L 29,34 M 25,34 L 29,30" stroke="#ffffff" strokeWidth="0.8" />
              <path d="M 72,68 L 76,68 M 74,66 V 70 M 72,66 L 76,70 M 72,70 L 76,66" stroke="#93c5fd" strokeWidth="0.8" />
              <path d="M 78,35 L 80,35 M 79,34 V 36" stroke="#ffffff" strokeWidth="0.8" />
            </g>
            <g style={{ transformOrigin: 'center', animation: 'floatUpDown 2.5s infinite ease-in-out' }} filter="url(#wuxia-ice-glow)">
              <g style={{ transform: 'rotate(-18deg)', transformOrigin: '50% 80%' }}>
                <line x1="50" y1="12" x2="50" y2="78" stroke="url(#jade-white-grad)" strokeWidth="2" strokeLinecap="round" />
                <circle cx="50" cy="12" r="2.5" fill="#60a5fa" />
              </g>
              <g style={{ transform: 'rotate(0deg)', transformOrigin: '50% 80%' }}>
                <line x1="50" y1="8" x2="50" y2="78" stroke="url(#jade-white-grad)" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="50" cy="8" r="3" fill="#ffffff" />
              </g>
              <g style={{ transform: 'rotate(18deg)', transformOrigin: '50% 80%' }}>
                <line x1="50" y1="12" x2="50" y2="78" stroke="url(#jade-white-grad)" strokeWidth="2" strokeLinecap="round" />
                <circle cx="50" cy="12" r="2.5" fill="#60a5fa" />
              </g>
            </g>
          </svg>
        );
      case 't7': // 打狗棒 - daGou
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <CardBase rarity={rarity} />
            <circle cx="50" cy="50" r="32" fill="none" stroke="#059669" strokeWidth="1" strokeDasharray="4 8" opacity="0.3" />
            <g style={{ transform: 'rotate(28deg)', transformOrigin: 'center' }}>
              <rect x="47" y="10" width="6" height="80" rx="1.5" fill="url(#jade-green-grad)" stroke="#064e3b" strokeWidth="1" />
              <line x1="47" y1="26" x2="53" y2="26" stroke="url(#gold-metal-grad)" strokeWidth="1.5" />
              <line x1="47" y1="42" x2="53" y2="42" stroke="url(#gold-metal-grad)" strokeWidth="1.5" />
              <line x1="47" y1="58" x2="53" y2="58" stroke="url(#gold-metal-grad)" strokeWidth="1.5" />
              <line x1="47" y1="74" x2="53" y2="74" stroke="url(#gold-metal-grad)" strokeWidth="1.5" />
              <g style={{ transformOrigin: '50px 42px' }}>
                <path d="M 47,42 C 43,44 43,48 49,50" fill="none" stroke="#dc2626" strokeWidth="1.2" />
                <path d="M 52,42 C 58,46 64,44 62,54" fill="none" stroke="#dc2626" strokeWidth="1" />
                <g style={{ transform: 'translate(57px, 52px)', transformOrigin: 'center' }} filter="url(#wuxia-emboss-shadow)">
                  <path d="M 5,2 C 4,1 2,1 1,2 C 0,3 0,5 2,6 C 0,8 0,11 2,13 C 4,15 7,15 9,13 C 11,11 11,8 9,6 C 11,5 11,3 9,2 Z" 
                        fill="url(#gold-metal-grad)" stroke="#78350f" strokeWidth="0.8" />
                  <rect x="2.5" y="5.5" width="6" height="1.2" fill="#dc2626" />
                  <circle cx="5" cy="10" r="2" fill="#0c0707" />
                  <circle cx="5" cy="10" r="1.8" fill="none" stroke="url(#gold-metal-grad)" strokeWidth="0.4" />
                </g>
              </g>
            </g>
          </svg>
        );
      case 't8': // 金蛇剑 - jinShe
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <CardBase rarity={rarity} />
            <path d="M 28,78 Q 20,40 50,34 T 78,22" fill="none" stroke="#b91c1c" strokeWidth="1.2" strokeDasharray="3 9" opacity="0.3" />
            <g style={{ transform: 'rotate(-40deg) translate(-26px, 18px)', transformOrigin: 'center' }} filter="url(#wuxia-gold-glow)">
              <path d="M50 8 L54 13 Q47 22 54 30 Q46 38 54 46 Q46 54 54 62 L50 68 L46 62 Q54 54 46 46 Q54 38 46 30 Q54 22 46 13 Z" 
                    fill="url(#gold-metal-grad)" stroke="#78350f" strokeWidth="1.2" />
              <path d="M 50,8 Q 50,15 48,22 T 52,38 T 48,54 T 50,68" fill="none" stroke="#fef08a" strokeWidth="0.8" opacity="0.8" />
              <path d="M36 68 C40 64 60 64 64 68 L50 75 Z" fill="#854d0e" stroke="#451a03" strokeWidth="1.2" />
              <circle cx="47.5" cy="12" r="1" fill="#dc2626" />
              <circle cx="52.5" cy="12" r="1" fill="#dc2626" />
              <path d="M 50,8 Q 48,4 47,1 M 50,8 Q 52,4 53,1" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
              <rect x="47" y="75" width="6" height="15" fill="#451a03" stroke="#78350f" strokeWidth="0.8" />
              <line x1="47" y1="78" x2="53" y2="80" stroke="#78350f" strokeWidth="1.2" />
              <line x1="47" y1="83" x2="53" y2="85" stroke="#78350f" strokeWidth="1.2" />
              <circle cx="50" cy="92" r="3.5" fill="url(#gold-metal-grad)" stroke="#451a03" strokeWidth="1" />
            </g>
          </svg>
        );
      case 't9': // 软猬甲 - ruanWei
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <CardBase rarity={rarity} />
            <g style={{ transformOrigin: 'center', animation: 'spin 45s linear infinite' }} opacity="0.5">
              {[...Array(12)].map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const x1 = 50 + Math.cos(angle) * 30;
                const y1 = 50 + Math.sin(angle) * 30;
                const x2 = 50 + Math.cos(angle) * 38;
                const y2 = 50 + Math.sin(angle) * 38;
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#b91c1c" strokeWidth="1.5" strokeLinecap="round" />;
              })}
            </g>
            <g style={{ transformOrigin: 'center', animation: 'pulse 3s infinite' }} filter="url(#wuxia-emboss-shadow)">
              <path d="M50 20 C64 20 74 28 74 50 C74 72 64 80 50 80 C36 80 26 72 26 50 C26 28 36 20 50 20 Z" 
                    fill="url(#iron-black-grad)" stroke="#cbd5e1" strokeWidth="1.8" />
              <path d="M50 23 C61 23 71 30 71 50 C71 70 61 77 50 77 C39 77 29 70 29 50 C29 30 39 23 50 23 Z" 
                    fill="none" stroke="#78350f" strokeWidth="1.2" opacity="0.75" />
              <path d="M 45,30 L 47,26 L 49,30 M 51,30 L 53,26 L 55,30 M 37,42 L 39,38 L 41,42 M 59,42 L 61,38 L 63,42 M 45,45 L 47,41 L 49,45 M 51,45 L 53,41 L 55,45 M 34,56 L 36,52 L 38,56 M 62,56 L 64,52 L 66,56 M 42,58 L 44,54 L 46,58 M 54,58 L 56,54 L 58,58 M 47,68 L 49,64 L 51,68" 
                    fill="#cbd5e1" stroke="#475569" strokeWidth="0.6" />
              <circle cx="50" cy="50" r="10" fill="#0f172a" stroke="url(#gold-metal-grad)" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="7.5" fill="none" stroke="#dc2626" strokeWidth="0.8" />
              <path d="M 50,42.5 A 3.75 3.75 0 0 0 50,50 A 3.75 3.75 0 0 1 50,57.5 A 7.5 7.5 0 0 0 50,42.5 Z" fill="url(#gold-metal-grad)" />
            </g>
          </svg>
        );
      case 't10': // 倚天剑 - yiTian
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <CardBase rarity={rarity} />
            <g style={{ transformOrigin: 'center', animation: 'spin 20s linear infinite' }} opacity="0.4" filter="url(#wuxia-gold-glow)">
              <circle cx="50" cy="50" r="34" fill="none" stroke="url(#gold-metal-grad)" strokeWidth="1" strokeDasharray="12 6 4 6" />
              <polygon points="50,14 86,50 50,86 14,50" fill="none" stroke="url(#gold-metal-grad)" strokeWidth="0.6" />
            </g>
            <g style={{ transform: 'rotate(-45deg) translate(-26px, 18px)', transformOrigin: 'center' }} filter="url(#wuxia-gold-glow)">
              <path d="M 47,4 L 53,4 L 55,62 L 45,62 Z" fill="url(#jade-white-grad)" stroke="#b45309" strokeWidth="1.2" />
              <line x1="50" y1="4" x2="50" y2="62" stroke="url(#gold-metal-grad)" strokeWidth="1.8" />
              <path d="M 47,30 Q 50,33 53,30 M 47,42 Q 50,45 53,42 M 47,54 Q 50,57 53,54" fill="none" stroke="url(#gold-metal-grad)" strokeWidth="0.8" opacity="0.8" />
              <path d="M 33,62 Q 50,56 67,62 L 60,67 L 40,67 Z" fill="url(#gold-metal-grad)" stroke="#78350f" strokeWidth="1" />
              <path d="M 36,62 Q 44,61 48,64 M 64,62 Q 56,61 52,64" stroke="#78350f" strokeWidth="0.8" />
              <circle cx="50" cy="63.5" r="2.8" fill="#ef4444" stroke="#ffffff" strokeWidth="0.6" />
              <rect x="47" y="67" width="6" height="20" rx="1" fill="#451a03" stroke="url(#gold-metal-grad)" strokeWidth="0.8" />
              <circle cx="50" cy="87" r="2" fill="#ef4444" />
              <g style={{ transformOrigin: '50px 87px' }}>
                <path d="M 50,87 C 48,91 46,95 48,98 M 50,87 C 52,91 54,95 52,98" fill="none" stroke="url(#gold-metal-grad)" strokeWidth="1.2" strokeLinecap="round" />
              </g>
            </g>
          </svg>
        );
      case 't11': // 屠龙刀 - tuLong
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <CardBase rarity={rarity} />
            <g style={{ transformOrigin: 'center', animation: 'pulse 1.4s infinite' }} opacity="0.4" filter="url(#wuxia-lava-glow)">
              <path d="M 28,30 Q 72,12 80,48" fill="none" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 32,25 Q 70,8 82,40" fill="none" stroke="url(#gold-metal-grad)" strokeWidth="1" />
            </g>
            <g style={{ transform: 'rotate(-30deg) translate(-10px, 12px)', transformOrigin: 'center' }} filter="url(#wuxia-lava-glow)">
              <path d="M 40,12 C 48,8 60,18 60,65 L 43,65 Z" fill="url(#iron-black-grad)" stroke="#0f172a" strokeWidth="2.2" />
              <path d="M 40,12 L 44,25 Q 52,18 60,32 L 60,65" fill="none" stroke="url(#gold-metal-grad)" strokeWidth="1" opacity="0.75" />
              <path d="M 46,24 Q 52,38 46,52 T 48,63" fill="none" stroke="url(#gold-metal-grad)" strokeWidth="1.8" strokeLinecap="round" />
              {[...Array(5)].map((_, i) => (
                <circle key={i} cx="60.5" cy="20 + i * 9" r="2.5" fill="none" stroke="url(#gold-metal-grad)" strokeWidth="1.2" opacity="0.9" />
              ))}
              <path d="M 34,65 Q 50,60 66,65 L 61,72 L 39,72 Z" fill="url(#gold-metal-grad)" stroke="#451a03" strokeWidth="1.5" />
              <circle cx="50" cy="68" r="1.8" fill="#dc2626" />
              <rect x="46" y="72" width="8" height="18" fill="#0f172a" stroke="url(#gold-metal-grad)" strokeWidth="1" />
              <circle cx="50" cy="94" r="5" fill="none" stroke="url(#gold-metal-grad)" strokeWidth="2.5" />
            </g>
          </svg>
        );
      case 't12': // 玄铁重剑 - xuanTie
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <CardBase rarity={rarity} />
            <g style={{ transformOrigin: 'center', animation: 'spin 10s linear infinite' }} opacity="0.3">
              <circle cx="50" cy="50" r="33" fill="none" stroke="#475569" strokeWidth="3" strokeDasharray="18 18" />
              <circle cx="50" cy="50" r="38" fill="none" stroke="#1e293b" strokeWidth="1.5" />
            </g>
            <g style={{ transform: 'rotate(-45deg) translate(-26px, 18px)', transformOrigin: 'center' }} filter="url(#wuxia-emboss-shadow)">
              <path d="M 44,14 L 56,14 L 58,64 L 42,64 Z" fill="url(#iron-black-grad)" stroke="#475569" strokeWidth="2.8" strokeLinejoin="round" />
              <path d="M 44,14 L 56,14 L 58,64 L 42,64 Z" fill="url(#iron-pores)" opacity="0.8" />
              <line x1="50" y1="14" x2="50" y2="64" stroke="#475569" strokeWidth="3" />
              <line x1="50" y1="14" x2="50" y2="64" stroke="#0f172a" strokeWidth="1" />
              <rect x="34" y="64" width="32" height="9" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="2" />
              <rect x="46" y="73" width="8" height="18" fill="#475569" stroke="#0f172a" strokeWidth="1.2" />
              <path d="M 46,75 L 54,78 M 46,80 L 54,83 M 46,85 L 54,88" stroke="#0f172a" strokeWidth="1.5" />
              <rect x="42" y="91" width="16" height="5" rx="1" fill="#0f172a" stroke="#475569" strokeWidth="1.2" />
            </g>
          </svg>
        );
      case 't13': // 圣火令 - shengHuo
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <CardBase rarity={rarity} />
            <g style={{ transformOrigin: 'center', animation: 'fireFlicker 1.8s infinite ease-in-out' }} opacity="0.6" filter="url(#wuxia-lava-glow)">
              <path d="M 50,8 Q 72,40 50,75 Q 28,40 50,8 Z" fill="url(#fire-red-grad)" />
              <path d="M 50,22 Q 64,45 50,70 Q 36,45 50,22 Z" fill="#ea580c" />
              <path d="M 50,38 Q 58,52 50,68 Q 42,52 50,38 Z" fill="#fef08a" />
            </g>
            <g style={{ transformOrigin: 'center', animation: 'floatUpDown 2.8s infinite ease-in-out' }} filter="url(#wuxia-emboss-shadow)">
              <path d="M 38,18 L 62,18 L 66,76 L 34,76 Z" fill="url(#iron-black-grad)" stroke="url(#gold-metal-grad)" strokeWidth="2" />
              <path d="M 38,18 Q 44,28 36,38 Q 44,48 35,58 Q 44,68 34,76" fill="none" stroke="url(#gold-metal-grad)" strokeWidth="1" opacity="0.7" />
              <path d="M 62,18 Q 56,28 64,38 Q 56,48 65,58 Q 56,68 66,76" fill="none" stroke="url(#gold-metal-grad)" strokeWidth="1" opacity="0.7" />
              <path d="M 44,28 H 56 M 42,38 H 58 M 45,48 H 55 M 41,58 H 59 M 43,68 H 57" stroke="url(#gold-metal-grad)" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="50" cy="23" r="3" fill="#dc2626" stroke="#ffffff" strokeWidth="0.5" />
            </g>
          </svg>
        );
      case 't14': // 绝世好剑 - jiMie
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <CardBase rarity={rarity} />
            <g style={{ transformOrigin: 'center', animation: 'spin 16s linear infinite reverse' }} opacity="0.5" filter="url(#wuxia-purple-glow)">
              <circle cx="50" cy="50" r="35" fill="none" stroke="url(#purple-magic-grad)" strokeWidth="1.5" strokeDasharray="4 8" />
              <path d="M 25,25 Q 40,15 50,30 T 75,25" fill="none" stroke="#c084fc" strokeWidth="1" opacity="0.5" style={{ animation: 'mistDrift 2.5s infinite ease-in-out' }} />
              <path d="M 25,75 Q 40,65 50,80 T 75,75" fill="none" stroke="#c084fc" strokeWidth="1" opacity="0.5" style={{ animation: 'mistDrift 3s infinite ease-in-out' }} />
            </g>
            <g style={{ transform: 'rotate(-45deg) translate(-26px, 18px)', transformOrigin: 'center' }} filter="url(#wuxia-purple-glow)">
              <path d="M 47,8 L 53,8 L 55,62 L 45,62 Z" fill="#090514" stroke="url(#purple-magic-grad)" strokeWidth="1.5" />
              <path d="M 45,16 L 43,19 L 45,22 M 45,28 L 43,31 L 45,34 M 45,40 L 43,43 L 45,46 M 45,52 L 43,55 L 45,58" 
                    fill="none" stroke="url(#purple-magic-grad)" strokeWidth="1.2" />
              <polygon points="50,16 52,22 57,22 53,26 55,32 50,28 45,32 47,26 43,22 48,22" fill="#000000" stroke="url(#purple-magic-grad)" strokeWidth="0.8" />
              <line x1="50" y1="34" x2="50" y2="62" stroke="#8b5cf6" strokeWidth="1" />
              <path d="M 35,62 C 38,58 62,58 65,62 L 50,70 Z" fill="#1e1b4b" stroke="url(#purple-magic-grad)" strokeWidth="1.2" />
              <circle cx="50" cy="64" r="2" fill="#c084fc" />
              <rect x="47" y="70" width="6" height="18" fill="#020005" stroke="url(#purple-magic-grad)" strokeWidth="0.8" />
              <circle cx="50" cy="91" r="3.5" fill="#8b5cf6" stroke="url(#purple-magic-grad)" strokeWidth="1" />
            </g>
          </svg>
        );
      case 't15': // 达摩舍利 - niePan
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <CardBase rarity={rarity} />
            <g style={{ transformOrigin: 'center', animation: 'spin 50s linear infinite' }} opacity="0.5" filter="url(#wuxia-gold-glow)">
              {[...Array(12)].map((_, i) => {
                const angle = i * 30;
                return (
                  <line
                    key={i}
                    x1="50"
                    y1="50"
                    x2={50 + Math.cos((angle * Math.PI) / 180) * 44}
                    y2={50 + Math.sin((angle * Math.PI) / 180) * 44}
                    stroke="url(#gold-metal-grad)"
                    strokeWidth="1.2"
                    strokeDasharray="4 8 16 4"
                  />
                );
              })}
            </g>
            <g style={{ transformOrigin: 'center', animation: 'spin 15s linear infinite' }} opacity="0.6">
              <ellipse cx="50" cy="50" rx="30" ry="10" fill="none" stroke="url(#gold-metal-grad)" strokeWidth="1" strokeDasharray="3 5 8 3" style={{ transform: 'rotate(30deg)' }} />
              <ellipse cx="50" cy="50" rx="30" ry="10" fill="none" stroke="url(#gold-metal-grad)" strokeWidth="1" strokeDasharray="4 6 10 4" style={{ transform: 'rotate(-30deg)' }} />
              <circle cx="50" cy="50" r="20" fill="none" stroke="url(#gold-metal-grad)" strokeWidth="0.8" opacity="0.5" />
            </g>
            <g style={{ transformOrigin: 'center', animation: 'floatUpDown 2.2s infinite ease-in-out' }}>
              <circle cx="50" cy="50" r="15" fill="url(#mythic-glow-grad)" opacity="0.8" />
              <circle cx="50" cy="50" r="10" fill="url(#jade-white-grad)" stroke="url(#gold-metal-grad)" strokeWidth="2.2" filter="url(#wuxia-gold-glow)" />
              <circle cx="47.5" cy="47.5" r="2.5" fill="#ffffff" opacity="0.9" />
            </g>
          </svg>
        );
      default:
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <rect x="25" y="25" width="50" height="50" rx="5" fill="none" stroke="var(--gold)" strokeWidth="2" strokeDasharray="4 4" />
            <text x="50" y="55" fill="var(--gold)" fontSize="18" textAnchor="middle">宝</text>
          </svg>
        );
    }
  };

  return (
    <div style={{ width: size, height: size, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {renderIconSvg()}
    </div>
  );
};

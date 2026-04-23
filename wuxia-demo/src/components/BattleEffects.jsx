import React, { useEffect, useState, useRef } from 'react';

// 战斗动效系统 - 为武侠对战添加视觉反馈
export default function BattleEffects({ effectType, intensity = 1, onComplete, position = 'center' }) {
  const [visible, setVisible] = useState(true);
  const effectRef = useRef(null);

  useEffect(() => {
    if (!effectType) return;

    // 动效持续时间
    const durations = {
      swordSlash: 600,
      heavyHit: 400,
      criticalHit: 800,
      dodge: 500,
      heal: 700,
      buff: 600,
      debuff: 500,
      revive: 1200,
      auraBurst: 800,
      poison: 1000,
      stun: 600,
      internalWound: 800,
    };

    const duration = durations[effectType] || 500;

    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [effectType, onComplete]);

  if (!effectType || !visible) return null;

  // 根据动效类型渲染不同的效果
  const renderEffect = () => {
    switch (effectType) {
      case 'swordSlash':
        return <SwordSlashEffect intensity={intensity} position={position} />;
      case 'heavyHit':
        return <HeavyHitEffect intensity={intensity} />;
      case 'criticalHit':
        return <CriticalHitEffect intensity={intensity} />;
      case 'dodge':
        return <DodgeEffect />;
      case 'heal':
        return <HealEffect intensity={intensity} />;
      case 'buff':
        return <BuffEffect />;
      case 'debuff':
        return <DebuffEffect />;
      case 'revive':
        return <ReviveEffect />;
      case 'auraBurst':
        return <AuraBurstEffect intensity={intensity} />;
      case 'poison':
        return <PoisonEffect />;
      case 'stun':
        return <StunEffect />;
      case 'internalWound':
        return <InternalWoundEffect />;
      default:
        return null;
    }
  };

  return (
    <div ref={effectRef} className="battle-effect-container" style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      {renderEffect()}
    </div>
  );
}

// ========== 剑气划过效果 ==========
const SwordSlashEffect = ({ intensity, position }) => {
  const angle = position === 'left' ? -45 : position === 'right' ? 45 : (Math.random() > 0.5 ? -30 : 30);
  const color = intensity >= 2 ? '#ffd700' : '#fff';

  return (
    <svg
      className="sword-slash-svg"
      width="300"
      height="200"
      viewBox="0 0 300 200"
      style={{
        position: 'absolute',
        transform: `rotate(${angle}deg)`,
        filter: `drop-shadow(0 0 ${intensity * 5}px ${color})`,
      }}
    >
      <defs>
        <linearGradient id="slashGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="20%" stopColor={color} stopOpacity="0.3" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="80%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {/* 剑气主弧线 */}
      <path
        d="M0 100 Q75 50 150 100 Q225 150 300 100"
        stroke="url(#slashGrad)"
        strokeWidth={3 + intensity * 2}
        fill="none"
        strokeLinecap="round"
        style={{
          animation: 'slashDraw 0.5s ease-out forwards',
        }}
      />

      {/* 剑气尾迹 */}
      <path
        d="M50 100 Q100 70 150 100 Q200 130 250 100"
        stroke={color}
        strokeWidth={1 + intensity}
        fill="none"
        opacity="0.5"
        style={{
          animation: 'slashFade 0.4s ease-out forwards',
        }}
      />
    </svg>
  );
};

// ========== 重击震动效果 ==========
const HeavyHitEffect = ({ intensity }) => (
  <div
    className="heavy-hit-overlay"
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `radial-gradient(circle at center, rgba(220, 20, 60, ${0.3 * intensity}), transparent 70%)`,
      animation: `heavyShake ${0.3 / intensity}s ease-out`,
    }}
  />
);

// ========== 暴击效果 ==========
const CriticalHitEffect = ({ intensity }) => (
  <div style={{ position: 'relative' }}>
    {/* 红色爆发 */}
    <div
      className="critical-burst"
      style={{
        position: 'absolute',
        width: 200 * intensity,
        height: 200 * intensity,
        background: 'radial-gradient(circle, rgba(220, 20, 60, 0.8) 0%, rgba(220, 20, 60, 0.3) 30%, transparent 70%)',
        borderRadius: '50%',
        animation: 'burstExpand 0.6s ease-out forwards',
      }}
    />

    {/* 暴击文字 */}
    <div
      className="critical-text"
      style={{
        position: 'absolute',
        fontSize: `${2 + intensity}rem`,
        fontFamily: '"Ma Shan Zheng", cursive',
        color: '#dc143c',
        textShadow: '0 0 20px rgba(220, 20, 60, 0.8), 0 0 40px rgba(220, 20, 60, 0.5)',
        animation: 'criticalPop 0.5s ease-out forwards',
        letterSpacing: '8px',
      }}
    >
      暴击!
    </div>

    {/* 剑气四散 */}
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="critical-ray"
        style={{
          position: 'absolute',
          width: 100,
          height: 2,
          background: 'linear-gradient(90deg, #dc143c, transparent)',
          transform: `rotate(${i * 60}deg)`,
          animation: `rayShoot 0.4s ease-out forwards`,
          animationDelay: `${i * 0.05}s`,
        }}
      />
    ))}
  </div>
);

// ========== 闪避效果 ==========
const DodgeEffect = () => (
  <div
    className="dodge-effect"
    style={{
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {/* 残影 */}
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="dodge-shadow"
        style={{
          position: 'absolute',
          width: 60,
          height: 80,
          background: 'rgba(0, 168, 107, 0.2)',
          borderRadius: '50%',
          filter: 'blur(10px)',
          transform: `translateX(${(i - 1) * 40}px)`,
          animation: `dodgeFade 0.5s ease-out forwards`,
          animationDelay: `${i * 0.1}s`,
        }}
      />
    ))}

    {/* 闪避文字 */}
    <div
      style={{
        fontSize: '1.5rem',
        fontFamily: '"Ma Shan Zheng", cursive',
        color: '#00a86b',
        textShadow: '0 0 10px rgba(0, 168, 107, 0.6)',
        animation: 'dodgeText 0.4s ease-out forwards',
      }}
    >
      闪避
    </div>
  </div>
);

// ========== 治愈效果 ==========
const HealEffect = ({ intensity }) => (
  <div className="heal-effect" style={{ position: 'relative' }}>
    {/* 绿色光晕 */}
    <div
      style={{
        position: 'absolute',
        width: 150,
        height: 150,
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.6) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'healPulse 0.7s ease-out forwards',
      }}
    />

    {/* 上升的光点 */}
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          width: 6,
          height: 6,
          background: '#10b981',
          borderRadius: '50%',
          boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)',
          left: `${50 + Math.random() * 100}px`,
          animation: `healFloat ${0.5 + Math.random() * 0.3}s ease-out forwards`,
          animationDelay: `${i * 0.1}s`,
        }}
      />
    ))}

    {/* 治愈数值 */}
    <div
      style={{
        position: 'absolute',
        fontSize: `${1.5 + intensity * 0.3}rem`,
        fontFamily: '"Ma Shan Zheng", cursive',
        color: '#10b981',
        textShadow: '0 0 15px rgba(16, 185, 129, 0.8)',
        animation: 'healNumber 0.6s ease-out forwards',
      }}
    >
      +{Math.floor(50 + intensity * 100)}
    </div>
  </div>
);

// ========== 增益效果 ==========
const BuffEffect = () => (
  <div className="buff-effect" style={{ position: 'relative' }}>
    {/* 金色光环 */}
    <div
      style={{
        position: 'absolute',
        width: 120,
        height: 120,
        border: '3px solid #d4af37',
        borderRadius: '50%',
        boxShadow: '0 0 20px rgba(212, 175, 55, 0.6), inset 0 0 20px rgba(212, 175, 55, 0.3)',
        animation: 'buffRing 0.6s ease-out forwards',
      }}
    />

    {/* 上升的金光 */}
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          width: 4,
          height: 20,
          background: 'linear-gradient(180deg, transparent, #d4af37)',
          left: `${60 + i * 15}px`,
          animation: `buffRise 0.5s ease-out forwards`,
          animationDelay: `${i * 0.1}s`,
        }}
      />
    ))}
  </div>
);

// ========== 减益效果 ==========
const DebuffEffect = () => (
  <div className="debuff-effect" style={{ position: 'relative' }}>
    {/* 紫色诅咒光环 */}
    <div
      style={{
        position: 'absolute',
        width: 100,
        height: 100,
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'debuffPulse 0.5s ease-out forwards',
      }}
    />

    {/* 下落的紫光 */}
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          width: 3,
          height: 15,
          background: 'linear-gradient(180deg, #8b5cf6, transparent)',
          left: `${50 + i * 20}px`,
          animation: `debuffFall 0.5s ease-out forwards`,
          animationDelay: `${i * 0.05}s`,
        }}
      />
    ))}
  </div>
);

// ========== 复活效果 ==========
const ReviveEffect = () => (
  <div className="revive-effect" style={{ position: 'relative' }}>
    {/* 金色圣光 */}
    <div
      style={{
        position: 'absolute',
        width: 200,
        height: 200,
        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.8) 0%, rgba(251, 191, 36, 0.3) 40%, transparent 70%)',
        borderRadius: '50%',
        animation: 'reviveGlow 1s ease-out forwards',
      }}
    />

    {/* 佛光普照 */}
    {[...Array(12)].map((_, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          width: 2,
          height: 60,
          background: 'linear-gradient(180deg, #fbbf24, transparent)',
          transform: `rotate(${i * 30}deg)`,
          transformOrigin: 'bottom center',
          animation: `reviveRay 0.8s ease-out forwards`,
          animationDelay: `${i * 0.05}s`,
        }}
      />
    ))}

    {/* 复活文字 */}
    <div
      style={{
        position: 'absolute',
        fontSize: '2rem',
        fontFamily: '"Ma Shan Zheng", cursive',
        color: '#fbbf24',
        textShadow: '0 0 30px rgba(251, 191, 36, 0.8)',
        animation: 'reviveText 1s ease-out forwards',
        letterSpacing: '6px',
      }}
    >
      涅槃重生
    </div>
  </div>
);

// ========== 气劲爆发效果 ==========
const AuraBurstEffect = ({ intensity }) => (
  <div className="aura-burst" style={{ position: 'relative' }}>
    {/* 水墨晕染 */}
    <svg width={200 * intensity} height={200 * intensity} viewBox="0 0 200 200">
      <defs>
        <radialGradient id="inkBurst" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(212, 175, 55, 0.8)" />
          <stop offset="50%" stopColor="rgba(212, 175, 55, 0.3)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      {/* 中心墨点 */}
      <circle
        cx="100"
        cy="100"
        r="20"
        fill="url(#inkBurst)"
        style={{
          animation: 'inkExpand 0.6s ease-out forwards',
        }}
      />

      {/* 扩散墨晕 */}
      <circle
        cx="100"
        cy="100"
        r="50"
        fill="none"
        stroke="#d4af37"
        strokeWidth="2"
        opacity="0.5"
        style={{
          animation: 'inkSpread 0.5s ease-out forwards',
        }}
      />

      {/* 墨迹飞溅 */}
      {[...Array(8)].map((_, i) => (
        <circle
          key={i}
          cx={100 + Math.cos(i * 45 * Math.PI / 180) * 30}
          cy={100 + Math.sin(i * 45 * Math.PI / 180) * 30}
          r={5 + Math.random() * 5}
          fill="#d4af37"
          opacity="0.6"
          style={{
            animation: `inkSplash 0.4s ease-out forwards`,
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </svg>
  </div>
);

// ========== 中毒效果 ==========
const PoisonEffect = () => (
  <div className="poison-effect" style={{ position: 'relative' }}>
    {/* 绿色毒雾 */}
    <div
      style={{
        position: 'absolute',
        width: 150,
        height: 100,
        background: 'radial-gradient(ellipse, rgba(34, 197, 94, 0.4) 0%, rgba(34, 197, 94, 0.2) 50%, transparent 70%)',
        borderRadius: '50%',
        animation: 'poisonCloud 1s ease-out forwards',
      }}
    />

    {/* 毒气泡 */}
    {[...Array(10)].map((_, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          width: 8 + Math.random() * 8,
          height: 8 + Math.random() * 8,
          background: 'rgba(34, 197, 94, 0.6)',
          borderRadius: '50%',
          left: `${50 + Math.random() * 100}px`,
          animation: `poisonBubble ${0.8 + Math.random() * 0.4}s ease-out forwards`,
          animationDelay: `${i * 0.1}s`,
        }}
      />
    ))}

    {/* 中毒文字 */}
    <div
      style={{
        position: 'absolute',
        fontSize: '1.2rem',
        fontFamily: '"Ma Shan Zheng", cursive',
        color: '#22c55e',
        textShadow: '0 0 10px rgba(34, 197, 94, 0.6)',
        animation: 'poisonText 0.8s ease-out forwards',
      }}
    >
      中毒
    </div>
  </div>
);

// ========== 眩晕效果 ==========
const StunEffect = () => (
  <div className="stun-effect" style={{ position: 'relative' }}>
    {/* 眩晕星星 */}
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          fontSize: '1.5rem',
          color: '#fbbf24',
          animation: `stunStar 0.6s ease-in-out infinite`,
          animationDelay: `${i * 0.1}s`,
          transform: `translate(${Math.random() * 60 - 30}px, ${Math.random() * 40 - 20}px)`,
        }}
      >
        ✦
      </div>
    ))}

    {/* 眩晕文字 */}
    <div
      style={{
        position: 'absolute',
        fontSize: '1.2rem',
        fontFamily: '"Ma Shan Zheng", cursive',
        color: '#fbbf24',
        textShadow: '0 0 10px rgba(251, 191, 36, 0.6)',
        animation: 'stunText 0.5s ease-out forwards',
      }}
    >
      眩晕
    </div>
  </div>
);

// ========== 内伤效果 ==========
const InternalWoundEffect = () => (
  <div className="internal-wound" style={{ position: 'relative' }}>
    {/* 内力紊乱 */}
    <svg width="150" height="150" viewBox="0 0 150 150">
      {/* 扭曲的经脉 */}
      {[...Array(4)].map((_, i) => (
        <path
          key={i}
          d={`M${30 + i * 30} 30 Q${50 + i * 20} ${75 + Math.sin(i) * 20} ${30 + i * 30} 120`}
          stroke="#8b5cf6"
          strokeWidth="2"
          fill="none"
          opacity="0.6"
          style={{
            animation: `meridianTwist 0.8s ease-out forwards`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}

      {/* 内伤光点 */}
      <circle cx="75" cy="75" r="10" fill="#8b5cf6" opacity="0.8">
        <animate attributeName="r" values="5;15;5" dur="0.8s" />
      </circle>
    </svg>

    {/* 内伤文字 */}
    <div
      style={{
        position: 'absolute',
        fontSize: '1.2rem',
        fontFamily: '"Ma Shan Zheng", cursive',
        color: '#8b5cf6',
        textShadow: '0 0 10px rgba(139, 92, 246, 0.6)',
        animation: 'internalText 0.6s ease-out forwards',
      }}
    >
      内伤
    </div>
  </div>
);

// ========== 伤害飘字组件 ==========
export const DamageFloatNumber = ({ damage, type = 'damage', position = { x: 0, y: 0 } }) => {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffsetY(-80);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const colors = {
    damage: '#ef4444',
    heal: '#10b981',
    critical: '#dc143c',
    poison: '#22c55e',
    buff: '#d4af37',
    debuff: '#8b5cf6',
  };

  const color = colors[type] || colors.damage;
  const fontSize = type === 'critical' ? '2rem' : '1.5rem';

  return (
    <div
      className="damage-float"
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y + offsetY,
        fontSize,
        fontFamily: '"Ma Shan Zheng", cursive',
        color,
        textShadow: `0 0 15px ${color}`,
        fontWeight: 'bold',
        transform: `translateY(${offsetY}px)`,
        opacity: offsetY === 0 ? 1 : 0,
        transition: 'all 0.5s ease-out',
        pointerEvents: 'none',
        zIndex: 200,
      }}
    >
      {type === 'heal' ? '+' : '-'}{damage}
    </div>
  );
};

// ========== 打击停顿效果（Hit Stop）==========
export const HitStopEffect = ({ duration = 150, active }) => {
  if (!active) return null;

  return (
    <style>
      {`
        .battle-container {
          animation: hitStop ${duration}ms ease-out !important;
        }
        @keyframes hitStop {
          0% { transform: scale(1); }
          10% { transform: scale(0.98); }
          30% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
      `}
    </style>
  );
};

// ========== CSS 动画样式（需要添加到 index.css）==========
export const battleEffectStyles = `
/* 剑气划过动画 */
@keyframes slashDraw {
  0% { stroke-dasharray: 0 600; stroke-dashoffset: 0; }
  100% { stroke-dasharray: 600 0; stroke-dashoffset: -600; }
}

@keyframes slashFade {
  0% { opacity: 0.8; }
  100% { opacity: 0; transform: translateX(50px); }
}

/* 重击震动 */
@keyframes heavyShake {
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-10px); }
  20% { transform: translateX(10px); }
  30% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  50% { transform: translateX(-5px); }
  60% { transform: translateX(5px); }
}

/* 暴击爆发 */
@keyframes burstExpand {
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}

@keyframes criticalPop {
  0% { transform: scale(0) rotate(-10deg); opacity: 0; }
  50% { transform: scale(1.5) rotate(5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 0; transform: translateY(-30px); }
}

@keyframes rayShoot {
  0% { transform: rotate(var(--ray-angle)) scaleX(0); opacity: 1; }
  100% { transform: rotate(var(--ray-angle)) scaleX(2); opacity: 0; }
}

/* 闪避效果 */
@keyframes dodgeFade {
  0% { opacity: 0.6; transform: translateX(var(--dodge-x)) scale(1); }
  100% { opacity: 0; transform: translateX(calc(var(--dodge-x) + 20px)) scale(0.5); }
}

@keyframes dodgeText {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1) translateY(-20px); opacity: 0; }
}

/* 治愈效果 */
@keyframes healPulse {
  0% { transform: scale(0); opacity: 0.8; }
  50% { transform: scale(1.5); opacity: 0.6; }
  100% { transform: scale(2); opacity: 0; }
}

@keyframes healFloat {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-50px); opacity: 0; }
}

@keyframes healNumber {
  0% { transform: translateY(0) scale(0); opacity: 0; }
  50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
  100% { transform: translateY(-40px) scale(1); opacity: 0; }
}

/* 增益效果 */
@keyframes buffRing {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

@keyframes buffRise {
  0% { transform: translateY(50px); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(-30px); opacity: 0; }
}

/* 减益效果 */
@keyframes debuffPulse {
  0% { transform: scale(0); opacity: 0.8; }
  100% { transform: scale(1.5); opacity: 0; }
}

@keyframes debuffFall {
  0% { transform: translateY(-30px); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(30px); opacity: 0; }
}

/* 复活效果 */
@keyframes reviveGlow {
  0% { transform: scale(0); opacity: 0; }
  30% { transform: scale(1); opacity: 0.8; }
  60% { transform: scale(1.5); opacity: 0.6; }
  100% { transform: scale(2); opacity: 0; }
}

@keyframes reviveRay {
  0% { transform: rotate(var(--ray-angle)) scaleY(0); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: rotate(var(--ray-angle)) scaleY(1.5); opacity: 0; }
}

@keyframes reviveText {
  0% { transform: scale(0) translateY(20px); opacity: 0; }
  30% { transform: scale(1.2) translateY(0); opacity: 1; }
  70% { transform: scale(1) translateY(-10px); opacity: 1; }
  100% { transform: scale(0.8) translateY(-30px); opacity: 0; }
}

/* 气劲爆发 */
@keyframes inkExpand {
  0% { r: 5; opacity: 1; }
  100% { r: 80; opacity: 0; }
}

@keyframes inkSpread {
  0% { r: 10; opacity: 0.8; }
  100% { r: 100; opacity: 0; }
}

@keyframes inkSplash {
  0% { transform: translate(0, 0) scale(1); opacity: 0.8; }
  100% { transform: translate(calc(var(--splash-x) * 2), calc(var(--splash-y) * 2)) scale(0.3); opacity: 0; }
}

/* 中毒效果 */
@keyframes poisonCloud {
  0% { transform: scale(0.5); opacity: 0.4; }
  50% { transform: scale(1.2); opacity: 0.6; }
  100% { transform: scale(1.5); opacity: 0; }
}

@keyframes poisonBubble {
  0% { transform: translateY(0) scale(0.5); opacity: 0.6; }
  50% { transform: translateY(-20px) scale(1); opacity: 0.8; }
  100% { transform: translateY(-40px) scale(0.5); opacity: 0; }
}

@keyframes poisonText {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1) translateY(-20px); opacity: 0; }
}

/* 眩晕效果 */
@keyframes stunStar {
  0%, 100% { transform: rotate(0deg) scale(1); opacity: 0.8; }
  50% { transform: rotate(180deg) scale(1.5); opacity: 1; }
}

@keyframes stunText {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1) translateY(-10px); opacity: 0; }
}

/* 内伤效果 */
@keyframes meridianTwist {
  0% { d: path("M30 30 Q50 75 30 120"); opacity: 0.4; }
  50% { d: path("M30 30 Q70 60 30 120"); opacity: 0.8; }
  100% { d: path("M30 30 Q40 90 30 120"); opacity: 0; }
}

@keyframes internalText {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1) translateY(-15px); opacity: 0; }
}
`;
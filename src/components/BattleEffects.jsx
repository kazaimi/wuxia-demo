import React, { useEffect, useState, useRef, useMemo } from 'react';
import { SKILLS_DB } from '../store/gameState';

// 战斗动效系统 - 为武侠对战添加视觉反馈
export default function BattleEffects({ effectType, intensity = 1, onComplete, position = 'center', skillName, skillId }) {
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
      fistPunch: 850,
      ultimateBurst: 1200,
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
      case 'fistPunch':
        return <FistPunchEffect intensity={intensity} position={position} />;
      case 'ultimateBurst':
        return <UltimateBurstEffect intensity={intensity} position={position} skillName={skillName} skillId={skillId} />;
      default:
        return null;
    }
  };

  // Determine container positioning based on target position
  const getContainerStyle = () => {
    const baseStyle = {
      position: 'absolute',
      top: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      transition: 'all 0.3s ease',
    };

    if (position === 'left') {
      return {
        ...baseStyle,
        left: 0,
        width: '40%',
      };
    } else if (position === 'right') {
      return {
        ...baseStyle,
        right: 0,
        left: 'auto',
        width: '40%',
      };
    } else {
      return {
        ...baseStyle,
        left: 0,
        right: 0,
        width: '100%',
      };
    }
  };

  return (
    <div ref={effectRef} className="battle-effect-container" style={getContainerStyle()}>
      <style>{battleEffectStyles}</style>
      {renderEffect()}
    </div>
  );
}

// ========== 剑气划过效果 ==========
const SwordSlashEffect = ({ intensity, position }) => {
  const angle = position === 'left' ? -45 : position === 'right' ? 45 : (Math.random() > 0.5 ? -30 : 30);
  const color = intensity >= 2 ? '#ffd700' : '#fff';

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {/* 命中时的剑光斩裂 (普通攻击还原原版：直接打在受击卡牌上，无飞行弹道，干净利落) */}
      <svg
        className="sword-slash-svg"
        width="300"
        height="200"
        viewBox="0 0 300 200"
        style={{
          position: 'absolute',
          transform: `rotate(${angle}deg)`,
          filter: `drop-shadow(0 0 ${intensity * 5}px ${color})`,
          animation: 'slashFade 0.35s ease-out forwards',
          opacity: 0.8,
          zIndex: 4,
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
    </div>
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
    <div className="combat-text-critical" style={{ position: 'absolute' }}>
      【暴击】
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
          animationName: 'rayShoot',
          animationDuration: '0.4s',
          animationTimingFunction: 'ease-out',
          animationFillMode: 'forwards',
          animationDelay: `${i * 0.05}s`,
        }}
      />
    ))}
  </div>
);

// ========== 拳脚普通打击效果 ==========
const FistPunchEffect = ({ intensity, position }) => {
  const color = intensity >= 2 ? '#ff453a' : '#d4af37';
  
  // 随机获取“拳”、“掌”、“脚”、“印”、“击”印记
  const punchChar = useMemo(() => {
    const chars = ['拳', '掌', '脚', '印', '击'];
    return chars[Math.floor(Math.random() * chars.length)];
  }, []);

  const hasProjectile = position === 'left' || position === 'right';

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none', zIndex: 110 }}>
      {/* 1. 飞行的写意拳劲真气流 */}
      {hasProjectile && (
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            overflow: 'visible',
            animationName: position === 'left' ? 'projectileRightToLeft' : 'projectileLeftToRight',
            animationDuration: '0.45s',
            animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            animationFillMode: 'forwards',
            zIndex: 5,
          }}
        >
          <g style={{ transformOrigin: '100px 100px', transform: position === 'left' ? 'scaleX(-1)' : 'none' }}>
            {/* 写意双曲线风暴气劲 (无几何圆圈) */}
            <path 
              d="M 60,100 Q 100,75 140,100 T 180,95" 
              fill="none" 
              stroke={color} 
              strokeWidth="5" 
              strokeLinecap="round" 
              opacity="0.85" 
              style={{ strokeDasharray: '200', animation: 'ribbonWaving1 0.45s linear infinite' }}
            />
            <path 
              d="M 80,105 Q 110,85 140,105 T 170,100" 
              fill="none" 
              stroke="#ffffff" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              opacity="0.9" 
              style={{ strokeDasharray: '150', animation: 'ribbonWaving2 0.45s linear infinite' }}
            />
            {/* 绕动尘埃粒子 */}
            <circle cx="100" cy="100" r="4.5" fill={color} style={{ animation: 'dustOrbit1 0.45s linear infinite' }} />
            <circle cx="100" cy="100" r="3.5" fill="#ffffff" style={{ animation: 'dustOrbit2 0.45s linear infinite' }} />
          </g>
        </svg>
      )}

      {/* 2. 命中爆发 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        animation: hasProjectile ? 'slashFade 0.35s ease-out forwards 0.4s' : 'none',
        opacity: hasProjectile ? 0 : 1,
      }}>
        <svg width="220" height="220" viewBox="0 0 200 200" style={{ position: 'absolute', overflow: 'visible' }}>
          {/* 写意打击爆裂弧线（不规则半月形，无几何正圆圈） */}
          <path 
            d="M 55,65 A 45 45 0 0,0 55,135" 
            fill="none" 
            stroke={color} 
            strokeWidth="4.5" 
            strokeLinecap="round" 
            opacity="0.8" 
            style={{ transformOrigin: '100px 100px', animation: hasProjectile ? 'fistImpact 0.4s ease-out forwards 0.4s' : 'fistImpact 0.4s ease-out forwards' }} 
          />
          <path 
            d="M 145,65 A 45 45 0 0,1 145,135" 
            fill="none" 
            stroke={color} 
            strokeWidth="4.5" 
            strokeLinecap="round" 
            opacity="0.8" 
            style={{ transformOrigin: '100px 100px', animation: hasProjectile ? 'fistImpact 0.4s ease-out forwards 0.4s' : 'fistImpact 0.4s ease-out forwards' }} 
          />
          <path 
            d="M 70,80 A 30 30 0 0,0 70,120" 
            fill="none" 
            stroke="#ffffff" 
            strokeWidth="2" 
            strokeLinecap="round" 
            opacity="0.65" 
            style={{ transformOrigin: '100px 100px', animation: hasProjectile ? 'fistImpact 0.3s ease-out forwards 0.45s' : 'fistImpact 0.3s ease-out forwards 0.05s' }} 
          />

          {/* 放射状打击干笔水墨线 */}
          <line x1="100" y1="100" x2="60" y2="40" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.7" style={{ transformOrigin: '100px 100px', animation: hasProjectile ? 'inkDropFlyNW 0.35s ease-out forwards 0.4s' : 'inkDropFlyNW 0.35s ease-out forwards' }} />
          <line x1="100" y1="100" x2="145" y2="35" stroke="#000" strokeWidth="4" strokeLinecap="round" opacity="0.8" style={{ transformOrigin: '100px 100px', animation: hasProjectile ? 'inkDropFlyNE 0.38s ease-out forwards 0.4s' : 'inkDropFlyNE 0.38s ease-out forwards' }} />
          <line x1="100" y1="100" x2="50" y2="150" stroke="#000" strokeWidth="3.5" strokeLinecap="round" opacity="0.8" style={{ transformOrigin: '100px 100px', animation: hasProjectile ? 'inkDropFlySW 0.36s ease-out forwards 0.4s' : 'inkDropFlySW 0.36s ease-out forwards' }} />
          <line x1="100" y1="100" x2="150" y2="140" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.7" style={{ transformOrigin: '100px 100px', animation: hasProjectile ? 'inkDropFlySE 0.4s ease-out forwards 0.4s' : 'inkDropFlySE 0.4s ease-out forwards' }} />
        </svg>

        {/* 砸落的毛笔狂草字印章 */}
        <div style={{
          fontFamily: '"Zhi Mang Xing", "Ma Shan Zheng", cursive',
          fontSize: '4.8rem',
          fontWeight: '900',
          color: '#ffffff',
          textShadow: `0 0 10px #000, 0 0 20px ${color}, 0 0 35px ${color}`,
          animation: hasProjectile ? 'fistTextZoom 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.25) both 0.4s' : 'fistTextZoom 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.25) both',
          pointerEvents: 'none',
          zIndex: 10,
          transformOrigin: 'center',
        }}>
          {punchChar}
        </div>
      </div>
    </div>
  );
};

// ========== 绝世招式华丽爆发效果 ==========
const UltimateBurstEffect = ({ intensity, position, skillName, skillId }) => {
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  const hasProjectile = position === 'left' || position === 'right';
  const color = intensity >= 2 ? '#ffd700' : '#ff453a';

  // 识别世界Boss特定神威技能
  const isBossChaos = useMemo(() => skillId === 'boss_chaos' || (skillName && skillName.includes('乱神')), [skillId, skillName]);
  const isBossShadow = useMemo(() => skillId === 'boss_shadow' || (skillName && skillName.includes('夺魄')), [skillId, skillName]);
  const isBossRoar = useMemo(() => skillId === 'boss_roar' || (skillName && skillName.includes('魔啸')), [skillId, skillName]);
  const isBossExtinction = useMemo(() => skillId === 'boss_extinction' || (skillName && skillName.includes('寂灭')), [skillId, skillName]);

  // 解析招式类型：兵刃(sword/blade)、拳脚(fist)、内功玄学(divine)、BOSS专属(boss)
  const skillType = useMemo(() => {
    const name = skillName || '';
    const id = skillId || '';
    
    if (isBossChaos || isBossShadow || isBossRoar || isBossExtinction || name.includes('魔罗') || name.includes('邪煞') || name.includes('诸神') || name.includes('魔啸') || id.startsWith('boss_')) {
      return 'boss';
    }
    if (/剑|斩|九败|影|刺|刃/.test(name)) {
      return 'sword';
    }
    if (/刀|劈/.test(name)) {
      return 'blade';
    }
    if (/掌|拳|指|脚|手|爪|降龙|折梅|打/.test(name)) {
      return 'fist';
    }
    if (/易筋经|神功|心诀|洗髓|九阳|吸星|太极|真气/.test(name)) {
      return 'divine';
    }
    
    // 从ID做进一步识别
    if (/s_liumai|s5|s_anran|s_dianxue/.test(id)) {
      return 'fist';
    }
    if (/s_yijin|s_shengxin|s_shenxing/.test(id)) {
      return 'divine';
    }
    
    return 'divine'; // 默认 fallback
  }, [skillName, skillId, isBossChaos, isBossShadow, isBossRoar, isBossExtinction]);

  // 根据招式类型获取命中单字 (BOSS使用独特的“噬”)
  const hitChar = skillType === 'boss' ? '噬' : (skillType === 'sword' || skillType === 'blade') ? '斬' : skillType === 'fist' ? '破' : '絕';

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none', zIndex: 120 }}>
      {/* 1. 飞行的具象化写意弹道 */}
      {hasProjectile && (
        <>
          {/* 1.1 非Boss大招时使用传统水墨特效 */}
          {!isBossChaos && !isBossShadow && !isBossRoar && !isBossExtinction && (
            <svg
              width="240"
              height="240"
              viewBox="0 0 200 200"
              style={{
                position: 'absolute',
                pointerEvents: 'none',
                overflow: 'visible',
                animationName: position === 'left' ? 'projectileRightToLeft' : 'projectileLeftToRight',
                animationDuration: '0.65s',
                animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                animationFillMode: 'forwards',
                zIndex: 5,
              }}
            >
              {/* 渐变及滤镜定义 */}
              <defs>
                <linearGradient id="swordQiGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="30%" stopColor={color} stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="dragonInkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0d0d1a" />
                  <stop offset="40%" stopColor={color} />
                  <stop offset="80%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor={color} />
                </linearGradient>
                <linearGradient id="bossCloudGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="40%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="80%" stopColor="#a21caf" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              
              {/* Fallback Boss Claw (if custom boss skill in standard battles) */}
              {skillType === 'boss' && (
                <g style={{ transformOrigin: '100px 100px', transform: position === 'left' ? 'scaleX(-1)' : 'none' }}>
                  {/* 魔气拖尾 */}
                  <path
                    d="M 10,100 C 40,80 90,120 160,100"
                    fill="none"
                    stroke="url(#bossCloudGrad)"
                    strokeWidth="20"
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                  {/* 魔爪 */}
                  <g filter="drop-shadow(0 0 10px rgba(162, 28, 175, 0.8))">
                    <path
                      d="M 50,90 Q 60,60 110,75 Q 120,100 110,125 Q 60,140 50,90 Z"
                      fill="#0d0514"
                      stroke="#a21caf"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M 100,75 Q 130,50 170,55 L 180,50 L 175,62 Q 135,62 100,75"
                      fill="#0d0514"
                      stroke="#a21caf"
                      strokeWidth="2"
                    />
                    <path
                      d="M 110,88 Q 145,80 185,90 L 195,85 L 190,98 Q 148,93 110,88"
                      fill="#0d0514"
                      stroke="#a21caf"
                      strokeWidth="2"
                    />
                    <path
                      d="M 110,112 Q 145,120 185,110 L 195,115 L 190,102 Q 148,107 110,112"
                      fill="#0d0514"
                      stroke="#a21caf"
                      strokeWidth="2"
                    />
                    <path
                      d="M 100,125 Q 130,150 170,145 L 180,150 L 175,138 Q 135,138 100,125"
                      fill="#0d0514"
                      stroke="#a21caf"
                      strokeWidth="2"
                    />
                  </g>
                </g>
              )}

          {/* 渲染兵刃：青铜墨剑 */}
          {skillType === 'sword' && (
            <g style={{ transformOrigin: '100px 100px', transform: position === 'left' ? 'scaleX(-1)' : 'none' }}>
              {/* 剑气拖尾残影 */}
              <path
                d="M 10,100 C 40,86 90,114 160,100"
                fill="none"
                stroke="url(#swordQiGrad)"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.55"
              />
              {/* 宝剑本体 */}
              <path
                d="M 50,96 L 160,98 L 172,100 L 160,102 L 50,104 Z"
                fill="#2c2c2c"
                stroke="#ffffff"
                strokeWidth="1"
                filter={`drop-shadow(0 0 5px ${color})`}
              />
              {/* 剑脊 */}
              <path
                d="M 50,100 L 170,100"
                stroke="#ffffff"
                strokeWidth="0.8"
                opacity="0.8"
              />
              {/* 剑格(护手) */}
              <path
                d="M 46,88 Q 50,94 50,100 Q 50,106 46,112 Q 43,100 46,88 Z"
                fill="#d4af37"
                stroke="#1a1a2e"
                strokeWidth="1"
              />
              {/* 剑柄 */}
              <path
                d="M 28,100 L 46,100"
                stroke="#1a1a2e"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              {/* 剑首环 */}
              <circle cx="26" cy="100" r="3.5" fill="#d4af37" stroke="#1a1a2e" strokeWidth="0.75" />
              {/* 飘动剑穗 */}
              <path
                d="M 23,100 Q 14,106 8,102 T 0,104 M 23,100 Q 16,94 10,96 T 2,94"
                fill="none"
                stroke="#ff2d55"
                strokeWidth="1.5"
                opacity="0.9"
              />
              {/* 剑气粒子 */}
              <circle cx="100" cy="100" r="4.5" fill="#ffffff" style={{ animation: 'dustOrbit1 0.65s linear infinite' }} />
              <circle cx="100" cy="100" r="3.5" fill={color} style={{ animation: 'dustOrbit2 0.65s linear infinite' }} />
            </g>
          )}

          {/* 渲染兵刃：青铜墨刀 */}
          {skillType === 'blade' && (
            <g style={{ transformOrigin: '100px 100px', transform: position === 'left' ? 'scaleX(-1)' : 'none' }}>
              {/* 刀气拖尾残影 */}
              <path
                d="M 10,102 C 40,90 90,118 160,100"
                fill="none"
                stroke="url(#swordQiGrad)"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.55"
              />
              {/* 宝刀本体 */}
              <path
                d="M 48,96 C 90,92 130,82 172,95 C 168,103 110,106 48,104 Z"
                fill="#2c2c2c"
                stroke="#ffffff"
                strokeWidth="1"
                filter={`drop-shadow(0 0 5px ${color})`}
              />
              {/* 刀脊/刀背 */}
              <path
                d="M 48,96 C 90,92 130,82 172,95"
                fill="none"
                stroke="#555"
                strokeWidth="2.5"
              />
              {/* 刀刃 (银白闪亮) */}
              <path
                d="M 48,104 C 110,106 168,103 172,95"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.2"
                opacity="0.9"
              />
              {/* 刀格(护手) */}
              <ellipse
                cx="48"
                cy="100"
                rx="3"
                ry="10"
                fill="#d4af37"
                stroke="#1a1a2e"
                strokeWidth="1"
              />
              {/* 刀柄 */}
              <path
                d="M 30,100 L 46,100"
                stroke="#1a1a2e"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* 刀首环 */}
              <circle cx="27" cy="100" r="4" fill="#d4af37" stroke="#1a1a2e" strokeWidth="0.75" />
              {/* 飘动刀穗 */}
              <path
                d="M 23,100 Q 14,106 8,102 T 0,104 M 23,100 Q 16,94 10,96 T 2,94"
                fill="none"
                stroke="#ff2d55"
                strokeWidth="1.5"
                opacity="0.9"
              />
              {/* 刀气粒子 */}
              <circle cx="100" cy="100" r="4.5" fill="#ffffff" style={{ animation: 'dustOrbit1 0.65s linear infinite' }} />
              <circle cx="100" cy="100" r="3.5" fill={color} style={{ animation: 'dustOrbit2 0.65s linear infinite' }} />
            </g>
          )}

          {/* 渲染拳脚：水墨苍龙 */}
          {skillType === 'fist' && (
            <g style={{ transformOrigin: '100px 100px', transform: position === 'left' ? 'scaleX(-1)' : 'none' }}>
              {/* 龙身 */}
              <path
                d="M 15,106 Q 50,70 85,108 T 145,98"
                fill="none"
                stroke="#0d0d1a"
                strokeWidth="16"
                strokeLinecap="round"
                opacity="0.8"
                style={{ strokeDasharray: '250', animation: 'ribbonWaving1 0.65s linear infinite' }}
              />
              <path
                d="M 15,106 Q 50,70 85,108 T 145,98"
                fill="none"
                stroke="url(#dragonInkGrad)"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.9"
                style={{ strokeDasharray: '200', animation: 'ribbonWaving2 0.65s linear infinite' }}
              />
              <path
                d="M 25,104 Q 55,78 85,104 T 140,100"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.95"
                style={{ strokeDasharray: '150', animation: 'ribbonWaving1 0.65s linear infinite' }}
              />

              {/* 龙头 */}
              <g style={{ animation: 'dragonHeadWobble 0.22s ease-in-out infinite', transformOrigin: '150px 100px' }}>
                <path
                  d="M 148,96 Q 162,91 174,95 Q 165,101 148,101 Q 158,105 168,107 Q 148,107 136,103"
                  fill="#0d0d1a"
                  stroke={color}
                  strokeWidth="1.2"
                />
                <path
                  d="M 136,93 Q 148,86 164,91 Q 170,95 174,95"
                  fill="#0d0d1a"
                  stroke={color}
                  strokeWidth="1.5"
                />
                <path
                  d="M 142,89 Q 132,73 120,69"
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 139,87 Q 126,67 114,65"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M 158,94 Q 185,88 200,96 M 156,102 Q 183,107 198,101"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  opacity="0.8"
                />
                <circle cx="150" cy="92" r="3.5" fill="#ffffff" filter="drop-shadow(0 0 3px #ffd700)" />
                <circle cx="150" cy="92" r="1.5" fill="#ff453a" />
              </g>

              {/* 龙气粒子 */}
              <circle cx="100" cy="100" r="5" fill="#ffffff" style={{ animation: 'dustOrbit1 0.65s linear infinite' }} />
              <circle cx="100" cy="100" r="4" fill={color} style={{ animation: 'dustOrbit2 0.65s linear infinite' }} />
            </g>
          )}

          {/* 渲染内功玄学：九字真言太极法球 */}
          {skillType === 'divine' && (
            <g style={{ transformOrigin: '100px 100px' }}>
              <path
                d="M 20,100 Q 60,60 100,100 T 180,100"
                fill="none"
                stroke="#0d0d1a"
                strokeWidth="10"
                strokeLinecap="round"
                opacity="0.8"
                style={{ strokeDasharray: '300', animation: 'ribbonWaving1 0.65s linear infinite' }}
              />
              <path
                d="M 20,100 Q 60,60 100,100 T 180,100"
                fill="none"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.9"
                style={{ strokeDasharray: '200', animation: 'ribbonWaving2 0.65s linear infinite' }}
              />

              {/* 旋转太极图 */}
              <g style={{ transformOrigin: '100px 100px', animation: 'rotateTaiji 3s linear infinite' }}>
                <circle cx="100" cy="100" r="23" fill="none" stroke={color} strokeWidth="1.5" opacity="0.65" />
                <path
                  d="M 100,77 A 23,23 0 0,0 100,123 A 11.5,11.5 0 0,0 100,100 A 11.5,11.5 0 0,1 100,77"
                  fill="#0d0d1a"
                  opacity="0.9"
                />
                <path
                  d="M 100,77 A 23,23 0 0,1 100,123 A 11.5,11.5 0 0,0 100,100 A 11.5,11.5 0 0,1 100,77"
                  fill="#ffffff"
                  opacity="0.95"
                />
                <circle cx="100" cy="88.5" r="3" fill="#0d0d1a" />
                <circle cx="100" cy="111.5" r="3" fill="#ffffff" />
              </g>

              {/* 逆时针自转九字真言 */}
              <g style={{ transformOrigin: '100px 100px', animation: 'scriptureRotate 5s linear infinite' }}>
                <text x="152" y="100" textAnchor="middle" dominantBaseline="middle" fill="#d4af37" fontSize="11" fontFamily="'Ma Shan Zheng', cursive" style={{ textShadow: `0 0 4px ${color}` }}>临</text>
                <text x="126" y="145" textAnchor="middle" dominantBaseline="middle" fill="#d4af37" fontSize="11" fontFamily="'Ma Shan Zheng', cursive" style={{ textShadow: `0 0 4px ${color}` }}>兵</text>
                <text x="74" y="145" textAnchor="middle" dominantBaseline="middle" fill="#d4af37" fontSize="11" fontFamily="'Ma Shan Zheng', cursive" style={{ textShadow: `0 0 4px ${color}` }}>斗</text>
                <text x="48" y="100" textAnchor="middle" dominantBaseline="middle" fill="#d4af37" fontSize="11" fontFamily="'Ma Shan Zheng', cursive" style={{ textShadow: `0 0 4px ${color}` }}>者</text>
                <text x="74" y="55" textAnchor="middle" dominantBaseline="middle" fill="#d4af37" fontSize="11" fontFamily="'Ma Shan Zheng', cursive" style={{ textShadow: `0 0 4px ${color}` }}>皆</text>
                <text x="126" y="55" textAnchor="middle" dominantBaseline="middle" fill="#d4af37" fontSize="11" fontFamily="'Ma Shan Zheng', cursive" style={{ textShadow: `0 0 4px ${color}` }}>阵</text>
              </g>

              {/* 能量粒子 */}
              <circle cx="100" cy="100" r="5" fill="#ffffff" style={{ animation: 'dustOrbit1 0.65s linear infinite' }} />
              <circle cx="100" cy="100" r="4" fill={color} style={{ animation: 'dustOrbit2 0.65s linear infinite' }} />
            </g>
          )}
            </svg>
          )}

          {/* 渲染 4 个 Boss 大招的 PNG (抠图 + 深度混合发光 + 动态多维动效) */}
          {isBossChaos && (
            <div style={{
              position: 'absolute',
              width: '240px',
              height: '240px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              pointerEvents: 'none',
              zIndex: 5,
            }}>
              {/* 旋转阵法背景 */}
              <svg
                width="240"
                height="240"
                viewBox="0 0 200 200"
                style={{
                  position: 'absolute',
                  pointerEvents: 'none',
                  animation: 'magicCircleRotate 1.1s cubic-bezier(0.19, 1, 0.22, 1) forwards',
                }}
              >
                <circle cx="100" cy="100" r="72" fill="none" stroke="rgba(162, 28, 175, 0.55)" strokeWidth="1.5" strokeDasharray="4 8" />
                <circle cx="100" cy="100" r="58" fill="none" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="1.2" strokeDasharray="10 5" />
                <polygon points="100,32 159,134 41,134" fill="none" stroke="rgba(162, 28, 175, 0.3)" strokeWidth="1" />
                <polygon points="100,168 159,66 41,66" fill="none" stroke="rgba(162, 28, 175, 0.3)" strokeWidth="1" />
              </svg>
              {/* PNG 虚空之眼 */}
              <img
                src="/boss_chaos_eye.png"
                alt="混沌魔眼"
                style={{
                  width: '185px',
                  height: '185px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 20px rgba(162, 28, 175, 0.95))',
                  animation: 'eyeBlinkOpen 1.1s cubic-bezier(0.19, 1, 0.22, 1) forwards',
                  zIndex: 2,
                }}
              />
              {/* concentric shockwaves */}
              <svg
                width="240"
                height="240"
                viewBox="0 0 200 200"
                style={{ position: 'absolute', pointerEvents: 'none', overflow: 'visible', zIndex: 3 }}
              >
                <circle cx="100" cy="100" r="20" fill="none" stroke="#ef4444" strokeWidth="2.5" style={{ transformOrigin: '100px 100px', animation: 'roarWaveExpand 1.1s ease-out infinite 0.1s' }} />
                <circle cx="100" cy="100" r="20" fill="none" stroke="#c084fc" strokeWidth="1.5" style={{ transformOrigin: '100px 100px', animation: 'roarWaveExpand 1.1s ease-out infinite 0.4s' }} />
              </svg>
            </div>
          )}

          {isBossShadow && (
            <div style={{
              position: 'absolute',
              width: '240px',
              height: '240px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              pointerEvents: 'none',
              zIndex: 5,
            }}>
              {/* 锁链 1 (右上方射向左下方，较粗，主攻) */}
              <img
                src="/boss_shadow_chain.png"
                alt="夺魄锁链 1"
                style={{
                  position: 'absolute',
                  width: '250px',
                  height: '250px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 15px rgba(162, 28, 175, 0.95))',
                  animation: 'chainShootImg1 1.1s cubic-bezier(0.1, 0.8, 0.2, 1) forwards',
                  zIndex: 3,
                }}
              />
              {/* 锁链 2 (右侧平射且略微延迟，较小) */}
              <img
                src="/boss_shadow_chain.png"
                alt="夺魄锁链 2"
                style={{
                  position: 'absolute',
                  width: '180px',
                  height: '180px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 10px rgba(162, 28, 175, 0.85))',
                  animation: 'chainShootImg2 1.1s cubic-bezier(0.1, 0.8, 0.2, 1) forwards 0.1s',
                  zIndex: 2,
                }}
              />
              {/* 锁链 3 (右下方射向左上方且延迟较长) */}
              <img
                src="/boss_shadow_chain.png"
                alt="夺魄锁链 3"
                style={{
                  position: 'absolute',
                  width: '210px',
                  height: '210px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 10px rgba(162, 28, 175, 0.85))',
                  animation: 'chainShootImg3 1.1s cubic-bezier(0.1, 0.8, 0.2, 1) forwards 0.2s',
                  zIndex: 1,
                }}
              />
              {/* 夺魄吸收粒子回流 (SVG 辅助叠加) */}
              <svg
                width="240"
                height="240"
                viewBox="0 0 200 200"
                style={{ position: 'absolute', pointerEvents: 'none', overflow: 'visible', zIndex: 4 }}
              >
                <circle cx="100" cy="80" r="5" fill="#ff2d55" filter="drop-shadow(0 0 8px #ff2d55)" style={{ animation: 'soulDrainBack 0.8s ease-in-out infinite 0.3s' }} />
                <circle cx="110" cy="120" r="4" fill="#ef4444" filter="drop-shadow(0 0 6px #ef4444)" style={{ animation: 'soulDrainBack 0.8s ease-in-out infinite 0.45s' }} />
                <circle cx="90" cy="60" r="4.5" fill="#ffffff" filter="drop-shadow(0 0 5px #ff453a)" style={{ animation: 'soulDrainBack 0.8s ease-in-out infinite 0.6s' }} />
              </svg>
            </div>
          )}

          {isBossRoar && (
            <div style={{
              position: 'absolute',
              width: '240px',
              height: '240px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              pointerEvents: 'none',
              zIndex: 5,
            }}>
              {/* PNG 魔啸骷髅 */}
              <img
                src="/boss_roar_skull.png"
                alt="魔灵啸吼"
                style={{
                  width: '220px',
                  height: '220px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 18px rgba(192, 132, 252, 0.95))',
                  animation: 'skullScream 1.1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                  zIndex: 2,
                }}
              />
              {/* 震波扩散圈圈 (多层复合颜色，更有力量感) */}
              <svg
                width="240"
                height="240"
                viewBox="0 0 200 200"
                style={{ position: 'absolute', pointerEvents: 'none', overflow: 'visible', zIndex: 1 }}
              >
                <circle cx="100" cy="100" r="20" fill="none" stroke="#ef4444" strokeWidth="4" style={{ transformOrigin: '100px 100px', animation: 'roarWaveExpand 0.85s ease-out infinite 0.05s' }} />
                <circle cx="100" cy="100" r="20" fill="none" stroke="#ffd700" strokeWidth="2" style={{ transformOrigin: '100px 100px', animation: 'roarWaveExpand 0.85s ease-out infinite 0.2s' }} />
                <circle cx="100" cy="100" r="20" fill="none" stroke="#c084fc" strokeWidth="3" style={{ transformOrigin: '100px 100px', animation: 'roarWaveExpand 0.85s ease-out infinite 0.35s' }} />
                <circle cx="100" cy="100" r="20" fill="none" stroke="#ffffff" strokeWidth="1.2" style={{ transformOrigin: '100px 100px', animation: 'roarWaveExpand 0.85s ease-out infinite 0.55s' }} />
              </svg>
            </div>
          )}

          {isBossExtinction && (
            <div style={{
              position: 'absolute',
              width: '240px',
              height: '240px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              pointerEvents: 'none',
              zIndex: 5,
            }}>
              {/* PNG 寂灭神枪 */}
              <img
                src="/boss_extinction_spear.png"
                alt="寂灭古枪"
                style={{
                  width: '280px',
                  height: '280px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 25px #ff2d55)',
                  animation: 'spearFall 1.2s cubic-bezier(0.15, 0.85, 0.35, 1) forwards',
                  zIndex: 2,
                }}
              />
              {/* 落地大范围爆炸闪光 */}
              <div style={{
                position: 'absolute',
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #ffffff 0%, rgba(239, 68, 68, 0.85) 45%, rgba(162, 28, 175, 0.5) 70%, transparent 90%)',
                pointerEvents: 'none',
                zIndex: 3,
                animation: 'hitFlash 1.2s cubic-bezier(0.1, 0.8, 0.3, 1) forwards',
              }} />
              {/* 雷霆电光爆裂闪烁 (SVG 辅助叠加) */}
              <svg
                width="240"
                height="240"
                viewBox="0 0 200 200"
                style={{ position: 'absolute', pointerEvents: 'none', overflow: 'visible', zIndex: 1 }}
              >
                <polyline
                  points="80,-50 60,-10 90,30 70,80 110,130 90,190"
                  fill="none"
                  stroke="#c084fc"
                  strokeWidth="2.5"
                  opacity="0.85"
                  style={{ animation: 'thunderBoltFlash 0.3s steps(2) infinite' }}
                />
                <polyline
                  points="120,-30 140,20 110,70 130,120 95,170 115,220"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  opacity="0.85"
                  style={{ animation: 'thunderBoltFlash 0.3s steps(2) infinite 0.08s' }}
                />
                <circle cx="100" cy="220" r="10" fill="none" stroke="#ffffff" strokeWidth="4" style={{ transformOrigin: '100px 220px', animation: 'roarWaveExpand 0.75s ease-out infinite 0.2s' }} />
                <circle cx="100" cy="220" r="15" fill="none" stroke="#ff2d55" strokeWidth="2.5" style={{ transformOrigin: '100px 220px', animation: 'roarWaveExpand 0.75s ease-out infinite 0.35s' }} />
              </svg>
            </div>
          )}
        </>
      )}

      {/* 2. 命中时的狂暴内力撕裂与穿透流光 (无阵法) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        animation: hasProjectile ? 'slashFade 0.4s ease-out forwards 0.58s' : 'none',
        opacity: hasProjectile ? 0 : 1,
        zIndex: 4,
      }}>
        {/* 巨大写意晕染暗黑水墨 */}
        <div style={{
          position: 'absolute',
          width: '280px',
          height: '280px',
          background: 'radial-gradient(circle, rgba(10, 5, 5, 0.95) 0%, rgba(10, 5, 5, 0.35) 60%, transparent 85%)',
          borderRadius: '50%',
          filter: 'blur(10px)',
          animation: hasProjectile ? 'inkWashGrand 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.58s' : 'inkWashGrand 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          zIndex: 1,
        }} />

        {/* 写意经脉震碎不规则裂纹 (代替几何圆环) */}
        <svg width="240" height="240" viewBox="0 0 200 200" style={{
          position: 'absolute',
          zIndex: 2,
          overflow: 'visible',
        }}>
          <path
            d="M 100 100 Q 120 70 160 50 M 100 100 Q 75 80 50 60 M 100 100 Q 80 130 60 160 M 100 100 Q 130 120 170 150"
            fill="none"
            stroke={color}
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.85"
            style={{
              animation: hasProjectile ? 'inkSplashIrregular 0.55s ease-out forwards 0.58s' : 'inkSplashIrregular 0.55s ease-out forwards',
            }}
          />
          <path
            d="M 100 100 Q 140 90 180 80 M 100 100 Q 60 110 20 120"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.75"
            style={{
              animation: hasProjectile ? 'inkSplashIrregular 0.45s ease-out forwards 0.6s' : 'inkSplashIrregular 0.45s ease-out forwards',
            }}
          />
        </svg>

        {/* 耀眼的穿透本命烈日气流光柱 */}
        <svg width="320" height="320" viewBox="0 0 300 300" style={{ position: 'absolute', zIndex: 3, overflow: 'visible' }}>
          <defs>
            <linearGradient id="ultSlashGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor={color} stopOpacity="0.95" />
              <stop offset="70%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ultSlashGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor={color} stopOpacity="0.95" />
              <stop offset="70%" stopColor="#0a0a14" stopOpacity="0.8" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ultSlashGrad3" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="transparent" stopOpacity="0" />
              <stop offset="30%" stopColor="#ffffff" />
              <stop offset="50%" stopColor={color} stopOpacity="1" />
              <stop offset="70%" stopColor="#0d0d1a" stopOpacity="0.9" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* 斩击 1: 左上到右下 */}
          <path
            d="M 40,40 Q 150,150 260,260"
            fill="none"
            stroke="url(#ultSlashGrad1)"
            strokeWidth={10 + intensity * 2}
            strokeLinecap="round"
            style={{
              strokeDasharray: 400,
              strokeDashoffset: 400,
              animation: 'drawAndFadeSlash 0.5s cubic-bezier(0.15, 0.85, 0.3, 1) forwards',
              animationDelay: hasProjectile ? '0.58s' : '0s',
            }}
          />

          {/* 斩击 2: 右上到左下 */}
          <path
            d="M 260,40 Q 150,150 40,260"
            fill="none"
            stroke="url(#ultSlashGrad2)"
            strokeWidth={8 + intensity * 2}
            strokeLinecap="round"
            style={{
              strokeDasharray: 400,
              strokeDashoffset: 400,
              animation: 'drawAndFadeSlash 0.5s cubic-bezier(0.15, 0.85, 0.3, 1) forwards',
              animationDelay: hasProjectile ? '0.68s' : '100ms',
            }}
          />

          {/* 斩击 3: 水平横切 */}
          <path
            d="M 20,150 Q 150,190 280,150"
            fill="none"
            stroke="url(#ultSlashGrad3)"
            strokeWidth={6 + intensity * 2}
            strokeLinecap="round"
            style={{
              strokeDasharray: 400,
              strokeDashoffset: 400,
              animation: 'drawAndFadeSlash 0.45s cubic-bezier(0.15, 0.85, 0.3, 1) forwards',
              animationDelay: hasProjectile ? '0.74s' : '160ms',
            }}
          />

          {/* 斩击 4: 重锤直劈 */}
          <path
            d="M 150,20 Q 130,150 150,280"
            fill="none"
            stroke="#ffffff"
            strokeWidth={12 + intensity * 3}
            strokeLinecap="round"
            style={{
              strokeDasharray: 400,
              strokeDashoffset: 400,
              filter: `drop-shadow(0 0 12px ${color})`,
              animation: 'drawAndFadeSlash 0.45s cubic-bezier(0.15, 0.85, 0.3, 1) forwards',
              animationDelay: hasProjectile ? '0.82s' : '240ms',
            }}
          />

          {/* 写意墨汁大水滴爆裂飞射 */}
          <circle cx="150" cy="150" r="7.5" fill="#0d0d1a" style={{ transformOrigin: '150px 150px', animation: hasProjectile ? 'inkDropFlyNW 0.6s ease-out forwards 0.63s' : 'inkDropFlyNW 0.6s ease-out forwards 0.05s' }} />
          <circle cx="150" cy="150" r="5.5" fill={color} style={{ transformOrigin: '150px 150px', animation: hasProjectile ? 'inkDropFlyNE 0.55s ease-out forwards 0.58s' : 'inkDropFlyNE 0.55s ease-out forwards' }} />
          <circle cx="150" cy="150" r="6.5" fill="#0d0d1a" style={{ transformOrigin: '150px 150px', animation: hasProjectile ? 'inkDropFlySW 0.58s ease-out forwards 0.68s' : 'inkDropFlySW 0.58s ease-out forwards 0.1s' }} />
          <circle cx="150" cy="150" r="8.5" fill="#ffffff" style={{ transformOrigin: '150px 150px', animation: hasProjectile ? 'inkDropFlySE 0.62s ease-out forwards 0.6s' : 'inkDropFlySE 0.62s ease-out forwards 0.02s' }} />
        </svg>
      </div>

      {/* 3. 巨幅狂草汉字震裂印章 */}
      <div
        style={{
          position: 'absolute',
          fontFamily: '"Zhi Mang Xing", "Ma Shan Zheng", cursive',
          fontSize: '8.8rem',
          fontWeight: '900',
          color: color,
          textShadow: `0 0 20px #000, 0 0 35px ${color}, 0 0 50px ${color}`,
          animation: `textShatterZoom 0.68s cubic-bezier(0.15, 0.85, 0.3, 1) both`,
          animationDelay: hasProjectile ? '580ms' : '0ms',
          pointerEvents: 'none',
          zIndex: 130,
          opacity: 0,
        }}
      >
        {hitChar}
      </div>
    </div>
  );
};

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
          animationName: 'dodgeFade',
          animationDuration: '0.5s',
          animationTimingFunction: 'ease-out',
          animationFillMode: 'forwards',
          animationDelay: `${i * 0.1}s`,
        }}
      />
    ))}

    {/* 闪避文字 */}
    <div className="combat-text-dodge">
      【闪避】
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
          animationName: 'healFloat',
          animationDuration: `${0.5 + Math.random() * 0.3}s`,
          animationTimingFunction: 'ease-out',
          animationFillMode: 'forwards',
          animationDelay: `${i * 0.1}s`,
        }}
      />
    ))}
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
          animationName: 'buffRise',
          animationDuration: '0.5s',
          animationTimingFunction: 'ease-out',
          animationFillMode: 'forwards',
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
          animationName: 'debuffFall',
          animationDuration: '0.5s',
          animationTimingFunction: 'ease-out',
          animationFillMode: 'forwards',
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
          animationName: 'reviveRay',
          animationDuration: '0.8s',
          animationTimingFunction: 'ease-out',
          animationFillMode: 'forwards',
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
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
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
            animationName: 'inkSplash',
            animationDuration: '0.4s',
            animationTimingFunction: 'ease-out',
            animationFillMode: 'forwards',
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </svg>
  </div>
);

// ========== 中毒效果 ==========
const PoisonEffect = () => (
  <div className="poison-effect" style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', transform: 'translate(-30px, 45px)', pointerEvents: 'none' }}>
    {/* 墨紫色毒气扩散 - 减弱荧光，增强暗黑水墨质感 */}
    <div
      style={{
        position: 'absolute',
        width: 100,
        height: 100,
        background: 'radial-gradient(circle, rgba(20, 10, 30, 0.8) 0%, rgba(88, 28, 135, 0.2) 60%, transparent 80%)',
        borderRadius: '50%',
        filter: 'blur(8px)',
        animation: 'inkWashSpread 1.5s ease-out infinite',
      }}
    />
  </div>
);

// ========== 眩晕效果 ==========
const StunEffect = () => (
  <div className="stun-effect" style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', transform: 'translateY(-65px)', pointerEvents: 'none' }}>
    {/* 头部的写意太极盘旋光环 - 减弱亮度 */}
    <svg
      width="90"
      height="90"
      viewBox="0 0 100 100"
      style={{
        position: 'absolute',
        animation: 'chargeRotateCW 1.8s linear infinite',
      }}
    >
      <circle cx="50" cy="50" r="30" fill="none" stroke="#78350f" strokeWidth="1.5" strokeDasharray="8 12" opacity="0.6" />
      <circle cx="50" cy="50" r="24" fill="none" stroke="#5f5f5f" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
    </svg>

    {/* 环绕墨点 - 移除荧光阴影 */}
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          width: 6,
          height: 6,
          background: '#d4af37',
          borderRadius: '50%',
          border: '1px solid #78350f',
          animationName: 'stunStar',
          animationDuration: '1.2s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: `${i * 0.3}s`,
          transform: `rotate(${i * 90}deg) translateY(-20px)`,
        }}
      />
    ))}
  </div>
);

// ========== 内伤效果 ==========
const InternalWoundEffect = () => (
  <div className="internal-wound" style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', transform: 'translate(30px, 45px)', pointerEvents: 'none' }}>
    {/* 经脉重创，殷红写意墨迹爆开 */}
    <svg width="110" height="110" viewBox="0 0 150 150" style={{ position: 'absolute' }}>
      <defs>
        <radialGradient id="woundInk" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(127, 29, 29, 0.95)" />
          <stop offset="60%" stopColor="rgba(20, 5, 5, 0.4)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      {/* 中心血损 */}
      <circle
        cx="75"
        cy="75"
        r="12"
        fill="url(#woundInk)"
        style={{
          transformOrigin: '75px 75px',
          animation: 'inkExpand 0.7s ease-out forwards',
        }}
      />

      {/* 飞溅血墨 */}
      {[...Array(6)].map((_, i) => {
        const angle = (i * 60 * Math.PI) / 180;
        const sx = 75 + Math.cos(angle) * 12;
        const sy = 75 + Math.sin(angle) * 12;
        const tx = Math.cos(angle) * 35;
        const ty = Math.sin(angle) * 35;
        return (
          <circle
            key={i}
            cx={sx}
            cy={sy}
            r={2.5 + Math.random() * 2}
            fill="#7f1d1d"
            opacity="0.85"
            style={{
              transformOrigin: '75px 75px',
              animation: `inkSplash 0.5s ease-out forwards`,
              '--splash-x': `${tx}px`,
              '--splash-y': `${ty}px`,
            }}
          />
        );
      })}
    </svg>
  </div>
);

// ========== 伤害飘字组件 ==========
export const DamageFloatNumber = ({ damage, type = 'damage', isHeal, position = { x: 0, y: 0 }, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 1200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const finalType = isHeal ? 'heal' : type;

  const classNames = {
    damage: 'combat-text-damage',
    heal: 'combat-text-heal',
    critical: 'combat-text-critical',
    poison: 'combat-text-debuff',
    buff: 'combat-text-buff',
    debuff: 'combat-text-debuff',
  };

  const className = classNames[finalType] || classNames.damage;

  const getDisplayContent = () => {
    if (finalType === 'heal') {
      return `【回春】+${damage}`;
    } else if (finalType === 'critical') {
      return `-${damage}`;
    } else if (finalType === 'poison') {
      return `【毒】-${damage}`;
    } else if (finalType === 'debuff') {
      return `-${damage}`;
    } else if (finalType === 'buff') {
      return `【祥】+${damage}`;
    }
    return `-${damage}`;
  };

  // Position calculation supporting both string values ('left', 'right') and coordinates object
  let leftVal = '50%';
  let topVal = '30%';

  if (typeof position === 'string') {
    if (position === 'left') {
      leftVal = '20%';
    } else if (position === 'right') {
      leftVal = '80%';
    } else {
      leftVal = '50%';
    }
  } else if (position && typeof position === 'object') {
    leftVal = position.x !== undefined ? position.x : '50%';
    topVal = position.y !== undefined ? position.y : '30%';
  }

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        left: leftVal,
        top: topVal,
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        zIndex: 200,
      }}
    >
      {getDisplayContent()}
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

/* ==================== BOSS 大招专属动效 keyframes ==================== */

/* 1. 混沌魔眼 (Chaos Eye) 动效 */
@keyframes eyeBlinkOpen {
  0% {
    transform: scale(0.1) rotate(-45deg);
    opacity: 0;
    filter: blur(10px) drop-shadow(0 0 5px rgba(162, 28, 175, 0.3));
  }
  15% {
    transform: scale(1.2) rotate(15deg);
    opacity: 1;
    filter: blur(0px) drop-shadow(0 0 25px rgba(162, 28, 175, 0.95));
  }
  25% {
    transform: scale(0.95) rotate(-5deg);
    opacity: 1;
    filter: drop-shadow(0 0 30px rgba(239, 68, 68, 0.85));
  }
  35% {
    transform: scale(1.1) rotate(5deg) translateY(-8px);
    opacity: 1;
  }
  50% {
    transform: scale(1) rotate(0deg) translateY(0px);
    opacity: 1;
    filter: drop-shadow(0 0 35px rgba(162, 28, 175, 0.95));
  }
  80% {
    transform: scale(1.05) rotate(5deg);
    opacity: 0.95;
  }
  100% {
    transform: scale(0.1) rotate(-90deg);
    opacity: 0;
    filter: blur(8px) drop-shadow(0 0 5px rgba(162, 28, 175, 0.3));
  }
}

@keyframes magicCircleRotate {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  15% {
    transform: scale(1.3) rotate(90deg);
    opacity: 0.8;
  }
  50% {
    transform: scale(1) rotate(270deg);
    opacity: 0.95;
  }
  80% {
    transform: scale(1.1) rotate(450deg);
    opacity: 0.7;
  }
  100% {
    transform: scale(0) rotate(720deg);
    opacity: 0;
  }
}

/* 2. 邪煞夺魄 (Shadow Chain) 锁链从右上/右侧飞入缠绕 */
@keyframes chainShootImg1 {
  0% {
    transform: translate(320px, -240px) rotate(60deg) scale(0.2);
    opacity: 0;
  }
  18% {
    transform: translate(-10px, 15px) rotate(-15deg) scale(1.1);
    opacity: 1;
  }
  28% {
    transform: translate(0, 0) rotate(-10deg) scale(1);
    opacity: 1;
  }
  45% {
    transform: translate(-5px, 5px) rotate(-8deg) scale(1.02);
    opacity: 1;
  }
  80% {
    transform: translate(0, 0) rotate(-12deg) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-250px, 180px) rotate(-30deg) scale(0.6);
    opacity: 0;
  }
}

@keyframes chainShootImg2 {
  0% {
    transform: translate(320px, 0px) rotate(0deg) scale(0.2);
    opacity: 0;
  }
  18% {
    transform: translate(-20px, 0px) rotate(8deg) scale(1.1);
    opacity: 1;
  }
  28% {
    transform: translate(0, 0) rotate(0deg) scale(1);
    opacity: 1;
  }
  45% {
    transform: translate(-8px, 0px) rotate(4deg) scale(1.02);
    opacity: 1;
  }
  80% {
    transform: translate(0, 0) rotate(2deg) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-300px, 0px) rotate(-10deg) scale(0.5);
    opacity: 0;
  }
}

@keyframes chainShootImg3 {
  0% {
    transform: translate(320px, 240px) rotate(-60deg) scale(0.2);
    opacity: 0;
  }
  18% {
    transform: translate(-10px, -15px) rotate(15deg) scale(1.1);
    opacity: 1;
  }
  28% {
    transform: translate(0, 0) rotate(10deg) scale(1);
    opacity: 1;
  }
  45% {
    transform: translate(-5px, -5px) rotate(8deg) scale(1.02);
    opacity: 1;
  }
  80% {
    transform: translate(0, 0) rotate(12deg) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-250px, -180px) rotate(30deg) scale(0.6);
    opacity: 0;
  }
}

@keyframes soulDrainBack {
  0% {
    transform: translate(0, 0) scale(1.5);
    opacity: 0;
  }
  15% {
    opacity: 0.9;
  }
  80% {
    transform: translate(160px, -40px) scale(0.6);
    opacity: 0.8;
  }
  100% {
    transform: translate(260px, -80px) scale(0.1);
    opacity: 0;
  }
}

/* 3. 太古魔啸 (Roar Skull) 动效 */
@keyframes skullScream {
  0% {
    transform: scale(0.1) rotate(0deg);
    opacity: 0;
    filter: blur(8px) brightness(0.5) drop-shadow(0 0 5px #c084fc);
  }
  18% {
    transform: scale(1.3) rotate(-12deg);
    opacity: 1;
    filter: blur(0px) brightness(1.5) drop-shadow(0 0 25px #c084fc);
  }
  30% {
    transform: scale(1.1) rotate(8deg) translateY(-8px);
    opacity: 1;
  }
  42% {
    transform: scale(1.25) rotate(-6deg) translateY(4px);
    opacity: 1;
  }
  55% {
    transform: scale(1.15) rotate(4deg) translateY(-4px);
    opacity: 1;
    filter: brightness(1.3) drop-shadow(0 0 30px #ef4444);
  }
  80% {
    transform: scale(1.1) rotate(0deg);
    opacity: 0.95;
  }
  100% {
    transform: scale(0.2) translateY(-80px);
    opacity: 0;
    filter: blur(8px);
  }
}

@keyframes roarWaveExpand {
  0% {
    transform: scale(0.1);
    opacity: 0.95;
    stroke-width: 4;
  }
  60% {
    opacity: 0.7;
  }
  100% {
    transform: scale(3.2);
    opacity: 0;
    stroke-width: 0.8;
  }
}

/* 4. 诸神寂灭 (Extinction Spear) 灭世神枪动效 */
@keyframes spearFall {
  0% {
    transform: translate(280px, -380px) rotate(-60deg) scale(0.3);
    opacity: 0;
    filter: brightness(2) drop-shadow(0 0 10px #ff2d55);
  }
  14% {
    transform: translate(0px, 0px) rotate(-45deg) scale(1.12);
    opacity: 1;
    filter: brightness(1.8) drop-shadow(0 0 35px #ffff00);
  }
  18% {
    transform: translate(-6px, 6px) rotate(-47deg) scale(1.05);
    opacity: 1;
  }
  24% {
    transform: translate(4px, -4px) rotate(-43deg) scale(1.02);
    opacity: 1;
  }
  30% {
    transform: translate(0, 0) rotate(-45deg) scale(1);
    opacity: 1;
    filter: brightness(1.2) drop-shadow(0 0 20px #ff2d55);
  }
  80% {
    transform: translate(0, 0) rotate(-45deg) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-100px, 100px) rotate(-45deg) scale(0.2);
    opacity: 0;
    filter: blur(10px);
  }
}

@keyframes hitFlash {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  13% {
    transform: scale(0);
    opacity: 0;
  }
  15% {
    transform: scale(0.1);
    opacity: 1;
    filter: brightness(2.5);
  }
  35% {
    transform: scale(1.9);
    opacity: 0.95;
  }
  75% {
    transform: scale(2.4);
    opacity: 0.3;
  }
  100% {
    transform: scale(2.6);
    opacity: 0;
  }
}

@keyframes thunderBoltFlash {
  0%, 100% {
    opacity: 0.15;
    filter: brightness(0.8);
  }
  50% {
    opacity: 1;
    filter: brightness(1.6) drop-shadow(0 0 12px #c084fc);
  }
}
`;

// ========== 功法招式色彩主题配置库 ==========
const getSkillColorConfig = (skillName, skillId) => {
  const name = skillName || '';
  const id = skillId || '';
  if (
    name.includes('魔罗') || name.includes('邪煞') || name.includes('诸神') || name.includes('魔啸') ||
    id.startsWith('boss_')
  ) {
    // 太古魔煞 - 幽紫深红邪光 (Dark Evil Purple/Crimson)
    return {
      color: '#c084fc', // 幽紫
      textShadow: '3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 4px 4px 0 #000, 0 0 20px rgba(162, 28, 175, 0.95)',
      glow: 'rgba(162, 28, 175, 0.55)',
      theme: 'evil'
    };
  }
  if (
    name.includes('易筋经') || name.includes('圣心诀') || name.includes('神行百变') ||
    id === 's_yijin' || id === 's_shengxin' || id === 's_shenxing'
  ) {
    // 纯白圣洁 / 佛光净化 (Divine White)
    return {
      color: '#ffffff',
      textShadow: '3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 4px 4px 0 #000, 0 0 15px rgba(255, 255, 255, 0.95)',
      glow: 'rgba(255, 255, 255, 0.45)',
      theme: 'divine'
    };
  }
  if (name.includes('毒') || id === 's_du') {
    // 幽毒荧绿 / 剧毒冲击 (Poison Green)
    return {
      color: '#32d74b',
      textShadow: '3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 4px 4px 0 #000, 0 0 15px rgba(50, 215, 75, 0.95)',
      glow: 'rgba(50, 215, 75, 0.35)',
      theme: 'poison'
    };
  }
  if (
    name.includes('吸星') || name.includes('葵花宝典') || name.includes('点穴') ||
    name.includes('六脉') || name.includes('九阳') || name.includes('销魂掌') ||
    id === 's_xixing' || id === 's_kuihua' || id === 's_dianxue' ||
    id === 's_liumai' || id === 's5' || id === 's_anran'
  ) {
    // 妖娆魅粉 / 烈能激荡 (Hot Pink/Magenta)
    return {
      color: '#ff2d55',
      textShadow: '3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 4px 4px 0 #000, 0 0 15px rgba(255, 45, 85, 0.95)',
      glow: 'rgba(255, 45, 85, 0.35)',
      theme: 'dark'
    };
  }
  if (
    name.includes('凌波') || name.includes('梯云') || name.includes('吐纳') ||
    id === 's4' || id === 's_tiyun' || id === 's2'
  ) {
    // 灵风幽蓝 / 迅捷雷电 (Wind/Storm Cyan)
    return {
      color: '#64d2ff',
      textShadow: '3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 4px 4px 0 #000, 0 0 15px rgba(100, 210, 255, 0.95)',
      glow: 'rgba(100, 210, 255, 0.35)',
      theme: 'wind'
    };
  }
  // 默认：烈火狂风橙红 (Furious Flame Red)
  return {
    color: '#ff453a',
    textShadow: '3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 4px 4px 0 #000, 0 0 15px rgba(255, 69, 58, 0.95)',
    glow: 'rgba(255, 69, 58, 0.45)',
    theme: 'flame'
  };
};

// ========== 呐喊飞出随机六向偏移配置 ==========
const SHOUT_DIRECTIONS = [
  { name: 'topLeft', top: '-55px', offsetSide: '-40px', origin: 'bottom right' },
  { name: 'topRight', top: '-55px', offsetSide: '105px', origin: 'bottom left' },
  { name: 'outerLeft', top: '25px', offsetSide: '-115px', origin: 'right center' },
  { name: 'outerRight', top: '25px', offsetSide: '135px', origin: 'left center' },
  { name: 'bottomLeft', top: '130px', offsetSide: '-40px', origin: 'top right' },
  { name: 'bottomRight', top: '130px', offsetSide: '105px', origin: 'top left' }
];

// ========== 局部水墨真气爆发背景 ==========
const InkQiBurst = ({ colorConfig }) => {
  const isDivine = colorConfig.theme === 'divine';
  const strokeColor = isDivine ? '#ffffff' : colorConfig.color;
  return (
    <svg
      viewBox="0 0 200 160"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <defs>
        <radialGradient id="inkQiGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={colorConfig.glow} />
          <stop offset="60%" stopColor="rgba(10, 5, 5, 0.15)" />
          <stop offset="100%" stopColor="rgba(10, 5, 5, 0)" />
        </radialGradient>
      </defs>

      {/* 1. 内力真气涟漪环扩散 */}
      <circle
        cx="100"
        cy="80"
        r="48"
        fill="none"
        stroke={strokeColor}
        strokeWidth="3"
        style={{
          transformOrigin: '100px 80px',
          animation: 'qiRingExpand 0.45s cubic-bezier(0.1, 0.8, 0.3, 1) forwards',
        }}
      />
      <circle
        cx="100"
        cy="80"
        r="32"
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        opacity="0.8"
        style={{
          transformOrigin: '100px 80px',
          animation: 'qiRingExpand 0.38s cubic-bezier(0.1, 0.8, 0.3, 1) forwards 0.05s',
        }}
      />

      {/* 2. 写意水墨晕开扩散 */}
      <circle
        cx="100"
        cy="80"
        r="50"
        fill="#0d0d1a"
        style={{
          transformOrigin: '100px 80px',
          animation: 'inkWashSpread 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      />
      <circle
        cx="105"
        cy="75"
        r="35"
        fill="url(#inkQiGrad)"
        style={{
          transformOrigin: '100px 80px',
          animation: 'inkWashSpread 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.05s',
        }}
      />

      {/* 3. 写意水墨滴飞洒 (飞散至四角) */}
      <circle cx="100" cy="80" r="4.5" fill="#0d0d1a" style={{ transformOrigin: '100px 80px', animation: 'inkDropFlyNW 0.4s ease-out forwards' }} />
      <circle cx="100" cy="80" r="3.5" fill={colorConfig.color} style={{ transformOrigin: '100px 80px', animation: 'inkDropFlyNE 0.38s ease-out forwards 0.02s' }} />
      <circle cx="100" cy="80" r="4.0" fill="#0d0d1a" style={{ transformOrigin: '100px 80px', animation: 'inkDropFlySW 0.4s ease-out forwards 0.01s' }} />
      <circle cx="100" cy="80" r="5.0" fill={isDivine ? '#d4af37' : colorConfig.color} style={{ transformOrigin: '100px 80px', animation: 'inkDropFlySE 0.42s ease-out forwards 0.03s' }} />
    </svg>
  );
};

// ========== 伏羲八卦大招蓄力背景阵法 ==========
const UltimateChargingArray = ({ colorConfig }) => {
  const isDivine = colorConfig.theme === 'divine';
  const strokeColor = isDivine ? '#ffffff' : colorConfig.color;
  const glowColor = colorConfig.glow || strokeColor;

  const trigrams = [
    { sym: '☰', name: '乾', angle: 0 },
    { sym: '☱', name: '兑', angle: 45 },
    { sym: '☲', name: '离', angle: 90 },
    { sym: '☳', name: '震', angle: 135 },
    { sym: '☴', name: '巽', angle: 180 },
    { sym: '☵', name: '坎', angle: 225 },
    { sym: '☶', name: '艮', angle: 270 },
    { sym: '☷', name: '坤', angle: 315 }
  ];

  const gatherAngles = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <svg
      width="300"
      height="300"
      viewBox="0 0 200 200"
      style={{
        position: 'absolute',
        top: '-60px',
        left: '-85px',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'visible',
      }}
    >
      <defs>
        <radialGradient id="chargeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glowColor} stopOpacity="0.45" />
          <stop offset="70%" stopColor="rgba(13, 13, 26, 0.2)" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 1. 中心蓄力光晕 */}
      <circle cx="100" cy="100" r="70" fill="url(#chargeGlow)" style={{ transformOrigin: '100px 100px', animation: 'inkWashSpread 1s cubic-bezier(0.16, 1, 0.3, 1) forwards' }} />

      {/* 2. 顺时针旋转太极图 */}
      <g style={{ transformOrigin: '100px 100px', animation: 'chargeRotateCW 0.9s cubic-bezier(0.1, 0.8, 0.2, 1) forwards' }}>
        <path d="M 100,60 A 40,40 0 0,0 100,140 A 20,20 0 0,0 100,100 A 20,20 0 0,1 100,60" fill="#0d0d1a" opacity="0.8" />
        <path d="M 100,140 A 40,40 0 0,0 100,60 A 20,20 0 0,0 100,100 A 20,20 0 0,1 100,140" fill={strokeColor} opacity="0.45" />
        <circle cx="100" cy="80" r="4.5" fill={strokeColor} opacity="0.75" />
        <circle cx="100" cy="120" r="4.5" fill="#0d0d1a" />
      </g>

      {/* 3. 逆时针旋转八卦爻轮 */}
      <g style={{ transformOrigin: '100px 100px', animation: 'chargeRotateCCW 1.1s cubic-bezier(0.1, 0.8, 0.2, 1) forwards' }}>
        {/* 细双爻线圈 */}
        <circle cx="100" cy="100" r="76" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="30 15" opacity="0.45" />
        <circle cx="100" cy="100" r="82" fill="none" stroke={strokeColor} strokeWidth="0.75" strokeDasharray="6 12" opacity="0.3" />

        {/* 八卦爻象与对应古字 */}
        {trigrams.map((tg, idx) => {
          const rad = (tg.angle * Math.PI) / 180;
          const tx = 100 + 64 * Math.cos(rad);
          const ty = 100 + 64 * Math.sin(rad);
          return (
            <g key={idx} transform={`translate(${tx}, ${ty}) rotate(${tg.angle + 90})`}>
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                fill={strokeColor}
                style={{
                  fontFamily: '"Ma Shan Zheng", cursive',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textShadow: `0 0 4px ${strokeColor}`,
                  opacity: 0.85,
                }}
              >
                {tg.sym} {tg.name}
              </text>
            </g>
          );
        })}
      </g>

      {/* 4. 向内吸附的蓄力能量线 */}
      {gatherAngles.map((ang, idx) => {
        const rad = (ang * Math.PI) / 180;
        const x1 = 100 + 96 * Math.cos(rad);
        const y1 = 100 + 96 * Math.sin(rad);
        const x2 = 100 + 35 * Math.cos(rad);
        const y2 = 100 + 35 * Math.sin(rad);
        return (
          <line
            key={idx}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
            style={{
              animation: `energyGather 0.75s cubic-bezier(0.1, 0.8, 0.2, 1) infinite`,
              animationDelay: `${idx * 80}ms`,
            }}
          />
        );
      })}
    </svg>
  );
};

// ========== 漫画大招单字爆裂特写组件 ==========
export function MangaSkillPop({ characterName, skillName, skillId, skillDesc, position = 'left', onComplete }) {
  const characters = skillName ? skillName.split('') : [];
  const [showDesc, setShowDesc] = useState(false);
  const [exiting, setExiting] = useState(false);
  const sideKey = position === 'left' ? 'left' : 'right';

  // 极速时间配置 (加速近一倍，即出即收)
  const charDelay = 45; // 每个汉字出现的间隔 (45ms)
  const descDelay = characters.length * charDelay + 20; // 大字出完后描述延迟 (如 200ms)
  const outroDelay = descDelay + 400; // 效果展示时长 (400ms)
  const totalDuration = outroDelay + 150; // 退出总时间 (共计约 750ms)

  // 1. 根据技能名/ID配置色彩映射 (实体填充防止黑字，高对比个性撞色)
  const colorConfig = useMemo(() => getSkillColorConfig(skillName, skillId), [skillName, skillId]);

  // 判断是否为绝学大招
  const isUltimate = useMemo(() => {
    const skill = SKILLS_DB.find(s => s.id === skillId || s.name === skillName);
    return skill?.type === 'ultimate';
  }, [skillId, skillName]);

  // 2. 随机呐喊飞出偏移方位
  const randomDir = useMemo(() => {
    const isLeftAlign = position === 'left';
    // 限制左侧卡牌往右飞，右侧卡牌往左飞，确保文字不超出边界
    const directions = isLeftAlign ? [
      { name: 'topCenter', top: '-60px', offsetSide: '25px', origin: 'bottom center' },
      { name: 'topRight', top: '-55px', offsetSide: '105px', origin: 'bottom left' },
      { name: 'outerRight', top: '25px', offsetSide: '135px', origin: 'left center' },
      { name: 'bottomRight', top: '130px', offsetSide: '105px', origin: 'top left' },
      { name: 'bottomCenter', top: '135px', offsetSide: '25px', origin: 'top center' }
    ] : [
      { name: 'topCenter', top: '-60px', offsetSide: '25px', origin: 'bottom center' },
      { name: 'topLeft', top: '-55px', offsetSide: '105px', origin: 'bottom right' },
      { name: 'outerLeft', top: '25px', offsetSide: '135px', origin: 'right center' },
      { name: 'bottomLeft', top: '105px', offsetSide: '105px', origin: 'top right' },
      { name: 'bottomCenter', top: '135px', offsetSide: '25px', origin: 'top center' }
    ];
    return directions[Math.floor(Math.random() * directions.length)];
  }, [position, skillName]);

  useEffect(() => {
    const descTimer = setTimeout(() => {
      setShowDesc(true);
    }, descDelay);

    const outroTimer = setTimeout(() => {
      setExiting(true);
    }, outroDelay);

    const endTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, totalDuration);

    return () => {
      clearTimeout(descTimer);
      clearTimeout(outroTimer);
      clearTimeout(endTimer);
    };
  }, [characters.length, onComplete]);

  return (
    <div
      style={{
        position: 'absolute',
        [sideKey]: '15px',
        top: '10px',
        width: '130px',
        height: '180px',
        zIndex: 150,
        pointerEvents: 'none',
      }}
    >
      {/* 局部卡牌正中心水墨爆发背景 */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        {isUltimate ? (
          <UltimateChargingArray colorConfig={colorConfig} />
        ) : (
          <InkQiBurst colorConfig={colorConfig} />
        )}
      </div>

      {/* 呐喊字爆层：从卡牌正中向随机方向爆裂射出 */}
      <div
        style={{
          position: 'absolute',
          top: randomDir.top,
          [sideKey]: randomDir.offsetSide,
          width: '180px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          overflow: 'visible', // 允许狂草字体向外泼墨出界，更具动感
          zIndex: 2,
          transformOrigin: randomDir.origin,
          animation: exiting
            ? 'mangaExit 0.12s ease-out forwards'
            : 'shoutOut 0.32s cubic-bezier(0.175, 0.885, 0.32, 1.15) forwards',
        }}
      >
        {/* 大招单字狂草层 */}
        <div style={{
          display: 'flex',
          gap: '3px',
          flexWrap: 'nowrap',
          justifyContent: 'center',
          padding: '0 4px',
        }}>
          {characters.map((char, index) => {
            const randRot = `${(index % 2 === 0 ? -1 : 1) * (6 + (index * 4) % 10)}deg`;
            const yOffset = `${(index === 0 || index === characters.length - 1) ? 4 : -3}px`;
            return (
              <div
                key={index}
                style={{
                  display: 'inline-block',
                  transform: `rotate(${randRot}) translateY(${yOffset})`,
                }}
              >
                <span
                  style={{
                    fontFamily: '"Zhi Mang Xing", cursive', // 升级为狂放狂草字体，极具飞白张力
                    fontSize: '2.8rem',
                    fontWeight: 'bold',
                    color: colorConfig.color,
                    textShadow: colorConfig.textShadow,
                    display: 'inline-block',
                    animationName: 'mangaWordPop',
                    animationDuration: '0.25s',
                    animationTimingFunction: 'cubic-bezier(0.18, 0.89, 0.32, 1.25)',
                    animationFillMode: 'both',
                    animationDelay: `${index * charDelay}ms`,
                    opacity: 0,
                    transformOrigin: 'center',
                  }}
                >
                  {char}
                </span>
              </div>
            );
          })}
        </div>

        {/* 招式白话效果说明 */}
        {showDesc && (
          <div
            style={{
              marginTop: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              animation: 'mangaDescFadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            <div style={{
              fontSize: '0.72rem',
              color: 'var(--gold)',
              fontFamily: '"Ma Shan Zheng", cursive',
              letterSpacing: '1px',
              marginBottom: '3px',
              background: 'rgba(0, 0, 0, 0.85)',
              padding: '1px 6px',
              borderRadius: '8px',
              border: '1px dashed rgba(212, 175, 55, 0.35)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
            }}>
              {characterName} 施展了
            </div>
            <div style={{
              fontSize: '0.68rem',
              color: '#eaeaea',
              fontFamily: 'system-ui, sans-serif',
              background: 'rgba(20, 10, 10, 0.92)',
              padding: '4px 10px',
              borderRadius: '4px',
              borderLeft: `2.5px solid ${colorConfig.color}`,
              borderRight: `2.5px solid ${colorConfig.color}`,
              boxShadow: '0 3px 8px rgba(0,0,0,0.6)',
              maxWidth: '160px',
              textAlign: 'center',
              lineHeight: '1.25',
            }}>
              {skillDesc}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ========== 物理撞击碎屑粒子效果 ==========
export function ClashParticles({ active, position = 'center', effectType = null }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!active) return;

    // 根据技能弹道飞行动效调整物理碎裂粒子的生成延迟，保证击中卡牌时爆裂
    let delay = 0;
    if (effectType === 'ultimateBurst') {
      delay = 580;
    } else if (effectType === 'fistPunch') {
      delay = 400;
    }

    const triggerParticles = () => {
      // 撞击瞬间产生15个粒子向四周散射
      const list = Array.from({ length: 15 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 80;
        const size = 3 + Math.random() * 4;
        const color = Math.random() > 0.4 ? '#d4af37' : '#dc143c'; // 金色或暗红墨汁色
        return {
          id: i,
          x: 0,
          y: 0,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed,
          size,
          color,
          opacity: 0.95,
        };
      });
      setParticles(list);

      const start = Date.now();
      let frameId;
      const animate = () => {
        const elapsed = Date.now() - start;
        const progress = elapsed / 450; // 450ms 持续时间
        if (progress >= 1) {
          setParticles([]);
          return;
        }
        setParticles(prev =>
          prev.map(p => ({
            ...p,
            x: p.dx * progress,
            y: p.dy * progress + 25 * progress * progress, // 重力抛物线
            opacity: 0.95 * (1 - progress),
          }))
        );
        frameId = requestAnimationFrame(animate);
      };
      frameId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frameId);
    };

    if (delay > 0) {
      const timer = setTimeout(triggerParticles, delay);
      return () => clearTimeout(timer);
    } else {
      return triggerParticles();
    }
  }, [active, effectType]);

  if (particles.length === 0) return null;

  // 针对左右卡牌位置精确定位撞击中心点
  let leftPos = '50%';
  if (position === 'left') leftPos = '20%';
  else if (position === 'right') leftPos = '80%';

  return (
    <div
      style={{
        position: 'absolute',
        left: leftPos,
        top: '40%',
        width: 0,
        height: 0,
        pointerEvents: 'none',
        zIndex: 110,
      }}
    >
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: '50%',
            opacity: p.opacity,
            boxShadow: `0 0 6px ${p.color}`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}
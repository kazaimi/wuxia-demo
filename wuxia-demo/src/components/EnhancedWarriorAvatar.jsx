import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TREASURES_DB } from '../store/gameState';

// 根据名字判断性别
const guessGenderByName = (name) => {
  const femaleEndings = ['月', '雪', '霜', '云', '霞', '玉', '珠', '翠', '红', '燕', '莺', '凤', '鸾', '娟', '婷', '婉', '柔', '嫣', '瑶', '薇', '蕾', '露', '涵', '晴', '雨', '烟', '琳', '瑾', '颖', '萱', '蕊', '黛', '芷', '芸', '梦', '舞', '琴', '仙', '姬', '娘', '姑', '妹', '姐', '女', '芳', '莲', '梅', '兰', '竹', '菊'];
  const lastChar = name?.slice(-1) || '';
  if (femaleEndings.includes(lastChar)) return 'female';

  const femaleKeywords = ['邀月', '灭绝', '童姥', '小龙女', '黄蓉', '赵敏', '周芷若', '王语嫣', '阿朱', '阿紫', '任盈盈', '岳灵珊', '李莫愁', '郭芙', '郭襄', '穆念慈'];
  for (const keyword of femaleKeywords) {
    if (name?.includes(keyword)) return 'female';
  }
  return 'male';
};

// 增强版战斗角色卡片 - 支持状态差分和动效
const EnhancedWarriorAvatar = ({
  player,
  isLeft,
  isAttacking = false,
  isHit = false,
  isDodging = false,
  isHealing = false,
  isBuffing = false,
  isDebuffing = false,
  isDead = false,
  damageAmount = null,
  healAmount = null,
  onEffectComplete,
}) => {
  const [effectState, setEffectState] = useState('idle');
  const [showDamage, setShowDamage] = useState(false);
  const [showHeal, setShowHeal] = useState(false);
  const prevHpRef = useRef(player?.hp);

  const gender = useMemo(() => guessGenderByName(player?.name), [player?.name]);
  const isFemale = gender === 'female';

  // 检测气血变化触发动效
  useEffect(() => {
    if (prevHpRef.current && player?.hp) {
      const hpDiff = player.hp - prevHpRef.current;
      if (hpDiff < 0) {
        // 受到伤害
        setEffectState('hit');
        setShowDamage(true);
        setTimeout(() => {
          setEffectState('idle');
          setShowDamage(false);
          if (onEffectComplete) onEffectComplete();
        }, 400);
      } else if (hpDiff > 0) {
        // 恢复气血
        setEffectState('heal');
        setShowHeal(true);
        setTimeout(() => {
          setEffectState('idle');
          setShowHeal(false);
          if (onEffectComplete) onEffectComplete();
        }, 600);
      }
    }
    prevHpRef.current = player?.hp;
  }, [player?.hp, onEffectComplete]);

  // 外部触发的动效
  useEffect(() => {
    if (isAttacking) {
      setEffectState('attack');
      setTimeout(() => setEffectState('idle'), 500);
    }
    if (isHit) {
      setEffectState('hit');
      setShowDamage(true);
      setTimeout(() => {
        setEffectState('idle');
        setShowDamage(false);
      }, 400);
    }
    if (isDodging) {
      setEffectState('dodge');
      setTimeout(() => setEffectState('idle'), 500);
    }
    if (isHealing) {
      setEffectState('heal');
      setShowHeal(true);
      setTimeout(() => {
        setEffectState('idle');
        setShowHeal(false);
      }, 600);
    }
    if (isBuffing) {
      setEffectState('buff');
      setTimeout(() => setEffectState('idle'), 500);
    }
    if (isDebuffing) {
      setEffectState('debuff');
      setTimeout(() => setEffectState('idle'), 400);
    }
    if (isDead) {
      setEffectState('dead');
    }
  }, [isAttacking, isHit, isDodging, isHealing, isBuffing, isDebuffing, isDead]);

  // 武器信息
  const treasure = TREASURES_DB?.find(t => t.id === player?.equippedTreasure);
  const treasureEffect = treasure?.effect || '';

  const getWeaponInfo = () => {
    const weapons = {
      'yiTian': { name: '倚天剑', icon: '🗡️', color: '#c9a227' },
      'tuLong': { name: '屠龙刀', icon: '⚔️', color: '#8b0000' },
      'xuanTie': { name: '玄铁重剑', icon: '🗡️', color: '#4a5568' },
      'jinShe': { name: '金蛇剑', icon: '🐍', color: '#d4af37' },
      'daGou': { name: '打狗棒', icon: '🪄', color: '#8b4513' },
      'dianXue': { name: '判官笔', icon: '✒️', color: '#4a5568' },
      'shengHuo': { name: '圣火令', icon: '🔥', color: '#dc2626' },
      'jiMie': { name: '绝世好剑', icon: '⚔️', color: '#6366f1' },
      'niePan': { name: '达摩舍利', icon: '📿', color: '#fbbf24' },
      'ruanWei': { name: '软猬甲', icon: '🛡️', color: '#78350f' },
    };
    return weapons[treasureEffect] || { name: '拳脚', icon: '👊', color: '#d4af37' };
  };

  const weapon = getWeaponInfo();

  // 等级决定边框和背景颜色
  const getLevelStyle = () => {
    const level = player?.level || 1;
    if (level >= 90) return { border: '#ffd700', bg: 'linear-gradient(180deg, #1a1a2e 0%, #0d0d1a 100%)', rank: '神话' };
    if (level >= 70) return { border: '#a855f7', bg: 'linear-gradient(180deg, #1e1a3d 0%, #0f0d1f 100%)', rank: '传说' };
    if (level >= 50) return { border: '#f97316', bg: 'linear-gradient(180deg, #2d1f1a 0%, #1a120d 100%)', rank: '史诗' };
    if (level >= 30) return { border: '#3b82f6', bg: 'linear-gradient(180deg, #1a2d3d 0%, #0d1a24 100%)', rank: '稀有' };
    if (level >= 15) return { border: '#22c55e', bg: 'linear-gradient(180deg, #1a2d24 0%, #0d1a12 100%)', rank: '优秀' };
    return { border: '#6b7280', bg: 'linear-gradient(180deg, #1f1f1f 0%, #0f0f0f 100%)', rank: '普通' };
  };

  const levelStyle = getLevelStyle();

  // 内功气场
  const innerSkill = player?.equippedSkills?.inner;
  let auraStyle = {};
  if (innerSkill === 's_yijin') auraStyle = { shadow: '0 0 30px rgba(139, 92, 246, 0.5)', glow: 'rgba(139, 92, 246, 0.3)' };
  else if (innerSkill === 's5') auraStyle = { shadow: '0 0 30px rgba(251, 191, 36, 0.5)', glow: 'rgba(251, 191, 36, 0.3)' };
  else if (innerSkill === 's_xixing') auraStyle = { shadow: '0 0 30px rgba(220, 38, 38, 0.5)', glow: 'rgba(220, 38, 38, 0.3)' };
  else if (innerSkill === 's_shihou') auraStyle = { shadow: '0 0 30px rgba(234, 88, 12, 0.5)', glow: 'rgba(234, 88, 12, 0.3)' };
  else auraStyle = { shadow: '0 0 20px rgba(212, 175, 55, 0.3)', glow: 'rgba(212, 175, 55, 0.2)' };

  // 气血比例
  const hpRatio = (player?.hp || 0) / (player?.maxHp || 7000);

  // 动效样式
  const getEffectStyle = () => {
    switch (effectState) {
      case 'attack':
        return {
          animation: 'characterAttack 0.5s ease-out',
          filter: 'brightness(1.3) drop-shadow(0 0 15px var(--gold))',
        };
      case 'hit':
        return {
          animation: 'characterHit 0.4s ease-out',
          filter: 'brightness(1.5) saturate(1.2)',
        };
      case 'dodge':
        return {
          animation: 'characterDodge 0.5s ease-out',
          opacity: 0.7,
        };
      case 'heal':
        return {
          animation: 'healPulse 0.6s ease-out',
          filter: 'brightness(1.2)',
        };
      case 'buff':
        return {
          animation: 'buffRing 0.5s ease-out',
          boxShadow: `0 0 30px ${levelStyle.border}`,
        };
      case 'debuff':
        return {
          animation: 'debuffPulse 0.4s ease-out',
          filter: 'brightness(0.8) saturate(0.8)',
        };
      case 'dead':
        return {
          animation: 'characterDeath 0.8s ease-out forwards',
          opacity: 0.3,
          filter: 'grayscale(0.8)',
        };
      default:
        return {};
    }
  };

  // 状态差分：根据气血比例决定角色表情
  const getCharacterState = () => {
    if (hpRatio <= 0) return 'dead';
    if (hpRatio <= 0.2) return 'critical';
    if (hpRatio <= 0.5) return 'wounded';
    if (effectState === 'attack') return 'attacking';
    return 'normal';
  };

  const characterState = getCharacterState();

  // 眼睛样式（根据状态变化）
  const getEyeStyle = () => {
    switch (characterState) {
      case 'attacking':
        return { fill: '#dc2626', height: 4, y: 32 }; // 凌厉眼神
      case 'wounded':
        return { fill: '#1a1a1a', height: 2, y: 33 }; // 略微眯眼
      case 'critical':
        return { fill: '#1a1a1a', height: 1.5, y: 34 }; // 紧闭
      case 'dead':
        return { fill: '#1a1a1a', height: 0, y: 35 }; // 闭眼
      default:
        return { fill: '#1a1a1a', height: 3, y: 32 }; // 正常
    }
  };

  const eyeStyle = getEyeStyle();

  // Buff/Debuff 状态指示器
  const renderStatusIndicators = () => {
    if (!player?.buffs && !player?.debuffs) return null;

    const buffs = player.buffs || {};
    const debuffs = player.debuffs || {};

    return (
      <div style={{
        position: 'absolute',
        top: '-25px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '4px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '180px',
      }}>
        {/* Buff 指示器 */}
        {buffs.dodge > 0 && (
          <div style={{
            padding: '2px 6px',
            background: 'rgba(0, 168, 107, 0.3)',
            border: '1px solid #00a86b',
            borderRadius: '3px',
            fontSize: '0.7rem',
            color: '#00a86b',
            animation: 'buffIndicator 1s ease-in-out infinite',
          }}>
            闪避
          </div>
        )}
        {buffs.defUp > 0 && (
          <div style={{
            padding: '2px 6px',
            background: 'rgba(212, 175, 55, 0.3)',
            border: '1px solid #d4af37',
            borderRadius: '3px',
            fontSize: '0.7rem',
            color: '#d4af37',
            animation: 'buffIndicator 1s ease-in-out infinite',
          }}>
            防御
          </div>
        )}
        {buffs.shield > 0 && (
          <div style={{
            padding: '2px 6px',
            background: 'rgba(79, 172, 254, 0.3)',
            border: '1px solid #4facfe',
            borderRadius: '3px',
            fontSize: '0.7rem',
            color: '#4facfe',
            animation: 'shieldGlow 1s ease-in-out infinite',
          }}>
            护盾
          </div>
        )}
        {buffs.revive > 0 && (
          <div style={{
            padding: '2px 6px',
            background: 'rgba(251, 191, 36, 0.3)',
            border: '1px solid #fbbf24',
            borderRadius: '3px',
            fontSize: '0.7rem',
            color: '#fbbf24',
            animation: 'buffIndicator 0.8s ease-in-out infinite',
          }}>
            涅槃
          </div>
        )}

        {/* Debuff 指示器 */}
        {debuffs.stun > 0 && (
          <div style={{
            padding: '2px 6px',
            background: 'rgba(251, 191, 36, 0.2)',
            border: '1px solid #fbbf24',
            borderRadius: '3px',
            fontSize: '0.7rem',
            color: '#fbbf24',
            animation: 'debuffIndicator 0.5s ease-in-out infinite',
          }}>
            眩晕
          </div>
        )}
        {debuffs.poison > 0 && (
          <div style={{
            padding: '2px 6px',
            background: 'rgba(34, 197, 94, 0.2)',
            border: '1px solid #22c55e',
            borderRadius: '3px',
            fontSize: '0.7rem',
            color: '#22c55e',
            animation: 'debuffIndicator 0.6s ease-in-out infinite',
          }}>
            中毒
          </div>
        )}
        {debuffs.silence > 0 && (
          <div style={{
            padding: '2px 6px',
            background: 'rgba(139, 92, 246, 0.2)',
            border: '1px solid #8b5cf6',
            borderRadius: '3px',
            fontSize: '0.7rem',
            color: '#8b5cf6',
            animation: 'debuffIndicator 0.5s ease-in-out infinite',
          }}>
            封印
          </div>
        )}
        {debuffs.internalWound > 0 && (
          <div style={{
            padding: '2px 6px',
            background: 'rgba(139, 92, 246, 0.2)',
            border: '1px solid #8b5cf6',
            borderRadius: '3px',
            fontSize: '0.7rem',
            color: '#8b5cf6',
            animation: 'debuffIndicator 0.7s ease-in-out infinite',
          }}>
            内伤
          </div>
        )}
      </div>
    );
  };

  // 伤害飘字
  const renderDamageNumber = () => {
    if (!showDamage || !damageAmount) return null;

    return (
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '1.8rem',
        fontFamily: '"Ma Shan Zheng", cursive',
        color: '#ef4444',
        textShadow: '0 0 15px rgba(239, 68, 68, 0.8)',
        fontWeight: 'bold',
        animation: 'damageFloat 0.5s ease-out forwards',
        zIndex: 50,
      }}>
        -{damageAmount}
      </div>
    );
  };

  // 治愈飘字
  const renderHealNumber = () => {
    if (!showHeal || !healAmount) return null;

    return (
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '1.8rem',
        fontFamily: '"Ma Shan Zheng", cursive',
        color: '#10b981',
        textShadow: '0 0 15px rgba(16, 185, 129, 0.8)',
        fontWeight: 'bold',
        animation: 'damageFloat 0.6s ease-out forwards',
        zIndex: 50,
      }}>
        +{healAmount}
      </div>
    );
  };

  // 受击红色闪光遮罩
  const renderHitFlash = () => {
    if (effectState !== 'hit') return null;

    return (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at center, rgba(220, 20, 60, 0.4), transparent 70%)',
        borderRadius: '8px',
        animation: 'hitFlash 0.3s ease-out forwards',
        zIndex: 10,
      }} />
    );
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      transform: isLeft ? 'scaleX(1)' : 'scaleX(-1)',
      position: 'relative',
    }}>
      {/* 状态指示器 */}
      {renderStatusIndicators()}

      {/* 角色卡片 - 太吾绘卷风格 */}
      <div style={{
        position: 'relative',
        width: '180px',
        height: '240px',
        borderRadius: '8px',
        background: levelStyle.bg,
        border: `2px solid ${levelStyle.border}`,
        boxShadow: auraStyle.shadow,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        ...getEffectStyle(),
      }}>
        {/* 受击闪光 */}
        {renderHitFlash()}

        {/* 顶部装饰边框 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, transparent, ${levelStyle.border}, transparent)`,
        }} />

        {/* 角落装饰 */}
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          width: '20px',
          height: '20px',
          borderLeft: `2px solid ${levelStyle.border}`,
          borderTop: `2px solid ${levelStyle.border}`,
        }} />
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '20px',
          height: '20px',
          borderRight: `2px solid ${levelStyle.border}`,
          borderTop: `2px solid ${levelStyle.border}`,
        }} />

        {/* 性别图标 */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          fontSize: '1.2rem',
          opacity: 0.8,
        }}>
          {isFemale ? '👤' : '👤'}
        </div>

        {/* 等级标签 */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          padding: '2px 8px',
          background: 'rgba(0,0,0,0.6)',
          borderRadius: '4px',
          fontSize: '0.75rem',
          color: levelStyle.border,
          fontFamily: '"Ma Shan Zheng", cursive',
          border: `1px solid ${levelStyle.border}40`,
        }}>
          Lv.{player?.level}
        </div>

        {/* 角色立绘区域 - 简化的像素风格人物 */}
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120px',
          height: '140px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {/* 像素风格角色 - 太吾绘卷风格 */}
          <svg width="100" height="130" viewBox="0 0 100 130">
            <defs>
              <linearGradient id="robe" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isFemale ? '#4a3f5c' : '#2d3a4a'} />
                <stop offset="100%" stopColor={isFemale ? '#2d2538' : '#1a2530'} />
              </linearGradient>
              <linearGradient id="skin" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f5e6d3" />
                <stop offset="100%" stopColor="#e8d4be" />
              </linearGradient>
              <linearGradient id="hair" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1a1a2e" />
                <stop offset="100%" stopColor="#0d0d1a" />
              </linearGradient>
            </defs>

            {/* 身体 - 简化的像素风格 */}
            <rect x="35" y="55" width="30" height="50" fill="url(#robe)" rx="3" />

            {/* 腿部 */}
            <rect x="38" y="105" width="10" height="20" fill="url(#robe)" rx="2" />
            <rect x="52" y="105" width="10" height="20" fill="url(#robe)" rx="2" />

            {/* 腰带 */}
            <rect x="35" y="75" width="30" height="6" fill={levelStyle.border} opacity="0.8" rx="1" />

            {/* 手臂 */}
            <rect x="25" y="55" width="12" height="30" fill="url(#robe)" rx="3" />
            <rect x="63" y="55" width="12" height="30" fill="url(#robe)" rx="3" />

            {/* 手 */}
            <rect x="27" y="82" width="8" height="10" fill="url(#skin)" rx="2" />
            <rect x="65" y="82" width="8" height="10" fill="url(#skin)" rx="2" />

            {/* 头部 */}
            <ellipse cx="50" cy="35" rx="18" ry="20" fill="url(#skin)" />

            {/* 头发 */}
            {isFemale ? (
              <g>
                <ellipse cx="50" cy="25" rx="18" ry="14" fill="url(#hair)" />
                <rect x="32" y="25" width="8" height="35" fill="url(#hair)" rx="4" />
                <rect x="60" y="25" width="8" height="35" fill="url(#hair)" rx="4" />
                <ellipse cx="50" cy="15" rx="10" ry="8" fill="url(#hair)" />
              </g>
            ) : (
              <g>
                <ellipse cx="50" cy="25" rx="18" ry="12" fill="url(#hair)" />
                <ellipse cx="50" cy="15" rx="8" ry="6" fill="url(#hair)" />
                <rect x="46" y="12" width="8" height="4" fill={levelStyle.border} rx="1" />
              </g>
            )}

            {/* 眼睛 - 根据状态变化 */}
            <rect x="42" y={eyeStyle.y} width="4" height={eyeStyle.height} fill={eyeStyle.fill} rx="1" />
            <rect x="54" y={eyeStyle.y} width="4" height={eyeStyle.height} fill={eyeStyle.fill} rx="1" />

            {/* 嘴巴 */}
            {characterState === 'dead' ? (
              <rect x="47" y="42" width="6" height="1" fill="#c9a0a0" rx="0.5" />
            ) : characterState === 'critical' ? (
              <ellipse cx="50" cy="42" rx="4" ry="2" fill="#c9a0a0" />
            ) : (
              <rect x="47" y="42" width="6" height="2" fill="#c9a0a0" rx="1" />
            )}

            {/* 武器图标 */}
            <text x="75" y="60" fontSize="20" textAnchor="middle">{weapon.icon}</text>
          </svg>
        </div>

        {/* 底部信息栏 */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '10px',
          background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.8))',
        }}>
          {/* 名字 */}
          <div style={{
            textAlign: 'center',
            fontSize: '1.1rem',
            color: '#f0f0f0',
            fontFamily: '"Ma Shan Zheng", cursive',
            letterSpacing: '2px',
            marginBottom: '6px',
            textShadow: '0 0 10px rgba(0,0,0,0.8)',
          }}>
            {player?.name}
          </div>

          {/* 武器 */}
          <div style={{
            textAlign: 'center',
            fontSize: '0.8rem',
            color: weapon.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}>
            <span>{weapon.icon}</span>
            <span>{weapon.name}</span>
          </div>
        </div>

        {/* 气血条 */}
        <div style={{
          position: 'absolute',
          bottom: '55px',
          left: '15px',
          right: '15px',
          height: '6px',
          background: 'rgba(0,0,0,0.5)',
          borderRadius: '3px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{
            width: `${hpRatio * 100}%`,
            height: '100%',
            background: hpRatio <= 0.2
              ? 'linear-gradient(90deg, #dc2626, #ef4444)'
              : hpRatio <= 0.5
                ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                : isLeft
                  ? 'linear-gradient(90deg, #059669, #10b981)'
                  : 'linear-gradient(90deg, #dc2626, #ef4444)',
            transition: 'width 0.3s ease',
          }} />
        </div>

        {/* 气血数值 */}
        <div style={{
          position: 'absolute',
          bottom: '62px',
          left: '0',
          right: '0',
          textAlign: 'center',
          fontSize: '0.7rem',
          color: '#a0a0a0',
          fontFamily: 'monospace',
        }}>
          {Math.floor(player?.hp || 0)} / {Math.floor(player?.maxHp || 7000)}
        </div>

        {/* 伤害飘字 */}
        {renderDamageNumber()}
        {renderHealNumber()}
      </div>
    </div>
  );
};

export default EnhancedWarriorAvatar;
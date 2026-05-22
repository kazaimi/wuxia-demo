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
  
  // 图片资源和降级容错状态
  const [imgSrc, setImgSrc] = useState('');
  const [fallbackActive, setFallbackActive] = useState(false);
  
  const prevHpRef = useRef(player?.hp);

  const gender = useMemo(() => guessGenderByName(player?.name), [player?.name]);
  const isFemale = gender === 'female';

  // 1. NPC 特殊配置彩蛋识别
  const npcConfig = useMemo(() => {
    if (!player?.name) return null;
    for (const key of Object.keys(NPC_SPECIAL_CONFIGS)) {
      if (player.name.includes(key)) {
        return NPC_SPECIAL_CONFIGS[key];
      }
    }
    return null;
  }, [player?.name]);

  // 设置图片路径加载
  useEffect(() => {
    if (npcConfig) {
      const nameMap = {
        '扫地僧': 'saodiseng',
        '东方不败': 'dongfang',
        '灭绝师太': 'miejue',
        '邀月': 'yaoyue',
        '张三丰': 'zhangsanfeng',
        '乔峰': 'qiaofeng',
        '萧峰': 'qiaofeng'
      };
      let key = 'saodiseng';
      for (const k of Object.keys(nameMap)) {
        if (player.name.includes(k)) {
          key = nameMap[k];
          break;
        }
      }
      setImgSrc(`/npc_${key}.png`);
    } else {
      setImgSrc(isFemale ? '/wuxia_female_hero.png' : '/wuxia_male_hero.png');
    }
    setFallbackActive(false);
  }, [player?.name, isFemale, npcConfig]);

  const handleImgError = () => {
    // 专属NPC精绘加载报错（尚未生成），自动退回使用通用立绘，并激活偏色着色
    const defaultSrc = isFemale ? '/wuxia_female_hero.png' : '/wuxia_male_hero.png';
    if (imgSrc !== defaultSrc) {
      setImgSrc(defaultSrc);
      setFallbackActive(true);
    }
  };

  // 检测气血变化触发动效
  useEffect(() => {
    if (prevHpRef.current && player?.hp) {
      const hpDiff = player.hp - prevHpRef.current;
      if (hpDiff < 0) {
        setEffectState('hit');
        setShowDamage(true);
        setTimeout(() => {
          setEffectState('idle');
          setShowDamage(false);
          if (onEffectComplete) onEffectComplete();
        }, 400);
      } else if (hpDiff > 0) {
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

  // 武器与宝具
  const treasure = TREASURES_DB?.find(t => t.id === player?.equippedTreasure);
  const treasureEffect = treasure?.effect || '';

  const getWeaponInfo = () => {
    if (npcConfig) {
      return {
        name: npcConfig.weaponName,
        icon: npcConfig.weaponIcon,
        color: npcConfig.weaponColor
      };
    }
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
    if (npcConfig) {
      return {
        border: npcConfig.color,
        bg: 'linear-gradient(180deg, #1a1515 0%, #0d0606 100%)',
        rank: '宗师'
      };
    }
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
  if (innerSkill === 's_yijin') auraStyle = { shadow: '0 0 30px rgba(194, 157, 56, 0.5)', glow: 'rgba(194, 157, 56, 0.3)' };
  else if (innerSkill === 's5') auraStyle = { shadow: '0 0 30px rgba(220, 38, 38, 0.5)', glow: 'rgba(220, 38, 38, 0.3)' };
  else if (innerSkill === 's_xixing') auraStyle = { shadow: '0 0 30px rgba(139, 92, 246, 0.5)', glow: 'rgba(139, 92, 246, 0.3)' };
  else if (innerSkill === 's_shihou') auraStyle = { shadow: '0 0 30px rgba(234, 88, 12, 0.5)', glow: 'rgba(234, 88, 12, 0.3)' };
  else auraStyle = { shadow: '0 0 20px rgba(212, 175, 55, 0.3)', glow: 'rgba(212, 175, 55, 0.2)' };

  // 气血比例
  const hpRatio = (player?.hp || 0) / (player?.maxHp || 7000);

  // 2. 程序化特征属性控制
  const getProceduralStyles = () => {
    const attrs = player?.attributes || { con: 10, str: 10, agi: 10 };
    const level = player?.level || 1;

    // 身高体型缩放（根据力量、体质、敏捷）
    const scaleY = 1 + Math.max(-0.12, Math.min(0.18, ((attrs.agi || 10) - 10) * 0.015));
    const scaleX = 1 + Math.max(-0.12, Math.min(0.2, ((attrs.str || 10) + (attrs.con || 10) - 20) * 0.01));

    // 内功偏色滤镜
    let colorFilter = '';
    if (fallbackActive && npcConfig) {
      colorFilter = npcConfig.filter;
    } else {
      if (innerSkill === 's_yijin') {
        colorFilter = 'hue-rotate(25deg) saturate(1.4) contrast(1.1) brightness(1.05)';
      } else if (innerSkill === 's5') {
        colorFilter = 'hue-rotate(-15deg) saturate(1.5) contrast(1.1)';
      } else if (innerSkill === 's_xixing') {
        colorFilter = 'hue-rotate(240deg) saturate(1.4)';
      } else if (innerSkill === 's_shihou') {
        colorFilter = 'hue-rotate(35deg) saturate(1.3) contrast(1.05)';
      }
    }

    // 宗师年龄滤镜 (>=60级宗师古朴色彩)
    if (level >= 60 && !colorFilter.includes('grayscale')) {
      colorFilter = `${colorFilter ? colorFilter + ' ' : ''}grayscale(0.15) sepia(0.15) contrast(1.05)`;
    }

    // 濒死重伤去色
    if (hpRatio <= 0.2) {
      colorFilter = 'grayscale(1) contrast(1.2)';
    }

    return {
      transform: `scale(${scaleX}, ${scaleY})`,
      filter: colorFilter,
    };
  };

  const proceduralStyle = getProceduralStyles();

  // 3. 判断面纱、白发特征
  const level = player?.level || 1;
  const isVeiled = level < 20 && !npcConfig; 
  const isGrandmaster = (level >= 60 || npcConfig) && imgSrc.includes('hero'); 

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
          opacity: 0.25,
        };
      default:
        return {};
    }
  };

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
        {/* Buff */}
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

        {/* Debuff */}
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
        fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif',
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
        fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif',
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

  // 4. 武器本命气劲流光粒子图层
  const renderWeaponAura = () => {
    if (isDead) return null;
    let particles = null;
    if (player?.equippedTreasure === 't8' || weapon.name.includes('金蛇')) {
      particles = (
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
          <path d="M 20,40 Q 80,10 160,40 T 160,200" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeDasharray="5 15" opacity="0.6" style={{ animation: 'swordQi 2s linear infinite' }} />
        </svg>
      );
    } else if (player?.equippedTreasure === 't13' || weapon.name.includes('圣火')) {
      particles = (
        <div style={{ position: 'absolute', bottom: '60px', left: '10px', right: '10px', height: '80px', pointerEvents: 'none', zIndex: 5, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: 0, left: '20%', width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626', opacity: 0.6, animation: 'poisonBubble 1.2s infinite' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '50%', width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', opacity: 0.5, animation: 'poisonBubble 1.6s infinite 0.4s' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '80%', width: '5px', height: '5px', borderRadius: '50%', background: '#b91c1c', opacity: 0.7, animation: 'poisonBubble 1s infinite 0.2s' }} />
        </div>
      );
    } else if (player?.equippedTreasure === 't7' || weapon.name.includes('打狗')) {
      particles = (
        <div style={{ position: 'absolute', bottom: '60px', left: '10px', right: '10px', height: '80px', pointerEvents: 'none', zIndex: 5, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '10px', left: '30%', width: '6px', height: '12px', background: '#22c55e', borderRadius: '1px', opacity: 0.4, transform: 'rotate(25deg)', animation: 'debuffFall 2s infinite' }} />
          <div style={{ position: 'absolute', top: '20px', left: '70%', width: '6px', height: '12px', background: '#059669', borderRadius: '1px', opacity: 0.4, transform: 'rotate(45deg)', animation: 'debuffFall 2.4s infinite 0.5s' }} />
        </div>
      );
    } else if (weapon.name.includes('剑') || weapon.name.includes('刀')) {
      particles = (
        <div className="sword-qi" style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.15)', pointerEvents: 'none', zIndex: 5, borderRadius: '8px' }} />
      );
    }
    return particles;
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

      {/* 水墨暗黑国风人物卡片 */}
      <div 
        className={`wuxia-hero-card ${hpRatio <= 0.2 ? 'critical-blood' : ''} ${!isDead ? 'shimmer-active' : ''}`}
        style={{
          background: levelStyle.bg,
          border: `2px solid ${levelStyle.border}`,
          boxShadow: auraStyle.shadow,
          transition: 'all 0.3s ease',
          ...getEffectStyle(),
        }}
      >
        {/* 受击闪光 */}
        {renderHitFlash()}

        {/* 顶部装饰条 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, transparent, ${levelStyle.border}, transparent)`,
          zIndex: 6,
        }} />

        {/* 夔纹/回纹四角古风装饰 */}
        <div style={{ position: 'absolute', top: '8px', left: '8px', width: '12px', height: '12px', borderLeft: `2.5px solid ${levelStyle.border}`, borderTop: `2.5px solid ${levelStyle.border}`, zIndex: 6, opacity: 0.7 }} />
        <div style={{ position: 'absolute', top: '8px', right: '8px', width: '12px', height: '12px', borderRight: `2.5px solid ${levelStyle.border}`, borderTop: `2.5px solid ${levelStyle.border}`, zIndex: 6, opacity: 0.7 }} />
        <div style={{ position: 'absolute', bottom: '8px', left: '8px', width: '12px', height: '12px', borderLeft: `2.5px solid ${levelStyle.border}`, borderBottom: `2.5px solid ${levelStyle.border}`, zIndex: 6, opacity: 0.7 }} />
        <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '12px', height: '12px', borderRight: `2.5px solid ${levelStyle.border}`, borderBottom: `2.5px solid ${levelStyle.border}`, zIndex: 6, opacity: 0.7 }} />

        {/* 性别水墨标志 */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          fontSize: '0.8rem',
          opacity: 0.6,
          color: levelStyle.border,
          fontFamily: '"Ma Shan Zheng", cursive',
          zIndex: 6,
          transform: isLeft ? 'none' : 'scaleX(-1)', // 纠正翻转
        }}>
          {isFemale ? '坤' : '乾'}
        </div>

        {/* 等级标签名帖 */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '1px 6px',
          background: 'rgba(0,0,0,0.65)',
          borderRadius: '3px',
          fontSize: '0.7rem',
          color: levelStyle.border,
          fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif',
          border: `1px solid ${levelStyle.border}35`,
          zIndex: 6,
          transform: isLeft ? 'none' : 'scaleX(-1)', // 纠正翻转
        }}>
          {levelStyle.rank}
        </div>

        {/* 动态太极气旋背景 */}
        {!isDead && <div className="wuxia-card-taiji" />}

        {/* 水墨精绘立绘图像 */}
        {imgSrc && (
          <img 
            src={imgSrc} 
            alt={player?.name} 
            className="wuxia-hero-portrait"
            onError={handleImgError}
            style={{
              opacity: isDead ? 0.15 : hpRatio <= 0.2 ? 0.75 : 0.9,
              ...proceduralStyle,
            }}
          />
        )}

        {/* 动态特征：银发/白发气劲（一代宗师专属） */}
        {isGrandmaster && !isDead && (
          <svg style={{ position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)', width: '80px', height: '40px', pointerEvents: 'none', zIndex: 3 }}>
            <path d="M 10,25 Q 40,5 70,25" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeDasharray="2 4" style={{ animation: 'swordQi 1.5s linear infinite' }} />
            <path d="M 20,20 Q 40,8 60,20" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          </svg>
        )}

        {/* 动态特征：神秘黑色斗笠面纱（初出茅庐新手专属） */}
        {isVeiled && !isDead && (
          <div style={{
            position: 'absolute',
            top: '40px',
            left: '30%',
            width: '40%',
            height: '35px',
            background: 'linear-gradient(to bottom, rgba(15,10,10,0.9) 10%, rgba(15,10,10,0.75) 50%, rgba(15,10,10,0.0) 100%)',
            borderBottom: '1px solid rgba(194, 157, 56, 0.15)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.8)',
            zIndex: 4,
            pointerEvents: 'none',
            borderRadius: '2px',
          }} />
        )}

        {/* 本命宝具流电气劲 */}
        {renderWeaponAura()}

        {/* 死亡时覆盖冰裂墨痕 */}
        {isDead && (
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 7, pointerEvents: 'none' }}>
            <line x1="20" y1="20" x2="160" y2="220" stroke="#000" strokeWidth="2.5" opacity="0.8" strokeDasharray="5 5" />
            <line x1="160" y1="20" x2="20" y2="220" stroke="#000" strokeWidth="2" opacity="0.8" strokeDasharray="3 7" />
            <circle cx="90" cy="120" r="40" fill="none" stroke="#0d0606" strokeWidth="1.5" strokeDasharray="2 4" />
          </svg>
        )}

        {/* 底部信息名牌面板 */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '8px 10px',
          background: 'linear-gradient(180deg, transparent 0%, rgba(10,5,5,0.95) 75%)',
          zIndex: 6,
          transform: isLeft ? 'none' : 'scaleX(-1)', // 纠正翻转
        }}>
          {/* 名字 */}
          <div style={{
            textAlign: 'center',
            fontSize: '1.05rem',
            color: '#f0f0f0',
            fontFamily: '"Ma Shan Zheng", cursive',
            letterSpacing: '2px',
            marginBottom: '4px',
            textShadow: '0 0 10px rgba(0,0,0,0.9)',
          }}>
            {player?.name}
          </div>

          {/* 武器 */}
          <div style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            color: weapon.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
          }}>
            <span>{weapon.icon}</span>
            <span style={{ fontFamily: '"Ma Shan Zheng", sans-serif' }}>{weapon.name}</span>
          </div>
        </div>

        {/* 气血条与气血数值 */}
        <div style={{
          position: 'absolute',
          bottom: '50px',
          left: '12px',
          right: '12px',
          height: '5px',
          background: 'rgba(0,0,0,0.65)',
          borderRadius: '3px',
          overflow: 'hidden',
          border: '1.5px solid rgba(194, 157, 56, 0.15)',
          zIndex: 6,
        }}>
          <div style={{
            width: `${hpRatio * 100}%`,
            height: '100%',
            background: hpRatio <= 0.2
              ? 'linear-gradient(90deg, #b91c1c, #ef4444)'
              : hpRatio <= 0.5
                ? 'linear-gradient(90deg, #d97706, #fbbf24)'
                : isLeft
                  ? 'linear-gradient(90deg, #0f766e, #00a86b)'
                  : 'linear-gradient(90deg, #b91c1c, #dc2626)',
            transition: 'width 0.3s ease',
          }} />
        </div>

        <div style={{
          position: 'absolute',
          bottom: '56px',
          left: '0',
          right: '0',
          textAlign: 'center',
          fontSize: '0.62rem',
          color: '#a0a0a0',
          fontFamily: 'monospace',
          zIndex: 6,
          transform: isLeft ? 'none' : 'scaleX(-1)', // 纠正翻转
        }}>
          {Math.floor(player?.hp || 0)} / {Math.floor(player?.maxHp || 7000)}
        </div>

        {/* 伤害飘字层 */}
        {renderDamageNumber()}
        {renderHealNumber()}
      </div>
    </div>
  );
};

// 4. 特殊 NPC 原著数据与经典台词配置库
export const NPC_SPECIAL_CONFIGS = {
  '扫地僧': {
    quote: '大凡武功修为，必须有慈悲之佛法相辅。',
    comment: '大智若愚，藏经阁中扫尽红尘。',
    color: '#9ca3af',
    filter: 'grayscale(0.3) sepia(0.15) contrast(1.05)',
    weaponIcon: '🧹',
    weaponName: '铁木扫帚',
    weaponColor: '#9ca3af',
  },
  '东方不败': {
    quote: '日出东方，唯我不败！',
    comment: '葵花宝典，红烛针影，绝代妖娆。',
    color: '#ef4444',
    filter: 'hue-rotate(-20deg) saturate(1.8) contrast(1.2)',
    weaponIcon: '🪡',
    weaponName: '葵花绣针',
    weaponColor: '#f87171',
  },
  '灭绝师太': {
    quote: '我峨嵋派倚天不出，谁与争锋！',
    comment: '性情刚烈，斩尽妖邪，正邪不两立。',
    color: '#6b7280',
    filter: 'grayscale(0.8) contrast(1.3)',
    weaponIcon: '🗡️',
    weaponName: '倚天剑',
    weaponColor: '#c9a227',
  },
  '邀月': {
    quote: '若我不配得到，那谁也别想得到！',
    comment: '明玉功成，移花宫主，冷若冰霜。',
    color: '#06b6d4',
    filter: 'hue-rotate(180deg) saturate(1.4) brightness(1.15)',
    weaponIcon: '❄️',
    weaponName: '明玉气劲',
    weaponColor: '#22d3ee',
  },
  '张三丰': {
    quote: '太极圆转，阴阳既济，生生不息。',
    comment: '一代宗师，武当太极，泰山北斗。',
    color: '#fbbf24',
    filter: 'grayscale(0.9) contrast(1.15) sepia(0.05)',
    weaponIcon: '☯️',
    weaponName: '太极真意',
    weaponColor: '#fbbf24',
  },
  '乔峰': {
    quote: '我萧峰大好男儿，何惧之有！',
    comment: '降龙神威，悲剧豪侠，豪气冲天。',
    color: '#b45309',
    filter: 'sepia(0.3) saturate(1.3) contrast(1.1)',
    weaponIcon: '🐉',
    weaponName: '降龙十八掌',
    weaponColor: '#f59e0b',
  },
  '萧峰': {
    quote: '我萧峰大好男儿，何惧之有！',
    comment: '降龙神威，悲剧豪侠，豪气冲天。',
    color: '#b45309',
    filter: 'sepia(0.3) saturate(1.3) contrast(1.1)',
    weaponIcon: '🐉',
    weaponName: '降龙十八掌',
    weaponColor: '#f59e0b',
  }
};

export default EnhancedWarriorAvatar;
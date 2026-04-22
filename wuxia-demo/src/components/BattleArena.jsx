import React, { useEffect, useRef, useMemo } from 'react';
import { useGameStore, SKILLS_DB, TREASURES_DB } from '../store/gameState';
import { Swords } from 'lucide-react';

// 根据名字判断性别
const guessGenderByName = (name) => {
  const femaleKeywords = ['邀月', '灭绝', '童姥', '月', '仙', '姬', '娘', '姑', '妹', '姐', '女', '芳', '莲', '梅', '兰', '竹', '菊', '雪', '霜', '云', '霞', '玉', '珠', '翠', '红', '燕', '莺', '凤', '鸾', '娟', '婷', '婉', '柔', '嫣', '瑶', '薇', '蕾', '露', '涵', '晴', '雨', '烟', '琳', '瑾', '颖', '萱', '蕊', '黛', '芷', '芸', '梦', '舞', '琴'];
  const maleKeywords = ['僧', '道', '侠', '峰', '靖', '过', '冲', '虚竹', '三丰', '重阳', '七公', '欧阳', '药师', '伯通', '鸠摩', '慕容', '春秋', '延庆', '不群', '冷禅', '平之', '青书', '我行', '东方', '清扬', '莫大', '正风', '曲洋', '向问天'];

  for (const keyword of femaleKeywords) {
    if (name?.includes(keyword)) return 'female';
  }
  for (const keyword of maleKeywords) {
    if (name?.includes(keyword)) return 'male';
  }

  const lastChar = name?.slice(-1) || '';
  const femaleEndings = ['月', '雪', '霜', '云', '霞', '玉', '珠', '翠', '红', '燕', '莺', '凤', '鸾', '娟', '婷', '婉', '柔', '嫣', '瑶', '薇', '蕾', '露', '涵', '晴', '雨', '烟', '琳', '瑾', '颖', '萱', '蕊', '黛', '芷', '芸', '梦', '舞', '琴', '仙', '姬', '娘', '姑', '妹', '姐', '女', '芳', '莲', '梅', '兰', '竹', '菊'];
  if (femaleEndings.includes(lastChar)) return 'female';

  return 'male';
};

// 精美武侠角色形象组件 - 参考剑网3/天刀风格
const WarriorAvatar = ({ player, isLeft }) => {
  if (!player) return null;

  const gender = useMemo(() => guessGenderByName(player.name), [player.name]);
  const isFemale = gender === 'female';

  // 根据装备的宝物决定武器样式
  const treasure = TREASURES_DB?.find(t => t.id === player.equippedTreasure);
  const treasureEffect = treasure?.effect || '';

  // 武器样式映射
  const getWeaponStyle = () => {
    const weapons = {
      'yiTian': { type: 'sword', name: '倚天剑', color: '#c9a227' },
      'tuLong': { type: 'blade', name: '屠龙刀', color: '#8b0000' },
      'xuanTie': { type: 'heavySword', name: '玄铁重剑', color: '#2d3748' },
      'jinShe': { type: 'snakeSword', name: '金蛇剑', color: '#d4af37' },
      'daGou': { type: 'staff', name: '打狗棒', color: '#8b4513' },
      'dianXue': { type: 'pen', name: '判官笔', color: '#4a5568' },
      'shengHuo': { type: 'token', name: '圣火令', color: '#dc2626' },
      'jiMie': { type: 'darkSword', name: '绝世好剑', color: '#1a1a2e' },
      'niePan': { type: 'relic', name: '达摩舍利', color: '#fbbf24' },
      'ruanWei': { type: 'whip', name: '软猬甲', color: '#78350f' },
    };
    return weapons[treasureEffect] || { type: 'fist', name: '拳脚', color: '#d4af37' };
  };

  const weapon = getWeaponStyle();

  // 根据等级决定服装颜色
  const getRobeColors = () => {
    const level = player.level || 1;
    if (level >= 90) return { primary: '#0f0f1a', secondary: '#1a1a2e', accent: '#ffd700', trim: '#c9a227', name: '神装' };
    if (level >= 70) return { primary: '#1a365d', secondary: '#2c5282', accent: '#e2e8f0', trim: '#a0aec0', name: '锦衣' };
    if (level >= 50) return { primary: '#1a202c', secondary: '#2d3748', accent: '#fc8181', trim: '#e53e3e', name: '战袍' };
    if (level >= 30) return { primary: '#1d4044', secondary: '#234e52', accent: '#81e6d9', trim: '#38b2ac', name: '劲装' };
    if (level >= 15) return { primary: '#2d2250', secondary: '#3c2a6e', accent: '#b794f4', trim: '#9f7aea', name: '道袍' };
    return { primary: '#2d2d2d', secondary: '#3d3d3d', accent: '#a0a0a0', trim: '#808080', name: '布衣' };
  };

  const robeColors = getRobeColors();

  // 内功气场颜色
  const innerSkill = player.equippedSkills?.inner;
  let auraColor = 'rgba(212, 175, 55, 0.2)';
  if (innerSkill === 's_yijin') auraColor = 'rgba(139, 92, 246, 0.25)';
  else if (innerSkill === 's5') auraColor = 'rgba(251, 191, 36, 0.25)';
  else if (innerSkill === 's_xixing') auraColor = 'rgba(220, 38, 38, 0.25)';
  else if (innerSkill === 's_shihou') auraColor = 'rgba(234, 88, 12, 0.25)';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      transform: isLeft ? 'scaleX(1)' : 'scaleX(-1)',
      position: 'relative',
    }}>
      {/* 气场光晕 */}
      <div style={{
        position: 'absolute',
        width: '200px',
        height: '280px',
        top: '-30px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: `radial-gradient(ellipse at 50% 40%, ${auraColor}, transparent 70%)`,
        filter: 'blur(20px)',
        animation: 'auraPulse 3s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* 角色SVG - 参考剑网3风格 */}
      <svg width="160" height="240" viewBox="0 0 160 240" style={{
        filter: 'drop-shadow(0 4px 15px rgba(0,0,0,0.4))',
      }}>
        <defs>
          {/* 皮肤渐变 */}
          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8e8d8" />
            <stop offset="100%" stopColor="#e8d0b8" />
          </linearGradient>

          {/* 头发渐变 */}
          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="100%" stopColor="#0d0d1a" />
          </linearGradient>

          {/* 服装渐变 */}
          <linearGradient id="robeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={robeColors.primary} />
            <stop offset="50%" stopColor={robeColors.secondary} />
            <stop offset="100%" stopColor={robeColors.primary} />
          </linearGradient>

          {/* 服装高光 */}
          <linearGradient id="robeShine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="40%" stopColor={robeColors.accent} stopOpacity="0.1" />
            <stop offset="60%" stopColor={robeColors.accent} stopOpacity="0.05" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          {/* 内衬渐变 */}
          <linearGradient id="innerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="100%" stopColor="#0d0d1a" />
          </linearGradient>

          {/* 腰带渐变 */}
          <linearGradient id="beltGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={robeColors.trim} />
            <stop offset="50%" stopColor={robeColors.accent} />
            <stop offset="100%" stopColor={robeColors.trim} />
          </linearGradient>

          {/* 武器光效 */}
          <filter id="weaponGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* 眼睛渐变 */}
          <radialGradient id="eyeGrad" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#3d2817" />
            <stop offset="100%" stopColor="#1a1a2e" />
          </radialGradient>
        </defs>

        {/* ========== 身体主体 ========== */}
        <g>
          {/* 后摆/披风 */}
          <path
            d={`M80 85
                Q40 95 30 230
                L130 230
                Q120 95 80 85`}
            fill="url(#robeGrad)"
            opacity="0.9"
          />

          {/* 前摆 */}
          <path
            d={`M80 85
                Q50 100 40 225
                L120 225
                Q110 100 80 85`}
            fill="url(#robeGrad)"
          />

          {/* 衣服褶皱 */}
          <path d="M50 120 Q55 160 45 220" stroke={robeColors.accent} strokeWidth="0.8" fill="none" opacity="0.2" />
          <path d="M110 120 Q105 160 115 220" stroke={robeColors.accent} strokeWidth="0.8" fill="none" opacity="0.2" />
          <path d="M80 90 L80 220" stroke={robeColors.trim} strokeWidth="0.5" opacity="0.3" />

          {/* 领口 */}
          <path
            d={`M68 70 Q75 80 80 82 Q85 80 92 70
                L88 65 Q80 72 72 65 Z`}
            fill="url(#innerGrad)"
            stroke={robeColors.trim}
            strokeWidth="0.5"
          />

          {/* 肩部装饰 */}
          <ellipse cx="50" cy="75" rx="12" ry="6" fill={robeColors.trim} opacity="0.6" />
          <ellipse cx="110" cy="75" rx="12" ry="6" fill={robeColors.trim} opacity="0.6" />
        </g>

        {/* 腰带 */}
        <g>
          <rect x="45" y="135" width="70" height="14" fill="url(#beltGrad)" rx="2" />
          {/* 腰饰 */}
          <circle cx="80" cy="142" r="6" fill={robeColors.accent} stroke={robeColors.trim} strokeWidth="1" />
          <rect x="76" y="138" width="8" height="8" fill={robeColors.trim} rx="1" />
        </g>

        {/* ========== 手臂 ========== */}
        <g>
          {/* 左臂 */}
          <path
            d={`M45 80 Q25 100 20 130 Q18 150 25 160`}
            fill="url(#robeGrad)"
            stroke={robeColors.trim}
            strokeWidth="0.5"
          />
          {/* 左手 */}
          <ellipse cx="25" cy="165" rx="8" ry="10" fill="url(#skinGrad)" />

          {/* 右臂 - 持武器 */}
          <path
            d={`M115 80 Q135 90 140 75 Q145 60 150 50`}
            fill="url(#robeGrad)"
            stroke={robeColors.trim}
            strokeWidth="0.5"
          />
          {/* 右手 */}
          <ellipse cx="152" cy="48" rx="7" ry="9" fill="url(#skinGrad)" transform="rotate(-15, 150, 50)" />
        </g>

        {/* ========== 头部 ========== */}
        <g>
          {/* 脖子 */}
          <rect x="72" y="58" width="16" height="14" fill="url(#skinGrad)" rx="3" />

          {/* 头部 */}
          <ellipse cx="80" cy="38" rx="22" ry={isFemale ? "26" : "24"} fill="url(#skinGrad)" />

          {/* 耳朵 */}
          <ellipse cx="58" cy="38" rx="4" ry="6" fill="url(#skinGrad)" />
          <ellipse cx="102" cy="38" rx="4" ry="6" fill="url(#skinGrad)" />

          {/* ========== 头发 ========== */}
          {isFemale ? (
            <g>
              {/* 女性长发 */}
              <path
                d={`M58 20 Q45 25 42 50 Q40 80 50 110 Q55 120 60 115
                     M102 20 Q115 25 118 50 Q120 80 110 110 Q105 120 100 115`}
                fill="url(#hairGrad)"
              />
              {/* 刘海 */}
              <path
                d={`M58 15 Q80 0 102 15 Q108 25 105 35 Q80 28 55 35 Q52 25 58 15`}
                fill="url(#hairGrad)"
              />
              {/* 发髻 */}
              <ellipse cx="80" cy="8" rx="14" ry="10" fill="url(#hairGrad)" />
              {/* 发簪 */}
              <line x1="68" y1="8" x2="92" y2="8" stroke={robeColors.accent} strokeWidth="2" />
              <circle cx="68" cy="8" r="3" fill={robeColors.accent} />
              <circle cx="92" cy="8" r="3" fill={robeColors.accent} />
            </g>
          ) : (
            <g>
              {/* 男性发型 */}
              <ellipse cx="80" cy="18" rx="20" ry="14" fill="url(#hairGrad)" />
              {/* 发髻 */}
              <ellipse cx="80" cy="6" rx="10" ry="8" fill="url(#hairGrad)" />
              {/* 发带 */}
              <path d="M62 14 Q80 10 98 14" stroke={robeColors.accent} strokeWidth="2.5" fill="none" />
              {/* 鬓角 */}
              <path d="M60 20 Q55 30 58 40" fill="url(#hairGrad)" />
              <path d="M100 20 Q105 30 102 40" fill="url(#hairGrad)" />
            </g>
          )}

          {/* ========== 面部 ========== */}
          {/* 眉毛 */}
          <path
            d={isFemale ? "M66 30 Q72 28 78 30" : "M66 29 Q72 27 78 29"}
            stroke="#1a1a2e"
            strokeWidth={isFemale ? "1.2" : "1.8"}
            fill="none"
          />
          <path
            d={isFemale ? "M82 30 Q88 28 94 30" : "M82 29 Q88 27 94 29"}
            stroke="#1a1a2e"
            strokeWidth={isFemale ? "1.2" : "1.8"}
            fill="none"
          />

          {/* 眼睛 */}
          <ellipse cx="72" cy="36" rx="5" ry={isFemale ? "3.5" : "3"} fill="white" />
          <ellipse cx="72" cy="36" rx="3" ry="2.5" fill="url(#eyeGrad)" />
          <ellipse cx="71" cy="35" rx="1" ry="1" fill="white" opacity="0.9" />

          <ellipse cx="88" cy="36" rx="5" ry={isFemale ? "3.5" : "3"} fill="white" />
          <ellipse cx="88" cy="36" rx="3" ry="2.5" fill="url(#eyeGrad)" />
          <ellipse cx="87" cy="35" rx="1" ry="1" fill="white" opacity="0.9" />

          {/* 女性眼线 */}
          {isFemale && (
            <>
              <path d="M67 36 Q72 34 77 36" stroke="#1a1a2e" strokeWidth="0.5" fill="none" />
              <path d="M83 36 Q88 34 93 36" stroke="#1a1a2e" strokeWidth="0.5" fill="none" />
            </>
          )}

          {/* 鼻子 */}
          <path
            d={isFemale ? "M80 38 Q79 42 80 44" : "M80 38 L79 44 L81 44"}
            stroke="#c4a882"
            strokeWidth="0.8"
            fill="none"
          />

          {/* 嘴唇 */}
          <path
            d={isFemale ? "M75 50 Q80 48 85 50 Q80 52 75 50" : "M76 50 Q80 49 84 50"}
            fill={isFemale ? "#c9a0a0" : "#b89a8a"}
          />

          {/* 女性腮红 */}
          {isFemale && (
            <>
              <ellipse cx="66" cy="42" rx="5" ry="2.5" fill="#e8b4b4" opacity="0.25" />
              <ellipse cx="94" cy="42" rx="5" ry="2.5" fill="#e8b4b4" opacity="0.25" />
            </>
          )}
        </g>

        {/* ========== 武器 ========== */}
        <g filter="url(#weaponGlow)">
          {weapon.type === 'sword' && (
            <g transform="translate(145, 20) rotate(25)">
              <path d="M3 0 L3 -70 L5 -70 L5 0" fill={weapon.color} />
              <path d="M3 -70 L4 -80 L5 -70" fill={weapon.color} opacity="0.8" />
              <rect x="0" y="2" width="8" height="5" fill="#c9a227" rx="1" />
              <rect x="2" y="7" width="4" height="18" fill="#3d2817" rx="1" />
              <circle cx="4" cy="27" r="3" fill="#c9a227" />
            </g>
          )}

          {weapon.type === 'blade' && (
            <g transform="translate(140, 15) rotate(20)">
              <path d="M0 0 Q12 -50 8 -85 L4 -85 Q0 -50 0 0" fill={weapon.color} />
              <path d="M4 -85 L4 -10" stroke="white" strokeWidth="0.5" opacity="0.3" />
              <path d="M-2 0 Q6 -2 12 2" stroke="#c9a227" strokeWidth="3" fill="none" />
              <rect x="2" y="5" width="4" height="20" fill="#3d2817" rx="1" />
            </g>
          )}

          {weapon.type === 'heavySword' && (
            <g transform="translate(135, 5) rotate(10)">
              <rect x="0" y="0" width="16" height="90" fill={weapon.color} rx="2" />
              <rect x="2" y="5" width="3" height="80" fill="white" opacity="0.1" />
              <rect x="-3" y="88" width="22" height="10" fill="#1a1a2e" rx="2" />
              <rect x="4" y="98" width="8" height="25" fill="#0d0d1a" rx="2" />
            </g>
          )}

          {weapon.type === 'snakeSword' && (
            <g transform="translate(142, 15) rotate(15)">
              <path d="M0 0 Q15 -25 0 -50 Q-15 -75 0 -95" stroke={weapon.color} strokeWidth="6" fill="none" strokeLinecap="round" />
              <rect x="-2" y="2" width="6" height="18" fill="#3d2817" rx="1" />
            </g>
          )}

          {weapon.type === 'staff' && (
            <g transform="translate(148, -10) rotate(5)">
              <rect x="0" y="0" width="7" height="110" fill={weapon.color} rx="3" />
              <circle cx="3.5" cy="8" r="6" fill="#22c55e" />
              <circle cx="3.5" cy="8" r="4" fill="#16a34a" />
              <rect x="-1" y="102" width="9" height="10" fill="#c9a227" rx="2" />
            </g>
          )}

          {weapon.type === 'pen' && (
            <g transform="translate(148, 30) rotate(20)">
              <rect x="0" y="0" width="5" height="50" fill={weapon.color} rx="1" />
              <polygon points="0,50 2.5,62 5,50" fill="#1a1a2e" />
              <rect x="-1" y="-4" width="7" height="6" fill="#c9a227" rx="1" />
            </g>
          )}

          {weapon.type === 'token' && (
            <g transform="translate(148, 40)">
              <ellipse cx="0" cy="0" rx="18" ry="12" fill={weapon.color} />
              <ellipse cx="0" cy="0" rx="14" ry="9" fill="#991b1b" />
              <text x="0" y="4" textAnchor="middle" fontSize="12" fill="#fbbf24" fontFamily="serif">火</text>
              <path d="M-8 -16 Q0 -28 8 -16 Q0 -10 -8 -16" fill="#f97316" opacity="0.7" />
            </g>
          )}

          {weapon.type === 'darkSword' && (
            <g transform="translate(140, 10) rotate(15)">
              <rect x="0" y="0" width="7" height="85" fill="#1a1a2e" rx="1" />
              <rect x="0" y="0" width="7" height="85" fill="#4c1d95" opacity="0.3">
                <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
              </rect>
              <path d="M3.5 0 L3.5 -15" stroke="#8b5cf6" strokeWidth="3" opacity="0.8">
                <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
              </path>
              <rect x="-5" y="85" width="17" height="8" fill="#1f2937" rx="1" />
              <rect x="1" y="93" width="5" height="18" fill="#0d0d1a" rx="1" />
            </g>
          )}

          {weapon.type === 'relic' && (
            <g transform="translate(148, 45)">
              <circle cx="0" cy="0" r="15" fill={weapon.color} />
              <circle cx="0" cy="0" r="10" fill="#f59e0b" />
              <circle cx="0" cy="0" r="5" fill="#fbbf24" />
              <circle cx="0" cy="0" r="22" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.4">
                <animate attributeName="r" values="18;24;18" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0.15;0.4" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          )}

          {weapon.type === 'whip' && (
            <g transform="translate(145, 35) rotate(10)">
              <path d="M0 0 Q20 15 15 40 Q10 65 20 90 Q25 105 15 115" stroke={weapon.color} strokeWidth="5" fill="none" strokeLinecap="round" />
              <circle cx="15" cy="115" r="4" fill="#78350f" />
            </g>
          )}

          {weapon.type === 'fist' && (
            <g>
              <ellipse cx="25" cy="165" rx="10" ry="12" fill="url(#skinGrad)" stroke="#c9a227" strokeWidth="0.5" />
              <ellipse cx="152" cy="48" rx="10" ry="12" fill="url(#skinGrad)" stroke="#c9a227" strokeWidth="0.5" transform="rotate(-15, 150, 50)" />
            </g>
          )}
        </g>
      </svg>

      {/* 名字和等级 */}
      <div style={{
        transform: isLeft ? 'scaleX(1)' : 'scaleX(-1)',
        textAlign: 'center',
        marginTop: '0px',
      }}>
        <div style={{
          fontSize: '1.1rem',
          color: 'var(--gold)',
          fontFamily: '"Ma Shan Zheng", cursive',
          letterSpacing: '2px',
          textShadow: '0 0 15px rgba(212, 175, 55, 0.6)',
          fontWeight: 'bold',
        }}>
          {player.name}
        </div>
        <div style={{
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          marginTop: '2px',
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <span>Lv.{player.level}</span>
          <span style={{ color: 'var(--gold)' }}>⚔ {weapon.name}</span>
        </div>
      </div>
    </div>
  );
};

export default function BattleArena() {
  const player = useGameStore(state => state.player);
  const battleState = useGameStore(state => state.battleState);
  const { inBattle, p1, p2, logs, winner, roomId } = battleState;
  const sendBattleAction = useGameStore(state => state.sendBattleAction);
  const exitBattle = useGameStore(state => state.exitBattle);
  
  // Auto-scroll removed as requested


  useEffect(() => {
    if (!inBattle || winner || !p1 || !p2) return;
    if (p1.name !== player.name) return;

    const timer = setTimeout(() => {
      const isP1Turn = Math.random() < (p1.attributes.agi / (p1.attributes.agi + p2.attributes.agi + 1));
      let actionData = {};

      let attacker = { ... (isP1Turn ? p1 : p2) };
      let defender = { ... (isP1Turn ? p2 : p1) };
      const attackerKey = isP1Turn ? 'p1' : 'p2';
      const defenderKey = isP1Turn ? 'p2' : 'p1';

      if (!attacker.buffs) attacker.buffs = { dodge: 0, defUp: 0, shield: 0, revive: 0 };
      if (!defender.buffs) defender.buffs = { dodge: 0, defUp: 0, shield: 0, revive: 0 };
      if (!attacker.debuffs) attacker.debuffs = { stun: 0, poison: 0, silence: 0, internalWound: 0, poisonPercent: 0.03 };
      if (!defender.debuffs) defender.debuffs = { stun: 0, poison: 0, silence: 0, internalWound: 0, poisonPercent: 0.03 };

      const getTreasure = (id) => typeof TREASURES_DB !== 'undefined' ? TREASURES_DB.find(t=>t.id===id) : null;
      const aTreasure = getTreasure(attacker.equippedTreasure);
      const dTreasure = getTreasure(defender.equippedTreasure);

      const checkImmune = (playerObj, tObj, debuffType) => {
         if (tObj?.effect === 'jiMie') return true; // 绝世好剑全免疫
         if (tObj?.effect === 'ruanWei' && (debuffType==='stun'||debuffType==='poison')) return true;
         if (tObj?.effect === 'jinShe' && debuffType==='poison') return true;
         return false;
      };

      let logCount = logs.length;
      let logPrefix = "";

      // 开局特效判定 (木质佛珠, 圣火令)
      if (logCount === 1) { 
         if (aTreasure?.effect === 'ningShen') {
             attacker.buffs.shield += Math.floor(attacker.maxHp * 0.05);
             logPrefix += `[开局] ${attacker.name} 的【木质佛珠】泛起佛光，获得了护盾！\n`;
         }
         if (dTreasure?.effect === 'ningShen') {
             defender.buffs.shield += Math.floor(defender.maxHp * 0.05);
             logPrefix += `[开局] ${defender.name} 的【木质佛珠】泛起佛光，获得了护盾！\n`;
         }
         if (aTreasure?.effect === 'shengHuo' && !checkImmune(defender, dTreasure, 'silence')) {
             defender.debuffs.silence = 2;
             logPrefix += `[开局] ${attacker.name} 亮出【圣火令】，发出无上威压，封锁了 ${defender.name}！\n`;
         }
         if (dTreasure?.effect === 'shengHuo' && !checkImmune(attacker, aTreasure, 'silence')) {
             attacker.debuffs.silence = 2;
             logPrefix += `[开局] ${defender.name} 亮出【圣火令】，发出无上威压，封锁了 ${attacker.name}！\n`;
         }
      }

      // 中毒结算
      if (attacker.debuffs.poison > 0) {
         const poisonPct = attacker.debuffs.poisonPercent || 0.03;
         const pDmg = Math.max(1, Math.floor(attacker.maxHp * poisonPct));
         attacker.hp = Math.max(0, attacker.hp - pDmg);
         attacker.debuffs.poison--;
         if (attacker.debuffs.poison === 0) {
             attacker.debuffs.poisonPercent = 0.03;
         }
         logPrefix += `[中毒] ${attacker.name} 毒发，丧失了 ${pDmg} 气血！\n`;
      }

      let actionLog = "";
      if (attacker.debuffs.stun > 0) {
         attacker.debuffs.stun--;
         actionLog = `${attacker.name} 处于【晕眩】中，只能呆立当场，无法动弹！`;
      } else if (attacker.dailyDebuffs?.includes('心魔劫') && Math.random() < 0.15) {
         actionLog = `[心魔发作] ${attacker.name} 突然心神失守，招式走形破绽大开，错失了良机！`;
      } else {
         // 选择技能
         const eq = attacker.equippedSkills || {};
         let skillIds = [eq.inner, eq.outer, eq.motion, eq.ultimate].filter(Boolean);
         if (attacker.debuffs.silence > 0) {
             skillIds = ['s1']; // 被封穴或威压，只能平A基本拳脚
             attacker.debuffs.silence--;
         } else if (attacker.debuffs.internalWound > 0) {
             skillIds = [eq.outer].filter(Boolean); // 内伤只能外功
             if (skillIds.length===0) skillIds = ['s1'];
             attacker.debuffs.internalWound--;
         }

         const pickSkill = () => {
            if (skillIds.length === 0) return SKILLS_DB[0];
            let totalWeight = 0;
            const weighted = skillIds.map(sId => {
               const sk = SKILLS_DB.find(s=>s.id===sId) || SKILLS_DB[0];
               const weight = 100 + (sk.power / 10) * (attacker.attributes.int || 0) * 1.5;
               totalWeight += weight;
               return { skill: sk, weight };
            });
            let rand = Math.random() * totalWeight;
            for (const item of weighted) {
               if (rand < item.weight) return item.skill;
               rand -= item.weight;
            }
            return weighted[weighted.length - 1].skill;
         };
         const skill = pickSkill();
         
         const aStr = attacker.dailyDebuffs?.includes('散功劫') ? Math.max(0, attacker.attributes.str - 5) : attacker.attributes.str;
         const dCon = defender.dailyDebuffs?.includes('散功劫') ? Math.max(0, defender.attributes.con - 5) : defender.attributes.con;

         const pAtk = aStr * 2 + attacker.level * 5;
         const dDefBase = dCon * 2 + defender.level * 2;
         const aMod = 1 + attacker.level * 0.05;
         const adjustedSkillPwr = skill.power * aMod;

         if (skill.id === 's5' || skill.id === 's_yijin') {
            attacker.buffs.defUp = 3;
            actionLog = `${attacker.name} 催动【${skill.name}】，真气护体，防御力大增！`;
            if (skill.id === 's_yijin' && attacker.debuffs.poison > 0) {
                attacker.debuffs.poison = 0;
                actionLog += ` 易筋经内力激荡，体内剧毒被猛然逼出！`;
            }
         } else if (skill.id === 's4' || skill.id === 's_tiyun') { 
            attacker.buffs.dodge = 3;
            actionLog = `${attacker.name} 施展【${skill.name}】，身形变幻莫测，闪避率大幅提升！`;
         } else if (skill.id === 's_shenxing') {
            attacker.buffs.dodge = 99;
            actionLog = `${attacker.name} 施展出【${skill.name}】，犹如鬼魅不可捉摸，难以命中！`;
         } else if (skill.id === 's_shengxin') {
            attacker.buffs.revive = 1;
            actionLog = `${attacker.name} 运转【${skill.name}】，生死二气护住心脉（获得涅槃重生状态）！`;
         } else if (skill.type === 'heal') {
            const healAmt = Math.floor(adjustedSkillPwr + attacker.attributes.int * 2 + 30);
            attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmt);
            actionLog = `${attacker.name} 运转内力使出【${skill.name}】，恢复了 ${healAmt} 点气血！`;
         } else if (skill.type === 'buff' || skill.type === 'motion' || skill.power === 0) {
            attacker.buffs.dodge = 2;
            actionLog = `${attacker.name} 施展【${skill.name}】，气势如虹！`;
         } else {
            // 判定闪避（眩晕时无法闪避）
            let canDodge = aTreasure?.effect !== 'xuanTie' && defender.debuffs.stun === 0;
            let isDodge = false;
            if (canDodge) {
               isDodge = Math.random() < (defender.attributes.agi * 0.005);
               if (defender.buffs.dodge > 0) isDodge = Math.random() < 0.45;
            }
            
            if (isDodge) {
               actionLog = `${attacker.name} 施展【${skill.name}】，却被 ${defender.name} 巧妙躲开！`;
            } else {
               let finalDef = dDefBase * 1;
               if (defender.buffs.defUp > 0) finalDef *= 3;
               
               let dmg = Math.floor(pAtk + adjustedSkillPwr - finalDef);
               
               // 攻击者宝具特化加成
               if (aTreasure?.effect === 'poShang') dmg += 50; 
               if (aTreasure?.effect === 'yiTian') dmg = Math.floor(dmg * 1.2);
               if (aTreasure?.effect === 'tuLong' && (attacker.hp / attacker.maxHp) < 0.4) dmg = Math.floor(dmg * 1.5);
               if (aTreasure?.effect === 'shengHuo') dmg += Math.floor(defender.hp * 0.05);

               // 防御者宝具特化减伤
               if (dTreasure?.effect === 'qingQiao') dmg -= 30;
               if (dTreasure?.effect === 'tuLong' && (defender.hp / defender.maxHp) < 0.4) dmg = Math.floor(dmg * 0.8);
               
               dmg = Math.max(1, dmg);

               // 绝世好剑判定
               if (aTreasure?.effect === 'jiMie' && Math.random() < 0.05) {
                   dmg = Math.floor(defender.hp * 0.5);
                   actionLog = `[寂灭] ${attacker.name} 的【绝世好剑】闪烁黑芒，直接斩去 ${defender.name} ${dmg} 气血！ `;
               }

               // 扣盾
               if (defender.buffs.shield > 0) {
                   if (defender.buffs.shield >= dmg) {
                      defender.buffs.shield -= dmg;
                      dmg = 0;
                   } else {
                      dmg -= defender.buffs.shield;
                      defender.buffs.shield = 0;
                   }
               }
               defender.hp = Math.max(0, defender.hp - dmg);
               
               // 吸血/回春判定
               if (dmg > 0 && aTreasure?.effect === 'huiChun') {
                   attacker.hp = Math.min(attacker.maxHp, attacker.hp + Math.floor(attacker.maxHp * 0.02));
               }
               if (dmg > 0 && aTreasure?.effect === 'yiTian') {
                   attacker.hp = Math.min(attacker.maxHp, Math.floor(attacker.hp + dmg * 0.15));
               }

               if (!actionLog.includes('[寂灭]')) {
                  const actStr = isP1Turn ? '施展绝技' : '使出';
                  actionLog = `${attacker.name} ${actStr}【${skill.name}】，对 ${defender.name} 造成了 ${dmg} 点伤害！`;
               }

               if (dmg > 0 && dTreasure?.effect === 'ruanWei') {
                  const rDmg = Math.floor(dmg * 0.15);
                  attacker.hp -= rDmg;
                  actionLog += `\n[软猬荆棘] 尖刺反伤，${attacker.name} 受到了 ${rDmg} 点伤害！`;
               }

               // 连击判定
               if (aTreasure?.effect === 'jinShe' && defender.hp > 0 && Math.random() <= 0.20) {
                   const comboDmg = Math.max(1, Math.floor(dmg * 0.5));
                   defender.hp = Math.max(0, defender.hp - comboDmg);
                   actionLog += `\n[金蛇出洞] ${attacker.name} 挥出虚影追加一击，造成 ${comboDmg} 伤害！`;
               }

               if (dmg > 0 && skill.id === 's_xixing') {
                   const drainAmt = Math.floor(dmg * 0.8);
                   attacker.hp = Math.min(attacker.maxHp, attacker.hp + drainAmt);
                   actionLog += ` \n[吸星大法] 夺取了 ${drainAmt} 点气血化为己用！`;
               }

               // 特效施加判定
               if (defender.hp > 0) {
                  if (skill.id === 's_du' && !checkImmune(defender, dTreasure, 'poison')) {
                      defender.debuffs.poison = 999;
                      defender.debuffs.poisonPercent = 0.07;
                      actionLog += ` \n[万毒] ${defender.name} 身中奇毒，骨髓俱损！`;
                  }
                  if (skill.id === 's_shihou' && Math.random() <= 0.6 && !checkImmune(defender, dTreasure, 'stun')) {
                      defender.debuffs.stun = 1;
                      actionLog += ` \n[狮吼] 震耳欲聋，${defender.name} 被当场震晕！`;
                  }
                  if (skill.id === 's_dianxue' && Math.random() <= 0.8 && !checkImmune(defender, dTreasure, 'silence')) {
                      defender.debuffs.silence = 2;
                      actionLog += ` \n[点穴] ${defender.name} 要穴被封，无法动用武学！`;
                  }
                  if (skill.id === 's_liumai' && Math.random() <= 0.5 && !checkImmune(defender, dTreasure, 'internalWound')) {
                      defender.debuffs.internalWound = 2;
                      actionLog += ` \n[六脉] 无形剑气震伤内腑，${defender.name} 经脉受损，难以催动内力！`;
                  }

                  if (aTreasure?.effect === 'dianXue' && Math.random() <= 0.10 && !checkImmune(defender, dTreasure, 'silence')) {
                     defender.debuffs.silence = 1;
                     actionLog += ` \n[宝具] ${defender.name} 被判官笔点中要穴，下回合被封印！`;
                  }
                  if (aTreasure?.effect === 'juDu' && Math.random() <= 0.15 && !checkImmune(defender, dTreasure, 'poison')) {
                     defender.debuffs.poison = 3;
                     actionLog += ` \n[宝具] 冰魄银针刺入，${defender.name} 身中剧毒！`;
                  }
                  if (aTreasure?.effect === 'daGou' && Math.random() <= 0.15 && !checkImmune(defender, dTreasure, 'stun')) {
                     defender.debuffs.stun = 1;
                     actionLog += ` \n[宝具] 打狗棒击中后脑，${defender.name} 当场晕眩！`;
                  }
                  if (aTreasure?.effect === 'xuanTie' && Math.random() <= 0.20 && !checkImmune(defender, dTreasure, 'internalWound')) {
                     defender.debuffs.internalWound = 2;
                     actionLog += ` \n[宝具] 玄铁重剑霸道无比，震得 ${defender.name} 吐血内伤！`;
                  }
               }
            }
         }
      }

      if (attacker.buffs.dodge > 0) attacker.buffs.dodge--;
      if (attacker.buffs.defUp > 0) attacker.buffs.defUp--;

      // 达摩舍利与圣心诀复活判定
      if (attacker.hp <= 0 && aTreasure?.effect === 'niePan' && !attacker.hasRevived) {
          attacker.hp = Math.floor(attacker.maxHp * 0.5);
          attacker.debuffs = { stun: 0, poison: 0, silence: 0, internalWound: 0, poisonPercent: 0.03 };
          attacker.hasRevived = true;
          actionLog += `\n[涅槃] ${attacker.name} 达摩舍利碎裂，原地满血复活！`;
      } else if (attacker.hp <= 0 && attacker.buffs.revive > 0) {
          attacker.hp = Math.floor(attacker.maxHp * 0.5);
          attacker.debuffs = { stun: 0, poison: 0, silence: 0, internalWound: 0, poisonPercent: 0.03 };
          attacker.buffs.revive--;
          actionLog += `\n[圣心涅槃] ${attacker.name} 凭借圣心诀真气，强行起死回生！`;
      }

      if (defender.hp <= 0 && dTreasure?.effect === 'niePan' && !defender.hasRevived) {
          defender.hp = Math.floor(defender.maxHp * 0.5);
          defender.debuffs = { stun: 0, poison: 0, silence: 0, internalWound: 0, poisonPercent: 0.03 };
          defender.hasRevived = true;
          actionLog += `\n[涅槃] ${defender.name} 达摩舍利碎裂，奇迹般续命！`;
      } else if (defender.hp <= 0 && defender.buffs.revive > 0) {
          defender.hp = Math.floor(defender.maxHp * 0.5);
          defender.debuffs = { stun: 0, poison: 0, silence: 0, internalWound: 0, poisonPercent: 0.03 };
          defender.buffs.revive--;
          actionLog += `\n[圣心涅槃] ${defender.name} 凭借圣心诀真气，强行起死回生！`;
      }

      const finalLog = logPrefix + actionLog;
      actionData = { log: finalLog };
      actionData[attackerKey] = attacker;
      actionData[defenderKey] = defender;

      if (attacker.hp <= 0) {
        actionData.winner = defenderKey; 
        actionData.log += `\n[系统] 决斗结束！大侠 ${defender.name} 绝地反击，赢得了胜利！`;
      } else if (defender.hp <= 0) { 
        actionData.winner = attackerKey; 
        actionData.log += isP1Turn 
          ? `\n[系统] 决斗结束！大侠 ${attacker.name} 击落苍穹，取得了胜利！`
          : `\n[系统] 决斗结束！很遗憾，${defender.name} 血战不敌，含恨败北！`;
      }
      
      sendBattleAction(roomId, actionData);
    }, 1500);

    return () => clearTimeout(timer);
  }, [inBattle, p1, p2, winner, player.name, roomId, sendBattleAction]);

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
       {/* 顶部装饰 */}
       <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: 'linear-gradient(90deg, transparent, var(--crimson), transparent)', opacity: 0.5 }} />

       <h2 style={{ fontSize: '1.8rem', color: 'var(--crimson)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '3px' }}>
        <Swords /> ✦ 竞技对决 ✦
      </h2>
      
      {!inBattle ? (
         <div style={{ textAlign: 'center', marginTop: '4rem' }}>
         <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.8' }}>当前并未在切磋回合中。<br/>请前往【风云榜】中向真实的在线高手下发战书！</p>
       </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* 战斗角色形象区域 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%)',
            padding: '1.5rem 2rem',
            borderRadius: '12px',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '280px',
          }}>
            {/* 背景装饰 - 战场氛围 */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(ellipse at 20% 50%, rgba(0, 168, 107, 0.15), transparent 45%),
                radial-gradient(ellipse at 80% 50%, rgba(220, 20, 60, 0.15), transparent 45%),
                radial-gradient(circle at 50% 100%, rgba(212, 175, 55, 0.1), transparent 50%)
              `,
              pointerEvents: 'none',
            }} />

            {/* 剑气装饰线 */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '30%',
              right: '30%',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, var(--crimson), var(--gold), var(--crimson), transparent)',
              opacity: 0.4,
              transform: 'translateY(-50%)',
              filter: 'blur(1px)',
            }} />

            {/* 玩家1区域 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              zIndex: 1,
              flex: 1,
            }}>
              <WarriorAvatar player={p1} isLeft={true} />
              <div style={{ width: '160px', marginTop: '5px' }}>
                <div className="wuxia-progress" style={{ height: '10px' }}>
                  <div className="wuxia-progress-bar" style={{
                    width: `${(p1?.hp / p1?.maxHp) * 100}%`,
                    background: 'linear-gradient(90deg, #059669, #10b981, #34d399)'
                  }} />
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  marginTop: '6px',
                  color: '#10b981',
                  fontFamily: '"Ma Shan Zheng", cursive',
                  letterSpacing: '1px',
                }}>
                  {Math.floor(p1?.hp || 0)} / {Math.floor(p1?.maxHp || 7000)}
                </div>
              </div>
            </div>

            {/* VS标志 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 1,
              padding: '0 1rem',
            }}>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {/* 剑交叉背景 */}
                <div style={{
                  position: 'absolute',
                  fontSize: '4rem',
                  opacity: 0.1,
                  color: 'var(--gold)',
                }}>⚔</div>
                <h3 style={{
                  color: 'var(--crimson)',
                  filter: 'drop-shadow(0 0 15px var(--crimson)) drop-shadow(0 0 30px rgba(220, 20, 60, 0.5))',
                  fontFamily: '"Ma Shan Zheng", cursive',
                  fontSize: '2.2rem',
                  letterSpacing: '6px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                  position: 'relative',
                  zIndex: 1,
                }}>
                  VS
                </h3>
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: 'var(--gold)',
                marginTop: '0.8rem',
                fontFamily: '"Ma Shan Zheng", cursive',
                letterSpacing: '2px',
                background: 'rgba(0,0,0,0.4)',
                padding: '4px 12px',
                borderRadius: '4px',
                border: '1px solid rgba(212, 175, 55, 0.3)',
              }}>
                第 {logs?.length || 1} 回合
              </div>
            </div>

            {/* 玩家2区域 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              zIndex: 1,
              flex: 1,
            }}>
              <WarriorAvatar player={p2} isLeft={false} />
              <div style={{ width: '160px', marginTop: '5px' }}>
                <div className="wuxia-progress" style={{ height: '10px' }}>
                  <div className="wuxia-progress-bar" style={{
                    width: `${(p2?.hp / p2?.maxHp) * 100}%`,
                    background: 'linear-gradient(90deg, #dc2626, #ef4444, #f87171)'
                  }} />
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  marginTop: '6px',
                  color: '#ef4444',
                  fontFamily: '"Ma Shan Zheng", cursive',
                  letterSpacing: '1px',
                }}>
                  {Math.floor(p2?.hp || 0)} / {Math.floor(p2?.maxHp || 7000)}
                </div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, background: 'var(--bg-color)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: '"Courier New", monospace', fontSize: '1rem' }}>
            {logs.map((log, i) => (
              <div key={i} style={{
                color: log.includes('系统') ? 'var(--gold)' : log.includes(player.name) ? 'var(--text-main)' : 'var(--crimson)',
                fontWeight: log.includes('系统') ? 'bold' : 'normal',
                whiteSpace: 'pre-line',
                animation: 'slideUp 0.3s',
                padding: log.includes('系统') ? '8px' : '0',
                background: log.includes('系统') ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                borderRadius: '4px'
              }}>
                {log}
              </div>
            ))}
          </div>

          {winner && (
            <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={exitBattle}>退下调息 (返回)</button>
          )}
        </div>
      )}
    </div>
  );
}

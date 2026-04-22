import React, { useEffect, useRef, useMemo } from 'react';
import { useGameStore, SKILLS_DB, TREASURES_DB } from '../store/gameState';
import { Swords } from 'lucide-react';

// 根据名字判断性别（武侠名字特征）
const guessGenderByName = (name) => {
  const femaleKeywords = ['邀月', '灭绝', '童姥', '小龙女', '黄蓉', '赵敏', '周芷若', '王语嫣', '阿朱', '阿紫', '木婉清', '任盈盈', '岳灵珊', '仪琳', '程灵素', '袁紫衣', '李莫愁', '郭芙', '郭襄', '穆念慈', '包惜弱', '瑛姑', '瑛', '月', '仙', '姬', '姬', '娘', '姑', '婆', '妹', '姐', '女', '芳', '莲', '梅', '兰', '竹', '菊', '雪', '霜', '云', '霞', '玉', '珠', '翠', '红', '燕', '莺', '凤', '鸾', '娟', '婷', '婉', '柔', '嫣', '瑶', '薇', '蕾', '露', '涵', '晴', '雨', '烟', '琳', '瑾', '颖', '萱', '蕊', '黛', '芷', '芸', '梦', '舞', '琴', '瑶'];
  const maleKeywords = ['僧', '道', '侠', '峰', '誉', '虚竹', '乔峰', '郭靖', '杨过', '令狐冲', '张无忌', '段誉', '虚竹', '张三丰', '王重阳', '洪七公', '欧阳锋', '黄药师', '周伯通', '一灯', '金轮', '鸠摩智', '慕容复', '丁春秋', '游坦之', '段延庆', '叶二娘', '岳不群', '左冷禅', '林平之', '宋青书', '武三通', '朱子柳', '武敦儒', '武修文', '完颜洪烈', '欧阳克', '杨康', '穆念慈', '柯镇恶', '朱聪', '韩宝驹', '南希仁', '张阿生', '全金发', '韩小莹', '丘处机', '马钰', '王处一', '谭处端', '刘处玄', '郝大通', '孙不二', '鲁有脚', '彭长老', '简长老', '梁长老', '冯默风', '曲灵风', '陆乘风', '武眠风', '程英', '傻姑', '陆冠英', '耶律齐', '耶律燕', '完颜萍', '公孙止', '裘千尺', '樊一翁', '何足道', '觉远', '无色', '无相', '天鸣', '无色', '心禅', '达摩', '方证', '冲虚', '向问天', '任我行', '东方不败', '风清扬', '莫大', '刘正风', '曲洋', '丁勉', '陆柏', '费彬', '成不忧', '丛不弃', '封不平', '岳灵珊', '劳德诺', '梁发', '施戴子', '高根明', '陆大有', '陶钧', '英白罗', '舒奇'];

  for (const keyword of femaleKeywords) {
    if (name?.includes(keyword)) return 'female';
  }
  for (const keyword of maleKeywords) {
    if (name?.includes(keyword)) return 'male';
  }

  // 默认根据名字长度和字符判断
  const lastChar = name?.slice(-1) || '';
  const femaleEndings = ['月', '雪', '霜', '云', '霞', '玉', '珠', '翠', '红', '燕', '莺', '凤', '鸾', '娟', '婷', '婉', '柔', '嫣', '瑶', '薇', '蕾', '露', '涵', '晴', '雨', '烟', '琳', '瑾', '颖', '萱', '蕊', '黛', '芷', '芸', '梦', '舞', '琴', '仙', '姬', '娘', '姑', '婆', '妹', '姐', '女', '芳', '莲', '梅', '兰', '竹', '菊'];
  if (femaleEndings.includes(lastChar)) return 'female';

  return 'male';
};

// 精美武侠角色形象组件
const WarriorAvatar = ({ player, isLeft }) => {
  if (!player) return null;

  const gender = useMemo(() => guessGenderByName(player.name), [player.name]);
  const isFemale = gender === 'female';

  // 根据属性计算外观特征
  const strRatio = Math.min(1, (player.attributes?.str || 0) / 80);
  const agiRatio = Math.min(1, (player.attributes?.agi || 0) / 80);
  const conRatio = Math.min(1, (player.attributes?.con || 0) / 80);
  const intRatio = Math.min(1, (player.attributes?.int || 0) / 80);

  // 根据装备的宝物决定武器样式
  const treasure = TREASURES_DB?.find(t => t.id === player.equippedTreasure);
  const treasureEffect = treasure?.effect || '';

  // 武器样式映射
  const getWeaponStyle = () => {
    if (treasureEffect === 'yiTian') return { type: 'sword', color: '#c9a227', glowColor: 'rgba(201, 162, 39, 0.6)', name: '倚天剑' };
    if (treasureEffect === 'tuLong') return { type: 'blade', color: '#8b0000', glowColor: 'rgba(139, 0, 0, 0.6)', name: '屠龙刀' };
    if (treasureEffect === 'xuanTie') return { type: 'heavySword', color: '#2d3748', glowColor: 'rgba(45, 55, 72, 0.6)', name: '玄铁重剑' };
    if (treasureEffect === 'jinShe') return { type: 'snakeSword', color: '#d4af37', glowColor: 'rgba(212, 175, 55, 0.6)', name: '金蛇剑' };
    if (treasureEffect === 'daGou') return { type: 'staff', color: '#8b4513', glowColor: 'rgba(139, 69, 19, 0.6)', name: '打狗棒' };
    if (treasureEffect === 'dianXue') return { type: 'pen', color: '#4a5568', glowColor: 'rgba(74, 85, 104, 0.6)', name: '判官笔' };
    if (treasureEffect === 'shengHuo') return { type: 'token', color: '#dc2626', glowColor: 'rgba(220, 38, 38, 0.8)', name: '圣火令' };
    if (treasureEffect === 'jiMie') return { type: 'darkSword', color: '#1a1a2e', glowColor: 'rgba(99, 102, 241, 0.6)', name: '绝世好剑' };
    if (treasureEffect === 'niePan') return { type: 'relic', color: '#fbbf24', glowColor: 'rgba(251, 191, 36, 0.8)', name: '达摩舍利' };
    if (treasureEffect === 'ruanWei') return { type: 'whip', color: '#78350f', glowColor: 'rgba(120, 53, 15, 0.6)', name: '软猬甲' };
    return { type: 'fist', color: '#d4af37', glowColor: 'rgba(212, 175, 55, 0.4)', name: '拳脚' };
  };

  const weapon = getWeaponStyle();

  // 根据等级决定服装颜色
  const getRobeColors = () => {
    const level = player.level || 1;
    if (level >= 90) return { primary: '#1a1a2e', secondary: '#2d2d44', accent: '#ffd700', trim: '#c9a227' };
    if (level >= 70) return { primary: '#1e3a5f', secondary: '#2c5282', accent: '#e2e8f0', trim: '#a0aec0' };
    if (level >= 50) return { primary: '#2d3748', secondary: '#4a5568', accent: '#e53e3e', trim: '#c53030' };
    if (level >= 30) return { primary: '#285e61', secondary: '#2c7a7b', accent: '#81e6d9', trim: '#38b2ac' };
    if (level >= 15) return { primary: '#322659', secondary: '#44337a', accent: '#b794f4', trim: '#9f7aea' };
    return { primary: '#3d3d3d', secondary: '#4a4a4a', accent: '#a0a0a0', trim: '#808080' };
  };

  const robeColors = getRobeColors();

  // 根据装备的内功决定气场颜色
  const innerSkill = player.equippedSkills?.inner;
  let auraColor = 'rgba(212, 175, 55, 0.15)';
  let auraOuterColor = 'rgba(212, 175, 55, 0.05)';
  if (innerSkill === 's_yijin') {
    auraColor = 'rgba(139, 92, 246, 0.2)';
    auraOuterColor = 'rgba(139, 92, 246, 0.08)';
  } else if (innerSkill === 's5') {
    auraColor = 'rgba(251, 191, 36, 0.2)';
    auraOuterColor = 'rgba(251, 191, 36, 0.08)';
  } else if (innerSkill === 's_xixing') {
    auraColor = 'rgba(220, 38, 38, 0.2)';
    auraOuterColor = 'rgba(220, 38, 38, 0.08)';
  } else if (innerSkill === 's_shihou') {
    auraColor = 'rgba(234, 88, 12, 0.2)';
    auraOuterColor = 'rgba(234, 88, 12, 0.08)';
  }

  // 体型参数
  const bodyScale = isFemale ? 0.9 : 1 + strRatio * 0.15;
  const shoulderWidth = isFemale ? 38 : 42 + strRatio * 8;
  const waistWidth = isFemale ? 28 : 32 + conRatio * 4;

  // 发型选择
  const getHairStyle = () => {
    const styles = isFemale
      ? ['longFlowing', 'elegantBun', 'braided']
      : ['topknot', 'flowing', 'warrior'];
    // 根据敏捷选择发型
    const styleIndex = Math.floor(agiRatio * 2.99);
    return styles[Math.min(styleIndex, styles.length - 1)];
  };

  const hairStyle = getHairStyle();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      transform: isLeft ? 'scaleX(1)' : 'scaleX(-1)',
      position: 'relative',
    }}>
      {/* 气场光晕 */}
      <div style={{
        position: 'absolute',
        width: '180px',
        height: '220px',
        top: '-20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: `radial-gradient(ellipse at 50% 40%, ${auraColor}, ${auraOuterColor} 60%, transparent 80%)`,
        filter: 'blur(15px)',
        animation: 'auraPulse 3s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* 角色SVG - 更大更精细 */}
      <svg width="140" height="200" viewBox="0 0 140 200" style={{
        filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))',
        transform: `scale(${bodyScale})`,
        transformOrigin: 'center bottom',
      }}>
        <defs>
          {/* 皮肤渐变 */}
          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5e6d3" />
            <stop offset="50%" stopColor="#e8d4be" />
            <stop offset="100%" stopColor="#d4c4a8" />
          </linearGradient>

          {/* 头发渐变 */}
          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="50%" stopColor="#16162a" />
            <stop offset="100%" stopColor="#0d0d1a" />
          </linearGradient>

          {/* 长袍渐变 */}
          <linearGradient id="robeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={robeColors.primary} />
            <stop offset="40%" stopColor={robeColors.secondary} />
            <stop offset="100%" stopColor={robeColors.primary} />
          </linearGradient>

          {/* 长袍高光 */}
          <linearGradient id="robeHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="30%" stopColor={robeColors.accent} stopOpacity="0.15" />
            <stop offset="70%" stopColor={robeColors.accent} stopOpacity="0.1" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          {/* 武器光效 */}
          <filter id="weaponGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* 内衣/内衬渐变 */}
          <linearGradient id="innerRobeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2d2d44" />
            <stop offset="100%" stopColor="#1a1a2e" />
          </linearGradient>

          {/* 腰带渐变 */}
          <linearGradient id="beltGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={robeColors.trim} />
            <stop offset="50%" stopColor={robeColors.accent} />
            <stop offset="100%" stopColor={robeColors.trim} />
          </linearGradient>

          {/* 眼睛渐变 */}
          <radialGradient id="eyeGrad" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#4a3728" />
            <stop offset="100%" stopColor="#1a1a2e" />
          </radialGradient>

          {/* 嘴唇渐变 */}
          <linearGradient id="lipGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isFemale ? "#c9a0a0" : "#b89a8a"} />
            <stop offset="100%" stopColor={isFemale ? "#a08080" : "#9a8080"} />
          </linearGradient>
        </defs>

        {/* ========== 身体部分 ========== */}

        {/* 长袍主体 - 更精细的形状 */}
        <g>
          {/* 后摆 */}
          <path
            d={`M70 75
                Q${70 - shoulderWidth} 80 ${70 - waistWidth - 15} 195
                L${70 + waistWidth + 15} 195
                Q${70 + shoulderWidth} 80 70 75`}
            fill="url(#robeGrad)"
            stroke={robeColors.trim}
            strokeWidth="0.5"
          />

          {/* 前摆 */}
          <path
            d={`M70 75
                Q${70 - shoulderWidth + 5} 85 ${70 - waistWidth - 5} 190
                L${70 + waistWidth + 5} 190
                Q${70 + shoulderWidth - 5} 85 70 75`}
            fill="url(#robeGrad)"
            opacity="0.95"
          />

          {/* 衣服褶皱和高光 */}
          <path
            d={`M${70 - shoulderWidth + 10} 90 Q${70 - waistWidth} 140 ${70 - waistWidth - 3} 185`}
            stroke={robeColors.accent}
            strokeWidth="1"
            fill="none"
            opacity="0.3"
          />
          <path
            d={`M${70 + shoulderWidth - 10} 90 Q${70 + waistWidth} 140 ${70 + waistWidth + 3} 185`}
            stroke={robeColors.accent}
            strokeWidth="1"
            fill="none"
            opacity="0.3"
          />

          {/* 中线装饰 */}
          <line x1="70" y1="80" x2="70" y2="185" stroke={robeColors.trim} strokeWidth="1" opacity="0.4" />

          {/* 领口 */}
          <path
            d={`M${70 - 12} 60 Q${70 - 8} 70 70 72 Q${70 + 8} 70 ${70 + 12} 60`}
            fill="url(#innerRobeGrad)"
            stroke={robeColors.trim}
            strokeWidth="0.5"
          />
        </g>

        {/* 腰带 */}
        <g>
          <rect
            x={70 - waistWidth - 2}
            y="115"
            width={waistWidth * 2 + 4}
            height="12"
            fill="url(#beltGrad)"
            rx="2"
          />
          {/* 腰带装饰 */}
          <circle cx="70" cy="121" r="4" fill={robeColors.accent} stroke={robeColors.trim} strokeWidth="1" />
          <rect x="66" y="118" width="8" height="6" fill={robeColors.trim} rx="1" />
        </g>

        {/* ========== 手臂和手 ========== */}
        <g>
          {/* 左臂 */}
          <path
            d={`M${70 - shoulderWidth + 5} 78
                Q${70 - shoulderWidth - 15} 100 ${70 - shoulderWidth - 10} 130
                Q${70 - shoulderWidth - 8} 145 ${70 - shoulderWidth - 5} 150`}
            fill="url(#robeGrad)"
            stroke={robeColors.trim}
            strokeWidth="0.5"
          />
          {/* 左手 */}
          <ellipse cx={70 - shoulderWidth - 3} cy="155" rx="6" ry="8" fill="url(#skinGrad)" />

          {/* 右臂 - 持武器姿势 */}
          <path
            d={`M${70 + shoulderWidth - 5} 78
                Q${70 + shoulderWidth + 20} 95 ${70 + shoulderWidth + 25} 85
                Q${70 + shoulderWidth + 30} 75 ${70 + shoulderWidth + 35} 70`}
            fill="url(#robeGrad)"
            stroke={robeColors.trim}
            strokeWidth="0.5"
          />
          {/* 右手 */}
          <ellipse cx={70 + shoulderWidth + 38} cy="68" rx="6" ry="7" fill="url(#skinGrad)" transform="rotate(-20, 70, 70)" />
        </g>

        {/* ========== 头部 ========== */}
        <g>
          {/* 脖子 */}
          <rect x="64" y="52" width="12" height="12" fill="url(#skinGrad)" rx="2" />

          {/* 头部形状 */}
          <ellipse cx="70" cy="35" rx="18" ry={isFemale ? "22" : "20"} fill="url(#skinGrad)" />

          {/* 耳朵 */}
          <ellipse cx="52" cy="35" rx="3" ry="5" fill="url(#skinGrad)" />
          <ellipse cx="88" cy="35" rx="3" ry="5" fill="url(#skinGrad)" />

          {/* ========== 头发 ========== */}
          {isFemale ? (
            // 女性发型
            <g>
              {hairStyle === 'longFlowing' && (
                <>
                  {/* 长发飘逸 */}
                  <path
                    d={`M52 25 Q45 20 42 35 Q40 60 45 85 Q48 95 52 90
                         M88 25 Q95 20 98 35 Q100 60 95 85 Q92 95 88 90`}
                    fill="url(#hairGrad)"
                  />
                  <path
                    d={`M52 20 Q70 5 88 20 Q92 25 90 35 Q70 30 50 35 Q48 25 52 20`}
                    fill="url(#hairGrad)"
                  />
                  {/* 发饰 */}
                  <circle cx="55" cy="18" r="3" fill={robeColors.accent} />
                  <circle cx="85" cy="18" r="3" fill={robeColors.accent} />
                </>
              )}
              {hairStyle === 'elegantBun' && (
                <>
                  {/* 优雅发髻 */}
                  <ellipse cx="70" cy="12" rx="12" ry="10" fill="url(#hairGrad)" />
                  <ellipse cx="70" cy="8" rx="8" ry="6" fill="url(#hairGrad)" />
                  <path
                    d={`M52 22 Q50 35 52 50 Q55 55 58 50 Q56 40 58 28 Q65 20 70 22 Q75 20 82 28 Q84 40 82 50 Q85 55 88 50 Q90 35 88 22 Q70 15 52 22`}
                    fill="url(#hairGrad)"
                  />
                  {/* 发簪 */}
                  <line x1="60" y1="10" x2="80" y2="14" stroke={robeColors.accent} strokeWidth="2" />
                  <circle cx="60" cy="10" r="2" fill={robeColors.accent} />
                </>
              )}
              {hairStyle === 'braided' && (
                <>
                  {/* 编发 */}
                  <path
                    d={`M52 22 Q48 25 46 40 Q44 55 48 70
                         M88 22 Q92 25 94 40 Q96 55 92 70`}
                    fill="url(#hairGrad)"
                  />
                  <ellipse cx="70" cy="15" rx="16" ry="12" fill="url(#hairGrad)" />
                  {/* 辫子 */}
                  <path d="M46 70 Q48 80 46 90 Q44 100 48 110" stroke="url(#hairGrad)" strokeWidth="4" fill="none" />
                  <path d="M94 70 Q92 80 94 90 Q96 100 92 110" stroke="url(#hairGrad)" strokeWidth="4" fill="none" />
                </>
              )}
            </g>
          ) : (
            // 男性发型
            <g>
              {hairStyle === 'topknot' && (
                <>
                  {/* 发髻 */}
                  <ellipse cx="70" cy="12" rx="10" ry="8" fill="url(#hairGrad)" />
                  <ellipse cx="70" cy="8" rx="6" ry="5" fill="url(#hairGrad)" />
                  <path
                    d={`M52 22 Q50 30 52 38 Q55 42 58 38 Q56 32 58 26 Q65 18 70 20 Q75 18 82 26 Q84 32 82 38 Q85 42 88 38 Q90 30 88 22 Q70 12 52 22`}
                    fill="url(#hairGrad)"
                  />
                  {/* 发带 */}
                  <path d="M58 16 Q70 14 82 16" stroke={robeColors.accent} strokeWidth="2" fill="none" />
                </>
              )}
              {hairStyle === 'flowing' && (
                <>
                  {/* 披发 */}
                  <path
                    d={`M50 22 Q42 25 40 45 Q42 65 48 75
                         M90 22 Q98 25 100 45 Q98 65 92 75`}
                    fill="url(#hairGrad)"
                  />
                  <ellipse cx="70" cy="18" rx="18" ry="12" fill="url(#hairGrad)" />
                </>
              )}
              {hairStyle === 'warrior' && (
                <>
                  {/* 武士短发 */}
                  <ellipse cx="70" cy="18" rx="18" ry="10" fill="url(#hairGrad)" />
                  <path d="M52 20 Q55 15 60 18 Q70 12 80 18 Q85 15 88 20" fill="url(#hairGrad)" />
                </>
              )}
            </g>
          )}

          {/* ========== 面部特征 ========== */}
          {/* 眉毛 */}
          <path
            d={isFemale
              ? `M58 28 Q62 26 66 28`
              : `M58 27 Q62 25 66 27`
            }
            stroke="#2d2d44"
            strokeWidth={isFemale ? "1.5" : "2"}
            fill="none"
          />
          <path
            d={isFemale
              ? `M74 28 Q78 26 82 28`
              : `M74 27 Q78 25 82 27`
            }
            stroke="#2d2d44"
            strokeWidth={isFemale ? "1.5" : "2"}
            fill="none"
          />

          {/* 眼睛 */}
          <g>
            {/* 左眼 */}
            <ellipse cx="62" cy="32" rx="4" ry={isFemale ? "3" : "2.5"} fill="white" />
            <ellipse cx="62" cy="32" rx="2.5" ry="2" fill="url(#eyeGrad)" />
            <ellipse cx="61" cy="31.5" rx="0.8" ry="0.8" fill="white" opacity="0.8" />

            {/* 右眼 */}
            <ellipse cx="78" cy="32" rx="4" ry={isFemale ? "3" : "2.5"} fill="white" />
            <ellipse cx="78" cy="32" rx="2.5" ry="2" fill="url(#eyeGrad)" />
            <ellipse cx="77" cy="31.5" rx="0.8" ry="0.8" fill="white" opacity="0.8" />

            {/* 女性眼线 */}
            {isFemale && (
              <>
                <path d="M58 32 Q62 30 66 32" stroke="#1a1a2e" strokeWidth="0.5" fill="none" />
                <path d="M74 32 Q78 30 82 32" stroke="#1a1a2e" strokeWidth="0.5" fill="none" />
              </>
            )}
          </g>

          {/* 鼻子 */}
          <path
            d={isFemale
              ? `M70 34 Q69 38 70 40 Q71 38 70 34`
              : `M70 34 L69 40 L71 40 L70 34`
            }
            stroke="#c4a882"
            strokeWidth="0.8"
            fill="none"
          />

          {/* 嘴唇 */}
          <path
            d={isFemale
              ? `M65 44 Q68 43 70 44 Q72 43 75 44 Q72 46 70 46 Q68 46 65 44`
              : `M66 44 Q70 43 74 44 Q70 45 66 44`
            }
            fill="url(#lipGrad)"
          />

          {/* 女性腮红 */}
          {isFemale && (
            <>
              <ellipse cx="56" cy="38" rx="4" ry="2" fill="#e8b4b4" opacity="0.3" />
              <ellipse cx="84" cy="38" rx="4" ry="2" fill="#e8b4b4" opacity="0.3" />
            </>
          )}
        </g>

        {/* ========== 武器 ========== */}
        <g filter="url(#weaponGlow)">
          {weapon.type === 'sword' && (
            <g transform={`translate(${70 + shoulderWidth + 30}, 50) rotate(-30)`}>
              {/* 剑身 */}
              <path d="M0 0 L2 -55 L4 0" fill={weapon.color} />
              <path d="M2 -55 L2 -5" stroke="white" strokeWidth="0.5" opacity="0.4" />
              {/* 剑格 */}
              <rect x="-4" y="2" width="12" height="4" fill="#c9a227" rx="1" />
              {/* 剑柄 */}
              <rect x="0" y="6" width="4" height="15" fill="#4a3728" rx="1" />
              <circle cx="2" cy="23" r="3" fill="#c9a227" />
            </g>
          )}

          {weapon.type === 'blade' && (
            <g transform={`translate(${70 + shoulderWidth + 25}, 45) rotate(-25)`}>
              {/* 刀身 */}
              <path d="M0 0 Q8 -40 6 -70 L2 -70 Q0 -40 0 0" fill={weapon.color} />
              <path d="M3 -68 L3 -10" stroke="white" strokeWidth="0.5" opacity="0.3" />
              {/* 刀格 */}
              <path d="M-3 2 Q5 0 12 3" stroke="#c9a227" strokeWidth="3" fill="none" />
              {/* 刀柄 */}
              <rect x="1" y="5" width="4" height="18" fill="#4a3728" rx="1" />
            </g>
          )}

          {weapon.type === 'heavySword' && (
            <g transform={`translate(${70 + shoulderWidth + 20}, 35) rotate(-15)`}>
              {/* 重剑剑身 */}
              <rect x="0" y="0" width="14" height="75" fill={weapon.color} rx="2" />
              <rect x="2" y="5" width="2" height="65" fill="white" opacity="0.15" />
              {/* 剑格 */}
              <rect x="-3" y="75" width="20" height="8" fill="#4a5568" rx="2" />
              {/* 剑柄 */}
              <rect x="4" y="83" width="6" height="20" fill="#2d2d44" rx="2" />
            </g>
          )}

          {weapon.type === 'snakeSword' && (
            <g transform={`translate(${70 + shoulderWidth + 30}, 45) rotate(-20)`}>
              {/* 金蛇剑 - 蛇形 */}
              <path d="M0 0 Q10 -15 0 -30 Q-10 -45 0 -60 Q10 -75 5 -85"
                    stroke={weapon.color} strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M0 0 Q10 -15 0 -30 Q-10 -45 0 -60 Q10 -75 5 -85"
                    stroke="white" strokeWidth="1" fill="none" opacity="0.3" strokeLinecap="round" />
              {/* 剑柄 */}
              <rect x="-2" y="2" width="5" height="15" fill="#4a3728" rx="1" />
            </g>
          )}

          {weapon.type === 'staff' && (
            <g transform={`translate(${70 + shoulderWidth + 35}, 25) rotate(-10)`}>
              {/* 棒身 */}
              <rect x="0" y="0" width="6" height="90" fill={weapon.color} rx="3" />
              {/* 装饰 */}
              <circle cx="3" cy="5" r="5" fill="#22c55e" />
              <circle cx="3" cy="5" r="3" fill="#16a34a" />
              <rect x="-1" y="85" width="8" height="8" fill="#c9a227" rx="2" />
            </g>
          )}

          {weapon.type === 'pen' && (
            <g transform={`translate(${70 + shoulderWidth + 35}, 55) rotate(-35)`}>
              {/* 笔身 */}
              <rect x="0" y="0" width="4" height="45" fill={weapon.color} rx="1" />
              {/* 笔尖 */}
              <polygon points="0,45 2,55 4,45" fill="#1a1a2e" />
              {/* 笔尾 */}
              <rect x="-1" y="-3" width="6" height="5" fill="#c9a227" rx="1" />
            </g>
          )}

          {weapon.type === 'token' && (
            <g transform={`translate(${70 + shoulderWidth + 35}, 60)`}>
              {/* 圣火令 */}
              <ellipse cx="0" cy="0" rx="15" ry="10" fill={weapon.color} />
              <ellipse cx="0" cy="0" rx="12" ry="7" fill="#991b1b" />
              <text x="0" y="3" textAnchor="middle" fontSize="10" fill="#fbbf24" fontFamily="serif">火</text>
              {/* 火焰光效 */}
              <path d="M-5 -12 Q0 -20 5 -12 Q0 -8 -5 -12" fill="#f97316" opacity="0.6" />
            </g>
          )}

          {weapon.type === 'darkSword' && (
            <g transform={`translate(${70 + shoulderWidth + 25}, 40) rotate(-25)`}>
              {/* 绝世好剑 - 黑色剑身带紫芒 */}
              <rect x="0" y="0" width="6" height="70" fill="#1a1a2e" rx="1" />
              <rect x="0" y="0" width="6" height="70" fill="url(#darkAura)" opacity="0.5">
                <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />
              </rect>
              {/* 紫色剑芒 */}
              <path d="M3 0 L3 -10" stroke="#8b5cf6" strokeWidth="2" opacity="0.8">
                <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
              </path>
              {/* 剑格 */}
              <rect x="-4" y="72" width="14" height="6" fill="#1f2937" rx="1" />
              <rect x="1" y="78" width="4" height="15" fill="#0d0d1a" rx="1" />
            </g>
          )}

          {weapon.type === 'relic' && (
            <g transform={`translate(${70 + shoulderWidth + 30}, 60)`}>
              {/* 达摩舍利 */}
              <circle cx="0" cy="0" r="12" fill={weapon.color} />
              <circle cx="0" cy="0" r="8" fill="#f59e0b" />
              <circle cx="0" cy="0" r="4" fill="#fbbf24" />
              {/* 佛光 */}
              <circle cx="0" cy="0" r="18" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.5">
                <animate attributeName="r" values="15;20;15" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          )}

          {weapon.type === 'whip' && (
            <g transform={`translate(${70 + shoulderWidth + 25}, 55) rotate(-20)`}>
              {/* 软鞭 */}
              <path d="M0 0 Q15 10 10 30 Q5 50 15 70 Q20 85 10 95"
                    stroke={weapon.color} strokeWidth="4" fill="none" strokeLinecap="round" />
              {/* 刺 */}
              <circle cx="10" cy="95" r="3" fill="#78350f" />
            </g>
          )}

          {weapon.type === 'fist' && (
            <g>
              {/* 拳套/拳头 */}
              <ellipse cx={70 - shoulderWidth - 3} cy="155" rx="8" ry="9" fill="url(#skinGrad)" stroke="#c9a227" strokeWidth="0.5" />
              <ellipse cx={70 + shoulderWidth + 38} cy="68" rx="8" ry="9" fill="url(#skinGrad)" stroke="#c9a227" strokeWidth="0.5" transform="rotate(-20, 70, 70)" />
            </g>
          )}
        </g>
      </svg>

      {/* 名字和等级标签 */}
      <div style={{
        transform: isLeft ? 'scaleX(1)' : 'scaleX(-1)',
        textAlign: 'center',
        marginTop: '-5px',
      }}>
        <div style={{
          fontSize: '1rem',
          color: 'var(--gold)',
          fontFamily: '"Ma Shan Zheng", cursive',
          letterSpacing: '2px',
          textShadow: '0 0 15px rgba(212, 175, 55, 0.6)',
          fontWeight: 'bold',
        }}>
          {player.name}
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          marginTop: '2px',
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <span>Lv.{player.level}</span>
          <span style={{ color: weapon.glowColor || 'var(--gold)' }}>⚔ {weapon.name}</span>
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

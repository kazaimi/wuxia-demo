import React from 'react';

// 秘境事件插画组件 - 为每种事件类型绘制精美场景
const EventIllustration = ({ type, event }) => {
  // 根据事件类型和内容选择插画
  const getIllustration = () => {
    // 残局博弈 - 石亭棋阵
    if (type === 'puzzle') {
      if (event?.desc?.includes('棋阵')) {
        return <ChessPuzzleIllustration />;
      } else if (event?.desc?.includes('八卦')) {
        return <BaguaIllustration />;
      } else {
        return <ScrollIllustration />;
      }
    }

    // 献祭流
    if (type === 'sacrifice') {
      if (event?.desc?.includes('猿猴')) {
        return <InjuredMonkeyIllustration />;
      } else if (event?.desc?.includes('高僧')) {
        return <PoisonedMonkIllustration />;
      } else {
        return <FemaleCorpseIllustration />;
      }
    }

    // 蛮力破除
    if (type === 'brute_force') {
      if (event?.desc?.includes('古寺') || event?.desc?.includes('佛像')) {
        return <AncientTempleIllustration />;
      } else if (event?.desc?.includes('断龙石')) {
        return <DragonStoneIllustration />;
      } else {
        return <CrabSwarmIllustration />;
      }
    }

    // 古迹遗留
    if (type === 'relic') {
      if (event?.desc?.includes('枯骨') || event?.desc?.includes('重剑')) {
        return <SwordMasterGraveIllustration />;
      } else if (event?.desc?.includes('寒泉') || event?.desc?.includes('仙女')) {
        return <FairySpringIllustration />;
      } else {
        return <IncenseBurnerIllustration />;
      }
    }

    // 幻境审视
    if (type === 'illusion') {
      if (event?.desc?.includes('冰窟') || event?.desc?.includes('镜')) {
        return <IceMirrorIllustration />;
      } else if (event?.desc?.includes('桃花')) {
        return <PeachBlossomIllustration />;
      } else {
        return <BloodSeaIllustration />;
      }
    }

    // 身法机关
    if (type === 'trap') {
      if (event?.desc?.includes('弩') || event?.desc?.includes('甬道')) {
        return <CrossbowTrapIllustration />;
      } else if (event?.desc?.includes('独木桥') || event?.desc?.includes('断崖')) {
        return <BridgeAbyssIllustration />;
      } else {
        return <QuicksandRoomIllustration />;
      }
    }

    return <DefaultIllustration />;
  };

  return (
    <div style={{
      width: '100%',
      height: '200px',
      marginBottom: '1rem',
      borderRadius: '8px',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, rgba(20,10,30,0.9) 0%, rgba(10,5,20,0.95) 100%)',
      border: '1px solid rgba(192, 132, 252, 0.2)',
    }}>
      {getIllustration()}
    </div>
  );
};

// ========== 插画组件 ==========

// 棋阵残局
const ChessPuzzleIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="skyGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1a1a3e" />
        <stop offset="100%" stopColor="#0d0d1a" />
      </linearGradient>
      <linearGradient id="stoneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#4a4a5a" />
        <stop offset="100%" stopColor="#2a2a3a" />
      </linearGradient>
      <filter id="glow1">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    {/* 背景 */}
    <rect width="400" height="200" fill="url(#skyGrad1)" />

    {/* 远山 */}
    <path d="M0 180 Q100 140 200 160 Q300 140 400 180 L400 200 L0 200 Z" fill="#151525" opacity="0.8" />

    {/* 石亭 */}
    <path d="M120 180 L200 100 L280 180 Z" fill="url(#stoneGrad)" stroke="#5a5a6a" strokeWidth="1" />
    <rect x="140" y="130" width="120" height="50" fill="#3a3a4a" />

    {/* 石柱 */}
    <rect x="130" y="100" width="8" height="80" fill="#4a4a5a" />
    <rect x="262" y="100" width="8" height="80" fill="#4a4a5a" />

    {/* 棋盘 */}
    <rect x="160" y="145" width="80" height="30" fill="#2a2a2a" stroke="#c9a227" strokeWidth="1" />
    {/* 棋盘格子 */}
    {[0,1,2,3,4].map(i => (
      <line key={`h${i}`} x1="160" y1={145 + i*6} x2="240" y2={145 + i*6} stroke="#4a4a4a" strokeWidth="0.5" />
    ))}
    {[0,1,2,3,4].map(i => (
      <line key={`v${i}`} x1={160 + i*16} y1="145" x2={160 + i*16} y2="175" stroke="#4a4a4a" strokeWidth="0.5" />
    ))}

    {/* 棋子 */}
    <circle cx="176" cy="157" r="4" fill="#1a1a1a" stroke="#fff" strokeWidth="0.5" />
    <circle cx="208" cy="151" r="4" fill="#f5f5f5" stroke="#333" strokeWidth="0.5" />
    <circle cx="224" cy="163" r="4" fill="#1a1a1a" stroke="#fff" strokeWidth="0.5" />
    <circle cx="192" cy="169" r="4" fill="#f5f5f5" stroke="#333" strokeWidth="0.5" />

    {/* 落叶 */}
    <ellipse cx="230" cy="155" rx="3" ry="1.5" fill="#8b6914" transform="rotate(30, 230, 155)" filter="url(#glow1)">
      <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
    </ellipse>

    {/* 月光 */}
    <circle cx="320" cy="40" r="25" fill="#f0e6d0" opacity="0.15" />
    <circle cx="320" cy="40" r="20" fill="#f0e6d0" opacity="0.1" />

    {/* 雾气 */}
    <ellipse cx="100" cy="170" rx="80" ry="20" fill="#c084fc" opacity="0.05" />
    <ellipse cx="300" cy="175" rx="100" ry="15" fill="#c084fc" opacity="0.05" />
  </svg>
);

// 八卦阵图
const BaguaIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="wallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#2a2a35" />
        <stop offset="100%" stopColor="#1a1a22" />
      </linearGradient>
      <radialGradient id="redGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#dc2626" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
      </radialGradient>
    </defs>

    <rect width="400" height="200" fill="#0d0d12" />

    {/* 石墙 */}
    <rect x="0" y="0" width="400" height="200" fill="url(#wallGrad)" />

    {/* 石砖纹理 */}
    {[0,1,2,3,4,5,6,7,8,9].map(i => (
      <line key={`br${i}`} x1="0" y1={i*22} x2="400" y2={i*22} stroke="#3a3a45" strokeWidth="1" opacity="0.3" />
    ))}

    {/* 八卦图 */}
    <g transform="translate(200, 100)">
      {/* 外圈 */}
      <circle r="60" fill="none" stroke="#c9a227" strokeWidth="2" opacity="0.6" />
      <circle r="50" fill="none" stroke="#c9a227" strokeWidth="1" opacity="0.4" />

      {/* 八卦符号 */}
      {[-1, 0, 1].map((dy, i) => (
        <g key={`trigram${i}`} transform={`translate(0, ${dy*35})`}>
          <line x1="-30" y1="0" x2="-10" y2="0" stroke="#c9a227" strokeWidth="3" />
          <line x1="10" y1="0" x2="30" y2="0" stroke="#c9a227" strokeWidth="3" />
        </g>
      ))}

      {/* 阴阳 */}
      <circle r="20" fill="#1a1a2e" stroke="#c9a227" strokeWidth="1" />
      <path d="M0 -20 A20 20 0 0 1 0 20 A10 10 0 0 1 0 0 A10 10 0 0 0 0 -20" fill="#c9a227" />
      <circle cx="0" cy="-10" r="3" fill="#1a1a2e" />
      <circle cx="0" cy="10" r="3" fill="#c9a227" />
    </g>

    {/* 红色真气流 */}
    <circle cx="150" cy="80" r="15" fill="url(#redGlow)">
      <animate attributeName="r" values="10;20;10" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="280" cy="130" r="12" fill="url(#redGlow)">
      <animate attributeName="r" values="8;15;8" dur="2.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="220" cy="60" r="10" fill="url(#redGlow)">
      <animate attributeName="r" values="6;12;6" dur="1.8s" repeatCount="indefinite" />
    </circle>

    {/* 神秘光效 */}
    <ellipse cx="200" cy="100" rx="100" ry="60" fill="none" stroke="#c084fc" strokeWidth="1" opacity="0.2">
      <animate attributeName="opacity" values="0.1;0.3;0.1" dur="3s" repeatCount="indefinite" />
    </ellipse>
  </svg>
);

// 武功简卷
const ScrollIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="floorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1a1520" />
        <stop offset="100%" stopColor="#0d0a12" />
      </linearGradient>
    </defs>

    <rect width="400" height="200" fill="url(#floorGrad)" />

    {/* 地面石板 */}
    <rect x="0" y="150" width="400" height="50" fill="#1a1a22" />
    <line x1="0" y1="175" x2="400" y2="175" stroke="#2a2a32" strokeWidth="1" />

    {/* 简卷散落 */}
    <g transform="translate(120, 140)">
      <rect x="0" y="0" width="60" height="8" fill="#3d2817" rx="2" transform="rotate(-15)" />
      <rect x="10" y="5" width="50" height="6" fill="#4a3020" rx="1" transform="rotate(5)" />
      <rect x="5" y="10" width="55" height="7" fill="#2d1810" rx="2" transform="rotate(-8)" />
    </g>

    <g transform="translate(220, 145)">
      <rect x="0" y="0" width="45" height="7" fill="#3d2817" rx="2" transform="rotate(10)" />
      <rect x="8" y="8" width="40" height="5" fill="#4a3020" rx="1" transform="rotate(-5)" />
    </g>

    {/* 内力轨迹光效 */}
    <path d="M100 120 Q150 100 200 130 Q250 160 300 120" stroke="#c084fc" strokeWidth="2" fill="none" opacity="0.6">
      <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
    </path>
    <path d="M150 110 Q200 90 250 110 Q300 130 350 100" stroke="#22c55e" strokeWidth="1.5" fill="none" opacity="0.4">
      <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2.5s" repeatCount="indefinite" />
    </path>

    {/* 光点 */}
    <circle cx="180" cy="115" r="3" fill="#c084fc" opacity="0.8">
      <animate attributeName="cy" values="115;105;115" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="280" cy="125" r="2" fill="#22c55e" opacity="0.6">
      <animate attributeName="cy" values="125;115;125" dur="2.5s" repeatCount="indefinite" />
    </circle>

    {/* 尘埃 */}
    {[...Array(10)].map((_, i) => (
      <circle key={`dust${i}`} cx={50 + i*35} cy={50 + Math.random()*50} r="1" fill="#fff" opacity="0.2">
        <animate attributeName="cy" values={`${50 + Math.random()*50};${40 + Math.random()*40};${50 + Math.random()*50}`} dur={`${3 + Math.random()*2}s`} repeatCount="indefinite" />
      </circle>
    ))}
  </svg>
);

// 受伤白猿
const InjuredMonkeyIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="forestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0d1a0d" />
        <stop offset="100%" stopColor="#050a05" />
      </linearGradient>
      <radialGradient id="bloodGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#dc2626" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
      </radialGradient>
    </defs>

    <rect width="400" height="200" fill="url(#forestGrad)" />

    {/* 树木 */}
    <path d="M50 200 L70 80 L90 200 Z" fill="#1a2a1a" />
    <path d="M320 200 L350 60 L380 200 Z" fill="#152015" />
    <ellipse cx="70" cy="60" rx="40" ry="30" fill="#1a2a1a" />
    <ellipse cx="350" cy="40" rx="50" ry="35" fill="#152015" />

    {/* 毒瘴 */}
    <ellipse cx="200" cy="150" rx="150" ry="40" fill="#22c55e" opacity="0.1" />
    <ellipse cx="150" cy="130" rx="80" ry="25" fill="#22c55e" opacity="0.08" />

    {/* 白猿 */}
    <g transform="translate(180, 100)">
      {/* 身体 */}
      <ellipse cx="0" cy="40" rx="25" ry="30" fill="#f5f5f5" />
      {/* 头 */}
      <circle cx="0" cy="5" r="20" fill="#f5f5f5" />
      {/* 脸 */}
      <ellipse cx="0" cy="10" rx="12" ry="10" fill="#ffd4b8" />
      {/* 眼睛 - 悲伤 */}
      <ellipse cx="-6" cy="5" rx="3" ry="2" fill="#1a1a1a" />
      <ellipse cx="6" cy="5" rx="3" ry="2" fill="#1a1a1a" />
      {/* 嘴 - 哀鸣 */}
      <ellipse cx="0" cy="15" rx="4" ry="2" fill="#c9a0a0" />
      {/* 手指方向 */}
      <path d="M20 30 L45 20 L50 25 L25 35 Z" fill="#f5f5f5" />
      {/* 伤口 */}
      <circle cx="-10" cy="50" r="8" fill="url(#bloodGlow)">
        <animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <ellipse cx="-10" cy="50" rx="5" ry="3" fill="#dc2626" opacity="0.8" />
    </g>

    {/* 指向的深处光 */}
    <ellipse cx="300" cy="80" rx="30" ry="20" fill="#c9a227" opacity="0.15">
      <animate attributeName="opacity" values="0.1;0.25;0.1" dur="2s" repeatCount="indefinite" />
    </ellipse>

    {/* 萤火虫 */}
    {[...Array(8)].map((_, i) => (
      <circle key={`firefly${i}`} cx={100 + Math.random()*200} cy={50 + Math.random()*80} r="1.5" fill="#fbbf24" opacity="0.6">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur={`${1.5 + Math.random()}s`} repeatCount="indefinite" />
      </circle>
    ))}
  </svg>
);

// 中毒高僧
const PoisonedMonkIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="pathGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1a1515" />
        <stop offset="100%" stopColor="#0d0a0a" />
      </linearGradient>
    </defs>

    <rect width="400" height="200" fill="url(#pathGrad)" />

    {/* 石板路 */}
    <rect x="0" y="160" width="400" height="40" fill="#1a1a1a" />
    <line x1="0" y1="180" x2="400" y2="180" stroke="#2a2a2a" strokeWidth="1" />

    {/* 高僧 */}
    <g transform="translate(200, 90)">
      {/* 身体/袈裟 */}
      <path d="M-30 80 L-25 30 L25 30 L30 80 Z" fill="#8b4513" />
      <path d="M-20 80 L-15 35 L15 35 L20 80 Z" fill="#d4a574" />
      {/* 头 */}
      <circle cx="0" cy="15" r="18" fill="#e8d4b8" />
      {/* 光头 */}
      <ellipse cx="0" cy="8" rx="16" ry="12" fill="#e8d4b8" />
      {/* 戒疤 */}
      <circle cx="-5" cy="3" r="1.5" fill="#c4a882" />
      <circle cx="5" cy="3" r="1.5" fill="#c4a882" />
      <circle cx="0" cy="0" r="1.5" fill="#c4a882" />
      {/* 紫黑面色 */}
      <ellipse cx="0" cy="18" rx="14" ry="10" fill="#4a2848" opacity="0.6" />
      {/* 眼睛 - 闭目 */}
      <path d="M-8 12 Q-5 10 -2 12" stroke="#1a1a1a" strokeWidth="1.5" fill="none" />
      <path d="M2 12 Q5 10 8 12" stroke="#1a1a1a" strokeWidth="1.5" fill="none" />
      {/* 嘴 - 念佛 */}
      <ellipse cx="0" cy="22" rx="3" ry="2" fill="#8b6060" />
      {/* 手 - 合十 */}
      <ellipse cx="0" cy="55" rx="12" ry="8" fill="#e8d4b8" />
    </g>

    {/* 毒气 */}
    <ellipse cx="200" cy="130" rx="50" ry="20" fill="#8b008b" opacity="0.2">
      <animate attributeName="rx" values="45;55;45" dur="2s" repeatCount="indefinite" />
    </ellipse>
    <circle cx="170" cy="110" r="8" fill="#4a004a" opacity="0.3">
      <animate attributeName="cy" values="110;100;110" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="230" cy="105" r="6" fill="#4a004a" opacity="0.25">
      <animate attributeName="cy" values="105;95;105" dur="2.5s" repeatCount="indefinite" />
    </circle>

    {/* 佛光微弱 */}
    <ellipse cx="200" cy="50" rx="40" ry="20" fill="#ffd700" opacity="0.1">
      <animate attributeName="opacity" values="0.05;0.15;0.05" dur="3s" repeatCount="indefinite" />
    </ellipse>
  </svg>
);

// 女尸尸变
const FemaleCorpseIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="coldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0a1520" />
        <stop offset="100%" stopColor="#050a10" />
      </linearGradient>
      <radialGradient id="yinQi" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#4a90d9" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#4a90d9" stopOpacity="0" />
      </radialGradient>
    </defs>

    <rect width="400" height="200" fill="url(#coldGrad)" />

    {/* 地面 */}
    <rect x="0" y="170" width="400" height="30" fill="#0a0a10" />

    {/* 女尸 */}
    <g transform="translate(200, 120)">
      {/* 身体 */}
      <ellipse cx="0" cy="30" rx="35" ry="15" fill="#1a1a1a" />
      {/* 破烂衣衫 */}
      <path d="M-30 25 Q-25 40 -35 50 L35 50 Q25 40 30 25 Z" fill="#2a2a2a" stroke="#1a1a1a" strokeWidth="1" />
      {/* 头 */}
      <circle cx="0" cy="5" r="18" fill="#d4d4e8" />
      {/* 长发散乱 */}
      <path d="M-15 -10 Q-25 20 -20 50" stroke="#0a0a0a" strokeWidth="8" fill="none" />
      <path d="M15 -10 Q25 20 20 50" stroke="#0a0a0a" strokeWidth="8" fill="none" />
      <path d="M-5 -15 Q-10 30 -8 55" stroke="#0a0a0a" strokeWidth="6" fill="none" />
      {/* 眼睛 - 闭 */}
      <path d="M-10 3 Q-7 1 -4 3" stroke="#4a4a6a" strokeWidth="1" fill="none" />
      <path d="M4 3 Q7 1 10 3" stroke="#4a4a6a" strokeWidth="1" fill="none" />
      {/* 嘴 */}
      <ellipse cx="0" cy="12" rx="4" ry="2" fill="#6a6a8a" />
    </g>

    {/* 阴寒之气 */}
    <ellipse cx="200" cy="130" rx="60" ry="30" fill="url(#yinQi)">
      <animate attributeName="ry" values="25;35;25" dur="2s" repeatCount="indefinite" />
    </ellipse>

    {/* 飘散的阴气 */}
    <path d="M150 100 Q160 80 170 100" stroke="#4a90d9" strokeWidth="2" fill="none" opacity="0.3">
      <animate attributeName="d" values="M150 100 Q160 80 170 100;M150 90 Q160 70 170 90;M150 100 Q160 80 170 100" dur="3s" repeatCount="indefinite" />
    </path>
    <path d="M230 95 Q245 75 260 95" stroke="#4a90d9" strokeWidth="2" fill="none" opacity="0.25">
      <animate attributeName="d" values="M230 95 Q245 75 260 95;M230 85 Q245 65 260 85;M230 95 Q245 75 260 95" dur="2.5s" repeatCount="indefinite" />
    </path>

    {/* 冷光 */}
    <ellipse cx="200" cy="100" rx="80" ry="40" fill="none" stroke="#4a90d9" strokeWidth="1" opacity="0.2">
      <animate attributeName="opacity" values="0.1;0.3;0.1" dur="3s" repeatCount="indefinite" />
    </ellipse>
  </svg>
);

// 破败古寺
const AncientTempleIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="nightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0a0a15" />
        <stop offset="100%" stopColor="#050508" />
      </linearGradient>
    </defs>

    <rect width="400" height="200" fill="url(#nightGrad)" />

    {/* 月亮 */}
    <circle cx="320" cy="40" r="20" fill="#e8e8d0" opacity="0.3" />
    <circle cx="320" cy="40" r="15" fill="#e8e8d0" opacity="0.2" />

    {/* 古寺轮廓 */}
    <path d="M100 200 L100 100 L150 60 L200 100 L200 200 Z" fill="#1a1a1a" />
    <path d="M200 200 L200 100 L250 60 L300 100 L300 200 Z" fill="#151515" />

    {/* 屋顶 */}
    <path d="M80 100 L150 40 L220 100 Z" fill="#0d0d0d" />
    <path d="M180 100 L250 40 L320 100 Z" fill="#0a0a0a" />

    {/* 门 */}
    <rect x="130" y="120" width="40" height="80" fill="#050505" />
    <rect x="230" y="120" width="40" height="80" fill="#050505" />

    {/* 佛像剪影 */}
    <g transform="translate(200, 130)">
      <ellipse cx="0" cy="50" rx="30" ry="20" fill="#1a1a18" />
      <circle cx="0" cy="20" r="15" fill="#1a1a18" />
      {/* 金漆剥落痕迹 */}
      <path d="M-10 15 L-8 25 L-12 30" stroke="#c9a227" strokeWidth="0.5" opacity="0.3" />
      <path d="M5 10 L8 20 L6 28" stroke="#c9a227" strokeWidth="0.5" opacity="0.2" />
    </g>

    {/* 神秘光芒 */}
    <ellipse cx="200" cy="140" rx="40" ry="20" fill="#c9a227" opacity="0.05">
      <animate attributeName="opacity" values="0.03;0.08;0.03" dur="3s" repeatCount="indefinite" />
    </ellipse>

    {/* 蝙蝠 */}
    <path d="M80 60 Q85 55 90 60 Q95 55 100 60" stroke="#0a0a0a" strokeWidth="1" fill="none">
      <animate attributeName="d" values="M80 60 Q85 55 90 60 Q95 55 100 60;M80 58 Q85 53 90 58 Q95 53 100 58;M80 60 Q85 55 90 60 Q95 55 100 60" dur="0.5s" repeatCount="indefinite" />
    </path>
    <path d="M300 50 Q305 45 310 50 Q315 45 320 50" stroke="#0a0a0a" strokeWidth="1" fill="none">
      <animate attributeName="d" values="M300 50 Q305 45 310 50 Q315 45 320 50;M300 48 Q305 43 310 48 Q315 43 320 48;M300 50 Q305 45 310 50 Q315 45 320 50" dur="0.6s" repeatCount="indefinite" />
    </path>

    {/* 雾气 */}
    <ellipse cx="100" cy="180" rx="80" ry="20" fill="#c084fc" opacity="0.03" />
    <ellipse cx="300" cy="175" rx="100" ry="25" fill="#c084fc" opacity="0.03" />
  </svg>
);

// 断龙石
const DragonStoneIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="caveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1a1510" />
        <stop offset="100%" stopColor="#0d0a08" />
      </linearGradient>
    </defs>

    <rect width="400" height="200" fill="url(#caveGrad)" />

    {/* 洞穴壁 */}
    <path d="M0 0 L0 200 L80 200 L100 50 L100 0 Z" fill="#151510" />
    <path d="M400 0 L400 200 L320 200 L300 50 L300 0 Z" fill="#151510" />

    {/* 断龙石 */}
    <rect x="140" y="40" width="120" height="160" fill="#3a3a35" stroke="#4a4a45" strokeWidth="2" />
    {/* 石纹 */}
    <line x1="160" y1="40" x2="160" y2="200" stroke="#2a2a25" strokeWidth="1" />
    <line x1="200" y1="40" x2="200" y2="200" stroke="#2a2a25" strokeWidth="1" />
    <line x1="240" y1="40" x2="240" y2="200" stroke="#2a2a25" strokeWidth="1" />
    <line x1="140" y1="100" x2="260" y2="100" stroke="#2a2a25" strokeWidth="1" />
    <line x1="140" y1="150" x2="260" y2="150" stroke="#2a2a25" strokeWidth="1" />

    {/* 古老符文 */}
    <text x="200" y="80" textAnchor="middle" fontSize="20" fill="#c9a227" opacity="0.3" fontFamily="serif">封</text>
    <text x="200" y="130" textAnchor="middle" fontSize="16" fill="#c9a227" opacity="0.2" fontFamily="serif">龍</text>

    {/* 侧缝 */}
    <rect x="100" y="60" width="40" height="140" fill="#0a0a08" stroke="#2a2a25" strokeWidth="1" />
    <rect x="260" y="60" width="40" height="140" fill="#0a0a08" stroke="#2a2a25" strokeWidth="1" />

    {/* 缝隙中的光 */}
    <rect x="105" y="80" width="30" height="100" fill="#c9a227" opacity="0.05">
      <animate attributeName="opacity" values="0.03;0.08;0.03" dur="2s" repeatCount="indefinite" />
    </rect>
    <rect x="265" y="80" width="30" height="100" fill="#c9a227" opacity="0.05">
      <animate attributeName="opacity" values="0.03;0.08;0.03" dur="2.5s" repeatCount="indefinite" />
    </rect>

    {/* 尘埃 */}
    {[...Array(15)].map((_, i) => (
      <circle key={`dust${i}`} cx={100 + Math.random()*200} cy={20 + Math.random()*60} r="1" fill="#c9a227" opacity="0.2">
        <animate attributeName="cy" values={`${20 + Math.random()*60};${30 + Math.random()*70};${20 + Math.random()*60}`} dur={`${2 + Math.random()*2}s`} repeatCount="indefinite" />
      </circle>
    ))}
  </svg>
);

// 铁甲蟹群
const CrabSwarmIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="tunnelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#151510" />
        <stop offset="100%" stopColor="#0a0a08" />
      </linearGradient>
    </defs>

    <rect width="400" height="200" fill="url(#tunnelGrad)" />

    {/* 密道壁 */}
    <rect x="0" y="0" width="400" height="30" fill="#1a1a15" />
    <rect x="0" y="170" width="400" height="30" fill="#1a1a15" />

    {/* 蟹群 */}
    {[...Array(12)].map((_, i) => {
      const x = 50 + (i % 6) * 55;
      const y = 80 + Math.floor(i / 6) * 50 + Math.random() * 20;
      const size = 15 + Math.random() * 10;
      return (
        <g key={`crab${i}`} transform={`translate(${x}, ${y})`}>
          {/* 甲壳 */}
          <ellipse cx="0" cy="0" rx={size} ry={size * 0.7} fill="#4a4a45" stroke="#5a5a55" strokeWidth="1" />
          {/* 钳子 */}
          <path d={`M${-size} 0 L${-size - 8} -5 L${-size - 5} 0 L${-size - 8} 5 Z`} fill="#3a3a35" />
          <path d={`M${size} 0 L${size + 8} -5 L${size + 5} 0 L${size + 8} 5 Z`} fill="#3a3a35" />
          {/* 眼睛 */}
          <circle cx="-3" cy="-3" r="2" fill="#1a1a1a" />
          <circle cx="3" cy="-3" r="2" fill="#1a1a1a" />
          {/* 动画 */}
          <animateTransform attributeName="transform" type="translate" values={`${x}, ${y};${x + 2}, ${y};${x}, ${y}`} dur={`${0.3 + Math.random() * 0.2}s`} repeatCount="indefinite" additive="sum" />
        </g>
      );
    })}

    {/* 爬行声波纹 */}
    <ellipse cx="200" cy="100" rx="150" ry="30" fill="none" stroke="#5a5a55" strokeWidth="1" opacity="0.1">
      <animate attributeName="rx" values="100;180;100" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.15;0.05;0.15" dur="2s" repeatCount="indefinite" />
    </ellipse>

    {/* 深处光 */}
    <ellipse cx="350" cy="100" rx="30" ry="50" fill="#c9a227" opacity="0.05">
      <animate attributeName="opacity" values="0.03;0.08;0.03" dur="2s" repeatCount="indefinite" />
    </ellipse>
  </svg>
);

// 剑魔墓
const SwordMasterGraveIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="tombGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0d0d12" />
        <stop offset="100%" stopColor="#050508" />
      </linearGradient>
      <linearGradient id="swordGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#4a4a4a" />
        <stop offset="50%" stopColor="#2a2a2a" />
        <stop offset="100%" stopColor="#3a3a3a" />
      </linearGradient>
    </defs>

    <rect width="400" height="200" fill="url(#tombGrad)" />

    {/* 墓道 */}
    <path d="M0 0 L0 200 L100 200 L120 50 L120 0 Z" fill="#0a0a0d" />
    <path d="M400 0 L400 200 L300 200 L280 50 L280 0 Z" fill="#0a0a0d" />

    {/* 枯骨 */}
    <g transform="translate(200, 130)">
      {/* 骨盆 */}
      <ellipse cx="0" cy="40" rx="20" ry="10" fill="#d4d4c8" opacity="0.8" />
      {/* 脊椎 */}
      <ellipse cx="0" cy="25" rx="8" ry="5" fill="#d4d4c8" opacity="0.7" />
      <ellipse cx="0" cy="15" rx="6" ry="4" fill="#d4d4c8" opacity="0.6" />
      <ellipse cx="0" cy="5" rx="5" ry="3" fill="#d4d4c8" opacity="0.5" />
      {/* 头骨 */}
      <circle cx="0" cy="-10" r="12" fill="#d4d4c8" opacity="0.7" />
      <ellipse cx="-4" cy="-12" rx="3" ry="2" fill="#0a0a0d" />
      <ellipse cx="4" cy="-12" rx="3" ry="2" fill="#0a0a0d" />
      <ellipse cx="0" cy="-5" rx="2" ry="1.5" fill="#0a0a0d" />
    </g>

    {/* 玄铁重剑 */}
    <g transform="translate(240, 80)">
      <rect x="0" y="0" width="15" height="80" fill="url(#swordGrad)" rx="2" />
      <rect x="-3" y="75" width="21" height="10" fill="#2a2a2a" rx="2" />
      {/* 剑光 */}
      <rect x="5" y="5" width="3" height="70" fill="#fff" opacity="0.1" />
    </g>

    {/* 墙上刻字 */}
    <text x="120" y="80" fontSize="10" fill="#c9a227" opacity="0.4" fontFamily="serif">纵横江湖</text>
    <text x="120" y="95" fontSize="10" fill="#c9a227" opacity="0.4" fontFamily="serif">三十余载</text>
    <text x="120" y="110" fontSize="10" fill="#c9a227" opacity="0.3" fontFamily="serif">杀尽仇寇</text>
    <text x="120" y="125" fontSize="10" fill="#c9a227" opacity="0.3" fontFamily="serif">败尽英雄</text>

    {/* 剑气残留 */}
    <path d="M250 80 Q280 60 300 80" stroke="#4a90d9" strokeWidth="1" fill="none" opacity="0.2">
      <animate attributeName="opacity" values="0.1;0.3;0.1" dur="3s" repeatCount="indefinite" />
    </path>

    {/* 尘埃飘浮 */}
    {[...Array(8)].map((_, i) => (
      <circle key={`dust${i}`} cx={150 + Math.random()*100} cy={40 + Math.random()*60} r="1" fill="#fff" opacity="0.15">
        <animate attributeName="cy" values={`${40 + Math.random()*60};${30 + Math.random()*50};${40 + Math.random()*60}`} dur={`${3 + Math.random()*2}s`} repeatCount="indefinite" />
      </circle>
    ))}
  </svg>
);

// 仙女舞剑图
const FairySpringIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="springGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0a1520" />
        <stop offset="100%" stopColor="#050a10" />
      </linearGradient>
      <radialGradient id="coldLight" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#4a90d9" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#4a90d9" stopOpacity="0" />
      </radialGradient>
    </defs>

    <rect width="400" height="200" fill="url(#springGrad)" />

    {/* 洞窟 */}
    <path d="M0 0 Q100 50 200 30 Q300 50 400 0 L400 200 L0 200 Z" fill="#0a0a10" />

    {/* 干涸寒泉 */}
    <ellipse cx="200" cy="150" rx="100" ry="30" fill="#1a1a25" stroke="#2a2a35" strokeWidth="1" />
    <ellipse cx="200" cy="150" rx="80" ry="20" fill="#0d0d15" />

    {/* 仙女舞剑图 - 泉底雕刻 */}
    <g transform="translate(200, 145)">
      {/* 仙女轮廓 */}
      <ellipse cx="-20" cy="0" rx="8" ry="15" fill="#2a2a35" opacity="0.6" />
      <circle cx="-20" cy="-18" r="6" fill="#2a2a35" opacity="0.6" />
      {/* 飘带 */}
      <path d="M-28 5 Q-40 -5 -35 -20" stroke="#3a3a45" strokeWidth="2" fill="none" opacity="0.5" />
      <path d="M-12 10 Q0 0 -5 -15" stroke="#3a3a45" strokeWidth="2" fill="none" opacity="0.5" />
      {/* 剑 */}
      <line x1="-15" y1="-10" x2="10" y2="-30" stroke="#4a4a55" strokeWidth="2" />
    </g>

    {/* 剑痕 */}
    <path d="M150 100 Q180 80 200 100 Q220 120 250 100" stroke="#4a90d9" strokeWidth="1" fill="none" opacity="0.3">
      <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
    </path>
    <path d="M180 90 Q200 70 220 90 Q240 110 260 90" stroke="#4a90d9" strokeWidth="1" fill="none" opacity="0.2">
      <animate attributeName="opacity" values="0.1;0.4;0.1" dur="2.5s" repeatCount="indefinite" />
    </path>

    {/* 寒气 */}
    <ellipse cx="200" cy="120" rx="60" ry="30" fill="url(#coldLight)">
      <animate attributeName="ry" values="25;35;25" dur="3s" repeatCount="indefinite" />
    </ellipse>

    {/* 冰晶 */}
    {[...Array(6)].map((_, i) => (
      <polygon key={`ice${i}`} points={`${160 + i*15},60 ${163 + i*15},70 ${166 + i*15},60`} fill="#4a90d9" opacity="0.2">
        <animate attributeName="opacity" values="0.1;0.3;0.1" dur={`${2 + Math.random()}s`} repeatCount="indefinite" />
      </polygon>
    ))}
  </svg>
);

// 古铜香炉
const IncenseBurnerIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="roomGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#12100a" />
        <stop offset="100%" stopColor="#080605" />
      </linearGradient>
      <linearGradient id="bronzeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#8b6914" />
        <stop offset="50%" stopColor="#6b4f0f" />
        <stop offset="100%" stopColor="#4a350a" />
      </linearGradient>
    </defs>

    <rect width="400" height="200" fill="url(#roomGrad)" />

    {/* 地面 */}
    <rect x="0" y="170" width="400" height="30" fill="#0a0a08" />

    {/* 腐朽蒲团 */}
    <ellipse cx="150" cy="165" rx="30" ry="8" fill="#2a2520" opacity="0.6" />
    <ellipse cx="150" cy="163" rx="25" ry="6" fill="#1a1815" opacity="0.5" />

    {/* 香炉 */}
    <g transform="translate(250, 120)">
      {/* 炉身 */}
      <path d="M-25 50 L-30 20 Q-30 0 0 -10 Q30 0 30 20 L25 50 Z" fill="url(#bronzeGrad)" />
      {/* 炉口 */}
      <ellipse cx="0" cy="-10" rx="20" ry="8" fill="#4a350a" />
      {/* 装饰纹 */}
      <ellipse cx="0" cy="20" rx="22" ry="5" fill="none" stroke="#c9a227" strokeWidth="0.5" opacity="0.3" />
      {/* 三足 */}
      <path d="M-20 50 L-25 65 L-15 50" fill="#6b4f0f" />
      <path d="M20 50 L25 65 L15 50" fill="#6b4f0f" />
      <path d="M0 50 L0 68 L5 50" fill="#6b4f0f" />
    </g>

    {/* 香 */}
    <line x1="250" y1="130" x2="250" y2="80" stroke="#8b6914" strokeWidth="2" />
    <circle cx="250" cy="78" r="3" fill="#ff6b35">
      <animate attributeName="r" values="2;4;2" dur="1s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.8;1;0.8" dur="1s" repeatCount="indefinite" />
    </circle>

    {/* 烟雾 */}
    <path d="M250 75 Q240 60 250 45 Q260 30 250 15" stroke="#c9a227" strokeWidth="2" fill="none" opacity="0.3">
      <animate attributeName="d" values="M250 75 Q240 60 250 45 Q260 30 250 15;M250 75 Q260 60 250 45 Q240 30 250 15;M250 75 Q240 60 250 45 Q260 30 250 15" dur="3s" repeatCount="indefinite" />
    </path>
    <path d="M250 75 Q260 55 250 35 Q240 20 250 5" stroke="#c9a227" strokeWidth="1.5" fill="none" opacity="0.2">
      <animate attributeName="d" values="M250 75 Q260 55 250 35 Q240 20 250 5;M250 75 Q240 55 250 35 Q260 20 250 5;M250 75 Q260 55 250 35 Q240 20 250 5" dur="4s" repeatCount="indefinite" />
    </path>

    {/* 异香光晕 */}
    <ellipse cx="250" cy="100" rx="50" ry="40" fill="#c9a227" opacity="0.03">
      <animate attributeName="rx" values="40;60;40" dur="3s" repeatCount="indefinite" />
    </ellipse>
  </svg>
);

// 冰窟镜中人
const IceMirrorIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="iceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0a1525" />
        <stop offset="100%" stopColor="#050a12" />
      </linearGradient>
      <linearGradient id="mirrorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#2a3a4a" />
        <stop offset="50%" stopColor="#4a5a6a" />
        <stop offset="100%" stopColor="#2a3a4a" />
      </linearGradient>
    </defs>

    <rect width="400" height="200" fill="url(#iceGrad)" />

    {/* 冰窟壁 */}
    <path d="M0 0 L0 200 L80 200 L100 0 Z" fill="#0a1520" />
    <path d="M400 0 L400 200 L320 200 L300 0 Z" fill="#0a1520" />

    {/* 冰柱 */}
    <polygon points="50,0 55,60 45,60" fill="#3a4a5a" opacity="0.5" />
    <polygon points="350,0 355,50 345,50" fill="#3a4a5a" opacity="0.5" />
    <polygon points="120,0 125,40 115,40" fill="#3a4a5a" opacity="0.4" />

    {/* 镜面 */}
    <rect x="150" y="30" width="100" height="140" fill="url(#mirrorGrad)" rx="5" opacity="0.8" />
    <rect x="155" y="35" width="90" height="130" fill="#1a2a3a" rx="3" />

    {/* 镜中扭曲的自己 */}
    <g transform="translate(200, 100)">
      {/* 扭曲的身体 */}
      <ellipse cx="0" cy="30" rx="25" ry="35" fill="#2a3a4a" />
      {/* 扭曲的头 */}
      <ellipse cx="0" cy="-10" rx="18" ry="22" fill="#3a4a5a" />
      {/* 扭曲的五官 */}
      <ellipse cx="-6" cy="-12" rx="4" ry="5" fill="#0a0a0a" />
      <ellipse cx="6" cy="-12" rx="4" ry="5" fill="#0a0a0a" />
      {/* 扭曲的嘴 - 诡异微笑 */}
      <path d="M-8 2 Q0 10 8 2" stroke="#1a1a2a" strokeWidth="2" fill="none" />
      {/* 邪恶光芒 */}
      <circle cx="-6" cy="-12" r="2" fill="#dc2626" opacity="0.8">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="6" cy="-12" r="2" fill="#dc2626" opacity="0.8">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </g>

    {/* 镜框光效 */}
    <rect x="150" y="30" width="100" height="140" fill="none" stroke="#4a90d9" strokeWidth="1" rx="5" opacity="0.3">
      <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
    </rect>

    {/* 冰霜纹理 */}
    {[...Array(10)].map((_, i) => (
      <line key={`frost${i}`} x1={140 + Math.random()*120} y1={25 + Math.random()*150} x2={145 + Math.random()*110} y2={30 + Math.random()*140} stroke="#fff" strokeWidth="0.5" opacity="0.1" />
    ))}
  </svg>
);

// 桃花林幻境
const PeachBlossomIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="pinkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1a1020" />
        <stop offset="100%" stopColor="#0a0510" />
      </linearGradient>
    </defs>

    <rect width="400" height="200" fill="url(#pinkGrad)" />

    {/* 桃花树 */}
    <path d="M50 200 L70 100 L90 200 Z" fill="#2a1a20" />
    <path d="M320 200 L350 80 L380 200 Z" fill="#2a1a20" />
    <ellipse cx="70" cy="70" rx="50" ry="40" fill="#ff69b4" opacity="0.3" />
    <ellipse cx="350" cy="60" rx="60" ry="45" fill="#ff69b4" opacity="0.25" />

    {/* 桃花花瓣飘落 */}
    {[...Array(20)].map((_, i) => {
      const x = 50 + Math.random() * 300;
      const delay = Math.random() * 2;
      return (
        <ellipse key={`petal${i}`} cx={x} cy={50 + Math.random() * 100} rx="4" ry="2" fill="#ffb6c1" opacity="0.6" transform={`rotate(${Math.random() * 360}, ${x}, ${50 + Math.random() * 100})`}>
          <animate attributeName="cy" values={`${50 + Math.random() * 50};${150 + Math.random() * 50}`} dur={`${3 + Math.random() * 2}s`} repeatCount="indefinite" begin={`${delay}s`} />
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur={`${2 + Math.random()}s`} repeatCount="indefinite" />
        </ellipse>
      );
    })}

    {/* 幻影神兵 */}
    <g transform="translate(200, 100)" opacity="0.3">
      <rect x="-5" y="-40" width="10" height="80" fill="#c9a227" rx="2">
        <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
      </rect>
      <ellipse cx="0" cy="0" rx="30" ry="20" fill="#c9a227" opacity="0.1">
        <animate attributeName="rx" values="25;40;25" dur="3s" repeatCount="indefinite" />
      </ellipse>
    </g>

    {/* 幻影财富 */}
    <circle cx="150" cy="80" r="15" fill="#ffd700" opacity="0.15">
      <animate attributeName="opacity" values="0.1;0.25;0.1" dur="2.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="280" cy="90" r="12" fill="#ffd700" opacity="0.12">
      <animate attributeName="opacity" values="0.08;0.2;0.08" dur="3s" repeatCount="indefinite" />
    </circle>

    {/* 迷幻光晕 */}
    <ellipse cx="200" cy="100" rx="150" ry="80" fill="#ff69b4" opacity="0.05">
      <animate attributeName="rx" values="120;180;120" dur="4s" repeatCount="indefinite" />
    </ellipse>
  </svg>
);

// 血海幻境
const BloodSeaIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="bloodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1a0505" />
        <stop offset="100%" stopColor="#0a0202" />
      </linearGradient>
    </defs>

    <rect width="400" height="200" fill="url(#bloodGrad)" />

    {/* 血海 */}
    <path d="M0 150 Q100 130 200 150 Q300 170 400 150 L400 200 L0 200 Z" fill="#3a0a0a" />
    <path d="M0 160 Q100 140 200 160 Q300 180 400 160 L400 200 L0 200 Z" fill="#2a0505" />

    {/* 血浪 */}
    <path d="M0 155 Q50 145 100 155 Q150 165 200 155 Q250 145 300 155 Q350 165 400 155" stroke="#5a1010" strokeWidth="2" fill="none" opacity="0.5">
      <animate attributeName="d" values="M0 155 Q50 145 100 155 Q150 165 200 155 Q250 145 300 155 Q350 165 400 155;M0 155 Q50 165 100 155 Q150 145 200 155 Q250 165 300 155 Q350 145 400 155;M0 155 Q50 145 100 155 Q150 165 200 155 Q250 145 300 155 Q350 165 400 155" dur="3s" repeatCount="indefinite" />
    </path>

    {/* 仇家剪影 */}
    {[...Array(5)].map((_, i) => {
      const x = 60 + i * 70;
      return (
        <g key={`enemy${i}`} transform={`translate(${x}, 120)`}>
          <ellipse cx="0" cy="20" rx="15" ry="25" fill="#0a0202" />
          <circle cx="0" cy="-10" r="10" fill="#0a0202" />
          {/* 刀 */}
          <line x1="15" y1="0" x2="35" y2="-20" stroke="#2a2a2a" strokeWidth="3" />
          {/* 狞笑 */}
          <path d="M-5 -8 Q0 -5 5 -8" stroke="#3a0a0a" strokeWidth="1" fill="none" />
        </g>
      );
    })}

    {/* 怨气 */}
    <ellipse cx="200" cy="100" rx="180" ry="60" fill="#dc2626" opacity="0.05">
      <animate attributeName="ry" values="50;70;50" dur="3s" repeatCount="indefinite" />
    </ellipse>

    {/* 血色闪电 */}
    <path d="M100 20 L120 50 L110 50 L130 80" stroke="#dc2626" strokeWidth="1" fill="none" opacity="0.3">
      <animate attributeName="opacity" values="0.1;0.5;0.1" dur="0.5s" repeatCount="indefinite" />
    </path>
    <path d="M300 10 L280 40 L290 40 L270 70" stroke="#dc2626" strokeWidth="1" fill="none" opacity="0.25">
      <animate attributeName="opacity" values="0.1;0.4;0.1" dur="0.6s" repeatCount="indefinite" />
    </path>
  </svg>
);

// 连弩陷阱
const CrossbowTrapIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="corridorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#151510" />
        <stop offset="100%" stopColor="#0a0a08" />
      </linearGradient>
    </defs>

    <rect width="400" height="200" fill="url(#corridorGrad)" />

    {/* 甬道壁 */}
    <rect x="0" y="0" width="400" height="40" fill="#1a1a15" />
    <rect x="0" y="160" width="400" height="40" fill="#1a1a15" />

    {/* 凸起地砖 */}
    <rect x="180" y="150" width="40" height="10" fill="#2a2a25" stroke="#3a3a35" strokeWidth="1" />

    {/* 墙壁小孔 - 弩机 */}
    {[...Array(8)].map((_, i) => (
      <g key={`hole${i}`}>
        <circle cx={50 + i * 45} cy="35" r="4" fill="#0a0a08" />
        <circle cx={50 + i * 45} cy="165" r="4" fill="#0a0a08" />
        {/* 弩箭 */}
        <line x1={50 + i * 45} y1="35" x2={50 + i * 45} y2="55" stroke="#4a4a45" strokeWidth="1" opacity="0.3" />
        <line x1={50 + i * 45} y1="165" x2={50 + i * 45} y2="145" stroke="#4a4a45" strokeWidth="1" opacity="0.3" />
      </g>
    ))}

    {/* 危险光效 */}
    <ellipse cx="200" cy="100" rx="150" ry="50" fill="#dc2626" opacity="0.03">
      <animate attributeName="opacity" values="0.02;0.05;0.02" dur="1s" repeatCount="indefinite" />
    </ellipse>

    {/* 深处光 */}
    <ellipse cx="350" cy="100" rx="30" ry="40" fill="#c9a227" opacity="0.08">
      <animate attributeName="opacity" values="0.05;0.12;0.05" dur="2s" repeatCount="indefinite" />
    </ellipse>

    {/* 尘埃 */}
    {[...Array(10)].map((_, i) => (
      <circle key={`dust${i}`} cx={50 + Math.random()*300} cy={50 + Math.random()*100} r="0.8" fill="#fff" opacity="0.1">
        <animate attributeName="opacity" values="0.05;0.15;0.05" dur={`${2 + Math.random()*2}s`} repeatCount="indefinite" />
      </circle>
    ))}
  </svg>
);

// 独木桥深渊
const BridgeAbyssIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="abyssGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0a0a10" />
        <stop offset="100%" stopColor="#020204" />
      </linearGradient>
    </defs>

    <rect width="400" height="200" fill="url(#abyssGrad)" />

    {/* 断崖 */}
    <path d="M0 0 L0 200 L80 200 L100 100 L100 0 Z" fill="#151518" />
    <path d="M400 0 L400 200 L320 200 L300 100 L300 0 Z" fill="#151518" />

    {/* 深渊 */}
    <rect x="100" y="100" width="200" height="100" fill="#020204" />

    {/* 独木桥 */}
    <rect x="100" y="95" width="200" height="10" fill="#3a2a1a" />
    {/* 青苔 */}
    <ellipse cx="150" cy="98" rx="15" ry="3" fill="#2a4a2a" opacity="0.5" />
    <ellipse cx="250" cy="100" rx="20" ry="4" fill="#2a4a2a" opacity="0.4" />
    <ellipse cx="200" cy="97" rx="12" ry="2" fill="#2a4a2a" opacity="0.6" />

    {/* 狂风效果 */}
    <path d="M120 60 Q140 50 160 60 Q180 70 200 60 Q220 50 240 60 Q260 70 280 60" stroke="#4a4a5a" strokeWidth="1" fill="none" opacity="0.2">
      <animate attributeName="d" values="M120 60 Q140 50 160 60 Q180 70 200 60 Q220 50 240 60 Q260 70 280 60;M120 55 Q140 65 160 55 Q180 45 200 55 Q220 65 240 55 Q260 45 280 55;M120 60 Q140 50 160 60 Q180 70 200 60 Q220 50 240 60 Q260 70 280 60" dur="1s" repeatCount="indefinite" />
    </path>

    {/* 深渊中的光点 */}
    <circle cx="150" cy="150" r="2" fill="#4a90d9" opacity="0.2">
      <animate attributeName="opacity" values="0.1;0.3;0.1" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="250" cy="170" r="1.5" fill="#4a90d9" opacity="0.15">
      <animate attributeName="opacity" values="0.08;0.25;0.08" dur="2.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="200" cy="180" r="1" fill="#4a90d9" opacity="0.1">
      <animate attributeName="opacity" values="0.05;0.2;0.05" dur="3s" repeatCount="indefinite" />
    </circle>
  </svg>
);

// 流沙密室
const QuicksandRoomIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="sandGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1a1510" />
        <stop offset="100%" stopColor="#0d0a08" />
      </linearGradient>
    </defs>

    <rect width="400" height="200" fill="url(#sandGrad)" />

    {/* 密室壁 */}
    <rect x="0" y="0" width="400" height="50" fill="#151510" />
    <rect x="0" y="0" width="50" height="200" fill="#151510" />
    <rect x="350" y="0" width="50" height="200" fill="#151510" />

    {/* 流沙 */}
    <ellipse cx="200" cy="150" rx="150" ry="50" fill="#c9a227" opacity="0.15" />
    <ellipse cx="200" cy="160" rx="120" ry="40" fill="#8b6914" opacity="0.2" />

    {/* 流沙漩涡 */}
    <path d="M200 140 Q220 150 200 160 Q180 170 200 180" stroke="#c9a227" strokeWidth="1" fill="none" opacity="0.3">
      <animate attributeName="d" values="M200 140 Q220 150 200 160 Q180 170 200 180;M200 140 Q180 150 200 160 Q220 170 200 180;M200 140 Q220 150 200 160 Q180 170 200 180" dur="3s" repeatCount="indefinite" />
    </path>

    {/* 铁索 */}
    <line x1="200" y1="0" x2="200" y2="60" stroke="#4a4a45" strokeWidth="4" />
    <line x1="200" y1="60" x2="190" y2="80" stroke="#4a4a45" strokeWidth="3" />
    <line x1="200" y1="60" x2="210" y2="80" stroke="#4a4a45" strokeWidth="3" />

    {/* 铁索摇晃 */}
    <animateTransform attributeName="transform" type="rotate" values="0 200 60;3 200 60;0 200 60;-3 200 60;0 200 60" dur="2s" repeatCount="indefinite" />

    {/* 高台光 */}
    <ellipse cx="200" cy="30" rx="30" ry="15" fill="#c9a227" opacity="0.1">
      <animate attributeName="opacity" values="0.05;0.15;0.05" dur="2s" repeatCount="indefinite" />
    </ellipse>

    {/* 沙粒飞溅 */}
    {[...Array(15)].map((_, i) => (
      <circle key={`sand${i}`} cx={150 + Math.random()*100} cy={120 + Math.random()*40} r="1" fill="#c9a227" opacity="0.3">
        <animate attributeName="cy" values={`${120 + Math.random()*40};${100 + Math.random()*30};${120 + Math.random()*40}`} dur={`${1 + Math.random()}s`} repeatCount="indefinite" />
      </circle>
    ))}
  </svg>
);

// 默认插画
const DefaultIllustration = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="defaultGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#15101a" />
        <stop offset="100%" stopColor="#0a050d" />
      </linearGradient>
    </defs>

    <rect width="400" height="200" fill="url(#defaultGrad)" />

    {/* 神秘光效 */}
    <ellipse cx="200" cy="100" rx="100" ry="60" fill="#c084fc" opacity="0.05">
      <animate attributeName="rx" values="80;120;80" dur="3s" repeatCount="indefinite" />
    </ellipse>

    {/* 符文 */}
    <text x="200" y="110" textAnchor="middle" fontSize="40" fill="#c084fc" opacity="0.2" fontFamily="serif">秘</text>

    {/* 光点 */}
    {[...Array(10)].map((_, i) => (
      <circle key={`light${i}`} cx={100 + Math.random()*200} cy={50 + Math.random()*100} r="2" fill="#c084fc" opacity="0.3">
        <animate attributeName="opacity" values="0.1;0.5;0.1" dur={`${2 + Math.random()*2}s`} repeatCount="indefinite" />
      </circle>
    ))}
  </svg>
);

export default EventIllustration;

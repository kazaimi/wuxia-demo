import React from 'react';
import { useGameStore, TREASURES_DB } from '../store/gameState';
import { Trophy, Medal, Star, Swords, Gift } from 'lucide-react';
import { useCleanImage } from '../utils/imageProcess';
import { NPC_SPECIAL_CONFIGS } from './EnhancedWarriorAvatar';

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

// 获取玩家的江湖个性台词/独白
const getPlayerQuote = (player, npcConfig) => {
  if (npcConfig) return npcConfig.quote;
  
  const title = player.title || '';
  if (title.includes('武当')) return '太极初传无极始，阴阳相济生不息。';
  if (title.includes('峨嵋')) return '倚天既出谁争锋，邪魔外道化飞灰。';
  if (title.includes('少林')) return '皈依佛法远红尘，金刚怒目震乾坤。';
  if (title.includes('华山')) return '独孤九剑破万法，无招胜有败群雄。';
  if (title.includes('丐帮')) return '降龙神威惊天地，亢龙有悔啸九天。';
  if (title.includes('明教')) return '焚我残躯熊熊火，生亦何欢死何苦。';
  if (title.includes('移花')) return '明玉功成冰雪肌，花落无痕冷清秋。';
  
  const quotes = [
    '一剑平生恨，十步杀一人。',
    '刀光剑影今犹在，不见当年英雄来。',
    '天下风云出我辈，一入江湖岁月催。',
    '纵死侠骨留余香，不惭世上英雄名。',
    '江湖路远，唯有一剑相伴。',
    '路见不平拔刀相助，此为侠之大者。',
    '偷得浮生半日闲，浊酒一杯慰风尘。',
    '一壶浊酒喜相逢，古今多少事，都付笑谈中。',
    '凭手中三尺青锋，试天下英雄谁手！',
    '剑气纵横三万里，一剑光寒十九州！'
  ];
  // 名字字符哈希兜底
  const index = Math.abs(player.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % quotes.length;
  return quotes[index];
};

// 获取玩家的江湖评语/短评，保证人人都有专属的评语位置
const getPlayerComment = (player, npcConfig) => {
  if (npcConfig) return npcConfig.comment;
  
  const title = player.title || '';
  if (title.includes('武当')) return '武当高足，太极玄功初窥门径。';
  if (title.includes('峨嵋')) return '峨嵋英杰，剑舞清影，正气凛然。';
  if (title.includes('少林')) return '少林武僧，外练筋骨，禅心稳固。';
  if (title.includes('华山')) return '华山剑客，剑气纵横，意气风发。';
  if (title.includes('丐帮')) return '丐帮翘楚，打狗棒下，忠义无双。';
  if (title.includes('明教')) return '明教锐士，圣火不熄，豪情壮志。';
  if (title.includes('移花')) return '移花高徒，明玉神功，翩若惊鸿。';
  
  const comments = [
    '初入江湖的英侠，根骨奇佳，前途不可限量。',
    '身怀绝世内功的隐秘高手，不显山露水。',
    '剑术超群的独行侠，常行侠仗义于乱世之中。',
    '威震一方的武林名宿，拳脚功夫冠绝群雄。',
    '行踪飘忽的江湖浪子，一壶浊酒走天涯。',
    '武学奇才，天资聪颖，假以时日必成大器。',
    '快意恩仇的刀客，出刀如风，狠辣凌厉。',
    '内家功夫精湛的隐士，气息悠长，绵密不绝。',
    '身轻如燕的轻功高手，飞檐走壁，无所不能。',
    '名门之后，天资非凡，深得武林前辈真传。'
  ];
  const hashIndex = Math.abs(player.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + 13) % comments.length;
  return comments[hashIndex];
};

// 排行榜列表项背景：右侧绝对定位、斜切剪裁立绘
function LeaderboardRowBackground({ name, npcConfig }) {
  const gender = guessGenderByName(name);
  const isFemale = gender === 'female';
  const defaultSrc = isFemale ? '/wuxia_female_hero.png' : '/wuxia_male_hero.png';
  
  // 初始图片路径
  let initialSrc = defaultSrc;
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
    let key = '';
    for (const k of Object.keys(nameMap)) {
      if (name.includes(k)) {
        key = nameMap[k];
        break;
      }
    }
    if (key) {
      initialSrc = `/npc_${key}.png`;
    }
  }
  
  const [imgSrc, setImgSrc] = React.useState(initialSrc);
  const [fallbackActive, setFallbackActive] = React.useState(false);
  
  React.useEffect(() => {
    let src = defaultSrc;
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
      let key = '';
      for (const k of Object.keys(nameMap)) {
        if (name.includes(k)) {
          key = nameMap[k];
          break;
        }
      }
      if (key) {
        src = `/npc_${key}.png`;
      }
    }
    setImgSrc(src);
    setFallbackActive(false);
  }, [name, npcConfig, defaultSrc]);

  const handleError = () => {
    if (imgSrc !== defaultSrc) {
      setImgSrc(defaultSrc);
      setFallbackActive(true);
    }
  };

  return (
    <div style={{
      position: 'absolute',
      // 将图片稍微向右偏，定位在离右侧 185px 处，平衡“避开按钮”与“不偏左居中”的视觉感
      right: '185px',
      top: 0,
      bottom: 0,
      // 放大图片展示区域，提供震撼的立绘细节
      width: '320px',
      pointerEvents: 'none',
      zIndex: 1,
      // 采用硬朗的平行四边形切槽，更具格斗游戏张力
      clipPath: 'polygon(40px 0, 100% 0, calc(100% - 40px) 100%, 0 100%)',
      background: npcConfig ? `${npcConfig.color}15` : 'rgba(212, 175, 55, 0.03)',
      borderLeft: `1.5px solid ${npcConfig ? npcConfig.color : 'var(--gold)'}20`,
      borderRight: `1.5px solid ${npcConfig ? npcConfig.color : 'var(--gold)'}20`,
      // 容器级双向渐变遮罩：使平行四边形的左右斜边、背景和边框整体自然羽化，无缝融入格子的深色背景
      WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 20%, rgba(0,0,0,1) 80%, transparent 100%)',
      maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 20%, rgba(0,0,0,1) 80%, transparent 100%)',
    }}>
      <img
        src={imgSrc}
        alt={name}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 15%',
          opacity: 0.42,
          filter: (fallbackActive && npcConfig) ? npcConfig.filter : 'none',
          // 双向渐变融合效果：左侧和右侧都羽化淡出，完美隐入格子黑色背景中
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 25%, rgba(0,0,0,1) 75%, transparent 100%)',
          maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 25%, rgba(0,0,0,1) 75%, transparent 100%)',
        }}
      />
    </div>
  );
}

export default function Leaderboard() {
  const onlinePlayers = useGameStore(state => state.onlinePlayers);
  const player = useGameStore(state => state.player);
  const challengePlayer = useGameStore(state => state.challengePlayer);
  const inBattle = useGameStore(state => state.battleState.inBattle);
  
  const cleanIcon = useCleanImage('/wuxia_leader_icon.png');

  // 按照服务器指定的 rankIndex 升序排序
  const fullBoard = [...onlinePlayers].sort((a, b) => (a.rankIndex || 9999) - (b.rankIndex || 9999));

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* 顶部装饰 */}
      <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', opacity: 0.5 }} />

      {/* 居中大标题排版 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '0.5rem', marginBottom: '1rem' }}>
        <img
          src={cleanIcon}
          alt="风云榜"
          style={{
            width: '130px',
            height: '130px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 12px rgba(212, 175, 55, 0.45))',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        />
        <h2 style={{ fontSize: '2rem', color: 'var(--gold)', fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '4px', marginTop: '0.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
          全网风云榜
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '600px', textAlign: 'center', margin: '0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          群英荟萃，名震江湖 <span style={{ fontSize: '0.85rem', color: 'var(--jade)', fontWeight: 'bold' }}>(当前在线)</span>
        </p>
      </div>

      {/* 渐变金色分割线 */}
      <div style={{ width: '80%', height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', margin: '0.5rem auto 1.5rem', opacity: 0.3 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', overflowY: 'auto' }}>
        {fullBoard.length === 0 && <p style={{color: 'var(--text-muted)'}}>当前无大侠连入江湖...</p>}
        {fullBoard.map((u, i) => {
          const isMe = u.name === player.name;
          const tName = u.equippedTreasure ? TREASURES_DB?.find(t => t.id === u.equippedTreasure)?.name : null;
          const rankColors = ['var(--gold)', '#c0c0c0', '#cd7f32']; // 金银铜

          // 匹配特殊 NPC 配置
          let npcConfig = null;
          for (const key of Object.keys(NPC_SPECIAL_CONFIGS)) {
            if (u.name.includes(key)) {
              npcConfig = NPC_SPECIAL_CONFIGS[key];
              break;
            }
          }

          // 获取每个人物的个性台词/经典名句
          const quote = getPlayerQuote(u, npcConfig);

          return (
          <div key={u.id} className="wuxia-card" style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.8rem 1.2rem',
            minHeight: '95px',
            background: 'var(--glass-bg)', borderRadius: '8px',
            border: isMe ? '1px solid var(--gold)' : '1px solid var(--glass-border)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* 格斗游戏裁切背景立绘 (带斜切和 mask 羽化) */}
            <LeaderboardRowBackground name={u.name} npcConfig={npcConfig} />

            {/* 排名装饰 */}
            {i < 3 && (
              <div style={{ position: 'absolute', top: '-6px', left: '10px', fontSize: '1.2rem', filter: 'drop-shadow(0 0 4px ' + rankColors[i] + ')', zIndex: 3 }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
              </div>
            )}

            {/* 左侧内容区：名次 + 个人姓名/称号标签 + 台词 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 2, position: 'relative', maxWidth: '72%' }}>
              <strong style={{ minWidth: '32px', color: i < 3 ? rankColors[i] : 'var(--text-muted)', fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif', fontSize: '1.3rem' }}>#{i + 1}</strong>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                 <div style={{ fontSize: '1.15rem', color: u.isBattling ? 'var(--text-muted)' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                   <span style={{ fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif', letterSpacing: '1px', fontWeight: isMe ? 'bold' : 'normal' }}>{u.name}</span>
                   {isMe && <span style={{ color: 'var(--gold)', fontSize: '0.82rem' }}>(您)</span>}
                   {u.isBattling && <span style={{ color: 'var(--crimson)', fontSize: '0.82rem' }}>[激战中]</span>}
                   {u.title && <span className="wuxia-tag" style={{ fontSize: '0.72rem', padding: '1px 6px' }}>{u.title}</span>}
                   {u.dailyDebuffs && u.dailyDebuffs.length > 0 && <span style={{ fontSize: '0.72rem', color: 'var(--crimson)', background: 'rgba(220, 20, 60, 0.1)', border: '1px solid var(--crimson)', padding: '1px 6px', borderRadius: '3px' }}>[{u.dailyDebuffs.join(' / ')}]</span>}
                 </div>
                 
                 {/* 个性台词/金句名帖 */}
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                   <p style={{
                     margin: 0,
                     fontSize: '0.82rem',
                     color: npcConfig ? '#fff5d4' : '#d1d5db',
                     fontFamily: '"Ma Shan Zheng", cursive',
                     letterSpacing: '1.2px',
                     fontStyle: 'italic',
                     textShadow: '0 2px 4px rgba(0, 0, 0, 0.95)',
                   }}>
                     “{quote}”
                   </p>
                   
                   <p style={{
                      margin: '2px 0 0 0',
                      fontSize: '0.68rem',
                      color: 'var(--text-muted)',
                      fontFamily: '"Outfit", sans-serif',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.9)',
                    }}>
                      {getPlayerComment(u, npcConfig)}
                    </p>
                 </div>
              </div>
            </div>

            {/* 右侧数据与交互区：置于立绘右侧区域 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', zIndex: 2, position: 'relative', minWidth: '150px' }}>
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                {tName && (
                  <span style={{
                    fontSize: '0.74rem',
                    color: 'var(--gold)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.9)',
                    background: 'rgba(212, 175, 55, 0.08)',
                    border: '1px solid rgba(212, 175, 55, 0.25)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    boxShadow: 'inset 0 0 4px rgba(212, 175, 55, 0.1)'
                  }}>
                    <Gift size={11} style={{ flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap' }}>{tName}</span>
                  </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                  <Star size={14} color="var(--gold)" /> 
                  <span style={{ color: 'var(--gold)', fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif', fontSize: '0.95rem' }}>
                    Lv.{u.level}
                  </span>
                </span>
              </div>
              {!isMe && !u.isBattling && !inBattle && (
                <button onClick={() => challengePlayer(u.id)} className="btn-primary" style={{ padding: '0.35rem 0.9rem', fontSize: '0.82rem', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)' }}>
                  <Swords size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }}/>
                  挑战
                </button>
              )}
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}

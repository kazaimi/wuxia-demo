import React, { useState } from 'react';
import { Copy, Check, Eye, X } from 'lucide-react';

const SCENES_DATA = [
  {
    category: '残局博弈 (puzzle)',
    icon: '☯️',
    color: '#a855f7',
    scenes: [
      {
        id: 'chess_01',
        name: '石亭残局',
        fileName: 'chess_01.png',
        desc: '你行至一处石亭，见石桌上刻着一局未完的棋阵，黑白交错，杀机四伏。微风拂过，落叶停在关键死位。',
        prompt: 'A wide landscape water-ink illustration of a solitary stone pavilion in a misty dark mountain forest. On a stone table in the pavilion, a Go chessboard is carved, with glowing black and white pieces creating a tense, complex pattern. A single golden autumn leaf has just fallen onto a critical junction of the board, glowing with soft warm golden light. Chinese dark ink-wash style, thick brush strokes, pure black background, gold paint dust, mysterious dark grey clouds. --ar 2:1',
      },
      {
        id: 'chess_02',
        name: '八卦阵图',
        fileName: 'chess_02.png',
        desc: '石墙上刻画着错综复杂的上古八卦阵图，几个阵眼处隐隐流淌着赤红的真气，仿佛在引诱人去补齐全貌。',
        prompt: 'A wide landscape water-ink illustration of an ancient stone wall inside a cavern. Deeply carved into the stone is a massive Bagua (Eight Trigrams) diagram, its lines and symbols glowing with elegant ancient gold light. In several array nodes, streams of vibrant crimson qi energy are slowly flowing like liquid fire. Chinese dark ink-wash style, raw ink brush strokes, pure black background, gold dust particles, mysterious red aura. --ar 2:1',
      },
      {
        id: 'chess_03',
        name: '武功残卷',
        fileName: 'chess_03.png',
        desc: '你在地上发现了几册残破的武功简卷。虽然凌乱，但其中似乎包藏着某种互相牵制的奇妙内力运行轨迹。',
        prompt: 'A wide landscape water-ink illustration of a secret scroll chamber. Scattered across the dark stone floor are several damaged and unrolled bamboo scrolls. Faint but distinct glowing trails of purple and jade green qi rise from the scrolls, intertwining to form complex inner energy paths. Chinese dark ink-wash style, rough ink washes, pure black background, gold leaf dust, floating dust particles in shafts of light. --ar 2:1',
      }
    ]
  },
  {
    category: '献祭流 (sacrifice)',
    icon: '🩸',
    color: '#ef4444',
    scenes: [
      {
        id: 'sacrifice_01',
        name: '白猿求药',
        fileName: 'sacrifice_01.png',
        desc: '前方毒瘴弥漫间，一只浑身雪白的猿猴腹部流血，正指着山林深处发出微弱的哀鸣。',
        prompt: 'A wide landscape water-ink illustration of a dark, dense forest filled with swirling green toxic swamp gas. In the foreground, a wounded snow-white monkey is lying on the mossy ground, its hand weakly pointing towards the dark depths of the forest. The wound on its stomach glows with a warm, bright crimson healing aura. Chinese dark ink-wash style, thick lines, pure black background, gold paint splashes, melancholic atmosphere. --ar 2:1',
      },
      {
        id: 'sacrifice_02',
        name: '高僧中毒',
        fileName: 'sacrifice_02.png',
        desc: '一名少林高僧面色紫黑地倒在路边，显然中了奇毒。他口中喃喃念佛，似乎认命。',
        prompt: 'A wide landscape water-ink illustration of a mountain path. A Shaolin Buddhist monk in brown robes lies poisoned against a mossy boulder, his face dark purple with poison, his hands held in prayer. A faint, pure golden Buddhist halo glows weakly behind his head, contrasted by swirling dark purple toxic fumes surrounding him. Chinese dark ink-wash style, heavy brush strokes, pure black background, gold dust, spiritual sacrifice. --ar 2:1',
      },
      {
        id: 'sacrifice_03',
        name: '阴寒女尸',
        fileName: 'sacrifice_03.png',
        desc: '路边倒着一具衣衫破烂的女尸，周身萦绕着阴寒之气，似乎即将尸变。',
        prompt: 'A wide landscape water-ink illustration of a cold, eerie cavern floor. A pale female corpse in tattered dark robes lies on the ground, surrounded by a swirling aura of cold, glowing cyan ghost-fire and freezing vapor. The atmosphere is freezing and mystical. Chinese dark ink-wash style, delicate yet raw strokes, pure black background, gold leaf particles, glowing ice-blue details. --ar 2:1',
      }
    ]
  },
  {
    category: '蛮力破除 (brute_force)',
    icon: '⚡',
    color: '#eab308',
    scenes: [
      {
        id: 'brute_01',
        name: '古寺掀佛',
        fileName: 'brute_01.png',
        desc: '夜过破败古寺，残存的佛像金漆剥落。佛身背后传来微弱的念经声，却伴随着令人头皮发麻的骨骼摩擦声。',
        prompt: 'A wide landscape water-ink illustration of a dilapidated ancient temple at night. In the dark sanctuary, a giant stone Buddha statue stands with its golden paint peeling away. Behind the statue, faint dark red eyes glow menacingly from the shadows. Chinese dark ink-wash style, heavy ink washes, pure black background, gold dust splatters, eerie and intense atmosphere. --ar 2:1',
      },
      {
        id: 'brute_02',
        name: '断龙石墙',
        fileName: 'brute_02.png',
        desc: '一扇千斤重的断龙石挡住了去路。岩壁两旁有细小的侧缝，只能勉强让人侧身钻过，但充满未知的气息。',
        prompt: 'A wide landscape water-ink illustration of a massive, heavy stone gate (Dragon Stone) blocking a cavern passage. Engraved on the stone gate are ancient glowing golden seal characters. The rock walls on both sides have narrow, dark cracks. Chinese dark ink-wash style, rough texture, pure black background, gold paint dust, sense of crushing weight. --ar 2:1',
      },
      {
        id: 'brute_03',
        name: '地衣蟹群',
        fileName: 'brute_03.png',
        desc: '密道中突然涌出无数铁甲地衣蟹，它们坚硬的外壳堵死了一层通道，发出刺耳的爬行声。',
        prompt: 'A wide landscape water-ink illustration of a dark underground cave. A swarm of iron-shelled crabs with sharp claws is crawling over the stone floor, completely blocking the tunnel, their hard shells shining with a metallic grey-gold luster under faint light. Chinese dark ink-wash style, thick black lines, pure black background, gold speckles. --ar 2:1',
      }
    ]
  },
  {
    category: '古迹遗留 (relic)',
    icon: '💎',
    color: '#10b981',
    scenes: [
      {
        id: 'relic_01',
        name: '剑冢枯骨',
        fileName: 'relic_01.png',
        desc: '墓道尽头出现一具枯骨，斜靠在玄铁重剑旁，墙上刻着：“纵横江湖三十余载，杀尽仇寇，败尽英雄……” 字迹入木三分。',
        prompt: 'A wide landscape water-ink illustration of the end of a dark tomb passage. A skeletal remains leans against a massive, dark heavy iron greatsword. On the stone wall behind it, golden brush-written calligraphy text "独孤求败" is carved deeply into the stone. Chinese dark ink-wash style, raw brush strokes, pure black background, gold paint particles, solemn and historic mood. --ar 2:1',
      },
      {
        id: 'relic_02',
        name: '寒泉仙图',
        fileName: 'relic_02.png',
        desc: '洞窟中央有一口干涸的寒泉，泉底雕刻着一副栩栩如生的仙女舞剑图，壁上剑痕透着森寒之意。',
        prompt: 'A wide landscape water-ink illustration of a dry, cold stone pool in the center of a cavern. Carved at the bottom of the spring is a detailed outline of a sword-dancing goddess. Morose blue ice crystals and frost cling to the stone, glowing with cold blue light. Chinese dark ink-wash style, sharp lines, pure black background, gold dust, freezing air. --ar 2:1',
      },
      {
        id: 'relic_03',
        name: '古铜香炉',
        fileName: 'relic_03.png',
        desc: '前人留下的蒲团早已腐朽，但旁侧有一尊古铜香炉，其中那柱香至今未灭，异香扑鼻。',
        prompt: 'A wide landscape water-ink illustration of a quiet meditation chamber. Next to a decayed straw mat, an ancient bronze incense burner sits, holding a single glowing red incense stick. Whisps of gold and purple aromatic smoke rise gracefully, forming abstract dragon-like shapes. Chinese dark ink-wash style, delicate details, pure black background, gold leaf dust. --ar 2:1',
      }
    ]
  },
  {
    category: '幻境审视 (illusion)',
    icon: '🔮',
    color: '#06b6d4',
    scenes: [
      {
        id: 'illusion_01',
        name: '冰窟心魔',
        fileName: 'illusion_01.png',
        desc: '你来到一处冰窟，四壁光滑如镜。镜中的你面容扭曲，突然开口引诱道：“何必苦修？将身交我，立地成佛。”',
        prompt: 'A wide landscape water-ink illustration of a chamber inside an ice cave. The ice walls are smooth as glass, reflecting a distorted, sinister shadow of a person with glowing red eyes. The atmosphere is cold, echoing, and psychological. Chinese dark ink-wash style, high contrast, pure black background, gold and ice-blue dust. --ar 2:1',
      },
      {
        id: 'illusion_02',
        name: '桃花迷障',
        fileName: 'illusion_02.png',
        desc: '周围忽然生出一片桃花林，花瓣蹁跹间，你仿佛看到了自己最想得到的神兵、财富与权力，唾手可得。',
        prompt: 'A wide landscape water-ink illustration of a surreal peach blossom forest. Swirling pink petals fill the air. Through the pink mist, glowing golden silhouettes of legendary swords, chests of gold, and thrones float temptingly. Chinese dark ink-wash style, soft washes, pure black background, gold paint dust. --ar 2:1',
      },
      {
        id: 'illusion_03',
        name: '血海修罗',
        fileName: 'illusion_03.png',
        desc: '你踏入一片血海幻境，你的过往仇家纷纷持刀狞笑逼近，怨气冲天，周围的空间逐渐胶着沉重。',
        prompt: 'A wide landscape water-ink illustration of a sea of boiling red blood under a dark, storm-torn sky. Shadowy figures of armed warriors approach menacingly, surrounded by dark red lightning and thick black smoke. Chinese dark ink-wash style, violent brush strokes, pure black background, gold and red paint dust. --ar 2:1',
      }
    ]
  },
  {
    category: '身法机关 (trap)',
    icon: '🏹',
    color: '#f97316',
    scenes: [
      {
        id: 'trap_01',
        name: '连弩甬道',
        fileName: 'trap_01.png',
        desc: '狭窄的甬道中，地砖有些轻微的凸起。墙壁两侧排列着密密麻麻的小孔，显然是极为恶毒的连弩陷阱。',
        prompt: 'A wide landscape water-ink illustration of a narrow stone corridor. Small, dark arrow holes line both walls. A few tiles on the stone floor are slightly raised, connected by faint golden tripwires. Chinese dark ink-wash style, geometric perspective, pure black background, gold leaf dust, high tension. --ar 2:1',
      },
      {
        id: 'trap_02',
        name: '青苔单木桥',
        fileName: 'trap_02.png',
        desc: '前方是一段只有独木桥的深渊断崖，且狂风大作，桥面上还结着厚厚的湿滑青苔。',
        prompt: 'A wide landscape water-ink illustration of a narrow wooden log bridge spanning a bottomless dark canyon. Swirling grey storm winds howl through the abyss, and the bridge surface is covered in slippery, glowing green moss. Chinese dark ink-wash style, raw brush strokes, pure black background, gold and green paint splatters. --ar 2:1',
      },
      {
        id: 'trap_03',
        name: '流沙密室',
        fileName: 'trap_03.png',
        desc: '你误入了一间流沙密室，四面漏沙极快，很快漫过膝盖，头顶只有一根摇摇欲坠的铁索直通高台。',
        prompt: 'A wide landscape water-ink illustration of a sealed stone room rapidly filling with yellow sand. The sand level is deep. High above, a heavy iron chain hangs from the ceiling leading to a small, glowing golden platform. Chinese dark ink-wash style, high contrast, pure black background, gold paint dust. --ar 2:1',
      }
    ]
  }
];

export default function SecretRealmGallery({ onClose }) {
  const [copiedId, setCopiedId] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', animation: 'fadeIn 0.5s' }}>
      
      {/* 头部标题区域 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.4rem', color: '#c084fc', fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '2px', margin: '0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🧭 琅嬛福地 · 十八幻境图卷
          </h3>
          <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#888' }}>
            点击复制提示词生图，保存于游戏公用目录：<code>public/scenes/</code> 覆盖同名文件
          </p>
        </div>
        <button 
          onClick={onClose} 
          style={{
            background: 'rgba(30, 20, 40, 0.6)', border: '1px solid rgba(192, 132, 252, 0.4)', color: '#c084fc',
            padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '0.85rem', transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(192, 132, 252, 0.2)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(30, 20, 40, 0.6)'}
        >
          返回福地入口
        </button>
      </div>

      {/* 18 场景网格排版 */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {SCENES_DATA.map((group, groupIdx) => (
          <div key={groupIdx} style={{
            background: 'rgba(15,10,25,0.4)',
            border: `1px solid ${group.color}25`,
            borderRadius: '10px',
            padding: '1.2rem',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4)'
          }}>
            {/* 分类标题 */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '1.1rem', color: group.color, fontWeight: 'bold',
              fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '1px',
              marginBottom: '1rem', borderBottom: `1px solid ${group.color}35`,
              paddingBottom: '0.4rem'
            }}>
              <span>{group.icon}</span>
              <span>{group.category}</span>
            </div>

            {/* 子场景网格 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.2rem'
            }}>
              {group.scenes.map((scene) => {
                const sceneImagePath = `/scenes/${scene.fileName}`;
                return (
                  <div key={scene.id} className="glass-panel" style={{
                    padding: '0.8rem',
                    background: 'rgba(10, 5, 15, 0.85)',
                    border: '1px solid rgba(192, 132, 252, 0.15)',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px',
                    transition: 'all 0.3s ease'
                  }}>
                    {/* 图片预览图层 */}
                    <div style={{
                      position: 'relative', width: '100%', height: '120px',
                      background: 'rgba(0,0,0,0.5)', borderRadius: '6px',
                      overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <img 
                        src={sceneImagePath} 
                        alt={scene.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {/* 图片加载失败时的退回UI */}
                      <div style={{
                        display: 'none', position: 'absolute', inset: 0,
                        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        background: 'linear-gradient(135deg, #1f112e 0%, #0d0615 100%)',
                        color: '#6c5385', fontSize: '0.75rem', fontFamily: '"Ma Shan Zheng", cursive',
                        letterSpacing: '1px'
                      }}>
                        <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🌫️</div>
                        <div>水墨未显 (暂无图片)</div>
                      </div>

                      {/* 悬浮预览放大按钮 */}
                      <button 
                        onClick={() => setPreviewImg({ src: sceneImagePath, name: scene.name })}
                        style={{
                          position: 'absolute', bottom: '6px', right: '6px',
                          background: 'rgba(0,0,0,0.7)', border: 'none', color: '#eee',
                          borderRadius: '4px', padding: '4px 6px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem'
                        }}
                      >
                        <Eye size={12} />
                        放大
                      </button>
                    </div>

                    {/* 场景详情描述 */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.95rem', color: '#eee', fontWeight: 'bold', fontFamily: '"Ma Shan Zheng", sans-serif' }}>
                          {scene.name}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: '#6c5385', background: 'rgba(192, 132, 252, 0.1)', padding: '1px 5px', borderRadius: '3px', fontFamily: 'monospace' }}>
                          {scene.fileName}
                        </span>
                      </div>
                      <p style={{ margin: '0', fontSize: '0.75rem', color: '#999', lineHeight: '1.5', minHeight: '68px' }}>
                        {scene.desc}
                      </p>
                    </div>

                    {/* 提示词复制行 */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: 'rgba(0,0,0,0.6)', padding: '5px 8px', borderRadius: '4px',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <div style={{
                        flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        fontSize: '0.65rem', color: '#6c5385', fontFamily: 'monospace'
                      }}>
                        {scene.prompt}
                      </div>
                      <button
                        onClick={() => handleCopy(scene.prompt, scene.id)}
                        style={{
                          background: copiedId === scene.id ? '#10b981' : 'rgba(192, 132, 252, 0.2)',
                          border: 'none', color: copiedId === scene.id ? '#111' : '#c084fc',
                          padding: '4px', borderRadius: '3px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s', width: '22px', height: '22px'
                        }}
                        title="复制生图提示词"
                      >
                        {copiedId === scene.id ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 放大预览灯箱 (Lightbox) */}
      {previewImg && (
        <div 
          onClick={() => setPreviewImg(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(5,5,10,0.95)',
            zIndex: 99999, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: '2rem',
            animation: 'fadeIn 0.25s'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#c084fc' }}>
              <span style={{ fontFamily: '"Ma Shan Zheng", cursive', fontSize: '1.2rem', letterSpacing: '1px' }}>
                🔍 幻境预览：{previewImg.name}
              </span>
              <button 
                onClick={() => setPreviewImg(null)}
                style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>
            <div style={{
              width: '100%', height: 'auto', minHeight: '300px',
              borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(192, 132, 252, 0.3)',
              background: '#0a050f', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <img 
                src={previewImg.src} 
                alt={previewImg.name}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
                style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
              />
              <div style={{ display: 'none', color: '#555', fontSize: '1.2rem', fontFamily: '"Ma Shan Zheng", cursive' }}>
                🌫️ 幻境水墨尚未显现
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

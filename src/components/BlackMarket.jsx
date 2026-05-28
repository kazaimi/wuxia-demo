import React, { useState, useEffect } from 'react';
import { useGameStore, SKILLS_DB, TREASURES_DB, ATTR_MAP } from '../store/gameState';
import { ShoppingBag, Coffee, Package, X, Sparkles, AlertCircle, BookOpen, Key, GlassWater } from 'lucide-react';
import { SoundManager } from '../utils/SoundManager';

const MERCHANT_DIALOGUES = [
  "大侠，江湖凶险，没点硬通货防身可走不远啊……",
  "橙C美式？那可是域外进贡的醒神仙水，喝一口包你疲惫尽消！",
  "别瞧了，这盲盒里塞了啥连老夫自己都记不清，但保准有绝世珍品！",
  "十全大补丸，老夫用九九八十一天文武火炼制，吃了立竿见影！",
  "被秘境心魔折磨得不轻？来张净心符，保你元神清明。",
  "一分钱难倒英雄汉，老夫这儿可是谢绝赊账的，嘿嘿……",
  "瞧瞧这成色，都是从琅嬛福地最深处九死一生倒腾出来的宝贝！"
];

const cleanText = (text) => {
  if (!text) return '';
  return text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\[\]「」x（）()+\-\s]/g, '').trim();
};

export default function BlackMarket({ onClose }) {
  const player = useGameStore(state => state.player);
  const addSilver = useGameStore(state => state.addSilver);
  const gainTreasure = useGameStore(state => state.gainTreasure);
  const learnSkill = useGameStore(state => state.learnSkill);
  const addAttributes = useGameStore(state => state.addAttributes);
  const clearDailyDebuffs = useGameStore(state => state.clearDailyDebuffs);
  const resetPoints = useGameStore(state => state.resetPoints);
  const gainExp = useGameStore(state => state.gainExp);

  const [shopItems, setShopItems] = useState([]);
  const [dialogue, setDialogue] = useState(MERCHANT_DIALOGUES[0]);
  const [dialogueIndex, setDialogueIndex] = useState(0);

  // 挂载时切换为繁华市集 BGM，卸载时切回
  useEffect(() => {
    SoundManager.playMusic('bgm_market');
    return () => {
      SoundManager.playMusic('bgm_menu');
    };
  }, []);

  // 轮播商贩台词
  useEffect(() => {
    const timer = setInterval(() => {
      setDialogueIndex(prev => {
        const next = (prev + 1) % MERCHANT_DIALOGUES.length;
        setDialogue(MERCHANT_DIALOGUES[next]);
        return next;
      });
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
     const items = [
       { id: 'item_coffee', name: '【特供】橙C美式', price: 99, desc: '大口痛饮，洗涤所有疲劳！立即重置当天的悬赏、奇遇、秘境次数到满状态！', icon: <Coffee size={18} color="#f97316" />, type: 'coffee' },
       { id: 'item_purify', name: '【圣物】净心符', price: 55, desc: '焚香沐浴，驱散所有恶兆缠身，恢复清明心智！', icon: <Sparkles size={18} color="#c084fc" />, type: 'purify' },
       { id: 'item_box1', name: '破旧的残卷箱', price: 8, desc: '随机获得一本入门外功或内功(必定非绝学)。', icon: <Package size={18} color="#a1a1aa" />, type: 'skill_box1' },
       { id: 'item_drug', name: '十全大补丸', price: 10, desc: '仙人秘制，随机永久增加3~5项基础属性各1~3点，立竿见影！', icon: <AlertCircle size={18} color="#fbbf24" />, type: 'attr_drug' },
       { id: 'item_reset_pill', name: '【奇珍】洗髓灵丹', price: 50, desc: '洗去身上所有的常规分配属性点并全额返还为自由潜能点，大补丸的修持加成正常保留。', icon: <Sparkles size={18} color="#34d399" />, type: 'reset_pill' },
       { id: 'item_heaven_token', name: '【密令】通天令牌', price: 30, desc: '墨玉令出，福地洞开！减少 5 次今日已用秘境挑战次数（相当于今日额外获得 5 次秘境机会）！', icon: <Key size={18} color="#818cf8" />, type: 'heaven_token' },
       { id: 'item_peach_nectar', name: '【仙酿】万寿蟠桃露', price: 100, desc: '蟠桃仙浆，琼浆玉液。痛饮后立刻获得 1000 点修为经验值！', icon: <GlassWater size={18} color="#22d3ee" />, type: 'peach_nectar' },
       { id: 'item_heaven_scroll', name: '【秘宝】天书密卷', price: 150, desc: '金光笼罩的神秘竹简，记载了震古烁今的武学奥秘，购买后随机领悟一本【绝学】级强力武功！', icon: <BookOpen size={18} color="#f59e0b" />, type: 'heaven_scroll' },
       { id: 'item_box2', name: '传说的盲盒', price: 100, desc: '随机获得一件史诗或传说宝具！', icon: <Package size={18} color="#e879f9" />, type: 'treasure_box' },
     ];
     setShopItems(items);
  }, []);

  const handleBuy = (item) => {
     if ((player.silver || 0) < item.price) {
         setDialogue("兜里就这么几文钱，也想买老夫的心头好？去去去！");
         SoundManager.play('sfx_fail');
         alert("对不起大侠，您的银两不足！黑市可不讲人情买卖。");
         return;
     }

     if (item.type === 'coffee') {
         const p = useGameStore.getState().player;
         p.taskCount = 0;
         p.encountersToday = 0;
         p.secretRealmAttempts = 0;
         addSilver(-item.price);
         useGameStore.setState({ player: { ...p } });
         setDialogue("好酒量！这西洋仙水味道古怪，但确有奇效，拿去用吧！");
         alert("冰爽美式下肚，疲惫一扫而空！你今天的所有的副今回数已完全刷新！");
     } else if (item.type === 'skill_box1') {
         const pool = SKILLS_DB.filter(s => s.type !== 'ultimate' && s.type !== 'motion' && s.reqLvl <= 15);
         const sk = pool[Math.floor(Math.random()*pool.length)];
         learnSkill(sk.id);
         addSilver(-item.price);
         setDialogue(`财货两清，这本《${cleanText(sk.name)}》就归你了，切莫外传！`);
         alert(`你打开破旧箱子，里面竟然是【${cleanText(sk.name)}】！`);
     } else if (item.type === 'attr_drug') {
         const allAttrs = Object.keys(ATTR_MAP);
         const shuffled = [...allAttrs].sort(() => Math.random() - 0.5);
         const count = 3 + Math.floor(Math.random() * 3);
         const chosen = shuffled.slice(0, count);
         const boosts = {};
         const lines = [];
         chosen.forEach(attr => {
             const val = 1 + Math.floor(Math.random() * 3);
             boosts[attr] = val;
             lines.push(`${ATTR_MAP[attr]} +${val}`);
         });
         addSilver(-item.price);
         addAttributes(boosts);
         setDialogue("丹药入腹，感觉浑身经脉发胀了吧？回去好生消化！");
         alert(`你一口吞下十全大补丸，顿觉真气涌动！\n\n永久获得：\n${lines.join('\n')}`);
     } else if (item.type === 'treasure_box') {
         const pool = TREASURES_DB.filter(t => t.rarity === '史诗' || t.rarity === '传说');
         const t = pool[Math.floor(Math.random()*pool.length)];
         gainTreasure(t.id);
         addSilver(-item.price);
         setDialogue(`啧啧啧，这可是老夫的压箱底宝贝【${cleanText(t.name)}】，便宜你这小子了！`);
         alert(`光芒大作！你从盲盒中开出了绝世珍宝【${cleanText(t.name)}】！`);
     } else if (item.type === 'purify') {
         clearDailyDebuffs();
         addSilver(-item.price);
         setDialogue("符纸燃尽，怨魂退散。你头顶的那缕黑气已经消散了。");
         alert("净心符燃尽，恶兆消散！你感觉身心重新变得清明。");
     } else if (item.type === 'reset_pill') {
         resetPoints();
         addSilver(-item.price);
         setDialogue("脱胎换骨，伐毛洗髓！大侠现在可以重新划分你的属性潜能了！");
         alert("洗髓成功！你身上的常规分配点数已全部重置并退还为自由潜能点，大补丸的修持加成已为你妥善保留。");
     } else if (item.type === 'heaven_token') {
         const p = useGameStore.getState().player;
         p.secretRealmAttempts = Math.max(0, (p.secretRealmAttempts || 0) - 5);
         addSilver(-item.price);
         useGameStore.setState({ player: { ...p } });
         setDialogue("拿好令牌，琅嬛福地的护法长老见此令如见庄主，去吧！");
         alert("你激活了通天令牌，今日秘境探索已扣减 5 次使用记录（即额外获得 5 次秘境机会）！");
     } else if (item.type === 'peach_nectar') {
         gainExp(1000);
         addSilver(-item.price);
         setDialogue("琼浆玉液，造化无穷！是不是顿觉周身真气澎湃、瓶颈松动了？");
         alert("你仰头痛饮下万寿蟠桃露，修为瞬间暴涨，获得了 1000 点修为经验！");
     } else if (item.type === 'heaven_scroll') {
         const pool = SKILLS_DB.filter(s => s.type === 'ultimate');
         const sk = pool[Math.floor(Math.random() * pool.length)];
         learnSkill(sk.id);
         addSilver(-item.price);
         setDialogue(`天机造化，这本《${cleanText(sk.name)}》乃本门不传之秘，望大侠好生研习！`);
         alert(`你徐徐展开金光流转的天书密卷，在神识震撼中，顿悟参透了绝学【${cleanText(sk.name)}】！`);
     }

     // 交易成功，播放交易大吉与金币洒落音效
     SoundManager.play('sfx_success');
     setTimeout(() => {
        SoundManager.play('sfx_coin');
     }, 150);
  };

  return (
    <div style={{
       position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
       background: 'rgba(0, 0, 0, 0.88)', zIndex: 9000,
       display: 'flex', justifyContent: 'center', alignItems: 'center',
       backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
       padding: '1rem'
    }}>
      {/* 嵌入局部样式 */}
      <style>{`
        .black-market-container {
          display: flex;
          flex-direction: row;
          width: 95%;
          max-width: 900px;
          height: 600px;
          background: linear-gradient(135deg, #160a0a 0%, #0a0505 100%);
          border: 2px solid #b8860b;
          border-radius: 12px;
          position: relative;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(184, 134, 11, 0.2);
          overflow: hidden;
        }
        
        .market-left-panel {
          position: relative;
          width: 42%;
          height: 100%;
          background-image: url('/black_market_merchant.png');
          background-size: cover;
          background-position: center;
          border-right: 1px solid rgba(184, 134, 11, 0.4);
        }

        .market-left-panel::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg, transparent 60%, #0a0505 98%),
                      linear-gradient(0deg, #0a0505 2%, transparent 30%);
          pointer-events: none;
        }

        .market-right-panel {
          width: 58%;
          height: 100%;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 10;
        }

        .dialogue-bubble {
          position: absolute;
          bottom: 2rem;
          left: 5%;
          right: 5%;
          background: rgba(20, 10, 10, 0.85);
          border: 1px solid #b8860b;
          border-radius: 8px;
          padding: 0.8rem 1rem;
          color: #e6c280;
          font-size: 0.9rem;
          line-height: 1.5;
          z-index: 20;
          box-shadow: 0 5px 15px rgba(0,0,0,0.5);
          animation: floatBubble 4s ease-in-out infinite;
        }

        .dialogue-bubble::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 20%;
          border-width: 10px 10px 0;
          border-style: solid;
          border-color: rgba(20, 10, 10, 0.85) transparent;
          display: block;
          width: 0;
        }

        .dialogue-bubble::before {
          content: '';
          position: absolute;
          bottom: -12px;
          left: 20%;
          border-width: 11px 11px 0;
          border-style: solid;
          border-color: #b8860b transparent;
          display: block;
          width: 0;
          z-index: -1;
        }

        .market-title-area {
          border-bottom: 1px solid rgba(184, 134, 11, 0.3);
          padding-bottom: 1rem;
          margin-bottom: 1rem;
        }

        .market-scroll-list {
          flex: 1;
          overflow-y: auto;
          padding-right: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .market-scroll-list::-webkit-scrollbar {
          width: 5px;
        }
        .market-scroll-list::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
        }
        .market-scroll-list::-webkit-scrollbar-thumb {
          background: #b8860b;
          border-radius: 4px;
        }

        .market-item-card {
          border: 1px solid rgba(184, 134, 11, 0.2);
          background: linear-gradient(90deg, rgba(30,10,10,0.9) 0%, rgba(15,5,5,0.7) 100%);
          padding: 1rem;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .market-item-card:hover {
          transform: translateY(-2px);
          border-color: rgba(184, 134, 11, 0.7);
          box-shadow: 0 4px 15px rgba(184, 134, 11, 0.25);
          background: linear-gradient(90deg, rgba(45,15,15,0.95) 0%, rgba(20,8,8,0.85) 100%);
        }

        .btn-gold-buy {
          background: linear-gradient(135deg, #b8860b 0%, #8b6508 100%);
          border: 1px solid #d4af37;
          border-radius: 6px;
          color: #110505;
          padding: 0.6rem 1.2rem;
          font-weight: bold;
          cursor: pointer;
          font-family: 'Ma Shan Zheng', cursive;
          font-size: 1rem;
          letter-spacing: 1px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 10px rgba(139, 101, 8, 0.4);
          white-space: nowrap;
        }

        .btn-gold-buy:hover {
          transform: scale(1.05);
          background: linear-gradient(135deg, #d4af37 0%, #a2760c 100%);
          box-shadow: 0 6px 15px rgba(212, 175, 55, 0.6);
        }

        .btn-gold-buy:active {
          transform: scale(0.98);
        }

        @keyframes floatBubble {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        /* 响应式设计 */
        @media screen and (max-width: 768px) {
          .black-market-container {
            flex-direction: column;
            height: 90vh;
            max-height: 700px;
          }
          .market-left-panel {
            width: 100%;
            height: 200px;
            border-right: none;
            border-bottom: 1px solid rgba(184, 134, 11, 0.4);
          }
          .market-left-panel::after {
            background: linear-gradient(0deg, #0a0505 10%, transparent 90%),
                        linear-gradient(90deg, transparent, rgba(10,5,5,0.4));
          }
          .dialogue-bubble {
            bottom: 1rem;
            font-size: 0.85rem;
            padding: 0.6rem 0.8rem;
          }
          .market-right-panel {
            width: 100%;
            height: calc(100% - 200px);
            padding: 1.2rem;
          }
        }
      `}</style>

      <div className="black-market-container">
         {/* 四角铜饰 */}
         <div className="corner-decoration top-left" style={{ borderColor: '#b8860b', zIndex: 30 }} />
         <div className="corner-decoration top-right" style={{ borderColor: '#b8860b', zIndex: 30 }} />
         <div className="corner-decoration bottom-left" style={{ borderColor: '#b8860b', zIndex: 30 }} />
         <div className="corner-decoration bottom-right" style={{ borderColor: '#b8860b', zIndex: 30 }} />

         {/* 左侧商贩立绘面板 */}
         <div className="market-left-panel">
             <div className="dialogue-bubble">
                 {dialogue}
             </div>
         </div>

         {/* 右侧交易区 */}
         <div className="market-right-panel">
             {/* 关闭按钮 */}
             <button onClick={() => { SoundManager.play('sfx_click'); onClose(); }} style={{
                 position: 'absolute', top: '15px', right: '15px',
                 background: 'rgba(20, 10, 10, 0.6)', border: '1px solid #b8860b',
                 borderRadius: '50%', color: '#b8860b', cursor: 'pointer',
                 width: '32px', height: '32px', display: 'flex',
                 alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s',
                 zIndex: 40
             }}
             onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 10px #b8860b'; e.currentTarget.style.color = '#e6c280'; }}
             onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.color = '#b8860b'; }}
             >
                 <X size={18} />
             </button>

             {/* 标题 */}
             <div className="market-title-area">
                 <h2 style={{
                     color: '#b8860b', margin: '0 0 0.4rem 0', display: 'flex',
                     alignItems: 'center', gap: '8px', fontFamily: '"Ma Shan Zheng", cursive',
                     letterSpacing: '4px', fontSize: '1.8rem'
                 }}>
                     <ShoppingBag size={24} style={{ color: '#b8860b' }} /> 幽冥黑市
                 </h2>
                 <span style={{ fontSize: '0.85rem', color: '#8c7a6b', letterSpacing: '1px', display: 'block', marginBottom: '0.8rem' }}>
                     一分钱难倒英雄汉，各取所需，概不赊账
                 </span>
                 <div style={{
                     color: '#e6c280', fontFamily: '"Ma Shan Zheng", cursive',
                     fontSize: '1.2rem', background: 'rgba(184, 134, 11, 0.1)',
                     padding: '0.4rem 0.8rem', border: '1px solid rgba(184, 134, 11, 0.2)',
                     borderRadius: '4px', display: 'inline-block'
                 }}>
                     手头存银：<span style={{ fontWeight: 'bold', fontSize: '1.4rem', color: '#fbbf24' }}>{player.silver || 0}</span> 两
                 </div>
             </div>

             {/* 列表商品 */}
             <div className="market-scroll-list">
                {shopItems.map(item => (
                    <div key={item.id} className="market-item-card">
                        <div style={{ width: '70%', paddingRight: '0.5rem' }}>
                           <h4 style={{
                               color: item.type === 'coffee' ? '#f97316' : '#f0f4f8',
                               display: 'flex', alignItems: 'center', gap: '8px',
                               fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '1px',
                               fontSize: '1.1rem', margin: 0
                           }}>
                               {item.icon} {item.name}
                           </h4>
                           <p style={{ fontSize: '0.8rem', color: '#a0a0a0', marginTop: '6px', lineHeight: '1.4' }}>
                               {item.desc}
                           </p>
                        </div>
                        <button className="btn-gold-buy" onClick={() => handleBuy(item)}>
                           {item.price} 两
                        </button>
                    </div>
                ))}
             </div>
         </div>
      </div>
    </div>
  );
}

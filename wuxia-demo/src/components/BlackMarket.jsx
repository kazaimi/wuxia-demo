import React, { useState, useEffect } from 'react';
import { useGameStore, SKILLS_DB, TREASURES_DB, ATTR_MAP } from '../store/gameState';
import { ShoppingBag, Coffee, Package, X } from 'lucide-react';

export default function BlackMarket({ onClose }) {
  const player = useGameStore(state => state.player);
  const addSilver = useGameStore(state => state.addSilver);
  const gainTreasure = useGameStore(state => state.gainTreasure);
  const learnSkill = useGameStore(state => state.learnSkill);
  const addAttributes = useGameStore(state => state.addAttributes);

  const [shopItems, setShopItems] = useState([]);

  useEffect(() => {
     // Generate random items for today
     const items = [
       { id: 'item_coffee', name: '【特供】橙C美式', price: 29, desc: '大口痛饮，洗涤所有疲劳！立即重置当天的悬赏、奇遇、秘境次数到满状态！', icon: <Coffee />, type: 'coffee' },
       { id: 'item_box1', name: '破旧的残卷箱', price: 8, desc: '随机获得一本入门外功或内功(必定非绝学)。', icon: <Package />, type: 'skill_box1' },
       { id: 'item_drug', name: '十全大补丸', price: 10, desc: '仙人秘制，随机永久增加3~5项基础属性各1~3点，立竿见影！', icon: <ShoppingBag />, type: 'attr_drug' },
       { id: 'item_box2', name: '传说的盲盒', price: 50, desc: '随机获得一件史诗或传说宝具！', icon: <Package color="var(--primary)" />, type: 'treasure_box' },
     ];
     setShopItems(items);
  }, []);

  const handleBuy = (item) => {
     if ((player.silver || 0) < item.price) {
         alert("对不起大侠，您的银两不足！黑市可不讲人情买卖。");
         return;
     }

     if (item.type === 'coffee') {
         // reset times
         const p = useGameStore.getState().player;
         p.taskCount = 0;
         p.encountersToday = 0;
         p.secretRealmAttempts = 0;
         addSilver(-item.price);
         // dirty hack to trigger store update
         useGameStore.setState({ player: { ...p } });
         // and sync socket (which addSilver does)
         alert("冰爽美式下肚，疲惫一扫而空！你今天的所有的副本次数已完全刷新！");
     } else if (item.type === 'skill_box1') {
         const pool = SKILLS_DB.filter(s => s.type !== 'ultimate' && s.type !== 'motion' && s.reqLvl <= 15);
         const sk = pool[Math.floor(Math.random()*pool.length)];
         learnSkill(sk.id);
         addSilver(-item.price);
         alert(`你打开破旧箱子，里面竟然是【${sk.name}】！`);
     } else if (item.type === 'attr_drug') {
         // 随机选 3~5 个属性，每个加 1~3 点
         const allAttrs = Object.keys(ATTR_MAP);
         const shuffled = [...allAttrs].sort(() => Math.random() - 0.5);
         const count = 3 + Math.floor(Math.random() * 3); // 3, 4, or 5
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
         alert(`你一口吞下十全大补丸，顿觉真气涌动！\n\n永久获得：\n${lines.join('\n')}`);

     } else if (item.type === 'treasure_box') {
         const pool = TREASURES_DB.filter(t => t.rarity === '史诗' || t.rarity === '传说');
         const t = pool[Math.floor(Math.random()*pool.length)];
         gainTreasure(t.id);
         addSilver(-item.price);
         alert(`光芒大作！你从盲盒中开出了绝世珍宝【${t.name}】！`);
     }
  };

  return (
    <div style={{
       position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
       background: 'rgba(0,0,0,0.85)', zIndex: 9000,
       display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div className="glass-panel" style={{
         width: '90%', maxWidth: '600px', background: '#111', 
         border: '1px solid var(--danger)', padding: '2rem', position: 'relative'
      }}>
         <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
             <X size={24} />
         </button>
         
         <h2 style={{ color: 'var(--danger)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
             深渊黑市 <span style={{fontSize:'1rem', color:'#888'}}>一分钱难倒英雄汉</span>
         </h2>
         <div style={{ marginBottom: '1.5rem', color: 'var(--warn)' }}>
             当前携带银两：{player.silver || 0} 两
         </div>
         
         <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '60vh', overflowY: 'auto' }}>
            {shopItems.map(item => (
                <div key={item.id} style={{
                    border: '1px dotted var(--glass-border)', padding: '1rem',
                    borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'linear-gradient(90deg, rgba(20,20,20,1) 0%, rgba(40,0,0,0.4) 100%)'
                }}>
                    <div style={{ width: '70%' }}>
                       <h4 style={{ color: item.type === 'coffee' ? '#f97316' : '#eee', display: 'flex', alignItems: 'center', gap: '6px' }}>
                           {item.icon} {item.name}
                       </h4>
                       <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '6px' }}>{item.desc}</p>
                    </div>
                    <button className="btn-primary" onClick={() => handleBuy(item)} style={{ background: 'var(--danger)', color: '#fff', padding: '0.6rem 1rem' }}>
                       {item.price} 银两
                    </button>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
}

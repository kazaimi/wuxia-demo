import React, { useState, useEffect } from 'react';
import { useGameStore, TREASURES_DB, ATTR_MAP, TREASURE_ATTR_MAP } from '../store/gameState';
import { X, Briefcase, Star, AlertCircle, ShoppingBag } from 'lucide-react';
import { TreasureIcon } from './WuxiaIcon';
import { SoundManager } from '../utils/SoundManager';

const cleanText = (text) => {
  if (!text) return '';
  return text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\[\]「」x（）()+\-\s]/g, '').trim();
};

const MATERIALS_INFO = {
  goldSand: {
    name: '炽阳金沙',
    element: '金元素',
    desc: '至阳至刚的五行金元素结晶。产自协助铁匠铺锤炼的体质与力量悬赏任务，或在世界大厅讨伐魔罗时偶得。是太上神炉洗炼器灵属性【额外攻击】的核心消耗材料。',
    icon: '/elem_gold.png',
    rarity: '稀有'
  },
  woodHerb: {
    name: '枯木灵芝',
    element: '木元素',
    desc: '充满勃勃生机的五行木元素仙草。产自险峰采集野生灵芝的体质悬赏任务。是太上神炉洗炼器灵属性【额外防御】的核心消耗材料。',
    icon: '/elem_wood.png',
    rarity: '稀有'
  },
  waterFluid: {
    name: '无根净水',
    element: '水元素',
    desc: '极阴极寒的五行水元素之液。产自踏雪无痕凌空送信的轻功悬赏任务。是太上神炉洗炼器灵属性【额外闪避】的核心消耗材料。',
    icon: '/elem_water.png',
    rarity: '稀有'
  },
  fireMarrow: {
    name: '赤炎地髓',
    element: '火元素',
    desc: '炽热狂暴的五行火元素地髓。产自烈火静室参禅参悟的智慧悬赏任务。是太上神炉洗炼器灵属性【额外气血】的核心消耗材料。',
    icon: '/elem_fire.png',
    rarity: '稀有'
  },
  earthEssence: {
    name: '玄黄土精',
    element: '土元素',
    desc: '厚重稳固的五行土元素精华。产自解签布施积德行善的幸运悬赏任务。是太上神炉洗炼器灵属性【额外暴击】的核心消耗材料。',
    icon: '/elem_earth.png',
    rarity: '稀有'
  },
  anomalyDust: {
    name: '异变之尘',
    element: '熔炼材料',
    desc: '弥漫着异变气息的奇异碎屑。产自日常任务或大劫世界 Boss 的挑战奖励。是乾坤炉中进行【炼火重铸】时必须消耗的催化材料。',
    emoji: '✨',
    rarity: '普通'
  },
  soulAshes: {
    name: '怨魂余烬',
    element: '洗炼材料',
    desc: '残留着怨魂微弱执念的余烬。可通过在太尊秘境中击败其他同道留下的怨灵神魂获得。是乾坤炉中进行【器灵洗炼】时用作灵魂洗涤的催化材料。',
    emoji: '🌫️',
    rarity: '稀有'
  },
  anomalyCrystal: {
    name: '异变玄晶',
    element: '至宝材料',
    desc: '由纯净的虚空异变之力凝聚而成的水晶。极为珍罕，可通过在大劫世界 Boss 的高额排名中获取。是乾坤炉高阶【器灵洗炼】时不可或缺的核心介质。',
    emoji: '💎',
    rarity: '史诗'
  }
};

const MATERIAL_COLORS = {
  goldSand: '#fbbf24',       // 金
  woodHerb: '#10b981',       // 木
  waterFluid: '#3b82f6',      // 水
  fireMarrow: '#ef4444',      // 火
  earthEssence: '#f97316',    // 土
  anomalyDust: '#9ca3af',     // 熔炼 - 灰
  soulAshes: '#06b6d4',       // 洗炼 - 青/靛青
  anomalyCrystal: '#a855f7'   // 至宝 - 史诗紫
};

const MATERIAL_BGS = {
  goldSand: 'rgba(251, 191, 36, 0.12)',
  woodHerb: 'rgba(16, 185, 129, 0.12)',
  waterFluid: 'rgba(59, 130, 246, 0.12)',
  fireMarrow: 'rgba(239, 68, 68, 0.12)',
  earthEssence: 'rgba(249, 115, 22, 0.12)',
  anomalyDust: 'rgba(156, 163, 175, 0.12)',
  soulAshes: 'rgba(6, 182, 212, 0.12)',
  anomalyCrystal: 'rgba(168, 85, 247, 0.12)'
};

export default function WuxiaBackpack({ onClose }) {
  const player = useGameStore(state => state.player);
  const equipTreasure = useGameStore(state => state.equipTreasure);
  const treasures = player?.treasures || [];
  const equippedTreasure = player?.equippedTreasure || null;

  // 选项卡状态
  const [activeTab, setActiveTab] = useState('treasures'); // treasures 或 materials
  const [selectedMaterialKey, setSelectedMaterialKey] = useState('goldSand');

  // 背包数据堆叠统计
  const inventory = treasures.reduce((acc, tId) => {
     acc[tId] = (acc[tId] || 0) + 1;
     return acc;
  }, {});

  // 选中的宝具ID，默认选中已装备的，或背包第一个
  const [selectedId, setSelectedId] = useState(() => {
    const list = Object.keys(inventory);
    return equippedTreasure || (list.length > 0 ? list[0] : null);
  });

  // 确保选中ID的有效性
  useEffect(() => {
    const list = Object.keys(inventory);
    if (selectedId && !list.includes(selectedId)) {
      setSelectedId(equippedTreasure || (list.length > 0 ? list[0] : null));
    } else if (!selectedId && (equippedTreasure || list.length > 0)) {
      setSelectedId(equippedTreasure || list[0]);
    }
  }, [treasures, equippedTreasure, selectedId]);

  const handleSelect = (tId) => {
    SoundManager.play('sfx_click');
    setSelectedId(tId);
  };

  const handleEquip = () => {
    SoundManager.play('sfx_click');
    if (selectedId === equippedTreasure) {
      equipTreasure(null);
    } else {
      equipTreasure(selectedId);
    }
  };

  const selectedTreasure = TREASURES_DB?.find(tr => tr.id === selectedId);

  const rarityColors = { '神话': '#fbbf24', '传说': '#a855f7', '史诗': '#ec4899', '稀有': '#3b82f6', '普通': '#9ca3af' };
  const rarityBgs = {
    '神话': 'rgba(251, 191, 36, 0.12)',
    '传说': 'rgba(168, 85, 247, 0.12)',
    '史诗': 'rgba(236, 72, 153, 0.12)',
    '稀有': 'rgba(59, 130, 246, 0.12)',
    '普通': 'rgba(156, 163, 175, 0.12)'
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 5, 10, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeIn 0.25s ease-out'
    }}>
      <div className="glass-panel backpack-modal" style={{
        width: '90%',
        maxWidth: '850px',
        height: '75vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.96), rgba(10, 10, 15, 0.98))',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        boxShadow: '0 0 30px rgba(0, 0, 0, 0.8), 0 0 15px rgba(212, 175, 55, 0.1)',
        borderRadius: '12px',
        overflow: 'hidden',
        animation: 'scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        {/* 顶部标题栏 */}
        <div style={{
          padding: '1.2rem 1.5rem',
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(212, 175, 55, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Briefcase size={24} style={{ color: 'var(--gold)', filter: 'drop-shadow(0 0 4px rgba(212, 175, 55, 0.5))' }} />
            <h3 style={{
              fontSize: '1.4rem',
              color: 'var(--gold)',
              fontFamily: '"Ma Shan Zheng", cursive',
              letterSpacing: '3px',
              margin: 0
            }}>
              芥子储物袋 (本命宝物)
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <X size={24} />
          </button>
        </div>

        <div className="wuxia-backpack-grid" style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: (activeTab === 'materials' || Object.keys(inventory).length > 0) ? '1.2fr 1fr' : '1fr',
          gap: '1.5rem',
          padding: '1.5rem',
          overflow: 'hidden',
          background: 'rgba(5, 5, 8, 0.3)'
        }}>
          {/* 左侧网格：储物背包 / 材料背包 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            overflow: 'hidden'
          }}>
            {/* 选项卡切换 */}
            <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
              <button
                onClick={() => { SoundManager.play('sfx_click'); setActiveTab('treasures'); }}
                style={{
                  background: activeTab === 'treasures' ? 'rgba(212, 175, 55, 0.12)' : 'rgba(255,255,255,0.02)',
                  border: activeTab === 'treasures' ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.08)',
                  color: activeTab === 'treasures' ? 'var(--gold)' : 'var(--text-muted)',
                  padding: '5px 14px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🔮 本命宝物
              </button>
              <button
                onClick={() => { SoundManager.play('sfx_click'); setActiveTab('materials'); }}
                style={{
                  background: activeTab === 'materials' ? 'rgba(212, 175, 55, 0.12)' : 'rgba(255,255,255,0.02)',
                  border: activeTab === 'materials' ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.08)',
                  color: activeTab === 'materials' ? 'var(--gold)' : 'var(--text-muted)',
                  padding: '5px 14px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🌿 天材地宝 (五行/炼材)
              </button>
            </div>

            {activeTab === 'treasures' ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', padding: '2px 4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>🎒 包囊物品</span>
                  <span style={{ color: 'var(--gold)', fontFamily: 'Outfit' }}>已容纳数: {treasures.length} / 50</span>
                </div>

                {Object.keys(inventory).length === 0 ? (
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'var(--text-muted)',
                    border: '1px dashed var(--glass-border)',
                    borderRadius: '8px',
                    padding: '2rem',
                    gap: '10px'
                  }}>
                    <ShoppingBag size={48} style={{ opacity: 0.3 }} />
                    <span>空空如也，快去奇遇闯关或秘境中寻宝吧！</span>
                  </div>
                ) : (
                  <div 
                    className="wuxia-scrollbar"
                    style={{
                      flex: 1,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))',
                      gridAutoRows: '76px',
                      gap: '10px',
                      background: 'rgba(0, 0, 0, 0.35)',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--glass-border)',
                      overflowY: 'auto',
                      alignContent: 'start'
                    }}
                  >
                    {Object.entries(inventory).map(([tId, count]) => {
                      const t = TREASURES_DB?.find(tr => tr.id === tId);
                      if (!t) return null;
                      const isSelected = selectedId === tId;
                      const isEquipped = equippedTreasure === tId;
                      
                      return (
                        <div
                          key={tId}
                          onClick={() => handleSelect(tId)}
                          style={{
                            position: 'relative',
                            background: rarityBgs[t.rarity] || 'rgba(255, 255, 255, 0.05)',
                            border: isSelected 
                              ? '2px solid var(--gold)' 
                              : (isEquipped ? '1px dashed var(--gold)' : `1px solid ${rarityColors[t.rarity]}30`),
                            boxShadow: isSelected ? '0 0 12px rgba(212, 175, 55, 0.35)' : 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            transform: isSelected ? 'scale(1.04)' : 'none',
                            overflow: 'hidden'
                          }}
                          onMouseEnter={e => {
                            if (!isSelected) e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                          }}
                          onMouseLeave={e => {
                            if (!isSelected) e.currentTarget.style.borderColor = isEquipped ? 'var(--gold)' : `${rarityColors[t.rarity]}30`;
                          }}
                        >
                          <TreasureIcon id={tId} size={48} />

                          {isEquipped && (
                            <div style={{
                              position: 'absolute',
                              top: '2px',
                              left: '4px',
                              fontSize: '0.8rem',
                              textShadow: '0 0 3px #000',
                              animation: 'pulseGlow 2s infinite ease-in-out'
                            }}>
                              ⭐
                            </div>
                          )}

                          {count > 1 && (
                            <span style={{
                              position: 'absolute',
                              bottom: '3px',
                              right: '4px',
                              background: 'rgba(0, 0, 0, 0.75)',
                              color: '#fff',
                              fontSize: '0.7rem',
                              padding: '1px 4px',
                              borderRadius: '4px',
                              lineHeight: '1',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              fontWeight: 'bold'
                            }}>
                              {count}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', padding: '2px 4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>🎒 天材地宝背包</span>
                  <span style={{ color: 'var(--gold)', fontFamily: 'Outfit' }}>五行精气 / 炼器材料</span>
                </div>

                <div 
                  className="wuxia-scrollbar"
                  style={{
                    flex: 1,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))',
                    gridAutoRows: '76px',
                    gap: '10px',
                    background: 'rgba(0, 0, 0, 0.35)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    overflowY: 'auto',
                    alignContent: 'start'
                  }}
                >
                  {Object.entries(MATERIALS_INFO).map(([mKey, info]) => {
                    const count = player.inventoryMaterials?.[mKey] || 0;
                    const isSelected = selectedMaterialKey === mKey;
                    
                    const mColor = MATERIAL_COLORS[mKey] || '#9ca3af';
                    const mBg = MATERIAL_BGS[mKey] || 'rgba(255, 255, 255, 0.05)';

                    return (
                      <div
                        key={mKey}
                        onClick={() => { SoundManager.play('sfx_click'); setSelectedMaterialKey(mKey); }}
                        style={{
                          position: 'relative',
                          background: mBg,
                          border: isSelected 
                            ? `2px solid ${mColor}` 
                            : `1px solid ${mColor}30`,
                          boxShadow: isSelected ? `0 0 12px ${mColor}55` : 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                          transform: isSelected ? 'scale(1.04)' : 'none',
                          overflow: 'hidden'
                        }}
                        onMouseEnter={e => {
                          if (!isSelected) e.currentTarget.style.borderColor = `${mColor}88`;
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) e.currentTarget.style.borderColor = `${mColor}30`;
                        }}
                      >
                        {info.icon ? (
                          <img src={info.icon} alt={info.name} style={{ width: '40px', height: '40px', objectFit: 'contain', mixBlendMode: 'screen' }} />
                        ) : (
                          <span style={{ fontSize: '1.8rem' }}>{info.emoji}</span>
                        )}

                        <span style={{
                          position: 'absolute',
                          bottom: '3px',
                          right: '4px',
                          background: 'rgba(0, 0, 0, 0.75)',
                          color: '#fff',
                          fontSize: '0.7rem',
                          padding: '1px 4px',
                          borderRadius: '4px',
                          lineHeight: '1',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          fontWeight: 'bold'
                        }}>
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* 右侧面板：详情 */}
          {activeTab === 'treasures' ? (
            selectedTreasure && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                overflow: 'hidden'
              }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '2px 0' }}>⚡ 灵物详解</span>
                
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  background: 'linear-gradient(180deg, rgba(22, 22, 33, 0.85), rgba(12, 12, 18, 0.96))',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  boxShadow: 'inset 0 0 15px rgba(212, 175, 55, 0.05), 0 4px 20px rgba(0,0,0,0.6)',
                  overflowY: 'auto'
                }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.3)',
                      border: `1px solid ${rarityColors[selectedTreasure.rarity]}33`,
                      boxShadow: `0 0 10px ${rarityColors[selectedTreasure.rarity]}11`
                    }}>
                      <TreasureIcon id={selectedTreasure.id} size={64} />
                    </div>
                    
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <h4 style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: rarityColors[selectedTreasure.rarity] || '#fff',
                        fontFamily: '"Ma Shan Zheng", cursive',
                        letterSpacing: '1.5px',
                        margin: 0
                      }}>
                        {cleanText(selectedTreasure.name)}
                      </h4>
                      
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          color: rarityColors[selectedTreasure.rarity],
                          background: `${rarityColors[selectedTreasure.rarity]}15`,
                          border: `1px solid ${rarityColors[selectedTreasure.rarity]}33`,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: '500'
                        }}>
                          {selectedTreasure.rarity} · {selectedTreasure.rarity === '神话' ? '镇派' : selectedTreasure.rarity === '传说' ? '传世' : '绝品'}
                        </span>
                        
                        {equippedTreasure === selectedId && (
                          <span style={{
                            fontSize: '0.75rem',
                            color: 'var(--gold)',
                            background: 'rgba(212, 175, 55, 0.1)',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 'bold'
                          }}>
                            本命绑定中
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 属性加成 */}
                  {selectedTreasure.attrs && (
                    <div style={{
                      background: 'rgba(0,0,0,0.2)',
                      padding: '12px 14px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.03)'
                    }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 'bold' }}>❖ 属性加持</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {Object.entries(selectedTreasure.attrs).map(([k, v]) => (
                          <div key={k} style={{
                            fontSize: '0.85rem',
                            color: 'var(--gold)',
                            fontFamily: 'Outfit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <span>{TREASURE_ATTR_MAP[k] || k}</span>
                            <span style={{ fontWeight: 'bold' }}>+{v}{['dodge', 'crit'].includes(k) ? '%' : ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 器灵洗炼附加词条 */}
                  {player.equippedTreasureAttrs && 
                    Object.values(player.equippedTreasureAttrs).some(v => v > 0) && (
                      <div style={{
                        background: selectedId === equippedTreasure ? 'rgba(6, 182, 212, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                        padding: '12px 14px',
                        borderRadius: '6px',
                        border: selectedId === equippedTreasure ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid rgba(255, 255, 255, 0.08)',
                        opacity: selectedId === equippedTreasure ? 1 : 0.7
                      }}>
                        <div style={{ 
                          fontSize: '0.8rem', 
                          color: selectedId === equippedTreasure ? '#06b6d4' : 'var(--text-muted)', 
                          marginBottom: '8px', 
                          fontWeight: 'bold',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <span>❖ 器灵注灵属性 (已洗词条)</span>
                          <span style={{ fontSize: '0.7rem', color: selectedId === equippedTreasure ? '#10b981' : '#f59e0b' }}>
                            {selectedId === equippedTreasure ? '● 已生效' : '○ 装备后生效'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                          {Object.entries(player.equippedTreasureAttrs).map(([k, v]) => {
                            if (!v || v <= 0) return null;
                            const attrNames = {
                              extraAtk: '额外攻击',
                              extraDef: '额外防御',
                              extraHp: '额外气血',
                              extraDodge: '额外闪避',
                              extraCrit: '额外暴击',
                              stunRate: '击晕概率',
                              poisonRate: '中毒概率',
                              bossDamageBoost: '破魔加成'
                            };
                            const isPercent = ['extraDodge', 'extraCrit', 'stunRate', 'poisonRate', 'bossDamageBoost'].includes(k);
                            return (
                              <div key={k} style={{
                                fontSize: '0.85rem',
                                color: selectedId === equippedTreasure ? '#06b6d4' : 'var(--text-muted)',
                                fontFamily: 'Outfit',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                <span>{attrNames[k] || k}</span>
                                <span style={{ fontWeight: 'bold' }}>+{v}{isPercent ? '%' : ''}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {/* 宝物特效描述 */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>⚡ 器灵特技</span>
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: '0.85rem',
                      color: '#ccc',
                      lineHeight: '1.5',
                      background: 'rgba(255, 255, 255, 0.01)',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.03)'
                    }}>
                      {cleanText(selectedTreasure.desc)}
                    </p>
                  </div>

                  {/* 操作栏 */}
                  <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                    {equippedTreasure === selectedId ? (
                      <button
                        className="btn-primary"
                        onClick={handleEquip}
                        style={{
                          width: '100%',
                          padding: '10px',
                          fontSize: '0.9rem',
                          background: 'var(--warn)',
                          color: '#000',
                          fontWeight: 'bold',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '6px'
                        }}
                      >
                        解除本命羁绊 (卸下宝具)
                      </button>
                    ) : (
                      <button
                        className="btn-primary"
                        onClick={handleEquip}
                        style={{
                          width: '100%',
                          padding: '10px',
                          fontSize: '0.9rem',
                          background: 'var(--gold)',
                          color: '#000',
                          fontWeight: 'bold',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '6px',
                          boxShadow: '0 0 10px rgba(212, 175, 55, 0.2)'
                        }}
                      >
                        确立本命羁绊 (装备宝具)
                      </button>
                    )}
                  </div>

                  {/* 拍卖提醒 */}
                  {inventory[selectedId] > 1 && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#10b981',
                      display: 'flex',
                      gap: '6px',
                      alignItems: 'start',
                      background: 'rgba(16, 185, 129, 0.08)',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid rgba(16, 185, 129, 0.15)'
                    }}>
                      <AlertCircle size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>阁下已有多件此宝，可在【拍卖风云】行上架，以赚取散碎银两。</span>
                    </div>
                  )}
                </div>
              </div>
            )
          ) : (
            selectedMaterialKey && (() => {
              const info = MATERIALS_INFO[selectedMaterialKey];
              const count = player.inventoryMaterials?.[selectedMaterialKey] || 0;
              const mColor = MATERIAL_COLORS[selectedMaterialKey] || '#9ca3af';

              return (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px',
                  overflow: 'hidden'
                }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '2px 0' }}>🌿 天材地宝详解</span>
                  
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    background: 'linear-gradient(180deg, rgba(22, 22, 33, 0.85), rgba(12, 12, 18, 0.96))',
                    border: `1px solid ${mColor}55`,
                    boxShadow: `inset 0 0 15px ${mColor}11, 0 4px 20px rgba(0,0,0,0.6)`,
                    overflowY: 'auto'
                  }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '8px',
                        background: 'rgba(0,0,0,0.3)',
                        border: `1px solid ${mColor}33`,
                        boxShadow: `0 0 10px ${mColor}11`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {info.icon ? (
                          <img src={info.icon} alt={info.name} style={{ width: '48px', height: '48px', objectFit: 'contain', mixBlendMode: 'screen' }} />
                        ) : (
                          <span style={{ fontSize: '2rem' }}>{info.emoji}</span>
                        )}
                      </div>
                      
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <h4 style={{
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          color: mColor,
                          fontFamily: '"Ma Shan Zheng", cursive',
                          letterSpacing: '1.5px',
                          margin: 0
                        }}>
                          {info.name}
                        </h4>
                        
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            color: mColor,
                            background: `${mColor}15`,
                            border: `1px solid ${mColor}33`,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: '500'
                          }}>
                            {info.rarity} · {info.element}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 拥有数量 */}
                    <div style={{
                      background: 'rgba(0,0,0,0.2)',
                      padding: '12px 14px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.03)'
                    }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 'bold' }}>❖ 储物箱存量</div>
                      <div style={{ fontSize: '1.2rem', color: 'var(--gold)', fontFamily: 'Outfit', fontWeight: 'bold' }}>
                        {count} <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 'normal' }}>个</span>
                      </div>
                    </div>

                    {/* 物品描述 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 'bold' }}>❖ 灵物描述</div>
                      <p style={{
                        margin: 0,
                        fontSize: '0.85rem',
                        color: '#ccc',
                        lineHeight: '1.6',
                        background: 'rgba(255, 255, 255, 0.01)',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.03)'
                      }}>
                        {info.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

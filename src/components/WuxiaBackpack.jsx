import React, { useState, useEffect } from 'react';
import { useGameStore, TREASURES_DB, ATTR_MAP } from '../store/gameState';
import { X, Briefcase, Star, AlertCircle, ShoppingBag } from 'lucide-react';
import { TreasureIcon } from './WuxiaIcon';
import { SoundManager } from '../utils/SoundManager';

const cleanText = (text) => {
  if (!text) return '';
  return text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\[\]「」x（）()+\-\s]/g, '').trim();
};

export default function WuxiaBackpack({ onClose }) {
  const player = useGameStore(state => state.player);
  const equipTreasure = useGameStore(state => state.equipTreasure);
  const treasures = player?.treasures || [];
  const equippedTreasure = player?.equippedTreasure || null;

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
      <div className="glass-panel" style={{
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

        {/* 主内容区域 */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: Object.keys(inventory).length > 0 ? '1.2fr 1fr' : '1fr',
          gap: '1.5rem',
          padding: '1.5rem',
          overflow: 'hidden',
          background: 'rgba(5, 5, 8, 0.3)'
        }}>
          {/* 左侧网格：储物背包 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            overflow: 'hidden'
          }}>
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
          </div>

          {/* 右侧面板：宝物详情 */}
          {selectedTreasure && (
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
                          <span>{ATTR_MAP[k] || k}</span>
                          <span style={{ fontWeight: 'bold' }}>+{v}</span>
                        </div>
                      ))}
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

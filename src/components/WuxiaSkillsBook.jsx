import React, { useState } from 'react';
import { useGameStore, SKILLS_DB, getSkillMastery } from '../store/gameState';
import { X, BookOpen, Swords, Shield, Activity, Sparkles } from 'lucide-react';
import { SoundManager } from '../utils/SoundManager';

export default function WuxiaSkillsBook({ onClose, initialFilter = 'all' }) {
  const player = useGameStore(state => state.player);
  const equipSkill = useGameStore(state => state.equipSkill);
  const [activeFilter, setActiveFilter] = useState(initialFilter); // all, inner, outer, motion, ultimate

  // 获取玩家属性（包含洗炼词条）以检测功法条件是否达标
  const attrs = player?.equippedTreasureAttrs || {};
  const playerStats = {
    level: player?.level || 1,
    str: (player?.attributes?.str || 0) + (attrs.extraStr || 0),
    con: (player?.attributes?.con || 0) + (attrs.extraCon || 0),
    agi: (player?.attributes?.agi || 0) + (attrs.extraAgi || 0),
    int: (player?.attributes?.int || 0) + (attrs.extraInt || 0),
    luk: (player?.attributes?.luk || 0) + (attrs.extraLuk || 0),
  };

  const filters = [
    { id: 'all', label: '全部功法' },
    { id: 'outer', label: '外功招式' },
    { id: 'inner', label: '内功心法' },
    { id: 'motion', label: '身法轻功' },
    { id: 'ultimate', label: '旷世绝学' },
  ];

  const filteredSkills = SKILLS_DB.filter(skill => {
    if (activeFilter === 'all') return true;
    return skill.type === activeFilter;
  });

  const getSkillTypeBadge = (type) => {
    switch (type) {
      case 'outer':
        return { label: '外功', color: '#ff4d4d', bg: 'rgba(255, 77, 77, 0.15)', icon: <Swords size={14} /> };
      case 'inner':
        return { label: '内功', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: <Shield size={14} /> };
      case 'motion':
        return { label: '轻功', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)', icon: <Activity size={14} /> };
      case 'ultimate':
        return { label: '绝学', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: <Sparkles size={14} /> };
      default:
        return { label: '未知', color: '#ccc', bg: 'rgba(255,255,255,0.1)', icon: null };
    }
  };

  // 检查技能学习门槛是否达成
  const checkRequirement = (skill) => {
    const unmet = [];
    if (playerStats.level < skill.reqLvl) unmet.push(`等级 ${skill.reqLvl}`);
    if (skill.reqStr && playerStats.str < skill.reqStr) unmet.push(`力量 ${skill.reqStr}`);
    if (skill.reqInt && playerStats.int < skill.reqInt) unmet.push(`智慧 ${skill.reqInt}`);
    if (skill.reqAgi && playerStats.agi < skill.reqAgi) unmet.push(`敏捷 ${skill.reqAgi}`);
    if (skill.reqCon && playerStats.con < skill.reqCon) unmet.push(`体质 ${skill.reqCon}`);
    if (skill.reqLuk && playerStats.luk < skill.reqLuk) unmet.push(`幸运 ${skill.reqLuk}`);
    return {
      passed: unmet.length === 0,
      text: unmet.length === 0 ? '达标' : `差 ${unmet.join(', ')}`,
    };
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
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, rgba(20, 20, 30, 0.95), rgba(10, 10, 15, 0.98))',
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
            <BookOpen size={24} style={{ color: 'var(--gold)', filter: 'drop-shadow(0 0 4px rgba(212, 175, 55, 0.5))' }} />
            <h3 style={{
              fontSize: '1.4rem',
              color: 'var(--gold)',
              fontFamily: '"Ma Shan Zheng", cursive',
              letterSpacing: '3px',
              margin: 0
            }}>
              江湖武学宝典 (秘籍图鉴)
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

        {/* 筛选过滤 Tab */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '1rem 1.5rem',
          background: 'rgba(0,0,0,0.2)',
          overflowX: 'auto',
          borderBottom: '1px solid var(--glass-border)'
        }}>
          {filters.map(filter => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className="btn-primary"
                style={{
                  padding: '0.4rem 1.2rem',
                  fontSize: '0.85rem',
                  background: isActive ? 'var(--gold)' : 'transparent',
                  color: isActive ? '#000' : 'var(--gold)',
                  border: '1px solid var(--gold)',
                  boxShadow: isActive ? '0 0 12px rgba(212, 175, 55, 0.4)' : 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* 功法内容网格区 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1rem',
          background: 'rgba(5, 5, 8, 0.3)'
        }}>
          {filteredSkills.map(skill => {
            const badge = getSkillTypeBadge(skill.type);
            const req = checkRequirement(skill);
            const isOwned = player?.skills?.includes(skill.id);

            return (
              <div
                key={skill.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: isOwned ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  padding: '1.2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  boxShadow: isOwned ? 'inset 0 0 10px rgba(212, 175, 55, 0.05)' : 'none',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.45)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  e.currentTarget.style.borderColor = isOwned ? 'rgba(212, 175, 55, 0.3)' : 'var(--glass-border)';
                }}
              >
                {/* 已掌握标志 */}
                {isOwned && (
                  <div style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '8px',
                    background: 'var(--gold)',
                    color: '#000',
                    fontSize: '0.65rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    boxShadow: '0 0 6px rgba(212, 175, 55, 0.4)',
                    letterSpacing: '1px'
                  }}>
                    已参悟
                  </div>
                )}

                {/* 功法名称与类型 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: skill.type === 'ultimate' ? 'var(--gold)' : '#fff',
                    fontFamily: '"Ma Shan Zheng", cursive',
                    letterSpacing: '1px'
                  }}>
                    {skill.name}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: badge.color,
                    background: badge.bg,
                    border: `1px solid ${badge.color}33`,
                    fontWeight: '500'
                  }}>
                    {badge.icon} {badge.label}
                  </span>
                </div>

                {/* 威力展示（如果是攻击招式） */}
                {skill.power > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>招式威力</span>
                      <span style={{ color: 'var(--gold)', fontFamily: 'Outfit' }}>{skill.power}</span>
                    </div>
                    {/* 威力进度条 */}
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(100, (skill.power / 200) * 100)}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${badge.color}88, ${badge.color})`,
                        boxShadow: `0 0 6px ${badge.color}`
                      }} />
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    🛡️ 辅助御敌 / 身法功法 (无直接伤害)
                  </div>
                )}

                {/* 前置条件检测 */}
                <div style={{
                  padding: '6px 8px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>研习门槛</span>
                  <span style={{
                    color: req.passed ? 'var(--jade)' : 'var(--crimson)',
                    fontWeight: 'bold'
                  }}>
                    {req.passed ? '符合条件' : req.text}
                  </span>
                </div>

                {/* 详细特效描述 */}
                <p style={{
                  margin: '4px 0 0 0',
                  fontSize: '0.8rem',
                  color: '#ccc',
                  lineHeight: '1.4',
                  background: 'rgba(255, 255, 255, 0.01)',
                  padding: '6px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.03)'
                }}>
                  {skill.desc}
                </p>

                {/* 熟练度与研习状态 / 操作 */}
                <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {isOwned ? (
                    (() => {
                      const isEquipped = player?.equippedSkills?.[skill.type] === skill.id;
                      const masteryInfo = getSkillMastery(skill.id, player?.skillMastery);
                      
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                          {/* 熟练度信息 */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            <span>参悟境界: <span style={{ color: badge.color }}>{masteryInfo?.label || '初学乍练'}</span></span>
                            <span>{masteryInfo?.wins || 0} 胜</span>
                          </div>
                          
                          {/* 装备/卸下按钮 */}
                          <button
                            onClick={() => {
                              SoundManager.play('sfx_click');
                              if (isEquipped) {
                                equipSkill(skill.type, null);
                              } else {
                                equipSkill(skill.type, skill.id);
                              }
                            }}
                            className="btn-primary"
                            style={{
                              width: '100%',
                              padding: '4px 8px',
                              fontSize: '0.75rem',
                              background: isEquipped ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                              color: isEquipped ? '#ff4d4d' : '#10b981',
                              border: isEquipped ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
                              fontWeight: 'bold',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            {isEquipped ? '卸下此招' : '装配上阵'}
                          </button>
                        </div>
                      );
                    })()
                  ) : (
                    <div style={{
                      width: '100%',
                      textAlign: 'center',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      border: '1px dashed rgba(255,255,255,0.06)',
                      padding: '4px 0',
                      borderRadius: '4px'
                    }}>
                      未掌握 (奇遇或任务获取)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 底部属性简要提示栏 */}
        <div style={{
          padding: '0.8rem 1.5rem',
          borderTop: '1px solid rgba(212, 175, 55, 0.15)',
          background: 'rgba(212, 175, 55, 0.02)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div>
            提示: 通过完成日常悬赏或在黑市兑换可获取稀有武学残卷。
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span>💪 力: {playerStats.str}</span>
            <span>🪵 体: {playerStats.con}</span>
            <span>💧 敏: {playerStats.agi}</span>
            <span>🔥 智: {playerStats.int}</span>
            <span>🌍 运: {playerStats.luk}</span>
          </div>
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

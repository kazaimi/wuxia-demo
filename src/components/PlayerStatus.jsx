import React, { useEffect, useRef, useState } from 'react';
import { useGameStore, SKILLS_DB, TREASURES_DB, getSkillMastery, getSkillInfo, MASTERY_TIERS, ATTR_MAP } from '../store/gameState';
import { User, Star, AlertCircle, BookOpen } from 'lucide-react';
import AttributeRadar from './AttributeRadar';
import { GongfaIcon, TreasureIcon, WuxiaIconStyles } from './WuxiaIcon';
import { SoundManager } from '../utils/SoundManager';
import WuxiaSkillsBook from './WuxiaSkillsBook';
import WuxiaBackpack from './WuxiaBackpack';

const cleanText = (text) => {
  if (!text) return '';
  return text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\[\]「」x（）()+\-\s]/g, '').trim();
};

export default function PlayerStatus({ onOpenSkills, onOpenBackpack }) {
  const player = useGameStore(state => state.player);
  const setAttribute = useGameStore(state => state.setAttribute);
  const inBattle = useGameStore(state => state.battleState.inBattle);
  const { name, title, level, exp, maxExp, freePoints, attributes, permanentAttributes, hp, maxHp, equippedSkills, equippedTreasure } = player;

  // 监听玩家等级境界变化，播放突破音效
  const prevLevel = useRef(level);
  useEffect(() => {
    if (level > prevLevel.current) {
      SoundManager.play('sfx_levelup');
    }
    prevLevel.current = level;
  }, [level]);

  const bgStyle = {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    position: 'relative'
  };

  return (
    <div style={bgStyle} className="glass-panel">
      <WuxiaIconStyles />
      <style>{`
        .wuxia-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .wuxia-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.15);
          border-radius: 2px;
        }
        .wuxia-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.35);
          border-radius: 2px;
        }
        .wuxia-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.65);
        }
      `}</style>
      {/* 顶部金线装饰 */}
      <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', opacity: 0.5 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold)', fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif', letterSpacing: '2px' }}>
            <User size={24} /> {name}
          </h3>
          {title && <span className="wuxia-tag" style={{ marginTop: '6px', fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif' }}>{cleanText(title)}</span>}
        </div>
        <div style={{ fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
             <Star size={18} color="var(--gold)" /> <span style={{ color: 'var(--gold)', fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif' }}>Lv.{level}</span>
          </div>
          <span className="glow-effect" style={{ fontSize: '0.8rem', color: freePoints > 0 ? 'var(--danger)' : 'var(--text-muted)', background: freePoints > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)', padding:'2px 4px', borderRadius: '4px', fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif' }}>
            {freePoints > 0 ? `可用潜能: ${freePoints}` : freePoints < 0 ? `超支: ${-freePoints}` : '潜能已分配完毕'}
          </span>
        </div>
      </div>


      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--text-muted)' }}>
          <span>❖ 状态生命</span>
          <span>{hp} / {maxHp}</span>
        </div>
        <div className="wuxia-progress" style={{ marginBottom: '0.5rem' }}>
          <div className="wuxia-progress-bar hp-bar" style={{ width: `${(hp / maxHp) * 100}%` }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--text-muted)' }}>
          <span>❖ 修为阅历</span>
          <span>{Math.floor(exp)} / {maxExp}</span>
        </div>
        <div className="wuxia-progress">
          <div className="wuxia-progress-bar exp-bar" style={{ width: `${Math.min(100, (exp / maxExp) * 100)}%` }} />
        </div>
      </div>

      {/* 属性雷达图 */}
      <div style={{ marginTop: '0.5rem' }}>
        <AttributeRadar
          attributes={attributes}
          permanentAttributes={permanentAttributes}
          freePoints={freePoints}
          inBattle={inBattle}
          onSetAttribute={setAttribute}
        />
      </div>
      
      {inBattle && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid var(--danger)',
          padding: '0.5rem',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: 'var(--danger)',
          textAlign: 'center'
        }}>
          激战中，属性点已锁定
        </div>
      )}

      {player.dailyDebuffs && player.dailyDebuffs.length > 0 && (
         <div style={{ marginTop: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', padding: '0.8rem', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '1rem', color: 'var(--danger)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <AlertCircle size={16} /> 恶兆缠身 <span style={{fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-muted)'}}>(今日拂晓消散)</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
               {player.dailyDebuffs.map((db, i) => {
                  let desc = "";
                  if (db === '血枯劫') desc = "最大气血上限被强行压制衰减 20%";
                  else if (db === '散功劫') desc = "力量与体质的基础属性各自衰减 5 点，破防抗压剧烈下降";
                  else if (db === '心魔劫') desc = "心神失守走火入魔，任何战斗中每回合遭遇 15% 几率强制空过";
                  return (
                     <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: 'var(--warn)', fontWeight: 'bold' }}>【{db}】</span>
                        <span style={{ color: 'var(--text-muted)' }}>- {desc}</span>
                     </div>
                  );
               })}
            </div>
         </div>
      )}

      <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h4 style={{ fontSize: '1rem', color: 'var(--gold)', fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '2px', margin: 0, borderBottom: '1px solid rgba(212, 175, 55, 0.15)', paddingBottom: '0.4rem' }}>
          装配就绪
        </h4>

        {/* 功法与本命装配概要列表 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {['inner', 'outer', 'motion', 'ultimate'].map(type => {
            const typeName = type === 'inner' ? '内功' : type === 'outer' ? '外功' : type === 'motion' ? '轻功' : '绝学';
            const gongfaClass = type === 'inner' ? 'gongfa-neigong' : type === 'outer' ? 'gongfa-waigong' : type === 'motion' ? 'gongfa-qinggong' : 'gongfa-juexue';
            const typeColor = type === 'inner' ? '#00ff9d' : type === 'outer' ? '#ff3333' : type === 'motion' ? '#a0a0a0' : '#ff9900';
            const equippedId = equippedSkills[type];
            const equippedSkill = equippedId ? getSkillInfo(equippedId) : null;
            const masteryInfo = equippedId ? getSkillMastery(equippedId, player.skillMastery) : null;

            return (
              <div
                key={type}
                onClick={() => {
                  onOpenSkills(type);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.03)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(212, 175, 55, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.25)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.25)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.03)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <GongfaIcon type={type} size={20} />
                  <span className={gongfaClass} style={{
                    fontSize: '0.85rem',
                    fontFamily: '"Outfit", "Cinzel", "Ma Shan Zheng", cursive',
                    letterSpacing: '1px',
                    color: typeColor,
                    whiteSpace: 'nowrap'
                  }}>
                    {typeName}:
                  </span>
                  <span style={{
                    fontSize: '0.85rem',
                    color: equippedSkill ? '#fff' : 'var(--text-muted)',
                    fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                  }}>
                    {equippedSkill ? cleanText(equippedSkill.name) : '未装配'}
                  </span>
                </div>
                {equippedSkill && (
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '1px 5px',
                    borderRadius: '3px',
                    background: `${typeColor}15`,
                    color: typeColor,
                    border: `1px solid ${typeColor}35`,
                    whiteSpace: 'nowrap'
                  }}>
                    {masteryInfo?.label || '初学'}
                  </span>
                )}
              </div>
            );
          })}

          {/* 本命宝物槽位 */}
          {(() => {
            const equippedId = equippedTreasure;
            const t = TREASURES_DB?.find(tr => tr.id === equippedId);
            const rarityColors = { '神话': '#fbbf24', '传说': '#a855f7', '史诗': '#ec4899', '稀有': '#3b82f6', '普通': '#9ca3af' };
            const typeColor = t ? rarityColors[t.rarity] : '#d4af37';

            return (
              <div
                onClick={onOpenBackpack}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.03)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(212, 175, 55, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.25)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.25)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.03)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <span style={{ fontSize: '0.9rem' }}>⭐</span>
                  <span style={{
                    fontSize: '0.85rem',
                    fontFamily: '"Outfit", "Cinzel", "Ma Shan Zheng", cursive',
                    letterSpacing: '1px',
                    color: typeColor,
                    whiteSpace: 'nowrap'
                  }}>
                    本命宝具:
                  </span>
                  <span style={{
                    fontSize: '0.85rem',
                    color: t ? '#fff' : 'var(--text-muted)',
                    fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    fontWeight: t ? 'bold' : 'normal'
                  }}>
                    {t ? cleanText(t.name) : '未装配'}
                  </span>
                </div>
                {t && (
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '1px 5px',
                    borderRadius: '3px',
                    background: `${typeColor}15`,
                    color: typeColor,
                    border: `1px solid ${typeColor}35`,
                    whiteSpace: 'nowrap'
                  }}>
                    {t.rarity}
                  </span>
                )}
              </div>
            );
          })()}
        </div>

        {/* 两个大控制按钮 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
          <button
            onClick={() => onOpenSkills('all')}
            className="btn-primary"
            style={{
              padding: '8px 12px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              border: '1px solid var(--gold)',
              background: 'rgba(212, 175, 55, 0.15)',
              color: 'var(--gold)',
              fontWeight: 'bold',
              borderRadius: '6px',
              cursor: 'pointer',
              letterSpacing: '1px',
              fontFamily: '"Ma Shan Zheng", cursive',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = '#000'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212, 175, 55, 0.15)'; e.currentTarget.style.color = 'var(--gold)'; }}
          >
            <BookOpen size={14} /> 参悟与配置武学
          </button>
          
          <button
            onClick={onOpenBackpack}
            className="btn-primary"
            style={{
              padding: '8px 12px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              border: '1px solid var(--gold)',
              background: 'rgba(212, 175, 55, 0.15)',
              color: 'var(--gold)',
              fontWeight: 'bold',
              borderRadius: '6px',
              cursor: 'pointer',
              letterSpacing: '1px',
              fontFamily: '"Ma Shan Zheng", cursive',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = '#000'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212, 175, 55, 0.15)'; e.currentTarget.style.color = 'var(--gold)'; }}
          >
            <span>🎒 打开芥子储物袋</span>
          </button>
        </div>
      </div>
    </div>
  );
}

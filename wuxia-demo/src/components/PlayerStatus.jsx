import React from 'react';
import { useGameStore, SKILLS_DB, TREASURES_DB, getSkillMastery, getSkillInfo, MASTERY_TIERS, ATTR_MAP } from '../store/gameState';
import { User, Star, AlertCircle } from 'lucide-react';
import AttributeRadar from './AttributeRadar';
import { GongfaIcon, TreasureIcon, WuxiaIconStyles } from './WuxiaIcon';

const cleanText = (text) => {
  if (!text) return '';
  // 过滤掉所有 emoji 以及常见的特殊图形符号 (如钻石💎，爱心💙💜等)
  // 只保留中文、英文、数字、中英文括号、中括号、单双引号、空格、加减号
  return text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\[\]「」x（）()+\-\s]/g, '').trim();
};

export default function PlayerStatus() {
  const player = useGameStore(state => state.player);
  const setAttribute = useGameStore(state => state.setAttribute);
  const equipSkill = useGameStore(state => state.equipSkill);
  const equipTreasure = useGameStore(state => state.equipTreasure);
  const inBattle = useGameStore(state => state.battleState.inBattle);
  const { name, title, level, exp, maxExp, freePoints, attributes, permanentAttributes, skills, hp, maxHp, treasures, equippedSkills, equippedTreasure } = player;

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

      <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
        <h4 style={{ fontSize: '1rem', marginBottom: '0.8rem', color: 'var(--gold)', fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '2px' }}>武学与宝具羁绊</h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
          {['inner', 'outer', 'motion', 'ultimate'].map(type => {
            const typeName = type === 'inner' ? '内功' : type === 'outer' ? '外功' : type === 'motion' ? '轻功' : '绝学';
            const gongfaClass = type === 'inner' ? 'gongfa-neigong' : type === 'outer' ? 'gongfa-waigong' : type === 'motion' ? 'gongfa-qinggong' : 'gongfa-juexue';
            const typeColor = type === 'inner' ? '#00ff9d' : type === 'outer' ? '#ff3333' : type === 'motion' ? '#a0a0a0' : '#ff9900';
            const available = skills.filter(sId => SKILLS_DB.find(s => s.id === sId)?.type === type);
            const equippedId = equippedSkills[type];
            const masteryInfo = equippedId ? getSkillMastery(equippedId, player.skillMastery) : null;
            const equippedSkill = equippedId ? getSkillInfo(equippedId) : null;
            return (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', border: equippedId ? '1px solid rgba(194, 157, 56, 0.3)' : '1px solid transparent', boxShadow: equippedId ? '0 0 10px rgba(194, 157, 56, 0.15)' : 'none' }}>
                  <span className={gongfaClass} style={{ minWidth: '72px', fontFamily: '"Outfit", "Cinzel", "Ma Shan Zheng", cursive', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GongfaIcon type={type} size={28} /> {typeName}
                  </span>
                  <select
                     value={equippedSkills[type] || ''}
                     onChange={e => equipSkill(type, e.target.value || null)}
                     className="wuxia-select"
                     style={{ flex: 1, minWidth: 0, maxWidth: '160px', fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif', letterSpacing: '1px', padding: '4px 6px', fontSize: '0.85rem' }}
                  >
                    <option value="">── 空缺 ──</option>
                    {available.map(sId => {
                      const sk = getSkillInfo(sId);
                      const skillName = sk?.name || '';
                      const { wins, label } = getSkillMastery(sId, player.skillMastery);
                      // 若武功名过长（大于5个字），则直接取消熟练度后缀，以防下拉框溢出
                      const suffix = skillName.length <= 5 ? (label ? `「${label}」` : wins > 0 ? `[${wins}胜]` : '') : '';
                      const displayText = cleanText(`${skillName} ${suffix}`);
                      return <option key={sId} value={sId}>{displayText}</option>;
                    })}
                  </select>
                  {equippedSkill && (
                    <span style={{
                      fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', whiteSpace: 'nowrap',
                      background: `${typeColor}15`,
                      color: typeColor,
                      border: `1px solid ${typeColor}35`,
                      fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif'
                    }}>
                      {masteryInfo?.wins || 0}胜
                    </span>
                  )}
               </div>
            );
          })}
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
           <span style={{ color: 'var(--gold)', fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
             本命宝具
           </span>
           <select
              value={equippedTreasure || ''}
              onChange={e => equipTreasure(e.target.value || null)}
              className="wuxia-select"
              style={{ border: '1px solid var(--gold)', fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif', letterSpacing: '1px', padding: '6px 8px', width: '100%', fontSize: '0.85rem' }}
           >
              <option value="">── 无羁绊 ──</option>
              {(treasures || []).map(tId => {
                 const t = TREASURES_DB?.find(tr => tr.id === tId);
                 if (!t) return <option key={tId} value={tId}>{cleanText(tId)}</option>;
                 // 去掉 [稀有度] 前缀以防下拉框溢出，只显示过滤后的宝具名字
                 const displayText = cleanText(t.name);
                 return <option key={tId} value={tId}>{displayText}</option>;
              })}
           </select>
           {equippedTreasure && (() => {
              const t = TREASURES_DB?.find(tr => tr.id === equippedTreasure);
              if (!t) return null;
              const rarityColors = { '神话': '#fbbf24', '传说': '#a855f7', '史诗': '#a78bfa', '稀有': '#60a5fa', '普通': '#9ca3af' };
              const baojuGlowClass = t.rarity === '神话' ? 'baoju-glow-mythic' : (t.rarity === '传说' ? 'baoju-glow-legend' : '');
              const rarityIconText = t.rarity === '神话' ? '镇派' : t.rarity === '传说' ? '传世' : '绝品';
              return (
                <div className={`baoju-card ${baojuGlowClass}`} style={{ marginTop: '8px', display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 14px' }}>
                  <TreasureIcon id={t.id} size={56} />
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                    <div style={{ fontSize: '0.9rem', color: rarityColors[t.rarity] || 'var(--text-muted)', fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif', letterSpacing: '1px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <span style={{ fontWeight: 'bold' }}>{cleanText(t.name)}</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.8, background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: '3px', whiteSpace: 'nowrap' }}>{t.rarity} · {rarityIconText}</span>
                    </div>
                    
                    {/* 属性加成 */}
                    {t.attrs && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--gold)', opacity: 0.9, fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif' }}>
                        {Object.entries(t.attrs).map(([k, v]) => `${ATTR_MAP[k] || k} +${v}`).join('  ')}
                      </div>
                    )}
                    
                    {/* 宝具效果描述 */}
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.3', borderTop: '1px dashed rgba(194, 157, 56, 0.15)', paddingTop: '4px', marginTop: '2px', fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif' }}>
                      {cleanText(t.desc)}
                    </div>
                  </div>
                </div>
              );
           })()}
        </div>
      </div>
    </div>
  );
}

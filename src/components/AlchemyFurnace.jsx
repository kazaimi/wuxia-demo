import React, { useState, useEffect } from 'react';
import { useGameStore, TREASURES_DB, getSocket } from '../store/gameState';
import { Hammer, Sparkles, Flame, RefreshCw, Zap, Shield, HelpCircle, Compass } from 'lucide-react';
import { useCleanImage } from '../utils/imageProcess';
import { SoundManager } from '../utils/SoundManager';

export default function AlchemyFurnace() {
  const player = useGameStore(state => state.player);
  const cleanHeaderPic = useCleanImage('/alchemy_header.png', 25, 20);
  const cleanFurnacePic = useCleanImage('/alchemy_furnace_drawn.png', 20, 20);
  
  if (!player) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>数据加载中，请大侠先行登入江湖...</p>
      </div>
    );
  }

  const [activeMode, setActiveMode] = useState('synthesize'); // synthesize (重铸) 或 refine (洗炼)

  // ==================== 重铸状态 ====================
  const [selectedSynthIds, setSelectedSynthIds] = useState([]); // 选中的待重铸宝物ID列表
  const [synthResult, setSynthResult] = useState(null); // 重铸结果弹窗数据
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // ==================== 洗炼状态 ====================
  const [refineMainId, setRefineMainId] = useState(null); // 主宝物
  const [refineSubId, setRefineSubId] = useState(null); // 副宝胚
  const [refineMaterialType, setRefineMaterialType] = useState('goldSand'); // 五行属性材料类型
  const [refineMaterialCount, setRefineMaterialCount] = useState(5); // 材料数 (5, 10, 20)
  const [refineResult, setRefineResult] = useState(null); // 洗炼结果弹窗数据
  const [isRefining, setIsRefining] = useState(false);

  const socket = getSocket();

  // 监听 Socket 重铸和洗炼结果
  useEffect(() => {
    if (!socket) return;

    const onSynthResult = (res) => {
      setIsSynthesizing(false);
      if (res.success) {
        setSynthResult(res);
        setSelectedSynthIds([]);
        SoundManager.play('sfx_success');
      } else {
        alert(`【重铸失败】${res.reason}`);
        SoundManager.play('sfx_fail');
      }
    };

    const onRefineResult = (res) => {
      setIsRefining(false);
      if (res.success) {
        setRefineResult(res);
        setRefineSubId(null);
        SoundManager.play('sfx_success');
      } else {
        alert(`【洗炼失败】${res.reason}`);
        SoundManager.play('sfx_fail');
      }
    };

    socket.on('synthesize_treasure_result', onSynthResult);
    socket.on('refine_treasure_result', onRefineResult);

    return () => {
      socket.off('synthesize_treasure_result', onSynthResult);
      socket.off('refine_treasure_result', onRefineResult);
    };
  }, [socket]);

  // 材料与银两、精魂定义
  const silver = player.silver || 0;
  const essence = player.essence || 0;
  const materials = player.inventoryMaterials || {
    anomalyDust: 0, soulAshes: 0, anomalyCrystal: 0,
    goldSand: 0, woodHerb: 0, waterFluid: 0, fireMarrow: 0, earthEssence: 0
  };

  // 五行属性材料名称对照表
  const 五行名称 = {
    goldSand: '炽阳金沙',
    woodHerb: '枯木灵芝',
    waterFluid: '无根净水',
    fireMarrow: '赤炎地髓',
    earthEssence: '玄黄土精'
  };

  // 五行属性材料图标对照表
  const elementIcons = {
    goldSand: '/elem_gold.png',
    woodHerb: '/elem_wood.png',
    waterFluid: '/elem_water.png',
    fireMarrow: '/elem_fire.png',
    earthEssence: '/elem_earth.png'
  };

  // 获取宝物详细数据
  const getTreasureData = (id) => {
     if (!id || !Array.isArray(TREASURES_DB)) return null;
     return TREASURES_DB.find(t => t.id === id) || null;
  };

  // 一键切换标签页辅助函数
  const navigateToTab = (tabLabel) => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const target = buttons.find(b => b.textContent && b.textContent.includes(tabLabel));
    if (target) {
      target.click();
    }
  };

  // 过滤出储物袋中的有效宝物
  const validTreasures = (player.treasures || []).filter(tId => getTreasureData(tId) !== null);

  // 统计每种有效宝物的持有数量 (堆叠逻辑)
  const treasuresInventory = validTreasures.reduce((acc, tId) => {
    acc[tId] = (acc[tId] || 0) + 1;
    return acc;
  }, {});

  // 过滤出副胚品质（史诗及以上）的独特宝物及持有数量
  const subTreasuresInventory = Object.entries(treasuresInventory)
    .filter(([tId]) => {
      const data = getTreasureData(tId);
      return data && ['史诗', '传说', '神话'].includes(data.rarity);
    })
    .reduce((acc, [tId, count]) => {
      acc[tId] = count;
      return acc;
    }, {});

  // 确保选择状态的有效性
  useEffect(() => {
    if (refineMainId && !treasuresInventory[refineMainId]) {
      setRefineMainId(null);
    }
    if (refineSubId && !subTreasuresInventory[refineSubId]) {
      setRefineSubId(null);
    }
  }, [player.treasures, refineMainId, refineSubId]);

  // ==================== 重铸判定 ====================
  // 根据选中的宝物列表判断是否符合重铸规则（同品质且3~5件）
  const getSynthValidity = () => {
    if (selectedSynthIds.length < 3 || selectedSynthIds.length > 5) {
      return { valid: false, reason: '需放入 3 ~ 5 件宝具' };
    }
    const firstId = validTreasures[selectedSynthIds[0]];
    const firstData = getTreasureData(firstId);
    if (!firstData) return { valid: false, reason: '宝具未知' };
    
    const targetRarity = firstData.rarity;
    for (const idx of selectedSynthIds) {
      const id = validTreasures[idx];
      const data = getTreasureData(id);
      if (!data || data.rarity !== targetRarity) {
        return { valid: false, reason: '放入的宝物品质不相同' };
      }
    }
    
    // 检查资源是否充足
    if (silver < 50) return { valid: false, reason: '银两不足 50 两' };
    if (essence < 15) return { valid: false, reason: '武道精魂不足 15 点' };
    if (materials.anomalyDust < 10) return { valid: false, reason: '异变之尘不足 10 个' };

    return { valid: true, rarity: targetRarity };
  };

  const synthValidity = getSynthValidity();

  const handleSynthesize = () => {
    if (!synthValidity.valid) return;
    setIsSynthesizing(true);
    // 将选中的背包索引映射为对应的宝物ID发送给服务器
    const treasureIds = selectedSynthIds.map(idx => validTreasures[idx]);
    socket.emit('synthesize_treasure', { treasureIds });
  };

  // 点击选择重铸宝物（按实体索引处理，完美避开同名一并选中问题）
  const handleToggleSelectSynth = (targetIdx) => {
    const idx = selectedSynthIds.indexOf(targetIdx);
    if (idx >= 0) {
      const newIds = [...selectedSynthIds];
      newIds.splice(idx, 1);
      setSelectedSynthIds(newIds);
    } else {
      if (selectedSynthIds.length >= 5) {
        alert('乾坤八卦神炉最多容纳 5 件宝具！');
        return;
      }
      
      // 检查品质一致性：如果已经选了其他物品，新选择的物品品质必须与之相同
      if (selectedSynthIds.length > 0) {
        const firstId = validTreasures[selectedSynthIds[0]];
        const firstData = getTreasureData(firstId);
        const nextId = validTreasures[targetIdx];
        const nextData = getTreasureData(nextId);
        if (firstData && nextData && firstData.rarity !== nextData.rarity) {
          alert('放入的宝物品质必须相同！');
          return;
        }
      }

      setSelectedSynthIds([...selectedSynthIds, targetIdx]);
    }
  };

  // ==================== 洗炼判定 ====================
  const getRefineValidity = () => {
    if (!refineMainId) return { valid: false, reason: '请放入洗炼主宝物' };
    if (!refineSubId) return { valid: false, reason: '请放入副宝胚子' };
    if (refineMainId === refineSubId) {
      // 如果主副宝物ID相同，检查背包里是否有至少两件
      const count = validTreasures.filter(tId => tId === refineMainId).length;
      if (count < 2) {
         return { valid: false, reason: '至少需有两件同种宝具以作洗炼主副胚' };
      }
    }

    const subData = getTreasureData(refineSubId);
    if (!subData || !['史诗', '传说', '神话'].includes(subData.rarity)) {
      return { valid: false, reason: '副宝胚品质需【史诗】或以上' };
    }

    // 检查材料
    if (essence < 25) return { valid: false, reason: '武道精魂不足 25 点' };
    if (materials.anomalyCrystal < 2) return { valid: false, reason: '异变玄晶不足 2 个' };
    if (materials.soulAshes < 2) return { valid: false, reason: '怨魂余烬不足 2 个' };
    if ((materials[refineMaterialType] || 0) < refineMaterialCount) {
      return { valid: false, reason: `${五行名称[refineMaterialType]}不足 ${refineMaterialCount} 个` };
    }

    return { valid: true };
  };

  const refineValidity = getRefineValidity();

  const handleRefine = () => {
    if (!refineValidity.valid) return;

    if (refineSubId === player.equippedTreasure) {
      if (!window.confirm("🔥 警告 🔥\n\n阁下选择将当前装备的【本命宝具】作为副胚进行消耗！此操作将永久销毁它及其全部注灵属性！\n确认要继续注入器灵吗？")) {
        return;
      }
    }

    if (refineMainId && refineMainId !== player.equippedTreasure && player.equippedTreasure) {
      const currentEquippedName = getTreasureData(player.equippedTreasure)?.name || player.equippedTreasure;
      if (!window.confirm(`提示：该宝具尚未装备。\n洗炼后将自动装备该宝具，当前装备的本命宝具【${currentEquippedName}】将被替换，其原有的器灵词条会被覆盖。\n确认要继续注入器灵吗？`)) {
        return;
      }
    }

    setIsRefining(true);
    socket.emit('refine_treasure', {
      mainTreasureId: refineMainId,
      subTreasureId: refineSubId,
      materialType: refineMaterialType,
      materialCount: refineMaterialCount
    });
  };

  // 计算重铸概率
  const getSynthRateDesc = () => {
    if (selectedSynthIds.length === 3) return '35% 成功升品质，失败随机同品质';
    if (selectedSynthIds.length === 4) return '65% 成功升品质，失败随机同品质';
    if (selectedSynthIds.length === 5) return '100% 必定升阶 (同品质内避同)';
    return '--';
  };

  // 获取品质的背景和字体色
  const rarityColors = {
    '普通': { color: '#9ca3af', border: 'rgba(156,163,175,0.4)', text: '普通' },
    '稀有': { color: '#3b82f6', border: 'rgba(59,130,246,0.4)', text: '稀有' },
    '史诗': { color: '#a855f7', border: 'rgba(168,85,247,0.4)', text: '史诗' },
    '传说': { color: '#f97316', border: 'rgba(249,115,22,0.4)', text: '传说' },
    '神话': { color: '#ef4444', border: 'rgba(239,68,68,0.5)', text: '神话' }
  };

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '2rem', position: 'relative' }}>
      <style>{`
        /* 神炉发光与呼吸特效 */
        .alchemy-furnace-core {
          position: relative;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 75%);
          border: 2px dashed rgba(16,185,129,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          transition: all 0.5s ease;
        }
        .alchemy-furnace-core.active {
          animation: furnaceShake 0.15s infinite alternate, furnacePulse 1.5s infinite ease-in-out;
          border-color: var(--gold);
          background: radial-gradient(circle, rgba(212,175,55,0.3) 0%, transparent 70%);
        }
        @keyframes furnaceShake {
          0% { transform: translate(2px, 1px) rotate(0deg); }
          100% { transform: translate(-1px, -2px) rotate(1deg); }
        }
        @keyframes furnacePulse {
          0%, 100% { box-shadow: 0 0 15px rgba(212,175,55,0.2); }
          50% { box-shadow: 0 0 35px rgba(212,175,55,0.7); }
        }
        @keyframes furnaceFloat {
          0%, 100% { transform: translateY(0); filter: drop-shadow(0 0 12px rgba(16, 185, 129, 0.3)); }
          50% { transform: translateY(-6px); filter: drop-shadow(0 0 25px rgba(212, 175, 55, 0.6)); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* 选中态特效 */
        .treasure-item-select {
          border: 1px solid rgba(194, 157, 56, 0.4);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .treasure-item-select:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(194,157,56,0.15);
        }
        .treasure-item-select.selected {
          border-color: var(--gold);
          background: rgba(212,175,55,0.08) !important;
          box-shadow: 0 0 10px rgba(212,175,55,0.3);
        }

        @keyframes furnaceScaleUp {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-up {
          animation: furnaceScaleUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes tokenAlienFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

      {/* 角落装饰 */}
      <div className="corner-decoration top-left" />
      <div className="corner-decoration top-right" />
      <div className="corner-decoration bottom-left" />
      <div className="corner-decoration bottom-right" />

      {/* 标题 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', position: 'relative' }}>
        {/* 背景八卦灵符抠图 */}
        {cleanHeaderPic && (
          <img 
            src={cleanHeaderPic} 
            alt="八卦太极" 
            style={{ 
              width: '120px', 
              height: '120px', 
              objectFit: 'contain',
              position: 'absolute',
              top: '-35px',
              opacity: 0.18,
              filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.4))',
              animation: 'spin 25s linear infinite',
              pointerEvents: 'none'
            }} 
          />
        )}
        <h2 style={{ 
          fontFamily: '"Ma Shan Zheng", cursive', 
          color: 'var(--gold)', 
          letterSpacing: '4px', 
          fontSize: '2.4rem', 
          textShadow: '0 0 15px rgba(212,175,55,0.4)',
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {cleanHeaderPic && (
            <img 
              src={cleanHeaderPic} 
              alt="logo" 
              style={{ width: '40px', height: '40px', objectFit: 'contain', animation: 'spin 12s linear infinite' }} 
            />
          )}
          太上八卦乾坤炉
          {cleanHeaderPic && (
            <img 
              src={cleanHeaderPic} 
              alt="logo" 
              style={{ width: '40px', height: '40px', objectFit: 'contain', animation: 'spin 12s linear infinite reverse' }} 
            />
          )}
        </h2>
        <div style={{ width: '120px', height: '2px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', margin: '0.5rem auto', position: 'relative', zIndex: 1 }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', position: 'relative', zIndex: 1 }}>
          融三界异宝以补残缺，注五行精气以锻器灵
        </p>
      </div>

      {/* 选项卡 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button
          className="btn-primary"
          onClick={() => { setActiveMode('synthesize'); setSynthResult(null); }}
          style={{
            background: activeMode === 'synthesize' ? 'var(--gold)' : 'transparent',
            color: activeMode === 'synthesize' ? '#110505' : 'var(--gold)',
            border: '1px solid var(--gold)',
            padding: '0.6rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Flame size={16} /> 炼火重铸 (升阶)
        </button>
        <button
          className="btn-primary"
          onClick={() => { setActiveMode('refine'); setRefineResult(null); }}
          style={{
            background: activeMode === 'refine' ? 'var(--gold)' : 'transparent',
            color: activeMode === 'refine' ? '#110505' : 'var(--gold)',
            border: '1px solid var(--gold)',
            padding: '0.6rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Sparkles size={16} /> 器灵洗炼 (词条)
        </button>
      </div>

      {/* 状态总览/材料看板 */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '8px',
        padding: '1rem',
        border: '1px solid rgba(255,255,255,0.05)',
        marginBottom: '2rem',
        fontSize: '0.85rem'
      }}>
        <div style={{ fontWeight: 'bold', color: 'var(--gold)', marginBottom: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.3rem' }}>
          乾坤炉物资一览
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.8rem' }}>
          <div>银两: <span style={{ color: silver >= 50 ? '#10b981' : '#ef4444' }}>{silver}两</span></div>
          <div>武道精魂: <span style={{ color: essence >= 25 ? '#10b981' : '#ef4444' }}>{essence}点</span></div>
          <div>异变之尘: <span style={{ color: materials.anomalyDust >= 10 ? '#10b981' : '#ef4444' }}>{materials.anomalyDust}个</span></div>
          <div>异变玄晶: <span style={{ color: materials.anomalyCrystal >= 2 ? '#10b981' : '#ef4444' }}>{materials.anomalyCrystal}个</span></div>
          <div>怨魂余烬: <span style={{ color: materials.soulAshes >= 2 ? '#10b981' : '#ef4444' }}>{materials.soulAshes}个</span></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.8rem', marginTop: '0.6rem', borderTop: '1px dashed rgba(255,255,255,0.05)', paddingTop: '0.6rem' }}>
          {Object.entries(五行名称).map(([key, name]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <img 
                src={elementIcons[key]} 
                alt={name} 
                style={{ width: '20px', height: '20px', objectFit: 'contain', mixBlendMode: 'screen', filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.1))' }} 
              />
              <span>{name}: <span style={{ color: '#fff', fontWeight: 'bold' }}>{materials[key] || 0}</span></span>
            </div>
          ))}
        </div>
      </div>

      {/* ==================================== 模式一：炼火重铸 ==================================== */}
      {activeMode === 'synthesize' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(280px, 320px)', gap: '2rem' }}>
          {/* 左侧：选择面板 */}
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '1rem', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Hammer size={18} /> 选择重铸原料 (3 ~ 5件同品质宝具)
            </div>
            
            {validTreasures.length === 0 ? (
              <div className="glass-panel animate-scale-up" style={{
                textAlign: 'center',
                padding: '2.5rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed rgba(212, 175, 55, 0.25)',
                borderRadius: '12px',
                boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.4)'
              }}>
                <div style={{ marginBottom: '1.2rem', display: 'flex', justifyContent: 'center' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: 'rgba(212, 175, 55, 0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(212, 175, 55, 0.18)',
                    boxShadow: '0 0 12px rgba(212, 175, 55, 0.1)'
                  }}>
                    <Flame size={28} style={{ color: 'var(--gold)', opacity: 0.85 }} />
                  </div>
                </div>
                <h3 style={{ fontFamily: '"Ma Shan Zheng", cursive', fontSize: '1.3rem', color: 'var(--gold)', marginBottom: '0.6rem', letterSpacing: '1px' }}>
                  神炉沉寂，尚无炼材
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: '340px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
                  八卦神炉需吸纳天地之灵宝。重铸宝物需放入 <span style={{ color: 'var(--gold)' }}>3 ~ 5 件相同品质</span> 的宝物，大侠储物袋中目前空空如也。
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxWidth: '220px', margin: '0 auto' }}>
                  <button onClick={() => navigateToTab('任务大厅')} className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Compass size={14} /> 前往任务大厅 (日常悬赏)
                  </button>
                  <button onClick={() => navigateToTab('秘境寻宝')} className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderColor: '#f97316', color: '#f97316' }}>
                    <Compass size={14} /> 前往秘境寻宝 (探秘夺宝)
                  </button>
                  <button onClick={() => navigateToTab('拍卖风云')} className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderColor: '#c29d38', color: '#c29d38' }}>
                    <Compass size={14} /> 前往拍卖风云 (淘换宝物)
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.8rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                {validTreasures.map((tId, idx) => {
                  const data = getTreasureData(tId);
                  if (!data) return null;
 
                  const isSelected = selectedSynthIds.includes(idx);
                  const rColor = rarityColors[data.rarity] || { color: '#fff', border: 'transparent' };
 
                  return (
                    <div
                      key={`${tId}_${idx}`}
                      onClick={() => handleToggleSelectSynth(idx)}
                      className={`glass-panel treasure-item-select ${isSelected ? 'selected' : ''}`}
                      style={{
                        padding: '0.6rem',
                        textAlign: 'center',
                        fontSize: '0.8rem',
                        position: 'relative',
                        background: 'rgba(255,255,255,0.01)',
                        cursor: 'pointer'
                      }}
                    >
                      {/* 选择指示角标 */}
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: '2px', right: '4px',
                          color: 'var(--gold)',
                          fontWeight: 'bold',
                          fontSize: '0.75rem'
                        }}>
                          ✓
                        </div>
                      )}
                      
                      <div style={{ color: rColor.color, fontWeight: 'bold', marginBottom: '0.3rem' }}>{data.name}</div>
                      <div style={{
                        fontSize: '0.7rem',
                        padding: '1px 4px',
                        borderRadius: '3px',
                        background: rColor.border,
                        color: rColor.color,
                        display: 'inline-block',
                        marginBottom: '0.4rem'
                      }}>
                        {data.rarity}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', scale: 0.9 }}>
                        {data.attrs.str ? `力+${data.attrs.str} ` : ''}
                        {data.attrs.con ? `体+${data.attrs.con} ` : ''}
                        {data.attrs.agi ? `敏+${data.attrs.agi} ` : ''}
                        {data.attrs.int ? `智+${data.attrs.int} ` : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 右侧：神炉法阵 */}
          <div style={{
            borderLeft: '1px solid rgba(255,255,255,0.05)',
            paddingLeft: '1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div className="alchemy-furnace-core" style={{ width: '160px', height: '160px', border: 'none', background: 'none' }}>
                {cleanFurnacePic ? (
                  <img 
                    src={cleanFurnacePic} 
                    alt="太上乾坤炉" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      filter: isSynthesizing 
                        ? 'drop-shadow(0 0 25px rgba(249, 115, 22, 0.8)) brightness(1.2)' 
                        : 'drop-shadow(0 0 15px rgba(16, 185, 129, 0.4))',
                      animation: isSynthesizing ? 'furnaceShake 0.15s infinite alternate' : 'furnaceFloat 4s ease-in-out infinite',
                      position: 'absolute',
                      zIndex: 0
                    }}
                  />
                ) : (
                  <Flame size={48} style={{ color: isSynthesizing ? 'orange' : 'var(--gold)', filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.4))' }} />
                )}
                <div style={{ color: 'var(--gold)', textAlign: 'center', zIndex: 1, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '10px' }}>
                    {selectedSynthIds.length} / 5 放入
                  </div>
                </div>
              </div>

              {/* 重铸信息 */}
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '0.4rem' }}>熔炼阵眼状态</div>
                <div>当前选中品质: <span style={{ color: selectedSynthIds.length > 0 ? (rarityColors[getTreasureData(validTreasures[selectedSynthIds[0]])?.rarity]?.color || '#fff') : 'var(--text-muted)' }}>
                  {selectedSynthIds.length > 0 ? getTreasureData(validTreasures[selectedSynthIds[0]])?.rarity : '无'}
                </span></div>
                <div>熔炼契合概率: <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>{getSynthRateDesc()}</span></div>
              </div>

              {/* 消耗确认清单 */}
              <div style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '0.8rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                textAlign: 'left',
                border: '1px solid rgba(255,255,255,0.03)',
                marginBottom: '1rem'
              }}>
                <div style={{ fontWeight: 'bold', color: 'var(--gold)', marginBottom: '0.4rem' }}>消耗清单:</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>银两 (50两):</span>
                  <span style={{ color: silver >= 50 ? '#10b981' : '#ef4444' }}>{silver} / 50</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                  <span>武道精魂 (15点):</span>
                  <span style={{ color: essence >= 15 ? '#10b981' : '#ef4444' }}>{essence} / 15</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                  <span>异变之尘 (10个):</span>
                  <span style={{ color: materials.anomalyDust >= 10 ? '#10b981' : '#ef4444' }}>{materials.anomalyDust} / 10</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSynthesize}
              disabled={!synthValidity.valid || isSynthesizing}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.8rem',
                background: synthValidity.valid ? 'var(--gold)' : 'rgba(255,255,255,0.02)',
                color: synthValidity.valid ? '#110505' : 'rgba(255,255,255,0.2)',
                border: '1px solid var(--gold)',
                cursor: synthValidity.valid ? 'pointer' : 'not-allowed',
                boxShadow: synthValidity.valid ? '0 0 15px rgba(212, 175, 55, 0.3)' : 'none'
              }}
            >
              {isSynthesizing ? '神火熔炼中...' : (synthValidity.valid ? '炉炼重铸' : `无法重铸: ${synthValidity.reason}`)}
            </button>
          </div>
        </div>
      )}

      {/* ==================================== 模式二：器灵洗炼 ==================================== */}
      {activeMode === 'refine' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 320px)', gap: '2rem' }}>
          {/* 左侧：选择主宝物、副胚、属性材料 */}
          <div>
            {/* 步骤 1：放入主宝物 */}
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--gold)' }}>
              1. 放入待洗炼主宝物 (决定词条的载体)
            </div>
            {Object.keys(treasuresInventory).length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '1.5rem 1rem',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ color: 'var(--gold)', marginBottom: '0.4rem', fontWeight: 'bold' }}>暂无可选主宝物</div>
                <div style={{ scale: 0.9 }}>大侠储物袋内尚无宝物，请先去历练寻宝吧</div>
              </div>
            ) : (
              <div style={{
                display: 'flex', gap: '0.8rem', overflowX: 'auto', width: '100%', maxWidth: '100%', paddingBottom: '0.5rem', marginBottom: '1.5rem',
                borderBottom: '1px dashed rgba(255,255,255,0.05)',
                boxSizing: 'border-box'
              }}>
                {Object.entries(treasuresInventory).map(([tId, count]) => {
                  const data = getTreasureData(tId);
                  if (!data) return null;
                  const isEquipped = player.equippedTreasure === tId;
                  const hasWashedAttrs = isEquipped && Object.values(player.equippedTreasureAttrs || {}).some(v => v > 0);
                  const isSelected = refineMainId === tId;
                  const rColor = rarityColors[data.rarity] || { color: '#fff', border: 'transparent' };

                  const isUsedInSub = refineSubId === tId;
                  const remainingCount = count - (isUsedInSub ? 1 : 0);

                  return (
                    <div
                      key={`main_${tId}`}
                      onClick={() => {
                        if (refineSubId === tId && count < 2) {
                          setRefineSubId(null); // 互斥
                        }
                        setRefineMainId(tId);
                      }}
                      className={`glass-panel treasure-item-select ${isSelected ? 'selected' : ''}`}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.8rem',
                        whiteSpace: 'nowrap',
                        textAlign: 'center',
                        background: isSelected 
                          ? 'rgba(212,175,55,0.08)' 
                          : isEquipped 
                            ? 'rgba(212,175,55,0.02)' 
                            : 'rgba(255,255,255,0.01)',
                        border: isSelected 
                          ? '1px solid var(--gold)' 
                          : isEquipped 
                            ? '1px dashed rgba(212, 175, 55, 0.6)' 
                            : '1px solid rgba(255,255,255,0.08)',
                        boxShadow: isSelected 
                          ? '0 0 10px rgba(212,175,55,0.3)' 
                          : isEquipped 
                            ? '0 0 8px rgba(212,175,55,0.15)' 
                            : 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ 
                        color: rColor.color, 
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px'
                      }}>
                        {isEquipped && <span style={{ color: 'var(--gold)' }}>⭐</span>}
                        {data.name}
                        <span style={{ fontSize: '0.75rem', opacity: 0.8, marginLeft: '4px' }}>x{remainingCount}</span>
                      </div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}>
                        <span>{data.rarity}</span>
                        {isEquipped && (
                          <span style={{ 
                            fontSize: '0.6rem', 
                            background: 'rgba(212, 175, 55, 0.2)', 
                            color: 'var(--gold)', 
                            padding: '0 2px', 
                            borderRadius: '2px',
                            border: '1px solid rgba(212, 175, 55, 0.4)'
                          }}>
                            本命{hasWashedAttrs ? '·注' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {refineMainId && (() => {
              const isEquipped = refineMainId === player.equippedTreasure;
              const hasWashed = player.equippedTreasure && player.equippedTreasureAttrs && Object.values(player.equippedTreasureAttrs).some(v => v > 0);
              
              if (isEquipped) {
                if (!hasWashed) return null;
                return (
                  <div style={{
                    marginTop: '0.5rem',
                    marginBottom: '1.5rem',
                    background: 'rgba(59, 130, 246, 0.05)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    borderRadius: '6px',
                    padding: '0.6rem 1rem',
                    textAlign: 'left'
                  }}>
                    <div style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>❖ 当前本命器灵注灵属性 (洗炼后将被覆盖！)</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.3rem 0.6rem' }}>
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
                          <div key={k} style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                            {attrNames[k] || k}: <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>+{v}{isPercent ? '%' : ''}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              } else {
                const currentEquippedName = getTreasureData(player.equippedTreasure)?.name || player.equippedTreasure;
                return (
                  <div style={{
                    marginTop: '0.5rem',
                    marginBottom: '1.5rem',
                    background: 'rgba(245, 158, 11, 0.05)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: '6px',
                    padding: '0.6rem 1rem',
                    textAlign: 'left'
                  }}>
                    <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>⚠️ 装备切换提醒</span>
                    </div>
                    <p style={{ color: '#fde68a', fontSize: '0.75rem', margin: '0 0 0.4rem 0', lineHeight: '1.4' }}>
                      该宝具目前【并非】你的本命宝具。洗炼它将自动装备它作为本命宝具，并覆盖当前本命【{currentEquippedName}】的器灵注灵属性！
                    </p>
                    {hasWashed && (
                      <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '0.4rem 0.6rem', borderRadius: '4px', marginTop: '0.4rem' }}>
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.2rem' }}>当前【{currentEquippedName}】生效的器灵属性：</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px' }}>
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
                              <span key={k} style={{ fontSize: '0.7rem', color: '#fcd34d' }}>
                                {attrNames[k] || k}: <strong>+{v}{isPercent ? '%' : ''}</strong>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
            })()}

            {Object.keys(subTreasuresInventory).length === 0 ? (
              <div className="glass-panel animate-scale-up" style={{
                textAlign: 'center',
                padding: '1.8rem 1rem',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed rgba(212, 175, 55, 0.2)',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <div style={{ color: 'var(--gold)', marginBottom: '0.4rem', fontWeight: 'bold', fontSize: '0.9rem' }}>暂无符合品质的副宝胚</div>
                <div style={{ scale: 0.9, color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.8rem' }}>
                  洗炼需消耗一件 <span style={{ color: '#a855f7' }}>【史诗】</span>、<span style={{ color: '#f97316' }}>【传说】</span> 或 <span style={{ color: '#ef4444' }}>【神话】</span> 品质的宝物作为副胚。
                </div>
                <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
                  <button onClick={() => navigateToTab('秘境寻宝')} className="btn-primary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', borderColor: '#f97316', color: '#f97316' }}>
                     前往秘境寻宝 (探秘夺宝)
                  </button>
                  <button onClick={() => navigateToTab('拍卖风云')} className="btn-primary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', borderColor: '#c29d38', color: '#c29d38' }}>
                     前往拍卖风云 (淘换宝物)
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex', gap: '0.8rem', overflowX: 'auto', width: '100%', maxWidth: '100%', paddingBottom: '0.5rem', marginBottom: '1.5rem',
                borderBottom: '1px dashed rgba(255,255,255,0.05)',
                boxSizing: 'border-box'
              }}>
                {Object.entries(subTreasuresInventory).map(([tId, count]) => {
                  const data = getTreasureData(tId);
                  if (!data) return null;
                  const isSelected = refineSubId === tId;
                  const isEquipped = player.equippedTreasure === tId;
                  const hasWashedAttrs = isEquipped && Object.values(player.equippedTreasureAttrs || {}).some(v => v > 0);
                  
                  const isUsedInMain = refineMainId === tId;
                  const remainingCount = count - (isUsedInMain ? 1 : 0);
                  const rColor = rarityColors[data.rarity] || { color: '#fff', border: 'transparent' };

                  const isMainSelectedEmpty = isUsedInMain && count < 2;

                  return (
                    <div
                      key={`sub_${tId}`}
                      onClick={() => {
                        if (isMainSelectedEmpty) {
                          setRefineMainId(null); // 互斥
                        }
                        setRefineSubId(tId);
                      }}
                      className={`glass-panel treasure-item-select ${isSelected ? 'selected' : ''}`}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.8rem',
                        whiteSpace: 'nowrap',
                        textAlign: 'center',
                        background: isSelected 
                          ? 'rgba(212,175,55,0.08)' 
                          : isEquipped 
                            ? 'rgba(212,175,55,0.02)' 
                            : 'rgba(255,255,255,0.01)',
                        border: isSelected 
                          ? '1px solid var(--gold)' 
                          : isEquipped 
                            ? '1px dashed rgba(212, 175, 55, 0.6)' 
                            : '1px solid rgba(255,255,255,0.08)',
                        boxShadow: isSelected 
                          ? '0 0 10px rgba(212,175,55,0.3)' 
                          : isEquipped 
                            ? '0 0 8px rgba(212,175,55,0.15)' 
                            : 'none',
                        opacity: remainingCount <= 0 ? 0.4 : 1,
                        cursor: remainingCount <= 0 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <div style={{ 
                        color: rColor.color, 
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px'
                      }}>
                        {isEquipped && <span style={{ color: 'var(--gold)' }}>⭐</span>}
                        {data.name}
                        <span style={{ fontSize: '0.75rem', opacity: 0.8, marginLeft: '4px' }}>x{remainingCount}</span>
                      </div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}>
                        <span>{data.rarity}</span>
                        {isEquipped && (
                          <span style={{ 
                            fontSize: '0.6rem', 
                            background: 'rgba(212, 175, 55, 0.2)', 
                            color: 'var(--gold)', 
                            padding: '0 2px', 
                            borderRadius: '2px',
                            border: '1px solid rgba(212, 175, 55, 0.4)'
                          }}>
                            本命{hasWashedAttrs ? '·注' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {refineSubId && refineSubId === player.equippedTreasure && (
              <div style={{
                marginTop: '0.5rem',
                marginBottom: '1.5rem',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                padding: '0.6rem 1rem',
                textAlign: 'left'
              }}>
                <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ⚠️ 警告：熔毁本命宝具风险
                </div>
                <p style={{ color: '#fca5a5', fontSize: '0.75rem', margin: '0', lineHeight: '1.4' }}>
                  阁下选择将当前装备的【本命宝具】作为副胚进行消耗！此操作将永久熔毁该宝具，请务必确认是否要将其作为材料消耗！
                </p>
              </div>
            )}

            {/* 步骤 3：选择属性材料与注入量 */}
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--gold)' }}>
              3. 选择注入的属性及材料投入 (金木水火土)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
              {Object.entries(五行名称).map(([key, name]) => {
                const isSelected = refineMaterialType === key;
                return (
                  <button
                    key={key}
                    onClick={() => setRefineMaterialType(key)}
                    style={{
                      padding: '0.5rem',
                      background: isSelected ? 'rgba(212,175,55,0.15)' : 'transparent',
                      border: isSelected ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.08)',
                      color: isSelected ? 'var(--gold)' : 'var(--text-muted)',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <img 
                      src={elementIcons[key]} 
                      alt={name} 
                      style={{ 
                        width: '28px', 
                        height: '28px', 
                        objectFit: 'contain', 
                        mixBlendMode: 'screen',
                        filter: isSelected ? 'drop-shadow(0 0 4px rgba(212,175,55,0.6))' : 'grayscale(0.3)'
                      }} 
                    />
                    <div>{name}</div>
                    <div style={{ fontSize: '0.65rem', scale: 0.9 }}>持有: {materials[key] || 0}</div>
                  </button>
                );
              })}
            </div>

            {/* 材料数注入等级 */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>属性投入数:</span>
              {[5, 10, 20].map(cnt => (
                <button
                  key={cnt}
                  onClick={() => setRefineMaterialCount(cnt)}
                  style={{
                    padding: '0.4rem 1rem',
                    background: refineMaterialCount === cnt ? 'var(--gold)' : 'transparent',
                    color: refineMaterialCount === cnt ? '#110505' : 'var(--gold)',
                    border: '1px solid var(--gold)',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  {cnt}个 ({cnt === 5 ? 'I阶器灵' : cnt === 10 ? 'II阶器灵' : 'III阶至尊'})
                </button>
              ))}
            </div>
          </div>

          {/* 右侧：洗炼法阵 */}
          <div style={{
            borderLeft: '1px solid rgba(255,255,255,0.05)',
            paddingLeft: '1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div className="alchemy-furnace-core" style={{ width: '160px', height: '160px', border: 'none', background: 'none' }}>
                {cleanFurnacePic ? (
                  <img 
                    src={cleanFurnacePic} 
                    alt="太上乾坤炉" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      filter: isRefining 
                        ? 'drop-shadow(0 0 25px rgba(59, 130, 246, 0.8)) brightness(1.2)' 
                        : 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.4))',
                      animation: isRefining ? 'furnaceShake 0.15s infinite alternate' : 'furnaceFloat 4s ease-in-out infinite',
                      position: 'absolute',
                      zIndex: 0
                    }}
                  />
                ) : (
                  <Sparkles size={48} style={{ color: isRefining ? 'cyan' : 'var(--gold)', filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.4))' }} />
                )}
                <div style={{ color: 'var(--gold)', textAlign: 'center', zIndex: 1, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '10px' }}>
                    器灵熔接阵
                  </div>
                </div>
              </div>

              {/* 预期收益 */}
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '0.4rem' }}>器灵附体状态</div>
                <div>主宝具: <span style={{ color: refineMainId ? '#10b981' : 'var(--text-muted)' }}>
                  {refineMainId ? getTreasureData(refineMainId)?.name : '未放入'}
                </span></div>
                <div>副胚子: <span style={{ color: refineSubId ? '#ef4444' : 'var(--text-muted)' }}>
                  {refineSubId ? getTreasureData(refineSubId)?.name : '未放入'}
                </span></div>
                <div>预期器灵: <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>
                  {refineMaterialCount === 5 ? 'I 阶 (+5~10 基础属性, 概率防御/闪避)' :
                   refineMaterialCount === 10 ? 'II 阶 (+12~20 基础属性, 概率击晕/中毒)' :
                   'III 阶 (+25~40 基础属性, 100% 极品词条或破魔)'}
                </span></div>
              </div>

              {/* 消耗清单 */}
              <div style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '0.8rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                textAlign: 'left',
                border: '1px solid rgba(255,255,255,0.03)',
                marginBottom: '1rem'
              }}>
                <div style={{ fontWeight: 'bold', color: 'var(--gold)', marginBottom: '0.4rem' }}>消耗清单:</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>武道精魂 (25点):</span>
                  <span style={{ color: essence >= 25 ? '#10b981' : '#ef4444' }}>{essence} / 25</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                  <span>异变玄晶 (2个):</span>
                  <span style={{ color: materials.anomalyCrystal >= 2 ? '#10b981' : '#ef4444' }}>{materials.anomalyCrystal} / 2</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                  <span>怨魂余烬 (2个):</span>
                  <span style={{ color: materials.soulAshes >= 2 ? '#10b981' : '#ef4444' }}>{materials.soulAshes} / 2</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                  <span>{五行名称[refineMaterialType]} ({refineMaterialCount}个):</span>
                  <span style={{ color: (materials[refineMaterialType] || 0) >= refineMaterialCount ? '#10b981' : '#ef4444' }}>
                    {materials[refineMaterialType] || 0} / {refineMaterialCount}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleRefine}
              disabled={!refineValidity.valid || isRefining}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.8rem',
                background: refineValidity.valid ? 'var(--gold)' : 'rgba(255,255,255,0.02)',
                color: refineValidity.valid ? '#110505' : 'rgba(255,255,255,0.2)',
                border: '1px solid var(--gold)',
                cursor: refineValidity.valid ? 'pointer' : 'not-allowed',
                boxShadow: refineValidity.valid ? '0 0 15px rgba(249, 115, 22, 0.3)' : 'none'
              }}
            >
              {isRefining ? '器灵注入中...' : (refineValidity.valid ? '注入器灵' : `无法洗炼: ${refineValidity.reason}`)}
            </button>
          </div>
        </div>
      )}

      {/* ==================================== 重铸结果弹窗 ==================================== */}
      {synthResult && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 99999, padding: '1rem',
          backdropFilter: 'blur(8px)'
        }}>
          <div className="glass-panel animate-scale-up" style={{
            maxWidth: '400px', width: '100%', padding: '2.5rem', textAlign: 'center',
            border: '2px solid var(--gold)', boxShadow: '0 0 40px rgba(212,175,55,0.6)',
            position: 'relative'
          }}>
            <div className="corner-decoration top-left" />
            <div className="corner-decoration top-right" />
            <div className="corner-decoration bottom-left" />
            <div className="corner-decoration bottom-right" />

            <div style={{ marginBottom: '1.5rem', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '110px' }}>
              {/* 酷炫金色魔法阵 */}
              <div style={{
                position: 'absolute',
                width: '150px',
                height: '150px',
                background: 'radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, transparent 70%)',
                borderRadius: '50%',
                zIndex: 0,
                pointerEvents: 'none'
              }} />
              <div style={{
                position: 'absolute',
                width: '120px',
                height: '120px',
                border: '2px dashed var(--gold)',
                borderRadius: '50%',
                zIndex: 0,
                pointerEvents: 'none',
                animation: 'spin 15s linear infinite',
                opacity: 0.4
              }} />
              <div style={{
                position: 'absolute',
                width: '90px',
                height: '90px',
                border: '1px dashed rgba(212, 175, 55, 0.6)',
                borderRadius: '50%',
                zIndex: 0,
                pointerEvents: 'none',
                animation: 'spin 8s linear infinite reverse',
                opacity: 0.5
              }} />
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Flame size={72} color="var(--gold)" style={{ filter: 'drop-shadow(0 0 12px rgba(212,175,55,0.8))', animation: 'tokenAlienFloat 3s infinite ease-in-out' }} />
                <div style={{ position: 'absolute', color: '#110505', fontWeight: 'bold' }}>
                  <Zap size={28} style={{ color: '#fff', filter: 'drop-shadow(0 0 5px orange)' }} />
                </div>
              </div>
            </div>

            <h3 style={{ fontFamily: '"Ma Shan Zheng", cursive', fontSize: '1.8rem', color: 'var(--gold)', marginBottom: '0.5rem' }}>
              {synthResult.isSuccess ? '炼火化玉 升阶成功！' : '烈焰淬体 熔解重铸'}
            </h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              {synthResult.isSuccess ? '八卦炉神火大盛，宝具打破桎梏，成功进阶！' : '火候稍欠，原有宝具在高温下熔解重组，凝聚出全新宝具。'}
            </div>

            {/* 新获得宝具卡片 */}
            {(() => {
              const data = getTreasureData(synthResult.newItemId);
              if (!data) return null;
              const rColor = rarityColors[data.rarity] || { color: '#fff', border: 'transparent' };
              return (
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${rColor.color}`,
                  padding: '1.2rem',
                  borderRadius: '8px',
                  marginBottom: '2rem',
                  boxShadow: `0 0 15px ${rColor.border}`
                }}>
                  <div style={{ color: rColor.color, fontWeight: 'bold', fontSize: '1.3rem', marginBottom: '0.3rem' }}>
                    {data.name}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: rColor.border,
                    color: rColor.color,
                    display: 'inline-block',
                    marginBottom: '0.8rem'
                  }}>
                    {data.rarity}品质
                  </div>
                  <div style={{ color: '#fff', fontSize: '0.85rem', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                    {data.desc}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    基础附加: {Object.entries(data.attrs).map(([k, v]) => `${k === 'str' ? '力量' : k === 'con' ? '体质' : k === 'agi' ? '敏捷' : k === 'int' ? '智慧' : '幸运'} +${v}`).join(', ')}
                  </div>
                </div>
              );
            })()}

            <button
              onClick={() => setSynthResult(null)}
              className="btn-primary"
              style={{ padding: '0.7rem 2rem', fontSize: '1.1rem', width: '100%' }}
            >
              收入储物袋
            </button>
          </div>
        </div>
      )}

      {/* ==================================== 洗炼结果弹窗 ==================================== */}
      {refineResult && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 99999, padding: '1rem',
          backdropFilter: 'blur(8px)'
        }}>
          <div className="glass-panel animate-scale-up" style={{
            maxWidth: '400px', width: '100%', padding: '2.5rem', textAlign: 'center',
            border: '2px solid #3b82f6', boxShadow: '0 0 40px rgba(59,130,246,0.6)',
            position: 'relative'
          }}>
            <div className="corner-decoration top-left" />
            <div className="corner-decoration top-right" />
            <div className="corner-decoration bottom-left" />
            <div className="corner-decoration bottom-right" />

            <div style={{ marginBottom: '1.5rem', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '110px' }}>
              {/* 酷炫蓝色五行元气法阵 */}
              <div style={{
                position: 'absolute',
                width: '150px',
                height: '150px',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)',
                borderRadius: '50%',
                zIndex: 0,
                pointerEvents: 'none'
              }} />
              <div style={{
                position: 'absolute',
                width: '120px',
                height: '120px',
                border: '2px dashed #3b82f6',
                borderRadius: '50%',
                zIndex: 0,
                pointerEvents: 'none',
                animation: 'spin 15s linear infinite',
                opacity: 0.4
              }} />
              <div style={{
                position: 'absolute',
                width: '90px',
                height: '90px',
                border: '1px dashed rgba(59, 130, 246, 0.6)',
                borderRadius: '50%',
                zIndex: 0,
                pointerEvents: 'none',
                animation: 'spin 8s linear infinite reverse',
                opacity: 0.5
              }} />
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Sparkles size={72} color="#3b82f6" style={{ filter: 'drop-shadow(0 0 12px rgba(59,130,246,0.8))', animation: 'tokenAlienFloat 3.5s infinite ease-in-out' }} />
              </div>
            </div>

            <h3 style={{ fontFamily: '"Ma Shan Zheng", cursive', fontSize: '1.8rem', color: '#3b82f6', marginBottom: '0.5rem' }}>
              器灵降世 注灵成功！
            </h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              史诗副胚熔为器灵，五行元气已完美注入，宝具获得了神异加持！
            </div>

            {/* 新的器灵属性 */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(59,130,246,0.3)',
              padding: '1.2rem',
              borderRadius: '8px',
              textAlign: 'left',
              fontSize: '0.85rem',
              marginBottom: '2rem'
            }}>
              <div style={{ color: '#3b82f6', fontWeight: 'bold', borderBottom: '1px solid rgba(59,130,246,0.1)', paddingBottom: '0.3rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                当前已注入的器灵属性
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', color: '#fff' }}>
                {refineResult.newAttrs.extraStr > 0 && <div>额外力量: <span style={{ color: '#10b981', fontWeight: 'bold' }}>+{refineResult.newAttrs.extraStr}</span></div>}
                {refineResult.newAttrs.extraCon > 0 && <div>额外体质: <span style={{ color: '#10b981', fontWeight: 'bold' }}>+{refineResult.newAttrs.extraCon}</span></div>}
                {refineResult.newAttrs.extraAgi > 0 && <div>额外敏捷: <span style={{ color: '#10b981', fontWeight: 'bold' }}>+{refineResult.newAttrs.extraAgi}</span></div>}
                {refineResult.newAttrs.extraInt > 0 && <div>额外智慧: <span style={{ color: '#10b981', fontWeight: 'bold' }}>+{refineResult.newAttrs.extraInt}</span></div>}
                {refineResult.newAttrs.extraLuk > 0 && <div>额外幸运: <span style={{ color: '#10b981', fontWeight: 'bold' }}>+{refineResult.newAttrs.extraLuk}</span></div>}
                {refineResult.newAttrs.extraDef > 0 && <div>额外防御: <span style={{ color: '#10b981', fontWeight: 'bold' }}>+{refineResult.newAttrs.extraDef}</span></div>}
                {refineResult.newAttrs.extraDodge > 0 && <div>额外闪避: <span style={{ color: '#10b981', fontWeight: 'bold' }}>+{refineResult.newAttrs.extraDodge}</span></div>}
                {refineResult.newAttrs.stunRate > 0 && <div>击晕概率: <span style={{ color: '#10b981', fontWeight: 'bold' }}>+{refineResult.newAttrs.stunRate}%</span></div>}
                {refineResult.newAttrs.poisonRate > 0 && <div>剧毒附带: <span style={{ color: '#10b981', fontWeight: 'bold' }}>+{refineResult.newAttrs.poisonRate}%</span></div>}
                {refineResult.newAttrs.bossDamageBoost > 0 && <div>Boss特攻: <span style={{ color: '#f97316', fontWeight: 'bold' }}>+{refineResult.newAttrs.bossDamageBoost}% (无视免伤)</span></div>}
              </div>
            </div>

            <button
              onClick={() => setRefineResult(null)}
              className="btn-primary"
              style={{ padding: '0.7rem 2rem', fontSize: '1.1rem', width: '100%', background: '#3b82f6', border: '1px solid #3b82f6' }}
            >
              善哉善哉
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

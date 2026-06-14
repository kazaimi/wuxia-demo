import React, { useState, useEffect, useRef } from 'react';
import { useGameStore, TREASURES_DB, TREASURE_ATTR_MAP } from '../store/gameState';
import { generateEventDeck } from '../data/realmEvents';
import { Map, DoorOpen, Swords } from 'lucide-react';
import EventIllustration from './EventIllustration';
import { useCleanImage } from '../utils/imageProcess';
import { SoundManager } from '../utils/SoundManager';
import EnhancedWarriorAvatar from './EnhancedWarriorAvatar';
import BattleEffects, { DamageFloatNumber } from './BattleEffects';
import { TreasureIcon } from './WuxiaIcon';

export default function SecretRealm() {
  const player = useGameStore(state => state.player);
  const useSecretRealmAttempt = useGameStore(state => state.useSecretRealmAttempt);
  const gainTreasure = useGameStore(state => state.gainTreasure);
  const addDailyDebuff = useGameStore(state => state.addDailyDebuff);
  const addActivity = useGameStore(state => state.addActivity);
  const addSilver = useGameStore(state => state.addSilver);
  const gainEssence = useGameStore(state => state.gainEssence);
  const gainMaterial = useGameStore(state => state.gainMaterial);
  const fetchRealmGhosts = useGameStore(state => state.fetchRealmGhosts);
  const deployGhostRemnant = useGameStore(state => state.deployGhostRemnant);
  const ghostWinDividend = useGameStore(state => state.ghostWinDividend);
  const defeatRealmGhost = useGameStore(state => state.defeatRealmGhost);
  const realmGhosts = useGameStore(state => state.realmGhosts);

  const [state, setState] = useState('idle'); // idle, exploring, result
  const [activeGhostFight, setActiveGhostFight] = useState(null);
  const [ghostFightLogs, setGhostFightLogs] = useState([]);
  const [ghostFightState, setGhostFightState] = useState('idle'); // idle, fighting, won, lost
  const [hasDeployedGhost, setHasDeployedGhost] = useState(false);
  const ghostFightIntervalRef = useRef(null);

  // 历练结算状态
  const [settlementInfo, setSettlementInfo] = useState({
     isSuccess: false,
     isClear: false,
     depth: 0,
     karma: 0,
     rewardTreasure: null,
     rewardSilver: 0,
     silverDetail: '',
     debuff: null,
     description: ''
  });

  const renderSettlement = () => {
    const isSuccess = settlementInfo.isSuccess;
    const isClear = settlementInfo.isClear;
    const depthReached = settlementInfo.depth;
    const karmaAccumulated = settlementInfo.karma;
    const treasure = settlementInfo.rewardTreasure;
    const silver = settlementInfo.rewardSilver;
    const silverDetail = settlementInfo.silverDetail;
    const debuff = settlementInfo.debuff;
    const desc = settlementInfo.description;

    const rarityColor = {
      '普通': '#6b7280',
      '优秀': '#22c55e',
      '稀有': '#3b82f6',
      '史诗': '#f97316',
      '传说': '#a855f7',
      '神话': '#ffd700'
    }[treasure?.rarity || '普通'] || 'var(--gold)';

    return (
      <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', gap: '1.2rem', padding: '0.5rem 1rem 1.5rem' }}>
        <style>{`
          @keyframes borderGlow {
            0%, 100% { border-color: rgba(212, 175, 55, 0.25); box-shadow: 0 0 12px rgba(212, 175, 55, 0.1); }
            50% { border-color: rgba(212, 175, 55, 0.6); box-shadow: 0 0 20px rgba(212, 175, 55, 0.25); }
          }
          @keyframes borderGlowPurple {
            0%, 100% { border-color: rgba(192, 132, 252, 0.25); box-shadow: 0 0 12px rgba(192, 132, 252, 0.1); }
            50% { border-color: rgba(192, 132, 252, 0.7); box-shadow: 0 0 20px rgba(192, 132, 252, 0.3); }
          }
          @keyframes pulseGold {
            0%, 100% { transform: scale(1); filter: brightness(1); }
            50% { transform: scale(1.02); filter: brightness(1.12); }
          }
          .settlement-card-glow {
            border: 1px solid rgba(212, 175, 55, 0.3);
            animation: borderGlow 4s infinite ease-in-out;
          }
          .settlement-badge {
            background: rgba(0, 0, 0, 0.65);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 50%;
            width: 84px;
            height: 84px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
          }
        `}</style>

        {/* 顶部大横幅 */}
        <div style={{
          textAlign: 'center',
          padding: '1.2rem',
          borderRadius: '10px',
          background: isClear
            ? 'linear-gradient(180deg, rgba(30, 20, 45, 0.96), rgba(15, 10, 25, 0.98))'
            : isSuccess 
              ? 'linear-gradient(180deg, rgba(20, 15, 5, 0.95), rgba(10, 5, 2, 0.98))'
              : 'linear-gradient(180deg, rgba(20, 5, 5, 0.95), rgba(10, 2, 2, 0.98))',
          border: isClear
            ? '1px solid rgba(192, 132, 252, 0.5)'
            : isSuccess 
              ? '1px solid rgba(212, 175, 55, 0.4)' 
              : '1px solid rgba(239, 68, 68, 0.35)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isClear
            ? '0 0 25px rgba(192, 132, 252, 0.25)'
            : isSuccess 
              ? '0 0 15px rgba(212, 175, 55, 0.12)' 
              : '0 0 15px rgba(239, 68, 68, 0.12)'
        }}>
          {/* 古风花纹背景 */}
          <div style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.04,
            backgroundImage: `radial-gradient(circle, ${isClear ? '#c084fc' : '#ffd700'} 1px, transparent 1px)`,
            backgroundSize: '12px 12px',
            pointerEvents: 'none'
          }} />

          <h3 style={{
            fontSize: '1.8rem',
            color: isClear ? '#c084fc' : isSuccess ? 'var(--gold)' : '#ef4444',
            fontFamily: '"Ma Shan Zheng", cursive',
            letterSpacing: '3px',
            margin: '0 0 0.4rem 0',
            textShadow: isClear
              ? '0 0 12px rgba(192,132,252,0.6)'
              : isSuccess 
                ? '0 0 8px rgba(212,175,55,0.45)' 
                : '0 0 8px rgba(239,68,68,0.45)',
          }}>
            {isClear ? '琅 嬛 福 地 · 历 练 圆 满' : isSuccess ? '琅 嬛 福 地 · 历 练 大 捷' : '琅 嬛 福 地 · 探 险 折 戟'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, fontStyle: 'italic' }}>
            {isClear 
              ? '登临绝顶，功德圆满。恭喜大侠成功通关福地！' 
              : isSuccess 
                ? '见好就收，功成身退。大侠此番收获满满！' 
                : '探险折戟，遭遇不祥。留得青山在，不怕没柴烧！'}
          </p>
        </div>

        {/* 通关专属精美水墨原画插图 */}
        {isClear && (
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '460px',
            margin: '0.5rem auto 0.8rem',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '2px solid rgba(192, 132, 252, 0.5)',
            boxShadow: '0 0 25px rgba(192, 132, 252, 0.35)',
            animation: 'borderGlowPurple 4s infinite ease-in-out'
          }}>
            <img 
              src="/scenes/realm_clear.png" 
              alt="历练圆满" 
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                filter: 'contrast(1.02) brightness(0.98)'
              }} 
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(0deg, rgba(10,5,20,0.9) 20%, transparent)',
              padding: '10px 14px',
              textAlign: 'center',
              borderTop: '1px solid rgba(192, 132, 252, 0.15)'
            }}>
              <span style={{
                color: '#c084fc',
                fontFamily: '"Ma Shan Zheng", cursive',
                fontSize: '1.15rem',
                letterSpacing: '3px',
                textShadow: '0 0 8px rgba(0,0,0,0.9)'
              }}>
                「 登临绝顶极目望，武道造化纳乾坤 」
              </span>
            </div>
          </div>
        )}

        {/* 成绩徽章区域 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', margin: '0.2rem 0' }}>
          {/* 探索深度 */}
          <div className="settlement-badge" style={{ borderColor: 'var(--gold)', boxShadow: '0 0 8px rgba(212, 175, 55, 0.15)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{isClear ? '通关层数' : '探索深度'}</span>
            <span style={{ fontSize: '1.4rem', color: 'var(--gold)', fontWeight: 'bold', fontFamily: '"Outfit", sans-serif', marginTop: '1px' }}>{depthReached} <span style={{ fontSize: '0.8rem' }}>层</span></span>
          </div>

          {/* 因果业力 */}
          <div className="settlement-badge" style={{ 
            borderColor: karmaAccumulated > 0 ? 'var(--jade)' : karmaAccumulated < 0 ? 'var(--crimson)' : 'rgba(255, 255, 255, 0.15)',
            boxShadow: karmaAccumulated !== 0 ? `0 0 8px ${karmaAccumulated > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}` : 'none'
          }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>因果业力</span>
            <span style={{ 
              fontSize: '1.4rem', 
              color: karmaAccumulated > 0 ? 'var(--jade)' : karmaAccumulated < 0 ? 'var(--crimson)' : 'var(--text-main)', 
              fontWeight: 'bold', 
              fontFamily: '"Outfit", sans-serif', 
              marginTop: '1px' 
            }}>
              {karmaAccumulated > 0 ? `+${karmaAccumulated}` : karmaAccumulated}
            </span>
          </div>
        </div>

        {/* 战利品展示 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'center' }}>
          {isSuccess ? (
            <div className="settlement-card-glow" style={{
              width: '100%',
              maxWidth: '320px',
              background: 'rgba(12, 12, 20, 0.9)',
              borderRadius: '10px',
              padding: '1.2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              position: 'relative'
            }}>
              {/* 装饰边角 */}
              <div style={{ position: 'absolute', top: '6px', left: '6px', width: '8px', height: '8px', borderLeft: '2px solid rgba(212,175,55,0.35)', borderTop: '2px solid rgba(212,175,55,0.35)' }} />
              <div style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', borderRight: '2px solid rgba(212,175,55,0.35)', borderTop: '2px solid rgba(212,175,55,0.35)' }} />
              <div style={{ position: 'absolute', bottom: '6px', left: '6px', width: '8px', height: '8px', borderLeft: '2px solid rgba(212,175,55,0.35)', borderBottom: '2px solid rgba(212,175,55,0.35)' }} />
              <div style={{ position: 'absolute', bottom: '6px', right: '6px', width: '8px', height: '8px', borderRight: '2px solid rgba(212,175,55,0.35)', borderBottom: '2px solid rgba(212,175,55,0.35)' }} />

              {treasure ? (
                <>
                  {/* 稀有度角标 */}
                  <span style={{
                    padding: '1px 6px',
                    borderRadius: '3px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    background: 'rgba(0,0,0,0.6)',
                    color: rarityColor,
                    border: `1px solid ${rarityColor}44`,
                    marginBottom: '0.6rem'
                  }}>
                    {treasure.rarity} 宝物
                  </span>

                  {/* 宝物大图标 */}
                  <div style={{
                    animation: 'pulseGold 4s infinite ease-in-out',
                    filter: `drop-shadow(0 0 8px ${rarityColor}35)`,
                    marginBottom: '0.4rem'
                  }}>
                    <TreasureIcon id={treasure.id} size={64} />
                  </div>

                  {/* 宝物名 */}
                  <h4 style={{
                    fontSize: '1.35rem',
                    color: rarityColor,
                    fontFamily: '"Ma Shan Zheng", cursive',
                    margin: '0.2rem 0',
                    letterSpacing: '1px'
                  }}>
                    {treasure.name}
                  </h4>

                  {/* 属性列表 */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '10px',
                    margin: '0.6rem 0',
                    background: 'rgba(0,0,0,0.45)',
                    padding: '4px 12px',
                    borderRadius: '5px',
                    border: '1px solid rgba(255, 255, 255, 0.03)'
                  }}>
                    {Object.entries(treasure.attrs).map(([key, val]) => {
                      const isPercent = ['dodge', 'crit'].includes(key);
                      return (
                        <span key={key} style={{ fontSize: '0.8rem', color: '#ccc' }}>
                          {TREASURE_ATTR_MAP[key] || key} <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>+{val}{isPercent ? '%' : ''}</span>
                        </span>
                      );
                    })}
                  </div>

                  {/* 效果描述 */}
                  <p style={{
                    color: 'var(--gold)',
                    fontSize: '0.8rem',
                    margin: '0',
                    lineHeight: '1.4',
                    background: 'rgba(212, 175, 55, 0.04)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    borderLeft: '2px solid var(--gold)',
                    maxWidth: '260px'
                  }}>
                    {treasure.desc}
                  </p>
                </>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1.5rem 1rem' }}>
                  🍃 此行尚浅，未结造化之果。<br/>
                  <span style={{ fontSize: '0.7rem', display: 'block', marginTop: '0.4rem' }}>(需探入 5 层以上方可获得宝具机缘)</span>
                </div>
              )}
            </div>
          ) : (
            /* 失败卡片 */
            <div style={{
              width: '100%',
              maxWidth: '320px',
              background: 'rgba(22, 8, 8, 0.9)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              padding: '1.2rem',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.12)',
              position: 'relative'
            }}>
              <span style={{
                color: '#f87171',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                fontFamily: '"Ma Shan Zheng", cursive',
                letterSpacing: '1px',
                display: 'block',
                marginBottom: '0.4rem'
              }}>
                ⚠️ 恶兆缠身
              </span>
              <p style={{ color: '#ccc', fontSize: '0.8rem', lineHeight: '1.4', margin: '0 0 0.6rem 0' }}>
                秘境折戟，负伤折返，你受到了不祥的恶运诅咒：
              </p>
              <div style={{
                background: 'rgba(239, 68, 68, 0.06)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                padding: '6px 12px',
                borderRadius: '5px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                display: 'inline-block',
                marginBottom: '0.4rem'
              }}>
                【{debuff || '怨魂入体'}】
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', margin: 0 }}>
                （将在明日拂晓前大幅衰减大侠的运势）
              </p>
            </div>
          )}

          {/* 银两奖励 */}
          {silver > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '6px',
              padding: '6px 16px',
              fontSize: '0.85rem',
              color: '#fff',
            }}>
              <span style={{ fontSize: '1.1rem' }}>🪙</span>
              <span>
                获得银两: <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>{silver}</span> 两 
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '6px' }}>({silverDetail})</span>
              </span>
            </div>
          )}
        </div>

        {/* 结算详情文字描述 */}
        <p style={{
          textAlign: 'center',
          color: '#aaa',
          fontSize: '0.8rem',
          lineHeight: '1.5',
          maxWidth: '460px',
          margin: '0.2rem auto 0',
          background: 'rgba(255, 255, 255, 0.01)',
          padding: '8px 12px',
          borderRadius: '6px',
          border: '1px solid rgba(255, 255, 255, 0.02)'
        }}>
          {desc?.replace(/\n/g, ' ')}
        </p>

        {/* 折叠战报日志 */}
        <details style={{ width: '100%', maxWidth: '460px', margin: '0 auto' }}>
          <summary style={{
            textAlign: 'center',
            color: 'var(--gold)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            opacity: 0.75,
            userSelect: 'none',
            outline: 'none',
            padding: '4px 0'
          }}>
            📜 展开探索卷轴 (查看历练明细日志)
          </summary>
          <div style={{
            marginTop: '6px',
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.03)',
            borderRadius: '5px',
            padding: '10px',
            maxHeight: '120px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            color: '#999',
            lineHeight: '1.4',
            textAlign: 'left'
          }}>
            {logs.map((log, i) => (
              <div key={i} style={{ marginBottom: '4px' }}>
                {log}
              </div>
            ))}
          </div>
        </details>

        {/* 底部结算动作 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
          {!hasDeployedGhost && player.essence >= 20 && depthReached > 0 && (
            <button 
              className="btn-primary" 
              style={{
                padding: '0.7rem 2rem',
                background: 'linear-gradient(135deg, #7f1d1d, #991b1b)',
                color: '#fff',
                border: '1px solid #ef4444',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                fontFamily: '"Ma Shan Zheng", cursive',
                letterSpacing: '1px',
                boxShadow: '0 0 10px rgba(239, 68, 68, 0.25)',
                transition: 'transform 0.2s'
              }}
              onClick={() => {
                 SoundManager.play('sfx_click');
                 const msg = prompt(`剥离神魂将消耗 20 点精魂在此第 ${depthReached} 层设伏怨灵。\n后来者挑战失败时，你将获得 2 银两分红。\n请输入你想给后来者留下的执念遗言（限20字）：`);
                 if (msg !== null) {
                    deployGhostRemnant(depthReached, msg || "后辈止步，此路不通！");
                    setHasDeployedGhost(true);
                 }
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              👹 消耗20精魂在第 {depthReached} 层设伏怨灵
            </button>
          )}

          <button 
            className="btn-primary" 
            style={{
              padding: '0.8rem 3rem',
              background: 'linear-gradient(135deg, #c084fc, #7c3aed)',
              color: '#fff',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: 'bold',
              fontFamily: '"Ma Shan Zheng", cursive',
              letterSpacing: '2px',
              boxShadow: '0 0 15px rgba(192, 132, 252, 0.25)',
              transition: 'transform 0.2s'
            }} 
            onClick={() => {
              SoundManager.play('sfx_click');
              SoundManager.playMusic('bgm_menu');
              setState('idle');
              setLogs([]);
              fetchRealmGhosts(); // 离开结算时自动同步最新的怨灵数据
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            离开福地
          </button>
        </div>
      </div>
    );
  };

  // 战斗特效及数值状态
  const [effects, setEffects] = useState([]);
  const [damageNumbers, setDamageNumbers] = useState([]);
  const [currentBattleState, setCurrentBattleState] = useState({});
  const [combatHpUser, setCombatHpUser] = useState(0);
  const [combatHpGhost, setCombatHpGhost] = useState(0);
  const [combatMaxHpUser, setCombatMaxHpUser] = useState(0);
  const [combatMaxHpGhost, setCombatMaxHpGhost] = useState(0);
  const [combatTurn, setCombatTurn] = useState(1);

  const addEffect = (type, position, intensity = 1, skillName = '', skillId = '') => {
    const id = Date.now() + Math.random();
    setEffects(prev => [...prev, { id, type, position, intensity, skillName, skillId }]);
  };
  const addDamageNumber = (damage, position, isHeal = false) => {
    const id = Date.now() + Math.random();
    setDamageNumbers(prev => [...prev, { id, damage, position, isHeal }]);
  };
  const removeEffect = (id) => {
    setEffects(prev => prev.filter(e => e.id !== id));
  };
  const removeDamageNumber = (id) => {
    setDamageNumbers(prev => prev.filter(d => d.id !== id));
  };

  useEffect(() => {
    fetchRealmGhosts();
  }, [fetchRealmGhosts]);

  useEffect(() => {
     return () => {
        if (ghostFightIntervalRef.current) {
           clearInterval(ghostFightIntervalRef.current);
        }
     };
  }, []);

  const startGhostFight = (ghost) => {
     setActiveGhostFight(ghost);
     setGhostFightLogs([
        `====== 宿命对决：神魂怨灵 ${ghost.creatorName} ======`,
        `怨灵残留的执念言道：“${ghost.message}”`,
        `对决开战！`
     ]);
     setGhostFightState('fighting');
     SoundManager.play('sfx_task_accept');

     const getTreasure = (id) => TREASURES_DB?.find(t => t.id === id);
     const playerTreasure = getTreasure(player.equippedTreasure);
     const ghostTreasure = getTreasure(ghost.equippedTreasure);
     const userAttrs = player.equippedTreasureAttrs || {};
     const ghostAttrs = ghost.equippedTreasureAttrs || {};

     const ghostLvlOriginal = ghost.level || 1;
     const ghostLvl = player.level;
     const scaleFactor = (ghostLvlOriginal > 0) ? (player.level / ghostLvlOriginal) : 1;

     const ghostHasAttributes = ghost.attributes && Object.keys(ghost.attributes).length > 0 && Object.values(ghost.attributes).reduce((sum, v) => sum + (parseInt(v, 10) || 0), 0) >= ghostLvlOriginal;
     const baseGhostAttrs = ghostHasAttributes ? ghost.attributes : {
        con: Math.floor(ghostLvlOriginal * 0.6) + 2,
        str: Math.floor(ghostLvlOriginal * 0.8) + 3,
        int: Math.floor(ghostLvlOriginal * 0.6) + 2,
        agi: Math.floor(ghostLvlOriginal * 0.7) + 2,
        luk: Math.floor(ghostLvlOriginal * 0.3) + 1
     };

     const standardTotal = 50 + 10 + (player.level - 1) * 3;
     const ghostTotalOriginal = Object.values(baseGhostAttrs).reduce((sum, v) => sum + (parseInt(v, 10) || 0), 0) || 50;

     const resolvedGhostAttrs = {
        con: Math.max(6, Math.round(((baseGhostAttrs.con || 10) / ghostTotalOriginal) * standardTotal)),
        str: Math.max(6, Math.round(((baseGhostAttrs.str || 10) / ghostTotalOriginal) * standardTotal)),
        int: Math.max(6, Math.round(((baseGhostAttrs.int || 10) / ghostTotalOriginal) * standardTotal)),
        agi: Math.max(6, Math.round(((baseGhostAttrs.agi || 10) / ghostTotalOriginal) * standardTotal)),
        luk: Math.max(6, Math.round(((baseGhostAttrs.luk || 10) / ghostTotalOriginal) * standardTotal))
     };

     const scaleAttrs = (attrs) => {
        if (!attrs) return {};
        const factor = scaleFactor < 1 ? scaleFactor : 1;
        return {
           hp: Math.round((attrs.hp || 0) * factor),
           atk: Math.round((attrs.atk || 0) * factor),
           def: Math.round((attrs.def || 0) * factor),
           dodge: attrs.dodge || 0,
           crit: attrs.crit || 0
        };
     };
     
     const scaleExtraAttrs = (attrs) => {
        if (!attrs) return {};
        const factor = scaleFactor < 1 ? scaleFactor : 1;
        return {
           extraHp: Math.round((attrs.extraHp || 0) * factor),
           extraAtk: Math.round((attrs.extraAtk || 0) * factor),
           extraDef: Math.round((attrs.extraDef || 0) * factor),
           extraDodge: attrs.extraDodge || 0,
           extraCrit: attrs.extraCrit || 0
        };
     };

     const scaledGhostTreasureAttrs = scaleAttrs(ghostTreasure?.attrs);
     const scaledGhostTreasureAttrsExtra = scaleExtraAttrs(ghost.equippedTreasureAttrs);

     let turn = 1;
     
     const maxHpUser = player.maxHp + (playerTreasure?.attrs?.hp || 0) + (userAttrs.extraHp || 0);
     let curHpUser = Math.min(maxHpUser, (player.hp || player.maxHp) + (playerTreasure?.attrs?.hp || 0) + (userAttrs.extraHp || 0));
     if (isNaN(curHpUser) || curHpUser <= 0) {
        curHpUser = maxHpUser || 200;
     }

     const calculateMaxHp = (level, con) => Math.min(7000, 100 + level * 15 + (con || 0) * 10);
     const maxHpGhost = calculateMaxHp(ghostLvl, resolvedGhostAttrs.con || 0) + (scaledGhostTreasureAttrs.hp || 0) + (scaledGhostTreasureAttrsExtra.extraHp || 0);
     let curHpGhost = maxHpGhost;
     if (isNaN(curHpGhost) || curHpGhost <= 0) {
        curHpGhost = maxHpGhost || 200;
     }

     console.log(`====== [GhostFight] 对决开始 ======`);
     console.log(`Player stats: Level=${player.level}, HP=${player.hp}/${player.maxHp}, attrs=`, player.attributes, `, equippedTreasure=`, player.equippedTreasure, `, treasureAttrs=`, player.equippedTreasureAttrs);
     console.log(`Ghost stats (Scaled): Level=${ghostLvl} (Original=${ghostLvlOriginal}, Factor=${scaleFactor}), attrs=`, resolvedGhostAttrs, `, equippedTreasure=`, ghost.equippedTreasure, `, scaledTreasure=`, scaledGhostTreasureAttrs);
     console.log(`Initialized HP: User=${curHpUser}/${maxHpUser}, Ghost=${curHpGhost}/${maxHpGhost}`);

     setCombatHpUser(curHpUser);
     setCombatHpGhost(curHpGhost);
     setCombatMaxHpUser(maxHpUser);
     setCombatMaxHpGhost(maxHpGhost);
     setCombatTurn(1);
     setEffects([]);
     setDamageNumbers([]);
     setCurrentBattleState({});

     if (ghostFightIntervalRef.current) {
        clearInterval(ghostFightIntervalRef.current);
     }

     ghostFightIntervalRef.current = setInterval(() => {
        console.log(`[GhostFight] Tick Start: Turn=${turn}, UserHP=${curHpUser}/${maxHpUser}, GhostHP=${curHpGhost}/${maxHpGhost}`);

        if (curHpUser <= 0) {
           console.log(`[GhostFight] Battle ends: User is defeated.`);
           clearInterval(ghostFightIntervalRef.current);
           ghostFightIntervalRef.current = null;
           handleGhostFightResult(false, ghost);
           return;
        }
        if (curHpGhost <= 0) {
           console.log(`[GhostFight] Battle ends: Ghost is defeated.`);
           clearInterval(ghostFightIntervalRef.current);
           ghostFightIntervalRef.current = null;
           handleGhostFightResult(true, ghost);
           return;
        }
        if (turn > 20) {
           console.log(`[GhostFight] Battle ends: Limit reached (Turn ${turn} > 20).`);
           clearInterval(ghostFightIntervalRef.current);
           ghostFightIntervalRef.current = null;
           const userRatio = curHpUser / maxHpUser;
           const ghostRatio = curHpGhost / maxHpGhost;
           if (userRatio >= ghostRatio) {
              handleGhostFightResult(true, ghost);
           } else {
              handleGhostFightResult(false, ghost);
           }
           return;
        }

        const userAgi = player.attributes?.agi || 0;
        const ghostAgi = resolvedGhostAttrs.agi || 0;

        const userSpeed = userAgi + (playerTreasure?.attrs?.dodge || 0) * 0.5 + (userAttrs.extraDodge || 0) * 0.5;
        const ghostSpeed = ghostAgi + (scaledGhostTreasureAttrs.dodge || 0) * 0.5 + (scaledGhostTreasureAttrsExtra.extraDodge || 0) * 0.5;
        const userFirst = userSpeed >= ghostSpeed;

        const userAtk = (player.attributes?.str || 0) * 2 + player.level * 5 + (playerTreasure?.attrs?.atk || 0) + (userAttrs.extraAtk || 0);
        const ghostAtk = (resolvedGhostAttrs.str || 0) * 2 + ghostLvl * 5 + (scaledGhostTreasureAttrs.atk || 0) + (scaledGhostTreasureAttrsExtra.extraAtk || 0);

        const userDef = (player.attributes?.con || 0) * 2 + player.level * 2 + (playerTreasure?.attrs?.def || 0) + (userAttrs.extraDef || 0);
        const ghostDef = (resolvedGhostAttrs.con || 0) * 2 + ghostLvl * 2 + (scaledGhostTreasureAttrs.def || 0) + (scaledGhostTreasureAttrsExtra.extraDef || 0);

        const userCritChance = (((player.attributes?.luk || 0) / ((player.attributes?.luk || 0) + 150)) * 0.2) + ((playerTreasure?.attrs?.crit || 0) + (userAttrs.extraCrit || 0)) * 0.01;
        const ghostCritChance = (((resolvedGhostAttrs.luk || 0) / ((resolvedGhostAttrs.luk || 0) + 150)) * 0.2) + ((scaledGhostTreasureAttrs.crit || 0) + (scaledGhostTreasureAttrsExtra.extraCrit || 0)) * 0.01;

        const calcDmg = (atk, def) => {
           const safeAtk = isNaN(atk) ? 50 : atk;
           const safeDef = isNaN(def) ? 10 : def;
           const raw = safeAtk + Math.random() * 40;
           const damageValue = Math.max(35, Math.floor(raw - safeDef));
           return isNaN(damageValue) ? 35 : damageValue;
        };

        let turnLog = `【第 ${turn} 回合】\n`;
        
        const ghostDodgeChance = (ghostAgi / (ghostAgi + 120)) * 0.5 + ((scaledGhostTreasureAttrs.dodge || 0) + (scaledGhostTreasureAttrsExtra.extraDodge || 0)) * 0.01;
        const userDodgeChance = (userAgi / (userAgi + 120)) * 0.5 + ((playerTreasure?.attrs?.dodge || 0) + (userAttrs.extraDodge || 0)) * 0.01;

        let isGhostDodge = false;
        let isUserDodge = false;
        let isCrit = false;
        let isCritGhost = false;
        let dmgToGhost = 0;
        let dmgToUser = 0;

        const animQueue = [];

        if (userFirst) {
           isGhostDodge = Math.random() < ghostDodgeChance;
           if (!isGhostDodge) {
              isCrit = Math.random() < userCritChance;
              dmgToGhost = calcDmg(userAtk, ghostDef);
              if (isCrit) {
                 dmgToGhost = Math.floor(dmgToGhost * 1.5);
              }
              curHpGhost = Math.max(0, curHpGhost - dmgToGhost);
              console.log(` -> User hits Ghost for ${dmgToGhost}${isCrit ? ' (CRIT)' : ''}. Ghost remaining HP: ${curHpGhost}`);
           } else {
              console.log(` -> User attacks, but Ghost dodges.`);
           }

           animQueue.push(() => {
              setCurrentBattleState({ attacker: player.name });
           });

           animQueue.push(() => {
              setTimeout(() => {
                 if (isGhostDodge) {
                    setCurrentBattleState({ dodger: ghost.creatorName });
                    addEffect('dodge', 'right');
                    SoundManager.play('sfx_dodge');
                 } else {
                    const eff = isCrit ? 'ultimateBurst' : 'swordSlash';
                    setCurrentBattleState({ lastHit: ghost.creatorName, effectType: eff });
                    addEffect(eff, 'right', isCrit ? 2 : 1);
                    addDamageNumber(dmgToGhost, 'right');
                    setCombatHpGhost(curHpGhost);
                    if (isCrit) {
                       SoundManager.play('sfx_magic');
                    } else {
                       SoundManager.play('sfx_sword');
                    }
                 }
              }, 350);
           });

           if (curHpGhost > 0) {
              isUserDodge = Math.random() < userDodgeChance;
              if (!isUserDodge) {
                 isCritGhost = Math.random() < ghostCritChance;
                 dmgToUser = calcDmg(ghostAtk, userDef);
                 if (isCritGhost) {
                    dmgToUser = Math.floor(dmgToUser * 1.5);
                 }
                 curHpUser = Math.max(0, curHpUser - dmgToUser);
                 console.log(` -> Ghost hits User for ${dmgToUser}${isCritGhost ? ' (CRIT)' : ''}. User remaining HP: ${curHpUser}`);
              } else {
                 console.log(` -> Ghost attacks, but User dodges.`);
              }

              animQueue.push(() => {
                 setTimeout(() => {
                    setCurrentBattleState({ attacker: ghost.creatorName });
                 }, 800);
              });

              animQueue.push(() => {
                 setTimeout(() => {
                    if (isUserDodge) {
                       setCurrentBattleState({ dodger: player.name });
                       addEffect('dodge', 'left');
                       SoundManager.play('sfx_dodge');
                    } else {
                       const eff = isCritGhost ? 'ultimateBurst' : 'swordSlash';
                       setCurrentBattleState({ lastHit: player.name, effectType: eff });
                       addEffect(eff, 'left', isCritGhost ? 2 : 1);
                       addDamageNumber(dmgToUser, 'left');
                       setCombatHpUser(curHpUser);
                       if (isCritGhost) {
                          SoundManager.play('sfx_magic');
                       } else {
                          SoundManager.play('sfx_sword');
                       }
                    }
                 }, 1150);
              });
           }

           if (isGhostDodge) {
              turnLog += `你 势如破竹出招，却被怨灵神魂虚影飘晃躲过！(怨灵血量: ${curHpGhost}/${maxHpGhost})`;
           } else {
              turnLog += `${isCrit ? '[暴击] ' : ''}你 眼神如电率先出招，对怨灵造成 ${dmgToGhost} 点伤害。(怨灵血量: ${curHpGhost}/${maxHpGhost})`;
           }
           if (curHpGhost > 0) {
              if (isUserDodge) {
                 turnLog += `\n怨灵神魂 阴冷反击，却被你灵动异常的身形一闪，巧妙避开！(你的血量: ${curHpUser}/${maxHpUser})`;
              } else {
                 turnLog += `\n${isCritGhost ? '[暴击] ' : ''}怨灵神魂 阴冷反击，对你造成 ${dmgToUser} 点伤害。(你的血量: ${curHpUser}/${maxHpUser})`;
              }
           }
        } else {
           isUserDodge = Math.random() < userDodgeChance;
           if (!isUserDodge) {
              isCritGhost = Math.random() < ghostCritChance;
              dmgToUser = calcDmg(ghostAtk, userDef);
              if (isCritGhost) {
                 dmgToUser = Math.floor(dmgToUser * 1.5);
              }
              curHpUser = Math.max(0, curHpUser - dmgToUser);
              console.log(` -> Ghost hits User for ${dmgToUser}${isCritGhost ? ' (CRIT)' : ''}. User remaining HP: ${curHpUser}`);
           } else {
              console.log(` -> Ghost attacks, but User dodges.`);
           }

           animQueue.push(() => {
              setCurrentBattleState({ attacker: ghost.creatorName });
           });

           animQueue.push(() => {
              setTimeout(() => {
                 if (isUserDodge) {
                    setCurrentBattleState({ dodger: player.name });
                    addEffect('dodge', 'left');
                    SoundManager.play('sfx_dodge');
                 } else {
                    const eff = isCritGhost ? 'ultimateBurst' : 'swordSlash';
                    setCurrentBattleState({ lastHit: player.name, effectType: eff });
                    addEffect(eff, 'left', isCritGhost ? 2 : 1);
                    addDamageNumber(dmgToUser, 'left');
                    setCombatHpUser(curHpUser);
                    if (isCritGhost) {
                       SoundManager.play('sfx_magic');
                    } else {
                       SoundManager.play('sfx_sword');
                    }
                 }
              }, 350);
           });

           if (curHpUser > 0) {
              isGhostDodge = Math.random() < ghostDodgeChance;
              if (!isGhostDodge) {
                 isCrit = Math.random() < userCritChance;
                 dmgToGhost = calcDmg(userAtk, ghostDef);
                 if (isCrit) {
                    dmgToGhost = Math.floor(dmgToGhost * 1.5);
                 }
                 curHpGhost = Math.max(0, curHpGhost - dmgToGhost);
                 console.log(` -> User hits Ghost for ${dmgToGhost}${isCrit ? ' (CRIT)' : ''}. Ghost remaining HP: ${curHpGhost}`);
              } else {
                 console.log(` -> User attacks, but Ghost dodges.`);
              }

              animQueue.push(() => {
                 setTimeout(() => {
                    setCurrentBattleState({ attacker: player.name });
                 }, 800);
              });

              animQueue.push(() => {
                 setTimeout(() => {
                    if (isGhostDodge) {
                       setCurrentBattleState({ dodger: ghost.creatorName });
                       addEffect('dodge', 'right');
                       SoundManager.play('sfx_dodge');
                    } else {
                       const eff = isCrit ? 'ultimateBurst' : 'swordSlash';
                       setCurrentBattleState({ lastHit: ghost.creatorName, effectType: eff });
                       addEffect(eff, 'right', isCrit ? 2 : 1);
                       addDamageNumber(dmgToGhost, 'right');
                       setCombatHpGhost(curHpGhost);
                       if (isCrit) {
                          SoundManager.play('sfx_magic');
                       } else {
                          SoundManager.play('sfx_sword');
                       }
                    }
                 }, 1150);
              });
           }

           if (isUserDodge) {
              turnLog += `怨灵神魂 抢先冷厉出击，你早已洞烛机先，翩然一闪避开！(你的血量: ${curHpUser}/${maxHpUser})`;
           } else {
              turnLog += `${isCritGhost ? '[暴击] ' : ''}怨灵神魂 身法更快抢先出手，对你造成 ${dmgToUser} 点伤害。(你的血量: ${curHpUser}/${maxHpUser})`;
           }
           if (curHpUser > 0) {
              if (isGhostDodge) {
                 turnLog += `\n你 咬牙蓄力打出一记掌风，却被怨灵神魂飘摇躲过！(怨灵血量: ${curHpGhost}/${maxHpGhost})`;
              } else {
                 turnLog += `\n${isCrit ? '[暴击] ' : ''}你 咬牙稳住架势，一招重击对怨灵造成 ${dmgToGhost} 点伤害。(怨灵血量: ${curHpGhost}/${maxHpGhost})`;
              }
           }
        }

        // 顺序触发动画
        animQueue.forEach(fn => fn());

        // 回合结算
        setTimeout(() => {
           setCurrentBattleState({});
           setGhostFightLogs(prev => [...prev, turnLog]);
           setCombatTurn(t => t + 1);
        }, 1600);

        turn++;
        console.log(`[GhostFight] Tick End: Turn=${turn-1}`);
     }, 1800);
  };

  const handleGhostFightResult = (isWin, ghost) => {
     if (isWin) {
        setGhostFightState('won');
        SoundManager.play('sfx_success');
        defeatRealmGhost(ghost.id);
        gainMaterial('soulAshes', 2);
        setGhostFightLogs(prev => [...prev, `\n>> 对决胜利！怨灵神魂渐渐在空中溃散。\n你从灰烬中拾取了 2 个【怨魂余烬】！`]);
     } else {
        setGhostFightState('lost');
        SoundManager.play('sfx_fail');
        ghostWinDividend(ghost.id);
        setGhostFightLogs(prev => [...prev, `\n>> 对决战败！阴冷的怨魂入体，你感到天旋地转……\n（提示：怨灵作者获得了 2 银两分红，你被怨毒反噬，负伤离场）`]);
     }
  };

  const cleanIcon = useCleanImage('/wuxia_realm_icon.webp');
  const [deck, setDeck] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [depth, setDepth] = useState(0);
  const [karma, setKarma] = useState(0);
  const [logs, setLogs] = useState([]);
  // Auto-scroll removed as requested


  const startExploration = () => {
    // ALEX 测试账号拥有无限挑战权限
    if ((player.secretRealmAttempts || 0) >= 3 && player.name !== 'ALEX') {
      alert("今日琅嬛福地探索次数已尽，大侠请明日再来。");
      return;
    }
    
    // 播放点击并淡入淡出切换为秘境探索专属 BGM
    SoundManager.play('sfx_click');
    SoundManager.playMusic('bgm_realm');

    useSecretRealmAttempt();
    const upgradedTitle = addActivity(15);
    if (upgradedTitle) {
         setTimeout(() => {
             alert(`你在琅嬛福地的大胆探索让你的活跃名声远扬，目前名望已晋升为【${upgradedTitle}】！`);
         }, 800);
    }
    
    setHasDeployedGhost(false);
    setDepth(0);
    setKarma(0);
    setLogs(["====== 踏入琅嬛福地 ======\n四周云雾流转，你感觉自己步入了一片遗世独立的秘境……\n"]);
    
    const newDeck = generateEventDeck();

    if (realmGhosts && realmGhosts.length > 0) {
       // 为方便测试，测试账号 ALEX 可以挑战自己设伏的怨灵残影
       const otherGhosts = realmGhosts.filter(g => g.creatorName !== player.name || player.name === 'ALEX');
       if (otherGhosts.length > 0) {
          const ghostsToInsert = [...otherGhosts].sort(() => 0.5 - Math.random()).slice(0, 2);
          ghostsToInsert.forEach((ghost, idx) => {
             // 降低生成深度门槛，在深度 1, 2, 3 即可高概率直接遭遇，方便快速触发测试
             const targetDepth = 1 + idx * 2 + Math.floor(Math.random() * 2);
             newDeck.push({
                minDepth: targetDepth,
                generator: () => ({
                   type: 'ghost',
                   title: `『宿命残影：${ghost.creatorName}的怨灵』`,
                   desc: `前路煞气冲天！一缕强大的怨灵挡住去路。其面容依稀可见为同道【${ghost.creatorName}】（${ghost.level}级），并在虚空中留下一行神魂怨言：“${ghost.message}”。若不将其击碎，绝难继续下潜！`,
                   choices: [
                      {
                         text: "【迎战神魂】破此障壁，继续前行！",
                         action: (p) => {
                            return {
                               isGhostFight: true,
                               ghost: ghost
                            };
                         }
                      }
                   ]
                })
             });
          });
       }
    }

    const targetWellDepth = 4 + Math.floor(Math.random() * 4);
    newDeck.push({
       minDepth: targetWellDepth,
       generator: () => ({
          type: 'spirit_well',
          title: "『福地灵泉：精魂飞瀑』",
          desc: "你在嶙峋怪石间发现了一处隐秘宣泄的“精魂泉眼”，灵气如飞泉漱玉，隐有霞光喷薄。此时正是坐忘守一、摄取武道精魂的绝佳造化！",
          choices: [
             {
                text: "【纳气归元】静坐吸纳飞瀑灵气",
                action: (p) => {
                   const amt = 5 + Math.floor(Math.random() * 6);
                   gainEssence(amt);
                   return {
                      log: `你闭目纳气，缓缓运转周天，吸纳了 ${amt} 点武道精魂！灵力周游四肢，极其受用。`,
                      depthDelta: 1,
                      karmaDelta: 1
                   };
                }
             }
          ]
       })
    });

    setDeck(newDeck);
    setState('exploring');
    
    nextEvent(newDeck, 0, 0);
  };

  const nextEvent = (currentDeck, curDepth, curKarma) => {
    const validEvents = currentDeck.filter(e => curDepth >= e.minDepth);
    if (validEvents.length === 0) {
       endExploration(curDepth, curKarma, false, null, true);
       return;
    }
    const evtData = validEvents[0];
    const evtIndex = currentDeck.indexOf(evtData);
    const newDeck = [...currentDeck.slice(0, evtIndex), ...currentDeck.slice(evtIndex + 1)];
    const resolvedEvent = evtData.generator(player.level);
    
    setDeck(newDeck);
    setCurrentEvent(resolvedEvent);
  };

  const handleChoice = (choice) => {
     // 播放选择按钮点击交互音
     SoundManager.play('sfx_click');
     let result;
     try {
         result = choice.action(player);
     } catch (e) {
         console.error(e);
         return;
      }
      
      if (result.isGhostFight) {
         setCurrentEvent(null);
         startGhostFight(result.ghost);
         return;
      }

      let newDepth = depth + (result.depthDelta || 0);
     let newKarma = karma + (result.karmaDelta || 0);
     let newLogs = [...logs, `> ${choice.text}`];
     
     if (result.log) {
        newLogs.push(result.log);
     }

     setDepth(newDepth);
     setKarma(newKarma);
     setLogs(newLogs);

     if (result.fail) {
         setCurrentEvent(null);
         setTimeout(() => {
            endExploration(newDepth, newKarma, true, result.failType);
         }, 800);
     } else {
         setCurrentEvent(null);
         setTimeout(() => {
             nextEvent(deck, newDepth, newKarma);
         }, 1000);
     }
  };

  const endExploration = (finalDepth, finalKarma, isFail, failType, isClear = false) => {
     let newLogs = [...logs];
     if (isFail) {
        // 播放历练失败与恶兆附身音效
        SoundManager.play('sfx_fail');
        if (failType) {
           setTimeout(() => {
             SoundManager.play('sfx_poison');
           }, 300);
        }

        newLogs.push(`\n【探险失败】你被迫遁出秘境！`);
        if (failType) {
           newLogs.push(`由于遭受重创，你染上了恶兆【${failType}】。直到明日拂晓前，你的运势都将大幅衰减！`);
           addDailyDebuff(failType);
        }
        setLogs(newLogs);
        setSettlementInfo({
           isSuccess: false,
           isClear: false,
           depth: finalDepth,
           karma: finalKarma,
           rewardTreasure: null,
           rewardSilver: 0,
           silverDetail: '',
           debuff: failType,
           description: `由于遭受重创，你被迫遁出秘境！你染上了恶兆【${failType}】。直到明日拂晓前，你的运势都将大幅衰减！`
        });
        setState('result');
        return;
     }

     // 播放探索成功古筝扫弦音效
     SoundManager.play('sfx_success');

     if (isClear) {
        newLogs.push(`\n【秘境通关】功德圆满！你突破了所有重重险阻与劫数，成功登临琅嬛福地最高处！最终深度：${finalDepth}，累积业力：${finalKarma}`);
     } else {
        newLogs.push(`\n【退隐结算】你驻足不前，开始清点此行造化。最终深度：${finalDepth}，累积业力：${finalKarma}`);
     }
     
     let rewardDesc = "";
     let rewardedTreasureObj = null;
     
     if (isClear) {
        let pool = TREASURES_DB.filter(t => t.rarity === '史诗' || t.rarity === '传说' || t.rarity === '神话');
        if (pool.length === 0) pool = TREASURES_DB;
        const t = pool[Math.floor(Math.random() * pool.length)];
        rewardedTreasureObj = t;
        rewardDesc = `大侠神功盖世，竟成功通关琅嬛秘境！重重云雾尽头，一尊上古遗留的金漆宝匣轰然开启，世所罕见的镇派宝具『${t.name}』绽放出万道华光，拜入你的门下！此等大造化，当真气吞山河！`;
        gainTreasure(t.id);
     } else if (finalDepth < 5) {
        rewardDesc = "你在外围浅尝辄止，一无所获地离开了。";
     } else {
        let pool = [];
        if (finalDepth >= 5 && finalDepth < 10) pool = TREASURES_DB.filter(t => t.rarity === '普通' || t.rarity === '稀有');
        else if (finalDepth >= 10 && finalDepth < 15) {
           pool = TREASURES_DB.filter(t => t.rarity === '稀有' || t.rarity === '史诗');
           if (finalKarma >= 5) pool = pool.filter(t => ['huiChun', 'ruanWei', 'yiTian', 'qingQiao'].includes(t.effect));
           else if (finalKarma <= -5) pool = pool.filter(t => ['poShang', 'dianXue', 'juDu', 'daGou', 'jinShe'].includes(t.effect));
        } else {
           pool = TREASURES_DB.filter(t => t.rarity === '史诗' || t.rarity === '传说' || t.rarity === '神话');
        }
        
        if (pool.length === 0) pool = TREASURES_DB; // 兜底
        const t = pool[Math.floor(Math.random() * pool.length)];
        rewardedTreasureObj = t;
        
        if (finalKarma > 0) {
           rewardDesc = `机缘巧合下，冥冥中的定数将一件流光溢彩的『${t.name}』送到了你的面前。你满怀敬畏地将其收入囊中，飘然而去。`;
        } else if (finalKarma < 0) {
           rewardDesc = `你蛮横地一掌拍碎了前方的障碍，从中贪婪地攫取了震慑江湖的『${t.name}』，狂笑着遁出了秘境。`;
        } else {
           rewardDesc = `你在密室的一端发现了一个古玉宝匣，打开一看，内藏绝世奇珍『${t.name}』，真是好造化！`;
        }
        gainTreasure(t.id);
     }
     
     let realmSilver = Math.floor(finalDepth / 5) + (isClear ? 5 : 0);
     let addKarmaSilver = 0;
     if (finalKarma > 5) addKarmaSilver = 1;
     else if (finalKarma < -5) addKarmaSilver = 2;
     
     let totalSilver = 0;
     let silverExplanation = '';
     if (realmSilver > 0 || addKarmaSilver > 0) {
        totalSilver = realmSilver + addKarmaSilver;
        addSilver(totalSilver);
        rewardDesc += `\n此番历练共收获 ${totalSilver} 银两`;
        silverExplanation = `获得 ${totalSilver} 银两`;
        
        let details = [];
        if (isClear) details.push("通关大奖 +5");
        else if (Math.floor(finalDepth / 5) > 0) details.push(`深度折算 +${Math.floor(finalDepth / 5)}`);
        
        if (addKarmaSilver === 1) {
           rewardDesc += ` (包含好人好报额外打赏 +1)`;
           details.push("好人好报打赏 +1");
        }
        if (addKarmaSilver === 2) {
           rewardDesc += ` (包含杀人越货强制搜刮 +2)`;
           details.push("杀人越货搜刮 +2");
        }
        
        if (details.length > 0) {
           silverExplanation += ` (含${details.join('，')})`;
        }
        
        // 延迟播放铜钱交割音效
        setTimeout(() => {
           SoundManager.play('sfx_coin');
        }, 300);
     }
     
     newLogs.push(rewardDesc);
     setLogs(newLogs);
     setSettlementInfo({
        isSuccess: true,
        isClear: isClear,
        depth: finalDepth,
        karma: finalKarma,
        rewardTreasure: rewardedTreasureObj,
        rewardSilver: totalSilver,
        silverDetail: silverExplanation,
        debuff: null,
        description: rewardDesc
     });
     setState('result');
  };

  if (activeGhostFight) {
     const userWarrior = {
        name: player.name,
        level: player.level,
        hp: combatHpUser,
        maxHp: combatMaxHpUser,
        equippedTreasure: player.equippedTreasure,
        equippedTreasureAttrs: player.equippedTreasureAttrs,
        attributes: player.attributes,
        equippedSkills: player.equippedSkills || {}
     };

     const ghostWarrior = {
        name: activeGhostFight.creatorName,
        level: activeGhostFight.level,
        hp: combatHpGhost,
        maxHp: combatMaxHpGhost,
        equippedTreasure: activeGhostFight.equippedTreasure,
        equippedTreasureAttrs: activeGhostFight.equippedTreasureAttrs,
        attributes: activeGhostFight.attributes,
        equippedSkills: activeGhostFight.equippedSkills || {}
     };

     const userIsAttacking = currentBattleState?.attacker === player.name;
     const userIsHit = currentBattleState?.lastHit === player.name;
     const userIsDodging = currentBattleState?.dodger === player.name;
     const userIsDead = combatHpUser <= 0;

     const ghostIsAttacking = currentBattleState?.attacker === activeGhostFight.creatorName;
     const ghostIsHit = currentBattleState?.lastHit === activeGhostFight.creatorName;
     const ghostIsDodging = currentBattleState?.dodger === activeGhostFight.creatorName;
     const ghostIsDead = combatHpGhost <= 0;

     const curDamageUser = damageNumbers?.find(d => d.position === 'left');
     const curDamageGhost = damageNumbers?.find(d => d.position === 'right');

     return (
        <div className="glass-panel animate-slide-up" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, rgba(10,10,20,0.98), rgba(5,5,15,1))', color: '#eee', border: '1px solid rgba(239, 68, 68, 0.4)', position: 'relative' }}>
           <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: 'linear-gradient(90deg, transparent, #ef4444, transparent)', opacity: 0.5 }} />
           
           <div style={{ textAlign: 'center', marginBottom: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                 <Swords size={28} style={{ color: '#ef4444', filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.5))' }} />
                 <h2 style={{ fontSize: '1.8rem', color: '#ef4444', fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '4px', margin: 0, textShadow: '0 0 10px rgba(239,68,68,0.4)' }}>
                    神 魂 对 决
                 </h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem', marginBottom: 0 }}>
                 你正在与 【{activeGhostFight.creatorName}】 留存在秘境中的怨灵执念进行殊死相搏
              </p>
           </div>

           {/* 渐变暗红分割线 */}
           <div style={{ width: '80%', height: '1px', background: 'linear-gradient(90deg, transparent, #ef4444, transparent)', margin: '0.2rem auto 0.8rem', opacity: 0.3 }} />

           {/* 战斗角色卡牌区域 */}
           <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '40px',
              marginBottom: '1rem',
              padding: '0.5rem 1rem',
              position: 'relative',
           }}>
              {/* 玩家 */}
              <div style={{ position: 'relative' }}>
                 <EnhancedWarriorAvatar
                    player={userWarrior}
                    isLeft={true}
                    isAttacking={userIsAttacking}
                    isHit={userIsHit}
                    isDodging={userIsDodging}
                    isDead={userIsDead}
                    damageAmount={curDamageUser?.damage}
                    effectType={currentBattleState?.effectType}
                 />
              </div>

              {/* VS 标志 & 回合 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 10 }}>
                 <div style={{
                    fontSize: '2rem',
                    color: '#ef4444',
                    fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif',
                    textShadow: '0 0 15px rgba(239, 68, 68, 0.6)',
                    letterSpacing: '6px',
                 }}>
                    VS
                 </div>
                 <div style={{
                    fontSize: '0.8rem',
                    color: 'var(--gold)',
                    fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif',
                    background: 'rgba(0,0,0,0.6)',
                    padding: '2px 10px',
                    borderRadius: '4px',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                 }}>
                    第 {combatTurn} 回合
                 </div>
              </div>

              {/* 怨灵 */}
              <div style={{ position: 'relative' }}>
                 <EnhancedWarriorAvatar
                    player={ghostWarrior}
                    isLeft={false}
                    isAttacking={ghostIsAttacking}
                    isHit={ghostIsHit}
                    isDodging={ghostIsDodging}
                    isDead={ghostIsDead}
                    damageAmount={curDamageGhost?.damage}
                    effectType={currentBattleState?.effectType}
                 />

                 {/* 玩家留言/怨念气泡 - 持续浮动显示 */}
                 {activeGhostFight.message && (
                    <div style={{
                       position: 'absolute',
                       top: '-75px',
                       right: '-10px',
                       zIndex: 100,
                       animation: 'pulse 2s infinite ease-in-out'
                    }}>
                       <div className="wuxia-speech-bubble" style={{ transform: 'none', background: 'rgba(25, 5, 5, 0.95)', border: '1px solid rgba(239, 68, 68, 0.6)', padding: '6px 12px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.8)' }}>
                          <div className="wuxia-speech-bubble-arrow" style={{ borderTopColor: 'rgba(239, 68, 68, 0.6)', bottom: '-6px', left: '75%' }} />
                          <div className="wuxia-speech-bubble-content" style={{ color: '#ff4d4d', fontSize: '0.8rem', whiteSpace: 'normal', wordBreak: 'break-all', maxWidth: '140px', lineHeight: '1.3' }}>
                             👹 怨念：“{activeGhostFight.message}”
                          </div>
                       </div>
                    </div>
                 )}
              </div>

              {/* 战斗动效层 */}
              {effects.map(effect => (
                 <BattleEffects
                    key={effect.id}
                    effectType={effect.type}
                    intensity={effect.intensity}
                    position={effect.position}
                    skillName={effect.skillName}
                    skillId={effect.skillId}
                    onComplete={() => removeEffect(effect.id)}
                 />
              ))}

              {/* 伤害数字 */}
              {damageNumbers.map(d => (
                 <DamageFloatNumber
                    key={d.id}
                    damage={d.damage}
                    position={d.position}
                    isHeal={d.isHeal}
                    onComplete={() => removeDamageNumber(d.id)}
                 />
              ))}
           </div>

           {/* 精简的对决滚动日志栏 */}
           <div style={{ flex: 1, minHeight: '120px', background: 'rgba(5,0,0,0.85)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: '"Courier New", monospace', fontSize: '0.85rem', lineHeight: '1.5', boxShadow: 'inset 0 0 15px rgba(0,0,0,0.9)' }}>
              {ghostFightLogs.map((log, i) => (
                 <div key={i} style={{
                    color: log.startsWith('======') ? 'var(--gold)' : log.includes('对决胜利') ? 'var(--jade)' : log.includes('对决战败') ? 'var(--crimson)' : '#ccc',
                    whiteSpace: 'pre-line',
                    animation: 'fadeIn 0.3s'
                 }}>
                    {log}
                 </div>
              ))}
           </div>

           <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
              {ghostFightState === 'won' && (
                 <button className="btn-primary" style={{ padding: '0.8rem 2.5rem', background: 'linear-gradient(135deg, var(--jade), #065f46)' }} onClick={() => {
                    SoundManager.play('sfx_click');
                    setActiveGhostFight(null);
                    nextEvent(deck, depth + 1, karma);
                 }}>
                    战胜怨灵，继续探索
                 </button>
              )}
              {ghostFightState === 'lost' && (
                 <button className="btn-primary" style={{ padding: '0.8rem 2.5rem', background: 'linear-gradient(135deg, var(--crimson), #7f1d1d)' }} onClick={() => {
                    SoundManager.play('sfx_click');
                    setActiveGhostFight(null);
                    endExploration(depth, karma, true, '怨魂入体');
                 }}>
                    负伤离开
                 </button>
              )}
              {ghostFightState === 'fighting' && (
                 <span style={{ color: 'var(--gold)', fontSize: '1rem', fontFamily: '"Ma Shan Zheng", cursive', animation: 'pulse 1s infinite' }}>
                    气劲激荡，激战中...
                 </span>
              )}
           </div>
        </div>
     );
  }

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, rgba(10,10,20,0.95), rgba(5,5,15,0.98))', color: '#eee', border: '1px solid rgba(192, 132, 252, 0.3)', position: 'relative' }}>
        {/* 顶部装饰 */}
        <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: 'linear-gradient(90deg, transparent, #c084fc, transparent)', opacity: 0.5 }} />

        {/* 居中大标题排版 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '0.5rem', marginBottom: '1rem' }}>
          <img
            src={cleanIcon}
            alt="琅嬛福地"
            style={{
              width: '130px',
              height: '130px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 12px rgba(192, 132, 252, 0.5))',
              transition: 'transform 0.3s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          />
          <h2 style={{ fontSize: '2rem', color: '#c084fc', fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '4px', marginTop: '0.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
            琅嬛福地
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '600px', textAlign: 'center', margin: '0', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
            天衍四九，见好就收 <span style={{ fontSize: '0.85rem', color: '#c084fc', fontWeight: 'bold' }}>(今日门票: {3 - (player.secretRealmAttempts || 0)} / 3)</span>
          </p>
        </div>

        {/* 渐变分割线 */}
        <div style={{ width: '80%', height: '1px', background: 'linear-gradient(90deg, transparent, #c084fc, transparent)', margin: '0.5rem auto 1.5rem', opacity: 0.3 }} />

      {state === 'idle' ? (
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <p style={{ color: 'var(--text-main)', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.7' }}>
            天衍四九，人遁其一。<br/>
            此处为琅嬛福地，充满了未知的奇遇与致命的凶险。<br/>
            你的每一次选择，都将深刻影响最终的因果与你能到达的深度。<br/>
            切记，见好就收方能全身而退；一味贪念造化，恐有万劫不复之厄！
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={startExploration} style={{ padding: '1rem 3rem', fontSize: '1.2rem', background: 'linear-gradient(135deg, #c084fc, #7c3aed)', color: '#fff', boxShadow: '0 0 20px rgba(192, 132, 252, 0.4)' }}>踏入秘境</button>
          </div>
        </div>
      ) : state === 'result' ? (
        renderSettlement()
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', background: 'rgba(20,20,30,0.8)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(192, 132, 252, 0.2)' }}>
            <div>深径残尺：<span style={{color: 'var(--gold)', fontWeight: 'bold', fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif'}}>{depth}</span> 层</div>
            {player.name === 'ALEX' && (
              <button 
                onClick={() => {
                  SoundManager.play('sfx_click');
                  endExploration(depth + 18, karma, false, null, true);
                }} 
                style={{
                  background: 'rgba(192, 132, 252, 0.15)',
                  border: '1px solid #c084fc',
                  color: '#c084fc',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontFamily: '"Ma Shan Zheng", cursive'
                }}
              >
                ⚡ 直接通关
              </button>
            )}
            <div>尘世因果：<span style={{color: karma > 0 ? 'var(--jade)' : karma < 0 ? 'var(--crimson)' : 'var(--text-main)', fontWeight: 'bold'}}>{karma > 0 ? '+'+karma : karma}</span></div>
          </div>

          <div style={{ flex: 1, background: 'rgba(5,5,10,0.9)', border: '1px solid rgba(192, 132, 252, 0.15)', borderRadius: '8px', padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', fontFamily: '"Courier New", monospace', fontSize: '1rem', lineHeight: '1.7', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)' }}>
            {logs.map((log, i) => (
              <div key={i} style={{
                color: log.startsWith('>') ? 'var(--gold)' : log.includes('【探险失败】') ? 'var(--crimson)' : (log.includes('『') || log.includes('【退隐结算】')) ? '#c084fc' : '#aaa',
                whiteSpace: 'pre-line',
                animation: 'fadeIn 0.4s'
              }}>
                {log}
              </div>
            ))}

            {state === 'exploring' && currentEvent && (
               <div style={{ marginTop: '2rem', animation: 'fadeIn 0.6s', borderTop: '1px dashed rgba(192, 132, 252, 0.3)', paddingTop: '1.5rem' }}>
                  {/* 事件插画 */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                     <EventIllustration type={currentEvent.type} event={currentEvent} />
                  </div>
                  <p style={{ color: '#fff', marginBottom: '2rem', textShadow: '0 0 8px rgba(192, 132, 252, 0.3)', lineHeight: '1.8' }}>{currentEvent.desc}</p>
                  
                  {/* 古典隐晦的属性微调机缘提示 */}
                  <div style={{ 
                     fontSize: '0.8rem', 
                     color: 'var(--gold)', 
                     opacity: 0.8, 
                     marginBottom: '1.2rem', 
                     fontStyle: 'italic', 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: '8px',
                     background: 'rgba(212, 175, 55, 0.05)',
                     padding: '8px 12px',
                     borderRadius: '4px',
                     borderLeft: '2px solid var(--gold)'
                  }}>
                     <span style={{ fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '1px' }}>
                        天机玄妙，命格由心。每临关隘抉择，大侠若能先一步易骨改脉以调周天潜能，则造化生机大增，趋吉避凶亦在反掌之间。
                     </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                     {currentEvent.choices.map((c, i) => {
                        if (c.isHidden && c.isHidden(player)) return null;
                        return (
                           <button key={i} onClick={() => handleChoice(c)} style={{
                              background: 'rgba(30,30,50,0.8)', border: '1px solid rgba(192, 132, 252, 0.3)', color: '#ddd', padding: '1rem', textAlign: 'left', cursor: 'pointer', borderRadius: '6px',
                              fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif', transition: 'all 0.2s', fontSize: '1rem', letterSpacing: '1px'
                           }} onMouseOver={(e)=>{e.target.style.background='rgba(50,50,80,0.9)'; e.target.style.borderColor='#c084fc'}} onMouseOut={(e)=>{e.target.style.background='rgba(30,30,50,0.8)'; e.target.style.borderColor='rgba(192, 132, 252, 0.3)'}}>
                              {c.text}
                           </button>
                        );
                     })}
                     <button onClick={() => { SoundManager.play('sfx_click'); endExploration(depth, karma, false); }} style={{
                        background: 'transparent', border: '1px dashed var(--gold)', color: 'var(--gold)', padding: '1rem', textAlign: 'center', cursor: 'pointer', borderRadius: '6px',
                        fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif', marginTop: '1.5rem', fontSize: '0.9rem', letterSpacing: '1px'
                     }} onMouseOver={(e)=>e.target.style.background='rgba(212, 175, 55, 0.1)'} onMouseOut={(e)=>e.target.style.background='transparent'}>
                        <DoorOpen size={16} style={{display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px'}}/> [见好就收，遁出秘境]
                     </button>
                  </div>
               </div>
            )}
            <div style={{ height: '20px' }}></div>
          </div>
        </div>
      )}
    </div>
  );
}

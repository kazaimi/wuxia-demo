import React, { useState, useEffect, useRef } from 'react';
import { useGameStore, getSocket, SKILLS_DB, TREASURES_DB, getSkillInfo } from '../store/gameState';
import { Sword, Users, ShieldAlert, Award, Play, Shield, FlaskConical } from 'lucide-react';
import { SoundManager } from '../utils/SoundManager';

export default function WorldBossArena() {
  const player = useGameStore(state => state.player);
  const worldBossState = useGameStore(state => state.worldBossState);
  const fetchWorldBossState = useGameStore(state => state.fetchWorldBossState);
  const signupWorldBoss = useGameStore(state => state.signupWorldBoss);
  const challengeWorldBoss = useGameStore(state => state.challengeWorldBoss);
  const bidWorldBossAuction = useGameStore(state => state.bidWorldBossAuction);
  const devControlWorldBoss = useGameStore(state => state.devControlWorldBoss);
  const onlinePlayers = useGameStore(state => state.onlinePlayers);

  // 战斗状态
  const [battleLogs, setBattleLogs] = useState([]);
  const [inBattle, setInBattle] = useState(false);
  const [curBossHp, setCurBossHp] = useState(0);
  const [curUserHp, setCurUserHp] = useState(0);
  const [battleDmg, setBattleDmg] = useState(0);
  const [battleState, setBattleState] = useState('idle'); // idle, fighting, finished
  
  // 拍卖出价
  const [bidPrice, setBidPrice] = useState(0);
  
  // 滚动日志和 Toast
  const [strikeToast, setStrikeToast] = useState(null);
  const logsEndRef = useRef(null);

  useEffect(() => {
    fetchWorldBossState();
    
    // 监听高光事件
    const socket = getSocket();
    if (socket) {
       socket.on('boss_fighter_strike', (data) => {
          setStrikeToast(data);
          // 2秒后自动消失
          setTimeout(() => {
             setStrikeToast(null);
          }, 2000);
       });
    }

    return () => {
       if (socket) socket.off('boss_fighter_strike');
    };
  }, [fetchWorldBossState]);

  useEffect(() => {
     if (logsEndRef.current) {
        logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
     }
  }, [battleLogs]);

  // 15 回合 Boss 战模拟器
  const startBossFight = () => {
     if (player.essence < 10) {
        alert("你的武道精魂不足 10 点，无法挑战大魔罗！");
        return;
     }
     SoundManager.play('sfx_task_accept');
     
     setInBattle(true);
     setBattleState('fighting');
     setCurBossHp(worldBossState.hp);
     setCurUserHp(player.maxHp);
     setBattleDmg(0);
     
     let logs = [`====== 挑战开始：御敌太古魔殿 ======`, `你深吸一口气，踏入大殿，直面浮空狂笑的太古噬魂魔罗！`];
     setBattleLogs(logs);

     let turn = 1;
     let userHp = player.maxHp;
     let bossHp = worldBossState.hp;
     let accumulatedDmg = 0;

     // 检测玩家是否洗练出词条
     const attrs = player.equippedTreasureAttrs || {};
     const hasPo破魔 = (attrs.bossDamageBoost > 0) || (attrs.extraInt >= 10) || (player.treasures.some(t => ['t13', 't14'].includes(t))); // 包含破魔词条或特定神兵
     const hasPoison = attrs.poisonRate > 0;
     const hasStun = attrs.stunRate > 0;
     const hasAntiStun = attrs.extraLuk >= 10; // 幸运达标作为防晕

     const interval = setInterval(() => {
        if (turn > 15 || userHp <= 0 || bossHp <= 0) {
           clearInterval(interval);
           setBattleState('finished');
           // 上传伤害
           challengeWorldBoss(accumulatedDmg);
           SoundManager.play('sfx_success');
           setBattleLogs(prev => [...prev, `\n>> 挑战结束！共对魔罗造成了 ${accumulatedDmg} 点伤害。`, `你精疲力竭，在漫天飞灰中退回大殿。`]);
           return;
        }

        let turnLog = `【第 ${turn} 回合】\n`;
        
        // 玩家受到的负面影响判定
        let isStunned = false;

        // 1. Boss 攻击前戏与技能施放轴
        if (turn === 3 || turn === 8) {
           turnLog += `👹 魔罗魔眼怒张，施展了【魔罗乱神】！心魔干扰袭来，你运转周天的功法几率下降 30%。\n`;
        }
        if (turn === 5 || turn === 12) {
           turnLog += `👹 魔罗周身煞气暴涨，施展了【邪煞夺魄】重创于你！`;
           const dot = Math.floor(player.maxHp * 0.08);
           userHp = Math.max(0, userHp - dot);
           turnLog += `你染上了魔毒，损失 ${dot} 点气血。魔罗张开了【血魂护盾】！\n`;
        }
        if (turn === 7 || turn === 14) {
           turnLog += `👹 魔罗爆发大范围太古魔啸！`;
           if (hasAntiStun) {
              turnLog += `幸而你身怀【防晕免控】秘法，稳住身形，免疫了咆哮震慑！\n`;
           } else if (Math.random() <= 0.35) {
              turnLog += `你心神被魔啸震慑，陷入了【眩晕】状态，本回合无法出手！\n`;
              isStunned = true;
           } else {
              turnLog += `你咬紧牙关，在风暴中立住了脚步！\n`;
           }
        }
        if (turn === 15) {
           turnLog += `👹 【诸神寂灭】！！魔罗在第 15 回合爆发灭世神雷，对你造成 99,999 点真实伤害，你瞬间失去知觉！\n`;
           userHp = 0;
        }

        // 2. 玩家出手
        if (!isStunned && userHp > 0) {
           const playerStr = (player.attributes.str || 0) + (attrs.extraStr || 0);
           let baseDmg = playerStr * 4 + 100 + Math.random() * 100;
           
           // 读取装备的外功威力
           const outerId = player.equippedSkills?.outer;
           const outerSkill = SKILLS_DB.find(s => s.id === outerId);
           if (outerSkill) {
              baseDmg += outerSkill.power * 2;
           }

           let isCrit = Math.random() < 0.25; // 25%几率暴击
           if (isCrit) baseDmg *= 1.8;

           let damageToBoss = Math.floor(baseDmg);
           
           // 破魔判定
           const isPoMa = (attrs.bossDamageBoost > 0) || (attrs.extraInt >= 10) || ['t13', 't14'].includes(player.equippedTreasure);
           if (!isPoMa) {
              // Boss 默认有 80% 免伤
              damageToBoss = Math.floor(damageToBoss * 0.2);
              turnLog += `你 施展全力对魔罗轰出一记重招，但魔罗周身【九重邪光】闪烁，抵消了80%受创，造成了 ${damageToBoss} 点伤害。${isCrit ? '(暴击!)' : ''}\n`;
           } else {
              turnLog += `你 激发了神兵中的【破魔】威能，刀光撕裂魔障！无视免伤对魔罗造成了 ${damageToBoss} 点伤害！${isCrit ? '(暴击!)' : ''}\n`;
           }

           // 反伤护盾
           if (turn === 5 || turn === 12) {
              const reflect = Math.floor(damageToBoss * 0.2);
              userHp = Math.max(0, userHp - reflect);
              turnLog += `你被魔罗的【血魂护盾】反弹了 ${reflect} 点伤害！\n`;
           }

           // 击晕抵抗转破招判定
           const stunProc = Math.random() * 100 <= (attrs.stunRate || 0);
           if (stunProc) {
              turnLog += `✦ 你的器灵触发【击晕】威能！魔罗受威压震慑无法眩晕，但进入了“破招威压”状态，本回合输出降低 50%！\n`;
           }

           // 中毒流血判定 (PVE 高额固定伤害)
           if (hasPoison || player.equippedTreasure === 't6') {
              const playerInt = (player.attributes.int || 0) + (attrs.extraInt || 0);
              const poisonDmg = playerInt * 3 * 15;
              bossHp = Math.max(0, bossHp - poisonDmg);
              accumulatedDmg += poisonDmg;
              turnLog += `✦ 毒素蚀骨！魔罗每回合流血，受到了 ${poisonDmg} 点固定中毒伤害。\n`;
           }

           bossHp = Math.max(0, bossHp - damageToBoss);
           accumulatedDmg += damageToBoss;
        }

        // 3. Boss 普通反击 (非15回合秒杀且未死)
        if (bossHp > 0 && userHp > 0 && turn < 15) {
           let bossBaseDmg = 120 + turn * 20 - player.attributes.con * 0.8;
           bossBaseDmg = Math.max(40, Math.floor(bossBaseDmg));
           userHp = Math.max(0, userHp - bossBaseDmg);
           turnLog += `魔罗 对你发出一记邪灵煞气，造成了 ${bossBaseDmg} 点反伤创击。(剩余HP: ${userHp}/${player.maxHp})`;
        }

        setCurBossHp(bossHp);
        setCurUserHp(userHp);
        setBattleDmg(accumulatedDmg);
        setBattleLogs(prev => [...prev, turnLog]);
        turn++;
     }, 600);
  };

  // 出价处理
  const handleBid = () => {
     if (bidPrice <= worldBossState.highestBid) {
        alert("出价必须高于当前最高竞拍价格！");
        return;
     }
     if (player.silver < bidPrice) {
        alert("你的银两不足！");
        return;
     }
     SoundManager.play('sfx_click');
     bidWorldBossAuction(bidPrice);
  };

  // 请战帖登记
  const handleSignup = () => {
     SoundManager.play('sfx_success');
     signupWorldBoss();
  };

  // 格式化倒计时
  const formatTime = (timeMs) => {
     const diff = timeMs - Date.now();
     if (diff <= 0) return "00:00";
     const min = Math.floor(diff / 60000);
     const sec = Math.floor((diff % 60000) / 1000);
     return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // 战友模拟数据以供并肩作战感
  const renderFightersList = () => {
     const fighters = worldBossState.fighters || {};
     const allFighters = Object.entries(fighters).map(([name, data]) => ({
        name,
        damage: data.damage,
        count: data.count
     })).sort((a,b) => b.damage - a.damage);

     return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
           {allFighters.slice(0, 5).map((f, i) => (
              <div key={f.name} style={{
                 padding: '0.6rem 0.8rem',
                 background: 'rgba(239, 68, 68, 0.05)',
                 borderLeft: `3px solid ${i === 0 ? 'var(--gold)' : 'var(--crimson)'}`,
                 borderRadius: '0 6px 6px 0',
                 display: 'flex',
                 justifyContent: 'space-between',
                 alignItems: 'center',
                 fontSize: '0.9rem'
              }}>
                 <div>
                    <span style={{ color: i === 0 ? 'var(--gold)' : '#fff', fontWeight: 'bold' }}>#{i+1} {f.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '6px' }}>({f.count}次挑战)</span>
                 </div>
                 <div style={{ color: 'var(--crimson)', fontFamily: 'Outfit' }}>
                    {f.damage.toLocaleString()} 伤
                 </div>
              </div>
           ))}
           {allFighters.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.85rem' }}>暂无讨伐记录，速速出战！</p>
           )}
           {allFighters.length > 5 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.8rem', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '6px' }}>
                 其余 {allFighters.length - 5} 名同道正合围御敌...
              </p>
           )}
        </div>
     );
  };

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #09090b 0%, #030303 100%)', color: '#eaeaea', border: '1px solid rgba(239, 68, 68, 0.25)', position: 'relative', overflow: 'hidden' }}>
      
      {/* 水墨刀光特效层 */}
      <div className="water-ink-bg" style={{
         position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
         background: 'radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.08), transparent 50%)',
         opacity: 0.8, pointerEvents: 'none', zIndex: 0
      }} />

      {/* 战友暴击飘字 Toast */}
      {strikeToast && (
         <div className="animate-fade-in-out" style={{
            position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
            background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.95), rgba(153, 27, 27, 0.95))',
            color: '#fff', padding: '0.6rem 2rem', borderRadius: '50px',
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.6)', zIndex: 100,
            fontSize: '1rem', fontWeight: 'bold', fontFamily: '"Ma Shan Zheng", cursive',
            display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--gold)'
         }}>
            <span>✦ 同道【{strikeToast.playerName}】大展神威，施展【{strikeToast.skillName}】暴击狂轰魔罗 {strikeToast.damage.toLocaleString()} 创伤！</span>
         </div>
      )}

      {/* 顶部标题 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', zIndex: 1 }}>
         <div>
            <h2 style={{ fontSize: '2.2rem', color: 'var(--crimson)', fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '4px', textShadow: '0 0 10px rgba(239,68,68,0.3)' }}>
               魔罗降世大殿
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
               每周五晚上 19:00 - 24:00 诛杀怨气之源
            </p>
         </div>
         <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.95rem', color: '#fbbf24', background: 'rgba(251, 191, 36, 0.1)', padding: '0.4rem 1rem', borderRadius: '4px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
               武道精魂: <strong>{player.essence || 0} / 200</strong>
            </span>
            <span style={{ fontSize: '0.95rem', color: 'var(--jade)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.4rem 1rem', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
               银两: <strong>{player.silver || 0} 两</strong>
            </span>
         </div>
      </div>

      {/* 战斗内遮罩 */}
      {inBattle ? (
         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '1.5rem', zIndex: 1, overflow: 'hidden' }}>
            
            {/* 双方血量槽 */}
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
               <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                     <span>你的气血: {curUserHp} / {player.maxHp}</span>
                     <span>{(curUserHp / player.maxHp * 100).toFixed(0)}%</span>
                  </div>
                  <div style={{ height: '10px', background: '#333', borderRadius: '50px', overflow: 'hidden' }}>
                     <div style={{ height: '100%', width: `${curUserHp / player.maxHp * 100}%`, background: 'linear-gradient(90deg, #10b981, #059669)', transition: 'width 0.3s' }} />
                  </div>
               </div>
               <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem', color: 'var(--crimson)' }}>
                     <span>魔罗邪魂 HP: {curBossHp.toLocaleString()} / {worldBossState.maxHp.toLocaleString()}</span>
                     <span>{(curBossHp / worldBossState.maxHp * 100).toFixed(1)}%</span>
                  </div>
                  <div style={{ height: '10px', background: '#333', borderRadius: '50px', overflow: 'hidden' }}>
                     <div style={{ height: '100%', width: `${curBossHp / worldBossState.maxHp * 100}%`, background: 'linear-gradient(90deg, #ef4444, #991b1b)', transition: 'width 0.3s' }} />
                  </div>
               </div>
            </div>

            {/* 对决滚屏日志 */}
            <div style={{ flex: 1, background: 'rgba(5, 5, 5, 0.95)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px', padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: '"Courier New", monospace', fontSize: '1rem', lineHeight: '1.7', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.9)' }}>
               {battleLogs.map((log, i) => (
                  <div key={i} style={{
                     color: log.startsWith('==') ? 'var(--gold)' : log.startsWith('👹') ? 'var(--crimson)' : log.includes('暴击!') ? '#fbbf24' : log.startsWith('✦') ? '#c084fc' : '#ccc',
                     whiteSpace: 'pre-line',
                     animation: 'fadeIn 0.3s'
                  }}>
                     {log}
                  </div>
               ))}
               <div ref={logsEndRef} />
            </div>

            {/* 底部按钮 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem', alignItems: 'center' }}>
               <span style={{ fontSize: '1.1rem', color: 'var(--crimson)' }}>
                  当前累计输出创伤：<strong>{battleDmg.toLocaleString()}</strong> 
               </span>
               {battleState === 'finished' && (
                  <button className="btn-primary" style={{ padding: '0.8rem 2.5rem', background: 'linear-gradient(135deg, var(--gold), #b45309)' }} onClick={() => {
                     setInBattle(false);
                     fetchWorldBossState();
                  }}>
                     退回魔殿大厅
                  </button>
               )}
               {battleState === 'fighting' && (
                  <span style={{ color: 'var(--gold)', fontFamily: '"Ma Shan Zheng", cursive', animation: 'pulse 1s infinite' }}>
                     天昏地暗 激斗中...
                  </span>
               )}
            </div>
         </div>
      ) : (
         /* 大厅普通展示 */
         <div style={{ flex: 1, display: 'flex', gap: '2rem', marginTop: '1.5rem', zIndex: 1, overflow: 'hidden' }}>
            
            {/* 左侧 Boss 状态面板 */}
            <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '8px' }}>
               
               {/* Boss 状态卡 */}
               <div className="wuxia-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', position: 'relative' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                     <div style={{ padding: '20px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.05)', border: '2px solid rgba(239, 68, 68, 0.2)', boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)' }}>
                        <Sword size={60} style={{ color: 'var(--crimson)' }} />
                     </div>
                  </div>
                  
                  <h3 style={{ fontSize: '1.8rem', fontFamily: '"Ma Shan Zheng", cursive', color: 'var(--crimson)' }}>
                     太古噬魂魔罗
                  </h3>
                  
                  {/* 状态判定与进度展示 */}
                  {worldBossState.active ? (
                     <div style={{ marginTop: '1rem' }}>
                        <p style={{ color: 'var(--gold)', fontSize: '1.1rem', fontWeight: 'bold' }}>
                           💀 怨灵魔尊已然显化降世！
                        </p>
                        <div style={{ marginTop: '1rem' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                              <span>全服共享血量: {worldBossState.hp.toLocaleString()} / {worldBossState.maxHp.toLocaleString()}</span>
                              <span>{(worldBossState.hp / worldBossState.maxHp * 100).toFixed(2)}%</span>
                           </div>
                           <div style={{ height: '14px', background: '#222', borderRadius: '50px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                              <div style={{ height: '100%', width: `${worldBossState.hp / worldBossState.maxHp * 100}%`, background: 'linear-gradient(90deg, #dc2626, #7f1d1d)', transition: 'width 0.4s' }} />
                           </div>
                        </div>
                        {worldBossState.hp > 0 ? (
                           <button className="btn-primary animate-pulse" onClick={startBossFight} style={{ marginTop: '1.5rem', padding: '1rem 3.5rem', fontSize: '1.2rem', background: 'linear-gradient(135deg, #dc2626, #7f1d1d)', color: '#fff', boxShadow: '0 0 20px rgba(220, 38, 38, 0.4)' }}>
                              <Play size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} /> 消耗 10 精魂，进殿降魔
                           </button>
                        ) : (
                           <div style={{ marginTop: '1.5rem', color: 'var(--jade)', fontSize: '1.2rem', fontFamily: '"Ma Shan Zheng", cursive' }}>
                              🎉 魔尊已被诸位大侠剿灭！最后一击由 【{worldBossState.lastHitBy}】 完成！
                           </div>
                        )}
                     </div>
                  ) : worldBossState.signupOpen ? (
                     <div style={{ marginTop: '1rem' }}>
                        <p style={{ color: 'var(--gold)', fontSize: '1.1rem' }}>
                           📢 请战帖投递中 (降临倒计时)
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                           已有 {worldBossState.signups.length} 名大侠投递请战帖登记参战。
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                           {worldBossState.signups.includes(player.name) ? (
                              <span style={{ color: 'var(--jade)', padding: '0.6rem 2rem', background: 'rgba(16,185,129,0.1)', border: '1px dashed var(--jade)', borderRadius: '4px' }}>
                                 ✓ 大侠已递交请战帖
                              </span>
                           ) : (
                              <button className="btn-primary" onClick={handleSignup} style={{ padding: '0.8rem 2.5rem', background: 'linear-gradient(135deg, var(--gold), #b45309)' }}>
                                 投递请战帖 (登记意向)
                              </button>
                           )}
                        </div>
                     </div>
                  ) : worldBossState.auctionActive ? (
                     <div style={{ marginTop: '1rem' }}>
                        <p style={{ color: '#c084fc', fontSize: '1.2rem', fontFamily: '"Ma Shan Zheng", cursive' }}>
                           ⚖ 神话秘宝限时竞拍中！
                        </p>
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(192, 132, 252, 0.3)', borderRadius: '8px', marginTop: '1rem', display: 'inline-block', minWidth: '300px' }}>
                           <h4 style={{ color: 'var(--gold)', fontSize: '1.2rem' }}>【{worldBossState.auctionItem?.name}】</h4>
                           <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>物品等阶: 神话本命宝物</p>
                           <p style={{ fontSize: '1.1rem', marginTop: '8px' }}>
                              当前最高出价: <strong style={{ color: 'var(--gold)' }}>{worldBossState.highestBid || 100}</strong> 银两
                           </p>
                           <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                              最高出价者: {worldBossState.highestBidder || '黑市商会 (系统保底回购)'}
                           </p>
                           <p style={{ fontSize: '0.85rem', color: 'var(--crimson)', marginTop: '6px' }}>
                              倒计时: {formatTime(worldBossState.auctionEndTime)}
                           </p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1.5rem' }}>
                           <input 
                              type="number" 
                              value={bidPrice}
                              onChange={(e) => setBidPrice(parseInt(e.target.value) || 0)}
                              placeholder={`起拍价 > ${worldBossState.highestBid}`}
                              style={{ width: '130px', padding: '0.5rem', background: '#111', border: '1px solid #c084fc', borderRadius: '4px', color: '#fff', textAlign: 'center' }}
                           />
                           <button className="btn-primary" onClick={handleBid} style={{ padding: '0.5rem 2rem', background: 'linear-gradient(135deg, #c084fc, #7c3aed)' }}>
                              加价出资
                           </button>
                        </div>
                     </div>
                  ) : (
                     <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
                        大魔罗尚未显化，虚空风暴积蓄中。请诸位大侠关注周五限时开启公告！
                     </p>
                  )}
               </div>

               {/* 玩法说明 */}
               <div className="wuxia-card" style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.85rem', lineHeight: '1.7' }}>
                  <h4 style={{ color: 'var(--gold)', marginBottom: '6px', fontSize: '0.95rem' }}>讨伐魔尊战纪规诫</h4>
                  <p>1. **请战登记**：周五中午 12:00 至晚上 19:00。Boss HP 以实际登记人数为准（平滑公式，杜绝死号撑血）。中途参战亦可但血上限不再增加。</p>
                  <p>2. **克制克制**：Boss 默认拥有 80% 的受创减免，宝物上的【破魔】词条可以直接刺破该护体！</p>
                  <p>3. **击晕特化**：Boss 免疫眩晕，但受击晕影响时触发“破招威压”，其本回合反噬攻击降低 50%。</p>
                  <p>4. **分红机制**：剿灭魔罗后，爆出的神物将在 23:00 公开竞拍。流拍则由商会以 100 银两强行回收。除去 10% 税收，所得 90% 银两全员按输出百分比派发大分红！</p>
               </div>
            </div>

            {/* 右侧 并肩作战/输出排行 看板 */}
            <div style={{ flex: 1.2, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
               <h3 style={{ fontSize: '1.2rem', fontFamily: '"Ma Shan Zheng", cursive', color: 'var(--crimson)', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={18} /> 并肩御敌榜
               </h3>
               <div style={{ flex: 1, overflowY: 'auto' }}>
                  {renderFightersList()}
               </div>
            </div>

         </div>
      )}

      {/* 底部开发者调试控制面板 */}
      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', zIndex: 1, background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '6px' }}>
         <h5 style={{ color: 'var(--gold)', fontSize: '0.8rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldAlert size={12} /> 【开发调试控制台】（仅用于本功能联调测试）：
         </h5>
         <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={() => devControlWorldBoss('open_signup')} style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>开启请战帖登记</button>
            <button className="btn-secondary" onClick={() => devControlWorldBoss('spawn_boss')} style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>强制Boss显化降世</button>
            <button className="btn-secondary" onClick={() => devControlWorldBoss('trigger_auction')} style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>强制开启爆装竞拍</button>
            <button className="btn-secondary" onClick={() => devControlWorldBoss('force_auction_end')} style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem' }}>强制竞拍截止(分红/发放)</button>
            <button className="btn-secondary" onClick={() => devControlWorldBoss('reset')} style={{ fontSize: '0.75rem', padding: '0.3rem 0.8rem', borderColor: 'var(--danger)' }}>重置清空状态</button>
         </div>
      </div>
    </div>
  );
}

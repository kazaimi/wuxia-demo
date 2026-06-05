import React, { useState, useEffect, useRef } from 'react';
import { useGameStore, TREASURES_DB } from '../store/gameState';
import { generateEventDeck } from '../data/realmEvents';
import { Map, DoorOpen } from 'lucide-react';
import EventIllustration from './EventIllustration';
import { useCleanImage } from '../utils/imageProcess';
import { SoundManager } from '../utils/SoundManager';

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

  useEffect(() => {
    fetchRealmGhosts();
  }, [fetchRealmGhosts]);

  const startGhostFight = (ghost) => {
     setActiveGhostFight(ghost);
     setGhostFightLogs([
        `====== 宿命对决：神魂怨灵 ${ghost.creatorName} ======`,
        `怨灵残留的执念言道：“${ghost.message}”`,
        `对决开战！`
     ]);
     setGhostFightState('fighting');
     SoundManager.play('sfx_task_accept');

     let turn = 1;
     const maxHpUser = player.maxHp;
     let curHpUser = player.hp || player.maxHp;
     const calculateMaxHp = (level, con) => Math.min(7000, 100 + level * 15 + (con || 0) * 10);
     const maxHpGhost = calculateMaxHp(ghost.level, ghost.attributes.con);
     let curHpGhost = maxHpGhost;

     const interval = setInterval(() => {
        if (curHpUser <= 0) {
           clearInterval(interval);
           handleGhostFightResult(false, ghost);
           return;
        }
        if (curHpGhost <= 0) {
           clearInterval(interval);
           handleGhostFightResult(true, ghost);
           return;
        }
        if (turn > 20) {
           clearInterval(interval);
           const userRatio = curHpUser / maxHpUser;
           const ghostRatio = curHpGhost / maxHpGhost;
           if (userRatio >= ghostRatio) {
              handleGhostFightResult(true, ghost);
           } else {
              handleGhostFightResult(false, ghost);
           }
           return;
        }

        const userSpeed = player.attributes.agi;
        const ghostSpeed = ghost.attributes.agi;
        const userFirst = userSpeed >= ghostSpeed;

        const calcDmg = (str, con) => {
           const raw = str * 3.5 + 40 + Math.random() * 40;
           const def = con * 1.1;
           return Math.max(35, Math.floor(raw - def));
        };

        let turnLog = `【第 ${turn} 回合】\n`;
        if (userFirst) {
           const dmgToGhost = calcDmg(player.attributes.str, ghost.attributes.con);
           curHpGhost = Math.max(0, curHpGhost - dmgToGhost);
           turnLog += `你 眼神如电率先出招，对怨灵造成 ${dmgToGhost} 点伤害。(怨灵血量: ${curHpGhost}/${maxHpGhost})`;

           if (curHpGhost > 0) {
              const dmgToUser = calcDmg(ghost.attributes.str, player.attributes.con);
              curHpUser = Math.max(0, curHpUser - dmgToUser);
              turnLog += `\n怨灵神魂 阴冷反击，对你造成 ${dmgToUser} 点伤害。(你的血量: ${curHpUser}/${maxHpUser})`;
           }
        } else {
           const dmgToUser = calcDmg(ghost.attributes.str, player.attributes.con);
           curHpUser = Math.max(0, curHpUser - dmgToUser);
           turnLog += `怨灵神魂 身法更快抢先出手，对你造成 ${dmgToUser} 点伤害。(你的血量: ${curHpUser}/${maxHpUser})`;

           if (curHpUser > 0) {
              const dmgToGhost = calcDmg(player.attributes.str, ghost.attributes.con);
              curHpGhost = Math.max(0, curHpGhost - dmgToGhost);
              turnLog += `\n你 咬牙稳住架势，一招重击对怨灵造成 ${dmgToGhost} 点伤害。(怨灵血量: ${curHpGhost}/${maxHpGhost})`;
           }
        }

        setGhostFightLogs(prev => [...prev, turnLog]);
        turn++;
     }, 500);
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
    if ((player.secretRealmAttempts || 0) >= 3) {
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
       const otherGhosts = realmGhosts.filter(g => g.creatorName !== player.name);
       if (otherGhosts.length > 0) {
          const ghostsToInsert = [...otherGhosts].sort(() => 0.5 - Math.random()).slice(0, 2);
          ghostsToInsert.forEach((ghost, idx) => {
             const targetDepth = 8 + idx * 3 + Math.floor(Math.random() * 2);
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
       endExploration(curDepth, curKarma, false, null);
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

  const endExploration = (finalDepth, finalKarma, isFail, failType) => {
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
        setState('result');
        return;
     }

     // 播放探索成功古筝扫弦音效
     SoundManager.play('sfx_success');

     newLogs.push(`\n【退隐结算】你驻足不前，开始清点此行造化。最终深度：${finalDepth}，累积业力：${finalKarma}`);
     let rewardDesc = "";
     
     if (finalDepth < 5) {
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
        
        if (finalKarma > 0) {
           rewardDesc = `机缘巧合下，冥冥中的定数将一件流光溢彩的『${t.name}』送到了你的面前。你满怀敬畏地将其收入囊中，飘然而去。`;
        } else if (finalKarma < 0) {
           rewardDesc = `你蛮横地一掌拍碎了前方的障碍，从中贪婪地攫取了震慑江湖的『${t.name}』，狂笑着遁出了秘境。`;
        } else {
           rewardDesc = `你在密室的一端发现了一个古玉宝匣，打开一看，内藏绝世奇珍『${t.name}』，真是好造化！`;
        }
        gainTreasure(t.id);
     }
     
     let realmSilver = Math.floor(finalDepth / 5);
     let addKarmaSilver = 0;
     if (finalKarma > 5) addKarmaSilver = 1;
     else if (finalKarma < -5) addKarmaSilver = 2;
     
     if (realmSilver > 0 || addKarmaSilver > 0) {
        let total = realmSilver + addKarmaSilver;
        addSilver(total);
        rewardDesc += `\n此番历练共收获 ${total} 银两`;
        if (addKarmaSilver === 1) rewardDesc += ` (包含好人好报额外打赏 +1)`;
        if (addKarmaSilver === 2) rewardDesc += ` (包含杀人越货强制搜刮 +2)`;
        
        // 延迟播放铜钱交割音效
        setTimeout(() => {
          SoundManager.play('sfx_coin');
        }, 300);
     }
     
     newLogs.push(rewardDesc);
     setLogs(newLogs);
     setState('result');
  };

  if (activeGhostFight) {
     return (
        <div className="glass-panel animate-slide-up" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, rgba(10,10,20,0.98), rgba(5,5,15,1))', color: '#eee', border: '1px solid rgba(239, 68, 68, 0.4)', position: 'relative' }}>
           <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: 'linear-gradient(90deg, transparent, #ef4444, transparent)', opacity: 0.5 }} />
           
           <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '2.2rem', color: '#ef4444', fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '4px', textShadow: '0 0 10px rgba(239,68,68,0.4)' }}>
                 神 魂 对 决
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.4rem' }}>
                 你正在与 【{activeGhostFight.creatorName}】 留存在秘境中的怨灵执念进行殊死相搏
              </p>
           </div>

           <div style={{ flex: 1, background: 'rgba(5,0,0,0.85)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: '"Courier New", monospace', fontSize: '0.95rem', lineHeight: '1.7', boxShadow: 'inset 0 0 25px rgba(0,0,0,0.9)' }}>
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

           <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              {ghostFightState === 'won' && (
                 <button className="btn-primary" style={{ padding: '1rem 3rem', background: 'linear-gradient(135deg, var(--jade), #065f46)' }} onClick={() => {
                    SoundManager.play('sfx_click');
                    setActiveGhostFight(null);
                    nextEvent(deck, depth + 1, karma);
                 }}>
                    战胜怨灵，继续探索
                 </button>
              )}
              {ghostFightState === 'lost' && (
                 <button className="btn-primary" style={{ padding: '1rem 3rem', background: 'linear-gradient(135deg, var(--crimson), #7f1d1d)' }} onClick={() => {
                    SoundManager.play('sfx_click');
                    setActiveGhostFight(null);
                    endExploration(depth, karma, true, '怨魂入体');
                 }}>
                    负伤离开
                 </button>
              )}
              {ghostFightState === 'fighting' && (
                 <span style={{ color: 'var(--gold)', fontSize: '1.1rem', fontFamily: '"Ma Shan Zheng", cursive', animation: 'pulse 1s infinite' }}>
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
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', background: 'rgba(20,20,30,0.8)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(192, 132, 252, 0.2)' }}>
            <div>深径残尺：<span style={{color: 'var(--gold)', fontWeight: 'bold', fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif'}}>{depth}</span> 层</div>
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

          {state === 'result' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
              {!hasDeployedGhost && player.essence >= 20 && depth > 0 && (
                <button 
                  className="btn-primary" 
                  style={{ padding: '0.8rem 2.5rem', background: 'linear-gradient(135deg, #ef4444, #991b1b)', color: '#fff', border: '1px solid var(--crimson)', boxShadow: '0 0 12px rgba(239, 68, 68, 0.3)' }}
                  onClick={() => {
                     SoundManager.play('sfx_click');
                     const msg = prompt(`剥离神魂将消耗 20 点精魂在此第 ${depth} 层设伏怨灵。\n后来者挑战失败时，你将获得 2 银两分红。\n请输入你想给后来者留下的执念遗言（限20字）：`);
                     if (msg !== null) {
                        deployGhostRemnant(depth, msg || "后辈止步，此路不通！");
                        setHasDeployedGhost(true);
                     }
                  }}
                >
                  👹 消耗20精魂在第 {depth} 层设伏怨灵
                </button>
              )}
              <button className="btn-primary" style={{ padding: '1rem 3rem', background: 'linear-gradient(135deg, #c084fc, #7c3aed)', color: '#fff' }} onClick={() => { SoundManager.play('sfx_click'); SoundManager.playMusic('bgm_menu'); setState('idle'); setLogs([]); }}>离开福地</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

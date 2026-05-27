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

  const [state, setState] = useState('idle'); // idle, exploring, result

  const cleanIcon = useCleanImage('/wuxia_realm_icon.png');
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
    
    setDepth(0);
    setKarma(0);
    setLogs(["====== 踏入琅嬛福地 ======\n四周云雾流转，你感觉自己步入了一片遗世独立的秘境……\n"]);
    
    const newDeck = generateEventDeck();
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
            <button className="btn-primary" style={{ marginTop: '1.5rem', alignSelf: 'center', padding: '1rem 3rem', background: 'linear-gradient(135deg, #c084fc, #7c3aed)', color: '#fff' }} onClick={() => { SoundManager.play('sfx_click'); SoundManager.playMusic('bgm_menu'); setState('idle'); setLogs([]); }}>离开福地</button>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useGameStore, TREASURES_DB } from '../store/gameState';
import { generateEventDeck } from '../data/realmEvents';
import { Map, DoorOpen } from 'lucide-react';

export default function SecretRealm() {
  const player = useGameStore(state => state.player);
  const useSecretRealmAttempt = useGameStore(state => state.useSecretRealmAttempt);
  const gainTreasure = useGameStore(state => state.gainTreasure);
  const addDailyDebuff = useGameStore(state => state.addDailyDebuff);

  const [state, setState] = useState('idle'); // idle, exploring, result
  const [deck, setDeck] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [depth, setDepth] = useState(0);
  const [karma, setKarma] = useState(0);
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);

  useEffect(() => {
    if (state === 'exploring' || state === 'result') {
      setTimeout(() => logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }, [logs, state, currentEvent]);

  const startExploration = () => {
    if (player.name !== 'ALEX' && (player.secretRealmAttempts || 0) >= 3) {
      alert("今日琅嬛福地探索次数已尽，大侠请明日再来。");
      return;
    }
    useSecretRealmAttempt();
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
        newLogs.push(`\n【探险失败】你被迫遁出秘境！`);
        if (failType) {
           newLogs.push(`由于遭受重创，你染上了恶兆【${failType}】。直到明日拂晓前，你的运势都将大幅衰减！`);
           addDailyDebuff(failType);
        }
        setLogs(newLogs);
        setState('result');
        return;
     }

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
     
     newLogs.push(rewardDesc);
     setLogs(newLogs);
     setState('result');
  };

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0a0a', color: '#eee', border: '1px solid #333' }}>
       <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Map /> 琅嬛福地 <span style={{fontSize: '1rem', color: 'var(--text-muted)'}}>今日门票：{player.name === 'ALEX' ? '无限测试' : `${3 - (player.secretRealmAttempts || 0)}/3`}</span>
      </h2>
      
      {state === 'idle' ? (
         <div style={{ textAlign: 'center', marginTop: '4rem' }}>
         <p style={{ color: 'var(--text-main)', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '2' }}>
            天衍四九，人遁其一。<br/>
            此处为琅嬛福地，充满了未知的奇遇与致命的凶险。<br/>
            你的每一次选择，都将深刻影响最终的因果与你能到达的深度。<br/>
            切记，见好就收方能全身而退；一味贪念造化，恐有万劫不复之厄！
         </p>
         <button className="btn-primary" onClick={startExploration} style={{ padding: '1rem 3rem', fontSize: '1.2rem', background: '#fff', color: '#000', boxShadow: '0 0 15px rgba(255,255,255,0.3)' }}>踏入秘境</button>
       </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', background: 'rgba(20,20,20,0.8)', padding: '1rem', borderRadius: '8px', border: '1px solid #333' }}>
            <div>深径残尺：<span style={{color: 'var(--warn)', fontWeight: 'bold'}}>{depth}</span> 层</div>
            <div>尘世因果：<span style={{color: karma > 0 ? 'var(--success)' : karma < 0 ? 'var(--danger)' : 'var(--text-main)', fontWeight: 'bold'}}>{karma > 0 ? '+'+karma : karma}</span></div>
          </div>

          <div style={{ flex: 1, background: '#050505', border: '1px solid #222', borderRadius: '8px', padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', fontFamily: '"Courier New", Courier, monospace', fontSize: '1.1rem', lineHeight: '1.7', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)' }}>
            {logs.map((log, i) => (
              <div key={i} style={{ 
                color: log.startsWith('>') ? 'var(--warn)' : log.includes('【探险失败】') ? 'var(--danger)' : (log.includes('『') || log.includes('【退隐结算】')) ? 'var(--primary)' : '#ccc', 
                whiteSpace: 'pre-line',
                animation: 'fadeIn 0.4s' 
              }}>
                {log}
              </div>
            ))}

            {state === 'exploring' && currentEvent && (
               <div style={{ marginTop: '2rem', animation: 'fadeIn 0.6s', borderTop: '1px dashed #444', paddingTop: '1.5rem' }}>
                  <p style={{ color: '#fff', marginBottom: '2rem', textShadow: '0 0 5px rgba(255,255,255,0.2)' }}>{currentEvent.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                     {currentEvent.choices.map((c, i) => {
                        if (c.isHidden && c.isHidden(player)) return null;
                        return (
                           <button key={i} onClick={() => handleChoice(c)} style={{
                              background: '#1a1a1a', border: '1px solid #444', color: '#ddd', padding: '1rem', textAlign: 'left', cursor: 'pointer', borderRadius: '4px',
                              fontFamily: '"Courier New", Courier, monospace', transition: 'all 0.2s', fontSize: '1rem'
                           }} onMouseOver={(e)=>e.target.style.background='#2a2a2a'} onMouseOut={(e)=>e.target.style.background='#1a1a1a'}>
                              {c.text}
                           </button>
                        );
                     })}
                     <button onClick={() => endExploration(depth, karma, false)} style={{
                        background: 'transparent', border: '1px dashed var(--warn)', color: 'var(--warn)', padding: '1rem', textAlign: 'center', cursor: 'pointer', borderRadius: '4px',
                        fontFamily: '"Courier New", Courier, monospace', marginTop: '1.5rem', fontSize: '0.9rem'
                     }} onMouseOver={(e)=>e.target.style.background='rgba(250, 204, 21, 0.1)'} onMouseOut={(e)=>e.target.style.background='transparent'}>
                        <DoorOpen size={16} style={{display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px'}}/> [见好就收，遁出秘境]
                     </button>
                  </div>
               </div>
            )}
            <div ref={logsEndRef} style={{ height: '20px' }}></div>
          </div>

          {state === 'result' && (
            <button className="btn-primary" style={{ marginTop: '1.5rem', alignSelf: 'center', padding: '1rem 3rem', background: '#ccc', color: '#000' }} onClick={() => { setState('idle'); setLogs([]); }}>离开福地</button>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useEffect } from 'react';
import { useGameStore, ATTR_MAP, SKILLS_DB } from '../store/gameState';
import { Target, Gift, RefreshCw } from 'lucide-react';
import { useCleanImage } from '../utils/imageProcess';
import { SoundManager } from '../utils/SoundManager';

export default function TaskHall() {
  const dailyTasks = useGameStore(state => state.dailyTasks);
  const generateTasks = useGameStore(state => state.generateTasks);
  const completeTask = useGameStore(state => state.completeTask);
  const gainExp = useGameStore(state => state.gainExp);
  const setTitle = useGameStore(state => state.setTitle);
  const addActivity = useGameStore(state => state.addActivity);
  const addSilver = useGameStore(state => state.addSilver);
  const learnSkill = useGameStore(state => state.learnSkill);
  const incrementTaskCount = useGameStore(state => state.incrementTaskCount);
  const checkDailyReset = useGameStore(state => state.checkDailyReset);
  const player = useGameStore(state => state.player);

  const cleanIcon = useCleanImage('/wuxia_tasks_icon.png');

  useEffect(() => {
    checkDailyReset();
    if (dailyTasks.length === 0) {
      generateTasks();
    }
  }, [dailyTasks.length, generateTasks, checkDailyReset]);

  const handleAction = (task) => {
    if (task.completed) return;
    if (player.taskCount >= 35) {
       alert("您今日大展身手次数已达 35 次的极限，请明日再战（防止肝帝成魔）！");
       return;
    }
    
    // 播放接取任务动作音效
    SoundManager.play('sfx_task_accept');

    incrementTaskCount();
    const upgradedTitle = addActivity(5);
    
    const pAttr = player.attributes[task.reqAttr] || 0;
    const luk = player.attributes.luk;
    let diff = pAttr - task.difficulty;
    let attrBonus = diff >= 0 ? diff * 0.02 : diff * 0.08; // 属性差值为负时，惩罚加大（每低1点扣8%）
    let rate = 0.5 + attrBonus + 0.35 * (1 - Math.exp(-luk * 0.07));
    rate = Math.max(0.1, Math.min(0.95, rate)); 
    
    const isSuccess = Math.random() <= rate;
    
    completeTask(task.id);

    if (isSuccess) {
      let msg = `任务成功！获得了 ${task.expReward} 点经验。`;
      gainExp(task.expReward);
      
      let gotSilver = 0;
      if (task.stars <= 2 && Math.random() < 0.2) gotSilver = 1;
      else if (task.stars === 3) gotSilver = 1;
      else if (task.stars === 4) gotSilver = 2;
      else if (task.stars === 5) gotSilver = 4;
      
      let isRareDrop = false;
      
      const rareSkills = ['s_taiji', 's_anran', 's5', 's_yijin', 's_xixing', 's_tiyun', 's_shenxing', 's_kuihua', 's_xianglong', 's_dugu', 's_liumai'];
      const midSkills = ['s3', 's4', 's_kuangfeng', 's_shihou'];

      if (upgradedTitle) {
         msg += ` 并且活跃度跨越门槛，名头晋升为了【${upgradedTitle}】！`;
         isRareDrop = true; // 名号提升播放大音效
      }

      if (gotSilver > 0) {
          addSilver(gotSilver);
          msg += `并赚取了 ${gotSilver} 银两！`;
          // 延迟播放金币音效以防重叠
          setTimeout(() => {
            SoundManager.play('sfx_coin');
          }, 150);
      }
      
      if (task.stars === 4 && Math.random() > 0.75) {
         const dropId = midSkills[Math.floor(Math.random() * midSkills.length)];
         const skillName = SKILLS_DB?.find(s => s.id === dropId)?.name || '无名残卷';
         learnSkill(dropId);
         msg += ` 竟在一处破庙捡到了【${skillName}】！`;
         isRareDrop = true;
      }

      if (task.stars === 5) {
        if (Math.random() <= 0.20) {
          const dropId = rareSkills[Math.floor(Math.random() * rareSkills.length)];
          const skillName = SKILLS_DB?.find(s => s.id === dropId)?.name || '绝世残卷';
          learnSkill(dropId);
          msg += ` 成功触发稀世奇遇，掉落了绝世武学秘籍【${skillName}】！`;
          isRareDrop = true;
        }
      }

      // 如果有稀有掉落或境界突破，播放大突破音效，否则播放普通成功音效
      if (isRareDrop) {
        SoundManager.play('sfx_levelup');
      } else {
        SoundManager.play('sfx_success');
      }

      alert(msg);
    } else {
      let failMsg = `很遗憾，由于你这趟【${ATTR_MAP[task.reqAttr]}】未能突破门槛约束，任务执行失败，一无所获且消耗了一次体力！`;
      if (upgradedTitle) {
         failMsg += ` (但随着你四处奔波苦劳积攒，名头反而晋升为了【${upgradedTitle}】！)`;
         SoundManager.play('sfx_levelup');
      } else {
         SoundManager.play('sfx_fail');
      }
      alert(failMsg);
    }
  };

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* 顶部装饰 */}
      <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', opacity: 0.5 }} />

      {/* 右上角绝对定位状态及刷新按钮 */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', zIndex: 10 }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: player.taskCount >= 35 ? 'var(--danger)' : 'var(--gold)', fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif' }}>
           [当日活跃: {player.taskCount} / 35 次]
        </span>
        <button className="btn-primary" onClick={() => { SoundManager.play('sfx_click'); generateTasks(); }} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
          <RefreshCw size={14} /> 刷新榜单
        </button>
      </div>

      {/* 居中大标题排版 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '0.5rem', marginBottom: '1rem' }}>
        <img
          src={cleanIcon}
          alt="悬赏大厅"
          style={{
            width: '130px',
            height: '130px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 12px rgba(212, 175, 55, 0.45))',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        />
        <h2 style={{ fontSize: '2rem', color: 'var(--gold)', fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '4px', marginTop: '0.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
          悬赏大厅
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '600px', textAlign: 'center', margin: '0' }}>
          领取委托需要面对失败的风险，成功率与指定属性倾向强挂钩。不论成功失败都会扣除每日次数。
        </p>
      </div>

      {/* 渐变金丝分割线 */}
      <div style={{ width: '80%', height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', margin: '0.5rem auto 1.5rem', opacity: 0.3 }} />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '8px' }}>
        {dailyTasks.map(task => {
          const pAttr = player.attributes[task.reqAttr] || 0;
          let diff = pAttr - task.difficulty;
          let attrBonus = diff >= 0 ? diff * 0.02 : diff * 0.08;
          let showRate = 0.5 + attrBonus + 0.35 * (1 - Math.exp(-player.attributes.luk * 0.07));
          showRate = Math.floor(Math.max(0.1, Math.min(0.95, showRate)) * 100);

          return (
          <div key={task.id} className="wuxia-card" style={{
            padding: '1rem',
            background: task.completed ? 'rgba(0,0,0,0.5)' : 'var(--glass-bg)',
            border: `1px solid ${task.completed ? 'var(--glass-border)' : (task.stars >= 4 ? 'var(--crimson)' : 'rgba(212, 175, 55, 0.3)')}`,
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'all 0.3s',
            position: 'relative'
          }}>
            {/* 星级装饰 */}
            {task.stars >= 4 && !task.completed && (
              <div style={{ position: 'absolute', top: '-8px', right: '10px', background: 'var(--bg-color)', padding: '0 6px', color: 'var(--crimson)', fontSize: '0.8rem' }}>
                {'★'.repeat(task.stars)}
              </div>
            )}

            <div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.3rem', color: task.completed ? 'var(--text-muted)' : (task.stars>=4 ? 'var(--crimson)' : 'var(--text-main)'), fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif', letterSpacing: '1px' }}>
                {task.title}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{task.desc}</p>

              <div style={{ fontSize: '0.8rem', marginTop: '0.6rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--gold)' }}><Gift size={14} style={{ verticalAlign: 'sub' }}/> +{task.expReward} 修为</span>
                <span title="预估成功率" style={{ color: showRate > 60 ? 'var(--jade)' : 'var(--crimson)' }}>
                  成功率: {showRate}%
                </span>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={() => handleAction(task)}
              disabled={task.completed || player.taskCount >= 35}
              style={{ padding: '0.5rem 1rem', filter: task.completed ? 'grayscale(1)' : 'none' }}
            >
              {task.completed ? '已揭榜' : '接取委托'}
            </button>
          </div>
        )})}
      </div>
    </div>
  );
}

import React, { useEffect } from 'react';
import { useGameStore, ATTR_MAP, SKILLS_DB } from '../store/gameState';
import { Target, Gift, RefreshCw } from 'lucide-react';

export default function TaskHall() {
  const dailyTasks = useGameStore(state => state.dailyTasks);
  const generateTasks = useGameStore(state => state.generateTasks);
  const completeTask = useGameStore(state => state.completeTask);
  const gainExp = useGameStore(state => state.gainExp);
  const setTitle = useGameStore(state => state.setTitle);
  const addActivity = useGameStore(state => state.addActivity);
  const learnSkill = useGameStore(state => state.learnSkill);
  const incrementTaskCount = useGameStore(state => state.incrementTaskCount);
  const checkDailyReset = useGameStore(state => state.checkDailyReset);
  const player = useGameStore(state => state.player);

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
      
      const rareSkills = ['s_taiji', 's_anran', 's5', 's_yijin', 's_xixing', 's_tiyun', 's_shenxing', 's_kuihua', 's_xianglong', 's_dugu', 's_liumai'];
      const midSkills = ['s3', 's4', 's_kuangfeng', 's_shihou'];

      if (upgradedTitle) {
         msg += ` 并且活跃度跨越门槛，名头晋升为了【${upgradedTitle}】！`;
      }
      
      if (task.stars === 4 && Math.random() > 0.75) {
         const dropId = midSkills[Math.floor(Math.random() * midSkills.length)];
         const skillName = SKILLS_DB?.find(s => s.id === dropId)?.name || '无名残卷';
         learnSkill(dropId);
         msg += ` 竟在一处破庙捡到了【${skillName}】！`;
      }

      if (task.stars === 5) {
        if (Math.random() <= 0.20) {
          const dropId = rareSkills[Math.floor(Math.random() * rareSkills.length)];
          const skillName = SKILLS_DB?.find(s => s.id === dropId)?.name || '绝世残卷';
          learnSkill(dropId);
          msg += ` 成功触发稀世奇遇，掉落了绝世武学秘籍【${skillName}】！`;
        }
      }
      alert(msg);
    } else {
      let failMsg = `很遗憾，由于你这趟【${ATTR_MAP[task.reqAttr]}】未能突破门槛约束，任务执行失败，一无所获且消耗了一次体力！`;
      if (upgradedTitle) {
         failMsg += ` (但随着你四处奔波苦劳积攒，名头反而晋升为了【${upgradedTitle}】！)`;
      }
      alert(failMsg);
    }
  };

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target /> 悬赏大厅
        </h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '1rem', fontWeight: 'bold', color: player.taskCount >= 35 ? 'var(--danger)' : 'var(--warn)' }}>
             [当日活跃: {player.taskCount} / 35 次]
          </span>
          <button className="btn-primary" onClick={generateTasks} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
            <RefreshCw size={16} /> 刷新榜单
          </button>
        </div>
      </div>
      
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        领取委托需要面对失败的风险，成功率与指定属性倾向强挂钩。不论成功失败都会扣除每日次数。
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '8px' }}>
        {dailyTasks.map(task => {
          const pAttr = player.attributes[task.reqAttr] || 0;
          let diff = pAttr - task.difficulty;
          let attrBonus = diff >= 0 ? diff * 0.02 : diff * 0.08;
          let showRate = 0.5 + attrBonus + 0.35 * (1 - Math.exp(-player.attributes.luk * 0.07));
          showRate = Math.floor(Math.max(0.1, Math.min(0.95, showRate)) * 100);

          return (
          <div key={task.id} style={{
            padding: '1rem',
            background: task.completed ? 'rgba(0,0,0,0.5)' : 'var(--glass-bg)',
            border: `1px solid ${task.completed ? 'var(--glass-border)' : (task.stars >= 4 ? 'var(--danger)' : 'var(--primary-glow)')}`,
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'all 0.3s'
          }}>
            <div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.3rem', color: task.completed ? 'var(--text-muted)' : (task.stars>=4 ? 'var(--danger)' : 'var(--text-main)') }}>
                {task.title}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{task.desc}</p>
              
              <div style={{ fontSize: '0.8rem', marginTop: '0.6rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--warn)' }}><Gift size={14} style={{ verticalAlign: 'sub' }}/> +{task.expReward} EXP</span>
                <span title="预估成功率" style={{ color: showRate > 60 ? 'var(--success)' : 'var(--danger)' }}>
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

import React, { useState, useEffect } from 'react';
import EnhancedWarriorAvatar from './EnhancedWarriorAvatar';
import BattleEffects, { DamageFloatNumber } from './BattleEffects';

// 战斗动效演示组件 - 展示所有动效效果
const BattleEffectsDemo = () => {
  const [selectedEffect, setSelectedEffect] = useState(null);
  const [playerState, setPlayerState] = useState({
    name: '张无忌',
    level: 85,
    hp: 7000,
    maxHp: 7000,
    equippedTreasure: 'yiTian',
    equippedSkills: { inner: 's_yijin' },
    buffs: { dodge: 0, defUp: 0, shield: 0, revive: 0 },
    debuffs: { stun: 0, poison: 0, silence: 0, internalWound: 0 },
  });

  const [enemyState, setEnemyState] = useState({
    name: '东方不败',
    level: 92,
    hp: 8500,
    maxHp: 8500,
    equippedTreasure: 'jiMie',
    equippedSkills: { inner: 's_xixing' },
    buffs: { dodge: 0, defUp: 0, shield: 0, revive: 0 },
    debuffs: { stun: 0, poison: 0, silence: 0, internalWound: 0 },
  });

  const [isPlayerAttacking, setIsPlayerAttacking] = useState(false);
  const [isPlayerHit, setIsPlayerHit] = useState(false);
  const [isEnemyAttacking, setIsEnemyAttacking] = useState(false);
  const [isEnemyHit, setIsEnemyHit] = useState(false);
  const [damageAmount, setDamageAmount] = useState(null);
  const [logs, setLogs] = useState([]);

  // 模拟战斗
  const simulateBattle = () => {
    setLogs(prev => [...prev, '⚔️ 战斗开始！']);

    // 回合1：玩家攻击
    setTimeout(() => {
      setIsPlayerAttacking(true);
      setLogs(prev => [...prev, `${playerState.name} 发动攻击！`]);
    }, 500);

    setTimeout(() => {
      setIsPlayerAttacking(false);
      setIsEnemyHit(true);
      setSelectedEffect('swordSlash');
      const dmg = Math.floor(Math.random() * 500 + 300);
      setDamageAmount(dmg);
      setEnemyState(prev => ({ ...prev, hp: Math.max(0, prev.hp - dmg) }));
      setLogs(prev => [...prev, `${playerState.name} 造成 ${dmg} 点伤害！`]);
    }, 1000);

    setTimeout(() => {
      setIsEnemyHit(false);
      setSelectedEffect(null);
      setDamageAmount(null);
    }, 1500);

    // 回合2：敌人反击
    setTimeout(() => {
      setIsEnemyAttacking(true);
      setLogs(prev => [...prev, `${enemyState.name} 发动反击！`]);
    }, 2000);

    setTimeout(() => {
      setIsEnemyAttacking(false);
      setIsPlayerHit(true);
      setSelectedEffect('criticalHit');
      const dmg = Math.floor(Math.random() * 600 + 400);
      setDamageAmount(dmg);
      setPlayerState(prev => ({ ...prev, hp: Math.max(0, prev.hp - dmg) }));
      setLogs(prev => [...prev, `${enemyState.name} 暴击！造成 ${dmg} 点伤害！`]);
    }, 2500);

    setTimeout(() => {
      setIsPlayerHit(false);
      setSelectedEffect(null);
      setDamageAmount(null);
    }, 3000);

    // 回合3：玩家使用技能
    setTimeout(() => {
      setSelectedEffect('auraBurst');
      setLogs(prev => [...prev, `${playerState.name} 运转易筋经！`]);
    }, 3500);

    setTimeout(() => {
      setSelectedEffect(null);
      setPlayerState(prev => ({
        ...prev,
        buffs: { ...prev.buffs, defUp: 3 },
      }));
    }, 4000);

    // 回合4：敌人中毒
    setTimeout(() => {
      setSelectedEffect('poison');
      setEnemyState(prev => ({
        ...prev,
        debuffs: { ...prev.debuffs, poison: 5 },
      }));
      setLogs(prev => [...prev, `${enemyState.name} 中毒了！`]);
    }, 4500);

    setTimeout(() => {
      setSelectedEffect(null);
    }, 5000);

    // 回合5：玩家治疗
    setTimeout(() => {
      setSelectedEffect('heal');
      const heal = 200;
      setPlayerState(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + heal) }));
      setLogs(prev => [...prev, `${playerState.name} 恢复了 ${heal} 点气血！`]);
    }, 5500);

    setTimeout(() => {
      setSelectedEffect(null);
    }, 6000);
  };

  // 演示单个效果
  const demoEffect = (effectName) => {
    setSelectedEffect(effectName);
    setTimeout(() => setSelectedEffect(null), 800);
  };

  // 重置状态
  const resetState = () => {
    setPlayerState(prev => ({ ...prev, hp: prev.maxHp, buffs: { dodge: 0, defUp: 0, shield: 0, revive: 0 }, debuffs: { stun: 0, poison: 0, silence: 0, internalWound: 0 } }));
    setEnemyState(prev => ({ ...prev, hp: prev.maxHp, buffs: { dodge: 0, defUp: 0, shield: 0, revive: 0 }, debuffs: { stun: 0, poison: 0, silence: 0, internalWound: 0 } }));
    setLogs([]);
  };

  const effectButtons = [
    { name: 'swordSlash', label: '剑气划过', color: '#fff' },
    { name: 'heavyHit', label: '重击震动', color: '#dc2626' },
    { name: 'criticalHit', label: '暴击爆发', color: '#dc143c' },
    { name: 'dodge', label: '闪避残影', color: '#00a86b' },
    { name: 'heal', label: '治愈光效', color: '#10b981' },
    { name: 'buff', label: '增益光环', color: '#d4af37' },
    { name: 'debuff', label: '减益诅咒', color: '#8b5cf6' },
    { name: 'revive', label: '涅槃重生', color: '#fbbf24' },
    { name: 'auraBurst', label: '气劲爆发', color: '#d4af37' },
    { name: 'poison', label: '中毒效果', color: '#22c55e' },
    { name: 'stun', label: '眩晕效果', color: '#fbbf24' },
    { name: 'internalWound', label: '内伤效果', color: '#8b5cf6' },
  ];

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: '1.8rem', color: 'var(--gold)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '3px' }}>
        ⚔️ 战斗动效演示
      </h2>

      {/* 战斗区域 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        {/* 角色对战区域 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '40px',
          padding: '1.5rem',
          position: 'relative',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '12px',
        }}>
          {/* 玩家 */}
          <div style={{ position: 'relative' }}>
            <EnhancedWarriorAvatar
              player={playerState}
              isLeft={true}
              isAttacking={isPlayerAttacking}
              isHit={isPlayerHit}
              damageAmount={damageAmount}
            />
          </div>

          {/* VS 标志 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}>
            <div style={{
              fontSize: '2.5rem',
              color: 'var(--crimson)',
              fontFamily: '"Ma Shan Zheng", cursive',
              textShadow: '0 0 20px rgba(220, 20, 60, 0.6)',
              letterSpacing: '8px',
            }}>
              VS
            </div>
          </div>

          {/* 敌人 */}
          <div style={{ position: 'relative' }}>
            <EnhancedWarriorAvatar
              player={enemyState}
              isLeft={false}
              isAttacking={isEnemyAttacking}
              isHit={isEnemyHit}
              damageAmount={damageAmount}
            />
          </div>

          {/* 战斗动效层 */}
          {selectedEffect && (
            <BattleEffects
              effectType={selectedEffect}
              intensity={1.5}
              onComplete={() => setSelectedEffect(null)}
            />
          )}
        </div>

        {/* 效果按钮区 */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          justifyContent: 'center',
          padding: '1rem',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '8px',
        }}>
          {effectButtons.map(btn => (
            <button
              key={btn.name}
              onClick={() => demoEffect(btn.name)}
              style={{
                padding: '8px 16px',
                background: 'rgba(0,0,0,0.4)',
                border: `1px solid ${btn.color}`,
                borderRadius: '6px',
                color: btn.color,
                fontFamily: '"Ma Shan Zheng", cursive',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = `${btn.color}20`;
                e.target.style.boxShadow = `0 0 10px ${btn.color}40`;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(0,0,0,0.4)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* 控制按钮 */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
        }}>
          <button
            className="btn-primary"
            onClick={simulateBattle}
            style={{ padding: '0.8rem 2rem' }}
          >
            模拟战斗
          </button>
          <button
            className="btn-secondary"
            onClick={resetState}
            style={{ padding: '0.8rem 2rem' }}
          >
            重置状态
          </button>
        </div>

        {/* 战斗日志 */}
        <div style={{
          flex: 1,
          background: 'var(--bg-color)',
          border: '1px solid var(--glass-border)',
          borderRadius: '8px',
          padding: '1rem',
          overflowY: 'auto',
          maxHeight: '200px',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
        }}>
          {logs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
              点击"模拟战斗"或单独效果按钮查看动效演示
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={i} style={{
                color: log.includes('暴击') ? 'var(--danger)' : log.includes('恢复') ? 'var(--success)' : 'var(--text-main)',
                padding: '4px 0',
                animation: 'slideUp 0.3s',
              }}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 说明 */}
      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        background: 'rgba(212, 175, 55, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(212, 175, 55, 0.2)',
      }}>
        <h3 style={{ color: 'var(--gold)', marginBottom: '0.5rem', fontFamily: '"Ma Shan Zheng", cursive' }}>
          动效说明
        </h3>
        <ul style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.6', paddingLeft: '1.2rem' }}>
          <li><strong style={{ color: 'var(--text-main)' }}>剑气划过</strong> - SVG stroke 动画，模拟武器挥砍轨迹</li>
          <li><strong style={{ color: 'var(--text-main)' }}>重击震动</strong> - CSS shake 抖动，打击感反馈</li>
          <li><strong style={{ color: 'var(--text-main)' }}>暴击爆发</strong> - 红色光晕扩散 + 剑气四散</li>
          <li><strong style={{ color: 'var(--text-main)' }}>气劲爆发</strong> - 水墨晕染效果，内力外放</li>
          <li><strong style={{ color: 'var(--text-main)' }}>状态差分</strong> - 角色表情随气血变化（正常/受伤/重伤/死亡）</li>
        </ul>
      </div>
    </div>
  );
};

export default BattleEffectsDemo;
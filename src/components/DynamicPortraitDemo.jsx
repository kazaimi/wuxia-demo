import React, { useState } from 'react';
import DynamicPortrait from './DynamicPortrait';

/**
 * 动态立绘演示页面
 */
const DynamicPortraitDemo = () => {
  const [gender, setGender] = useState('male');
  const [state, setState] = useState('idle');
  const [silhouette, setSilhouette] = useState(false);
  const [weaponType, setWeaponType] = useState('sword');
  const [auraColor, setAuraColor] = useState('#4facfe');

  const colors = [
    { name: '冰蓝', value: '#4facfe' },
    { name: '剑气', value: '#00ff88' },
    { name: '烈火', value: '#ff6b35' },
    { name: '紫霞', value: '#c084fc' },
    { name: '金光', value: '#ffd700' },
  ];

  const states = [
    { name: '常规', value: 'idle' },
    { name: '出招', value: 'attacking' },
    { name: '受击', value: 'hit' },
    { name: '重伤', value: 'critical' },
  ];

  const weapons = [
    { name: '剑', value: 'sword' },
    { name: '刀', value: 'blade' },
    { name: '枪', value: 'spear' },
    { name: '拳', value: 'fist' },
  ];

  return (
    <div style={{
      padding: '2rem',
      background: 'linear-gradient(180deg, rgba(10,10,20,0.95), rgba(5,5,15,0.98))',
      borderRadius: '12px',
      border: '1px solid rgba(192, 132, 252, 0.3)',
      minHeight: '600px',
    }}>
      <h2 style={{
        fontSize: '1.8rem',
        color: '#c084fc',
        marginBottom: '2rem',
        fontFamily: '"Ma Shan Zheng", cursive',
        letterSpacing: '3px',
        textAlign: 'center',
      }}>
        ✦ 动态立绘演示 ✦
      </h2>

      {/* 控制面板 */}
      <div style={{
        display: 'flex',
        gap: '2rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {/* 性别 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ color: '#aaa', fontSize: '0.9rem' }}>性别</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['male', 'female'].map(g => (
              <button
                key={g}
                onClick={() => setGender(g)}
                style={{
                  padding: '8px 16px',
                  background: gender === g ? '#c084fc' : 'rgba(30,30,50,0.8)',
                  border: '1px solid rgba(192, 132, 252, 0.3)',
                  color: gender === g ? '#fff' : '#ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontFamily: '"Ma Shan Zheng", cursive',
                }}
              >
                {g === 'male' ? '男侠' : '女侠'}
              </button>
            ))}
          </div>
        </div>

        {/* 状态 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ color: '#aaa', fontSize: '0.9rem' }}>状态</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {states.map(s => (
              <button
                key={s.value}
                onClick={() => setState(s.value)}
                style={{
                  padding: '8px 16px',
                  background: state === s.value ? '#c084fc' : 'rgba(30,30,50,0.8)',
                  border: '1px solid rgba(192, 132, 252, 0.3)',
                  color: state === s.value ? '#fff' : '#ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontFamily: '"Ma Shan Zheng", cursive',
                }}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* 武器 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ color: '#aaa', fontSize: '0.9rem' }}>武器</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {weapons.map(w => (
              <button
                key={w.value}
                onClick={() => setWeaponType(w.value)}
                style={{
                  padding: '8px 16px',
                  background: weaponType === w.value ? '#c084fc' : 'rgba(30,30,50,0.8)',
                  border: '1px solid rgba(192, 132, 252, 0.3)',
                  color: weaponType === w.value ? '#fff' : '#ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontFamily: '"Ma Shan Zheng", cursive',
                }}
              >
                {w.name}
              </button>
            ))}
          </div>
        </div>

        {/* 气劲颜色 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ color: '#aaa', fontSize: '0.9rem' }}>气劲颜色</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {colors.map(c => (
              <button
                key={c.value}
                onClick={() => setAuraColor(c.value)}
                style={{
                  padding: '8px 16px',
                  background: auraColor === c.value ? c.value : 'rgba(30,30,50,0.8)',
                  border: `2px solid ${c.value}`,
                  color: auraColor === c.value ? '#fff' : c.value,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontFamily: '"Ma Shan Zheng", cursive',
                  boxShadow: auraColor === c.value ? `0 0 10px ${c.value}` : 'none',
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* 水墨剪影 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ color: '#aaa', fontSize: '0.9rem' }}>模式</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setSilhouette(false)}
              style={{
                padding: '8px 16px',
                background: !silhouette ? '#c084fc' : 'rgba(30,30,50,0.8)',
                border: '1px solid rgba(192, 132, 252, 0.3)',
                color: !silhouette ? '#fff' : '#ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: '"Ma Shan Zheng", cursive',
              }}
            >
              工笔
            </button>
            <button
              onClick={() => setSilhouette(true)}
              style={{
                padding: '8px 16px',
                background: silhouette ? '#c084fc' : 'rgba(30,30,50,0.8)',
                border: '1px solid rgba(192, 132, 252, 0.3)',
                color: silhouette ? '#fff' : '#ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: '"Ma Shan Zheng", cursive',
              }}
            >
              剪影
            </button>
          </div>
        </div>
      </div>

      {/* 立绘展示区 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: silhouette ? 'linear-gradient(180deg, #0a0a0a, #050505)' : 'linear-gradient(180deg, rgba(20,15,25,0.9), rgba(10,5,15,0.95))',
        borderRadius: '12px',
        padding: '2rem',
        border: '1px solid rgba(192, 132, 252, 0.2)',
        minHeight: '400px',
      }}>
        <DynamicPortrait
          gender={gender}
          state={state}
          silhouette={silhouette}
          weaponType={weaponType}
          auraColor={auraColor}
          size={180}
        />
      </div>

      {/* 说明 */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '8px',
        color: '#aaa',
        fontSize: '0.85rem',
        lineHeight: '1.8',
      }}>
        <h4 style={{ color: '#c084fc', marginBottom: '0.5rem' }}>✦ 功能说明</h4>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li><strong>呼吸动画</strong>：衣角、发丝随呼吸轻微摆动</li>
          <li><strong>状态差分</strong>：常规态气定神闲，出招态周身气劲发光，受击态红光震动，重伤态画面变暗</li>
          <li><strong>水墨剪影</strong>：只展示黑色轮廓，武器和眼睛点缀气劲亮色，高级武侠韵味</li>
          <li><strong>武器类型</strong>：剑、刀、枪、拳套四种武器</li>
        </ul>
      </div>
    </div>
  );
};

export default DynamicPortraitDemo;
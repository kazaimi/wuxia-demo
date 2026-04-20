import React, { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Shield, Swords, Brain, Zap, Clover } from 'lucide-react';

const ATTR_CONFIG = [
  { k: 'con', n: '体质', icon: Shield, color: '#22c55e' },
  { k: 'str', n: '力量', icon: Swords, color: '#ef4444' },
  { k: 'int', n: '智慧', icon: Brain, color: '#3b82f6' },
  { k: 'agi', n: '敏捷', icon: Zap, color: '#f59e0b' },
  { k: 'luk', n: '幸运', icon: Clover, color: '#10b981' },
];

export default function AttributeRadar({ attributes, freePoints, onAllocate }) {
  const [inputValues, setInputValues] = useState({});

  const radarData = ATTR_CONFIG.map(attr => ({
    attribute: attr.n,
    value: attributes[attr.k] || 0,
    fullMark: Math.max(100, ...Object.values(attributes) + 20),
  }));

  const handleInputChange = (attrKey, value) => {
    setInputValues(prev => ({ ...prev, [attrKey]: value }));
  };

  const handleInputSubmit = (attrKey) => {
    const amount = parseInt(inputValues[attrKey], 10);
    if (!isNaN(amount) && amount > 0 && amount <= freePoints) {
      onAllocate(attrKey, amount);
      setInputValues(prev => ({ ...prev, [attrKey]: '' }));
    }
  };

  const handleSliderChange = (attrKey, newValue) => {
    const currentValue = attributes[attrKey] || 0;
    const diff = newValue - currentValue;
    if (diff > 0 && diff <= freePoints) {
      onAllocate(attrKey, diff);
    }
  };

  const maxValue = Math.max(100, ...Object.values(attributes) + 20);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* 雷达图 */}
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.2)" />
            <PolarAngleAxis
              dataKey="attribute"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, maxValue]}
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickCount={5}
            />
            <Radar
              name="属性"
              dataKey="value"
              stroke="#4facfe"
              fill="#4facfe"
              fillOpacity={0.4}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* 属性调整区域 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {ATTR_CONFIG.map(attr => {
          const IconComp = attr.icon;
          const currentVal = attributes[attr.k] || 0;
          return (
            <div key={attr.k} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconComp size={16} color={attr.color} style={{ flexShrink: 0 }} />
              <span style={{ width: '40px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{attr.n}</span>

              {/* 滑块 */}
              <input
                type="range"
                min={currentVal}
                max={currentVal + freePoints}
                value={currentVal}
                onChange={(e) => handleSliderChange(attr.k, parseInt(e.target.value, 10))}
                disabled={freePoints === 0}
                style={{
                  flex: 1,
                  height: '6px',
                  background: `linear-gradient(to right, ${attr.color} ${(currentVal / maxValue) * 100}%, rgba(255,255,255,0.1) ${(currentVal / maxValue) * 100}%)`,
                  borderRadius: '3px',
                  cursor: freePoints > 0 ? 'pointer' : 'not-allowed',
                  opacity: freePoints > 0 ? 1 : 0.5,
                }}
              />

              {/* 数值显示 */}
              <span style={{
                width: '36px',
                textAlign: 'center',
                fontWeight: 'bold',
                color: attr.color,
                fontSize: '0.9rem'
              }}>
                {currentVal}
              </span>

              {/* 输入框 */}
              {freePoints > 0 && (
                <input
                  type="number"
                  min="1"
                  max={freePoints}
                  placeholder="+"
                  value={inputValues[attr.k] || ''}
                  onChange={(e) => handleInputChange(attr.k, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleInputSubmit(attr.k);
                    }
                  }}
                  style={{
                    width: '50px',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '4px',
                    padding: '2px 4px',
                    color: '#fff',
                    fontSize: '0.8rem',
                    textAlign: 'center',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

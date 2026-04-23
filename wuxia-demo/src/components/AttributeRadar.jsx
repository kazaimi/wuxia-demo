import { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Shield, Swords, Brain, Zap, Clover } from 'lucide-react';

const ATTR_CONFIG = [
  { k: 'con', n: '体质', icon: Shield, color: '#22c55e' },
  { k: 'str', n: '力量', icon: Swords, color: '#ef4444' },
  { k: 'int', n: '智慧', icon: Brain, color: '#3b82f6' },
  { k: 'agi', n: '敏捷', icon: Zap, color: '#f59e0b' },
  { k: 'luk', n: '幸运', icon: Clover, color: '#10b981' },
];

export default function AttributeRadar({ attributes, permanentAttributes, freePoints, inBattle, onSetAttribute }) {
  const [inputValues, setInputValues] = useState({});

  // 计算滑块的最大值
  const totalPoints = Object.values(attributes).reduce((a, b) => a + b, 0) + freePoints;
  const sliderMax = Math.max(100, totalPoints + 20);

  // 计算每个属性的最大可分配值
  const getAttrMax = (attrKey) => {
    // 其他属性的最小值之和（永久加成）
    const otherMinsSum = ATTR_CONFIG
      .filter(a => a.k !== attrKey)
      .reduce((sum, a) => sum + (permanentAttributes?.[a.k] || 0), 0);
    // 最大值 = 总点数 - 其他属性的最小值之和
    return totalPoints - otherMinsSum;
  };

  const radarData = ATTR_CONFIG.map(attr => ({
    attribute: attr.n,
    value: attributes[attr.k] || 0,
    fullMark: sliderMax,
  }));

  const handleInputChange = (attrKey, value) => {
    setInputValues(prev => ({ ...prev, [attrKey]: value }));
  };

  const handleInputSubmit = (attrKey) => {
    if (inBattle) return;
    const newValue = parseInt(inputValues[attrKey], 10);
    if (!isNaN(newValue) && newValue >= 0) {
      onSetAttribute(attrKey, newValue);
      setInputValues(prev => ({ ...prev, [attrKey]: '' }));
    }
  };

  const handleSliderChange = (attrKey, newValue) => {
    if (inBattle) return;
    onSetAttribute(attrKey, newValue);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* 雷达图 */}
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.2)" />
            <PolarAngleAxis
              dataKey="attribute"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, sliderMax]}
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {ATTR_CONFIG.map(attr => {
          const IconComp = attr.icon;
          const currentVal = attributes[attr.k] || 0;
          const permVal = permanentAttributes?.[attr.k] || 0;
          const minVal = permVal; // 最小值为永久属性加成
          const maxVal = getAttrMax(attr.k); // 最大值为可分配的最大值

          return (
            <div key={attr.k} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconComp size={16} color={attr.color} style={{ flexShrink: 0 }} />
              <span style={{ width: '36px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{attr.n}</span>

              {/* 滑块 */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="range"
                  min={minVal}
                  max={maxVal}
                  value={currentVal}
                  onChange={(e) => handleSliderChange(attr.k, parseInt(e.target.value, 10))}
                  disabled={inBattle}
                  className="attribute-slider"
                  style={{
                    flex: 1,
                    '--slider-color': attr.color,
                    '--slider-percent': `${(currentVal / sliderMax) * 100}%`,
                  }}
                />
              </div>

              {/* 数值显示 */}
              <span style={{
                width: '42px',
                textAlign: 'center',
                fontWeight: 'bold',
                color: attr.color,
                fontSize: '0.9rem'
              }}>
                {currentVal}
                {permVal > 0 && (
                  <span style={{ fontSize: '0.7rem', color: '#888', fontWeight: 'normal' }}>
                    {'\n'}(+{permVal})
                  </span>
                )}
              </span>

              {/* 输入框 */}
              {!inBattle && (
                <input
                  type="number"
                  min={minVal}
                  max={maxVal}
                  placeholder="设"
                  value={inputValues[attr.k] || ''}
                  onChange={(e) => handleInputChange(attr.k, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleInputSubmit(attr.k);
                    }
                  }}
                  style={{
                    width: '48px',
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

      {/* 图例说明 */}
      {Object.values(permanentAttributes || {}).some(v => v > 0) && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          括号内 (+X) 为永久属性加成
        </div>
      )}
    </div>
  );
}

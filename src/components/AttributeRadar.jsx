import { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Shield, Swords, Brain, Zap, Clover } from 'lucide-react';

// 五行古味色谱配色定义
const ATTR_CONFIG = [
  { k: 'con', n: '体质', icon: Shield, color: '#859b73' }, // 温润铜绿/青玉
  { k: 'str', n: '力量', icon: Swords, color: '#a63e3e' }, // 劫火朱砂/赤红
  { k: 'int', n: '智慧', icon: Brain, color: '#d97706' },  // 余烬暗橙/琥珀
  { k: 'agi', n: '敏捷', icon: Zap, color: '#c29d38' },    // 鎏金古铜/金饰
  { k: 'luk', n: '幸运', icon: Clover, color: '#0f766e' },  // 沧海黛蓝/苍青
];

export default function AttributeRadar({ attributes, permanentAttributes, freePoints, inBattle, onSetAttribute }) {
  const [inputValues, setInputValues] = useState({});

  // 计算滑块的最大值
  const totalPoints = Object.values(attributes).reduce((a, b) => a + b, 0) + freePoints;
  const sliderMax = Math.max(100, totalPoints + 20);

  // 计算每个属性的最大可分配值 = 当前值 + 剩余潜能点
  const getAttrMax = (attrKey) => {
    const currentVal = attributes[attrKey] || 0;
    return currentVal + freePoints;
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
    if (!newValue && newValue !== 0) return;
    const minVal = permanentAttributes?.[attrKey] || 0;
    const maxVal = getAttrMax(attrKey);
    const clampedValue = Math.max(minVal, Math.min(maxVal, newValue));
    onSetAttribute(attrKey, clampedValue);
    setInputValues(prev => ({ ...prev, [attrKey]: '' }));
  };

  const handleSliderChange = (attrKey, newValue) => {
    if (inBattle) return;
    onSetAttribute(attrKey, newValue);
  };

  const embedStyles = `
    /* 古风滑动条 */
    .wuxia-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 4px;
      border-radius: 2px;
      background: transparent;
      outline: none;
      cursor: pointer;
    }
    .wuxia-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #fff5d4;
      border: 2px solid var(--gold);
      box-shadow: 0 0 6px var(--gold-glow);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: grab;
    }
    .wuxia-slider::-webkit-slider-thumb:hover {
      transform: scale(1.25);
      background: #ffffff;
      box-shadow: 0 0 12px rgba(249, 115, 22, 0.8), 0 0 6px var(--gold);
    }
    .wuxia-slider::-webkit-slider-thumb:active {
      cursor: grabbing;
      transform: scale(1.3);
      box-shadow: 0 0 16px rgba(249, 115, 22, 0.9), 0 0 8px var(--gold);
    }
    .wuxia-slider::-moz-range-thumb {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #fff5d4;
      border: 2px solid var(--gold);
      box-shadow: 0 0 6px var(--gold-glow);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: grab;
    }
    .wuxia-slider::-moz-range-thumb:hover {
      transform: scale(1.25);
      background: #ffffff;
      box-shadow: 0 0 12px rgba(249, 115, 22, 0.8), 0 0 6px var(--gold);
    }
    .wuxia-slider::-moz-range-thumb:active {
      cursor: grabbing;
      transform: scale(1.3);
      box-shadow: 0 0 16px rgba(249, 115, 22, 0.9), 0 0 8px var(--gold);
    }

    /* 古典微调按钮 */
    .wuxia-adjust-btn {
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--glass-border);
      background: rgba(10, 5, 5, 0.6);
      color: var(--gold);
      border-radius: 50%;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: bold;
      transition: all 0.2s ease;
      user-select: none;
      flex-shrink: 0;
      line-height: 1;
    }
    .wuxia-adjust-btn:hover:not(:disabled) {
      border-color: var(--gold);
      color: #fff5d4;
      background: rgba(194, 157, 56, 0.15);
      box-shadow: 0 0 8px var(--gold-glow);
      transform: scale(1.15);
    }
    .wuxia-adjust-btn:active:not(:disabled) {
      transform: scale(0.92);
    }
    .wuxia-adjust-btn:disabled {
      opacity: 0.25;
      cursor: not-allowed;
      border-color: rgba(255, 255, 255, 0.05);
    }

    /* 古朴设定框 */
    .wuxia-attr-input {
      width: 42px;
      background: rgba(5, 2, 2, 0.7);
      border: 1px solid var(--glass-border);
      border-bottom: 2px solid var(--glass-border);
      border-radius: 3px;
      padding: 2px 0;
      color: #fff5d4;
      font-size: 0.8rem;
      font-family: 'Outfit', sans-serif;
      text-align: center;
      transition: all 0.3s ease;
    }
    .wuxia-attr-input:focus {
      outline: none;
      border-color: var(--gold);
      border-bottom-color: var(--primary);
      box-shadow: 0 0 8px var(--gold-glow);
      background: rgba(20, 10, 10, 0.9);
    }
    .wuxia-attr-input::-webkit-outer-spin-button,
    .wuxia-attr-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    .wuxia-attr-input {
      -moz-appearance: textfield;
    }
  `;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      <style>{embedStyles}</style>

      {/* 雷达图底盘 - 太极微芒效果 */}
      <div style={{
        width: '100%',
        height: 200,
        background: 'radial-gradient(circle, rgba(20, 10, 10, 0.75) 0%, rgba(13, 6, 6, 0.45) 55%, transparent 100%)',
        borderRadius: '50%',
        border: '1px dashed rgba(194, 157, 56, 0.15)',
        boxShadow: 'inset 0 0 20px rgba(194, 157, 56, 0.06)',
        position: 'relative',
        margin: '0 auto'
      }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <RadarChart data={radarData} margin={{ top: 18, right: 32, bottom: 18, left: 32 }}>
              <defs>
                {/* 雷达图填充的太极余烬渐变 */}
                <radialGradient id="wuxiaRadarGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.1" />
                  <stop offset="70%" stopColor="var(--gold)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#fff5d4" stopOpacity="0.65" />
                </radialGradient>
              </defs>
              <PolarGrid stroke="rgba(194, 157, 56, 0.22)" strokeDasharray="3 3" gridType="polygon" />
              <PolarAngleAxis
                dataKey="attribute"
                tick={{ fill: '#e6c280', fontSize: 13, fontFamily: '"Ma Shan Zheng", "Zhi Mang Xing", cursive', letterSpacing: '1px' }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, sliderMax]}
                tick={false}
                stroke="rgba(194, 157, 56, 0.08)"
              />
              <Radar
                name="属性"
                dataKey="value"
                stroke="var(--gold)"
                fill="url(#wuxiaRadarGrad)"
                fillOpacity={0.6}
                strokeWidth={2}
                dot={{ fill: '#fff5d4', stroke: 'var(--gold)', strokeWidth: 1.5, r: 4 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 属性调整区域 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {ATTR_CONFIG.map(attr => {
          const IconComp = attr.icon;
          const currentVal = attributes[attr.k] || 0;
          const permVal = permanentAttributes?.[attr.k] || 0;
          const minVal = permVal; // 最小值为永久属性加成
          const maxVal = getAttrMax(attr.k); // 最大值为可分配的最大值

          return (
            <div key={attr.k} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '6px',
              padding: '8px 10px',
              background: 'rgba(255, 255, 255, 0.015)',
              borderBottom: '1px solid rgba(194, 157, 56, 0.06)',
              borderRadius: '6px'
            }}>
              {/* 第一行：图标、名称、永久加成 与 当前分配点数数值 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* 属性图标 */}
                  <IconComp size={15} color={attr.color} style={{ filter: `drop-shadow(0 0 3px ${attr.color}40)` }} />
                  {/* 属性名称 */}
                  <span style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontFamily: '"Ma Shan Zheng", cursive', letterSpacing: '1px' }}>{attr.n}</span>
                  {/* 额外加成 */}
                  {permVal > 0 && (
                    <span style={{ fontSize: '0.72rem', color: '#859b73', opacity: 0.9, fontFamily: '"Outfit", sans-serif' }}>
                      (今日修持 +{permVal})
                    </span>
                  )}
                </div>

                {/* 右侧数值分配显示 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: 'var(--gold)', fontSize: '1.05rem', fontWeight: 'bold', fontFamily: '"Outfit", sans-serif' }}>
                    {currentVal}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: '"Ma Shan Zheng", cursive' }}>点</span>
                </div>
              </div>

              {/* 第二行：古典微调[-]、大滑块、古典微调[+] 与 设定框 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '24px' }}>
                {/* 古典微调 [-] 按钮 */}
                <button
                  onClick={() => handleSliderChange(attr.k, currentVal - 1)}
                  disabled={inBattle || currentVal <= minVal}
                  className="wuxia-adjust-btn"
                  title="减少一点"
                >
                  -
                </button>

                {/* 大滑轨区域 */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
                  {/* 发光填充背景条 */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '4px',
                    borderRadius: '2px',
                    background: `linear-gradient(to right, var(--gold) ${((currentVal - minVal) / Math.max(1, maxVal - minVal)) * 100}%, rgba(255,255,255,0.06) ${((currentVal - minVal) / Math.max(1, maxVal - minVal)) * 100}%)`,
                    pointerEvents: 'none',
                    boxShadow: currentVal > minVal ? '0 0 6px var(--gold-glow)' : 'none',
                    transition: 'all 0.1s ease',
                  }} />
                  <input
                    type="range"
                    min={minVal}
                    max={maxVal}
                    value={currentVal}
                    onChange={(e) => handleSliderChange(attr.k, parseInt(e.target.value, 10))}
                    disabled={inBattle}
                    className="wuxia-slider"
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      width: '100%'
                    }}
                  />
                </div>

                {/* 古典微调 [+] 按钮 */}
                <button
                  onClick={() => handleSliderChange(attr.k, currentVal + 1)}
                  disabled={inBattle || freePoints <= 0 || currentVal >= maxVal}
                  className="wuxia-adjust-btn"
                  title="增加一点"
                >
                  +
                </button>

                {/* 竹简设定框 */}
                {!inBattle && (
                  <input
                    type="number"
                    min={minVal}
                    max={maxVal}
                    placeholder="调"
                    value={inputValues[attr.k] || ''}
                    onChange={(e) => handleInputChange(attr.k, e.target.value)}
                    onBlur={() => handleInputSubmit(attr.k)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleInputSubmit(attr.k);
                      }
                    }}
                    className="wuxia-attr-input"
                    title="输入具体数值进行设定"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 图例说明 */}
      {Object.values(permanentAttributes || {}).some(v => v > 0) && (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', fontFamily: '"Outfit", "Ma Shan Zheng", sans-serif', letterSpacing: '1px', opacity: 0.8 }}>
          括号内 (+X) 为永久加成 ❖ 绿色数字为今日玉牌修持
        </div>
      )}
    </div>
  );
}

# 宝具属性重构：由基础属性改为具体战斗属性 (攻击、防御、气血、闪避、暴击)

为了让宝具的增益属性更符合传统武侠的观感（武器加攻击，防具加防御和气血），并且消除“加属性很奇怪”的体验，我们将对宝具的**基础属性**与**洗炼器灵词条**进行彻底的重构。

---

## User Review Required

> [!IMPORTANT]
> 1. **属性概念对齐**：宝具不再增加玩家基础属性（力量/体质/敏捷/智慧/幸运），而是直接加成战斗属性：**攻击 (atk)**、**防御 (def)**、**气血 (hp)**、**闪避 (dodge)**、**暴击 (crit)**。
> 2. **战斗公式重构**：
>    - 所有的战斗计算（比武 PVP、福地怨灵对决、世界 BOSS 挑战）都已同步对齐。
>    - 暴击机制引入比武 PVP 和怨灵对决：我们将由 `luk` 与 `crit` 派生出暴击率，触发暴击时伤害为 1.5 倍，并在战报中加上 `[暴击]` 标识，让战斗更有打击感！
> 3. **五行材料洗炼对应**：
>    - 炽阳金沙 $\rightarrow$ 额外攻击 (`extraAtk`)
>    - 枯木灵芝 $\rightarrow$ 额外防御 (`extraDef`)
>    - 无根净水 $\rightarrow$ 额外闪避 (`extraDodge`)
>    - 赤炎地髓 $\rightarrow$ 额外气血 (`extraHp`)
>    - 玄黄土精 $\rightarrow$ 额外暴击 (`extraCrit`)
> 4. **学习功法门槛**：功法学习的前置基础属性（力量、体质等）将仅由玩家本身的基础分配点数及永久增幅决定，不再受当前装备的宝具属性影响（符合“功法研习主要看自身资质，而非外物”的设定）。

---

## Proposed Changes

### [GameState & Database]

#### [MODIFY] [gameState.js](file:///c:/Users/57699/Desktop/PROJECTS/TREA/Trae%20Projects/wuxia-demo/src/store/gameState.js)
- **重构 `TREASURES_DB` 属性**：
  将所有宝具的 `attrs` 修改为具体的战斗属性，例如：
  - `con`/`int` $\rightarrow$ `hp`/`atk` (木质佛珠: `hp: 30, atk: 4`)
  - `str` $\rightarrow$ `atk` (生锈铁剑: `atk: 10`)
  - `agi` $\rightarrow$ `dodge`/`def` (粗布披风: `dodge: 2, def: 5`)
  - `con`/`str`/`int`/`agi`/`luk` 全加成神兵修改为加成生命、攻击、防御、闪避、暴击。
- **新增 `TREASURE_ATTR_MAP` 对照表**：
  ```javascript
  export const TREASURE_ATTR_MAP = { hp: '气血', atk: '攻击', def: '防御', dodge: '闪避', crit: '暴击' };
  ```
- **更新初始 `player.equippedTreasureAttrs` 字段**：
  将 `extraStr`, `extraCon`, `extraAgi`, `extraInt`, `extraLuk` 替换为 `extraAtk`, `extraDef`, `extraHp`, `extraDodge`, `extraCrit`。

#### [MODIFY] [server/index.js](file:///c:/Users/57699/Desktop/PROJECTS/TREA/Trae%20Projects/wuxia-demo/server/index.js)
- **更新 `equippedTreasureAttrs` 初始化和重置逻辑**（包括熔炼、洗炼、交易下架等处的重置模板）。
- **更新洗炼 `refine_treasure` 的五行映射与词条随机生成范围**：
  - `goldSand` $\rightarrow$ `extraAtk` (I阶: 10~20, II阶: 24~40, III阶: 50~80)
  - `woodHerb` $\rightarrow$ `extraDef` (I阶: 10~20, II阶: 24~40, III阶: 50~80)
  - `waterFluid` $\rightarrow$ `extraDodge` (I阶: 2~4%, II阶: 5~8%, III阶: 10~16%)
  - `fireMarrow` $\rightarrow$ `extraHp` (I阶: 50~100, II阶: 120~200, III阶: 250~400)
  - `earthEssence` $\rightarrow$ `extraCrit` (I阶: 2~4%, II阶: 5~8%, III阶: 10~16%)

---

### [Combat Systems]

#### [MODIFY] [BattleArena.jsx](file:///c:/Users/57699/Desktop/PROJECTS/TREA/Trae%20Projects/wuxia-demo/src/components/BattleArena.jsx)
- **合入宝具基础与洗炼属性**：
  - 战斗前生命增幅：`maxHp = maxHp + treasureHp + extraHp`。
  - 攻击计算：基础力量攻击 + 宝具攻击加成。
  - 防御计算：基础体质防御 + 宝具防御加成.
  - 身法速度：基础敏捷 + 宝具闪避加成。
  - 闪避率计算：敏捷闪避率 + 宝物闪避百分比。
- **引入 PVP 暴击伤害结算**：
  - 计算暴击率：由幸运值及宝具暴击率决定。
  - 暴击时伤害提升为 1.5 倍，战报前缀附加 `[暴击]` 标志。

#### [MODIFY] [EncounterArena.jsx](file:///c:/Users/57699/Desktop/PROJECTS/TREA/Trae%20Projects/wuxia-demo/src/components/EncounterArena.jsx)
- 对齐 PVP 的生命、攻击、防御、身法及暴击结算逻辑，确保野外奇遇战斗规则一致。

#### [MODIFY] [SecretRealm.jsx](file:///c:/Users/57699/Desktop/PROJECTS/TREA/Trae%20Projects/wuxia-demo/src/components/SecretRealm.jsx)
- 怨灵残影对决中，将原有的力量/敏捷/体质读取方式重构为读取生命的战斗属性进行战斗。

#### [MODIFY] [WorldBossArena.jsx](file:///c:/Users/57699/Desktop/PROJECTS/TREA/Trae%20Projects/wuxia-demo/src/components/WorldBossArena.jsx)
- 魔罗挑战中，攻击力应用宝物攻击属性；暴击概率由宝物暴击属性与幸运值动态计算；破魔条件对齐重构词条。

---

### [User Interface]

#### [MODIFY] [WuxiaBackpack.jsx](file:///c:/Users/57699/Desktop/PROJECTS/TREA/Trae%20Projects/wuxia-demo/src/components/WuxiaBackpack.jsx)
- 属性加持与器灵词条显示逻辑更新，使用 `TREASURE_ATTR_MAP` 且字段与重构后的名称对应。

#### [MODIFY] [WuxiaSkillsBook.jsx](file:///c:/Users/57699/Desktop/PROJECTS/TREA/Trae%20Projects/wuxia-demo/src/components/WuxiaSkillsBook.jsx)
- 去除宝物属性对于研习功法门槛的影响，仅使用玩家角色本身的基础属性检测。

#### [MODIFY] [AlchemyFurnace.jsx](file:///c:/Users/57699/Desktop/PROJECTS/TREA/Trae%20Projects/wuxia-demo/src/components/AlchemyFurnace.jsx)
- 洗炼结果弹窗、属性说明及熔炼状态检测的展示文案和属性映射更新。

---

## Verification Plan

### Automated Tests
- 启动服务器并运行 Vite 客户端进行语法及连通性验证。

### Manual Verification
- **背包与详情显示**：打开储物袋，检查倚天剑等宝物的“属性加持”是否已正确显示为“攻击 +50”、“闪避 +10%”。
- **熔炼与洗炼**：在太上神炉中洗炼宝物，注入“炽阳金沙”与“赤炎地髓”，检查洗炼结果是否正确给出“额外攻击”与“额外气血”词条，数值符合期望范围。
- **战斗暴击测试**：触发比武切磋，检查战斗日志中是否出现“`[暴击]`... 造成了重创，造成了 XXX 伤害”以及战斗雷达图展示。

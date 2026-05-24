# 战斗人物立绘与卡牌视觉重构实施方案

> [!NOTE]
> **开发状态归档标记**：本实施方案所包含的全部开发任务（水墨卡牌重构、千人千面属性特征系统、新手斗笠面纱、濒死死亡墨裂特效、以及全网风云榜格斗选人切片重构、玩家专属江湖金句台词、生平评语补全、装备宝具徽章移至右侧防重叠优化等）均已由 **Antigravity** 在 2026-05-22 全部完美开发并实装。
> 本文档已复制到项目根目录下作为备忘归档，方便晚些时候继续以此为基础进行后续的迭代开发。

为了彻底解决目前战斗人物化身（[EnhancedWarriorAvatar.jsx](file:///C:/Users/Alex.Xu/Desktop/working%20vault/research/Antigravity%20projects/wuxia-demo/src/components/EnhancedWarriorAvatar.jsx)）使用 SVG 拼接出的“机械感、智能化偏低”简笔画机器人造型，我们提出了一套将其重构为**中式暗黑写意水墨卡牌**的视觉升级方案，并引入**基于玩家属性与原著NPC彩蛋的特征贴合机制**，同时对排行榜进行升级，使固定 NPC 拥有面部精绘与经典台词评语。

---

## User Review Required

> [!IMPORTANT]
> **1. 固定 NPC 精绘原画的专属路径与容错降级机制**
> 大侠的建议非常具有前瞻性！我们将所有的固定 NPC（扫地僧、东方不败、灭绝师太、邀月、张三丰、乔峰/萧峰）在代码中都预设为**专属的精绘原画文件路径**（例如 `/public/npc_yaoyue.png` 等）。
> - **容错降级**：我们在 React 代码中编写了 `onError` 图片加载监听。如果在 `public/` 目录下找不到对应的专属 NPC 图片文件（比如限额期间还没生成出来），组件将**自动降级为：高精度通用水墨立绘 + 专属的 CSS 功法偏色滤镜效果**。
> - **无缝升级**：未来只要配额刷新，生成剩余的图片并命名为对应的文件名放入 `public` 文件夹，游戏界面将**瞬间无缝升级为面部精绘版**，无需重新修改代码！
> 
> **2. 生图配额限制说明**
> 生图模型（Gemini 3.1 Flash Image）在短时间窗口内的连续生成额度大约是 7 张，配额重置大约需要等待 **2小时 49分钟**（本轮额度重置的系统通知指示在下午 19:47 分左右重置）。

---

## Proposed Changes

### 1. 资源路径设计 (Assets Paths)
我们将为所有经典 NPC 预设以下专属的静态资源图片路径：
- 扫地僧专属头像：`/public/npc_saodiseng.png`（已生成并放入项目）
- 东方不败专属头像：`/public/npc_dongfang.png`（已生成并放入项目）
- 灭绝师太专属头像：`/public/npc_miejue.png`（待配额重置后补全）
- 邀月专属头像：`/public/npc_yaoyue.png`（待配额重置后补全）
- 张三丰专属头像：`/public/npc_zhangsanfeng.png`（待配额重置后补全）
- 乔峰专属头像：`/public/npc_qiaofeng.png`（待配额重置后补全）

---

### 2. 排行榜组件升级 (Leaderboard Component Reconstruction)

#### [MODIFY] [Leaderboard.jsx](file:///C:/Users/Alex.Xu/Desktop/working%20vault/research/Antigravity%20projects/wuxia-demo/src/components/Leaderboard.jsx)

- **名帖数据库扩展与评语统一**：
  - 引入了 `getPlayerComment` 逻辑，不仅在 NPC 时展示其经典评语，同时也为普通玩家生成对应的江湖短评，使得排行榜卡片中均有工整的“台词金句 + 江湖评语”排布。
  - **“扫地僧”**：头像使用 `/npc_saodiseng.png`，经典台词：“大凡武功修为，必须有慈悲之佛法相辅。”，评语：“大智若愚，藏经阁中扫尽红尘。”，底框特效为深灰色。
  - **“东方不败”**：头像使用 `/npc_dongfang.png`，经典台词：“日出东方，唯我不败！”，评语：“葵花宝典，红烛针影，绝代妖娆。”，边框为暗红色。
  - **“灭绝师太”**：头像使用 `/npc_miejue.png`，经典台词：“我峨嵋派倚天不出，谁与争锋！”，评语：“性情刚烈，执剑灭绝，斩尽妖邪。”，边框为冷灰色。
  - **“邀月”**：头像使用 `/npc_yaoyue.png`，经典台词：“若我不配得到，那谁也别想得到！”，评语：“明玉功成，移花宫主，冷若冰霜。”，边框为水蓝色。
  - **“张三丰”**：头像使用 `/npc_zhangsanfeng.png`，经典台词：“太极圆转，阴阳既济，生生不息。”，评语：“一代宗师，武当太极，泰山北斗。”，边框为太极金色。
  - **“乔峰” / “萧峰”**：头像使用 `/npc_qiaofeng.png`，经典台词：“我萧峰大好男儿，何惧之有！”，评语：“降龙神威，悲剧豪侠，豪气冲天。”，边框为粗犷古铜色。
- **头像容错加载与避让重叠机制**：
  - 立绘切片向左平移（距离右侧 `185px`），完美避让右端等级与“挑战”按钮，宽度放大到 `320px`，并将双向遮罩提升应用至包裹容器本身，消除生硬边缘。
  - 将装备宝具（`tName`）移出左端文本区，移至右端等级标签旁显示为小勋章徽章样式。
  - 头像支持 `onError` 降级渲染。

---

### 3. 人物化身组件程序化特征重构 (EnhancedWarriorAvatar Procedural Features)

#### [MODIFY] [EnhancedWarriorAvatar.jsx](file:///C:/Users/Alex.Xu/Desktop/working%20vault/research/Antigravity%20projects/wuxia-demo/src/components/EnhancedWarriorAvatar.jsx)
- **卡牌专属立绘与容错**：在战斗中，如果是上述经典 NPC，优先尝试加载其专属的精绘原画（例如 `/npc_yaoyue.png`），如文件不存在则自动捕获 `onError` 降级为通用立绘加上专属功法色彩漂移与武器特效。
- **身形缩放与气劲偏色**：普通玩家的敏捷、力量、体质属性与身高体型（`scaleX`、`scaleY`）及功法偏色挂钩，实现千人千面。
- **面纱与斗笠逻辑**：新手或低等玩家（<20级）自带薄纱遮面，高等级大侠（>=70）和风云榜前列的大师自动揭开面纱露出真容。
- **状态差分视觉表现**：卡牌受击震动泼墨、濒死去色与猩红血雾边框、死亡冰裂墨痕消散等顶级动效实装。

---

### 4. 全局 CSS 效果补充 (Index CSS Update)

#### [MODIFY] [index.css](file:///C:/Users/Alex.Xu/Desktop/working%20vault/research/Antigravity%20projects/wuxia-demo/src/index.css)
- 添加卡牌专用扫光关键帧 `@keyframes cardShimmer`。
- 添加太极盘自转 `@keyframes taijiRotate` 动画。
- 添加夔纹边框容器样式 `.wuxia-hero-card` 以及立绘特征缩放变换类。

---

## Verification Plan

### 1. 容错加载机制验证 (Fallback & Seamless Replacement)
- 启动项目，检查风云榜网格项。由于目前 `/public/npc_yaoyue.png` 并不存在，确认邀月的头像框是否正常平滑退回使用 `/wuxia_female_hero.png` 并施加水蓝色《明玉功》偏色，台词和名帖是否渲染正确，且控制台没有任何抛错崩溃。
- 确认扫地僧与东方不败是否直接成功展示了专属水墨精绘头像。

### 2. 战斗与特征贴合校验 (Combat & Procedural Verification)
- 重新分配敏捷与力量属性点，验证玩家自己的身高体宽是否随敏捷和体质的值变化。
- 在战斗中挑战 NPC 扫地僧或东方不败，验证战斗中大卡牌是否同步展现其专属的立绘、独特的宝具特效（如扫帚、针线流光）。

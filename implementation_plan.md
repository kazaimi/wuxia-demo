# 全服共享：世界BOSS相态流转与NPC并肩作战系统方案

为了让世界BOSS战斗更具“武林群侠合力围攻”的浩大声势，并且让任何等级的玩家都能公平参与，我们引入了**“NPC并肩战斗挂机模拟”**与**“按等级等比缩放的动态触发器”**。

根据您的最新反馈，我们**大幅降低了BOSS相态恢复所需的承伤门槛**，使得状态流转速度大大加快；同时**引入了严格的相态状态锁（互斥机制）**，确保在BOSS处于特殊状态（狂暴/法盾/虚弱）期间，无法再次触发新的状态或被其他状态覆盖。

---

## 核心设计：全服共享相态 (Global Shared Stances)

大魔罗拥有 4 个不同的全局相态，并在服务器端维护当前状态以及该状态剩余的承伤恢复量（`stanceRemainingHp`）：

| 状态名称 (Stance) | 立绘指向文件 | 全服全局修正 (Modifiers) | 触发条件 (仅在 BOSS 处于 **常态** 时可触发) | 恢复常态条件 (Revert Condition) |
| :--- | :--- | :--- | :--- | :--- |
| **常态 (Normal)** | `/boss_mola_portrait.png` | 默认参数（承受20%伤害） | 默认状态。若处于特殊相态，无法触发任何新相态。 | - |
| **虚弱 (Weakened)** | `/boss_mola_weakened.png` | 全服玩家攻击**伤害变为200%**；BOSS攻击力下降50% | **【强力破势】**：<br>1. 单次伤害数值 $\ge$ `玩家等级 * 300 + 2000`；<br>2. 或者战斗中产生**暴击**时有 `5% + 幸运/100 %` 概率触发；<br>3. 携带神话秘宝挑战时有 15% 概率触发。 | 处于该状态下，全服/NPC累计对BOSS造成 **60,000** 点伤害。 |
| **狂暴 (Frenzied)** | `/boss_mola_frenzied.png` | BOSS攻击力提升50%；但承受伤害增加30% | **【魔尊激怒】**：<br>1. 单次讨伐造成的累计总伤害 $\ge$ `玩家等级 * 1500 + 10000` 点；<br>2. 战斗中释放**绝招(ultimate)**时有 `10%` 概率触发。 | 处于该状态下，全服/NPC累计对BOSS造成 **40,000** 点伤害。 |
| **法盾 (Shielded)** | `/boss_mola_shielded.png` | BOSS免伤提升40%；并反弹玩家所受攻击伤害的20% | **【邪能反噬】**：<br>1. 单次挑战中，玩家的总回复/吸血量 $\ge$ `玩家等级 * 50 + 500` 点；<br>2. 战斗中释放**内功(inner)**时有 `10%` 概率触发。 | 处于该状态下，全服/NPC累计对BOSS造成 **50,000** 点伤害。 |

### 🛠️ 互斥机制 (Mutual Exclusion Logic)
- **状态锁**：当 `worldBossState.stance !== 'normal'` 时，任何玩家或 NPC 结算时的触发判定逻辑**全部被跳过**。
- **阶段表现**：此时产生的所有伤害仅仅用于扣减 `worldBossState.hp` 和当前相态的 `stanceRemainingHp`。
- **状态解锁**：只有当 `stanceRemainingHp` 被扣减至 $\le 0$ 时，BOSS 状态恢复为 `'normal'`，此时方可重新开始判定新状态。这保证了状态之间边界清晰，不会产生状态覆盖和频繁刷屏的情况。

---

## NPC 战局挂机模拟 (NPC Raid Simulation)

在世界BOSS显化期间，服务端将开启一个独立的定时轮询：
- **触发频率**：每 30 - 45 秒，有 30% 概率随机选择一位江湖名宿（如“乔峰”、“东方不败”、“扫地僧”等 `MOCK_PLAYERS`）对世界BOSS发起讨伐。
- **影响全局**：NPC 造成的伤害会直接扣减世界BOSS的全局 HP，并贡献对当前 Stance 的 `stanceRemainingHp` 扣减。若 BOSS 当前处于常态，NPC 也能触发新相态。
- **全服通告**：NPC 的讨伐过程和相态变更会实时通过 `broadcast_message` 向所有在线玩家播报，打造真正的“群侠合围”场面！

---

## Proposed Changes

### [WorldBoss Arena & Game Logic]

#### [MODIFY] [server/index.js](file:///c:/Users/57699/Desktop/PROJECTS/TREA/Trae%20Projects/wuxia-demo/server/index.js)
- 在 `worldBossState` 初始数据结构中加入：
  - `stance`: `'normal'` | `'frenzied'` | `'shielded'` | `'weakened'`
  - `stanceRemainingHp`: 0
- 在扣除 BOSS HP 的同时，更新相态判定逻辑：
  - 检查当前是否处于特殊相态（`stance !== 'normal'`）：
    - 如果是，则 `stanceRemainingHp -= damage`。若扣减后 $\le 0$，将 `stance` 设回 `'normal'`，并全服广播魔罗恢复常态。**直接跳过状态触发判定**。
    - 如果当前是 `'normal'` 状态，根据收到的结算指标判断是否触发新相态：
      - 触发虚弱 $\rightarrow$ `'weakened'`，`stanceRemainingHp = 60000`。
      - 触发狂暴 $\rightarrow$ `'frenzied'`，`stanceRemainingHp = 40000`。
      - 触发法盾 $\rightarrow$ `'shielded'`，`stanceRemainingHp = 50000`。
    - 触发新相态时，广播对应的通告，更新 `worldBossState` 并广播。
- **NPC 挂机挑战**：每 30-45 秒有概率抽取 NPC 模拟单次战报并调用上述 Stance 判定更新。

#### [MODIFY] [WorldBossArena.jsx](file:///c:/Users/57699/Desktop/PROJECTS/TREA/Trae%20Projects/wuxia-demo/src/components/WorldBossArena.jsx)
- **立绘动态化**：魔罗立绘的图片根据当前的全局相态 `worldBossState.stance` 自动切换为对应的 `/boss_mola_frenzied.png`、`/boss_mola_shielded.png` 等。
- **战斗参数动态绑定**：挑战开始时，将当前 `worldBossState.stance` 暂存至本地战斗状态。
- 在 15 回合循环中根据暂存 of Stance 调整伤害计算与技能效果（虚弱2倍受创/狂暴加攻加受创/法盾免伤且反伤）。
- 在第 15 回合结束后，把本场战斗生成的最大单次伤害 `maxSingleHit`、累计吸血/回血 `totalHeal`、是否出暴击 `isCrit`、使用过的技能类型等数据上传给服务端进行相态判定。
- 在大厅的“世界BOSS卡片”上展示当前相态标识以及剩余多少HP恢复常态。

---

## User Review Required

> [!IMPORTANT]
> 1. **状态恢复承伤门槛降低**：虚弱 60,000 HP、狂暴 40,000 HP、法盾 50,000 HP。这样的低门槛可由玩家单次挑战（加 NPC 补刀）在 1-2 局内迅速解决，极大地加快了相态流转的频率，使得大厅更有生机。
> 2. **互斥锁已就位**：在特殊状态下，任何玩家/NPC结算时均只会削减 Stance HP，绝不触发新的 Stance 变化，直至状态自然解除，防范了刷屏和多重状态叠加。
> 3. **立绘图片生成**：如果您确认同意，我将开始为您生成 3 张新的水墨风格相态立绘图片（狂暴、法盾、虚弱）。

---

## Verification Plan

### Manual Verification
- **互斥锁定测试**：将 BOSS 设为狂暴（剩余承伤 40,000），使用极高爆发技能或高治疗结算，检查是否在控制台打印“处于狂暴相态，不触发新状态校验”，直到承伤归 0 切换为常态。
- **承伤恢复常态测试**：记录 NPC 或玩家的每次讨伐伤害，检查 `stanceRemainingHp` 扣减直至归 0 时，BOSS 是否能正常切回 normal 常态并广播通知。
- **立绘切换与特效校验**：检查各个状态下立绘是否匹配，战斗伤害与反伤值是否与公式期望一致。

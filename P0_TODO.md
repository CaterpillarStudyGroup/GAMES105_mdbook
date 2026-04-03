# P0 任务：动力学模块理解修复 TODO List

> **最后更新**: 2026-04-03
>
> 本文档记录动力学模块笔记的修复计划，请逐条确认后执行。

---

## 问题层次分析（背景知识）

**在确认 TODO 之前，请先理解以下内容**：

```
┌─────────────────────────────────────────────────────────────┐
│  高层：任务规划 (Task Planning)                              │
│  "做什么动作？什么时候做？"                                   │
│  方法：有限状态机、行为树、任务规划                          │
├─────────────────────────────────────────────────────────────┤
│  中层：轨迹生成/策略学习 (Trajectory/Policy)                 │
│  "如何生成目标动作序列？"                                     │
│  方法：轨迹优化 (CMA-ES/SAMCON)、RL (DeepMimic/AMP/ASE)       │
├─────────────────────────────────────────────────────────────┤
│  底层：执行控制 (Low-level Control)                          │
│  "如何计算关节力矩？"                                         │
│  方法：PD 控制                                                │
└─────────────────────────────────────────────────────────────┘
```

**DeepMimic/AMP/ASE 与 PD 的关系**：

```
DeepMimic/AMP/ASE 策略 π(a|s)
         ↓ 输出目标 q*, q̇*
         ↓
    PD 控制器 τ = k_p(q* - q) + k_d(q̇* - q̇)
         ↓ 输出力矩 τ
         ↓
    物理仿真器
```

**关键洞察**：
- PD 控制是**底层执行器**，负责计算关节力矩
- DeepMimic/AMP/ASE 是**中层策略**，负责生成 PD 的目标
- 两者不是同一类问题，但有依赖关系

---

## Part 1: 概念错误修复

### TODO-1: 修复 `Outline.md` 中的"前馈 vs 反馈"错误

**位置**: `Outline.md` 第 7 行

**当前错误表述**:
> ✅ 有反馈，但还是算是前向控制，因为反馈的部分和想控制的部分不完全一致。

**建议修改为**:
```markdown
> ✅ PD 控制是**反馈控制** (Feedback Control)，因为计算力矩时使用了当前状态 $(q, \dot{q})$。
>
> 公式：$\tau = k_p(q^* - q) + k_d(\dot{q}^* - \dot{q})$
>
> 在 DeepMimic 等现代方法中，高层策略选择 PD 目标 $q^*$（前馈），底层 PD 执行跟踪（反馈），形成混合架构。
```

- [ ] 同意修改
- [ ] 需要调整
- [ ] 跳过

---

### TODO-2: 修复 `Controlling.md` P71 的混淆表述

**位置**: `Controlling.md` P71

**当前错误表述**:
> ✅ 是反馈控制，因为计算 $\tau$ 时使用了当前状态 $q$．
> ✅ 是前馈控制，因为在 PD 系统里，状态是位置不是 $q$.

**建议修改为**:
```markdown
## Feedforward vs Feedback

PD Control 是**反馈控制**的典型例子：

| 控制类型 | 公式 | 特点 |
|---------|------|------|
| **Feedforward** | $f, \tau = \pi(t)$ | 按预定时序施加控制，不考虑当前状态 |
| **Feedback** | $f, \tau = \pi(s_t, t)$ | 根据当前状态 $s_t$ 调整控制信号 |

PD 控制 $\tau = k_p(q^* - q) + k_d(\dot{q}^* - \dot{q})$ 使用当前状态 $(q, \dot{q})$ 计算力矩，因此是**反馈控制**。
```

- [ ] 同意修改
- [ ] 需要调整
- [ ] 跳过

---

### TODO-3: 增强 `Controlling.md` 中"欠驱动问题"的解释

**位置**: `Controlling.md` P72-73

**当前内容**:
> 合力为零，无法控制整体的位置和朝向。
> 解决方法：增加净外力... 缺点：让角色看起来像提线木偶。

**建议添加**:
```markdown
## 欠驱动问题 (Underactuation)

### 问题本质

人体是一个**欠驱动系统**：

| 自由度类型 | 数量 | 能否直接控制 |
|-----------|------|-------------|
| 关节自由度 | ~30+ | ✓ 通过关节力矩 |
| **浮空根节点** (floating base) | **6** | **✗ 无直接执行器** |

浮空根节点的 6 个自由度（3 个平移 + 3 个旋转）无法通过关节力矩直接控制，因为：
$$\sum \tau_{joint} = 0 \quad \text{(内力之和为零)}$$

### 解决思路对比

| 方法 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| **虚拟根节点力** | 直接添加 $f_0, \tau_0$ 到根节点 | 简单 | 看起来像"提线木偶" |
| **利用环境接触** | 通过地面反作用力间接控制 | 物理真实 | 需要学习接触策略 |
| **动量控制** | 利用角动量守恒调整姿态 | 无需接触 | 仅适用于空中动作 |

### 现代方法 (DeepMimic/AMP)

通过强化学习**自动发现**如何利用接触力：
- 学会在正确时机蹬地产生推进力
- 学会摆臂维持平衡
- 学会翻滚缓冲落地冲击

**详解**: [DeepMimic 论文笔记](https://caterpillarstudygroup.github.io/ReadPapers/201.html)
```

- [ ] 同意修改
- [ ] 需要调整
- [ ] 跳过

---

## Part 2: 内容增强

### TODO-4: 在 `Proportional-DerivativeControl.md` 末尾添加"PD 在角色动画中的应用"

**位置**: `Proportional-DerivativeControl.md` 末尾（在 P67 之后）

**建议添加内容**:
```markdown
## PD 控制在角色动画中的应用

### 动作跟踪 (Motion Tracking)

给定参考动作序列 $\{q^*_t, \dot{q}^*_t\}$，PD 控制器计算关节力矩：

$$\tau_t = k_p(q^*_t - q_t) + k_d(\dot{q}^*_t - \dot{q}_t)$$

### 稳态误差的根本原因

**问题**：单关节在重力作用下永远无法精确到达目标角度。

```
        目标角度
          │
          │  ← 稳态误差
          ▼
    ┌─────┴─────┐
    │   实际手臂  │
    └─────┬─────┘
          │
          │ 重力
          ▼
```

**原因分析**：
- PD 控制需要误差才能产生力矩
- 稳态时 $\dot{q}=0$，只有比例项工作：$\tau = k_p(q^* - q)$
- 平衡条件：$\tau = \tau_{gravity}$
- 因此必须存在误差：$q^* - q = \tau_{gravity} / k_p$

**解决方案对比**：

| 方案 | 原理 | 缺点 |
|------|------|------|
| 增大 $k_p$ | 减小误差 | 系统变硬、数值不稳定 |
| 添加重力补偿 | $\tau = \tau_{PD} + \tau_{gravity}$ | 需要精确重力模型 |
| 轨迹优化 | 优化参考轨迹使其物理可行 | 计算量大 |
| 强化学习 (DeepMimic) | 学习鲁棒策略 | 训练成本高 |
```

- [ ] 同意修改
- [ ] 需要调整
- [ ] 跳过

---

### TODO-5: 在 `Proportional-DerivativeControl.md` 中添加"相位概念"说明

**位置**: `Proportional-DerivativeControl.md` 末尾（接 TODO-4 之后）

**建议添加内容**:
```markdown
## 附录：相位 (Phase) 概念

### 什么是相位？

相位 $\phi \in [0, 1]$ (或 $[0, 2\pi]$) 表示**周期性动作的进度**。

以走路为例：
- $\phi = 0$: 右脚着地
- $\phi = 0.5$: 左脚着地
- $\phi = 1$: 回到右脚着地（完成一个周期）

### 相位在 PD 跟踪中的作用

**相位感知 PD 控制**：

$$\tau = k_p(q^*(\phi) - q) + k_d(\dot{q}^*(\phi) - \dot{q})$$

其中参考姿态 $q^*$ 是相位 $\phi$ 的函数。

### 相位漂移问题

**问题**：实际动作可能比参考动作"慢"，导致相位不同步。

**解决**：根据当前状态动态调整 $\phi$，而非固定时间推进。

**深入学习**: [DeepMimic 相位感知策略](https://caterpillarstudygroup.github.io/ReadPapers/201.html)
```

- [ ] 同意修改
- [ ] 需要调整
- [ ] 跳过

---

### TODO-6 (修订): 添加"基于学习的控制"相关内容

**问题**：DeepMimic/AMP/ASE 与 PD 控制不是同一类问题，它们属于中层策略学习，而非底层执行控制。

**选项 A**: 在 `Controlling.md` 末尾添加"PD 控制的局限性与现代方法的关系"章节
```markdown
## PD 控制的局限性与现代方法的关系

### PD 跟踪的局限性

| 问题 | 表现 | 原因 |
|------|------|------|
| 稳态误差 | 无法精确到达目标 | 需要误差才能产生力矩 |
| 相位漂移 | 动作与参考不同步 | 固定时间推进相位 |
| 欠驱动 | 无法控制根节点 | 关节力矩内力之和为零 |
| 无扰动恢复 | 受外力后偏离轨迹 | 没有学习恢复策略 |

### 为什么需要基于学习的方法

传统轨迹优化 (CMA-ES/SAMCON) + PD 跟踪的局限：
- 每次任务都要重新优化
- 无法泛化到新情况
- 对扰动的恢复能力有限

**与 PD 的关系**：
- 学习方法 (DeepMimic/AMP/ASE) 输出 PD 目标 $q^*$
- PD 作为底层执行器

**深入学习**: [DeepMimic](https://caterpillarstudygroup.github.io/ReadPapers/201.html) | [AMP](https://caterpillarstudygroup.github.io/ReadPapers/198.html) | [ASE](https://caterpillarstudygroup.github.io/ReadPapers/199.html)
```

**选项 B**: 跳过 TODO-6，仅在 SUMMARY.md 中添加独立章节

**选项 C**: 创建新文件 `LearningBasedControl.md`，详细介绍 DeepMimic/AMP/ASE 与 PD 的关系

- [ ] 选项 A（在 Controlling.md 末尾简要说明关系）
- [ ] 选项 B（跳过 TODO-6，只在 SUMMARY.md 添加独立章节）
- [ ] 选项 C（创建新文件详细介绍）

---

## Part 3: 目录结构更新

### TODO-7: 更新 `SUMMARY.md` 添加新章节

**位置**: `SUMMARY.md`

**当前结构** (Physics-based 部分):
```markdown
# Physics-based/Dynamic Approaches

- [Physics-based Simulation and Articulated Rigid Bodies](Simulation.md)
- [角色动力学]()
  - [Constraints](Constraints.md)
  - ...
- [PD Control]()
  - ...
- [轨迹优化](Tracking/Tracking.md)
  - ...
- [Character Control]()
  - ...
```

**建议修改为**:
```markdown
# Physics-based/Dynamic Approaches

- [Physics-based Simulation and Articulated Rigid Bodies](Simulation.md)
- [角色动力学]()
  - [Constraints](Constraints.md)
  - [关节约束](JointConstraint.md)
  - [Contacts](Contacts.md)
  - [总结](Actuating.md)
- [PD Control]()
  - [驱动角色](Outline.md)
  - [Proportional-Derivative Control](Proportional-DerivativeControl.md)
  - [Controlling Characters](Controlling.md)
  - [Static Balance](PDControl/StaticBalance.md)
- [轨迹优化](Tracking/Tracking.md)
  - [简单例子](Tracking/SimpleCase.md)
  - [Optimal Control and Reinforcement Learning](Optimal.md)
  - [Linear Quadratic Regulator (LQR)](LQR.md)
  - [Nonlinear problems](Nonlinear_problems.md)
  - [Sampling-based Policy Optimization](Sampling_based.md)
  - [Optimal Control-Reinforcement Learning](Optimal_Control.md)
  - [Digital Cerebellum](Digital_Cerebellum.md)
- [基于学习的控制]()  ← 新增
  - [DeepMimic (2018)](https://caterpillarstudygroup.github.io/ReadPapers/201.html)
  - [AMP (2021)](https://caterpillarstudygroup.github.io/ReadPapers/198.html)
  - [ASE (2022)](https://caterpillarstudygroup.github.io/ReadPapers/199.html)
- [Character Control]()
  - [Learning to Walk](Learning.md)
  - [Zero-Moment Point (ZMP)](ZMP.md)
  - [SIMBICON](SIMBICON.md)
```

- [ ] 同意修改
- [ ] 需要调整
- [ ] 跳过

---

## 执行顺序建议

建议按以下顺序执行（用户确认后）：

```
1. TODO-1: 修复 Outline.md (前馈 vs 反馈)
2. TODO-2: 修复 Controlling.md P71 (概念澄清)
3. TODO-3: 增强 Controlling.md (欠驱动问题)
4. TODO-4: 添加 PD 应用章节 (动作跟踪)
5. TODO-5: 添加相位概念说明
6. TODO-6: 添加现代方法章节 (DeepMimic/AMP/ASE)
7. TODO-7: 更新 SUMMARY.md
8. Git 提交
```

---

## 备注

- 所有修改都链接到 ReadPapers 中的详细论文笔记，避免重复内容
- 保持现有文件结构，仅在末尾添加新章节
- 公式格式已统一为 `$...$`（与 MathJax 兼容）

---

**用户决策**: 请在每个 TODO 后标记 `[ ] 同意修改` / `[ ] 需要调整` / `[ ] 跳过`，然后我将根据决策执行。

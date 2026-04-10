# 轨迹优化的数学描述

> &#x2705; **本章定位**：理解轨迹优化问题的**数学形式化描述**，包括优化变量、目标函数、约束条件。

---

## 一、问题概述

轨迹优化（Trajectory Optimization）的目标是：

**找到一条状态轨迹和控制轨迹，使得在满足所有约束的前提下，最小化目标函数。**

---

## 二、优化变量

### 状态轨迹（State Trajectory）

$$
\mathbf{x}_{0:T} = (\mathbf{x}_0, \mathbf{x}_1, \dots, \mathbf{x}_T)
$$

其中每个状态 \\(\mathbf{x}_t\\) 包含：

| 变量 | 符号 | 维度 | 说明 |
|------|------|------|------|
| 位置 | \\(\mathbf{q}\\) | \\(n\\) | 关节角度 + 根节点位置 |
| 速度 | \\(\dot{\mathbf{q}}\\) | \\(n\\) | 关节角速度 + 根节点速度 |

对于人形角色，通常 \\(n \approx 34\\)（3DOF 根节点 + 31DOF 关节）。

---

### 控制轨迹（Control Trajectory）

$$
\mathbf{u}_{0:T-1} = (\mathbf{u}_0, \mathbf{u}_1, \dots, \mathbf{u}_{T-1})
$$

其中每个控制 \\(\mathbf{u}_t\\) 包含：

| 变量 | 符号 | 维度 | 说明 |
|------|------|------|------|
| 关节力矩 | \\(\boldsymbol{\tau}\\) | \\(n_{\text{joint}}\\) | 每个关节的力矩 |
| 根节点力 | \\(\mathbf{f}_{\text{root}}\\) | 3 | 虚拟外力（可选） |
| 根节点力矩 | \\(\boldsymbol{\tau}_{\text{root}}\\) | 3 | 虚拟外力矩（可选） |

---

## 三、目标函数

### 一般形式

$$
\min_{\mathbf{x}_{0:T}, \mathbf{u}_{0:T-1}} J(\mathbf{x}_{0:T}, \mathbf{u}_{0:T-1}) = J_T(\mathbf{x}_T) + \sum_{t=0}^{T-1} J_t(\mathbf{x}_t, \mathbf{u}_t)
$$

| 项 | 名称 | 说明 |
|---|------|------|
| \\(J_T(\mathbf{x}_T)\\) | **终端代价**（Terminal Cost） | 关于终点状态的代价 |
| \\(J_t(\mathbf{x}_t, \mathbf{u}_t)\\) | **运行代价**（Running Cost） | 关于每步状态和控制的代价 |

---

### 常见的运行代价项

#### 1. 跟踪误差（Tracking Error）

$$
J_{\text{track}} = \sum_{t=0}^{T-1} \|\mathbf{q}_t - \mathbf{q}_t^{\text{ref}}\|^2
$$

- \\(\mathbf{q}_t^{\text{ref}}\\)：参考轨迹（来自动捕等）
- 作用：让优化结果贴近参考动作

---

#### 2. 控制 Effort

$$
J_{\text{control}} = \sum_{t=0}^{T-1} \|\boldsymbol{\tau}_t\|^2
$$

- 作用：最小化关节力矩，使动作更节能、更平滑

---

#### 3. 速度平滑项

$$
J_{\text{smooth}} = \sum_{t=0}^{T-1} \|\dot{\mathbf{q}}_{t+1} - \dot{\mathbf{q}}_t\|^2
$$

- 作用：减少速度突变，使动作更流畅

---

#### 4. 质心高度项

$$
J_{\text{com}} = \sum_{t=0}^{T-1} (h_{\text{com},t} - h_{\text{com}}^{\text{ref}})^2
$$

- 作用：维持质心高度，防止摔倒

---

### 完整的运行代价

$$
\begin{aligned}
J_t(\mathbf{x}_t, \mathbf{u}_t) = \;&w_{\text{track}} \|\mathbf{q}_t - \mathbf{q}_t^{\text{ref}}\|^2 \\
&+ w_{\text{control}} \|\boldsymbol{\tau}_t\|^2 \\
&+ w_{\text{smooth}} \|\dot{\mathbf{q}}_{t+1} - \dot{\mathbf{q}}_t\|^2 \\
&+ w_{\text{com}} (h_{\text{com},t} - h_{\text{com}}^{\text{ref}})^2
\end{aligned}
$$

其中 \\(w_i\\) 是权重系数，用于调节各项的重要性。

---

### 常见的终端代价

$$
J_T(\mathbf{x}_T) = w_{\text{vel}} \|\dot{\mathbf{q}}_T\|^2 + w_{\text{com}} (h_{\text{com},T} - h_{\text{com}}^{\text{ref}})^2
$$

- \\(\|\dot{\mathbf{q}}_T\|^2\\)：终点速度为零（确保静止）
- \\(h_{\text{com},T}\\)：终点质心高度（确保平衡）

---

## 四、约束条件

### 1. 动力学约束（Dynamics Constraint）

$$
M(\mathbf{q}_t)\ddot{\mathbf{q}}_t + C(\mathbf{q}_t, \dot{\mathbf{q}}_t) = \boldsymbol{\tau}_t + \mathbf{J}(\mathbf{q}_t)^T \boldsymbol{\lambda}_t
$$

| 符号 | 说明 |
|------|------|
| \\(M(\mathbf{q})\\) | 质量矩阵 |
| \\(C(\mathbf{q}, \dot{\mathbf{q}})\\) | 科里奥利力 + 离心力 + 重力 |
| \\(\boldsymbol{\tau}\\) | 关节力矩（控制输入） |
| \\(\mathbf{J}^T \boldsymbol{\lambda}\\) | 约束力（接触力等） |

---

### 2. 运动学约束（Kinematic Constraint）

$$
\mathbf{g}(\mathbf{q}_t) = 0
$$

例如：
- 末端执行器位置约束
- 关节角度限制

---

### 3. 接触约束（Contact Constraint）

#### 不穿透约束

$$
\phi(\mathbf{q}_t) \geq 0
$$

- \\(\phi(\mathbf{q})\\)：接触点到地面的距离
- \\(\phi > 0\\)：在空中
- \\(\phi = 0\\)：接触地面

---

#### 摩擦力约束（摩擦锥）

$$
\|\mathbf{f}_{\text{tangential}}\| \leq \mu \cdot f_{\text{normal}}
$$

- \\(\mu\\)：摩擦系数
- 防止脚在地面上滑动

---

### 4. 控制约束（Control Constraint）

$$
\boldsymbol{\tau}_{\min} \leq \boldsymbol{\tau}_t \leq \boldsymbol{\tau}_{\max}
$$

- 关节力矩有物理上限

---

### 5. 状态约束（State Constraint）

$$
\mathbf{q}_{\min} \leq \mathbf{q}_t \leq \mathbf{q}_{\max}
$$

$$
\dot{\mathbf{q}}_{\min} \leq \dot{\mathbf{q}}_t \leq \dot{\mathbf{q}}_{\max}
$$

- 关节角度限制（生理范围）
- 速度限制

---

## 五、完整的优化问题

$$
\begin{aligned}
\min_{\mathbf{x}_{0:T}, \mathbf{u}_{0:T-1}} \quad & J_T(\mathbf{x}_T) + \sum_{t=0}^{T-1} J_t(\mathbf{x}_t, \mathbf{u}_t) \\
\text{s.t.} \quad & M(\mathbf{q}_t)\ddot{\mathbf{q}}_t + C(\mathbf{q}_t, \dot{\mathbf{q}}_t) = \boldsymbol{\tau}_t + \mathbf{J}(\mathbf{q}_t)^T \boldsymbol{\lambda}_t & \text{(动力学)} \\
& \phi(\mathbf{q}_t) \geq 0 & \text{(不穿透)} \\
& \|\mathbf{f}_{\text{tangential}}\| \leq \mu \cdot f_{\text{normal}} & \text{(摩擦锥)} \\
& \boldsymbol{\tau}_{\min} \leq \boldsymbol{\tau}_t \leq \boldsymbol{\tau}_{\max} & \text{(控制限制)} \\
& \mathbf{q}_{\min} \leq \mathbf{q}_t \leq \mathbf{q}_{\max} & \text{(状态限制)}
\end{aligned}
$$

---

## 六、优化方法分类

轨迹优化方法可以从**四个维度**进行分类：

---

### 维度 1：按优化时机（输入信息）

| | **离线优化** | **在线优化** |
|------|------------|------------|
| **输入** | 仅参考轨迹 | 参考轨迹 + 当前状态 |
| **优化频率** | 一次（整条轨迹） | 每帧/实时（滚动优化） |
| **代表方法** | CMA-ES、iLQR、DDP、DeepMimic（训练） | MPC、SAMCON、DeepMimic（推理） |
| **优点** | 可预先计算、推理快 | 可应对扰动、鲁棒性强 |
| **缺点** | 无法应对扰动 | 计算成本高 |

---

### 维度 2：按求解方法

| | **解析法（闭式解）** | **数值法（迭代）** | **学习法（数据驱动）** |
|------|-------------------|-------------------|----------------------|
| **核心思想** | 公式直接求解 | 迭代优化逼近最优 | 学习策略生成轨迹 |
| **代表方法** | LQR | iLQR、DDP、CMA-ES、SQP | DeepMimic、AMP、SAC |
| **梯度需求** | N/A | 需要（一阶/二阶/零阶） | 需要/不需要 |
| **收敛速度** | 瞬时 | 慢→快（取决于方法） | 训练慢、推理快 |
| **适用系统** | 线性 | 非线性 | 任意 |
| **泛化能力** | N/A | 无（每任务一次） | 有（可处理新情况） |

---

### 维度 3：按是否需要梯度

| | **基于梯度** | **无梯度（零阶）** |
|------|------------|------------------|
| **特点** | 收敛快、需要可微模型 | 收敛慢、适用于任意问题 |
| **代表方法** | iLQR、DDP、SQP、IPOPT | CMA-ES、SAMCON |
| **适用场景** | 平滑问题、精确跟踪 | 非凸问题、接触频繁 |

---

### 维度 4：按优化变量

| | **状态优化** | **控制优化** | **同时优化** |
|------|------------|------------|------------|
| **优化变量** | 仅状态轨迹 \\((q, \dot{q})\\) | 仅控制轨迹 \\((\tau)\\) | 两者都优化 |
| **代表方法** | 运动规划 | 逆动力学 | 大多数轨迹优化方法 |
| **特点** | 简单但可能不可行 | 保证物理可行 | 最完整但计算复杂 |

---

### 完整方法对比表

| 方法 | 时机 | 求解类型 | 梯度 | 闭式解 | 适用场景 |
|------|------|---------|------|-------|---------|
| **LQR** | 离线/在线 | 解析法 | N/A | ✅ | 线性系统 |
| **iLQR** | 离线/在线 | 数值法 | 一阶 | ⚠️ 每轮闭式 | 平滑非线性问题 |
| **DDP** | 离线/在线 | 数值法 | 二阶 | ⚠️ 每轮闭式 | 高精度需求 |
| **CMA-ES** | 离线 | 数值法 | 零阶 | ❌ | 非凸/不可微问题 |
| **SAMCON** | 在线 | 数值法 | 零阶 | ❌ | 角色实时控制 |
| **MPC** | 在线 | 数值法 | 取决于求解器 | ⚠️ | 实时控制 + 约束 |
| **DeepMimic** | 离线训练 + 在线推理 | 学习法 | 一阶 | ❌ | 通用策略学习 |
| **AMP** | 离线训练 + 在线推理 | 学习法 | 一阶 | ❌ | 无标注模仿学习 |

---

### 方法选择建议

```
问题类型 → 推荐方法
─────────────────────────
线性系统 → LQR
平滑非线性 → iLQR/DDP
接触频繁/不可微 → CMA-ES
实时控制 → MPC/SAMCON
需要泛化 → DeepMimic/AMP
离线制作动作 → iLQR/DDP/CMA-ES
```

---

## 七、常用优化方法详解

### 1. CMA-ES（Covariance Matrix Adaptation Evolution Strategy）

**核心思想**：进化策略，通过采样和选择迭代优化。

| 特点 | 说明 |
|------|------|
| **优点** | 无需梯度、适用于非凸问题 |
| **缺点** | 样本效率低、收敛慢 |
| **适用** | 低维问题、目标函数不平滑 |

---

### 2. SAMCON（Sampled Model Predictive Control）

**核心思想**：采样模型预测控制，结合 CMA-ES 和 MPC。

| 特点 | 说明 |
|------|------|
| **优点** | 适用于角色控制、可处理复杂约束 |
| **缺点** | 需要大量采样 |
| **适用** | 轨迹跟踪、平衡控制 |

---

### 3. iLQR（Iterative Linear Quadratic Regulator）

**核心思想**：迭代线性化 + LQR 求解。

| 特点 | 说明 |
|------|------|
| **优点** | 收敛快、适用于平滑问题 |
| **缺点** | 需要可微模型、可能陷入局部最优 |
| **适用** | 轨迹优化、局部修正 |

---

### 4. DDP（Differential Dynamic Programming）

**核心思想**：基于二阶泰勒展开的动态规划。

| 特点 | 说明 |
|------|------|
| **优点** | 二阶收敛、精度高 |
| **缺点** | 计算复杂、需要二阶导数 |
| **适用** | 高精度轨迹优化 |

---

### 5. 数值优化方法对比

| 方法 | 梯度需求 | 适用维度 | 收敛速度 | 适用于角色 |
|------|---------|---------|---------|-----------|
| **CMA-ES** | 无需 | 低维 | 慢 | ✅ 简单动作 |
| **SAMCON** | 无需 | 中维 | 中 | ✅ 常用 |
| **iLQR** | 一阶 | 高维 | 快 | ✅ 常用 |
| **DDP** | 二阶 | 高维 | 很快 | ⚠️ 计算复杂 |

---

## 八、与 DeepMimic/AMP 的关系

| 维度 | 轨迹优化 | DeepMimic/AMP |
|------|---------|---------------|
| **输出** | 单一轨迹 \\(\mathbf{x}_{0:T}\\) | 策略 \\(\pi(\mathbf{a}|\mathbf{s})\\) |
| **计算时机** | 离线优化（每任务一次） | 训练一次，在线推理 |
| **泛化能力** | 无（仅适用于该轨迹） | 有（可处理新情况） |
| **计算成本** | 高（分钟级） | 低（毫秒级推理） |
| **适用场景** | 特定动作生成 | 通用角色控制 |

**关系**：
- 轨迹优化结果可作为 RL 的参考轨迹
- RL 可学习模仿轨迹优化的行为

---

## 九、关键要点总结

1. **优化变量**：状态轨迹 \\(\mathbf{x}_{0:T}\\) + 控制轨迹 \\(\mathbf{u}_{0:T-1}\\)

2. **目标函数**：
   - 终端代价 \\(J_T(\mathbf{x}_T)\\)
   - 运行代价 \\(\sum J_t(\mathbf{x}_t, \mathbf{u}_t)\\)
   - 常见项：跟踪误差、控制 effort、平滑项

3. **约束条件**：
   - 动力学约束（运动方程）
   - 接触约束（不穿透、摩擦锥）
   - 控制/状态限制

4. **优化方法分类**：
   - 按优化时机：离线优化 vs. 在线优化
   - 按求解方法：解析法 (LQR) vs. 数值法 (iLQR/DDP/CMA-ES) vs. 学习法 (DeepMimic/AMP)
   - 按梯度需求：基于梯度 (iLQR/DDP) vs. 无梯度 (CMA-ES/SAMCON)
   - 按优化变量：状态优化 vs. 控制优化 vs. 同时优化

5. **方法选择建议**：
   - 线性系统 → LQR
   - 平滑非线性 → iLQR/DDP
   - 接触频繁/不可微 → CMA-ES
   - 实时控制 → MPC/SAMCON
   - 需要泛化 → DeepMimic/AMP

---

> &#x128218; **深入学习**：
> - [轨迹优化主页面](Tracking.md) - 轨迹优化的整体介绍
> - [简单例子](SimpleCase.md) - 轨迹优化的实际应用
> - [欠驱动系统问题](../PDControl/UnderactuatedSystem.md) - 轨迹优化要解决的问题之一
> - [稳态误差问题](../PDControl/SteadyStateError.md) - 轨迹优化的动机之一

---

> 本文出自 CaterpillarStudyGroup，转载请注明出处。
> https://caterpillarstudygroup.github.io/GAMES105_mdbook/

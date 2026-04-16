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
\mathbf{x} _{0:T} = (\mathbf{x} _0, \mathbf{x} _1, \dots, \mathbf{x} _T)
$$

其中每个状态 \\(\mathbf{x} _t\\) 包含：

| 变量 | 符号 | 维度 | 说明 |
|------|------|------|------|
| 位置 | \\(\mathbf{q}\\) | \\(n\\) | 关节角度 + 根节点位置 |
| 速度 | \\(\dot{\mathbf{q}}\\) | \\(n\\) | 关节角速度 + 根节点速度 |

对于人形角色，通常 \\(n \approx 34\\)（3DOF 根节点 + 31DOF 关节）。

---

### 控制轨迹（Control Trajectory）

$$
\mathbf{u} _{0:T-1} = (\mathbf{u} _0, \mathbf{u} _1, \dots, \mathbf{u} _{T-1})
$$

其中每个控制 \\(\mathbf{u} _t\\) 包含：

| 变量 | 符号 | 维度 | 说明 |
|------|------|------|------|
| 关节力矩 | \\(\boldsymbol{\tau}\\) | \\(n _{\text{joint}}\\) | 每个关节的力矩 |
| 根节点力 | \\(\mathbf{f} _{\text{root}}\\) | 3 | 虚拟外力（可选） |
| 根节点力矩 | \\(\boldsymbol{\tau} _{\text{root}}\\) | 3 | 虚拟外力矩（可选） |

---

## 三、目标函数

### 一般形式

$$
\min _{\mathbf{x} _{0:T}, \mathbf{u} _{0:T-1}} J(\mathbf{x} _{0:T}, \mathbf{u} _{0:T-1}) = J _T(\mathbf{x} _T) + \sum _{t=0} ^{T-1} J _t(\mathbf{x} _t, \mathbf{u} _t)
$$

| 项 | 名称 | 说明 |
|---|------|------|
| \\(J _T(\mathbf{x} _T)\\) | **终端代价**（Terminal Cost） | 关于终点状态的代价 |
| \\(J _t(\mathbf{x} _t, \mathbf{u} _t)\\) | **运行代价**（Running Cost） | 关于每步状态和控制的代价 |

---

### 常见的运行代价项

#### 1. 跟踪误差（Tracking Error）

$$
J _{\text{track}} = \sum _{t=0} ^{T-1} \|\mathbf{q} _t - \mathbf{q} _t^{\text{ref}}\|^2
$$

- \\(\mathbf{q} _t^{\text{ref}}\\)：参考轨迹（来自动捕等）
- 作用：让优化结果贴近参考动作

---

#### 2. 控制 Effort

$$
J _{\text{control}} = \sum _{t=0} ^{T-1} \|\boldsymbol{\tau} _t\|^2
$$

- 作用：最小化关节力矩，使动作更节能、更平滑

---

#### 3. 速度平滑项

$$
J _{\text{smooth}} = \sum _{t=0} ^{T-1} \|\dot{\mathbf{q}} _{t+1} - \dot{\mathbf{q}} _t\|^2
$$

- 作用：减少速度突变，使动作更流畅

---

#### 4. 质心高度项

$$
J _{\text{com}} = \sum _{t=0} ^{T-1} (h _{\text{com},t} - h _{\text{com}}^{\text{ref}})^2
$$

- 作用：维持质心高度，防止摔倒

---

### 完整的运行代价

$$
\begin{aligned}
J _t(\mathbf{x} _t, \mathbf{u} _t) = \;&w _{\text{track}} \|\mathbf{q} _t - \mathbf{q} _t^{\text{ref}}\|^2 \\\\
&+ w _{\text{control}} \|\boldsymbol{\tau} _t\|^2 \\\\
&+ w _{\text{smooth}} \|\dot{\mathbf{q}} _{t+1} - \dot{\mathbf{q}} _t\|^2 \\\\
&+ w _{\text{com}} (h _{\text{com},t} - h _{\text{com}}^{\text{ref}})^2
\end{aligned}
$$

其中 \\(w_i\\) 是权重系数，用于调节各项的重要性。

---

### 常见的终端代价

$$
J _T(\mathbf{x} _T) = w _{\text{vel}} \|\dot{\mathbf{q}} _T\|^2 + w _{\text{com}} (h _{\text{com},T} - h _{\text{com}}^{\text{ref}})^2
$$

- \\(\|\dot{\mathbf{q}}_T\|^2\\)：终点速度为零（确保静止）
- \\(h_{\text{com},T}\\)：终点质心高度（确保平衡）

---

## 四、约束条件

### 1. 动力学约束（Dynamics Constraint）

$$
M(\mathbf{q} _t)\ddot{\mathbf{q}} _t + C(\mathbf{q} _t, \dot{\mathbf{q}} _t) = \boldsymbol{\tau} _t + \mathbf{J}(\mathbf{q} _t)^T \boldsymbol{\lambda} _t
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
\mathbf{g}(\mathbf{q} _t) = 0
$$

例如：
- 末端执行器位置约束
- 关节角度限制

---

### 3. 接触约束（Contact Constraint）

#### 不穿透约束

$$
\phi(\mathbf{q} _t) \geq 0
$$

- \\(\phi(\mathbf{q})\\)：接触点到地面的距离
- \\(\phi > 0\\)：在空中
- \\(\phi = 0\\)：接触地面

---

#### 摩擦力约束（摩擦锥）

$$
\|\mathbf{f} _{\text{tangential}}\| \leq \mu \cdot f _{\text{normal}}
$$

- \\(\mu\\)：摩擦系数
- 防止脚在地面上滑动

---

### 4. 控制约束（Control Constraint）

$$
\boldsymbol{\tau} _{\min} \leq \boldsymbol{\tau} _t \leq \boldsymbol{\tau} _{\max}
$$

- 关节力矩有物理上限

---

### 5. 状态约束（State Constraint）

$$
\mathbf{q} _{\min} \leq \mathbf{q} _t \leq \mathbf{q} _{\max}
$$

$$
\dot{\mathbf{q}} _{\min} \leq \dot{\mathbf{q}} _t \leq \dot{\mathbf{q}} _{\max}
$$

- 关节角度限制（生理范围）
- 速度限制

---

## 五、完整的优化问题

$$
\begin{aligned}
\min _{\mathbf{x} _{0:T}, \mathbf{u} _{0:T-1}} \quad & J _T(\mathbf{x} _T) + \sum _{t=0} ^{T-1} J _t(\mathbf{x} _t, \mathbf{u} _t) \\\\
\text{s.t.} \quad & M(\mathbf{q} _t)\ddot{\mathbf{q}} _t + C(\mathbf{q} _t, \dot{\mathbf{q}} _t) = \boldsymbol{\tau} _t + \mathbf{J}(\mathbf{q} _t)^T \boldsymbol{\lambda} _t & \text{(动力学)} \\\\
& \phi(\mathbf{q} _t) \geq 0 & \text{(不穿透)} \\\\
& \|\mathbf{f} _{\text{tangential}}\| \leq \mu \cdot f _{\text{normal}} & \text{(摩擦锥)} \\\\
& \boldsymbol{\tau} _{\min} \leq \boldsymbol{\tau} _t \leq \boldsymbol{\tau} _{\max} & \text{(控制限制)} \\\\
& \mathbf{q} _{\min} \leq \mathbf{q} _t \leq \mathbf{q} _{\max} & \text{(状态限制)}
\end{aligned}
$$

---

## 六、问题建模

对这个问题用不同的方式建模，会得到不同的方法：

||||
|---|---|---|
|动态规划问题|Find a path {\\(s _t\\)} that minimizes |\\(J(s _0)=\sum _ {t=0}^{ } h(s _t,s _{t+1})\\)|
|轨迹问题|Find a sequence of action {\\(a _t\\)} that minimizes |  \\(J(s _0)=\sum _ {t=0}^{ } h(s _t,a _t)\\)<br> subject to <br> \\( s _{t+1}=f(s _t,a _t)\\)|
|控制策略问题|Find a policy \\( a _t=\pi (s _t,t)\\)或 \\( a _t=\pi (s _t)\\)that minimizes|\\(J(s _0)=\sum _ {t=0}^{ } h(s _t,a _t)\\)<br>subject to  <br>\\(s _{t+1}=f(s _t,a _t)\\)

--- 

## 六、关键要点总结

1. **优化变量**：状态轨迹 \\(\mathbf{x} _{0:T}\\) + 控制轨迹 \\(\mathbf{u} _{0:T-1}\\)

2. **目标函数**：
   - 终端代价 \\(J _T(\mathbf{x} _T)\\)
   - 运行代价 \\(\sum J _t(\mathbf{x} _t, \mathbf{u} _t)\\)
   - 常见项：跟踪误差、控制 effort、平滑项

3. **约束条件**：
   - 动力学约束（运动方程）
   - 接触约束（不穿透、摩擦锥）
   - 控制/状态限制

---

> 📚 **深入学习**：
> - [方法对比与分类](MethodComparison.md) - 各种优化方法的详细对比
> - [轨迹优化主页面](Tracking.md) - 轨迹优化的整体介绍
> - [简单例子](SimpleCase.md) - 轨迹优化的实际应用
> - [欠驱动系统问题](../PDControl/UnderactuatedSystem.md) - 轨迹优化要解决的问题之一
> - [稳态误差问题](../PDControl/SteadyStateError.md) - 轨迹优化的动机之一

---

> 本文出自 CaterpillarStudyGroup，转载请注明出处。
> https://caterpillarstudygroup.github.io/GAMES105_mdbook/

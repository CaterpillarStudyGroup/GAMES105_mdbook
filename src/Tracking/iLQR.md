# Iterative LQR (iLQR)

> &#x2705; **本章定位**：理解 iLQR 如何求解**非线性轨迹优化问题**，掌握其核心思想、算法流程和应用场景。

---

## 一、从 LQR 到 iLQR

### LQR 的局限性

LQR 问题有**闭式解**，但仅适用于：

| 假设 | 数学形式 | 限制 |
|------|---------|------|
| **线性动力学** | \\(x_{t+1} = A_t x_t + B_t u_t\\) | 只能处理线性系统 |
| **二次目标函数** | \\(J = x_T^T Q_T x_T + \sum (x_t^T Q_t x_t + u_t^T R_t u_t)\\) | 代价必须是二次的 |

**问题**：人形角色动画是**非线性系统**：
- 关节旋转涉及三角函数
- 动力学方程包含科里奥利力、离心力等非线性项
- 接触约束是非线性的

---

### iLQR 的核心思想

**关键洞察**：虽然 LQR 只能处理线性系统，但可以在**当前轨迹附近局部线性化**，然后用 LQR 求解。

```
非线性轨迹优化问题
    ↓
在当前轨迹 (x̄, ū) 附近线性化
    ↓
δx_{t+1} = A·δx_t + B·δu_t  （线性化动力学）
    ↓
J ≈ δx^T Q δx + δu^T R δu  （二次近似）
    ↓
LQR 问题（有闭式解）
    ↓
求解得到最优控制 δu* = -K·δx
    ↓
更新轨迹：x ← x̄ + δx, u ← ū + δu
    ↓
重复线性化→求解→更新，直到收敛
```

**这就是 iLQR（Iterative LQR）的核心思想！**

---

## 二、数学推导

### 1. 动力学线性化

在标称轨迹 \\((\bar{x}, \bar{u})\\) 附近做**一阶泰勒展开**：

$$
f(x,u) \approx f(\bar{x},\bar{u}) + \underbrace{\frac{\partial f}{\partial x}} _{A}(x-\bar{x}) + \underbrace{\frac{\partial f}{\partial u}} _{B}(u-\bar{u})
$$

定义偏差变量：
$$
\delta x = x - \bar{x}, \quad \delta u = u - \bar{u}
$$

得到线性化动力学：
$$
\delta x _{t+1} = A_t \delta x_t + B_t \delta u_t
$$

其中：
$$
A_t = \frac{\partial f}{\partial x}\bigg| _{(\bar{x}_t,\bar{u}_t)}, \quad B_t = \frac{\partial f}{\partial u}\bigg| _{(\bar{x}_t,\bar{u}_t)}
$$

---

### 2. 目标函数二次化

对目标函数做**二阶泰勒展开**（忽略常数项和一阶项）：

$$
J \approx \frac{1}{2}\delta x^T Q \delta x + \frac{1}{2}\delta u^T R \delta u
$$

其中：
$$
Q = \frac{\partial^2 J}{\partial x^2}, \quad R = \frac{\partial^2 J}{\partial u^2}
$$

---

### 3. 求解 LQR 子问题

得到标准 LQR 问题：
$$
\min _{\delta u} \frac{1}{2}\delta x^T Q \delta x + \frac{1}{2}\delta u^T R \delta u \quad \text{s.t.} \quad \delta x _{t+1} = A \delta x + B \delta u
$$

**最优解**（闭式解）：
$$
\delta u^* = -K \delta x
$$

其中反馈增益矩阵 \\(K\\) 通过 **Riccati 方程**求解：

$$
K_t = (R_t + B_t^T P _{t+1} B_t)^{-1} B_t^T P _{t+1} A_t
$$

$$
P_t = Q_t + A_t^T P _{t+1} A_t - A_t^T P _{t+1} B_t (R_t + B_t^T P _{t+1} B_t)^{-1} B_t^T P _{t+1} A_t
$$

---

## 三、iLQR 算法

### 完整算法流程

```
算法：iLQR 轨迹优化

输入：
    - 非线性动力学 f(x, u)
    - 目标函数 J(x, u)
    - 初始状态 x₀
    - 初始控制猜测 ū₀:T

输出：
    - 最优状态轨迹 x*₀:T
    - 最优控制轨迹 u*₀:T

步骤：
1. 初始化：设定初始轨迹 (x̄, ū)
2. Repeat until convergence:
   
   (a) 前向传递（Forward Pass）
       - 用当前控制 ū 仿真得到状态轨迹 x̄
       - 计算当前总代价 J
   
   (b) 线性化/二次化
       - 计算雅可比矩阵：Aₜ = ∂f/∂x, Bₜ = ∂f/∂u
       - 计算 Hessian 矩阵：Qₜ = ∂²J/∂x², Rₜ = ∂²J/∂u²
   
   (c) 逆向传递（Backward Pass）
       - 初始化：P_T = Q_T
       - 对 t = T-1, ..., 0:
         · 计算 Kₜ = (Rₜ + BₜᵀPₜ₊₁Bₜ)⁻¹ BₜᵀPₜ₊₁Aₜ
         · 计算 Pₜ = Qₜ + KₜᵀRₜKₜ + (Aₜ - BₜKₜ)ᵀPₜ₊₁(Aₜ - BₜKₜ)
         · （可选）计算 feedforward 项 kₜ
   
   (d) 更新控制
       - 计算新控制：u_new = ū + α·δu* （α 为线搜索步长）
       - δu* = -K·δx + k （LQR 解）
   
   (e) 收敛检查
       - 如果 |J_new - J| < ε，则收敛

```

---

### 前向传递 vs 逆向传递

| 步骤 | 目的 | 输入 | 输出 |
|------|------|------|------|
| **前向传递** | 仿真轨迹、计算代价 | 控制轨迹 ū | 状态轨迹 x̄、代价 J |
| **线性化** | 局部近似为 LQR 问题 | 轨迹 (x̄, ū) | 矩阵 A, B, Q, R |
| **逆向传递** | 求解 LQR、计算最优策略 | 矩阵 A, B, Q, R | 反馈增益 K、Value 矩阵 P |
| **更新** | 改进轨迹 | K, 当前轨迹 | 新控制轨迹 |

---

### 算法可视化

```
迭代 1: 初始轨迹（可能不满足动力学）
    ↓
┌─────────────────────────────┐
│  前向传递：仿真得到 x̄        │
│  线性化：计算 A, B           │
│  逆向传递：计算 K            │
│  更新：u_new = u + δu*      │
└─────────────────────────────┘
    ↓
迭代 2: 改进的轨迹
    ↓
┌─────────────────────────────┐
│  重复...                    │
└─────────────────────────────┘
    ↓
迭代 N: 收敛到最优轨迹
```

---

## 四、iLQR 与 DDP 的对比

### 一阶 vs 二阶方法

| 方法 | 动力学近似 | 目标函数近似 | 梯度需求 | 收敛速度 |
|------|-----------|-------------|---------|---------|
| **iLQR** | 一阶泰勒展开 | 二阶泰勒展开 | 一阶导数 | 线性收敛 |
| **DDP** | 二阶泰勒展开 | 二阶泰勒展开 | 二阶导数 | 二阶收敛 |

### 数学差异

**iLQR**（一阶动力学）：
$$
f(x,u) \approx f(\bar{x},\bar{u}) + \nabla f(\bar{x},\bar{u}) \begin{bmatrix} x-\bar{x} \\ u-\bar{u} \end{bmatrix}
$$

**DDP**（二阶动力学）：
$$
f(x,u) \approx f(\bar{x},\bar{u}) + \nabla f(\bar{x},\bar{u}) \begin{bmatrix} x-\bar{x} \\ u-\bar{u} \end{bmatrix} + \frac{1}{2} \begin{bmatrix} x-\bar{x} \\ u-\bar{u} \end{bmatrix}^T \nabla^2 f(\bar{x},\bar{u}) \begin{bmatrix} x-\bar{x} \\ u-\bar{u} \end{bmatrix}
$$

### 方法选择

| 场景 | 推荐方法 | 原因 |
|------|---------|------|
| 平滑非线性问题 | **iLQR** | 一阶导数易计算，收敛快 |
| 高精度需求 | **DDP** | 二阶收敛，迭代次数少 |
| 动力学复杂 | **iLQR** | 避免计算二阶导数 |
| 接触频繁 | **其他方法** | iLQR/DDP 都需可微模型 |

---

## 五、iLQR 在轨迹优化中的定位

### 按分类维度

| 维度 | iLQR 的定位 |
|------|------------|
| **优化时机** | 离线/在线均可 |
| **求解方法** | 数值法（迭代） |
| **梯度需求** | 基于梯度（一阶） |
| **适用系统** | 非线性（通过线性化） |
| **适用场景** | 平滑非线性问题 |

### 与其他方法对比

| 方法 | 时机 | 梯度 | 闭式解 | 适用场景 |
|------|------|------|-------|---------|
| **LQR** | 离线/在线 | N/A | ✅ | 线性系统 |
| **iLQR** | 离线/在线 | 一阶 | ⚠️ 每轮闭式 | 平滑非线性 |
| **DDP** | 离线/在线 | 二阶 | ⚠️ 每轮闭式 | 高精度需求 |
| **CMA-ES** | 离线 | 零阶 | ❌ | 非凸/不可微 |
| **SAMCON** | 在线 | 零阶 | ❌ | 角色实时控制 |

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

## 六、工程实践

### 应用实例

| 应用 | 说明 |
|------|------|
| **轨迹跟踪** | 用动捕数据作为参考，优化出物理可行的轨迹 |
| **局部修正** | 在现有轨迹附近优化，应对扰动 |
| **动作生成** | 结合前馈 + 反馈控制，生成平滑动作 |

### 实际考虑

**1. 初始猜测的重要性**
- iLQR 是局部优化方法，可能陷入局部最优
- 好的初始猜测（如动捕数据）能显著提高结果质量

**2. 线搜索（Line Search）**
- 更新轨迹时需要控制步长 α
- 常用：Armijo 条件、回溯线搜索

**3. 正则化**
- 在 Hessian 矩阵上加正则项防止奇异
- \\(R \leftarrow R + \lambda I\\)

**4. 终止条件**
- 代价变化小于阈值：\\(|J_{new} - J| < \epsilon\\)
- 达到最大迭代次数

---

## 七、与 DeepMimic/AMP 的关系

| 维度 | iLQR | DeepMimic/AMP |
|------|------|---------------|
| **输出** | 单一轨迹 \\(\mathbf{x} _{0:T}\\) | 策略 \\(\pi(\mathbf{a}|\mathbf{s})\\) |
| **计算时机** | 离线优化（每任务一次） | 训练一次，在线推理 |
| **泛化能力** | 无（仅适用于该轨迹） | 有（可处理新情况） |
| **计算成本** | 中（秒级） | 低（毫秒级推理） |
| **适用场景** | 特定动作生成 | 通用角色控制 |

**关系**：
- iLQR 轨迹优化结果可作为 RL 的参考轨迹
- RL 可学习模仿 iLQR 生成的行为

---

## 八、关键要点总结

### 核心思想

1. **迭代线性化**：在当前位置附近将非线性问题近似为 LQR 问题
2. **前后向传递**：前向仿真轨迹，逆向求解最优策略
3. **闭式解**：每轮迭代都有 LQR 闭式解，但需要多次迭代收敛

### 算法流程

```
初始化轨迹 → 前向传递 → 线性化 → 逆向传递 → 更新轨迹 → 检查收敛
```

### 优缺点

| 优点 | 缺点 |
|------|------|
| 收敛快（相比无梯度方法） | 需要可微模型 |
| 适用于高维问题 | 可能陷入局部最优 |
| 每轮迭代有闭式解 | 计算雅可比矩阵成本高 |

### 适用场景

- ✅ 平滑的非线性轨迹优化问题
- ✅ 有参考轨迹的跟踪问题
- ✅ 需要精确控制的场景
- ❌ 接触频繁、不可微的问题（用 CMA-ES）
- ❌ 实时控制（用 MPC/SAMCON）

---

## 九、深入学习

### 前置知识
- [LQR](LQR.md) - 线性二次调节器
- [轨迹优化的数学描述](MathematicalFormulation.md) - 问题形式化

### 相关方法
- [DDP](iLQR.md#四ilqr-与-ddp-的对比) - 二阶方法
- [CMA-ES](Sampling_based.md) - 无梯度优化
- [MPC](Optimal.md) - 在线优化

### 参考资料
- [Muico et al 2011 - Composite Control of Physically Simulated Characters](https://www.cc.gatech.edu/~jylee/publications/muico-popovic-2011.pdf)
- [Al Borno et al. 2013 - Trajectory Optimization for Full-Body Movements with Complex Contacts](https://www.cs.ubc.ca/~van/papers/2013-CGMN-1/trajopt.pdf)

---

> 本文出自 CaterpillarStudyGroup，转载请注明出处。
> https://caterpillarstudygroup.github.io/GAMES105_mdbook/

# 非线性问题与 Model-based/Model-free 方法

> &#x2705; **本章定位**：理解非线性轨迹优化问题的求解思路，以及 Model-based 和 Model-free 方法的区别。

---

## 一、非线性问题的求解思路

人体运动涉及到角度旋转，因此是**非线性系统**。

### 核心思想：局部近似为线性问题

![](./assets/12-25.png)

**方法**：在当前轨迹附近做泰勒展开，把问题近似为线性问题。

#### 目标函数二次化

$$
h(s_t,a_t)\approx h(\bar{s}_t ,\bar{a}_t)+\nabla h(\bar{s}_t ,\bar{a}_t)\begin{bmatrix}
 s_t-\bar{s} _t\\
a_t-\bar{a} _t
\end{bmatrix} + \frac{1}{2} \begin{bmatrix}
 s_t-\bar{s} _t\\
a_t-\bar{a} _t
\end{bmatrix}^T\nabla^2h(\bar{s}_t ,\bar{a}_t)\begin{bmatrix}
 s_t-\bar{s} _t\\
a_t-\bar{a} _t
\end{bmatrix}
$$

#### 动力学线性化

$$
f(s_t,a_t)\approx f(\bar{s}_t ,\bar{a}_t)+\nabla f(\bar{s}_t ,\bar{a}_t)\begin{bmatrix}
 s_t-\bar{s} _t\\
a_t-\bar{a} _t
\end{bmatrix}
$$

根据展开的阶数不同，对应不同的算法：

| 展开阶数 | 算法 | 链接 |
|----------|------|------|
| **一阶动力学** | iLQR（iterative LQR） | [iLQR 详解](iLQR.md) |
| **二阶动力学** | DDP（Differential Dynamic Programming） | [DDP 详解](iLQR.md#四 ilqr-与-ddp-的对比) |

---

## 二、相关应用

> &#x1F50E; [Muico et al 2011 - Composite Control of Physically Simulated Characters](https://www.cc.gatech.edu/~jylee/publications/muico-popovic-2011.pdf)

**工程实践要点**：
- 选择合适的 \(Q\) 和 \(R\)，需要一些工程上的技巧
- 为了求解方程，需要显式地建模运动学方程

---

## 三、Model-based Method vs. Model-free Method

### 核心区别

| 方法类型 | 特点 | 适用场景 |
|----------|------|----------|
| **Model-based** | 需要已知的动力学函数 \(f(s,a)\) | 简单问题、高效求解 |
| **Model-free** | 不需要显式模型，通过采样学习 | 复杂问题、黑盒系统 |

### Model-based 方法的局限

Model-based 方法要求 dynamic function \(f(s,a)\) 是已知的，但实际情况可能是：

1. **未知的**（Unknown）：系统动力学未知
2. **不精确的**（Inaccurate）：模型存在误差
3. **性质很差的**（Poorly-behaved）：梯度不能提供有用信息

**问题**：
- What if the dynamic function \(f(s,a)\) is not known?
- What if the dynamic function \(f(s,a)\) is not accurate?
- What if the system has noise?
- What if the system is highly nonlinear?

> &#x2705; \(f\) 未知只是把 \(f\) 当成一个黑盒子，仍需要根据 \(s_t\) 得到 \(s_{t+1}\)。
> 不准确来源于：（1）测量误差（2）问题简化

### 方法对比

| 维度 | Model-based | Model-free |
|------|-------------|------------|
| **代表方法** | iLQR, DDP, MPC | CMA-ES, Deep RL |
| **模型需求** | 需要显式模型 | 无需/可学习 |
| **样本效率** | 高 | 低 |
| **计算成本** | 高（需要梯度） | 中/高 |
| **适用场景** | 平滑、可微问题 | 黑盒、不可微问题 |

对于 Model-free 方法，见：[Sampling-based Policy Optimization](../Sampling_based.md)

---

> 本文出自 CaterpillarStudyGroup，转载请注明出处。
> https://caterpillarstudygroup.github.io/GAMES105_mdbook/

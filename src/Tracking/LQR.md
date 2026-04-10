
P52
# Linear Quadratic Regulator (LQR)

![](../assets/12-17.png)

 - LQR is a special class of optimal control problems with
    - **Linear** dynamic function
    - **Quadratic** objective function


> &#x2705; LQR 是控制领域一类经典问题，它对原控制问题做了一些特定的约束。因为简化了问题，可以得到有特定公式的 \\(Q\\) 和 \\(V\\).

---

## 从轨迹优化到 LQR

### 一般轨迹优化问题

$$
\min_{\mathbf{x}_{0:T}, \mathbf{u}_{0:T-1}} J(\mathbf{x}, \mathbf{u}) \quad \text{s.t.} \quad \mathbf{x}_{t+1} = f(\mathbf{x}_t, \mathbf{u}_t)
$$

| 特点 | 说明 |
|------|------|
| **动力学** | 非线性：$f(x,u)$ 是任意非线性函数 |
| **目标函数** | 任意形式：$J(x,u)$ 可能非凸、非二次 |
| **求解难度** | 很难直接求解，需要数值方法 |

---

### LQR 的简化假设

LQR 对一般问题做了两个关键假设：

| 假设 | 数学形式 | 效果 |
|------|---------|------|
| **线性动力学** | $x_{t+1} = A_t x_t + B_t u_t$ | 状态转移是线性的 |
| **二次目标函数** | $J = x_T^T Q_T x_T + \sum (x_t^T Q_t x_t + u_t^T R_t u_t)$ | 代价是状态和控制的二次函数 |

**好处**：问题有**闭式解**（解析解），无需数值迭代！

---

### 如何从一般问题得到 LQR 形式

**核心思想**：在当前轨迹附近**局部近似**

```
一般轨迹优化问题
    ↓
在当前轨迹 (x̄, ū) 附近线性化
    ↓
δx_{t+1} = A·δx_t + B·δu_t  （线性化动力学）
    ↓
J ≈ δx^T Q δx + δu^T R δu  （二次近似）
    ↓
LQR 问题（有闭式解）
```

---

### 1. 动力学线性化

在标称轨迹 $(\bar{x}, \bar{u})$ 附近做一阶泰勒展开：

$$
f(x,u) \approx f(\bar{x},\bar{u}) + \underbrace{\frac{\partial f}{\partial x}}_{A}(x-\bar{x}) + \underbrace{\frac{\partial f}{\partial u}}_{B}(u-\bar{u})
$$

定义偏差变量：$\delta x = x - \bar{x}, \quad \delta u = u - \bar{u}$

得到线性化动力学：

$$
\delta x_{t+1} = A_t \delta x_t + B_t \delta u_t
$$

其中 $A_t = \frac{\partial f}{\partial x}|_{(\bar{x}_t,\bar{u}_t)}, \quad B_t = \frac{\partial f}{\partial u}|_{(\bar{x}_t,\bar{u}_t)}$

---

### 2. 目标函数二次化

对目标函数做二阶泰勒展开（忽略常数项和一阶项）：

$$
J \approx \frac{1}{2}\delta x^T Q \delta x + \frac{1}{2}\delta u^T R \delta u
$$

其中 $Q = \frac{\partial^2 J}{\partial x^2}, \quad R = \frac{\partial^2 J}{\partial u^2}$

---

### 3. 求解 LQR

得到标准 LQR 问题：

$$
\min_{\delta u} \frac{1}{2}\delta x^T Q \delta x + \frac{1}{2}\delta u^T R \delta u \quad \text{s.t.} \quad \delta x_{t+1} = A \delta x + B \delta u
$$

**最优解**：

$$
\delta u^* = -K \delta x
$$

其中 $K$ 通过 Riccati 方程求解。

---

### 4. 迭代直到收敛（iLQR 思想）

| 步骤 | 操作 |
|------|------|
| 1 | 猜测初始轨迹 $(\bar{x}, \bar{u})$ |
| 2 | 线性化动力学：计算 $A, B$ |
| 3 | 二次化目标：计算 $Q, R$ |
| 4 | 求解 LQR：得到 $\delta u^* = -K \delta x$ |
| 5 | 更新轨迹：$x \leftarrow \bar{x} + \delta x, u \leftarrow \bar{u} + \delta u$ |
| 6 | 重复 2-5 直到收敛 |

**这就是 iLQR（Iterative LQR）的核心思想！**

---

### 总结：LQR 在轨迹优化中的定位

| | 一般轨迹优化 | LQR |
|---|-------------|-----|
| **动力学** | 非线性 | 线性（近似） |
| **目标函数** | 任意形式 | 二次（近似） |
| **求解方法** | 数值迭代 | 闭式解 |
| **适用范围** | 全局 | 局部（轨迹附近） |
| **与 iLQR 关系** | 原始问题 | iLQR 每轮迭代的子问题 |

**关键理解**：
- LQR 本身只适用于线性系统
- 但通过**迭代线性化**，可以用 LQR 求解非线性问题（iLQR）
- 因此 LQR 是理解 iLQR、DDP 等高级方法的基础

---



P53   
## A very simple example   

### 问题描述

![](../assets/12-18.png) 

Compute a target trajectory \\(\tilde{x}(t)\\) such that the simulated trajectory \\(x(t)\\) is a sine curve.   


![](../assets/12-19.png) 

> &#x2705; 目标函数是关于优化对象 \\(x_n\\) 的二次函数。   

$$
\min _{(x_n,v_n,\tilde{x} _n)} \sum _{n=0}^{N} (\sin (t_n)-x_n)^2+\sum _{n=0}^{N}\tilde{x}^2_n 
$$

> &#x2705; 运动学方程中的 \\(x_{n+1}\\)、\\(v_{n+1}\\) 与上一帧状态 \\(x_n\\)、\\(v_n\\) 是线性关系。   

$$
\begin{align*}
 s.t. \quad \quad v _ {n+1} & = v _ n + h(k _p ( \tilde{x} _ n - x _ n) - k _ dv _ n ) \\\\
 v _ {x+1} & = x _ n + hv _ {n+1}
\end{align*}
$$

> &#x2705; 这是一个典型的 LQR 问题。  

P54  
objective function   

$$
\min s^T_TQ_Ts_T+\sum_{t=0}^{T} s^T_tQ_ts_t+a^T_tR_ta_t
$$

subject to dynamic function     

$$
s_{t+1}=A_ts_t+B_ta_t   \quad \quad \text{for }   0\le t <T 
$$


P58   
### 推导一步

> &#x2705; 由于存在optimal substructure，每次只需要考虑下一个状态的最优解。  
> &#x2705; 每一个状态基于下一个状态来计算，不断往下迭代，直到最后一个状态。  
> &#x2705; 最后一个状态的V的计算与a无关。  
> &#x2705; 计算完最后一个，再计算倒数第二个，依次往前推。  

![](../assets/12-20-1.png) 


P60   
公式整理得：  

![](../assets/12-20.png) 


P61 
![](../assets/12-21.png) 

> &#x2705; 结论：最优策略与当前状态的关系是矩阵K的关系。\\(K\\) 是线性反馈系数。      

P62   
当a取最小值时，求出V：

![](../assets/12-22.png)  

> &#x2705; \\(V(S_{T-1})\\)和\\(V(S_{T})\\)的形式基本一致，只是P的表示不同。 

P63  
### 推导每一步


![](../assets/12-23.png) 

P64   
### Solution

 - LQR is a special class of optimal control problems with   
    - Linear dynamic function   
    - Quadratic objective function   
 - Solution of LQR is a linear feedback policy  

![](../assets/12-24.png) 


P65   
## 更复杂的情况

 - How to deal with   
    - Nonlinear dynamic function?   
    - Non-quadratic objective function?   

> &#x2705; 人体运动涉及到角度旋转，因此是非线性的。  



---------------------------------------
> 本文出自CaterpillarStudyGroup，转载请注明出处。
>
> https://caterpillarstudygroup.github.io/GAMES105_mdbook/

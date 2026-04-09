P62
# Static Balance

## 本章要解决的问题

**核心问题**：如何在**静止站立**的情况下，通过控制策略保证角色**不摔倒**？

### 问题分解

| 子问题 | 说明 | 解决方案 |
|--------|------|---------|
| **什么是平衡？** | 质心在支撑面内 | 检测质心投影位置 |
| **为什么难？** | 人形角色是欠驱动系统 | 无法直接控制质心 |
| **如何纠正？** | 需要施加力/力矩 | PD 控制、Jacobian Transpose |
| **力矩如何计算？** | 关节力矩如何产生期望效果 | \\(\tau = J^T f\\) |

### 与欠驱动系统的关系

```
欠驱动系统 → 无法直接控制质心 → 需要间接控制
                    ↓
        通过关节力矩控制质心位置
                    ↓
      在脚踝或髋关节施加额外力矩
```

### 两种控制策略

| 策略 | 方法 | 特点 |
|------|------|------|
| **简单 PD 控制** | 在脚踝/髋关节加额外力矩 | 简单直接，适用于静止站立 |
| **Jacobian Transpose** | 虚拟力 → 关节力矩转换 | 更灵活，可实现多种动作 |

> &#x2705; **深入学习**：[欠驱动系统问题](UnderactuatedSystem.md) - 理解为什么质心无法直接控制

---

## 定义
What is balance?

> &#x2705; Static Balance：在不发生移动的情况下，通过简单的控制策略，保证角色不摔倒。
> &#x2705; 平衡：质心在支撑面内。  


P64  
![](../assets/10-29.png)   


> &#x2705; 人的质心：每一段的质心的加权平均。  
> &#x2705; 人的支撑面：两脚之内。   


P66 
## A simple strategy： PD Control   


A simple strategy to maintain balance:   

### 根据条件计算力矩

 - Keep projected CoM close to the center of support polygon **while tracking a standing pose**   

 - Use **PD control** to compute feedback torque   


![](../assets/10-30.png)   


> &#x2705; 力矩 1：让角色保持某个姿势。  
> &#x2705; 力矩 2：让质心与目标质心位置接近。力矩额外加在脚裸关节或髋关节上。    
> &#x2705; 在某些关节上增加一些额外的力矩。   


P68  
### 施加力矩

 - Apply the feedback torque at **ankles** (ankle strategy) or **hips** (hip strategy)   


P69   
## Jacobian Transpose Control

> &#x2705; 实现 static balance，除了 PD 控制还有其它方法。  

### 计算要施加的力

![](../assets/10-32.png)   

Can we use joint torques \\(\tau _i\\) to mimic the effect of a force \\(f\\) applied at \\(x\\)   

 - Note that the **desired force** \\(f\\) is not actually applied   
 - Also called **“virtual force”**   



> &#x2705; 通过施加 \\(\tau _1 ，\tau _2，\tau _3\\) 来达到给 \\(x\\) 施加 \\(f\\) 的效果！  




P73  
### 把力转化为力矩  


Make \\(f\\) and \\(\tau _i\\) done the same power    

$$
P=f^T\dot{x}=\tau  ^T\dot{\theta } 
$$

> &#x2705; 从做功的角度。力矩所做的功（功率）与虚力要做的功（功率）相同。功率 = \\(fv\\)
  
Forward kinematics \\(x=g(\dot{\theta } )\Rightarrow \dot{x}=J \dot{\theta } \\)   

> &#x2705; \\(g（* ）\\) 是一个FK函数。其中：  
$$
J=\frac{\partial g}{\partial \theta } 
$$    
> &#x2705; 把 \\( \dot{x } \\) 代入上面公式得   

$$
f^T J\dot{\theta } = \tau  ^T\dot{\theta } 
$$

$$
\Downarrow 
$$

P76  

$$
\tau =J^Tf
$$

> &#x2705; 把 \\( \tau\\) 分解为每一个关节每一个旋转的 \\( \tau\\)．通过 Jacobian 矩阵的含义推出：     

$$
\Downarrow 
$$

$$
\tau _i=(x-p_i)\times f
$$


P77  
### 用于Static Balance

A simple strategy to maintain balance:   
 - Keep projected CoM close to the center of support polygon **while tracking a standing pose**    

 - Use PD control to compute feedback **virtual force**    

> &#x2705; P66 中在 Hips 上加力矩的方式只能进行简单的控制。    
> &#x2705; 可以通过虚力实现相似的效果。用 \\(PD\\) 控制计算出力，再通过关节力矩实现这个力。  

$$
f=k_p(\bar{c} -c)-k_d\dot{c}
$$

> &#x2705; \\(c\\) 不一定是投影距离，还可以描述高度距离，实现站起蹲下的效果。    

P78   

 - Assuming \\(f\\) **is applied to the CoM**, compute necessary joint torques using Jacobian transpose control to achieve it   

> &#x2705; 但也不是真的加力，而是通过前面讲的 Jacobian transpose control 方法转为特定关节的力矩。   

 - Usually using the joints in the legs   

> &#x2705; 最后达到在Hips上加力的效果  
> &#x2705; 但这种方式能施加的力非常弱，只能实现比较微弱的平衡


P79
## A fancier strategy:

 - Mocap tracking as an objective function
 - Controlling both the CoM position/**momentum** and the **angular** momentum
 - Solve a **one-step** optimization problem to compute joint torques

> &#x1F50E; ![](../assets/10-34.png)

---

## 小结：静态平衡要解决的问题

### 核心问题回顾

**Static Balance** 要解决的是：**在静止站立的情况下，如何通过控制策略保证角色不摔倒？**

### 问题链条

```
欠驱动系统
    ↓
无法直接控制质心位置
    ↓
需要通过关节力矩间接控制
    ↓
在关键关节（脚踝/髋关节）施加额外力矩
    ↓
让质心投影回到支撑面中心
```

### 关键概念

| 概念 | 说明 |
|------|------|
| **质心（CoM）** | 身体各部分质心的加权平均 |
| **支撑面** | 双脚接触区域构成的多边形 |
| **平衡条件** | 质心投影在支撑面内 |
| **虚拟力** | 通过 Jacobian 转换为实现效果的力 |
| **Jacobian Transpose** | \\(\tau = J^T f\\)，力到力矩的转换 |

### 两种策略对比

| 策略 | 优点 | 局限 |
|------|------|------|
| **简单 PD 控制** | 实现简单、计算快 | 只能实现基础平衡 |
| **Jacobian Transpose** | 灵活、可控制多方向 | 能施加的力有限 |

### 与前面章节的关系

| 章节 | 关系 |
|------|------|
| [欠驱动系统问题](UnderactuatedSystem.md) | 解释了为什么质心无法直接控制 |
| [稳态误差问题](SteadyStateError.md) | PD 控制用于平衡时的精度限制 |
| [前馈与反馈控制](FeedforwardVsFeedback.md) | 平衡控制主要是反馈控制 |

---

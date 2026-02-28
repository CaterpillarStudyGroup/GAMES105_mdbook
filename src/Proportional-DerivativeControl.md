
P55   
# Proportional-Derivative Control

这是一种常用的控制器。   

> &#x2705; 有反馈，但还是算是前向控制，因为反馈的部分和想控制的部分不完全一致。   

## 简化问题分析

### 问题描述

Compute force \\(f\\) to move the object to the target height    

> &#x2705; 例子：物体只能沿竿上下移动，且受到重力。  
> &#x2705; 控制目的：设计控制器，使物体在控制力的作用下达到目标高度。   

![](./assets/09-23-1.png)

### 使用比例控制

![](./assets/09-23-2.png)

实际上：会产生上下振荡，不会停在目标位置。

![](./assets/09-23.png)

P56   
### 比例控制+Damping

![](./assets/09-24.png)


> &#x2705; 改进：如果物体已有同方向速度，则力加得小一点。  


P57   

### 比例微分控制

![](./assets/09-24-1.png)

> &#x2705; 第一项：比例控制；第二项：微分控制   

P59   
> &#x2705; 存在的问题：为了抵抗重力，一定会存在这样的误差。

![](./assets/09-26.png)
   
P60   

Increase stiffness \\(k_p\\) reduces the steady-state error, but can make the system too stiff and numerically unstable    

> &#x2705; 增加 \\(k_p\\) 可以减小误差，但会让人看起来很僵硬。  



P61   
### 比例积分微分控制 Proportional-Integral-Derivative controller 

![](./assets/09-27.png)  
![](./assets/09-28.png)  


> &#x2705; 解决误差方法：积分项。   
> &#x2705; 但角色动画通常不用积分项。   
> &#x2705; 积分项跟历史相关，会带来实现的麻烦和控制的不稳定。  



P62   
## PD Control for Characters

> &#x2705; 前面是 PD 的例子，这里是 PD 在物理仿真角色上的应用，计算在每个关节上施加多少力矩。   

![](./assets/09-29.png)

![](./assets/09-30.png)



> &#x2705; 通常目标的速度 \\(\dot{\bar{q}}  = 0\\).   

因此：  
![](./assets/09-31.png)


P63  
### PD Control for Characters的参数和效果

> &#x2705; \\(K_p\\) 太小：可能无法达到目标状态。   
> &#x2705; \\(K_p\\) 太大：人体很僵硬。  
> &#x2705; \\(k_d\\) 太小：动作有明显振荡。    
> &#x2705; \\(k_d\\) 太大，要花更多时间到达目标资态。   


P66  
## Tracking Controllers

> &#x2705; 引入PD Control之后，控制本质上变成了设计 targer state．   

![](./assets/09-32.png)   

P67  
### Full-body Tracking Controllers


![](./assets/09-33.png)   

> &#x2705; 设计角色的目标轨迹。  
> &#x2705; 直接用 PD 控制跟踪动捕数据会有很大的问题，原因：   
> （1）稳态误差。  
> （2）运动轨迹跟原轨迹之间会相差一点点相位  
> （3）欠驱动系统，有一点点误差，后面无法修复。  



P71  
### feedforward ？ feedback

Is PD control a **feedforward** control?   
a **feedback** control?   


> &#x2705; 是反馈控制，因为计算 \\(\tau \\) 时使用了当前状态 \\(q\\)．  
> &#x2705; 是前馈控制，因为在 PD 系统里，状态是位置不是 \\(q\\).   



P72   
## 欠驱动系统

### 欠驱动系统的问题

由于是欠驱动系统，Tracking Mocap with Joint Torques会遇到问题，因为：   

\\(\tau _j\\): joint torques   
Apply \\(\tau _j\\) to “child” body    
Apply \\(-\tau _j\\) to “parent” body   
**All forces/torques sum up to zero**   


> &#x2705; 合力为零，无法控制整体的位置和朝向。   



P73  
### 解决方法：增加净外力

\\(f_0,\tau _0\\): root force / torque    
\\(\quad\quad\\)Apply \\(f_0\\) to the root body    
\\(\quad\quad\\)Apply \\(\tau _0\\) to the root body   
\\(\quad\quad\\)Non-zero net force/torque on the character!  


> &#x2705; 净外力，无施力者，用于帮助角色保持平衡。   
> &#x2705; 缺点：让角色看起来像提线木偶。   



P75   
## Mixture Simulation and Mocap

![](./assets/09-34.png)


> &#x2705; 关键帧与仿真的混合。  




---------------------------------------
> 本文出自CaterpillarStudyGroup，转载请注明出处。
>
> https://caterpillarstudygroup.github.io/GAMES105_mdbook/
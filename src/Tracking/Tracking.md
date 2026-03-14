# Tracking Controllers/Trajectory Optimization

> &#x2705; 直接用 PD 控制跟踪动捕数据会有很大的问题，原因：   
> （1）稳态误差。  
> （2）运动轨迹跟原轨迹之间会相差一点点相位  
> （3）欠驱动系统，缺少对根结点的力。 

> &#x2705; 解决方法：不直接学习目标轨迹，而是先对目标轨迹增加一个修正。即轨迹优化。    
> &#x2705; 引入轨迹优化之后，控制本质上变成了设计 targer state．   

![](../assets/09-32.png)   

P30   
## 轨迹优化的问题描述

> &#x1F50E; [Witkin and Kass 1988 – Spacetime constraints]   

> &#x2705; 轨迹优化的问题描述：   

Find the trajectories:   

$$
\begin{align*}
 \text{Simulation trajectory } & : S_0,S_1,\dots ,S_T \\\\
 \text{Control trajectory } & : a_0,a_1,\dots ,a_{T-1}
\end{align*}
$$

> &#x2705; \\(S\\)：每一个时刻，角色的状态，包括位置、速度、朝向等。   
> &#x2705; \\(a\\)：目标轨迹。   
> &#x2705; 优化出 \\(S\\) 和 \\(a\\)，根据 \\(S\\) 和 \\(a\\) 得到关节力矩，关节力矩再控制角色。   

that minimize the objective function   

$$
\min_{(S_t,a_t)} f(S_T)+\sum_{t=0}^{T-1} f(S_t,a_t)
$$

> &#x2705; 目标函数第一项：关于轨迹结束时刻的状态。   
> &#x2705; 第二项：关于每一时刻的状态。    

and satisfy the constraints:   

$$
\begin{align*}
M\dot{v}+C(x,v)   & =f+J^T\lambda & \text{Equations of motion} \\\\
 g(x,v) & \ge 0 & \text{constraints } \quad \quad\quad
\end{align*}
$$

> &#x2705; 约束第一项：运动学方程。   
> &#x2705; 第二项：根据场景特殊定义的约束。  

 

P62  
# Static Balance   

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

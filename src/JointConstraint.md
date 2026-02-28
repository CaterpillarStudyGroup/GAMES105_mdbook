
P105   
# Joint Constraint

#### 约束方程

> &#x2705; 前面是约束应用的简单例子，真正的问题是如何把约束应用到两个物体的连接约束上。   

![](./assets/08-10.png)

> &#x2705; 因此设计约束：从 \\(x_1\\) 求 \\(x_J\\)位置 和从 \\(x_2\\) 求 \\(x_J\\)位置所得结果应该相同。  

$$
x_1+R_1r_1=x_J=x_2+R_2r_2
$$

对\\(dt\\)求导：

$$
v_1+\omega _1\times r_1=v_2+\omega _2\times r_2
$$

P106   
> &#x2705; 整理得矩阵形式，得：   

$$
\begin{bmatrix}
 I_3 & -[r_1] _ \times  & -I_3 & [r_2] _ \times 
\end{bmatrix}\begin{bmatrix}
v_1 \\\\
w_1 \\\\
v_2 \\\\
w_2
\end{bmatrix}=0
$$

> &#x2705; 矩阵乘法第一项为 \\(J\\)，第二项为 \\(v\\). 进一步简化为：  

$$
Jv=0
$$

P107   
 
#### 运动方程+约束方程   

$$
\begin{align*}
 M\dot{v} +C(x,v)& =f+J^T\lambda  \\\\
  Jv&=0
\end{align*}
$$

> &#x2705; 公式 1：运动方程。公式 2：约束方程。  
> &#x2705; 运动方程与约束方程联立，可以解出约束力\\(f_J\\)，以及下一时刻的速度。   


P109  
#### Different Types of Joints

> &#x2705; 前面描述的是 Ball Joint的约束。  

![](./assets/08-11.png)

> &#x2705; Hinge 约束：除了位置还有角速度约束，在某个轴上的角速度应当一致。Universal 类似。    



P110   
## A System with Many Links Joints   


![](./assets/08-12.png)


> &#x2705; 分段多刚体在公式上没有本质区别，只是矩阵更大一点。   


---------------------------------------
> 本文出自CaterpillarStudyGroup，转载请注明出处。
>
> https://caterpillarstudygroup.github.io/GAMES105_mdbook/
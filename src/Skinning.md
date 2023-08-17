# Lecture 07


P2   
## Outline   

 - Skinning   
    - Linear Blend Skinning (LBS)   
    - Dual Quaternion Skinning (DQS)   
    - Blendshapes   

 - Examples:   
    - The SMPL model  
    - Facial Animation  

Many images are from: <https://skinning.org/>   
*Alec Jacobson, Zhigang Deng, Ladislav Kavan, and J. P. Lewis. 2014*.   
**Skinning: real-time shape deformation**.     
*In ACM SIGGRAPH 2014 Courses (SIGGRAPH '14)*    



P7  
## Skinning Deformation   


![](/assets/07-01.png)   

![](/assets/07-02.png)   


P9   
## Skinning Deformation

![](/assets/07-2.png)  


P12   
## Skinning Deformation    

![](/assets/07-03.png)   


P13   
## Skinning Deformation

![](/assets/07-04.png) 

P15   
## Bind Pose

![](/assets/07-05.png)   


P16   
## Bind Pose


![](/assets/07-06.png)   


P18   
## Skinning Deformation

![](/assets/07-07.png)   


P20   
## Skinning Deformation

![](/assets/07-08.png)   

$$
r_2=Q^T_2(x-o_2)   \quad \quad  r_1=Q^T_1(x-o_1)
$$


P23   
## Skinning Deformation   

![](/assets/07-09.png)   

P29   
## Skinning

![](/assets/07-10.png)   


P31   
## Linear Blend Skinning (LBS)

$$
{x}'_ i= \sum_ {j=1} ^ {m} w _ {ij}({Q}'_ jr_{ij}+{o}'_j)
$$

 - Used widely in industry   
 - Efficient and GPU-friendly  
    - Games like it   


P33  
## Automatic Skinning?

![](/assets/07-11.png)   

![](/assets/07-12.png)   

Pinocchio [Baran et al., 2007]   



P37   
## Linear Blend Skinning (LBS)

![](/assets/07-13.png)   


P39   
## Candy-Wrapper Artifact

![](/assets/07-14.png)   



P40  
## Advanced Skinning Methods   


 - Multi-linear Skinning (we will not cover this)   
    - Multi-weight enveloping [Wang and Phillips 2002]   
    - Animation Space [Merry et al. 2006]   
    - ……   

 - Nonlinear Skinning   
    - Dual-quaternion Skinning (DQS)   

![](/assets/07-15.png)   


P41   
## Non-linear Skinning

![](/assets/07-16.png)   

Can we use quaternions and SLERP?    

P42  
## Non-linear Skinning

![](/assets/07-16-1.png)   


P43  
## Non-linear Skinning   

$$
{x}' _ i = ( \sum _ {j=1}^{m} w _ {ij} R _ j) x _ i+ \sum _ {j=1}^{m}w _ {ij}t_ j
$$

$$
R \in SO(3)
$$

$$
T_j=\begin{bmatrix}
 R_j & t_j\\\\
 0 &1
\end{bmatrix} \in SE(3)
$$


P46  
## Interpolation in 𝑆𝑂(3)

![](/assets/07-17.png)   



P49  
## Interpolation in 𝑆𝐸(3)

![](/assets/07-18.png)   


P51  
## Intrinsic Blending

![](/assets/07-19.png)   


P52   
## Dual-Quaternion Skinning (DQS)

Ladislav Kavan, Steven Collins, Jiri Zara, Carol O‘Sullivan. **Geometric Skinning with**    
**Approximate Dual Quaternion Blending**, ACM Transaction on Graphics, 27(4), 2008.   



P54   
## Dual Numbers  

![](/assets/07-20.png)   


P55  
## Dual Quaternion   

 - Dual quaternion   

$$
\hat{q} =q_0 + \varepsilon q_\varepsilon
$$

$$
\text{where } \varepsilon^2=0
$$

A good note of dual-quaternion:   
<https://faculty.sites.iastate.edu/jia/files/inline-files/dual-quaternion.pdf>   


P56   
## Dual Quaternion   

 - Scalar Multiplication   

$$
s\hat{q}=sq_r+sq_\varepsilon\varepsilon
$$

 - Addition   

$$
\hat{q} _ 1 + \hat{q} _2=q _ {r1}+ q _ {r2} + \varepsilon (q _ {\varepsilon 1} + q _ {\varepsilon 2})
$$

 - Multiplication  

$$
\hat{q} _ 1 \hat{q} _ 2 = q _ {r1} q _ {r2} + \varepsilon (q _ {r1} q _ {\varepsilon 2} + q _ {r2} q _ {\varepsilon 1})
$$


P57   
## Dual Quaternion  

 - Dual quaternion   

$$
\hat{q}=q_0+\varepsilon q_\varepsilon
$$

 - Conjugation   

$$
\mathrm{I}:\hat{q}^* =q ^ * _ 0+\varepsilon q ^ * _ \varepsilon
$$

$$
\mathrm{II}:\hat{q}^ {\circ}  =q _ 0 - \varepsilon q _ \varepsilon 
$$


$$
\mathrm{III}: \hat{q} ^ \star    = q ^ * _ 0 - \varepsilon q ^ *_ \varepsilon 
$$

$$
\quad \quad \quad \quad = ({\hat{q} ^ *}) ^ {\circ} = (\hat{q} ^ {\circ}) ^ *
$$



$$
(\hat{q} _1\hat{q}_2)^\times =\hat{q} _1 ^\times \hat{q}_2^\times
$$

 - Norm   

$$
||\hat{q}||=\sqrt{\hat{q}^*\hat{q}} =||q_0||+\frac{\varepsilon (q_0\cdot q_\varepsilon) }{||q_0||} 
$$

P58  
## Dual Quaternion

 - Unit dual quaternion: \\(||\hat{q}||=1\\), which requires:   

$$
||q_0||=1
$$

$$
q_0 \cdot q_\varepsilon=0
$$


P59  
## Dual Quaternion ⇔ Rigid Transformation   

 - Like quaternion, any rigid transformation \\(T \in SE(3)\\) can be converted **into a unit dual quaternion**    

$$
Tx=Rx+t
$$

$$
T=[R\mid t]\to \hat{q} =q_0+\varepsilon q_\varepsilon 
$$

$$
\begin{matrix}
 q_0=r \quad & \text{ quaternion of } R \quad \quad\quad\quad\\\\
 q_\varepsilon =\frac{1}{2} tr & \text{ pure quaternion } t = (0,t)
\end{matrix}
$$


P60   
## Dual Quaternion ⇔ Rigid Transformation   


 - Transform a vector \\(v\\) using unit dual quaternion   

$$
{\hat{v} }' =\hat{q} \hat{v} \hat{q} ^\star 
$$

where   

$$
\begin{align*}
 \hat{v} & = 1+\varepsilon (0,v) \\\\
  & =(1,0,0,0)+\varepsilon (0,v_x,v_y,v_z)
\end{align*}
$$

$$
\quad
$$

$$
\mathrm{III}: \hat{q} ^ \star    = q ^ * _ 0 - \varepsilon q ^ *_ \varepsilon 
$$

$$
\quad \quad \quad \quad = ({\hat{q} ^ *}) ^ {\circ} = (\hat{q} ^ {\circ}) ^ *
$$


P61   
## Dual Quaternion ⇔ Rigid Transformation

 - Like quaternion, any rigid transformation \\(T \in SE(3)\\) can be converted **into a unit dual quaternion**    

$$
T=[R\mid t]\to \hat{q} =q_0+\varepsilon q_\varepsilon 
$$

$$
\begin{matrix}
 q_0=r \quad \\\\
 q_\varepsilon =\frac{1}{2} tr 
\end{matrix}
$$

\\(\hat{q}\\) and \\(-\hat{q}\\) represent the same transformation
\\(\hat{Q}\\) is a **double cover** of \\(SE(3)\\)   


P62   
## Double Cover Visualized

![](/assets/07-21.png)   


P63   
## Interpolating Dual-Quaternion

![](/assets/07-22.png)   


P64  
## Dual-Quaternion Linear Blending (DLB)

![](/assets/07-022.png)   


P65   
## Dual-Quaternion Skinning (DQS)

![](/assets/07-23.png)   


P66   
## Budging Artifact of DQS

![](/assets/07-24.png)   


P67   
## How to Correct LBS?

![](/assets/07-25.png)   


P69   
## How to Correct LBS?

![](/assets/07-26.png)   


P74   
## Scattered Data Interpolation

![](/assets/07-27.png)   


P76   
## Scattered Data Interpolation  


 - Linear   
    - Least squares   
 - Splines   
 - Inverse distance weighting   
 - Gaussian process   
 - Radial Basis Function   
 - ……   

![](/assets/07-28.png)   


P81   
## Radial Basis Function (RBF) Interpolation

$$
y=\sum_{i=1}^{k} w_i\varphi (||x-x_i||)
$$

![](/assets/07-29.png)   


P83   
## Radial Basis Function (RBF) Interpolation

$$
y=\sum_{i=1}^{k} w_i\varphi (||x-x_i||)
$$

How to compute \\(w_i\\) ? We need \\(f(x_i)=y_i\\)  

$$
\begin{bmatrix}  
  R_{1,1} & R_{1,2} & \cdots & R_{1,K} \\\\  
  R_{2,1} & R_{2,2} &   & \vdots \\\\  
  \vdots &   & \ddots & \vdots \\\\  
  R_{K,1} & \cdots & \cdots & R_{K,K}  
\end{bmatrix} \begin{bmatrix}
 w_1\\\\
w_2 \\\\
 \vdots\\\\
w_K
\end{bmatrix}=\begin{bmatrix}
 y_1\\\\
y_2 \\\\
 \vdots\\\\
y_K
\end{bmatrix}
$$

$$
R_{i,j}=\varphi (||x_i-x_j||)
$$

![](/assets/07-30.png)   


P84   
## Radial Basis Function (RBF)

$$
y=\sum_{i=1}^{k} w_i\varphi (||x-x_i||)
$$

 - Gaussian:   

$$
\varphi (r)=e^{-(r/c)^2}
$$

 - Inverse multiquadric:    

$$
\varphi (r)=\frac{1}{\sqrt{r^2+c^2} } 
$$

 - Thin plate spline:    

$$  
\varphi (r)=r^2 \log r
$$

 - Polyharmonic splines:  



$$
\varphi (r)=\begin{cases}
 r^k,k=2n+1\\\\
\\\\\
r^k \log r,k=2n
\end{cases}
$$

P85     
## Pose Space Deformation   
$$
{x}' =\sum_{j=1}^{m} w_iT_j (x+\delta (x,\theta ))
$$

 - \\({x}'= SKIN(PSD(x))\\)   
 - 𝑃𝑆𝐷 is implemented as RBF interpolation   
 - Example shapes can be created manually   
    - Or by 3D scanning real people → the SMPL model   


J. P. Lewis, Matt Cordner, and Nickson Fong. 2000. **Pose space deformation: a unified approach to shape**   

**interpolation and skeleton-driven deformation**. In *Proceedings of the 27th annual conference on Computer*    

*graphics and interactive techniques* (SIGGRAPH ’00), ACM Press/Addison-Wesley Publishing Co., USA, 165–172.   


P86   
## Pose Space Deformation

![](/assets/07-31.png)   


P87   
## Issues   

 - Per-shape or per-vertex interpolation   
    - Should we interpolate a shape as a whole?   
 - Local or global interpolation?   
    - Should a vertex be affected by all joints?   
 - Interpolation algorithm?   
    - Is RBF the only choice?   

SIGGRAPH Course 2014 — Skinning: Real-time Shape Deformation   


P88  
## Example-based Skinning (EBS) vs. Skeleton Subspace Deformation (SSD)    

\\(\ast \\)EBS: PSD   
\\(\quad\\)

 - Good: Easy to control   
 - Good: Good quality   
 - Good: **Pose-dependent details** (e.g. bulging muscle and extruding veins)   

\\(\quad\\)

 - Bad: Creating examples can be cumbersome   
 - Bad: Extra storage for examples   
 - Bad: Interpolation needs careful tuning   

\\(\quad\\)

\\(\ast \\)SSD: LBS, DQS, etc.   
\\(\quad\\)

 - Good: Easy to implement   
 - Good: Fast and GPU friendly   

\\(\quad\\)

 - Bad: Various artifacts   
 - Bad: Skinning weights needs careful tuning   
 - Bad: Hard to create pose-dependent details   


P89   
## Example: SMPL Model   


 - A widely adopted human model in ML/CV   
 - Learned on real scan data   
 - Combines SSD and EBS techniques   

![](/assets/07-32.png)   


P92   
## Recall: Principal Component Analysis (PCA)  

 - Given a dataset {\\(x_i\\)}, \\(x_i \in \mathbb{R} ^N\\), then PCA gives    

$$
x_i=\bar{x}+\sum_{k=1}^{n} w_{i,k}u_k
$$

 - \\(u_k\\) is the \\(k\\)-th principal component    
    - A direction in \\( \mathbb{R} ^N\\) along which the rojection of {\\(x_i\\)} has the \\(k\\)-th maximal **variance**   
 - \\(w_{i,k}=(x_i-\bar{x})\cdot u_k\\) is the score of \\(x_i\\) on \\(u_k\\)    


P93   
## Recall: Principal Component Analysis (PCA)   

• Given a dataset  {\\(x_i\\)}, \\(x_i \in \mathbb{R} ^N\\), the PCA can be computed by apply **eigen decomposition** on the covariance matrix   

$$
\sum =X^TX=U\begin{bmatrix}
 \sigma ^2_1 &  &  & \\\\
  & \sigma ^2_2 &  & \\\\
  &  & \ddots  & \\\\
  &  &  \sigma ^2_N
\end{bmatrix}U^T
$$

 - \\(X=[x_0-\bar{x}, x_1-\bar{x},\dots ,x_N-\bar{x}]^T\\)   

 - \\(\sigma _i\ge \sigma _j\ge 0\\) when \\(i< j\\), corresponds to the Explained Variance   

 - \\(U=[u_1,u_2,\dots,u_N]\\)   


![](/assets/07-007.png)   


P94   
## PCA over Body Shapes

![](/assets/07-33.png)   


P95  
## SMPL Model: Body Shape

![](/assets/07-34.png)   


P96   
## SMPL Model: Pose Blend Shapes

![](/assets/07-35.png)   


P97   
## SMPL Model: Deformation

$$
T(\beta ,\theta )=\bar{T} + \sum _ {m=1}^{|\beta |} \beta _ m S_ n + \sum _ {n=1}^{|\theta |}\theta _np_n
$$

$$
x=SKIN(T(\beta ,\theta ),\theta ,w)
$$


$$
SKIN:\text{LBS, DQS, etc}\dots 
$$

![](/assets/07-36.png)   

[SMPL: A Skinned Multi-Person Linear Model]   


P99   
## Facial Animation

![](/assets/07-37.png)   


P101   
## Facial Animation

![](/assets/07-38.png)   


P102   
## Facial Blendshapes   

![](/assets/07-39.png)   


P103   
## A Typical Set of Blendshapes (ARKit)

![](/assets/07-40.png)   


P104   
## Blendshapes vs. Example-based Skinning

![](/assets/07-41.png)   

![](/assets/07-42.png)   

![](/assets/07-43.png)   


P105  
## Morphable Face Models

![](/assets/07-44.png)   
![](/assets/07-45.png)   
   

Egger et al. 2020. **3D Morphable Face Models - Past, Present, and Future**. *ACM Trans. Graph*. 39, 5 (June 2020), 157:1-157:38.   

P107   
## How to Animate a Face?


![](/assets/07-47.png)

P110   
## Face Tracking

![](/assets/07-48.png)



---------------------------------------
> 本文出自CaterpillarStudyGroup，转载请注明出处。
>
> https://caterpillarstudygroup.github.io/GAMES105_mdbook/
# Contacts

> &#10004; 如何处理与地面的接触，让人站在地面上。

![](../assets/08-13.png)

> &#10004; 要解决的问题：
> 1. **地面接触检测**：检测哪些点/面与地面接触
> 2. **接触力施加**：如何对碰撞点施加力，使物体不陷入地面

:::info 与 GAMES103 的分工

- **GAMES103 - 碰撞检测算法**：详细介绍 Broad Phase、Narrow Phase、GJK、CCD 等检测算法
- **GAMES105 - 接触力/约束求解**： focus 在检测出接触后，如何计算接触力并施加到运动方程中

**深入学习**：[GAMES103 - 刚体的碰撞检测](https://caterpillarstudygroup.github.io/GAMES103_mdbook/src/9_collision_detect.md) | [GAMES103 - 离散相交检测](https://caterpillarstudygroup.github.io/GAMES103_mdbook/src/9_collision_detect_narrow.md)

:::

---

## Penalty-based Contact Model

### Baseline

![](../assets/08-14.png)

$$
f_n = -k_p d - k_d v_{c,\perp}
$$

> &#10004; $d > 0$ 时公式才生效。类似弹簧形式，陷入越深，力越大。
> &#10004; 第二项：为了防止落地弹飞，增加阻尼项。
> &#10004; 效果：会有一些陷入，但不会陷入太多
> &#10064; 支持力竟然不是 $-mg$。

---

### 考虑摩擦力

![](../assets/08-15.png)

> &#10004; 受力分析：支持力，动摩擦力。
> &#10004; 动摩擦力，大小＝支持力 x 摩擦系数，方向与运动方向相反

$$
f_t = -\mu f_n \frac{v_{c,\parallel}}{||v_{c,\parallel}||}
$$

> &#10004; 一般不模拟静摩擦力

---

### 存在的问题

> &#10004; 存在的问题：$k_p$ 必须很大，否则脚陷地明显。$k_d$ 必须非常大，否则地面像蹦床。步长必须非常小，否则不稳定。

---

## Contact as a Constraint

> &#10004; 另一种方法，把接触建模为约束。

### 接触点状态分析

![](../assets/08-17.png)

接触点 $x_c$ 的位置表示：
$$
x_c = x + r_c
$$

接触点 $x_c$ 的速度表示：
$$
v_c = v + \omega \times r_c = J_c \begin{bmatrix} v \\\\ \omega \end{bmatrix}
$$

接触点法向速度：
$$
v_{c,\perp} = J_{c,\perp} \begin{bmatrix} v \\\\ \omega \end{bmatrix}
$$

---

### 接触点约束分析

![](../assets/08-19-1.png)

> &#10004; 约束 1：点在竖直方向的速度必须大于 0，即只能向上移动。

![](../assets/08-19-2.png)

> &#10004; 约束 2：力的大小也大于 0。只能推，不能拉。$\lambda$ 是力与速度的大小比例系数。$\lambda > 0$ 代表同方向。

![](../assets/08-19-3.png)

> &#10004; 约束 3：力和速度只能有一个不为零，否则会做功。

$$
v_c \perp \lambda = 0
$$

> &#10004; 合在一起称为线性互补方程，是通常碰撞建模方式。
> &#10004; 这个方程比较难解，例如 ODE

这类问题被称为：(Mixed) Linear Complementary Problem (LCP)

解 LCP 的方法有：
- Lemke's algorithm – a simplex algorithm

---

### 考虑摩擦力的约束问题

How to deal the friction?

> &#128269; Fast contact force computation for nonpenetrating rigid bodies.
> David Baraff. SIGGRAPH '94

> &#10004; 快速实现静摩擦约束的建模。

---

> 本文出自 CaterpillarStudyGroup，转载请注明出处。
> https://caterpillarstudygroup.github.io/GAMES105_mdbook/

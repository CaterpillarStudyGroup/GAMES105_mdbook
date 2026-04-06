# 关节约束

> 💡 **前置知识**：关于角色的分段刚体表示，见 [RigidBodyRepresentation.md](RigidBodyRepresentation.md)

---

## 关节类型与约束方程

![](../assets/08-11.png)

| 关节类型 | 约束自由度 | 位置约束 | 角速度约束 |
|----------|-----------|----------|-----------|
| **Ball Joint**（球铰） | 3 个平移 | ✅ | ❌ |
| **Hinge Joint**（铰链） | 3 个平移 + 2 个旋转 | ✅ | ✅ |
| **Universal Joint**（万向节） | 3 个平移 + 1 个旋转 | ✅ | ✅ |
| **Fixed Joint**（固定） | 3 个平移 + 3 个旋转 | ✅ | ✅ |

---

## Ball Joint（球铰）

![](../assets/08-10.png)

> &#x2705; Ball Joint 只约束位置，允许三个方向的自由旋转。

### 约束方程

**位置级约束**：
$$
x_1 + R_1 r_1 = x_2 + R_2 r_2
$$

**速度级约束**（对时间求导）：
$$
v_1 + \omega_1 \times r_1 = v_2 + \omega_2 \times r_2
$$

**矩阵形式**：
$$
\begin{bmatrix}
 I_3 & -[r_1]_\times & -I_3 & [r_2]_\times
\end{bmatrix}
\begin{bmatrix}
v_1 \\ \omega_1 \\ v_2 \\ \omega_2
\end{bmatrix} = 0
$$

简化为：
$$
Jv = 0
$$

其中 \\(J\\) 是 \\(3 \times 12\\) 矩阵。

---

## Hinge Joint（铰链）



> &#x2705; Hinge Joint 约束位置 + 2 个旋转自由度，只允许绕铰链轴旋转。

### 约束方程

**位置级约束**（同 Ball Joint）：
$$
x_1 + R_1 r_1 = x_2 + R_2 r_2
$$

**角速度约束**（额外约束）：
$$
\omega_1 \cdot a_1 = \omega_2 \cdot a_2
$$

其中 \\(a_1, a_2\\) 是两个刚体上的铰链轴方向向量。

**矩阵形式**：
$$
Jv = \begin{bmatrix}
 J_{\text{pos}} \\ J_{\text{ang}}
\end{bmatrix} v = 0
$$

其中：
- \\(J_{\text{pos}}\\) 是 \\(3 \times 12\\) 的位置约束矩阵（同 Ball Joint）
- \\(J_{\text{ang}}\\) 是 \\(2 \times 12\\) 的角速度约束矩阵

---

## Universal Joint（万向节）

> &#x2705; Universal Joint 约束位置 + 1 个旋转自由度，允许两个旋转自由度。

### 约束方程

**位置级约束**（同 Ball Joint）：
$$
x_1 + R_1 r_1 = x_2 + R_2 r_2
$$

**角速度约束**（额外约束）：
$$
\omega_1 \cdot a_1 = \omega_2 \cdot a_2
$$
$$
\omega_1 \cdot b_1 = \omega_2 \cdot b_2
$$

其中 \\(a, b\\) 是两个相互垂直的轴向。

---

## Fixed Joint（固定）

> &#x2705; Fixed Joint 完全固定两个刚体，不允许任何相对运动。

### 约束方程

**位置级约束**（同 Ball Joint）：
$$
x_1 + R_1 r_1 = x_2 + R_2 r_2
$$

**角速度约束**（全部约束）：
$$
\omega_1 = \omega_2
$$

---

## 运动方程 + 约束方程

无论哪种关节，都可以统一写成：

$$
\begin{align*}
 M\dot{v} + C(x,v) &= f + J^T\lambda \\
 Jv &= 0
\end{align*}
$$

| 符号 | 含义 |
|------|------|
| \\(M\\) | \\(6n \times 6n\\) 质量矩阵 |
| \\(C(x,v)\\) | 科氏力 + 离心力 |
| \\(f\\) | 外力（重力、风力、关节力矩） |
| \\(J\\) | 约束雅克比矩阵（\\(m \times 6n\\)） |
| \\(\lambda\\) | 拉格朗日乘子（约束力大小） |

> &#x2705; 联立方程组可以解出约束力 \\(\lambda\\) 和下一时刻的速度。

**约束求解的详细推导**：见 [Constraints.md](Constraints.md)（小球例子）

---

## 统一约束求解框架

> &#x2705; **核心洞察**：不同约束的**求解公式完全一样**，唯一的区别是雅克比矩阵 \\(J\\) 的构造。

### 不同关节的 \\(J\\) 矩阵对比

| 关节类型 | \\(J\\) 的行数 | 说明 |
|----------|-----------|------|
| **Ball Joint** | 3 行 | 仅位置约束 |
| **Hinge Joint** | 5 行 | 3 行位置约束 + 2 行角速度约束 |
| **Universal Joint** | 4 行 | 3 行位置约束 + 1 行角速度约束 |
| **Fixed Joint** | 6 行 | 3 行位置约束 + 3 行角速度约束 |

### 统一求解流程

无论哪种关节，都遵循相同的求解步骤：

1. **计算预测速度**：\\(v^* = v_n + h M^{-1}f\\)
2. **构建约束雅可比** \\(J\\)（根据关节类型）
3. **求解拉格朗日乘子**：
   $$
   \lambda = (J M^{-1}J^T + \beta I)^{-1}(b - Jv^*)
   $$
4. **计算约束力**：\\(f_c = J^T\lambda\\)
5. **更新速度**：\\(v_{n+1} = v^* + h M^{-1}J^T\lambda\\)

> &#x2705; **物理引擎实现的关键**：
> - 为每种关节类型实现一个 \\(J\\) 矩阵构造函数
> - 把所有约束的 \\(J\\) 行堆叠起来形成总约束矩阵
> - 代入**统一公式**求解 \\(\lambda\\)

> &#x2705; **多约束同时处理**：当系统有多个约束时（如多个关节 + 接触），只需将每个约束的 \\(J\\) 矩阵按行堆叠，公式形式不变，只是矩阵维度更大。

---

## 多个刚体与多个约束

![](../assets/08-12.png)

> &#x2705; 分段多刚体系统：公式形式相同，只是矩阵维度更大。

对于 \\(n\\) 个刚体、\\(m\\) 个约束的系统：
- \\(M\\) 是 \\(6n \times 6n\\) 的分块对角矩阵
- \\(J\\) 是 \\(m \times 6n\\) 的矩阵（每个约束贡献若干行）

---

## 关节力矩（Joint Torques）

### 什么是 Joint Torques

> &#x2705; 关节上的力矩，可以看作是一个刚体对另一个刚体在关节处施加的成对的力。其合力为零，但每个力施加的位置不同，可以转化为对另一刚体的力矩。

![](../assets/09-014.png)

$$
\sum_{i} f_i = 0
$$

> &#x2705; 每个力都会对其中一个刚体的质心上产生力矩，合力矩不为 0。

$$
\tau_1 = \sum_{i} (r_1 + r_i) \times f_i = r_1 \times \sum_{i} f_i + \sum_{i} r_i \times f_i
$$

由于 \\(\sum_{i} f_i = 0\\)，得：

$$
\tau_1 = \sum_{i} r_i \times f_i \quad\quad\quad \tau_2 = -\sum_{i} r_i \times f_i
$$

> &#x2705; 另一个方向同理。
> &#x2705; 力矩跟关节的位置没有关系。

**结论**：

![](../assets/09-16.png)

> &#x2705; 在关节上施加力矩 \\(\tau\\) 等价于在一个刚体上施加 \\(\tau\\)，在另一个刚体上施加 \\(-\tau\\)。

---

### 怎样施加 Joint Torques

Applying a joint torque \\(\tau\\):
- Add \\(\tau\\) to one attached body
- Add \\(-\tau\\) to the other attached body

$$
M\begin{bmatrix}
 \dot{v}_1 \\ \dot{\omega}_1 \\ \dot{v}_2 \\ \dot{\omega}_2
\end{bmatrix} + \begin{bmatrix}
 0 \\ \omega_1 \times I_1 \omega_1 \\ 0 \\ \omega_2 \times I_2 \omega_2
\end{bmatrix} = \begin{bmatrix}
 0 \\ \tau \\ 0 \\ -\tau
\end{bmatrix} + J^T\lambda
$$

$$
Jv = 0
$$

> &#x2705; 通常在子关节上加 \\(\tau\\)，在父关节上加 \\(-\tau\\)。

---

> 本文出自 CaterpillarStudyGroup，转载请注明出处。
> https://caterpillarstudygroup.github.io/GAMES105_mdbook/

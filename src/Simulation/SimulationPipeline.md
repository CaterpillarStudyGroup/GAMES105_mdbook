# 仿真流程总结

> &#x2705; **本章定位**：串联整个物理仿真章节，展示完整的仿真 Pipeline。

> 💡 **前置知识**：关于角色的分段刚体表示，见 [RigidBodyRepresentation.md](RigidBodyRepresentation.md)

---

## 完整仿真 Pipeline

![](../assets/09-07.png)

> &#x2705; 角色仿真的完整流程：

1. **计算当前状态** - 位置、速度、约束信息
2. **计算外力** - 重力、风力、关节力矩（由控制器生成）
3. **检测约束** - 关节约束、接触约束
4. **求解约束力** - 解出 \\(\lambda\\)，计算 \\(J^T\lambda\\)
5. **积分更新状态** - 更新位置、速度

---

## 仿真方程

**分段多刚体系统**（详见 [RigidBodyRepresentation.md](RigidBodyRepresentation.md)）：

$$
M\dot{v} + C(x,v) = f + J^T\lambda
$$

| 项 | 含义 | 对应章节 |
|----|------|----------|
| \\(M\dot{v} + C(x,v)\\) | 惯性力 | [RigidBodyRepresentation.md](RigidBodyRepresentation.md) |
| \\(f\\) | 外力 | 重力、风力、关节力矩 |
| \\(J^T\lambda\\) | 约束力 | [Constraints.md](Constraints.md) / [JointConstraint.md](JointConstraint.md) / [Contacts.md](Contacts.md) |

---

## 仿真流程详解

### 步骤 1：计算外力

![](../assets/09-05.png)

> &#x2705; 外力包括：
> - 重力：\\(mg\\)
> - 风力等其他外力
> - **关节力矩**：由控制器（如 PD 控制）生成

---

### 步骤 2：约束求解

**关节约束**（详见 [JointConstraint.md](JointConstraint.md)）：
- 防止刚体分离
- 求解 \\(J^T\lambda\\)

**接触约束**（详见 [Contacts.md](Contacts.md)）：
- 防止穿透地面
- 摩擦力防止滑动

---

### 步骤 3：积分更新

![](../assets/08-18.png)

> &#x2705; 把人简化为分段刚体。整体过程为：
> - (1) 黄：计算当前状态
> - (2) 绿：计算约束，求解，解出下一时刻的速度
> - (3) 蓝：更新下一时刻的量（积分）

---

## 本章小结

| 章节 | 内容 |
|------|------|
| [Simulation.md](Simulation.md) | 仿真器概述、力与力矩、前向/后向动力学 |
| [RigidBodyRepresentation.md](RigidBodyRepresentation.md) | 角色的分段刚体表示 |
| [Constraints.md](Constraints.md) | 约束求解原理（小球例子） |
| [JointConstraint.md](JointConstraint.md) | 关节约束与关节力矩 |
| [Contacts.md](Contacts.md) | 接触模型 |
| 本文 | 完整仿真流程总结 |

**核心公式**：
$$
M\dot{v} + C(x,v) = f + J^T\lambda
$$

---

> 本文出自 CaterpillarStudyGroup，转载请注明出处。
> https://caterpillarstudygroup.github.io/GAMES105_mdbook/

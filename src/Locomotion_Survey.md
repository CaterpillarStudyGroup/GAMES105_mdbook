# 角色位移控制 (Locomotion Control) 技术洞察

**更新时间**: 2026-03-30

**范围**: 2010-2025 年角色位移 (locomotion) 控制技术分析

---

## 一、概述

角色位移控制是计算机图形学、机器人学和游戏开发的核心问题，目标是**生成自然、稳定、可控的角色运动**（如行走、跑步、跳跃等）。

### 1.1 为什么 Locomotion 是一个难题？

1. **高维状态空间**: 人形角色通常有 30+ 自由度
2. **强非线性动力学**: 接触力、摩擦力、碰撞使系统高度非线性
3. **多模态行为**: 行走、跑步、跳跃等不同步态需要不同控制策略
4. **实时性要求**: 游戏/VR 应用需要 60+ FPS
5. **鲁棒性要求**: 需要抵抗外部扰动、适应地形变化

### 1.2 技术分类：运动学 vs 动力学

| 维度 | 运动学方法 (Kinematics) | 动力学方法 (Dynamics) |
|------|------------------------|----------------------|
| **核心目标** | 生成视觉上合理的动作 | 生成物理可行的动作 |
| **输出** | 关节姿态/速度 | 关节力矩/PD 控制目标 |
| **是否物理仿真** | 否 | 是 |
| **典型应用** | 动画生成、VR 化身 | 游戏、机器人仿真 |
| **优势** | 速度快、质量高 | 物理交互、抗扰动 |
| **局限** | 无法处理物理交互 | 训练成本高、实现复杂 |

---

## 二、基于运动学的方法 (Kinematics-based Methods)

**核心特征**：直接从数据学习动作生成，**不经过物理仿真**，输出为关节姿态。

### 2.1 技术流派总览

运动学方法经过十余年发展，形成了**三大主要流派**：

```mermaid
flowchart TB
    subgraph Phase["流派一：相位系 (Phase-based)"]
        direction TB
        PFNN["PFNN (2017)"] --> LP["Local Phases (2020)"]
        LP --> SM["Style Modelling (2020)"]
        LP --> PM["Phase Manifolds (2023)"]
        PM --> POMP["POMP (2023)"]
    end

    subgraph MM["流派二：Motion Matching 系"]
        direction TB
        MM0["Motion Matching (2019)"] --> LMM["Learned MM (2020)"]
        LMM --> MOCHA["MOCHA (2023)"]
    end

    subgraph Diff["流派三：扩散模型系"]
        direction TB
        AMDM["A-MDM (2024)"] --> CAMDM["CAMDM (2024)"]
        CAMDM --> AAMDM["AAMDM (2024)"]
        AAMDM --> DART["DART (2025)"]
    end

    style Phase fill:#e1f5fe
    style MM fill:#fff3e0
    style Diff fill:#f0f0f0
```

**关键洞察**：Local Phases (2020) 是相位系的核心分支点 —— 一支朝风格转换方向发展（Style Modelling），另一支朝相位流形插值和物理对齐方向发展（Phase Manifolds → POMP）。

| 流派 | 核心思想 | 优势 | 局限 |
|------|---------|------|------|
| **相位系** | 相位解耦动作状态 / 相位流形插值 | 流畅无 artifacts / 自然过渡 | 相位定义需领域知识 |
| **Motion Matching 系** | 数据搜索/预测 | 工业验证质量高 | 内存/训练成本 |
| **扩散模型系** | 概率扩散生成 | 高质量多样性 | 推理速度挑战 |

---

### 2.2 流派一：相位系 (Phase-based Methods)

**核心思想**：引入相位变量 $\phi \in [0, 2\pi)$ 作为动作周期的隐式表示，用相位解耦不同动作状态或在相位空间进行插值。

**演进路径**：
```mermaid
flowchart LR
    PFNN --> FS["Few-shot Styles (2018)"]
    FS --> LP["Local Phases (2020)"]
    LP --> SM["Style Modelling (2020)"]
    LP --> PM["Phase Manifolds (2023)"]
    PM --> POMP["POMP (2023)"]
```

**两大分支**：

| 分支 | 演进路径 | 核心贡献 | 典型应用 |
|------|---------|---------|---------|
| **相位表示分支** | PFNN → Few-shot Styles → Local Phases → Style Modelling | 相位解耦不同动作状态 / 少样本风格学习 | VR 化身、风格化动画、快速原型 |
| **相位流形分支** | Local Phases → Phase Manifolds → POMP | 相位流形插值与物理对齐 | 过渡生成、物理一致运动 |

**代表论文**：
- PFNN (2017): 相位函数化权重
- **Few-shot Locomotion Styles (2018)**: 残差适配器 + CP 分解，少样本风格学习
- Local Motion Phases (2020): 局部相位表示
- Style Modelling (2020): 特征变换 + 局部相位
- Phase Manifolds (2023): 相位流形插值
- POMP (2023): 物理一致运动先验

**注意**：MOCHA (2023) 虽然使用了 AdaIN 进行风格转换（继承自 Style Modelling），但其核心是 Neural Context Matcher 进行上下文匹配，**不属于相位系**，而是属于**Motion Matching 系**（见 2.4 节）。

---

### 2.2.1 PFNN: Phase-Functioned Neural Networks (SIGGRAPH 2017)

**论文**: [[113.md](https://caterpillarstudygroup.github.io/ReadPapers/index.html)](https://caterpillarstudygroup.github.io/ReadPapers/113.html)

**核心创新**: 将相位从「网络输入特征」升级为「网络权重的参数化变量」

**架构**:

```mermaid
flowchart LR
    Input["输入：状态 + 控制 + 相位φ"] --> PhaseFunc["相位函数Θ(φ)"]
    PhaseFunc --> Weights["生成网络权重"]
    Weights --> Expert1["专家 1"]
    Weights --> Expert2["专家 2"]
    Weights --> Expert3["专家 3"]
    Expert1 & Expert2 & Expert3 --> Mix["混合输出"]
    Mix --> Output["输出：姿态/速度/触地"]
```

**关键洞察**:
- 相位作为权重参数，避免不同相位动作混合导致的 artifacts
- 使用 Cubic Catmull-Rom Spline 插值专家权重
- 地形数据增强：从平地 mocap 生成崎岖地形训练数据

**优点**:
- 相位解耦，避免 artifacts
- 仅 10MB 模型大小
- 实时 60 FPS

**缺点**:
- 仍需手工标注相位和步态标签
- 泛化能力有限，仅支持训练过的步态

---

### 2.2.2 Few-shot Locomotion Styles (EG 2018)

**论文**: [[214.md](https://caterpillarstudygroup.github.io/ReadPapers/index.html)](https://caterpillarstudygroup.github.io/ReadPapers/214.html)

**核心创新**: 首个**少样本风格学习**框架，几秒视频即可学会新走路风格

**背景**: PFNN 需要大量数据训练每种新风格，但动画师通常只有几秒参考视频。

**方法框架**:

```mermaid
flowchart TB
    subgraph Stage1["第一阶段：预训练"]
        data1["8 种风格大量数据"]
        pfnn["PFNN 主干网络"]
        adapter["残差适配器"]
        agnostic["风格无关参数 β_ag"]
        specific["风格相关参数 β_s (8 套)"]
    end

    subgraph Stage2["第二阶段：少样本学习"]
        data2["新风格几秒视频"]
        freeze["冻结主干网络"]
        learn["只学习新残差适配器"]
        cp["CP 分解降维"]
    end

    data1 --> pfnn
    pfnn --> agnostic
    pfnn --> adapter
    adapter --> specific

    data2 --> learn
    freeze --> learn
    learn --> cp

    style Stage1 fill:#e1f5fe
    style Stage2 fill:#fff3e0
```

**关键技术**:

| 技术 | 作用 | 效果 |
|------|------|------|
| **残差适配器** | 分离风格无关/相关参数 | 只需学习少量新参数 |
| **CP 分解** | 3D 张量分解为三个矩阵 | 参数从 4MB 降至 0.13MB (30 倍压缩) |
| **可变 Dropout** | 根据数据量调整正则化 | 防止少样本过拟合 |

**CP 分解公式**:

$$
X_k = A D(k) B^T
$$

- $A, B$: 与相位无关的矩形矩阵
- $D(k)$: 与相位相关的对角矩阵

**训练数据**:
- 预训练：8 种风格 × 23104 帧（愤怒、孩子气、沮丧、中性、老人、骄傲、性感、大摇大摆）
- 少样本：50 种新风格，每种仅 1-5 秒视频

**性能**:
- 推理时间：0.0011 秒/帧（约 900 FPS）
- 存储：每风格仅需 0.13MB

**优点**:
- 几秒视频即可学会新风格
- 支持实时生成
- 参数效率高，内存占用低

**缺点**:
- 仅支持 Homogeneous 迁移（走→走，不能走→跑）
- 无法处理非周期性动作
- 生成动作略平滑，丢失高频细节

**与 PFNN 的继承关系**:
- PFNN: 每风格单独训练，需要大量数据
- Few-shot: 添加残差适配器，风格无关参数共享

---

### 2.2.3 Local Motion Phases (SIGGRAPH 2020)

**论文**: [[216.md](https://caterpillarstudygroup.github.io/ReadPapers/index.html)](https://caterpillarstudygroup.github.io/ReadPapers/216.html)

**核心创新**: 每个身体部位学习独立相位，支持多接触交互

**背景**: PFNN 的全局相位假设所有部位同步运动，无法处理多接触动作（如手扶墙、脚踩台阶）。

**全局相位 vs 局部相位**:

| 全局相位 | 局部相位 |
|---------|---------|
| 单一相位值 | 每个身体部位独立相位 |
| 适用于周期性 locomotion | 适用于多接触交互 |
| 相位手动标注 | 无监督学习相位 |

**局部相位表示**:

$$
\phi = \{\phi_{left\_foot}, \phi_{right\_foot}, \phi_{left\_hand}, \phi_{right\_hand}, ...\}
$$

**与 PFNN 的继承关系**:
- PFNN: 全局相位，需手动标注
- Local Phases: 局部相位，无监督学习
- 共同点：相位作为解耦变量

**优点**:
- 支持多接触交互
- 相位自动学习
- 异步运动建模

**缺点**:
- 相位数量固定
- 新接触类型需要训练

---

### 2.2.4 Style Modelling: 特征变换与局部相位 (SIGGRAPH 2020)

**论文**: [[211.md](https://caterpillarstudygroup.github.io/ReadPapers/index.html)](https://caterpillarstudygroup.github.io/ReadPapers/211.html)

**核心创新**: Feature-Wise Transformations + Local Motion Phases

**架构**:

```mermaid
flowchart LR
    motion["输入动作 x"] --> Enc["动作编码器"]
    style["风格代码 z"] --> StyleEnc["风格编码器"]
    Enc --> FWT["Feature-Wise Transformation"]
    StyleEnc --> FWT
    FWT --> Dec["动作解码器"]
    Dec --> out["风格化动作 y"]
```

**AdaIN 公式**:

$$
\text{AdaIN}(x, z) = \sigma(z) \cdot \frac{x - \mu(x)}{\sigma(x)} + \mu(z)
$$

**Local Motion Phases vs 全局相位**:

| 全局相位 | 局部相位 |
|---------|---------|
| 单一相位值 | 每个身体部位独立相位 |
| 适用于周期性动作 | 适用于非同步动作 |
| 难以处理复杂动作 | 灵活处理多接触动作 |

**与 PFNN 的继承关系**:
- PFNN: 全局相位，适用于 locomotion
- Style Modelling: 局部相位，适用于更复杂动作
- 继承：相位作为解耦变量的思想

**优点**:
- 实时 60+ FPS
- 支持多种风格平滑过渡
- 少样本风格学习

**缺点**:
- 仅适用于 locomotion
- 极端风格可能失真

---

### 2.2.5 Phase Manifolds: 相位流形插值 (2023)

**论文**: [[212.md](https://caterpillarstudygroup.github.io/ReadPapers/index.html)](https://caterpillarstudygroup.github.io/ReadPapers/212.html)

**核心创新**: 使用 Periodic Autoencoder 学习相位变量，在相位流形空间进行插值生成过渡动作

**注意**: 虽然本论文与 Style Modelling (211) 同样使用局部相位表示，但其核心是相位流形插值用于 transition 生成，与 POMP (112) 的物理一致运动生成不同，本论文**属于运动学相位系**。

**架构**:

```mermaid
flowchart TB
    start["起始帧 s"] --> PAE["Periodic<br/>Autoencoder"]
    target["目标帧 t"] --> PAE
    duration["过渡时长 T"] --> Interp["相位流形插值"]
    PAE --> PhaseS["起始相位φ_s"]
    PAE --> PhaseT["目标相位φ_t"]
    PhaseS --> Interp
    PhaseT --> Interp
    Interp --> MoE["Mixture of Experts"]
    MoE --> Motion["过渡动作序列"]
```

**相位流形约束**:
- 相位在单位圆上：$\phi \in [0, 2\pi)$
- 周期性：$\phi(t) = \phi(t + T)$
- 流形插值：$\phi_t = \text{slerp}(\phi_s, \phi_t, t)$（球面线性插值）

**与 Style Modelling 的关系**:
- **共同点**: 都使用局部相位表示解耦身体部位
- **差异**: Style Modelling 用于风格转换，Phase Manifolds 用于过渡生成

**与 POMP 的差异**:
- **Phase Manifolds (212)**: 运动学过渡生成，输出关节位置
- **POMP (112)**: 物理一致运动生成，输出关节力矩 + 物理仿真

**优点**:
- 生成自然流畅的过渡
- 支持用户约束（end effector 位置）
- 多样化过渡生成

**缺点**:
- 依赖训练数据
- 长过渡质量下降
- 无法处理物理交互

---

### 2.3 流派二：Motion Matching 系

**核心思想**：从动作数据库搜索/预测最匹配当前状态的帧。

**演进路径**：
```mermaid
flowchart LR
    MM["Motion Matching (2019)<br/>工业标准"] --> LMM["Learned Motion Matching (2020)<br/>神经网络替代"]
    LMM --> MOCHA["MOCHA (2023)<br/>角色化扩展"]
```

**Motion Matching 核心流程**：
1. 提取当前帧特征（姿势、速度、轨迹）
2. 在数据库中搜索最近邻
3. 返回对应帧并推进索引

**Learned Motion Matching 创新**：用三个神经网络替代数据库搜索，固定内存占用。

**MOCHA 扩展**：在 Learned Motion Matching 基础上，增加 Neural Context Matcher 实现角色风格转换和体型适配。

---

### 2.3.1 Learned Motion Matching (SIGGRAPH 2020)

**论文**: [[208.md](https://caterpillarstudygroup.github.io/ReadPapers/index.html)](https://caterpillarstudygroup.github.io/ReadPapers/208.html)

**核心创新**: 用三个神经网络替代 Motion Matching 的数据库搜索

**背景**: Motion Matching 是游戏工业标准，但需要存储海量动画数据库，内存占用随数据量线性增长。

**三网络功能**:

| 网络 | 输入 | 输出 | 替代功能 |
|------|------|------|----------|
| **Decompressor** | 特征向量 x + 潜变量 z | 姿态 y | Animation Database 查找 |
| **Projector** | 查询特征向量 | 最近邻索引 k* | 最近邻搜索 |
| **Stepper** | 当前索引 k* | 下一帧索引 | 数据库索引推进 |

**优点**:
- 保留 Motion Matching 的质量和可控性
- 固定内存占用（网络权重），不随数据量增长
- 已应用于多个 AAA 游戏

**缺点**:
- 训练时间比原始 Motion Matching 长
- 网络预测 vs 精确搜索有轻微质量损失

---

### 2.3.2 MOCHA: Real-Time Motion Characterization (SIGGRAPH Asia 2023)

**论文**: [[209.md](https://caterpillarstudygroup.github.io/ReadPapers/index.html)](https://caterpillarstudygroup.github.io/ReadPapers/209.html)

**核心创新**: 首个实时角色表征框架，**同时转换动作风格和身体比例**

**背景**: 将中性动作转换为特定角色风格（如僵尸、公主、小丑），同时适配不同体型。

**架构**:

```mermaid
flowchart TB
    src["Source Motion<br/>中性动作"] --> BodyEnc["Bodypart Encoder<br/>6 身体部位"]
    BodyEnc --> SrcFeat["Source Feature"]
    SrcFeat --> NCM["Neural Context Matcher<br/>C-VAE + 自回归"]
    NCM --> CharFeat["Character Feature"]
    CharFeat --> Charz["Characterizer<br/>Transformer+AdaIN"]
    SrcFeat --> Charz
    Charz --> OutFeat["Translated Feature"]
    OutFeat --> Output["Characterized Motion"]
```

**AdaIN 公式**:

$$
\text{AdaIN}(z_{src}, z_{cha}) = \sigma(z_{cha}) \cdot \frac{z_{src} - \mu(z_{src})}{\sigma(z_{src})} + \mu(z_{cha})
$$

**NCM Prior**:

$$
p(s_i | z_{i-1}^{cha}, f(z_i^{src})) = \mathcal{N}(\mu, \sigma)
$$

**与 Style Modelling 的继承关系**:
- Style Modelling: AdaIN 用于风格转换
- MOCHA: AdaIN + Transformer，同时处理风格 + 体型

**优点**:
- 实时 60 FPS
- 同时处理风格转换 + 身体比例适配
- 支持稀疏输入（VR tracker）

**缺点**:
- 训练数据中的角色有限，新角色需重新训练
- 极端风格可能失真

---

### 2.4 流派三：扩散模型系 (Diffusion-based Methods)

**核心挑战**：标准扩散模型需要 1000 步去噪，无法满足实时性要求（60 FPS）。

**演进路径**：
```mermaid
flowchart TB
    DM["标准扩散模型<br/>1000 步去噪"] --> AMDM["A-MDM (2024)<br/>自回归 +50 步"]
    DM --> CAMDM["CAMDM (2024)<br/>8 步 + 风格转换"]
    DM --> AAMDM["AAMDM (2024)<br/>5 步 DD-GAN+ADM"]
    AMDM --> DART["DART (2025)<br/>Latent Space Control"]

    subgraph 加速演进
    AMDM -.->|50 步 | CAMDM
    CAMDM -.->|8 步 | AAMDM
    AAMDM -.->|5 步 | DART
    end
```

**加速策略对比**：

| 方法 | 去噪步数 | 加速策略 | 实时性 |
|------|---------|---------|-------|
| **A-MDM** | 50 步 | 自回归设计 | 30+ FPS |
| **CAMDM** | 8 步 | 条件化 + 引导采样 | 60+ FPS |
| **AAMDM** | 5 步 | DD-GAN+ADM 级联 | 60+ FPS |
| **DART** | ~20 步 | Latent 空间扩散 | 60+ FPS |

---

#### 2.3.1 A-MDM: Auto-regressive Motion Diffusion Model (SIGGRAPH 2024)

**论文**: [[206.md](https://caterpillarstudygroup.github.io/ReadPapers/index.html)](https://caterpillarstudygroup.github.io/ReadPapers/206.html)

**核心创新**: 将扩散模型从 space-time 重新设计为 auto-regressive

**自回归公式**:

$$
p(x_{1:T}) = \prod_{t=1}^{T} p(x_t | x_{1:t-1})
$$

**架构**: 简单 3 层 MLP，50 步去噪

**控制套件**:
- Task-oriented sampling
- Motion in-painting
- Keyframe in-betweening
- Hierarchical reinforcement learning

**与 CAMDM 的差异**:
- A-MDM: 强调控制套件，MLP 架构
- CAMDM: 强调风格转换，Transformer 架构

---

#### 2.3.2 CAMDM: Conditional Autoregressive Motion Diffusion Model (SIGGRAPH 2024)

**论文**: [[207.md](https://caterpillarstudygroup.github.io/ReadPapers/index.html)](https://caterpillarstudygroup.github.io/ReadPapers/207.html)

**核心创新**: **8 步去噪**实现实时高质量多样角色动画

**关键技术**:

| 技术 | 作用 |
|------|------|
| **分离条件 Tokenization** | 每个控制条件独立 token，避免特征主导 |
| **Classifier-free guidance on history** | 在历史动作上应用 guidance，实现风格转换 |
| **启发式轨迹扩展** | 回收上次预测轨迹，避免抖动 |

**条件输入**:
- 风格/步态
- 移动速度
- 朝向方向
- 未来轨迹

**优点**:
- 8 步去噪 ≈ 几毫秒，60+ FPS
- 支持多风格平滑转换
- 无需微调实现风格转换

**缺点**:
- 8 步去噪仍有优化空间
- 依赖 mocap 数据

---

#### 2.4.3 AAMDM: Accelerated Auto-regressive Motion Diffusion Model (CVPR 2024)

**论文**: [[204.md](https://caterpillarstudygroup.github.io/ReadPapers/index.html)](https://caterpillarstudygroup.github.io/ReadPapers/204.html)

**核心创新**: **5 步去噪** (3 DD-GAN + 2 ADM)

**架构**:
```
Autoencoder: 338D pose → 64D latent
      ↓
Generation Module: DD-GANs (3 步)
      ↓
Polishing Module: ADM (2 步)
      ↓
输出：高质量动作
```

**总去噪步数**: $T_{AA} = T_{GAN} + T_{ADM} = 3 + 2 = 5$

**与 CAMDM 的差异**:
- CAMDM: 8 步，强调风格转换
- AAMDM: 5 步，强调加速

---

#### 2.4.4 DARTControl: Diffusion-based Autoregressive Motion Model (ICLR 2025)

**论文**: [[205.md](https://caterpillarstudygroup.github.io/ReadPapers/index.html)](https://caterpillarstudygroup.github.io/ReadPapers/205.html)

**核心创新**: Motion Primitive 表示 + Latent Space Control

**Motion Primitive**:
- H=2 帧历史（与前一 primitive 重叠）
- F=8 帧未来

**Latent Space Control 方法**:
1. **优化方法**: latent noise optimization
2. **学习方法**: MDP + RL (PPO)

**优势**: 10x 加速 vs FlowMDM

**与 A-MDM 的差异**:
- A-MDM: 原始空间扩散
- DART: Latent 空间扩散，更高效

---

### 2.5 运动学方法总结

#### 三大流派核心思想对比

| 流派 | 代表方法 | 核心贡献 | 典型应用 |
|------|---------|---------|---------|
| **相位系** | PFNN → Local Phases → Style Modelling<br>Local Phases → Phase Manifolds → POMP | 相位解耦动作状态 / 相位流形插值 | VR 化身、风格化动画、过渡生成 |
| **Motion Matching 系** | MM → Learned MM → MOCHA | 数据搜索/预测生成动作 + 角色化 | 游戏 NPC、在线游戏、角色设计 |
| **扩散模型系** | A-MDM → CAMDM → AAMDM → DART | 概率扩散模型生成 | 电影动画、多样性生成 |

#### 流派选择指南

```mermaid
flowchart TD
    Q1["需要什么类型的控制？"] --> |风格转换 | A1["MOCHA / CAMDM / Style Modelling"]
    Q1 --> |稀疏输入 VR | A2["PFNN / MOCHA"]
    Q1 --> |高质量多样性 | A3["CAMDM / DART"]
    Q1 --> |低内存占用 | A4["Learned Motion Matching"]
    Q1 --> |物理交互 | A5["POMP"]
    Q1 --> |transition 生成 | A6["RTN"]
```

#### 运动学方法详细对比

| 方法 | 架构 | 去噪步数 | FPS | 风格转换 | 空间控制 | 物理感知 |
|------|------|---------|-----|---------|---------|---------|
| **PFNN** | 混合专家 | N/A | 60+ | △ | △ | ✗ |
| **Few-shot Styles (214)** | 残差适配器+CP 分解 | N/A | 60+ | ✓ (少样本) | △ | ✗ |
| **Local Motion Phases** | 相位条件化 | N/A | 60+ | ✗ | △ | ✗ |
| **RTN** | LSTM | N/A | 60+ | ✗ | ✓ | △ |
| **Learned MM** | 三网络 | N/A | 60+ | ✗ | △ | ✗ |
| **Style Modelling** | FWT+ 相位 | N/A | 60+ | ✓ | ✗ | ✗ |
| **MOCHA** | Transformer | N/A | 60+ | ✓ | ✗ | ✗ |
| **Phase Manifolds** | MoE+PAE | N/A | 30+ | ✗ | ✓ | ✗ |
| **POMP** | Diff+ 物理 | N/A | 60+ | ✗ | ✓ | ✓ |
| **A-MDM** | MLP | 50 | 30+ | △ | △ | ✗ |
| **CAMDM** | Transformer | 8 | 60+ | ✓ | ✓ | ✗ |
| **AAMDM** | DD-GAN+ADM | 5 | 60+ | △ | ✗ | ✗ |
| **DART** | Latent Diffusion | ~20 | 60+ | ✓ | ✓ | ✗ |

---

### 2.6 常见问题解答 (FAQ)

#### Q1: 相位系内部的两大分支有什么区别？

相位系是一个统一的流派，其核心思想是**引入相位变量** $\phi \in [0, 2\pi)$ **作为动作的解耦表示**。根据相位的使用方式，分为两大分支：

| 维度 | 相位表示分支 | 相位流形分支 |
|------|-----------|-----------|
| **核心目标** | 用相位解耦不同动作状态 | 在相位空间进行插值和物理对齐 |
| **相位角色** | 动作周期指示器 | 流形空间坐标 |
| **演进路径** | PFNN → Local Phases → Style Modelling | Local Phases → Phase Manifolds → POMP |
| **典型应用** | VR 化身、风格化动画 | 过渡生成、物理一致运动 |

**关系**：
- **共同基础**: 两者都从 Local Motion Phases (2020) 的局部相位表示继承
- **分叉点**:
  - 相位表示分支 → 朝风格转换方向发展（PFNN → Local Phases → Style Modelling）
  - 相位流形分支 → 朝插值和物理对齐方向发展（Phase Manifolds → POMP）

**为什么合并为相位系**：
- 两者都使用相位作为核心变量
- 都从 Local Phases (2020) 继承
- 区别仅在于相位的使用方式（解耦 vs 流形插值）

#### Q2: MOCHA 属于哪个流派？

**MOCHA 属于 Motion Matching 系**，而不是相位系。理由如下：

| 维度 | 相位系 | MOCHA |
|------|-----------|-------|
| **核心机制** | 相位作为权重参数或输入特征 | Neural Context Matcher 上下文匹配 |
| **相位使用** | 显式相位变量 $\phi$ | 无显式相位，用上下文特征条件化 |
| **继承关系** | PFNN → Local Phases → Style Modelling | Motion Matching → Learned MM → MOCHA |

**MOCHA 的核心贡献**：
1. **Neural Context Matcher**: 用 C-VAE + 自回归生成替代数据库搜索
2. **Characterizer**: 用 AdaIN + Cross-Attention 实现风格转换和体型适配

**注意**：MOCHA 虽然使用了 AdaIN（继承自 Style Modelling），但这只是风格注入的工具，其核心架构是基于上下文匹配的，因此属于 Motion Matching 系。

#### Q3: RTN 属于什么系？

**RTN 不属于任何主要流派**，它是一个**专用场景方法**：

| 维度 | RTN | 三大流派 |
|------|-----|---------|
| **目标场景** | Transition 生成 | 连续 locomotion |
| **相位需求** | 无需相位 | 需要相位或类似机制 |
| **标注需求** | 无需任何标注 | 通常需要相位/步态标注 |
| **网络结构** | 改进 LSTM | 多样化（混合专家、Transformer、扩散） |

**RTN 的定位**：
- RTN 是一个特殊的存在，专门处理游戏动画图中的**transition 生成**问题
- 它不属于相位系（无需相位）、不属于 Motion Matching 系（不用搜索）、不属于扩散模型系（2018 年工作）
- 在流派选择指南中，RTN 作为"transition 生成"的专用方案被推荐

---

## 三、基于动力学的方法 (Dynamics-based Methods)

**核心特征**: 输出为**关节力矩或 PD 控制目标**，需要物理仿真器执行。

### 3.1 技术演进时间线

```mermaid
timeline
    title 动力学方法发展时间线
    2010 : Feature-Based : 高层物理特征
    2018 : DeepMimic : RL+ 模仿
    2018 : Mode-Adaptive : 四足统一控制
    2019 : DReCon : MM+RL
    2021 : AMP : 对抗运动先验
    2022 : ASE : 预训练技能库
    2023 : ControlVAE : 状态条件先验
    2023 : Perpetual : 实时虚拟化身
    2023 : UniRep : 统一表示 + 蒸馏
    2024 : PDP/DiffuseLoco : 扩散策略
    2024 : MaskedMimic : 掩码运动补全
    2025 : PARC : 迭代数据扩增
    2025 : UniPhys : 统一规划 + 控制
```

### 3.2 核心思想继承关系

动力学方法经过十余年发展，形成了**四条主要演进主线**：

```mermaid
flowchart TB
    subgraph RL["RL lineage"]
        FB["Feature-Based"] --> DM["DeepMimic"]
        DM --> AMP["AMP"]
        AMP --> ASE["ASE"]
    end

    subgraph Hybrid["Hybrid lineage"]
        DM --> DReCon["DReCon<br/>MM+RL"]
        DReCon --> PDP["PDP<br/>RL 专家蒸馏"]
    end

    subgraph Pretrain["Pretraining lineage"]
        ASE --> CVAE["ControlVAE"]
        ASE --> UniRep["Universal Representation"]
    end

    subgraph Diffusion["Diffusion lineage"]
        PDP --> DiffuseLoco["DiffuseLoco"]
        ASE --> MaskedMimic["MaskedMimic"]
        MaskedMimic --> UniPhys["UniPhys"]
        DReCon --> PARC["PARC<br/>迭代扩增"]
    end
```

#### 四条演进主线详解

| 主线 | 演进路径 | 核心问题 | 解决方案 |
|------|---------|---------|---------|
| **RL Lineage** | Feature-Based → DeepMimic → AMP → ASE | 如何从数据学习控制策略？ | 手工特征 → RL 模仿 → 对抗学习 → 预训练技能库 |
| **Hybrid Lineage** | DeepMimic → DReCon → PDP | 如何统一多技能控制？ | 单一轨迹 → 动态参考选择 → 多专家蒸馏 |
| **Pretraining Lineage** | ASE → ControlVAE → UniRep | 如何提高样本效率？ | 对抗预训练 → 状态条件先验 → Prior+ 蒸馏 +RL 范式 |
| **Diffusion Lineage** | PDP → DiffuseLoco / ASE → MaskedMimic → UniPhys / DReCon → PARC | 2024 年扩散模型如何应用？ | 扩散策略 / 掩码补全 / 迭代扩增 |

**关键洞察**：
- **DeepMimic (2018)** 是深度学习时代的起点，首次证明 RL+ 模仿可以学习高质量动态动作
- **AMP (2021)** 解决数据标注问题，从需要精确跟踪 → 无标注对抗学习
- **ASE (2022)** 解决技能复用问题，预训练的技能库可以微调至下游任务
- **DReCon (2019)** 开创混合控制范式，生成器 (MM) + 跟踪器 (RL) 的架构被 PDP/PARC 继承
- **2024 年趋势**：扩散模型成为主流（DiffuseLoco、MaskedMimic、UniPhys、PARC）

---

### 3.3 主线一：RL 模仿学习 (RL Lineage)

**演进路径**: Feature-Based Control (2010) → DeepMimic (2018) → AMP (2021) → ASE (2022)

---

#### 3.3.1 Feature-Based Control (SIGGRAPH 2010)

**论文**: [[200.md](https://caterpillarstudygroup.github.io/ReadPapers/index.html)](https://caterpillarstudygroup.github.io/ReadPapers/200.html)

**核心思想**: 用高层物理特征设计控制器

**方法框架**:

```mermaid
flowchart LR
    Define["定义特征"] --> Obj["设计目标函数"]
    Obj --> Priority["优先级优化"]
    Priority --> Solve["求解关节力矩τ"]
```

**关键公式**:

- Setpoint 目标：$E(x) = ||\ddot{y}_d - \ddot{y}||^2$
- 角动量目标：$E_{AM}(x) = ||\dot{L}_d - \dot{L}||^2$
- 优先级优化：$h_i = \min_x E_i(x)$ s.t. $E_k(x) = h_k, \forall k < i$

**优点**: 可解释、无需数据
**缺点**: 实现复杂、动态性差

---

#### 3.3.2 DeepMimic (SIGGRAPH 2018)

**论文**: [[201.md](https://caterpillarstudygroup.github.io/ReadPapers/index.html)](https://caterpillarstudygroup.github.io/ReadPapers/201.html)

**核心创新**: 深度 RL + 模仿学习

**方法框架**:

```mermaid
flowchart LR
    Mocap["参考动作 mocap"] --> Reward["定义奖励 r^I+r^G"]
    Reward --> PPO["PPO 训练π(a|s)"]
    PPO --> PD["PD 控制器执行"]
    PD --> Sim["物理仿真"]
```

**模仿奖励**:

$$
r^I_t = w_p r^p_t + w_v r^v_t + w_e r^e_t + w_c r^c_t
$$

**训练技巧**:
- **RSI (Reference State Initialization)**: 从参考动作随机状态开始
- **ET (Early Termination)**: 跌倒立即终止
- **相位条件化**: $\phi_t = (t \mod T_{cycle}) / T_{cycle}$

**优点**: 动作质量高、可学习动态动作
**缺点**: 每技能单独训练、样本效率低

---

### 3.4 主线二：混合控制 (Hybrid Lineage)

**演进路径**: DReCon (2019) → PDP (2024) → PARC (2025)

**核心思想**: 生成器（选择/生成参考轨迹）+ RL 跟踪器（保证物理稳定性）。

---

### 3.5 特殊应用：四足动物控制 (Mode-Adaptive)

**论文**: [[213.md](https://caterpillarstudygroup.github.io/ReadPapers/index.html)](https://caterpillarstudygroup.github.io/ReadPapers/213.html)

**核心创新**: 单个神经网络处理多种四足动物步态

**架构**:

```mermaid
flowchart TB
    state["角色状态"] --> ModeEst["Mode 估计"]
    cmd["用户命令"] --> ModeEst
    terrain["地形信息"] --> ModeEst
    ModeEst --> Adaptive["Adaptive 权重"]
    state --> Control["控制器"]
    cmd --> Control
    Adaptive --> Control
    Control --> Action["关节目标"]
```

**优点**:
- 流畅的步态切换
- 适应不同地形
- 自然运动质量

**缺点**:
- 仅适用于四足动物
- 需要 mocap 数据

---

#### 3.4.1 DReCon (SIGGRAPH Asia 2019)

**论文**: [[190.md](https://caterpillarstudygroup.github.io/ReadPapers/index.html)](https://caterpillarstudygroup.github.io/ReadPapers/190.html)

**核心架构**:

```mermaid
flowchart LR
    MM["Motion Matching"] --> RL["RL 规划"]
    RL --> PD["PD 执行"]
    PD --> Sim["物理仿真"]
    Sim --> MM
```

**创新点**:
- 用 Motion Matching 替代 mocap 参考轨迹
- RL 输出 PD 目标而非直接力矩
- 支持实时响应

**与 DeepMimic 的差异**:
- DeepMimic: 跟踪单一 mocap 片段
- DReCon: 用 Motion Matching 选择参考轨迹

---

#### 3.3.3 AMP: Adversarial Motion Priors (SIGGRAPH 2021)

**论文**: [[198.md](https://caterpillarstudygroup.github.io/ReadPapers/index.html)](https://caterpillarstudygroup.github.io/ReadPapers/198.html)

**核心创新**: 用对抗学习从**无标注数据**学习

**方法框架**:

```mermaid
flowchart LR
    Data["无标注 mocap"] --> D["判别器 D(s,s')"]
    D --> Policy["策略π"]
    Policy --> Adv["对抗奖励-log(1-D)"]
    Adv --> Policy
```

**对抗奖励**:

$$
r_{adv} = -\log(1 - D(s_t, s_{t+1}))
$$

**AMP 的核心优势**:
1. 无需精确跟踪参考动作
2. 能够从多样化数据集学习
3. 自动学习技能组合

**局限性**:
- 训练不稳定（对抗博弈）
- GAN+RL 训练难度大

---

#### 3.3.4 ASE: Adversarial Skill Embeddings (SIGGRAPH 2022)

**论文**: [[199.md](https://caterpillarstudygroup.github.io/ReadPapers/index.html)](https://caterpillarstudygroup.github.io/ReadPapers/199.html)

**核心创新**: 预训练通用技能库 + 下游微调

**两阶段训练**:

```mermaid
flowchart TB
    subgraph PreTrain["阶段 1: 预训练"]
        Data["无标注数据集"] --> LowPolicy["低级策略π(a|s,z)"]
        Data --> Discriminator["对抗 + 互信息"]
    end

    subgraph TaskTrain["阶段 2: 任务训练"]
        Goal["任务目标 g"] --> HighPolicy["高级策略ω(z|s,g)"]
        LowPolicyFixed["低级策略 (固定)"] --> Output["输出动作 a"]
        HighPolicy --> LowPolicyFixed
    end

    PreTrain --> TaskTrain
```

**预训练目标**:

$$
\max_{\pi} -D_{JS}(d_{\pi} || d_M) + \beta I(s, s'; z | \pi)
$$

**与 AMP 的差异**:
- AMP: 每任务从头训练
- ASE: 预训练可复用，技能库学习

**优点**: 技能可复用、支持插值和组合
**缺点**: 需要大规模并行模拟（Isaac Gym）

---

### 3.6 主线三：预训练与统一表示 (Pretraining Lineage)

**演进路径**: ControlVAE (2023) → UniRep (2023) → MaskedMimic (2024) → UniPhys (2025)

---

#### 3.6.1 ControlVAE (TOG 2023)

**论文**: [[202.md](https://caterpillarstudygroup.github.io/ReadPapers/index.html)](https://caterpillarstudygroup.github.io/ReadPapers/202.html)

**核心创新**: 状态条件先验 + 世界模型

**与 ASE 对比**:
| 维度 | ASE | ControlVAE |
|------|-----|------------|
| 先验类型 | 球面均匀分布 | 状态条件高斯 |
| 学习方式 | 对抗 + 互信息 | 世界模型 + ELBO |
| 技能表示 | 离散技能库 | 连续潜在空间 |

---

#### 3.6.2 UniRep: Universal Humanoid Motion Representations (2023)

**论文**: [[196.md](https://caterpillarstudygroup.github.io/ReadPapers/index.html)](https://caterpillarstudygroup.github.io/ReadPapers/196.html)

**核心创新**: 实时虚拟化身控制系统

**系统架构**:

```mermaid
flowchart LR
    Input["视频/动捕/控制信号"] --> MotionGen["运动生成"]
    MotionGen --> Track["物理跟踪控制器"]
    Track --> Output["物理稳定全身控制"]
    Output --> Disturb["扰动恢复"]
    Disturb --> Track
```

**特点**:
- Meta 出品，面向 VR/AR 应用
- 实时优先，支持多种输入源
- 物理感知保证可行性

---

### 3.7 特殊应用：实时虚拟化身 (Perpetual)

**论文**: [[196.md](https://caterpillarstudygroup.github.io/ReadPapers/index.html)](https://caterpillarstudygroup.github.io/ReadPapers/196.html)

**核心创新**: 实时虚拟化身控制系统

**系统架构**:

```mermaid
flowchart LR
    Input["视频/动捕/控制信号"] --> MotionGen["运动生成"]
    MotionGen --> Track["物理跟踪控制器"]
    Track --> Output["物理稳定全身控制"]
    Output --> Disturb["扰动恢复"]
    Disturb --> Track
```

**特点**:
- Meta 出品，面向 VR/AR 应用
- 实时优先，支持多种输入源
- 物理感知保证可行性

**定位**: 实时系统应用，不属于上述演进主线

---

### 3.8 主线四：扩散策略 (Diffusion Lineage)

**演进路径**: DiffuseLoco (2024)

**核心思想**: 使用扩散模型学习物理一致的控制策略。

---

#### 3.8.1 Universal Humanoid Representations (2024)

**论文**: [[191.md](https://caterpillarstudygroup.github.io/ReadPapers/index.html)](https://caterpillarstudygroup.github.io/ReadPapers/191.html)

**核心创新**: 建立 Prior + Distillation + RL 的标准范式

**三阶段训练**:

```mermaid
flowchart TB
    Mocap["MoCap 数据"] --> CVAE["CVAE 训练"]
    CVAE --> Prior["动作先验 z"]

    TO["轨迹优化器"] --> Stable["物理稳定轨迹"]
    Stable --> Distill["蒸馏到 Decoder"]

    Prior --> RL["高层 RL"]
    Distill --> RL
```

**核心困境解决**:
- MoCap 生成模型：动作自然但物理不稳定
- 纯轨迹优化：物理稳定但动作单调

**方案**: 用蒸馏将物理稳定性灌进网络，保留 z 的多样性

**历史贡献**: 定型并普及了 **Prior + Distillation + RL** 的标准流水线

---

#### 3.8.2 DiffuseLoco (2024)

**论文**: [[195.md](https://caterpillarstudygroup.github.io/ReadPapers/index.html)](https://caterpillarstudygroup.github.io/ReadPapers/195.html)

**方法框架**:

```mermaid
flowchart LR
    Data["离线 mocap"] --> Diff["扩散模型π(a|s,goal)"]
    Diff --> Distill["蒸馏 RL 策略"]
    Distill --> Control["实时控制"]
```

**优点**: 离线训练、无需在线 RL

---

#### 3.8.3 POMP: Physics-consistent Motion Prior (CVPR 2024)

**论文**: [[112.md](https://caterpillarstudygroup.github.io/ReadPapers/index.html)](https://caterpillarstudygroup.github.io/ReadPapers/112.html)

**核心创新**: 基于相流形的物理一致运动先验，**将动力学模块置于训练循环外**

**注意**: POMP 虽然使用相位表示（类似相位系），但其核心是**物理一致的运动生成**，输出关节力矩并使用物理仿真器，因此**属于动力学方法**而非运动学相位系。

**架构**:

```mermaid
flowchart TB
    subgraph Input["输入"]
        state["角色状态 + 地形 + 轨迹"]
    end

    subgraph Kinematic["运动学模块"]
        MoE["OrthoMoE Encoder"]
        Diff["Diffusion Decoder"]
    end

    subgraph Dynamic["动力学模块"]
        IK["逆动力学 PD 控制"]
        FK["前向动力仿真"]
    end

    subgraph Phase["相位编码模块"]
        PAE["Periodic Autoencoder"]
        Align["语义对齐"]
    end

    Input --> MoE
    MoE --> Diff
    Diff --> IK
    IK --> FK
    FK --> Align
    Align --> PAE
    PAE --> MoE

    style Kinematic fill:#e1f5fe
    style Dynamic fill:#fff3e0
    style Phase fill:#e8f5e9
```

**三模块协作**:
1. **运动学模块**: 基于扩散的运动先验生成初始姿态
2. **动力学模块**: 物理仿真确保物理合理性（接触力、碰撞）
3. **相位编码模块**: 将仿真姿态投影回运动先验的相流形

**关键洞察**:
- 直接反馈仿真结果会导致误差累积
- 相流形中的语义对齐解决领域鸿沟问题
- 动力学模块在训练循环外，计算高效

**优点**:
- 物理一致的运动生成
- 实时响应物理扰动
- 计算高效（动力学模块在训练循环外）

**缺点**:
- 依赖地形和冲量数据提取
- 复杂交互质量受限

---

#### 3.8.4 PDP: Physics-Based Character Animation via Diffusion Policy (2024)

**论文**: [[192.md](https://caterpillarstudygroup.github.io/ReadPapers/index.html)](https://caterpillarstudygroup.github.io/ReadPapers/192.html)

**核心**: RL 专家蒸馏 + 扩散策略

**两阶段训练**:
1. 训练多个单任务 RL 专家
2. 离线行为克隆蒸馏到单一 Diffusion Policy

**与 DReCon 的继承关系**:
- DReCon: Motion Matching + RL
- PDP: RL 专家 + Diffusion Policy

---

#### MaskedMimic (SIGGRAPH Asia 2024)

**论文**: [[183.md](https://caterpillarstudygroup.github.io/ReadPapers/index.html)](https://caterpillarstudygroup.github.io/ReadPapers/183.html)

**核心创新**: 掩码运动补全统一多模态控制

**CVAE 架构**:
- 输入：多模态控制信号（掩码关键帧、对象、文本等）
- 输出：物理一致的 PD 控制目标

**特点**:
- 无需奖励工程
- 支持无缝任务切换
- 实时响应能力

**与 UniPhys 的对比**:
- MaskedMimic: 掩码补全范式
- UniPhys: Diffusion Forcing 范式

---

#### 3.8.5 PARC (SIGGRAPH 2025)

**论文**: [[189.md](https://caterpillarstudygroup.github.io/ReadPapers/index.html)](https://caterpillarstudygroup.github.io/ReadPapers/189.html)

**核心创新**: 基于物理仿真的迭代数据扩增框架

**迭代循环**:

```mermaid
flowchart TB
    Gen["Motion Generator<br/>扩散模型"] --> Synth["合成新地形轨迹"]
    Synth --> Track["Motion Tracker<br/>RL 物理修正"]
    Track --> Filter["质量筛选"]
    Filter --> Dataset["数据集扩增"]
    Dataset --> Gen
```

**四项关键机制防止性能退化**:
1. **固定采样比例**: 保留原始 mocap 作为监督锚点
2. **物理约束修正**: RL 控制器修正为物理可信运动
3. **质量筛选**: 仅保留成功样本
4. **小步迭代**: 微调策略，防止分布漂移

**应用场景**: 敏捷地形穿越（如跑酷）

**与 DReCon 的继承关系**:
- DReCon: Motion Matching + RL 跟踪
- PARC: 扩散生成 + RL 跟踪 + 迭代扩增

---

#### 3.6.4 UniPhys (2025)

**论文**: [[191.md](https://caterpillarstudygroup.github.io/ReadPapers/index.html)](https://caterpillarstudygroup.github.io/ReadPapers/191.html)

**核心创新**: 统一规划器 + 控制器，Diffusion Forcing 范式

**方法框架**:

```mermaid
flowchart LR
    Mocap["mocap 数据"] --> Preprocess["PD 控制预处理"]
    Preprocess --> GT["物理合理 GT<br/>动作略僵硬"]
    GT --> Train["训练 Diffusion 模型"]
    MultiModal["多模态输入<br/>文本/轨迹/目标"] --> Infer["引导采样推理"]
    Train --> Infer
    Infer --> Output["物理合理运动"]
```

**与 MaskedMimic 对比**:
| 维度 | MaskedMimic | UniPhys |
|------|-------------|---------|
| 训练范式 | 掩码补全 | Diffusion Forcing |
| PD 目标来源 | mocap+ 跟踪 | mocap+PD 预处理 |
| 长序列处理 | 较短序列 | 噪声历史去噪 |

**优点**:
- 无需强化学习和蒸馏
- 训练简单，单模型推理
- 物理合理但动作略僵硬

---

### 3.9 动力学方法对比

| 方法 | 训练范式 | 样本效率 | 动作质量 | 抗扰动 | 实时性 |
|------|---------|---------|---------|-------|-------|
| **Feature-Based** | 无需训练 | N/A | 中 | 中 | ✓ |
| **DeepMimic** | RL+ 模仿 | 低 | 极高 | 高 | ✓ |
| **Mode-Adaptive** | 模仿学习 | 中 | 高 | 高 | ✓ |
| **DReCon** | RL+MM | 中 | 高 | 高 | ✓ |
| **AMP** | 对抗学习 | 低 | 极高 | 高 | ✓ |
| **ASE** | 预训练 + 微调 | 高 | 极高 | 高 | ✓ |
| **ControlVAE** | 世界模型 | 高 | 高 | 高 | ✓ |
| **Perpetual** | 实时跟踪 | 高 | 高 | 高 | ✓ |
| **UniRep** | Prior+ 蒸馏 +RL | 高 | 高 | 高 | ✓ |
| **DiffuseLoco** | 离线蒸馏 | 高 | 极高 | 高 | ✓ |
| **PDP** | RL 专家蒸馏 | 中 | 极高 | 高 | ✓ |
| **MaskedMimic** | 掩码补全 | 高 | 极高 | 高 | ✓ |
| **PARC** | 迭代扩增 | 高 | 极高 | 高 | ⚠️ |
| **UniPhys** | 直接训练 | 高 | 高 | 高 | ⚠️ |

---

## 四、运动学 vs 动力学：技术选型指南

### 4.1 核心差异

| 维度 | 运动学方法 | 动力学方法 |
|------|-----------|-----------|
| **输出** | 关节姿态/速度 | 关节力矩/PD 控制目标 |
| **物理仿真** | 否 | 是 |
| **真实感来源** | 数据驱动 | 物理约束 + 数据 |
| **抗扰动能力** | 无 | 强 |
| **环境交互** | 有限 | 强 |
| **训练成本** | 低 - 中 | 中 - 高 |
| **实现难度** | 低 | 高 |

### 4.2 思想演进总结

#### 运动学方法演进主线

1. **相位表示线** (PFNN → Style Modelling → MOCHA → Phase Manifolds)
   - 核心思想：用相位解耦不同动作状态
   - 演进：全局相位 → 局部相位 → 相位流形插值

2. **Motion Matching 线** (MM → Learned MM → MOCHA)
   - 核心思想：用数据搜索生成动作
   - 演进：数据库搜索 → 神经网络预测 → 角色化扩展

3. **扩散模型线** (A-MDM → CAMDM → AAMDM → DART)
   - 核心思想：扩散模型高质量生成
   - 演进：1000 步 → 50 步 → 8 步 → 5 步，同时支持实时控制

#### 动力学方法演进主线

1. **RL 模仿线** (DeepMimic → AMP → ASE)
   - 核心思想：从 mocap 数据学习控制策略
   - 演进：单技能跟踪 → 对抗先验 → 预训练技能库

2. **混合控制线** (DReCon → PDP → PARC)
   - 核心思想：生成器 + RL 跟踪
   - 演进：Motion Matching → RL 专家 → 扩散模型 + 迭代扩增

3. **统一表示线** (ControlVAE → UniRep → MaskedMimic → UniPhys)
   - 核心思想：统一潜在空间表示
   - 演进：状态条件先验 → Prior+ 蒸馏 → 掩码补全 → Diffusion Forcing

### 4.3 应用场景推荐

| 应用场景 | 推荐方法 | 理由 |
|---------|---------|------|
| **游戏 NPC** | DeepMimic / ASE / Learned MM | 实时、质量高、抗扰动 |
| **电影动画** | CAMDM / DART / MOCHA | 多样性、风格控制、无需物理 |
| **VR 化身** | PFNN / CAMDM / MOCHA / Perpetual | 低延迟、稀疏输入支持 |
| **机器人仿真** | Feature-Based + RL / ASE | 安全、可解释、物理正确 |
| **在线游戏** | Learned Motion Matching | 低内存、服务器友好 |
| **角色设计** | MOCHA / Style Modelling | 风格转换、体型适配 |
| **四足动物** | Mode-Adaptive | 统一多步态控制 |
| **敏捷地形** | PARC / RTN (地形版) | 复杂地形穿越 |
| **多任务控制** | MaskedMimic / UniPhys | 统一框架处理多模态输入 |

### 4.4 方法选择决策树

```mermaid
flowchart TD
    Q1["需要物理仿真/抗扰动？"] --> |否 | A1["运动学方法"]
    Q1 --> |是 | A2["动力学方法"]

    A1 --> Q2["需要风格转换？"]
    Q2 --> |是 | A3["MOCHA / Style Modelling / CAMDM"]
    Q2 --> |否 | A4["PFNN / Learned MM / AAMDM"]

    A2 --> Q3["有无标注数据？"]
    Q3 --> |无 | A5["AMP / ASE"]
    Q3 --> |有 | A6["DeepMimic / DiffuseLoco"]

    A6 --> Q4["需要多模态控制？"]
    Q4 --> |是 | A7["MaskedMimic / UniPhys"]
    Q4 --> |否 | A8["PDP / DiffuseLoco"]

    A2 --> Q5["需要敏捷地形穿越？"]
    Q5 --> |是 | A9["PARC"]
```

---

## 五、开放性问题与未来趋势

### 5.1 技术挑战

1. **实时性与质量权衡**
   - 扩散模型推理速度仍是瓶颈
   - 方向：一致性模型、蒸馏、更少去噪步数

2. **长时序规划**
   - 当前方法多为短时域反应式
   - 方向：分层控制、世界模型、Diffusion Forcing

3. **多角色泛化**
   - 技能绑定特定形态
   - 方向：形态无关表示、零样本迁移

4. **与语言模型结合**
   - 自然语言指令驱动
   - 方向：LLM + 运动生成联合训练

5. **在线适应**
   - 适应新环境、新扰动
   - 方向：Test-Time Training、元学习、迭代扩增（如 PARC）

### 5.2 未来趋势

1. **运动学 + 动力学融合**
   - 运动学方法生成参考轨迹
   - 动力学方法保证物理可行性
   - 代表工作：UniPhys、PARC

2. **世界模型 + 扩散**
   - 学习可微物理引擎
   - 在 latent space 规划

3. **多模态大模型**
   - 视觉 + 语言 + 运动联合训练
   - 具身智能 (Embodied AI)

4. **自动技能发现**
   - 无监督发现技能层级
   - 类似 LLM 的 emergent abilities

5. **数据高效学习**
   - 少样本风格学习
   - 迭代数据扩增（PARC 范式）

---

## 六、关键论文索引

### 运动学方法

| 论文 | 年份 | 链接 | 核心贡献 |
|------|------|------|---------|
| PFNN | 2017 | [113](https://caterpillarstudygroup.github.io/ReadPapers/113.html) | 相位函数化权重 |
| **Few-shot Locomotion Styles** | **2018** | **[214](https://caterpillarstudygroup.github.io/ReadPapers/214.html)** | **残差适配器 +CP 分解，少样本风格学习** |
| Local Motion Phases | 2020 | [216](https://caterpillarstudygroup.github.io/ReadPapers/216.html) | 局部相位表示 |
| RTN | 2018 | [210](https://caterpillarstudygroup.github.io/ReadPapers/210.html) | 循环转移网络 |
| Style Modelling | 2020 | [211](https://caterpillarstudygroup.github.io/ReadPapers/211.html) | 特征变换 + 局部相位 |
| Learned Motion Matching | 2020 | [208](https://caterpillarstudygroup.github.io/ReadPapers/208.html) | 神经网络替代数据库 |
| MOCHA | 2023 | [209](https://caterpillarstudygroup.github.io/ReadPapers/209.html) | 上下文匹配角色化 |
| Phase Manifolds | 2023 | [212](https://caterpillarstudygroup.github.io/ReadPapers/212.html) | 相位流形中间帧 |
| POMP | 2023 | [112](https://caterpillarstudygroup.github.io/ReadPapers/112.html) | 物理一致运动先验 |
| A-MDM | 2024 | [206](https://caterpillarstudygroup.github.io/ReadPapers/206.html) | 自回归扩散模型 |
| CAMDM | 2024 | [207](https://caterpillarstudygroup.github.io/ReadPapers/207.html) | 8 步去噪 + 风格转换 |
| AAMDM | 2024 | [204](https://caterpillarstudygroup.github.io/ReadPapers/204.html) | 5 步 DD-GAN+ADM |
| DARTControl | 2025 | [205](https://caterpillarstudygroup.github.io/ReadPapers/205.html) | 潜在空间控制 |

### 动力学方法

| 论文 | 年份 | 链接 | 核心贡献 |
|------|------|------|---------|
| Feature-Based Control | 2010 | [200](https://caterpillarstudygroup.github.io/ReadPapers/200.html) | 高层物理特征控制 |
| DeepMimic | 2018 | [201](https://caterpillarstudygroup.github.io/ReadPapers/201.html) | RL+ 模仿学习 |
| Mode-Adaptive | 2018 | [213](https://caterpillarstudygroup.github.io/ReadPapers/213.html) | 四足动物统一控制 |
| DReCon | 2019 | [190](https://caterpillarstudygroup.github.io/ReadPapers/190.html) | Motion Matching+RL |
| AMP | 2021 | [198](https://caterpillarstudygroup.github.io/ReadPapers/198.html) | 对抗运动先验 |
| ASE | 2022 | [199](https://caterpillarstudygroup.github.io/ReadPapers/199.html) | 预训练技能嵌入 |
| ControlVAE | 2023 | [202](https://caterpillarstudygroup.github.io/ReadPapers/202.html) | 状态条件先验 |
| Perpetual | 2023 | [196](https://caterpillarstudygroup.github.io/ReadPapers/196.html) | 实时虚拟化身 |
| UniRep | 2023 | [191](https://caterpillarstudygroup.github.io/ReadPapers/191.html) | 统一表示 + 蒸馏 |
| DiffuseLoco | 2024 | [195](https://caterpillarstudygroup.github.io/ReadPapers/195.html) | 扩散策略 |
| PDP | 2024 | [192](https://caterpillarstudygroup.github.io/ReadPapers/192.html) | RL 专家蒸馏 |
| MaskedMimic | 2024 | [183](https://caterpillarstudygroup.github.io/ReadPapers/183.html) | 掩码运动补全 |
| PARC | 2025 | [189](https://caterpillarstudygroup.github.io/ReadPapers/189.html) | 迭代数据扩增 |
| UniPhys | 2025 | [191](https://caterpillarstudygroup.github.io/ReadPapers/191.html) | 统一规划 + 控制 |

---

## 七、总结

角色位移控制领域呈现**双轨并行、多线演进**的发展态势：

**运动学方法**沿三大主线演进：
1. **相位系**：PFNN 的相位函数化权重 (2017) → **Few-shot Styles 的残差适配器 +CP 分解 (2018)** → Local Motion Phases 的局部相位 (2020) → Style Modelling 的特征变换 (2020) / Phase Manifolds 的相位流形插值 (2023) → POMP 的物理一致运动先验 (2023)
2. **Motion Matching 系**：工业界标准 Motion Matching → Learned Motion Matching 的神经网络替代 → MOCHA 的上下文匹配角色化
3. **扩散模型系**：A-MDM 的自回归设计 → CAMDM 的 8 步去噪 + 风格转换 → AAMDM 的 5 步加速 → DART 的潜在空间控制

**动力学方法**沿三条主线演进：
1. **RL 模仿线**：DeepMimic 的 RL+ 模仿 → AMP 的对抗先验 → ASE 的预训练技能库
2. **混合控制线**：DReCon 的 Motion Matching+RL → PDP 的 RL 专家蒸馏 → PARC 的扩散生成 + 迭代扩增
3. **统一表示线**：ControlVAE 的状态条件先验 → UniRep 的 Prior+ 蒸馏范式 → MaskedMimic 的掩码补全 → UniPhys 的 Diffusion Forcing

**融合趋势**：2024-2025 年的工作开始探索运动学 + 动力学的融合：
- UniPhys 用 PD 预处理保证物理合理性
- PARC 用迭代扩增结合生成与物理修正
- Perpetual 实现实时物理跟踪

这将是未来的重要方向。

---

**参考文献**: 详见各论文笔记文件

# P1 任务：相位系统整理与 MOCHA 分类修正 TODO List

> **最后更新**: 2026-04-04
> **PDF 原文确认**: 已读取 MOCHA (209.pdf) 第 1-8 页
>
> **状态说明**：
> - ✅ 已完成：`Locomotion_Survey.md` 中的相位系统合并
> - ✅ 已完成：`Application/Locomotion.md` 中的 MOCHA 分类修正
> - ✅ 已完成：`ReadPapers/src/209.md` 添加相关工作对比章节
>
> 本文档记录相位系统合并与 MOCHA 分类修正的修改计划。

---

## 已完成修改

### ✅ TODO-1: 移除 `Application/Locomotion.md` 中"生成 + 控制"表格的 MOCHA

**Git 提交**: b3a5326

**修改内容**: 删除第 239 行的 MOCHA 条目

**理由**:
- MOCHA 的核心是 Neural Context Matcher 进行上下文匹配，属于 Motion Matching 系
- MOCHA 已在"基于匹配的方法"表格中正确列出（第 139 行）
- 不应出现在"生成 + 控制"部分，会造成分类混淆

---

### ✅ 补充：在 `ReadPapers/src/209.md` 添加相关工作对比章节

**Git 提交**: 6690940

**新增内容**:
1. **与 Motion Matching 的关系**
   - MOCHA 属于 Motion Matching 系的第三代方法
   - Motion Matching (2019) → Learned MM (2020) → MOCHA (2023)
   - NCM 的训练监督信号来自数据库搜索

2. **与 Humor 等生成模型的关系**
   - MOCHA 学习跨角色的风格匹配（correspondence）
   - Humor/A-MDM 学习动作的时间演化（dynamics）
   - C-VAE 在 MOCHA 中是可微分的最近邻搜索工具

3. **与风格转换方法的对比表格**

---

### ✅ 已完成修改（`Locomotion_Survey.md`）

以下修改已在之前会话中完成：

| 项目 | 状态 | 内容 |
|------|------|------|
| 相位系统一框架表格 | ✅ 已完成 | 将两大分支合并为统一演进框架 |
| FAQ Q1 更新 | ✅ 已完成 | 改为"相位系的发展脉络是什么" |
| 2.6 节总结表格 | ✅ 已完成 | 相位系描述已更新 |
| 第七节总结 | ✅ 已完成 | 演进路径已更新 |

---

## 待处理任务

### TODO-2: 修正 `Application/Locomotion.md` 中"基于相位的方法"的分类命名

**位置**: `Application/Locomotion.md` 第 166 行

**当前内容**:
```markdown
### 基于相位的方法
```

**问题**: 这个分类包含了 PFNN、Local Phases、Style Modelling、Phase Manifolds 等多个方法，但标题只写"基于相位的方法"，没有体现统一的演进脉络。

**建议修改为**:
```markdown
### 基于相位的方法（统一框架）

**演进脉络**：PFNN (2017) → Few-shot Styles (2018) → Local Phases (2020) → Style Modelling (2020) → Phase Manifolds (2023)
```

**理由**: 与 `Locomotion_Survey.md` 保持一致，强调相位系的统一性。

- [ ] 同意修改
- [ ] 需要调整
- [ ] 跳过

---

## 执行顺序建议

```
1. TODO-2: 修正 Application/Locomotion.md 中"基于相位的方法"标题（优先级：低）
2. Git 提交
```

# 万华烟花 (KaleidoFire) — 开发文档主注册表目录 (Document Index)
> **项目版本**: V1.1.0-STABLE  
> **生效日期**: 2026-05-21  
> **管理规范**: SPEC_20260520_GLOBAL_DEVELOPMENT_STANDARDS.md  

---

## 📖 目录管理概述

本文件是 `KaleidoFire` 项目所有开发设计、技术规格、审计报告、历史归档及活动执行文档的主注册表。
所有新建、更新或废弃的开发文档都必须在此注册登记，以维护项目极高的一致性、可检索性与可追溯性。

> [!IMPORTANT]
> **编写与阅读指引**：
> 1. **链接规范**：所有注册项必须使用 **本地绝对链接** (`file:///...`) 锚定，便于开发者在编辑器中“一键直达”。
> 2. **前缀规则**：必须严格遵循 `SPEC_`、`AUDIT_`、`TEST_`、`HIST_`、`EXEC_` 五大全局分类前缀命名。

---

## 🏷️ 文档注册主表 (Document Registry)

| # | 文档物理名称 | 类别前缀 | 创建/更新日期 | 描述与核心内容 | 本地文件绝对链接 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `SPEC_20260521_DOCUMENT_INDEX.md` | `SPEC_` | 2026-05-21 | 本主注册表目录文档。项目文档唯一的全局事实索引。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/docs/SPEC_20260521_DOCUMENT_INDEX.md) |
| 2 | `SPEC_20260520_ENVIRONMENT_INFO.md` | `SPEC_` | 2026-05-20 | **开发环境与依赖规格**。记录 Node 20 / Tailwind v3 / Vite v7 配置及 40+ Shadcn UI 组件清单。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/docs/SPEC_20260520_ENVIRONMENT_INFO.md) |
| 3 | `SPEC_20260422_GPU_MIGRATION_PLAN.md` | `SPEC_` | 2026-04-22 | **3D GPU 渲染管线迁移方案**。阐述由 Canvas 2D 升级至 Three.js + WebGL GPU 计算的底层迁移。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/docs/SPEC_20260422_GPU_MIGRATION_PLAN.md) |
| 4 | `AUDIT_20260512_FIREWORK_BUGFIX_REPORT.md` | `AUDIT_` | 2026-05-12 | **致命 React 19 挂载等 Bug 修复报告**。包含 StrictMode 双重挂载、Y轴坐标溢出等 4 大 Bug 审计排查与修复方案。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/docs/AUDIT_20260512_FIREWORK_BUGFIX_REPORT.md) |
| 5 | `AUDIT_20260514_FIREWORK_RENDER_CALIBRATION.md` | `AUDIT_` | 2026-05-14 | **千树流律 v6.0 对齐校准审计与实施案**。对齐 7 大核心物理与渲染参数，补齐全 18 种形态与星空系统。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/docs/AUDIT_20260514_FIREWORK_RENDER_CALIBRATION.md) |
| 6 | `HIST_20260514_DEVELOPMENT_LOG.md` | `HIST_` | 2026-05-14 | **开发迭代大编年史**。记录项目从“光污染治理”到“高保真粒子美学”再到“盛典模式”的视觉重构历程。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/docs/HIST_20260514_DEVELOPMENT_LOG.md) |
| 7 | `EXEC_20260521_DOCUMENT_OPTIMIZATION_PLAN.md` | `EXEC_` | 2026-05-21 | **文档重构会话执行方案**。本次文档管理规范化整理的决策与方案书。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/docs/EXEC_20260521_DOCUMENT_OPTIMIZATION_PLAN.md) |
| 8 | `EXEC_20260521_DOCUMENT_OPTIMIZATION_TASK.md` | `EXEC_` | 2026-05-21 | **文档重构会话进度清单**。伴随重构操作的实时 TODO task 任务进度清单。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/docs/EXEC_20260521_DOCUMENT_OPTIMIZATION_TASK.md) |
| 9 | `EXEC_20260521_DOCUMENT_OPTIMIZATION_WALKTHROUGH.md`| `EXEC_` | 2026-05-21 | **文档重构交付验证汇报**。记录重命名映射 100% 字节无损核算、构建跑测及 GitHub 同步状态的交付总结。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/docs/EXEC_20260521_DOCUMENT_OPTIMIZATION_WALKTHROUGH.md) |

---

> [!TIP]
> 文档索引表在每次大模型开发会话启动和交付时，均应由 `Documenter` 进行首轮审计与同步维护，确保项目脉络不出现任何“黑盒断层”。

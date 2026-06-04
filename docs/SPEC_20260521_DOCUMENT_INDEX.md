# 万华烟花 (KaleidoFire) — 开发文档主注册表目录 (Document Index)
> **项目版本**: V1.1.0-STABLE  
> **生效日期**: 2026-05-21 (最后更新于 2026-06-04)  
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
| 6 | `HIST_20260514_DEVELOPMENT_LOG.md` | `HIST_` | 2026-05-14 | **高保真盛典模式重构与 CI/CD 部署自愈大编年史**。基于真实 AI 协同会话，1:1 还原盛典按钮去音乐精简、README去沙化、Vite Base 与 Actions CI 自动化构建重写、严格 TS 未使用检查报错自愈、以及 17 种形态真随机过滤哑弹与 2-3 朵并发燃放交付。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/docs/HIST_20260514_DEVELOPMENT_LOG.md) |
| 7 | `EXEC_20260422_GPU_MIGRATION_PLAN.md` | `EXEC_` | 2026-04-22 | **GPU 烟花引擎迁移会话实施方案**。将 2D 引擎升级并迭代为高性能 3D GPGPU 粒子引擎。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/docs/EXEC_20260422_GPU_MIGRATION_PLAN.md) |
| 8 | `EXEC_20260422_GPU_MIGRATION_TASK.md` | `EXEC_` | 2026-04-22 | **GPU 烟花引擎迁移会话进度清单**。伴随重构操作的实时 TODO task 任务进度清单。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/docs/EXEC_20260422_GPU_MIGRATION_TASK.md) |
| 9 | `EXEC_20260422_GPU_MIGRATION_WALKTHROUGH.md` | `EXEC_` | 2026-04-22 | **GPU 烟花引擎迁移交付验证汇报**。包含静态类型检查、同屏 80,000+ 粒子跑测及交互响应验证。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/docs/EXEC_20260422_GPU_MIGRATION_WALKTHROUGH.md) |
| 10 | `EXEC_20260521_DOCUMENT_OPTIMIZATION_PLAN.md` | `EXEC_` | 2026-05-21 | **文档重构会话执行方案**。本次文档管理规范化整理的决策与方案书。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/docs/EXEC_20260521_DOCUMENT_OPTIMIZATION_PLAN.md) |
| 11 | `EXEC_20260521_DOCUMENT_OPTIMIZATION_TASK.md` | `EXEC_` | 2026-05-21 | **文档重构会话进度清单**。伴随重构操作的实时 TODO task 任务进度清单。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/docs/EXEC_20260521_DOCUMENT_OPTIMIZATION_TASK.md) |
| 12 | `EXEC_20260521_DOCUMENT_OPTIMIZATION_WALKTHROUGH.md`| `EXEC_` | 2026-05-21 | **文档重构交付验证汇报**。记录重命名映射 100% 字节无损核算、构建跑测及 GitHub 同步状态的交付总结。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/docs/EXEC_20260521_DOCUMENT_OPTIMIZATION_WALKTHROUGH.md) |
| 13 | `HIST_20260422_PROJECT_REBRANDING_AND_PORT_RESOLUTION_LOG.md` | `HIST_` | 2026-04-22 | **项目更名与启动器端口弹性解碰编年史**。基于真实 AI 协同会话历史，以北京时间真实还原项目重命名、Mac启动器路径错误及Vite专属端口碰撞排查与自适应自愈优化历程。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/docs/HIST_20260422_PROJECT_REBRANDING_AND_PORT_RESOLUTION_LOG.md) |
| 14 | `EXEC_20260422_FIREWORK_INTERACTION_PLAN.md` | `EXEC_` | 2026-04-22 | **点击燃放烟花失效修复实施方案**。诊断音乐模式下呼吸涟漪圆环手势物理遮挡、坐标透传缺失等交互痛点并设计靶向修复方案。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/docs/EXEC_20260422_FIREWORK_INTERACTION_PLAN.md) |
| 15 | `EXEC_20260422_FIREWORK_INTERACTION_TASK.md` | `EXEC_` | 2026-04-22 | **点击燃放烟花失效修复任务进度清单**。伴随交互修复会话的原子化 TODO task 进度跟踪，状态均 100% 交付通过。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/docs/EXEC_20260422_FIREWORK_INTERACTION_TASK.md) |
| 16 | `EXEC_20260422_FIREWORK_INTERACTION_WALKTHROUGH.md` | `EXEC_` | 2026-04-22 | **点击燃放烟花失效修复交付验证汇报**。包含点击事件在常规模式与音乐模式下的响应流程验证、Surgical Changes 核心 Diff 还原及两阶段去禅意重构的回归说明。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/docs/EXEC_20260422_FIREWORK_INTERACTION_WALKTHROUGH.md) |
| 17 | `EXEC_20260511_FIREWORK_ENGINE_REBUILD_PLAN.md` | `EXEC_` | 2026-05-11 | **烟花引擎审计与重构会话实施方案**。详细规划了 P0-P3 BUG 修复与对标 Qianshu-Rhythm 的物理与后处理管线升级设计。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/docs/EXEC_20260511_FIREWORK_ENGINE_REBUILD_PLAN.md) |
| 18 | `EXEC_20260511_FIREWORK_ENGINE_REBUILD_TASK.md` | `EXEC_` | 2026-05-11 | **烟花引擎审计与重构会话进度清单**。伴随着整个重构和极简化清理会话的详细原子化 TODO task 进度跟踪，状态均 100% 交付通过。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/docs/EXEC_20260511_FIREWORK_ENGINE_REBUILD_TASK.md) |
| 19 | `EXEC_20260511_FIREWORK_ENGINE_REBUILD_WALKTHROUGH.md` | `EXEC_` | 2026-05-11 | **烟花引擎审计与重构交付验证汇报**。包含物理顶点/片元着色器重构、古筝防止自激环路、Shadcn 清理与 Tone.js 卸载包体大小优化等 100% 亮绿灯的交付报告。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/docs/EXEC_20260511_FIREWORK_ENGINE_REBUILD_WALKTHROUGH.md) |
| 20 | `AUDIT_20260604_FIREWORK_PHYSICS_AND_SHADERS_GAP.md` | `AUDIT_` | 2026-06-04 | **烟火物理与渲染管线差距审计报告**。深度对比 Qianshu v6.0 的速度积分、动态切线拖尾、燃烧材料与二阶段母星空中裂变机制，指出 KaleidoFire 当前的 3 项 BUG 与 4 项物理渲染差距。 | [查看文档](file:///Users/quantumrose/Documents/Emberois/KaleidoFire/docs/AUDIT_20260604_FIREWORK_PHYSICS_AND_SHADERS_GAP.md) |

---

> [!TIP]
> 文档索引表在每次大模型开发会话启动和交付时，均应由 `Documenter` 进行首轮审计与同步维护，确保项目脉络不出现任何“黑盒断层”。

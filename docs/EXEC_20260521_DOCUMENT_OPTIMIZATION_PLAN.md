# 归档整理会话 — 实施方案书 (EXEC_PLAN)
> **会话主题**: KaleidoFire 本地项目文档管理规范化重构  
> **执行依据**: SPEC_20260520_GLOBAL_DEVELOPMENT_STANDARDS.md  
> **会话时间**: 2026-05-21  
> **协同角色**: Planner & Documenter  

---

## 📖 设计痛点与重构初衷

在项目迭代过程中，随着架构升级与 Bug 调试，产生了多个关键的设计、审计与历程文档。但在整理之前，这些文档呈零散分布状态：
1. 部分文档存在于根目录下（如 `DEVELOPMENT_LOG.md`, `info.md`），使项目目录显得凌乱，且缺乏明确的文件类别前缀。
2. 另一部分文档位于 `dev-docs/`，未能按照统一的“分类+日期+英文英文大写”命名公式（例如 `[CATEGORY_PREFIX]_[YYYYMMDD]_[DOCUMENT_NAME].md`）命名，导致物理排序无序，不便于后期快速时间线溯源与 AI 接力开发。

为了解决这一痛点，我们启动本次优化整理会话，在不对任何业务代码做任何破坏性更改的红线下，将所有本地项目开发文档进行 100% 格式对齐和规范归拢。

---

## 🛠️ 方案细节与物理映射表

我们规划将根目录与 `dev-docs/` 下的所有文档归并至新建的 `/docs` 扁平池目录。由于这些文档本身由 Git 追踪，为保持版本开发日志历史的纯净和文件迁移的透明度，我们将全部使用 `git mv` 进行物理搬运与重命名：

```
[旧物理路径]                              [新物理路径与重命名 (位于 /docs)]
DEVELOPMENT_LOG.md                ───> docs/HIST_20260514_DEVELOPMENT_LOG.md
info.md                           ───> docs/SPEC_20260520_ENVIRONMENT_INFO.md
dev-docs/gpu-migration-plan.md    ───> docs/SPEC_20260422_GPU_MIGRATION_PLAN.md
dev-docs/bugfix-2026-05-12.md     ───> docs/AUDIT_20260512_FIREWORK_BUGFIX_REPORT.md
dev-docs/firework-calibration.md  ───> docs/AUDIT_20260514_FIREWORK_RENDER_CALIBRATION.md
```

> [!NOTE]
> **分类前缀与日期锚定规则**：
> *   `DEVELOPMENT_LOG.md` 记录的是项目大编年史，故归入历史编年史 `HIST_`。其最新修改锚定在 `20260514`（上一次大优化阶段的结束日期）。
> *   `info.md` 记录组件与环境定义，归入规格说明 `SPEC_`，日期锚定为 `20260520`。
> *   `gpu-migration-plan.md` 记录了核心 GPU 渲染升级的架构设计，归入规格说明 `SPEC_`，日期锚定在其最初发布时间 `20260422`。
> *   `bugfix` 与 `firework-calibration` 均为静态代码审计、差异根因诊断与修复审计案，归入审计报告 `AUDIT_`，日期对应其报告产出时间。

---

## 🎯 协同执行与 GitHub 同步红线

1. **零业务干涉**：绝对不触碰 `/src`、`/public` 等核心业务逻辑与资源文件，只在 `/docs` 物理边界内操作，并在完成后运行 TypeScript 语法检查（确保没有因路径变动引起的任何环境或脚本报错）。
2. **三位一体归档**：在会话完成时，必须生成对应的交付验证汇报（`EXEC_[DATE]_WALKTHROUGH.md`）记录 1:1 字节审计与 Git push 传输详情。
3. **远程同步**：以标准规范格式 `docs: optimize documentation structure and registry` 提交至 Git 并在主分支同步推送至 GitHub，维护云端库的绝对一致性。

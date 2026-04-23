# SEUOJ Frontend

基于 React 18 / TypeScript 5.6 / Vite 5 的单页应用，为 SEUOJ 在线评测系统提供用户界面。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18、TypeScript 5.6、Vite 5 |
| 样式 | Tailwind CSS、shadcn/ui（Radix UI） |
| 状态管理 | Redux Toolkit + redux-persist（客户端状态）、TanStack React Query（服务端状态） |
| 表单 | react-hook-form + zod |
| 代码编辑器 | Monaco Editor（@monaco-editor/react） |
| 渲染 | react-markdown + remark-gfm + rehype-katex（Markdown/LaTeX） |
| 图表 | recharts、d3-force（知识图谱可视化） |
| 拖拽 | @dnd-kit |
| 其他 | axios、date-fns、xlsx（Excel 导入导出）、react-helmet-async、sonner（Toast） |

## 快速开始

```bash
# 要求 Node.js 18.x（推荐 18.20.2）
nvm use          # 读取 .nvmrc
npm install
npm run dev      # 开发服务器 → http://localhost:5173
npm run build    # tsc + vite 构建
npm run lint     # eslint 检查
```

## 项目结构

```
src/
├── app/                        # Redux store 配置
├── assets/                     # 静态资源
├── components/
│   ├── bussiness/              # 业务组件（61 个）
│   ├── common/                 # 通用组件（20 个）
│   │   ├── AIChat.tsx          #   AI 对话组件
│   │   ├── AIChatWidget.tsx    #   AI 悬浮助手
│   │   ├── MarkdownRenderer.tsx #  Markdown/KaTeX 渲染
│   │   ├── NavBar.tsx          #   导航栏
│   │   ├── SearchBox.tsx       #   搜索框
│   │   └── ...
│   ├── pages/                  # 页面组件（38 个）
│   ├── profile/                # 个人资料组件
│   └── ui/                     # shadcn/ui 基础组件（27 个）
├── config/                     # 环境变量配置（env.ts）
├── features/                   # Redux 功能模块
│   ├── auth/                   #   认证
│   ├── Code/                   #   代码编辑
│   ├── ContestList/            #   比赛列表
│   ├── ProblemList/            #   题目列表
│   ├── SubmissionList/         #   提交记录
│   ├── Tags/                   #   标签
│   ├── heatmap/                #   提交热力图
│   └── verification/           #   邮箱验证
├── hooks/                      # 自定义 Hooks（14 个，含 React Query 封装）
├── layouts/                    # 布局组件（AuthLayout、MainLayout）
├── lib/                        # 工具函数
├── services/                   # API 服务层（Axios 封装）
│   ├── Assignment/             #   作业 API（9 个接口）
│   ├── Class/                  #   班级 API（23 个接口）
│   ├── Contest/                #   比赛 API（13 个接口）
│   ├── Problem/                #   题目 API
│   ├── ProblemSet/             #   题单 API（6 个接口）
│   ├── Submission/             #   提交记录 API
│   ├── agent/                  #   AI 智能体 API
│   ├── ai/                     #   AI 服务（Agent Chat、知识学习）
│   ├── api/                    #   Axios 实例与 Token 管理
│   ├── file/                   #   文件上传 API
│   └── user/                   #   用户 API（批量导入、热力图、个人资料）
└── types/                      # 全局类型定义（Zod schema）
```

## 功能模块

| 模块 | 页面 | 说明 |
|------|------|------|
| 题目管理 | ProblemsLibraryPage、ProblemDetailPage、ProblemCreatePage、ProblemEditPage、ProblemJudgeConfigPage、ProblemTestFilePage | 题库浏览、题目详情（Monaco 编辑器 + Markdown 渲染）、题目创建与编辑、评测配置、测试数据管理 |
| 比赛 | CompetitionPage、ContestListDetailPage、ContestProblemDetailPage、ContestSubmissionPage、ContestSubmissionListPage、CreateContestPage、ContestEditPage | 比赛列表、详情、题目、提交、排名、创建与编辑 |
| 班级教学 | ClassPage、ClassDetailPage | 班级管理、成员管理、公告、关联比赛/题单 |
| 作业 | AssignmentDetailPage | 作业详情与提交 |
| 题单 | ProblemSetListPage、ProblemSetDetailPage、ProblemSetCreatePage、ProblemSetUpdatePage | 题单浏览、详情、创建与编辑 |
| AI 辅助 | AgentChatPage、ProblemAgentPage、KnowledgeGraphPage、LearningChainPage | AI 对话、题目智能辅导、知识图谱可视化、学习路径 |
| 用户 | LoginPage、SignupPage、ForgetPage、PersonalPage、UserProfilePage、AdminUserManagementPage | 认证、个人主页、资料编辑、管理员用户管理 |
| 其他 | HomePage、EvaluationPage、RankPage、DiscussionPage、HelpPage、SubmissionPage、NotFoundPage、UnauthorizedPage | 首页、评测记录、排名、讨论、帮助等 |

## Environment (Develoment)

- Node.js: **18.20.2**
- npm: **10.5.0**
请先确保你已经下载nvm
```bash
nvm install 18.20.2
nvm use 18.20.2

npm install
npm run dev
```
第一次进度：（暂时没有前后端交互 待后续完善 已经预留接口）
1. 登陆注册等页面（交互待完善）
2. 可访问`http://localhost:5173/problemsLibrary/1` 题目详情 latex分行待后续完善
3. `http://localhost:5173/submission/1`提交记录 



## 文件结构

```
seuoj-frontend/
├── public/                         # 静态资源目录
├── src/                            # 源代码目录
│   ├── app/                        # Redux 状态管理配置
│   │   ├── store.ts                # Redux store 配置，包含持久化设置
│   │   └── hooks.ts                # Redux 自定义 hooks (useAppDispatch, useAppSelector)
│   │
│   ├── assets/                     # 静态资源文件（图片、SVG 等）
│   │
│   ├── components/                 # 组件目录
│   │   ├── bussiness/             # 业务组件（特定功能的复杂组件）
│   │   │
│   │   ├── common/                # 通用组件（可复用的基础组件）
│   │   │
│   │   ├── pages/                 # 页面组件
│   │   │   ├── HomePage.tsx       # 首页
│   │   │   ├── ProblemsLibraryPage.tsx # 题库页
│   │   │   ├── ProblemDetailPage.tsx # 题目详情页
│   │   │   ├── SubmissionPage.tsx # 提交记录详情页
│   │   │   ├── CompetitionPage.tsx # 比赛页
│   │   │   ├── EvaluationPage.tsx # 评测页
│   │   │   ├── RankPage.tsx       # 排名页
│   │   │   ├── DiscussionPage.tsx # 讨论页
│   │   │   ├── HelpPage.tsx       # 帮助页
│   │   │   ├── LoginPage.tsx      # 登录页
│   │   │   ├── SignupPage.tsx     # 注册页
│   │   │   ├── ForgetPage.tsx     # 找回密码页
│   │   │   └── NotFoundPage.tsx   # 404 页面
│   │   │
│   │   └── ui/                    # shadcn/ui 组件库（基础 UI 组件）
│   │       ├── accordion.tsx      # 手风琴组件
│   │       ├── avatar.tsx         # 头像组件
│   │       ├── badge.tsx          # 徽章组件
│   │       ├── button.tsx         # 按钮组件
│   │       ├── card.tsx           # 卡片组件
│   │       ├── dropdown-menu.tsx  # 下拉菜单
│   │       ├── form.tsx           # 表单组件（基于 react-hook-form）
│   │       ├── input.tsx          # 输入框
│   │       ├── label.tsx          # 标签
│   │       ├── navigation-menu.tsx # 导航菜单
│   │       ├── separator.tsx      # 分割线
│   │       ├── skeleton.tsx       # 骨架屏
│   │       ├── sonner.tsx         # Toast 通知
│   │       ├── table.tsx          # 表格组件
│   │       ├── textarea.tsx       # 文本域
│   │       └── tooltip.tsx        # 提示框
│   │
│   ├── config/                     # 配置文件
│   │   └── env.ts                 # 环境变量配置（API 基础地址等）
│   │
│   ├── features/                   # Redux 功能模块（按业务划分）
│   │   └── auth/                  # 认证模块
│   │       ├── authSlice.ts       # 认证状态管理（登录、注册、登出）
│   │       └── types.ts           # 认证相关类型定义
│   │
│   ├── hooks/                      # 自定义 Hooks
│   │   ├── useDebounced.ts         # 防抖 Hook
│   │   └── useSetWebTitle.ts       # 动态设置页面标题
│   │
│   ├── layouts/                    # 布局组件
│   │   ├── AuthLayout.tsx          # 认证页面布局（登录/注册/找回密码）
│   │   └── MainLayout.tsx          # 主应用布局（带导航栏）
│   │
│   ├── lib/                        # 工具库
│   │   └── utils.ts                # 工具函数（cn 等）
│   │
│   ├── services/                   # API 服务层（未来的 Axios 请求封装）
│   │
│   ├── types/                      # 全局类型定义
│   │   ├── login_schema.ts         # 登录表单验证 schema（Zod）
│   │   ├── signup_schema.ts        # 注册表单验证 schema（Zod）
│   │   └── forget_schema.ts        # 找回密码表单验证 schema（Zod）
│   │
│   ├── App.tsx                     # 根组件（路由配置）
│   ├── main.tsx                    # 应用入口（React 渲染 + Provider 配置）
│   ├── index.css                   # 全局样式（Tailwind CSS 基础配置）
│   └── vite-env.d.ts               # Vite 类型声明
│
├── .dockerignore                   # Docker 忽略文件
├── .gitignore                      # Git 忽略文件
├── .nvmrc                          # Node 版本配置
├── components.json                 # shadcn/ui 配置文件
├── Dockerfile                      # Docker 构建配置（多阶段构建）
├── eslint.config.js                # ESLint 配置
├── index.html                      # HTML 入口文件
├── LICENSE                         # MIT 许可证
├── package.json                    # 项目依赖配置
├── postcss.config.js               # PostCSS 配置
├── README.md                       # 项目说明文档
├── tailwind.config.js              # Tailwind CSS 配置
├── tsconfig.json                   # TypeScript 配置
├── tsconfig.app.json               # TypeScript 应用配置
├── tsconfig.node.json              # TypeScript Node 配置
├── vite.config.ts                  # Vite 构建配置
└── 各模块介绍.md                     # 各技术栈详细说明文档
```


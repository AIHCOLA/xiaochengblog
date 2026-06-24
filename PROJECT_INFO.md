# Xiao Cheng Blog

> 小橙博客前端 — 基于 React 19 + TypeScript + Vite 8 的个人博客

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | React 19.2 |
| 语言 | TypeScript 6.0 |
| 构建工具 | Vite 8 |
| 路由 | React Router v7 |
| HTTP 请求 | Axios |
| 图标 | Lucide React |
| 图表 | Recharts |
| 拖拽 | @dnd-kit |
| 搜索 | Fuse.js |
| Markdown 渲染 | react-markdown + remark-gfm + rehype-highlight |
| 桌面宠物 | Live2D Widget |
| 样式方案 | 纯 CSS (无 UI 框架) |

## 功能模块

### 博客浏览
- **首页** — 精选文章、个人卡片、仪表盘组件
- **文章列表** — 分页浏览全部文章
- **文章详情** — Markdown 渲染、代码高亮、目录导航
- **分类页** — 按分类筛选文章
- **标签页** — 按标签筛选文章
- **归档页** — 按时间线浏览文章
- **搜索页** — 全文搜索文章

### 用户系统
- **登录/注册** — 邮箱登录、OAuth2 三方登录（GitHub、Google、微信）
- **个人中心** — 用户资料展示
- **历史记录** — 阅读历史
- **收藏** — 收藏文章管理
- **设置** — 个人偏好设置

### 仪表盘组件
- 可拖拽排序的个性化仪表盘，支持以下卡片：
  - **天气卡片** — 当前位置天气
  - **心情日历** — 每日 emoji 打卡
  - **待办事项** — Todo 列表
  - **倒计时** — 自定义事件倒计时
  - **快捷链接** — 个人书签
  - **便签** — 个人便签
  - **健康提醒** — 喝水、久坐等提醒
  - **番茄钟** — 专注计时器
  - **闪卡** — 知识点记忆卡片
  - **随机文章** — 随机推荐
  - **搜索卡片** — 快速搜索
  - **AI 聊天** — AI 对话
  - **黑胶唱片** — 音乐播放器
  - **站点统计** — 博客数据统计
  - **每日一言** — 名言展示

### 交互功能
- **评论系统** — 文章评论与回复
- **点赞** — 文章点赞
- **留言板** — 公开留言
- **桌面宠物** — Live2D 看板娘
- **音乐播放** — 网易云音乐播放列表

### 其他
- **暗色/亮色主题** — 支持切换，刷新不闪烁
- **响应式布局** — 适配桌面端和移动端
- **路由懒加载** — 所有页面按需加载，首屏优化

## 项目结构

```
xiaochengblog/
├── index.html                  # HTML 入口
├── package.json                # 依赖与脚本
├── vite.config.ts              # Vite 配置（含代理）
├── tsconfig.json               # TypeScript 配置
├── eslint.config.js            # ESLint 配置
├── Dockerfile                  # Docker 多阶段构建
├── nginx.conf                  # Nginx 配置（生产环境）
└── src/
    ├── main.tsx                # 应用入口
    ├── App.tsx                 # 根组件（路由、Context Provider）
    ├── api/                    # API 请求函数
    │   ├── client.ts           # Axios 实例（baseURL, 拦截器）
    │   ├── auth.ts             # 认证相关
    │   ├── posts.ts            # 文章
    │   ├── comments.ts         # 评论
    │   ├── categories.ts       # 分类
    │   ├── tags.ts             # 标签
    │   ├── favorites.ts        # 收藏
    │   ├── history.ts          # 阅读历史
    │   ├── guestbook.ts        # 留言板
    │   ├── moods.ts            # 心情
    │   ├── todos.ts            # 待办
    │   ├── countdowns.ts       # 倒计时
    │   ├── flashcards.ts       # 闪卡
    │   ├── healthReminders.ts  # 健康提醒
    │   ├── quickLinks.ts       # 快捷链接
    │   ├── stickyNote.ts       # 便签
    │   ├── chatHistory.ts      # AI 聊天
    │   ├── music.ts            # 音乐搜索
    │   ├── musicPlaylist.ts    # 播放列表
    │   └── weather.ts          # 天气
    ├── components/
    │   ├── article/            # 文章相关组件
    │   ├── author/             # 作者信息组件
    │   ├── dashboard/          # 仪表盘系统
    │   ├── interaction/        # 交互组件（天气、待办、评论等）
    │   ├── layout/             # 布局组件（Header, Footer, Sidebar）
    │   └── ui/                 # 通用 UI 组件
    ├── context/                # React Context 状态管理
    │   ├── ThemeContext.tsx     # 主题
    │   ├── AuthContext.tsx      # 认证状态
    │   ├── FavoritesContext.tsx # 收藏状态
    │   ├── PostsContext.tsx     # 文章列表缓存
    │   ├── MusicPlayerContext.tsx # 音乐播放器
    │   └── ToastContext.tsx     # Toast 通知
    ├── hooks/                  # 自定义 Hooks
    ├── pages/                  # 页面组件（16 个页面）
    ├── styles/                 # 全局样式
    │   ├── globals.css         # 全局 CSS + CSS 变量（主题色）
    │   └── markdown.css        # Markdown 渲染样式
    ├── types/                  # TypeScript 类型定义
    └── utils/                  # 工具函数
```

## 启动方式

### 前置条件

- Node.js 18+
- 后端服务 `xiaochengblog-server` 已启动（端口 8080）

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

开发服务器默认运行在 `http://localhost:5173`。

Vite 已配置代理，`/api`、`/oauth2`、`/login/oauth2` 请求会自动转发到后端 `http://localhost:8080`。

### 3. 生产构建

```bash
npm run build     # 输出到 dist/
npm run preview   # 预览构建结果，默认 http://localhost:4173
```

### 4. Docker 部署

```bash
docker build -t xiaochengblog .
docker run -p 80:80 xiaochengblog
```

Dockerfile 采用多阶段构建：
- **构建阶段**: Node.js 20 Alpine，编译产出 `dist/`
- **运行阶段**: Nginx Alpine，通过 nginx.conf 反向代理 `/api` 到后端 `server:8080`

## 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 精选文章 + 仪表盘 |
| `/articles` | 文章列表 | 分页浏览 |
| `/article/:slug` | 文章详情 | Markdown 渲染 |
| `/category/:slug` | 分类页 | 按分类筛选 |
| `/tag/:slug` | 标签页 | 按标签筛选 |
| `/archive` | 归档页 | 时间线浏览 |
| `/search` | 搜索页 | 全文搜索 |
| `/guestbook` | 留言板 | 公开留言 |
| `/login` | 登录 | 邮箱 + OAuth2 |
| `/register` | 注册 | 邮箱注册 |
| `/profile` | 个人中心 | 用户资料 |
| `/history` | 历史记录 | 阅读历史 |
| `/publish` | 发布文章 | 写作/编辑 |
| `/publish/:slug` | 编辑文章 | 编辑已有文章 |
| `/oauth/callback` | OAuth 回调 | 三方登录回调 |
| `/settings` | 设置 | 个人偏好 |
| `*` | 404 | 页面不存在 |

## 关键技术点

- **主题切换**: 通过 `data-theme` 属性 + CSS 变量实现，内联脚本在 HTML 中提前读取 localStorage 防止刷新闪烁
- **路由懒加载**: 所有页面使用 `React.lazy()` + `Suspense` 按需加载，减少首屏体积
- **状态管理**: 使用 React Context 管理全局状态（认证、收藏、主题、音乐播放器），无需引入 Redux 等第三方库
- **API 代理**: 开发环境通过 Vite proxy 转发到后端，生产环境通过 Nginx 反向代理
- **仪表盘系统**: 基于卡片注册表（cardRegistry）的可拖拽仪表盘，支持自定义布局和卡片增删
- **认证流程**: JWT 通过 httpOnly Cookie 自动携带，前端无需手动管理 Token

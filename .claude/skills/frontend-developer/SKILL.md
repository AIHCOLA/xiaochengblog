---
name: frontend-developer
description: 前端开发工程师 — 负责 React/TypeScript 编码：组件、状态管理、API 集成、路由。修改 xiaochengblog 项目时使用此技能。
---

# 前端开发工程师

你是 React 前端开发，负责 xiaochengblog 项目的所有前端代码。

## 技术栈

- **框架**：React 19, React Router 7
- **语言**：TypeScript 6
- **构建**：Vite 8，`npm run dev` 启动开发服务器
- **HTTP**：Axios，`src/api/client.ts` 统一配置
- **样式**：CSS Modules（`*.module.css`）
- **图标**：Lucide React
- **端口**：5173（开发）

## 项目结构

```
src/
├── api/             # API 调用函数（auth, posts, comments, music 等）
│   └── client.ts    # Axios 实例，拦截器，token 管理
├── components/
│   ├── interaction/ # 交互组件（VinylPlayer, AIChat, Guestbook 等）
│   ├── layout/      # 布局组件（Header, Layout, Footer）
│   └── ui/          # UI 基础组件（Button, Input, Toast 等）
├── context/         # React Context（Auth, Theme, Posts, Favorites, Toast）
├── hooks/           # 自定义 Hooks
├── pages/           # 页面组件
├── styles/          # 全局样式
├── types/           # TypeScript 类型定义
└── utils/           # 工具函数
```

## 编码规范

1. **API 层**：每个资源一个文件（`api/auth.ts`, `api/posts.ts`），导出 async 函数
2. **状态管理**：用 React Context + useReducer 或 useState，通过 Provider 包裹
3. **路由**：React Router v7，页面组件在 `App.tsx` 中定义 Route
4. **样式**：CSS Modules，`import styles from './Xxx.module.css'`，用 `styles.className`
5. **类型**：`types/index.ts` 定义公共类型，API 特有类型在 api 文件中定义
6. **认证**：`AuthContext` 暴露 `user`, `isLoggedIn`, `isAdmin`, `login`, `register`, `logout`, `handleOAuthCallback`
7. **权限**：`isAdmin`（`user?.role === 'ADMIN'`）控制管理功能可见性

## 认证流程

- **邮箱登录**：POST `/api/auth/login` → 存 JWT 到 localStorage → 设置 user 状态
- **OAuth2 登录**：前端跳转 `/api/auth/oauth2/authorize/{provider}` → 后端重定向到提供商 → 回调到 `/oauth/callback?token=xxx` → 前端提取 token 存 localStorage
- **Token 管理**：`api/client.ts` 的请求拦截器自动附加 `Authorization: Bearer`，响应拦截器处理 401 自动跳转登录页

## 开发代理

Vite 配置了以下代理（`vite.config.ts`）：
- `/api` → `http://localhost:8080`
- `/oauth2` → `http://localhost:8080`
- `/login` → `http://localhost:8080`

## 服务管理

**每次启动开发服务器测试后，必须在测试结束时关闭服务**：

```bash
# 查找端口 5173 的进程
netstat -ano | grep ':5173' | grep LISTENING
# 关闭进程（替换 <PID>）
taskkill //PID <PID> //F
```

## 注意

- 前端开发服务器在 5173 端口，后端在 8080，通过 Vite proxy 避免跨域
- `api/client.ts` 的 `baseURL` 已改为相对路径 `/api`，不要用 `localhost:8080`
- OAuth 回调页路由是 `/oauth/callback`，后端成功后重定向到这里

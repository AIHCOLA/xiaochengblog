---
name: qa-engineer
description: 测试工程师 — 负责编译检查、服务启动测试、API 验证、功能回归测试。开发完成后或修改代码后使用此技能验证。
---

# 测试工程师

你是项目测试工程师，负责验证代码质量和功能正确性。

## 测试流程

### 1. 编译检查

```bash
# 后端编译
cd /c/Users/20823/xiaochengblog-server && mvn compile

# 前端类型检查
cd /c/Users/20823/xiaochengblog && npx tsc --noEmit
```

### 2. 服务启动测试

```bash
# 启动后端（后台运行，等待 25 秒）
cd /c/Users/20823/xiaochengblog-server && mvn spring-boot:run &
sleep 25

# 验证健康状态
curl http://localhost:8080/api/posts
# 期望：200 + JSON 数据
```

### 3. API 功能测试

| 端点 | 方法 | 说明 | 预期 |
|------|------|------|------|
| `/api/posts` | GET | 公开 | 200 |
| `/api/auth/login` | POST | 登录 | 200 + token |
| `/api/auth/register` | POST | 注册 | 200 + token |
| `/api/posts` | POST | 需 ADMIN | USER 返回 403 |
| `/api/user/profile` | GET | 需认证 | 200 |

### 4. 权限测试

1. 用 ADMIN 账号登录 → POST `/api/posts` → 201
2. 注册新 USER 账号 → POST `/api/posts` → 403
3. USER 访问 GET `/api/posts` → 200（公开端点不受影响）
4. USER 访问 GET `/api/user/profile` → 200（个人端点正常）

### 5. 清理

**测试完成后必须关闭所有服务**：
```bash
# 查找并关闭端口占用
netstat -ano | grep -E ':8080|:3000|:5173' | grep LISTENING
taskkill //PID <pid> //F
```

## 已知服务端口

| 端口 | 服务 | 项目 |
|------|------|------|
| 8080 | Spring Boot 后端 | xiaochengblog-server |
| 3000 | 网易云音乐 API | xiaochengblog-server/music-api |
| 5173 | Vite 前端开发服务器 | xiaochengblog |

## 常见问题

- **`redirectUri cannot be empty`**：OAuth2 自定义 provider 缺少 redirect-uri 配置
- **`Error creating bean 'dataInitializer'`**：schema.sql 中 ALTER TABLE 语句在新建表时失败
- **端口被占用**：上一个测试进程未关闭，用 taskkill 杀掉

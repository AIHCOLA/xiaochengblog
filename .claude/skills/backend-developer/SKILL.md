---
name: backend-developer
description: 后端开发工程师 — 负责 Spring Boot/Java 编码：数据库、API、安全、OAuth2 集成。修改 xiaochengblog-server 项目时使用此技能。
---

# 后端开发工程师

你是 Spring Boot 后端开发，负责 xiaochengblog-server 项目的所有 Java 代码。

## 技术栈

- **框架**：Spring Boot 3.2.5, Spring Security 6.1, MyBatis-Plus 3.5.10
- **语言**：Java 17
- **构建**：Maven，`mvn compile` / `mvn spring-boot:run`
- **数据库**：MySQL，schema.sql 定义表结构，`spring.sql.init.mode: always`
- **端口**：8080

## 项目结构

```
src/main/java/com/xiaochengblog/
├── config/          # SecurityConfig, DataInitializer, WechatOAuth2Config, CorsConfig
├── controller/      # REST 控制器
├── dto/             # 请求/响应 DTO
├── exception/       # 异常处理
├── mapper/          # MyBatis Mapper 接口
├── model/           # 实体类
├── security/        # JWT, OAuth2 自定义类
│   └── oauth2/      # 微信 OAuth2 适配器
└── service/         # 业务逻辑层
```

## 编码规范

1. **模型层**：Lombok `@Data` + `@Builder`，`@TableName` 映射表名
2. **Mapper**：继承 `BaseMapper<T>`，自定义查询用 `@Select` 注解
3. **Service**：`@Service` + `@RequiredArgsConstructor`，用构造器注入
4. **Controller**：`@RestController` + `@RequestMapping`，返回 `ApiResponse<T>` 统一响应格式
5. **安全**：JWT 过滤器从 token 提取 userId/email/role，构建 authorities
6. **OAuth2**：自定义 OAuth2UserService 自动注册用户，SuccessHandler 生成 JWT 重定向前端
7. **DTO**：`ApiResponse<T>` 统一封装 `{code, message, data}`，前端拦截器自动解包

## 常用操作

- 编译：`mvn compile`
- 启动：`mvn spring-boot:run`
- 测试 API：`curl http://localhost:8080/api/posts`
- 数据库迁移：手动执行 ALTER TABLE（或删库重建让 schema.sql 自动创建）

## 服务管理

**每次启动服务测试后，必须在测试结束时关闭服务**：

```bash
# 查找端口 8080 的进程
netstat -ano | grep ':8080' | grep LISTENING
# 关闭进程（替换 <PID>）
taskkill //PID <PID> //F
```

## 注意事项

- MyBatis-Plus 自动映射驼峰到下划线（`oauth2Provider` → `oauth2_provider`）
- 密码用 BCrypt 编码
- JWT token 包含 `sub`(userId), `email`, `role` 三个 claims
- 所有 API 响应都经过 `ApiResponse` 包装，前端 client.ts 拦截器自动解包
- `spring-boot-starter-oauth2-client` 无需指定版本号，父 POM 管理

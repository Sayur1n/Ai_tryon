# 脚本使用说明

## 创建商家和管理员用户

### 方法1：使用npm脚本（推荐）

```bash
npm run create-merchant-user
```

### 方法2：直接运行TypeScript文件

```bash
npx tsx scripts/create-merchant-user.ts
```

### 方法3：使用SQL脚本

```bash
# 连接到数据库后执行
psql -d your_database -f scripts/create-merchant-user.sql
```

## 创建的用户信息

### 商家用户
- **邮箱**: merchant@example.com
- **密码**: password
- **角色**: merchant
- **访问路径**: /merchant

### 管理员用户
- **邮箱**: admin@example.com
- **密码**: password
- **角色**: admin
- **访问路径**: /admin

## 功能说明

### 商家管理页面 (/merchant)
- 用户管理：管理所有用户
- 服装管理：上传和管理服装卡片数据
- 模特管理：管理默认模特数据

### 管理员页面 (/admin)
- 用户管理：管理所有用户，包括封禁/解封功能

## 注意事项

1. 确保数据库连接正常（DATABASE_URL环境变量已设置）
2. 脚本会自动检查用户是否已存在，避免重复创建
3. 密码使用bcrypt加密，默认密码为"password"
4. 所有用户邮箱都已验证，可以直接登录

## 其他脚本

### 插入默认模特数据
```bash
npm run insert-default-models
```

### 列出联系人
```bash
npm run list-contacts
``` 
-- 创建邮箱密码登录用户
-- 1. 首先插入用户记录
INSERT INTO "user" (
    id,
    name,
    email,
    email_verified,
    image,
    created_at,
    updated_at,
    role,
    banned,
    ban_reason,
    ban_expires,
    customer_id
) VALUES (
    'test-user-001',  -- 用户ID
    '测试用户',        -- 用户名
    'test@example.com', -- 邮箱
    true,              -- 邮箱已验证
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', -- 头像
    NOW(),             -- 创建时间
    NOW(),             -- 更新时间
    'user',            -- 角色
    false,             -- 未封禁
    NULL,              -- 封禁原因
    NULL,              -- 封禁过期时间
    NULL               -- 客户ID
);

-- 2. 然后插入账户记录（邮箱密码登录）
INSERT INTO "account" (
    id,
    account_id,
    provider_id,
    user_id,
    access_token,
    refresh_token,
    id_token,
    access_token_expires_at,
    refresh_token_expires_at,
    scope,
    password,
    created_at,
    updated_at
) VALUES (
    'test-account-001',           -- 账户ID
    'test@example.com',           -- 账户ID（邮箱）
    'email',                      -- 提供商ID（email表示邮箱密码登录）
    'test-user-001',              -- 用户ID（关联到上面的用户）
    NULL,                         -- 访问令牌
    NULL,                         -- 刷新令牌
    NULL,                         -- ID令牌
    NULL,                         -- 访问令牌过期时间
    NULL,                         -- 刷新令牌过期时间
    NULL,                         -- 作用域
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- 密码哈希（密码是"password"）
    NOW(),                        -- 创建时间
    NOW()                         -- 更新时间
); 
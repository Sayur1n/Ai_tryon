# Outfit Room 功能实现说明

## 功能概述

本次更新实现了以下功能：

### 1. 改进的OutfitCard组件显示

- **可选图片支持**：模特图、上衣图、下衣图都可以是可选字段
- **智能布局**：
  - 单图：垂直布局，占满整个卡片
  - 双图：水平布局，平分空间
  - 三图：主图+右侧窄条布局
- **优雅的空状态处理**：当没有模特图时显示占位符

### 2. 数据库表设计

创建了 `outfit_room` 表，包含以下字段：

```sql
CREATE TABLE outfit_room (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  model_image_url TEXT,           -- 模特图URL，可选
  top_image_url TEXT,             -- 上衣图URL，可选
  bottom_image_url TEXT,          -- 下衣图URL，可选
  model_image_link TEXT,          -- 模特图链接，可选
  top_image_link TEXT,            -- 上衣图链接，可选
  bottom_image_link TEXT,         -- 下衣图链接，可选
  description TEXT,               -- 描述文本，可选
  sex TEXT NOT NULL,              -- 'male' | 'female'
  type TEXT NOT NULL,             -- 类型标识
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 3. API接口

#### POST /api/outfit-room
商户上传outfit信息的接口

**请求体格式**：
```json
{
  "modelImageUrl": "https://example.com/model.jpg",     // 可选
  "topImageUrl": "https://example.com/top.jpg",         // 可选
  "bottomImageUrl": "https://example.com/bottom.jpg",   // 可选
  "modelImageLink": "https://amazon.com/dp/xxx",        // 可选
  "topImageLink": "https://amazon.com/dp/xxx",          // 可选
  "bottomImageLink": "https://amazon.com/dp/xxx",       // 可选
  "description": "时尚休闲装",                          // 可选
  "sex": "male",                                        // 必填：'male' | 'female'
  "type": "casual"                                      // 必填：类型标识
}
```

**验证规则**：
- 至少需要上传一张图片（模特图、上衣图或下衣图）
- 所有URL必须是有效的URL格式
- 描述文本最大500字符
- 类型标识1-50字符

#### GET /api/outfit-room
获取outfit列表的接口

**查询参数**：
- `sex`: 性别筛选 ('male' | 'female')
- `type`: 类型筛选
- `limit`: 分页大小（默认20）
- `offset`: 偏移量（默认0）

### 4. 测试接口

#### POST /api/outfit-room/test
创建测试数据的接口

#### GET /api/outfit-room/test
获取所有outfit_room数据的接口

## 文件结构

```
src/
├── components/outfit/
│   ├── outfit-card.tsx          # 更新的卡片组件
│   ├── outfit-carousel.tsx      # 更新的轮播组件
│   └── outfit-grid.tsx          # 网格组件
├── app/api/outfit-room/
│   ├── route.ts                 # 主要API接口
│   └── test/route.ts            # 测试API接口
├── db/
│   ├── schema.ts                # 更新的数据库schema
│   └── migrations/              # 数据库迁移文件
├── types/
│   └── outfit-room.ts           # TypeScript类型定义
└── data/
    └── outfit-data.ts           # 更新的数据类型
```

## 使用示例

### 1. 查看更新后的outfit页面
访问 `/outfit` 页面可以看到改进的卡片显示效果

### 2. 测试API接口
```bash
# 创建测试数据
curl -X POST http://localhost:3000/api/outfit-room/test

# 获取所有数据
curl http://localhost:3000/api/outfit-room/test

# 上传新的outfit（需要商户权限）
curl -X POST http://localhost:3000/api/outfit-room \
  -H "Content-Type: application/json" \
  -d '{
    "modelImageUrl": "https://example.com/model.jpg",
    "topImageUrl": "https://example.com/top.jpg",
    "sex": "male",
    "type": "casual"
  }'
```

## 注意事项

1. **权限控制**：目前API接口暂时移除了用户身份验证，实际使用时需要重新添加
2. **图片验证**：建议添加图片格式和大小验证
3. **错误处理**：已实现基本的错误处理和用户友好的错误消息
4. **性能优化**：对于大量数据，建议添加适当的索引和分页

## 后续改进建议

1. 添加图片上传功能
2. 实现完整的用户权限验证
3. 添加图片压缩和优化
4. 实现搜索和筛选功能
5. 添加数据统计和分析功能 
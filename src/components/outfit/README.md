# Outfit Components

这个目录包含了AI虚拟试衣页面的所有组件。

## 组件说明

### OutfitGrid
主要的网格组件，包含：
- 性别筛选功能（全部/男装/女装）
- 结果统计显示
- 响应式网格布局
- 空状态处理

### OutfitCard
单个outfit卡片组件，包含：
- 展示outfit主图片
- 悬停效果和试衣按钮
- 性别标签和商品数量显示
- 点击打开轮播图模态框

### OutfitCarousel
轮播图模态框组件，包含：
- 展示split_images中的图片
- 左右导航箭头
- 图片计数器
- 试衣服按钮（控制台打印URL）
- 购买按钮（跳转到Amazon）

## 功能特性

1. **筛选功能**：支持按性别筛选（全部/男装/女装）
2. **响应式设计**：适配不同屏幕尺寸
3. **多语言支持**：完整的中英文翻译
4. **交互体验**：
   - 卡片悬停效果
   - 轮播图导航
   - 模态框展示
   - 外部链接跳转

## 数据格式

组件使用来自`mock/data.json`的数据，格式如下：

```typescript
interface OutfitData {
  id: string;
  url: string;
  type: string;
  sex: string;
  split_images: SplitImage[];
}

interface SplitImage {
  id: string;
  url: string;
  type: string;
  amazon_url: string;
}
```

## 使用方法

```tsx
import { OutfitGrid } from '@/components/outfit/outfit-grid';
import { outfits } from '@/data/outfit-data';

// 在页面中使用
<OutfitGrid outfits={outfits} />
```

## 翻译处理

所有组件都使用 `useTranslations` hook 来处理多语言翻译，无需手动传递翻译函数。 
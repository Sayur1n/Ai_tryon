import { getDb } from '../src/db';
import { outfitRoom } from '../src/db/schema';
import outfitData from '../mock/data.json';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

interface SplitImage {
  id: string;
  url: string;
  type: string;
  amazon_url: string;
}

interface OutfitData {
  id: string;
  url?: string; // 模特图可选
  type: string;
  sex: string;
  split_images: SplitImage[];
}

async function migrateOutfitData() {
  try {
    console.log('开始迁移outfit数据到数据库...');
    
    // 检查环境变量
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('错误: DATABASE_URL 环境变量未设置');
      process.exit(1);
    }
    
    const db = await getDb();
    
    // 转换数据格式
    const outfitRecords = (outfitData as OutfitData[]).map(outfit => {
      // 分离上衣和下装图片
      const topImage = outfit.split_images.find(img => img.type === 'top');
      const bottomImage = outfit.split_images.find(img => img.type === 'bottom');
      
      return {
        id: outfit.id,
        userId: null, // 系统默认数据，不绑定用户
        modelImageUrl: outfit.url || null, // 模特图URL
        topImageUrl: topImage?.url || null, // 上衣图URL
        bottomImageUrl: bottomImage?.url || null, // 下装图URL
        modelImageLink: null, // 模特图链接，暂时为空
        topImageLink: topImage?.amazon_url || null, // 上衣链接
        bottomImageLink: bottomImage?.amazon_url || null, // 下装链接
        description: `${outfit.sex} ${outfit.type} outfit`, // 描述
        sex: outfit.sex,
        type: outfit.type,
        isDefault: 'true', // 标记为系统默认数据
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    console.log(`准备插入 ${outfitRecords.length} 条outfit数据...`);
    console.log('数据示例:', outfitRecords[0]);

    // 插入数据
    await db.insert(outfitRoom).values(outfitRecords);
    
    console.log(`成功插入 ${outfitRecords.length} 条outfit数据`);
  } catch (error) {
    console.error('迁移outfit数据失败:', error);
    if (error instanceof Error) {
      console.error('错误详情:', error.message);
    }
  } finally {
    process.exit(0);
  }
}

migrateOutfitData(); 
import { getDb } from '../src/db';
import { outfitRoom } from '../src/db/schema';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

async function checkOutfitData() {
  try {
    console.log('检查数据库中的outfit数据...');
    
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('错误: DATABASE_URL 环境变量未设置');
      process.exit(1);
    }
    
    const db = await getDb();
    
    // 获取所有outfit数据
    const allOutfits = await db.select().from(outfitRoom);
    
    console.log(`总outfit数量: ${allOutfits.length}`);
    
    // 显示每个outfit的详细信息
    allOutfits.forEach((outfit, index) => {
      console.log(`\nOutfit ${index + 1}:`);
      console.log('- ID:', outfit.id);
      console.log('- 性别:', outfit.sex);
      console.log('- 类型:', outfit.type);
      console.log('- 描述:', outfit.description || '无描述');
      console.log('- 模特图:', outfit.modelImageUrl || '无');
      console.log('- 上衣图:', outfit.topImageUrl || '无');
      console.log('- 下装图:', outfit.bottomImageUrl || '无');
      console.log('- 上衣链接:', outfit.topImageLink || '无');
      console.log('- 下装链接:', outfit.bottomImageLink || '无');
      console.log('- 是否默认:', outfit.isDefault);
      console.log('- 用户ID:', outfit.userId || '系统默认');
    });
    
  } catch (error) {
    console.error('检查outfit数据失败:', error);
  } finally {
    process.exit(0);
  }
}

checkOutfitData(); 
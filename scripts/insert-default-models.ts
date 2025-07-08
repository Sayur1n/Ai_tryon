import { getDb } from '../src/db';
import { customModel } from '../src/db/schema';
import defaultModels from '../mock/models.json';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

async function insertDefaultModels() {
  try {
    console.log('开始插入默认模特数据...');
    
    // 检查环境变量
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('错误: DATABASE_URL 环境变量未设置');
      console.log('请确保在 .env 文件中设置了 DATABASE_URL');
      console.log('示例: DATABASE_URL=postgresql://username:password@host:port/database');
      process.exit(1);
    }
    
    console.log('数据库连接URL:', databaseUrl.substring(0, 20) + '...');
    
    // 使用项目的数据库连接方式
    const db = await getDb();
    
    // 为每个默认模特创建记录，不绑定用户ID（userId为null）
    const defaultModelRecords = defaultModels.map(model => ({
      id: model.id,
      userId: null, // 默认模特不绑定用户
      name: model.name,
      image: model.image,
      gender: 'female', // 根据模特名称判断，这里先设为female
      style: model.style,
      height: model.height,
      weight: model.weight,
      body: model.body,
      selected: model.selected,
      isCustom: 'false', // 标记为默认模特
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    console.log(`准备插入 ${defaultModelRecords.length} 个默认模特...`);

    // 插入数据
    await db.insert(customModel).values(defaultModelRecords);
    
    console.log(`成功插入 ${defaultModelRecords.length} 个默认模特`);
  } catch (error) {
    console.error('插入默认模特数据失败:', error);
    if (error instanceof Error) {
      console.error('错误详情:', error.message);
    }
  } finally {
    process.exit(0);
  }
}

insertDefaultModels(); 
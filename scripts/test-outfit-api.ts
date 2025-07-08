import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

async function testOutfitAPI() {
  try {
    console.log('测试outfit API...');
    
    // 测试获取outfit列表
    const response = await fetch('http://localhost:3000/api/outfit', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('API响应成功:');
      console.log('总outfit数量:', data.outfits.length);
      
      // 显示前几个outfit的详细信息
      data.outfits.slice(0, 3).forEach((outfit: any, index: number) => {
        console.log(`\nOutfit ${index + 1}:`);
        console.log('- ID:', outfit.id);
        console.log('- 性别:', outfit.sex);
        console.log('- 类型:', outfit.type);
        console.log('- 描述:', outfit.description || '无描述');
        console.log('- 模特图:', outfit.url || '无');
        console.log('- 衣服数量:', outfit.split_images.length);
        outfit.split_images.forEach((img: any) => {
          console.log(`  - ${img.type}: ${img.url}`);
        });
      });
    } else {
      console.error('API请求失败:', response.status, response.statusText);
      const errorData = await response.text();
      console.error('错误详情:', errorData);
    }
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testOutfitAPI(); 
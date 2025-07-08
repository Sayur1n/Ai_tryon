export interface SplitImage {
  id: string;
  url: string;
  type: string;
  amazon_url: string;
}

export interface OutfitData {
  id: string;
  url?: string; // 模特图可选
  type: string;
  sex: string;
  description?: string; // 商品描述
  split_images: SplitImage[];
}

// 服务器端直接数据库查询
async function getOutfitsFromDb(): Promise<OutfitData[]> {
  try {
    const { getDb } = await import('@/db');
    const { outfitRoom } = await import('@/db/schema');
    const { eq, or } = await import('drizzle-orm');
    const { auth } = await import('@/lib/auth');
    
    const db = await getDb();
    
    // 获取所有默认数据（不依赖用户会话）
    const outfits = await db.select().from(outfitRoom).where(
      eq(outfitRoom.isDefault, 'true')
    );
    
    // 转换数据格式
    const formattedOutfits = outfits.map(outfit => ({
      id: outfit.id,
      url: outfit.modelImageUrl || undefined,
      type: outfit.type,
      sex: outfit.sex,
      description: outfit.description || undefined,
      split_images: [
        ...(outfit.topImageUrl ? [{
          id: `${outfit.id}_top`,
          url: outfit.topImageUrl,
          type: 'top',
          amazon_url: outfit.topImageLink || ''
        }] : []),
        ...(outfit.bottomImageUrl ? [{
          id: `${outfit.id}_bottom`,
          url: outfit.bottomImageUrl,
          type: 'bottom',
          amazon_url: outfit.bottomImageLink || ''
        }] : [])
      ]
    }));
    
    return formattedOutfits;
  } catch (error) {
    console.error('Error fetching outfits from database:', error);
    return [];
  }
}

// 客户端API调用
async function getOutfitsFromApi(): Promise<OutfitData[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/outfit`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('getOutfits API响应:', data);
      console.log('getOutfits outfits数据:', data.outfits?.map((o: any) => ({ id: o.id, description: o.description })));
      return data.outfits || [];
    } else {
      console.error('Failed to fetch outfits:', response.status);
      return [];
    }
  } catch (error) {
    console.error('Error fetching outfits:', error);
    return [];
  }
}

// 从API获取outfit数据的函数
export async function getOutfits(): Promise<OutfitData[]> {
  // 检查是否在服务器端
  if (typeof window === 'undefined') {
    // 服务器端：直接查询数据库
    return await getOutfitsFromDb();
  } else {
    // 客户端：使用API调用
    return await getOutfitsFromApi();
  }
}

// 为了向后兼容，保留原有的outfits变量，但改为异步获取
export let outfits: OutfitData[] = [];

// 初始化函数
export async function initializeOutfits() {
  outfits = await getOutfits();
} 
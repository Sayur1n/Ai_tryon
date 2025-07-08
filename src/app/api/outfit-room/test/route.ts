import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { outfitRoom } from '@/db/schema';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    // 获取数据库连接
    const db = await getDb();

    // 创建测试数据
    const testData = {
      id: nanoid(),
      userId: 'test-merchant-id',
      modelImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop',
      topImageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop',
      bottomImageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=400&fit=crop',
      modelImageLink: 'https://www.amazon.com/dp/test-model',
      topImageLink: 'https://www.amazon.com/dp/test-top',
      bottomImageLink: 'https://www.amazon.com/dp/test-bottom',
      description: '测试outfit数据',
      sex: 'male' as const,
      type: 'casual',
    };

    const [newOutfitRoom] = await db
      .insert(outfitRoom)
      .values(testData)
      .returning();

    return NextResponse.json({
      success: true,
      message: '测试数据创建成功',
      data: {
        ...newOutfitRoom,
        createdAt: new Date(newOutfitRoom.createdAt),
        updatedAt: new Date(newOutfitRoom.updatedAt),
      },
    });

  } catch (error) {
    console.error('创建测试数据失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // 获取数据库连接
    const db = await getDb();

    // 获取所有outfit_room数据
    const outfits = await db.select().from(outfitRoom);

    return NextResponse.json({
      success: true,
      count: outfits.length,
      data: outfits.map((outfit: any) => ({
        ...outfit,
        createdAt: new Date(outfit.createdAt),
        updatedAt: new Date(outfit.updatedAt),
      })),
    });

  } catch (error) {
    console.error('获取测试数据失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
} 
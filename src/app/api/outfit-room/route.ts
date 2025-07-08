import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { outfitRoom } from '@/db/schema';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

// 验证请求数据的schema
const createOutfitRoomSchema = z.object({
  modelImageUrl: z.string().url().optional(),
  topImageUrl: z.string().url().optional(),
  bottomImageUrl: z.string().url().optional(),
  modelImageLink: z.string().url().optional(),
  topImageLink: z.string().url().optional(),
  bottomImageLink: z.string().url().optional(),
  description: z.string().max(500).optional(),
  sex: z.enum(['male', 'female']),
  type: z.string().min(1).max(50),
});

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    
    // 验证请求数据
    const validatedData = createOutfitRoomSchema.parse(body);
    
    // 验证至少有一张图片
    if (!validatedData.modelImageUrl && !validatedData.topImageUrl && !validatedData.bottomImageUrl) {
      return NextResponse.json(
        { success: false, error: '至少需要上传一张图片（模特图、上衣图或下衣图）' },
        { status: 400 }
      );
    }

    // 获取数据库连接
    const db = await getDb();

    // 创建outfit_room记录
    const outfitRoomData = {
      id: nanoid(),
      userId: 'temp-user-id', // 临时用户ID，实际应该从session获取
      modelImageUrl: validatedData.modelImageUrl,
      topImageUrl: validatedData.topImageUrl,
      bottomImageUrl: validatedData.bottomImageUrl,
      modelImageLink: validatedData.modelImageLink,
      topImageLink: validatedData.topImageLink,
      bottomImageLink: validatedData.bottomImageLink,
      description: validatedData.description,
      sex: validatedData.sex,
      type: validatedData.type,
    };

    const [newOutfitRoom] = await db
      .insert(outfitRoom)
      .values(outfitRoomData)
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        ...newOutfitRoom,
        createdAt: new Date(newOutfitRoom.createdAt),
        updatedAt: new Date(newOutfitRoom.updatedAt),
      },
    });

  } catch (error) {
    console.error('创建outfit_room失败:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: '请求数据格式错误: ' + error.errors[0].message },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // 获取数据库连接
    const db = await getDb();

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const sex = searchParams.get('sex');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 获取所有outfits（简化查询）
    const outfits = await db.select().from(outfitRoom);

    return NextResponse.json({
      success: true,
      data: outfits.map((outfit: any) => ({
        ...outfit,
        createdAt: new Date(outfit.createdAt),
        updatedAt: new Date(outfit.updatedAt),
      })),
    });

  } catch (error) {
    console.error('获取outfit_room列表失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { outfitRoom } from '@/db/schema';
import { eq, or, isNull } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const db = await getDb();
    
    let outfits;
    
    if (session?.user?.id) {
      // 用户已登录：返回系统默认数据 + 用户自定义数据
      outfits = await db.select().from(outfitRoom).where(
        or(
          eq(outfitRoom.isDefault, 'true'), // 系统默认数据
          eq(outfitRoom.userId, session.user.id) // 用户自定义数据
        )
      );
    } else {
      // 用户未登录：只返回系统默认数据
      outfits = await db.select().from(outfitRoom).where(
        eq(outfitRoom.isDefault, 'true')
      );
    }

    // 调试：打印原始数据
    console.log('API原始数据:', outfits.map(o => ({ id: o.id, description: o.description })));
    
    // 转换数据格式以匹配原有的接口
    const formattedOutfits = outfits.map(outfit => ({
      id: outfit.id,
      url: outfit.modelImageUrl, // 模特图URL
      type: outfit.type,
      sex: outfit.sex,
      description: outfit.description, // 商品描述
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
    
    // 调试：打印格式化后的数据
    console.log('API格式化数据:', formattedOutfits.map(o => ({ id: o.id, description: o.description })));

    return NextResponse.json({ outfits: formattedOutfits });
  } catch (error) {
    console.error('Error fetching outfits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestBody = await request.json();
    const { 
      modelImageUrl, 
      topImageUrl, 
      bottomImageUrl, 
      modelImageLink, 
      topImageLink, 
      bottomImageLink, 
      description, 
      sex, 
      type 
    } = requestBody;

    const db = await getDb();
    
    const newOutfit = await db.insert(outfitRoom).values({
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: session.user.id,
      modelImageUrl,
      topImageUrl,
      bottomImageUrl,
      modelImageLink,
      topImageLink,
      bottomImageLink,
      description,
      sex,
      type,
      isDefault: 'false',
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    return NextResponse.json({ success: true, outfit: newOutfit[0] });
  } catch (error) {
    console.error('Error creating outfit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/server';
import { getDb } from '@/db';
import { outfitRoom } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// 获取服装列表
export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.user.role !== 'merchant' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    
    // 获取所有默认服装数据
    const outfits = await db.select().from(outfitRoom).where(
      eq(outfitRoom.isDefault, 'true')
    );

    return NextResponse.json({ outfits });
  } catch (error) {
    console.error('Error fetching outfits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 创建新服装
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.user.role !== 'merchant' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      modelImageUrl,
      topImageUrl,
      bottomImageUrl,
      modelImageLink,
      topImageLink,
      bottomImageLink,
      description,
      sex,
      type,
      isDefault
    } = body;

    // 验证必填字段
    if (!sex || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();
    
    const newOutfit = await db.insert(outfitRoom).values({
      id: nanoid(),
      modelImageUrl: modelImageUrl || null,
      topImageUrl: topImageUrl || null,
      bottomImageUrl: bottomImageUrl || null,
      modelImageLink: modelImageLink || null,
      topImageLink: topImageLink || null,
      bottomImageLink: bottomImageLink || null,
      description: description || null,
      sex,
      type,
      isDefault: isDefault || 'true'
    }).returning();

    return NextResponse.json({ outfit: newOutfit[0] });
  } catch (error) {
    console.error('Error creating outfit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
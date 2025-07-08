import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/server';
import { getDb } from '@/db';
import { outfitRoom } from '@/db/schema';
import { eq } from 'drizzle-orm';

// 更新服装
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const updatedOutfit = await db.update(outfitRoom)
      .set({
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
      })
      .where(eq(outfitRoom.id, params.id))
      .returning();

    if (updatedOutfit.length === 0) {
      return NextResponse.json({ error: 'Outfit not found' }, { status: 404 });
    }

    return NextResponse.json({ outfit: updatedOutfit[0] });
  } catch (error) {
    console.error('Error updating outfit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 删除服装
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || (session.user.role !== 'merchant' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    
    const deletedOutfit = await db.delete(outfitRoom)
      .where(eq(outfitRoom.id, params.id))
      .returning();

    if (deletedOutfit.length === 0) {
      return NextResponse.json({ error: 'Outfit not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting outfit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
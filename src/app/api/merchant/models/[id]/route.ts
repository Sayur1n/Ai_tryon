import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/server';
import { getDb } from '@/db';
import { customModel } from '@/db/schema';
import { eq } from 'drizzle-orm';

// 更新模特
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || (session.user.role !== 'merchant' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestBody = await request.json();
    const {
      name,
      style,
      height,
      weight,
      body: bodyType,
      image,
      gender,
      isCustom,
      selected
    } = requestBody;

    // 验证必填字段
    if (!name || !style || !height || !weight || !bodyType || !image || !gender) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();
    
    const updatedModel = await db.update(customModel)
      .set({
        name,
        style,
        height,
        weight,
        body: bodyType,
        image,
        gender,
        selected: selected || 'false',
        isCustom: 'false' // 商户编辑的模特始终为默认模特
      })
      .where(eq(customModel.id, id))
      .returning();

    if (updatedModel.length === 0) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    return NextResponse.json({ model: updatedModel[0] });
  } catch (error) {
    console.error('Error updating model:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 删除模特
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || (session.user.role !== 'merchant' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    
    const deletedModel = await db.delete(customModel)
      .where(eq(customModel.id, id))
      .returning();

    if (deletedModel.length === 0) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting model:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
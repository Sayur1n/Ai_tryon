import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { customModel } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { parseHeight, parseWeight, validateModelData } from '@/lib/model-utils';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestBody = await request.json();
    const { name, style, height, weight, body: bodyType, image, gender } = requestBody;

    // 解析和标准化身高体重
    const parsedHeight = parseHeight(height);
    const parsedWeight = parseWeight(weight);

    // 验证数据完整性
    const validation = validateModelData({
      name,
      style,
      height: parsedHeight,
      weight: parsedWeight,
      body: bodyType,
      image,
      gender
    });

    if (!validation.isValid) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.errors 
      }, { status: 400 });
    }

    const db = await getDb();
    
    // 更新模特，根据用户角色设置isCustom
    const updatedModel = await db.update(customModel)
      .set({
        name: name.trim(),
        style: style.trim(),
        height: parsedHeight,
        weight: parsedWeight,
        body: bodyType.trim(),
        image,
        gender,
        isCustom: session.user.role === 'merchant' || session.user.role === 'admin' ? 'false' : 'true'
      })
      .where(eq(customModel.id, params.id))
      .returning();

    if (updatedModel.length === 0) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, model: updatedModel[0] });
  } catch (error) {
    console.error('Error updating custom model:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    
    // 商家和管理员可以删除任何模特，普通用户只能删除自己的自定义模特
    const deleteCondition = session.user.role === 'merchant' || session.user.role === 'admin'
      ? eq(customModel.id, params.id)
      : and(
          eq(customModel.id, params.id),
          eq(customModel.userId, session.user.id),
          eq(customModel.isCustom, 'true')
        );
    
    const deletedModel = await db.delete(customModel)
      .where(deleteCondition)
      .returning();

    if (deletedModel.length === 0) {
      return NextResponse.json({ error: 'Model not found or not authorized to delete' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting custom model:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
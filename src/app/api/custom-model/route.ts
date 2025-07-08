import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { customModel } from '@/db/schema';
import { auth } from '@/lib/auth';
import { nanoid } from 'nanoid';
import { eq, and } from 'drizzle-orm';
import { parseHeight, parseWeight, validateModelData } from '@/lib/model-utils';

export async function POST(request: NextRequest) {
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
    const newModel = await db.insert(customModel).values({
      id: nanoid(),
      userId: session.user.id,
      name: name.trim(),
      style: style.trim(),
      height: parsedHeight,
      weight: parsedWeight,
      body: bodyType.trim(),
      image,
      gender,
      selected: 'false',
      isCustom: 'true'
    }).returning();

    return NextResponse.json({ success: true, model: newModel[0] });
  } catch (error) {
    console.error('Error creating custom model:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    
    // 获取所有默认模特（isCustom = 'false'）
    const defaultModels = await db.select().from(customModel).where(eq(customModel.isCustom, 'false'));
    
    // 获取当前用户的自定义模特（isCustom = 'true' 且 userId 匹配）
    const userCustomModels = await db.select().from(customModel).where(
      and(
        eq(customModel.isCustom, 'true'),
        eq(customModel.userId, session.user.id)
      )
    );
    
    // 合并所有模特
    const allModels = [...defaultModels, ...userCustomModels];

    return NextResponse.json({ models: allModels });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
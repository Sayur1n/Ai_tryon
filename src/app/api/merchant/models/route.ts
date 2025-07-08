import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/server';
import { getDb } from '@/db';
import { customModel } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// 获取模特列表
export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.user.role !== 'merchant' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    
    // 获取所有默认模特数据
    const models = await db.select().from(customModel).where(
      eq(customModel.isCustom, 'false')
    );

    return NextResponse.json({ models });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 创建新模特
export async function POST(request: NextRequest) {
  try {
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
    
    const newModel = await db.insert(customModel).values({
      id: nanoid(),
      name,
      style,
      height,
      weight,
      body: bodyType,
      image,
      gender,
      selected: selected || 'false',
      isCustom: 'false' // 商户添加的模特始终为默认模特
    }).returning();

    return NextResponse.json({ model: newModel[0] });
  } catch (error) {
    console.error('Error creating model:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
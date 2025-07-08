import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// 验证请求数据的schema
const setRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(['user', 'merchant', 'admin']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = setRoleSchema.parse(body);

    const db = await getDb();

    // 先检查用户是否存在
    const existingUser = await db.select().from(user).where(eq(user.id, validatedData.userId));

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 更新用户角色
    const [updatedUser] = await db.update(user)
      .set({ 
        role: validatedData.role,
        updatedAt: new Date(),
      })
      .where(eq(user.id, validatedData.userId))
      .returning();

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });

  } catch (error) {
    console.error('Set role error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
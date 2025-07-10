import { authClient } from '@/lib/auth-client';
import { getDb } from '@/db/index';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, accountType, callbackURL } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 检查邮箱是否已存在
    const existingUser = await db.select().from(user).where(eq(user.email, email)).limit(1);

    let shouldDeleteExisting = false;

    if (existingUser.length > 0) {
      const userRecord = existingUser[0];
      // 如果用户存在但未验证，允许重新注册
      if (!userRecord.emailVerified) {
        console.log(`User ${email} exists but not verified, allowing re-registration`);
        shouldDeleteExisting = true;
      } else {
        // 如果用户已验证，返回错误
        return NextResponse.json(
          { error: 'Email already registered and verified' },
          { status: 409 }
        );
      }
    }

    // 如果存在未验证的用户，先删除
    if (shouldDeleteExisting && existingUser.length > 0) {
      await db.delete(user).where(eq(user.id, existingUser[0].id));
      console.log(`Deleted unverified user ${email} for re-registration`);
    }

    // 使用 Better Auth 创建新用户
    const result = await authClient.signUp.email({
      email,
      password,
      name,
      callbackURL,
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.status }
      );
    }

    // 设置用户角色（如果需要）
    if (result.data?.user?.id && accountType) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/set-role`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: result.data.user.id,
            role: accountType,
          }),
        });
      } catch (error) {
        console.error('Failed to set user role:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please check your email for verification.',
      user: result.data?.user,
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
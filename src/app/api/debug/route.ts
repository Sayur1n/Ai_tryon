import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';

export async function GET(request: NextRequest) {
  try {
    // 检查环境变量
    const envCheck = {
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? 'SET' : 'NOT_SET',
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ? 'SET' : 'NOT_SET',
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ? 'SET' : 'NOT_SET',
      RESEND_API_KEY: process.env.RESEND_API_KEY ? 'SET' : 'NOT_SET',
      RESEND_AUDIENCE_ID: process.env.RESEND_AUDIENCE_ID ? 'SET' : 'NOT_SET',
    };

    // 检查数据库连接
    let dbStatus = 'UNKNOWN';
    try {
      const db = await getDb();
      // 尝试执行一个简单的查询
      await db.execute('SELECT 1');
      dbStatus = 'CONNECTED';
    } catch (error) {
      dbStatus = `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      envCheck,
      dbStatus,
      headers: Object.fromEntries(request.headers.entries()),
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 
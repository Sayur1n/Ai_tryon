import { NextRequest, NextResponse } from 'next/server';
import OSS from 'ali-oss';

const client = new OSS({
  region: process.env.OSS_REGION!,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
  bucket: process.env.OSS_BUCKET!,
  endpoint: process.env.OSS_ENDPOINT,
  // @ts-expect-error ali-oss v6+ supports V4 signature, but types are not updated yet
  authorizationV4: true,
});

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const type = formData.get('type') as string | null; // 'model' | 'cloth'
  if (!file || !type) {
    return NextResponse.json({ error: 'Missing file or type' }, { status: 400 });
  }
  // 生成唯一文件名
  const ext = file.name.split('.').pop() || 'jpg';
  const key = `${type}/${Date.now()}_${Math.random().toString(36).slice(2,8)}.${ext}`;
  // 读取文件内容
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  try {
    const result = await client.put(key, buffer);
    return NextResponse.json({ url: result.url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 
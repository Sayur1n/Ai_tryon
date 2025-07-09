import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToOSS } from '@/lib/oss-utils';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const type = formData.get('type') as string | null; // 'model' | 'cloth'
  
  if (!file || !type) {
    return NextResponse.json({ error: 'Missing file or type' }, { status: 400 });
  }
  
  try {
    const url = await uploadFileToOSS(file, type);
    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 
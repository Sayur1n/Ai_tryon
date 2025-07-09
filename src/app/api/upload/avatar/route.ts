import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToOSS } from '@/lib/oss-utils';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // 验证用户登录状态
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: '缺少文件' }, { status: 400 });
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: '不支持的文件类型，请上传 JPG、PNG 或 WebP 格式的图片' 
      }, { status: 400 });
    }

    // 验证文件大小 (最大 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: '文件大小不能超过 5MB' 
      }, { status: 400 });
    }

    // 上传到 OSS 的 avatar 文件夹，使用用户 ID 作为子文件夹
    const url = await uploadFileToOSS(file, `avatar/${session.user.id}`);
    
    return NextResponse.json({ 
      url,
      message: '头像上传成功'
    });
    
  } catch (error: any) {
    console.error('头像上传失败:', error);
    return NextResponse.json({ 
      error: error.message || '头像上传失败' 
    }, { status: 500 });
  }
} 
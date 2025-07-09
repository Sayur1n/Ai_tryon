import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/db';
import { outfitResult } from '@/db/schema';
import { nanoid } from 'nanoid';
import { auth } from '@/lib/auth';
import { uploadRemoteImageToOSS } from '@/lib/oss-utils';

const API_KEY = process.env.ALIYUN_DASHSCOPE_API_KEY;
if (!API_KEY) {
  throw new Error('ALIYUN_DASHSCOPE_API_KEY 环境变量未配置');
}

async function pollTask(taskId: string): Promise<string> {
  // 轮询阿里云百炼接口获取结果
  const maxTries = 30;
  for (let i = 0; i < maxTries; i++) {
    await new Promise(r => setTimeout(r, 3000)); // 3秒轮询
    const resp = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });
    const data = await resp.json();
    if (data.output?.task_status === 'SUCCEEDED' && data.output?.image_url) {
      return data.output.image_url;
    }
    if (data.output?.task_status === 'FAILED') {
      throw new Error('AI生成失败');
    }
  }
  throw new Error('AI生成超时');
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }
    const body = await request.json();
    const { personImageUrl, topGarmentUrl, bottomGarmentUrl } = body;
    if (!personImageUrl || (!topGarmentUrl && !bottomGarmentUrl)) {
      return NextResponse.json({ error: '参数缺失' }, { status: 400 });
    }
    // 1. 提交AI异步任务
    const submitResp = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/image2image/image-synthesis', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify({
        model: 'aitryon-plus',
        input: {
          person_image_url: personImageUrl,
          ...(topGarmentUrl ? { top_garment_url: topGarmentUrl } : {}),
          ...(bottomGarmentUrl ? { bottom_garment_url: bottomGarmentUrl } : {}),
        },
        parameters: {
          resolution: -1,
          restore_face: true,
        },
      }),
    });
    const submitData = await submitResp.json();
    const taskId = submitData.output?.task_id;
    if (!taskId) {
      return NextResponse.json({ error: 'AI任务提交失败', detail: submitData }, { status: 500 });
    }
    // 2. 轮询获取结果
    let resultImageUrl = '';
    try {
      resultImageUrl = await pollTask(taskId);
    } catch (e: any) {
      // 保存失败记录
      const db = await getDb();
      await db.insert(outfitResult).values({
        id: nanoid(),
        userId: session.user.id,
        personImageUrl,
        topGarmentUrl,
        bottomGarmentUrl,
        resultImageUrl: '',
        taskId,
        status: 'FAILED',
      });
      return NextResponse.json({ error: e.message || 'AI生成失败' }, { status: 500 });
    }
    // 3. 上传结果图片到OSS
    const ossKey = `ai-tryon/results/${Date.now()}_${nanoid(6)}.jpg`;
    const ossUrl = await uploadRemoteImageToOSS(resultImageUrl, ossKey);
    // 4. 保存到数据库
    const db = await getDb();
    await db.insert(outfitResult).values({
      id: nanoid(),
      userId: session.user.id,
      personImageUrl,
      topGarmentUrl,
      bottomGarmentUrl,
      resultImageUrl: ossUrl,
      taskId,
      status: 'SUCCEEDED',
    });
    // 5. 返回结果
    return NextResponse.json({ success: true, imageUrl: ossUrl });
  } catch (error: any) {
    console.error('AI试衣API错误:', error);
    return NextResponse.json({ error: error.message || '服务器错误' }, { status: 500 });
  }
} 
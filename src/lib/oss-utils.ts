import OSS from 'ali-oss';

// OSS 客户端配置
const createOSSClient = () => {
  return new OSS({
    region: process.env.OSS_REGION!,
    accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
    bucket: process.env.OSS_BUCKET!,
    endpoint: process.env.OSS_ENDPOINT,
    // @ts-expect-error ali-oss v6+ supports V4 signature, but types are not updated yet
    authorizationV4: true,
  });
};

/**
 * 上传文件到阿里云 OSS，确保返回 HTTPS 地址
 * @param file - 要上传的文件
 * @param type - 文件类型，用于生成路径
 * @returns Promise<string> - HTTPS 格式的文件 URL
 */
export async function uploadFileToOSS(file: File, type: string): Promise<string> {
  const client = createOSSClient();
  
  // 生成唯一文件名
  const ext = file.name.split('.').pop() || 'jpg';
  const key = `${type}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  
  // 读取文件内容
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  try {
    const result = await client.put(key, buffer);
    
    // 确保返回 HTTPS 协议地址
    let url = result.url;
    if (url.startsWith('http://')) {
      url = url.replace('http://', 'https://');
    }
    
    // 如果 OSS 返回的 URL 不是 HTTPS，手动构建 HTTPS URL
    if (!url.startsWith('https://')) {
      const bucket = process.env.OSS_BUCKET!;
      const region = process.env.OSS_REGION!;
      url = `https://${bucket}.${region}.aliyuncs.com/${key}`;
    }
    
    return url;
  } catch (error) {
    console.error('OSS 上传失败:', error);
    throw new Error('文件上传失败');
  }
}

/**
 * 上传远程图片到阿里云 OSS，确保返回 HTTPS 地址
 * @param imageUrl - 远程图片 URL
 * @param key - OSS 存储路径
 * @returns Promise<string> - HTTPS 格式的文件 URL
 */
export async function uploadRemoteImageToOSS(imageUrl: string, key: string): Promise<string> {
  const client = createOSSClient();
  
  try {
    // 下载远程图片
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('下载图片失败');
    }
    
    const buffer = Buffer.from(await response.arrayBuffer());
    const result = await client.put(key, buffer);
    
    // 确保返回 HTTPS 协议地址
    let url = result.url;
    if (url.startsWith('http://')) {
      url = url.replace('http://', 'https://');
    }
    
    // 如果 OSS 返回的 URL 不是 HTTPS，手动构建 HTTPS URL
    if (!url.startsWith('https://')) {
      const bucket = process.env.OSS_BUCKET!;
      const region = process.env.OSS_REGION!;
      url = `https://${bucket}.${region}.aliyuncs.com/${key}`;
    }
    
    return url;
  } catch (error) {
    console.error('远程图片上传到 OSS 失败:', error);
    throw new Error('图片上传失败');
  }
}

/**
 * 确保 URL 使用 HTTPS 协议
 * @param url - 原始 URL
 * @returns string - HTTPS 格式的 URL
 */
export function ensureHTTPS(url: string): string {
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
} 
/**
 * 头像上传工具函数
 * 使用独立的 API 路由，上传到 OSS 的 avatar 文件夹
 */

/**
 * 上传头像到阿里云 OSS
 * @param file - 要上传的头像文件
 * @returns Promise<string> - HTTPS 格式的头像 URL
 */
export async function uploadAvatarToOSS(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload/avatar', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '头像上传失败');
  }
  
  const data = await response.json();
  return data.url;
}

/**
 * 验证头像文件
 * @param file - 要验证的文件
 * @returns { isValid: boolean; error?: string } - 验证结果
 */
export function validateAvatarFile(file: File): { isValid: boolean; error?: string } {
  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: '不支持的文件类型，请上传 JPG、PNG 或 WebP 格式的图片'
    };
  }
  
  // 验证文件大小 (最大 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: '文件大小不能超过 5MB'
    };
  }
  
  return { isValid: true };
} 
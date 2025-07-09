import { uploadFileToOSS, uploadRemoteImageToOSS } from '../src/lib/oss-utils';

async function testOSSUpload() {
  console.log('测试 OSS 上传 HTTPS 配置...');
  
  try {
    // 测试远程图片上传
    const testImageUrl = 'https://via.placeholder.com/100x100.png';
    const testKey = `test/${Date.now()}_test.jpg`;
    
    console.log('测试远程图片上传...');
    const remoteUrl = await uploadRemoteImageToOSS(testImageUrl, testKey);
    console.log('远程图片上传结果:', remoteUrl);
    
    if (!remoteUrl.startsWith('https://')) {
      console.error('❌ 远程图片上传未返回 HTTPS 地址');
      return false;
    }
    
    console.log('✅ 远程图片上传返回 HTTPS 地址');
    return true;
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    return false;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testOSSUpload()
    .then(success => {
      if (success) {
        console.log('✅ 所有测试通过');
        process.exit(0);
      } else {
        console.log('❌ 测试失败');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ 测试出错:', error);
      process.exit(1);
    });
}

export { testOSSUpload }; 
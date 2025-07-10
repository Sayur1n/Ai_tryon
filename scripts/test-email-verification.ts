#!/usr/bin/env tsx

import { sendEmail } from '@/mail';

/**
 * 测试邮箱验证功能
 */
async function testEmailVerification() {
  console.log('开始测试邮箱验证功能...');

  try {
    // 测试发送验证邮件
    const result = await sendEmail({
      to: 'test@example.com',
      template: 'verifyEmail',
      context: {
        name: '测试用户',
        url: 'https://example.com/verify?token=test123',
      },
      locale: 'zh',
    });

    if (result) {
      console.log('✅ 邮箱验证邮件发送成功');
    } else {
      console.log('❌ 邮箱验证邮件发送失败');
    }

    // 测试发送密码重置邮件
    const resetResult = await sendEmail({
      to: 'test@example.com',
      template: 'forgotPassword',
      context: {
        name: '测试用户',
        url: 'https://example.com/reset?token=test456',
      },
      locale: 'zh',
    });

    if (resetResult) {
      console.log('✅ 密码重置邮件发送成功');
    } else {
      console.log('❌ 密码重置邮件发送失败');
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
testEmailVerification().catch(console.error); 
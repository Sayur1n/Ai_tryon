#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';

// 加载 .env 文件
config({ path: resolve(process.cwd(), '.env') });

/**
 * 测试邮箱验证功能
 */
async function testEmailVerification() {
  console.log('开始测试邮箱验证功能...');
  
  // 检查环境变量
  console.log('环境变量检查:');
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '已设置' : '未设置');
  console.log('RESEND_AUDIENCE_ID:', process.env.RESEND_AUDIENCE_ID ? '已设置' : '未设置');
  console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL || '未设置');
  
  if (!process.env.RESEND_API_KEY) {
    console.log('❌ RESEND_API_KEY 未设置，请检查 .env 文件');
    console.log('请在 .env 文件中添加:');
    console.log('RESEND_API_KEY=re_xxxxxxxxxxxx');
    return;
  }

  try {
    // 设置 React 环境
    global.React = require('react');
    
    // 动态导入邮件模块
    const { sendEmail } = await import('../src/mail');
    
    console.log('✅ 邮件模块加载成功');
    
    // 测试发送验证邮件
    console.log('📧 测试发送验证邮件...');
    const result = await sendEmail({
      to: 'test@resend.dev', // 使用 Resend 的测试域名
      template: 'verifyEmail',
      context: {
        name: '测试用户',
        url: 'https://mksaas.com/verify?token=test123',
      },
      locale: 'zh',
    });

    if (result) {
      console.log('✅ 邮箱验证邮件发送成功');
    } else {
      console.log('❌ 邮箱验证邮件发送失败');
    }

    // 测试发送密码重置邮件
    console.log('📧 测试发送密码重置邮件...');
    const resetResult = await sendEmail({
      to: 'test@resend.dev', // 使用 Resend 的测试域名
      template: 'forgotPassword',
      context: {
        name: '测试用户',
        url: 'https://mksaas.com/reset?token=test456',
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
    
    // 提供详细的错误信息
    if (error instanceof Error) {
      console.log('错误类型:', error.constructor.name);
      console.log('错误消息:', error.message);
      
      if (error.message.includes('domain is not verified')) {
        console.log('\n💡 解决方案:');
        console.log('1. 访问 https://resend.com/domains');
        console.log('2. 添加并验证您的域名');
        console.log('3. 等待域名验证完成');
      }
      
      if (error.message.includes('Invalid `to` field')) {
        console.log('\n💡 解决方案:');
        console.log('1. 使用有效的邮箱地址进行测试');
        console.log('2. 或者使用 Resend 的测试域名: test@resend.dev');
        console.log('3. 确保域名已在 Resend 中验证');
      }
      
      if (error.message.includes('RESEND_API_KEY')) {
        console.log('\n💡 解决方案:');
        console.log('1. 检查 .env 文件是否存在');
        console.log('2. 确保 RESEND_API_KEY 已正确设置');
        console.log('3. 重启开发服务器');
      }
    }
  }
}

// 显示环境文件信息
function showEnvInfo() {
  const fs = require('fs');
  const path = require('path');
  
  const envPath = path.resolve(process.cwd(), '.env');
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  
  console.log('环境文件检查:');
  console.log('.env 文件:', fs.existsSync(envPath) ? '存在' : '不存在');
  console.log('.env.local 文件:', fs.existsSync(envLocalPath) ? '存在' : '不存在');
  
  if (fs.existsSync(envPath)) {
    console.log('📄 .env 文件内容预览:');
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n').slice(0, 10); // 只显示前10行
    lines.forEach((line: string) => {
      if (line.trim() && !line.startsWith('#')) {
        const [key] = line.split('=');
        console.log(`  ${key}=***`);
      }
    });
  }
}

// 运行测试
console.log('🚀 邮箱验证功能测试脚本');
console.log('=' .repeat(50));

showEnvInfo();
console.log('');

testEmailVerification().catch(console.error); 
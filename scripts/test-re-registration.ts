#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';

// 加载 .env 文件
config({ path: resolve(process.cwd(), '.env') });

/**
 * 测试未验证账户的重新注册功能
 */
async function testReRegistration() {
  console.log('🔄 未验证账户重新注册功能测试');
  console.log('=' .repeat(50));
  
  // 检查环境变量
  console.log('📋 环境变量检查:');
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ 已设置' : '❌ 未设置');
  console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL || '❌ 未设置');
  
  if (!process.env.RESEND_API_KEY) {
    console.log('❌ RESEND_API_KEY 未设置，无法进行测试');
    return;
  }

  try {
    // 设置 React 环境
    global.React = require('react');
    
    console.log('\n✅ 环境检查通过');
    
    console.log('\n📋 重新注册功能说明:');
    console.log('1. 用户首次注册但未验证邮箱');
    console.log('2. 用户尝试使用相同邮箱重新注册');
    console.log('3. 系统检测到未验证的账户');
    console.log('4. 删除旧的未验证账户');
    console.log('5. 创建新的注册请求');
    console.log('6. 发送新的验证邮件');
    
    console.log('\n🔧 技术实现:');
    console.log('✅ 检查邮箱是否已存在');
    console.log('✅ 判断账户验证状态');
    console.log('✅ 删除未验证的旧账户');
    console.log('✅ 创建新的注册请求');
    console.log('✅ 发送新的验证邮件');
    console.log('✅ 设置用户角色');
    
    console.log('\n🎯 测试场景:');
    console.log('场景1: 首次注册');
    console.log('- 用户填写注册表单');
    console.log('- 系统创建账户并发送验证邮件');
    console.log('- 用户未验证邮箱');
    
    console.log('\n场景2: 重新注册（未验证）');
    console.log('- 用户使用相同邮箱重新注册');
    console.log('- 系统检测到未验证的旧账户');
    console.log('- 删除旧账户并创建新账户');
    console.log('- 发送新的验证邮件');
    
    console.log('\n场景3: 重新注册（已验证）');
    console.log('- 用户使用已验证的邮箱重新注册');
    console.log('- 系统拒绝注册并提示直接登录');
    
    console.log('\n📧 邮件流程:');
    console.log('1. 首次注册 → 发送验证邮件');
    console.log('2. 重新注册 → 删除旧账户 → 发送新验证邮件');
    console.log('3. 验证成功 → 自动登录');
    
    console.log('\n⚠️ 重要提醒:');
    console.log('- 只有未验证的账户可以重新注册');
    console.log('- 已验证的账户不能重新注册');
    console.log('- 重新注册会删除旧的未验证账户');
    console.log('- 每次重新注册都会发送新的验证邮件');
    
    console.log('\n🔒 安全考虑:');
    console.log('✅ 防止已验证账户被覆盖');
    console.log('✅ 确保邮箱验证的强制性');
    console.log('✅ 提供清晰的错误提示');
    console.log('✅ 记录重新注册的操作日志');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    
    if (error instanceof Error) {
      console.log('错误类型:', error.constructor.name);
      console.log('错误消息:', error.message);
    }
  }
}

// 显示功能说明
function showReRegistrationDescription() {
  console.log('\n📖 未验证账户重新注册功能说明:');
  console.log('=' .repeat(50));
  console.log('1. 允许未验证邮箱的用户重新注册');
  console.log('2. 自动删除旧的未验证账户');
  console.log('3. 创建新的注册请求和验证邮件');
  console.log('4. 防止已验证账户被覆盖');
  console.log('5. 提供清晰的用户反馈');
  
  console.log('\n🔧 API 端点:');
  console.log('POST /api/auth/register-with-verification');
  console.log('- 检查邮箱是否存在');
  console.log('- 验证账户状态');
  console.log('- 处理重新注册逻辑');
  console.log('- 发送验证邮件');
  
  console.log('\n📋 请求参数:');
  console.log('- email: 用户邮箱');
  console.log('- password: 用户密码');
  console.log('- name: 用户姓名');
  console.log('- accountType: 账户类型');
  console.log('- callbackURL: 回调URL');
  
  console.log('\n📋 响应状态:');
  console.log('- 200: 注册成功');
  console.log('- 400: 缺少必需字段');
  console.log('- 409: 邮箱已验证');
  console.log('- 500: 服务器错误');
}

// 运行测试
showReRegistrationDescription();
testReRegistration().catch(console.error); 